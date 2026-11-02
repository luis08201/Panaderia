import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('distributed icon sources and license notices match the recorded provenance',()=>{
  const manifest=JSON.parse(read('assets/icons/PROVENANCE.json'));
  assert.equal(sha(read(manifest.license.path)),manifest.license.sha256);
  const license=read(manifest.license.path).toString();
  assert.ok(license.includes('ISC License'));
  assert.ok(license.includes('Cole Bemis'));
  for(const icon of manifest.icons){
    assert.equal(sha(read(icon.localFile)),icon.sha256,icon.symbol);
    assert.ok(icon.source.startsWith(`https://raw.githubusercontent.com/lucide-icons/lucide/${manifest.commit}/icons/`));
  }
  const sprite=read('assets/icons/icons.svg');
  assert.equal(sha(sprite),manifest.generated.spriteSha256);
  assert.equal(sha(read('favicon.svg')),manifest.generated.faviconSha256);
  for(const file of manifest.customMark.files)assert.equal(sha(read(file.path)),file.sha256,file.path);
  const actual=[...sprite.toString().matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]).sort();
  assert.deepEqual(actual,[manifest.customMark.symbol,...manifest.icons.map(i=>i.symbol)].sort());
  assert.equal(manifest.icons.find(i=>i.symbol==='whatsapp').upstreamIcon,'message-circle');
});
