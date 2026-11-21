/* Beyond the Island: national tech, music and film stories shared with the sister sites.
   Kept apart from the island's own STORIES so local news always comes first. */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let B=[];const td=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
fetch('data/beyond.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(d=>{B=((d&&d.items)||[]).filter(s=>!s.until||s.until>=td);place()}).catch(()=>{});
const st=document.createElement('style');st.textContent=`
#beyond{margin:22px 0 8px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(10,25,50,.55);overflow:hidden}
#beyond>h2{margin:0;padding:12px 16px;font:800 13px/1.2 var(--lb,system-ui);letter-spacing:.14em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,.12)}
#beyond>h2 small{font-weight:600;letter-spacing:.04em;text-transform:none;color:#AFC3DA;margin-left:8px}
#beyond button.br{all:unset;cursor:pointer;display:block;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
#beyond button.br:last-child{border-bottom:0}#beyond button.br:hover{background:rgba(255,255,255,.04)}
#beyond .br b{display:block;font:700 17px/1.25 var(--hd,Georgia,serif);color:#fff}
#beyond .br span{display:block;margin-top:3px;font:400 14px/1.4 var(--tx,system-ui);color:#C9D4E2}
#byRead{max-width:760px;margin:10px auto 30px;color:#E9EEF5;font:400 17px/1.65 var(--tx,Georgia,serif)}
#byRead h2{font:800 30px/1.15 var(--hd,Georgia,serif);color:#fff;margin:10px 0 6px}#byRead h3{font:700 20px/1.3 var(--hd,Georgia,serif);color:#fff;margin:22px 0 6px}
#byRead .dk{color:#AFC3DA;font-size:18px;margin:0 0 14px}#byRead .src{font-size:13px;color:#AFC3DA;border-top:1px solid rgba(255,255,255,.15);margin-top:22px;padding-top:10px}
#byRead .src a{color:#AFC3DA}#byRead .bk{all:unset;cursor:pointer;font:700 13px/1 var(--lb,system-ui);letter-spacing:.1em;text-transform:uppercase;color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:8px 12px}`;
document.head.appendChild(st);
function list(){return `<section id="beyond"><h2>Headlines<small></small></h2>${B.map((s,i)=>`<button type="button" class="br" data-i="${i}"><b>${H(s.title)}</b><span>${H(s.dek)}</span></button>`).join('')}</section>`}
function open(s){const v=document.getElementById('view');if(!v)return;
 const body=(s.body||[]).map(p=>/^## /.test(p)?`<h3>${H(p.slice(3))}</h3>`:/^#T /.test(p)?'':`<p>${H(p)}</p>`).join('');
 const src=(s.sources||[]).map(x=>`<a href="${H(x.url)}" target="_blank" rel="noopener">${H(x.outlet)}${x.title?': '+H(x.title):''}</a>`).join(' · ');
 v.innerHTML=`<article id="byRead"><button type="button" class="bk">← Back</button><h2>${H(s.title)}</h2><p class="dk">${H(s.dek)}</p>${body}${src?`<p class="src">Sources: ${src}</p>`:''}</article>`;
 v.querySelector('.bk').onclick=()=>{try{go(STATE.prev&&STATE.prev!=='read'?STATE.prev:'front')}catch(_){location.reload()}};scrollTo(0,0)}
function place(){if(!B.length)return;let v='';try{v=STATE.view}catch(_){}if(v!=='front'&&v!=='stories')return;
 const host=document.getElementById('view');if(!host||host.querySelector('#beyond')||host.querySelector('#byRead'))return;
 host.insertAdjacentHTML('beforeend',list());host.querySelectorAll('#beyond .br').forEach(b=>b.onclick=()=>open(B[+b.dataset.i]))}
const ob=()=>{const h=document.getElementById('view');if(!h)return setTimeout(ob,300);new MutationObserver(()=>setTimeout(place,50)).observe(h,{childList:true});place()};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',ob):ob();
})();
