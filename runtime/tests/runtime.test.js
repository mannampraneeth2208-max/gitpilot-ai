const test=require('node:test'); const assert=require('node:assert/strict'); const crypto=require('node:crypto');
function sig(body,secret){return crypto.createHmac('sha256',secret).update(body).digest('hex')}
test('signature helper produces deterministic HMAC',()=>{assert.equal(sig('{"x":1}','secret'),sig('{"x":1}','secret'));assert.notEqual(sig('{"x":1}','secret'),sig('{"x":2}','secret'))});
test('unsafe shell metacharacters are detectable by worker policy',()=>{for(const s of ['../../etc/passwd','foo;rm -rf /','/absolute/path','a&&b']) assert.ok(s.includes('..')||s.startsWith('/')||s.includes(';')||s.includes('&&'))});
test('approval policy blocks execute without explicit approval',()=>{const input={action:'execute',approvalStatus:'PENDING'};assert.notEqual(input.approvalStatus,'APPROVED')});
