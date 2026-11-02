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
  const pages = [['index.html','Home',{...site.pages.home,promotions:read('promotions').filter((promotion)=>isCurrent(promotion))}],['catalogo.html','Catalog',null],['blog.html','Blog',null],['nosotros.html','About',site.pages.nosotros],['contacto.html','Contact',{ address:site.settings.address, phone:site.settings.phone, hours:site.settings.hours }],['styleguide.html','Style guide',null]];
  const documents = pages.map(([url,title,content]) => {
    const html = readFileSync(join(root,url),'utf8');
    const text = plain(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '');
    const description = plain(html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || text.slice(0,180));
    return { title, url, type:'Page', description, text:`${text} ${prose(content)}` };
  });
  documents.push(...products.map((p) => ({ title:p.name, url:`productos/${p.slug}/`, type:'Product', description:p.shortDescription, text:[p.description,p.category.name,...p.ingredients,...p.allergens].join(' ') })));
  documents.push(...blog.posts.map((p) => ({ title:p.title,url:`blog/${p.slug}/`,type:'Article',description:p.excerpt,text:[p.category.name,p.introduction,...p.sections.map((s)=>`${s.heading} ${s.text}`)].join(' ') })));
  documents.push(...categories.filter((c)=>c.productCount>0).map((c)=>({title:c.name,url:`catalogo.html?categoria=${encodeURIComponent(c.slug)}`,type:'Category',description:c.description || `Explore ${c.name.toLowerCase()} from our bakery.`,text:c.name})));
  documents.push(...(blog.categories || []).map((c)=>({title:c.name,url:`blog.html?category=${encodeURIComponent(c.slug)}#blog-latest-title`,type:'Category',description:c.description,text:c.name})));
  writeFileSync(join(root,'public-data/search.json'),JSON.stringify(documents)+'\n');
  return documents;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Indexed ${buildSearchIndex(process.argv[2]).length} public search destinations.`);
