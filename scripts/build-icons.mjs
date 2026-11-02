// Reproducible icon provenance: pinned Lucide source + a newly authored SVG mark.
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname, join} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const commit='4b203ec9b6002fd74fd5dadc8612220e64289305';
const mapping={wheat:'wheat',whatsapp:'message-circle',menu:'menu',close:'x',search:'search',clock:'clock',pin:'map-pin',phone:'phone',info:'info',share:'share'};
const hash=text=>createHash('sha256').update(text).digest('hex');

// Drawn directly here from basic SVG shapes on 2 November 2026.
// The oven body, chimney, arched door and loaf have no imported vector source.
const mark=`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="10" y="18" width="44" height="36" rx="6" />
  <path d="M19 18V9h9v9M14 58h36M17 54v4m30-4v4" />
  <path d="M19 46V35a13 13 0 0 1 26 0v11Z" />
  <path d="M24 43v-2a8 6 0 0 1 16 0v2Z" fill="currentColor" stroke="none" />
  <path d="m28 37 2 3m4-3 2 3" stroke="var(--color-background, #fff9f0)" stroke-width="1.8" />
  <path d="M37 11h3m5 0h3" />
</g>`;
const icons=[];
const symbols=[`  <symbol id="oven" viewBox="0 0 64 64">${mark}</symbol>`];
for(const [id,name] of Object.entries(mapping)){
  const path=`assets/icons/lucide/${name}.svg`, raw=readFileSync(join(root,path),'utf8');
  const match=raw.match(/<svg\b[\s\S]*?viewBox="([^"]+)"[\s\S]*?>([\s\S]*?)<\/svg>/);
  if(!match)throw Error(`Unrecognized SVG: ${path}`);
  symbols.push(`  <symbol id="${id}" viewBox="${match[1]}"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${match[2].trim()}</g></symbol>`);
  icons.push({symbol:id,upstreamIcon:name,source:`https://raw.githubusercontent.com/lucide-icons/lucide/${commit}/icons/${name}.svg`,localFile:path,sha256:hash(raw),licenseFile:'assets/icons/lucide/LICENSE'});
}
const sprite=`<svg xmlns="http://www.w3.org/2000/svg">\n<!-- Interface icons: Lucide, pinned ${commit}. Preserve assets/icons/lucide/LICENSE (ISC and Feather MIT notices). Oven mark: custom SVG authored in scripts/build-icons.mjs. -->\n${symbols.join('\n')}\n</svg>\n`;
const favicon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" color="#a85d3b"><title>Crumb &amp; Oven — oven and loaf</title>${mark.replace('var(--color-background, #fff9f0)','#fff9f0')}</svg>\n`;
writeFileSync(join(root,'assets/icons/icons.svg'),sprite);
writeFileSync(join(root,'favicon.svg'),favicon);
writeFileSync(join(root,'assets/brand/oven-mark.svg'),favicon);
const wordmark=`<svg xmlns="http://www.w3.org/2000/svg" width="390" height="104" viewBox="0 0 390 104"><title>Crumb &amp; Oven — Artisan Bakery</title><g transform="translate(14 19)" color="#a85d3b">${mark.replace('var(--color-background, #fff9f0)','#fff9f0')}</g><text x="94" y="53" fill="#2f241d" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="700" letter-spacing="-1">Crumb &amp; Oven</text><text x="96" y="75" fill="#6a5546" font-family="Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="3.5">ARTISAN BAKERY</text></svg>\n`;
writeFileSync(join(root,'assets/brand/logo-alternative.svg'),wordmark);
const license=readFileSync(join(root,'assets/icons/lucide/LICENSE'),'utf8');
writeFileSync(join(root,'assets/icons/PROVENANCE.json'),JSON.stringify({reviewedOn:'2026-11-02',upstream:'https://github.com/lucide-icons/lucide',commit,license:{path:'assets/icons/lucide/LICENSE',sha256:hash(license)},icons,customMark:{symbol:'oven',source:'scripts/build-icons.mjs',method:'New SVG code authored from basic shapes during the 2 November 2026 review; no third-party vector source imported.',files:[{path:'favicon.svg',sha256:hash(favicon)},{path:'assets/brand/oven-mark.svg',sha256:hash(favicon)},{path:'assets/brand/logo-alternative.svg',sha256:hash(wordmark)}]},notes:['The legacy whatsapp symbol now contains a generic message-circle icon, not the WhatsApp brand logo.','This manifest records source and redistribution notices; it is not trademark clearance or a certification of exclusive copyright.'],generated:{spriteSha256:hash(sprite),faviconSha256:hash(favicon)}},null,2)+'\n');
console.log(`Built ${icons.length} Lucide symbols and one custom oven mark; provenance and license notices included.`);
