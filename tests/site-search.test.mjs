import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { searchSite } from '../js/utils/site-search.js';
import { buildSearchIndex } from '../scripts/search-index.mjs';

const documents = [
  { title:'Our story',type:'Page',description:'',text:'Our sourdough traditions',url:'nosotros.html' },
  { title:'Sourdough',type:'Product',description:'Slow bread',text:'Wheat flour, water and salt',url:'productos/sourdough/' },
  { title:'Café and bread',type:'Article',description:'Pairings',text:'Coffee and whole grain toast',url:'blog/coffee/' },
];
test('global search matches across content types, ignores case and accents and ranks titles first',()=>{
  assert.deepEqual(searchSite(documents,'SOURDOUGH').map(d=>d.type),['Product','Page']);
  assert.equal(searchSite(documents,' cafe ')[0].type,'Article');
});
test('global search requires all words, finds body content and handles empty or unmatched queries',()=>{
  assert.equal(searchSite(documents,'water salt')[0].type,'Product');
  assert.equal(searchSite(documents,'coffee salt').length,0);
  assert.equal(searchSite(documents,'   ').length,0);
  assert.equal(searchSite(documents,'<script>alert(1)</script>').length,0);
});
test('search index includes published CMS bodies and public pages with unique usable destinations',()=>{
  const root=mkdtempSync(join(tmpdir(),'bakery-search-test-'));
  try {
    mkdirSync(join(root,'public-data'));
    const write=(name,data)=>writeFileSync(join(root,'public-data',name+'.json'),JSON.stringify(data));
    write('site',{pages:{home:{story:{text:'A family tradition'}}},settings:{address:'Public bakery address',whatsappMessage:'private-config-marker'}});
    write('products',[{name:'Loaf',slug:'loaf',category:{name:'Bread'},ingredients:['Rye'],allergens:['Gluten'],description:'Slow fermented',shortDescription:'Fresh bread'}]);
    write('categories',[{name:'Bread',slug:'bread',productCount:1},{name:'Empty',slug:'empty',productCount:0}]);
    write('blog',{posts:[{title:'A story',slug:'story',category:{name:'Craft'},excerpt:'From the oven',introduction:'A patient baker',sections:[{heading:'Crust',text:'Let the loaf cool fully'}]}]});
    write('promotions',[{title:'Weekend special',description:'Coffee and cake',startDate:'2000-01-01',endDate:'2999-01-01'},{title:'expired-promotion-marker',endDate:'2000-01-01'}]);
    for(const page of ['index','catalogo','blog','nosotros','contacto','styleguide']) writeFileSync(join(root,page+'.html'),'<main><h1>Public content</h1><script>secretScriptMarker</script></main>');
    const index=buildSearchIndex(root);
    assert.equal(index.length,9);
    assert.equal(new Set(index.map(d=>d.url)).size,index.length);
    assert.equal(searchSite(index,'rye')[0].type,'Product');
    assert.equal(searchSite(index,'cool fully')[0].type,'Article');
    assert.equal(searchSite(index,'family tradition')[0].title,'Home');
    assert.equal(searchSite(index,'weekend special')[0].title,'Home');
    assert.equal(searchSite(index,'expired-promotion-marker').length,0);
    assert.equal(searchSite(index,'private-config-marker').length,0);
    assert.equal(searchSite(index,'secretScriptMarker').length,0);
    assert.equal(index.some(d=>d.url.includes('empty')),false);
  } finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir())+'\\') || resolve(root).startsWith(resolve(tmpdir())+'/'));
    rmSync(root,{recursive:true,force:true});
  }
});
