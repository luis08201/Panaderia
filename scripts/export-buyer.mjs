// Creates a separate source package. The hosted preview and its photographs stay intact.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'release', `crumb-and-oven-html-${new Date().toISOString().replace(/[:.]/g,'-')}`);
if (!output.startsWith(join(root,'release') + '\\') && !output.startsWith(join(root,'release') + '/')) throw Error('Export must remain in release/.');
mkdirSync(output,{recursive:true});
const sources = [...readdirSync(root).filter((file)=>file.endsWith('.html')), 'assets','content','css','js','scripts','tests','docs','package.json','README.md','CHANGELOG.md','COMMERCIAL-LICENSE.md','THIRD-PARTY.md','DISTRIBUTION.md','favicon.svg','.pages.yml','.nvmrc','wrangler.jsonc','.gitignore','.gitattributes'];
for (const source of sources) {
  const path=join(root,source);
  if (!existsSync(path)) continue;
  cpSync(path,join(output,source),{recursive:true,filter:(file)=>{
    const path=relative(root,file).replaceAll('\\','/');
    return !path.startsWith('assets/images') && !path.startsWith('docs/evidence');
  }});
}
const rewrite = (folder) => {
  for(const item of readdirSync(folder,{withFileTypes:true})) {
    const path=join(folder,item.name);
    if(item.isDirectory()) rewrite(path);
    else if(/\.(html|json|css|js|mjs|yml)$/.test(item.name)) {
      // Documentation records the original demo files; do not turn every recorded path into a placeholder.
      if(path===join(output,'docs','AI-IMAGE-PROVENANCE.json')) continue;
      let text=readFileSync(path,'utf8').replace(/assets\/images\/[\w./-]+\.(?:webp|png|jpe?g)/gi,'assets/placeholder.svg');
      if(path===join(output,'content/settings.json')) {
        const settings=JSON.parse(text);settings.seo.siteUrl='';settings.demoNotice=true;text=JSON.stringify(settings,null,2)+'\n';
      }
      writeFileSync(path,text);
    }
  }
};
rewrite(output);
for (const folder of ['products','categories','general','blog']) {
  const directory=join(output,'assets/images',folder);
  mkdirSync(directory,{recursive:true});
  cpSync(join(output,'assets/placeholder.svg'),join(directory,'placeholder.svg'));
}
execFileSync(process.execPath,[join(output,'scripts/build-content.mjs')],{cwd:output,stdio:'inherit'});
execFileSync(process.execPath,[join(output,'scripts/build-site.mjs')],{cwd:output,stdio:'inherit'});
writeFileSync(join(output,'START-HERE.txt'),[
  'CRUMB & OVEN HTML / FOLKLORCRAFT',
  '',
  '1. Extract the full ZIP and open the folder containing package.json.',
  '2. Install Node.js 22+ from https://nodejs.org/ and open a terminal in that folder.',
  '3. Run npm run dev (Windows: use npm.cmd run dev if PowerShell blocks npm.ps1). No npm install is needed.',
  '4. Open http://127.0.0.1:47823/start-here.html. Keep the terminal open; Ctrl+C stops it.',
  'Do not double-click index.html: the website needs an HTTP server to load its data.',
  '',
  'ES: Extrae el ZIP, abre la carpeta con package.json, instala Node.js 22+ y ejecuta npm run dev en una terminal.',
  'Abre http://127.0.0.1:47823/start-here.html. No necesitas npm install. Ctrl+C detiene el servidor.',
  '',
  'Read docs/BUYER-GUIDE.en.md or docs/BUYER-GUIDE.md, COMMERCIAL-LICENSE.md and docs/SUPPORT.md.',
  'Support / Soporte: luismgnictech@gmail.com — email only / solo correo.',
  'Demo photographs and Figma are excluded. Replace neutral media with your own licensed photographs.',
  'One-project license; six months of email support. Read the complete license and support policy.',
  'Seller release checklist: DISTRIBUTION.md. Legal seller and sales-channel information must be completed before accepting payment.',
  ''
].join('\n'));
console.log(`Buyer candidate (source and dist, demo photographs excluded): ${output}`);
