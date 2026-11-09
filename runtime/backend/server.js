const http = require('node:http');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 8080);
const SECRET = process.env.GITPILOT_WEBHOOK_SECRET || '';
const N8N = (process.env.N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook').replace(/\/$/, '');
const WORKER = (process.env.WORKER_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');
const tasks = new Map();

function json(res, status, body) {
  const out = JSON.stringify(body);
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(out)});
  res.end(out);
}
function hmac(raw) { return crypto.createHmac('sha256', SECRET).update(raw).digest('hex'); }
function safeEqual(a,b) { return a && b && a.length===b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b)); }
function auth(req, raw) {
  if (!SECRET) return false;
  const sig=(req.headers['x-gitpilot-signature']||'').replace(/^sha256=/,'');
  return safeEqual(sig,hmac(raw));
}
async function readBody(req) {
  let s=''; for await (const c of req) { s += c; if (s.length > 2_000_000) throw new Error('request too large'); }
  return s;
}
async function call(url, options={}) {
  const r=await fetch(url, {...options, headers:{'content-type':'application/json', ...(options.headers||{})}});
  const text=await r.text(); let data; try { data=JSON.parse(text); } catch { data={raw:text}; }
  if (!r.ok) throw new Error(`upstream ${r.status}: ${JSON.stringify(data).slice(0,500)}`);
  return data;
}
function routeFor(path) {
  const m={'/analyze':'analyze','/discover':'discover','/plan':'plan','/execute':'execute','/approve':'approve','/review':'review'};
  return m[path.split('/').slice(-1)[0]];
}
async function gmailNotify(subject, text) {
  if (process.env.GMAIL_NOTIFICATION_MODE !== 'api') return {sent:false, reason:'disabled'};
  const token=process.env.GMAIL_ACCESS_TOKEN, to=process.env.GMAIL_TO, from=process.env.GMAIL_FROM;
  if (!token || !to || !from) return {sent:false, reason:'gmail_not_configured'};
  const raw=`From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${text}`;
  const encoded=Buffer.from(raw).toString('base64url');
  return call('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({raw:encoded})});
}
async function handler(req,res) {
  const url=new URL(req.url,`http://${req.headers.host}`);
  if (req.method==='GET' && url.pathname==='/healthz') return json(res,200,{ok:true,service:'gitpilot-api',policy:process.env.GITPILOT_APPROVAL_POLICY||'autonomous',capabilities:['analyze','discover','plan','execute','approve','review'],timestamp:new Date().toISOString()});
  let raw=''; try { raw=await readBody(req); } catch(e) { return json(res,413,{error:e.message}); }
  if (!auth(req,raw)) return json(res,401,{error:'invalid signature'});
  let body={}; try { body=raw?JSON.parse(raw):{}; } catch { return json(res,400,{error:'invalid JSON'}); }
  if (req.method==='POST' && url.pathname.startsWith('/api/v1/gitpilot/')) {
    const action=routeFor(url.pathname); if (!action) return json(res,404,{error:'unknown route'});
    const taskId=body.taskId || `task_${crypto.randomUUID()}`;
    const idem=body.idempotencyKey || taskId;
    if (tasks.has(idem)) return json(res,200,{...tasks.get(idem), idempotent:true});
    const record={taskId,action,state:action==='execute'?'AWAITING_APPROVAL':'RECEIVED',createdAt:new Date().toISOString(),input:body};
    tasks.set(idem,record);
    try {
      const result=await call(`${N8N}/api/v1/gitpilot/${action}`,{method:'POST',body:JSON.stringify({...body,taskId,idempotencyKey:idem})});
      const merged={...record,...result}; tasks.set(idem,merged);
      if (merged.state==='FAILED' || merged.status==='FAILED') await gmailNotify(`GitPilot failure: ${taskId}`,JSON.stringify(merged,null,2));
      return json(res,202,merged);
    } catch(e) { const failed={...record,state:'FAILED',error:e.message}; tasks.set(idem,failed); await gmailNotify(`GitPilot failure: ${taskId}`,e.message); return json(res,502,failed); }
  }
  const match=url.pathname.match(/^\/api\/v1\/gitpilot\/tasks\/([^/]+)$/);
  if (req.method==='GET' && match) { const found=[...tasks.values()].find(t=>t.taskId===match[1]); return found?json(res,200,found):json(res,404,{error:'task not found'}); }
  if (req.method==='POST' && url.pathname==='/internal/worker/runs') {
    try { const result=await call(`${WORKER}/v1/runs`,{method:'POST',headers:{'x-worker-secret':process.env.WORKER_SHARED_SECRET||''},body:JSON.stringify(body)}); return json(res,200,result); } catch(e) { return json(res,502,{error:e.message}); }
  }
  return json(res,404,{error:'not found'});
}
http.createServer((req,res)=>handler(req,res).catch(e=>json(res,500,{error:'internal error',detail:e.message}))).listen(PORT,()=>console.log(`GitPilot API listening on ${PORT}`));
