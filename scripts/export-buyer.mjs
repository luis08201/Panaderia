// Creates a separate source package. The hosted preview and its photographs stay intact.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'release', `crumb-and-oven-html-${new Date().toISOString().replace(/[:.]/g,'-')}`);
if (!output.startsWith(join(root,'release') + '\\') && !output.startsWith(join(root,'release') + '/')) throw Error('Export must remain in release/.');
mkdirSync(output,{recursive:true});
const sources = [...readdirSync(root).filter((file)=>file.endsWith('.html')), 'assets','content','css','js','scripts','tests','docs','package.json','README.md','CHANGELOG.md','THIRD-PARTY.md','DISTRIBUTION.md','favicon.svg','.pages.yml','.nvmrc','wrangler.jsonc','.gitignore'];
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
writeFileSync(join(output,'START-HERE.txt'),'Open start-here.html for setup instructions.\nRun npm run dev for local preview.\nDemo photographs are excluded. Replace assets/placeholder.svg with your own licensed photos through the CMS.\nRead DISTRIBUTION.md before offering this pre-release package for sale.\n');
console.log(`Buyer candidate (source and dist, demo photographs excluded): ${output}`);
