import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EN, ES } from '../js/i18n.js';
import { SEARCH_TYPES, searchTypeKey } from '../js/utils/site-search.js';
import { whatsappUrl } from '../js/modules/whatsapp.js';

test('every search content type has translated singular and plural labels',()=>{
  for(const type of SEARCH_TYPES) for(const plural of [false,true]) for(const language of [EN,ES]) {
    const key=searchTypeKey(type,plural);
    assert.ok(language[key],`${key} has no translation`);
  }
  assert.equal(ES[searchTypeKey('Category',true)],'Categorías');
});
test('product hierarchy excludes Blog while the product footer keeps the shared Blog link',()=>{
  const html=readFileSync(new URL('../producto.html',import.meta.url),'utf8');
  const breadcrumb=html.match(/<nav class="breadcrumb[\s\S]*?<\/nav>/)[0];
  assert.ok(breadcrumb.includes('catalogo.html'));
  assert.ok(!breadcrumb.includes('blog.html'));
  assert.ok(html.slice(html.indexOf('<footer')).includes('href="blog.html"'));
});
test('sample WhatsApp number stays local and real numbers keep their encoded message',()=>{
  assert.equal(whatsappUrl('+505 0000 0000','Sample'),'contacto.html?demo=contact');
  assert.equal(whatsappUrl('','Sample'),'');
  assert.equal(whatsappUrl('15551234567','Bread & coffee'),'https://wa.me/15551234567?text=Bread%20%26%20coffee');
});
