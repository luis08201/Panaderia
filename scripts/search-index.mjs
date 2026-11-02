import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { isCurrent } from '../js/utils/dates.js';

// Explicit content fields keep filenames, image metadata, drafts and private CMS settings out of search.
const prose = (value) => typeof value === 'string' ? value : Array.isArray(value) ? value.map(prose).join(' ') : value && typeof value === 'object' ? Object.entries(value).filter(([key]) => !/image|url|link|label|alt|id|slug|date|order/i.test(key)).map(([, item]) => prose(item)).join(' ') : '';
const plain = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&nbsp;':' '})[entity]).replace(/\s+/g, ' ').trim();
export function buildSearchIndex(root) {
  const read = (name) => JSON.parse(readFileSync(join(root, 'public-data', `${name}.json`), 'utf8'));
  const site = read('site'), blog = read('blog'), products = read('products'), categories = read('categories');
  const pageEs = { Home: 'Inicio', Catalog: 'Catálogo', Blog: 'Blog', About: 'Nosotros', Contact: 'Contacto', 'Style guide': 'Guía de estilo', 'Template overview': 'Sobre el template', 'Setup guide': 'Guía de inicio' };
  const pages = [['index.html','Home',{...site.pages.home,es:site.pages.es?.home,promotions:read('promotions').filter((promotion)=>isCurrent(promotion))}],['catalogo.html','Catalog',null],['blog.html','Blog',null],['nosotros.html','About',{...site.pages.nosotros,es:site.pages.es?.nosotros}],['contacto.html','Contact',{ address:site.settings.address, phone:site.settings.phone, hours:site.settings.hours,es:{address:site.settings.es?.address,phone:site.settings.es?.phone,hours:site.settings.es?.hours} }],['styleguide.html','Style guide',null],['template.html','Template overview',null],['start-here.html','Setup guide',null]];
  const documents = pages.map(([url,title,content]) => {
    const html = readFileSync(join(root,url),'utf8');
    const text = plain(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '');
    const description = plain(html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || text.slice(0,180));
    const descriptionEs = content?.es?.hero?.text || (title === 'Contact' ? 'Consulta disponibilidad, horarios y ubicación de la panadería.' : '');
    return { title, titleEs: pageEs[title], url, type:'Page', description, descriptionEs, text:`${text} ${prose(content)} ${prose(content?.es)}` };
  });
  documents.push(...products.map((p) => ({ title:p.name, titleEs:p.es?.name, url:`productos/${p.slug}/`, type:'Product', description:p.shortDescription, descriptionEs:p.es?.shortDescription, text:[p.description,p.category.name,...p.ingredients,...p.allergens,prose(p.es)].join(' ') })));
  documents.push(...blog.posts.map((p) => ({ title:p.title, titleEs:p.es?.title, url:`blog/${p.slug}/`, type:'Article', description:p.excerpt, descriptionEs:p.es?.excerpt, text:[p.category.name,p.introduction,...p.sections.map((s)=>`${s.heading} ${s.text}`),prose(p.es)].join(' ') })));
  documents.push(...categories.filter((c)=>c.productCount>0).map((c)=>({title:c.name,titleEs:c.es?.name,url:`catalogo.html?categoria=${encodeURIComponent(c.slug)}`,type:'Category',description:c.description || `Explore ${c.name.toLowerCase()} from our bakery.`,descriptionEs:c.es?.description,text:`${c.name} ${c.es?.name || ''}`})));
  documents.push(...(blog.categories || []).map((c)=>({title:c.name,titleEs:c.es?.name,url:`blog.html?category=${encodeURIComponent(c.slug)}#blog-latest-title`,type:'Category',description:c.description,descriptionEs:c.es?.description,text:`${c.name} ${c.es?.name || ''}`})));
  writeFileSync(join(root,'public-data/search.json'),JSON.stringify(documents)+'\n');
  return documents;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Indexed ${buildSearchIndex(process.argv[2]).length} public search destinations.`);
