import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));

test('demo raster imagery is completely covered by the AI provenance manifest or excluded in a buyer export',()=>{
 const manifest=JSON.parse(readFileSync(join(root,'docs/AI-IMAGE-PROVENANCE.json'),'utf8'));
 assert.equal(manifest.originals.length,32);assert.equal(new Set(manifest.originals.map(r=>r.path)).size,32);
 const files=[];function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);e.isDirectory()?walk(p):files.push(p);}}walk(join(root,'assets/images'));
 const raster=files.filter(p=>/\.(webp|png|jpe?g)$/i.test(p));
 if(!raster.length){assert.ok(files.every(p=>p.endsWith('placeholder.svg')),'Buyer export must only contain neutral seeded media');return;}
 const expected=new Map(manifest.derived.map(r=>[r.path,r]));
 assert.deepEqual(raster.map(p=>relative(root,p).replaceAll('\\','/')).sort(),[...expected.keys()].sort(),'Every demo raster, including derivatives, needs provenance');
 for(const file of raster){const path=relative(root,file).replaceAll('\\','/');const hash=createHash('sha256').update(readFileSync(file)).digest('hex');assert.equal(hash,expected.get(path).sha256,path);}
});
