const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, 'public');
const GATEWAY = process.env.GITPILOT_API_BASE || '';
const WEBHOOK_SECRET = process.env.GITPILOT_WEBHOOK_SECRET || '';
const providerStore = new Map([
  ['openrouter', { id:'openrouter', name:'OpenRouter', kind:'model', status:'configured', model:'select a verified model', fingerprint:'••••••••', rotatedAt:'2026-11-07T14:55:00Z', notes:'Write-only secret; model name is editable.' }],
  ['github', { id:'github', name:'GitHub App', kind:'github', status:'action required', model:'installation token', fingerprint:'not configured', rotatedAt:null, notes:'Use a GitHub App or fine-grained token.' }],
  ['gmail', { id:'gmail', name:'Gmail notifications', kind:'notifications', status:'disabled', model:'OAuth only', fingerprint:'not configured', rotatedAt:null, notes:'No password accepted or stored.' }]
]);
const tasks = [
  {id:'task_91d2', repo:'vercel/next.js', title:'Add cache invalidation coverage for route handlers', state:'AWAITING_APPROVAL', status:'Approval needed', type:'Feature contribution', branch:'gitpilot/cache-route-handlers', owner:'Repository Intelligence → Engineering', age:'18m', evidence:['tree indexed','plan reviewed','tests pending'], risk:'medium'},
  {id:'task_8a31', repo:'fastapi/fastapi', title:'Clarify dependency override behavior in docs', state:'TESTING', status:'Running tests', type:'Documentation', branch:'gitpilot/docs-dependency-overrides', owner:'Testing Agent', age:'42m', evidence:['diff created','lint passed','security queued'], risk:'low'},
  {id:'task_7f44', repo:'pallets/flask', title:'Improve error message for invalid blueprint import', state:'REVIEWING', status:'Independent review', type:'Bug fix', branch:'gitpilot/blueprint-error-message', owner:'Review Agent', age:'1h', evidence:['tests passed','security passed','review in progress'], risk:'low'}
];
const completed = [
  {id:'pr_1421', repo:'psf/requests', title:'Document retry behavior for streamed responses', pr:'#6821', result:'Merged', verified:'3 checks passed', date:'Nov 06', impact:'Docs', link:'#'},
  {id:'pr_1418', repo:'tiangolo/fastapi', title:'Add regression test for header normalization', pr:'#12112', result:'Open', verified:'5 checks passed', date:'Nov 05', impact:'Test', link:'#'},
  {id:'pr_1409', repo:'encode/httpx', title:'Fix missing timeout detail in exception text', pr:'#3184', result:'Closed', verified:'Review requested changes', date:'Nov 03', impact:'Bug fix', link:'#'}
];
const events = [
  ['14:58','Review Agent','flagged one requirement gap','task_91d2'],
  ['14:52','Testing Agent','started isolated worker run','task_8a31'],
  ['14:45','Security Agent','cleared dependency scan','task_7f44'],
  ['14:31','Central Brain','created approval checkpoint','task_91d2'],
  ['14:04','Memory Agent','stored repository index delta','repo:vercel/next.js']
];
function send(res, status, body, type='application/json') { const out=type==='application/json'&&!Buffer.isBuffer(body)?JSON.stringify(body):body; res.writeHead(status, {'content-type':`${type}; charset=utf-8`, 'cache-control':'no-store'}); res.end(out); }
function safePath(urlPath) { const clean=urlPath==='/'?'/index.html':urlPath; const p=path.normalize(path.join(ROOT, clean)); return p.startsWith(ROOT) ? p : null; }
function fingerprint(value) { return crypto.createHash('sha256').update(value).digest('hex').slice(0,12); }
function signature(raw) { return crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex'); }
async function body(req) { let raw=''; for await (const chunk of req) { raw += chunk; if(raw.length>200000) throw Error('request too large'); } return raw ? JSON.parse(raw) : {}; }
async function gateway(pathname, payload) {
  if (!GATEWAY) return null;
  const raw=JSON.stringify(payload); const headers={'content-type':'application/json'};
  if (WEBHOOK_SECRET) headers['x-gitpilot-signature']=`sha256=${signature(raw)}`;
  const response=await fetch(`${GATEWAY.replace(/\/$/,'')}${pathname}`,{method:'POST',headers,body:raw});
  const text=await response.text(); let data; try{data=JSON.parse(text)}catch{data={raw:text}};
  if(!response.ok) throw Error(`gateway ${response.status}`); return data;
}
async function api(req,res,url) {
  if(req.method==='GET' && url.pathname==='/api/health') return send(res,200,{ok:true,mode:GATEWAY?'live-gateway':'demo-adapter',time:new Date().toISOString()});
  if(req.method==='GET' && url.pathname==='/api/overview') return send(res,200,{active:3,completed:18,approval:1,verifiedRate:92,worker:'healthy',model:'configured',github:'action required',gmail:'optional'});
  if(req.method==='GET' && url.pathname==='/api/tasks') return send(res,200,{tasks,updatedAt:new Date().toISOString()});
  if(req.method==='GET' && url.pathname==='/api/completed') return send(res,200,{items:completed});
  if(req.method==='GET' && url.pathname==='/api/events') return send(res,200,{events});
  if(req.method==='GET' && url.pathname==='/api/providers') return send(res,200,{providers:[...providerStore.values()].map(({secret,...safe})=>safe)});
  if(req.method==='POST' && url.pathname==='/api/providers') {
    const data=await body(req); if(!data.id||!data.name||!data.secret) return send(res,400,{error:'provider id, name, and secret are required'});
    providerStore.set(data.id,{id:data.id,name:data.name,kind:data.kind||'model',status:'configured',model:data.model||'configured',fingerprint:`••••${fingerprint(data.secret)}`,rotatedAt:new Date().toISOString(),notes:'Secret accepted write-only; value is never returned.'});
    return send(res,201,{ok:true,provider:[...providerStore.values()].find(x=>x.id===data.id)});
  }
  const rotate=url.pathname.match(/^\/api\/providers\/([^/]+)\/rotate$/);
  if(req.method==='POST' && rotate) {
    const data=await body(req); const existing=providerStore.get(rotate[1]); if(!existing||!data.secret) return send(res,400,{error:'known provider and secret are required'});
    const next={...existing,status:'configured',fingerprint:`••••${fingerprint(data.secret)}`,rotatedAt:new Date().toISOString()}; providerStore.set(rotate[1],next); return send(res,200,{ok:true,provider:next});
  }
  const disable=url.pathname.match(/^\/api\/providers\/([^/]+)\/disable$/);
  if(req.method==='POST' && disable) { const existing=providerStore.get(disable[1]); if(!existing) return send(res,404,{error:'provider not found'}); const next={...existing,status:'disabled'}; providerStore.set(disable[1],next); return send(res,200,{ok:true,provider:next}); }
  const approve=url.pathname.match(/^\/api\/tasks\/([^/]+)\/approve$/);
  if(req.method==='POST' && approve) { const task=tasks.find(x=>x.id===approve[1]); if(!task) return send(res,404,{error:'task not found'}); task.state='EXECUTING'; task.status='Approved — worker queued'; task.evidence.push('human approval recorded'); return send(res,202,{ok:true,task}); }
  if(req.method==='POST' && url.pathname==='/api/refresh') return send(res,200,{ok:true,updatedAt:new Date().toISOString()});
  return send(res,404,{error:'not found'});
}
async function server(req,res) { const url=new URL(req.url,`http://${req.headers.host}`); if(url.pathname.startsWith('/api/')) return api(req,res,url).catch(e=>send(res,500,{error:e.message})); const file=safePath(url.pathname); if(!file) return send(res,403,'forbidden','text/plain'); try { const data=await fs.readFile(file); const ext=path.extname(file); const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'}[ext]||'text/plain'; return send(res,200,data,type); } catch { try { const data=await fs.readFile(path.join(ROOT,'index.html')); return send(res,200,data,'text/html'); } catch { return send(res,404,'not found','text/plain'); } } }
http.createServer(server).listen(PORT,'0.0.0.0',()=>console.log(`GitPilot Control Room listening on ${PORT}`));
