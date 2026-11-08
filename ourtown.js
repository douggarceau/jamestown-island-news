/* Our Town: the Jamestown front page as a wall of two-sided ads for real island events and businesses */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TZ='America/New_York',ymd=d=>d.toLocaleDateString('en-CA',{timeZone:TZ});
const MUSIC=/^(live|rock|indie|jazz|pop|electronic|folk|r&b|latin|metal|hip-hop|punk|experimental|world|goth|country|classical|blues|soul|reggae|funk|music|sports|support|worship)$/i;
const DULL=/pantry|thrift|rehearsal|appointment|office hours|support group|meeting\b|anonymous|al-anon|recovery|board of|council|committee|commission/i;
const PAL=[['#002D57','#0A1428'],['#B5123A','#0F1F36'],['#0F1F36','#0F1F36'],['#002D57','#0A1428'],['#0F1F36','#0F1F36'],['#0F1F36','#0A1428']];
let EV=null,BIZ=null;
const EVS=[];
function evFace(e,i){EVS.push(e);const u=/^https?:/.test(e.url||'')?e.url:'';return `<a class="otf otp" data-ev="${EVS.length-1}" href="${u?H(u):'#cal'}" ${u?'target="_blank" rel="noopener"':''}></a>`}
const ART=[['snow','#B5123A','#B5123A'],['ornaments','#D4ECF5','#0F4C9A'],['stars','#D4ECF5','#0F4C9A'],['holly','#ffffff','#EEE9E5'],['lights','#D4ECF5','#0F4C9A'],['snow','#0F4C9A','#0F4C9A'],['ornaments','#B5123A','#B5123A'],['stars','#D4ECF5','#D4ECF5']];
function bizFace(x,i,kick){const u=/^https?:/.test(x.url||'')?x.url:'';const t=ART[Math.floor(Math.random()*ART.length)];
 return `<a class="otf otbz" style="--img:url(img/holiday/${t[0]}.svg);--c1:${t[1]};--c2:${t[2]}"${t[0]==='holly'?' data-lt="1"':''} href="${u?H(u):'#visit'}" ${u?'target="_blank" rel="noopener"':''}><span class="otk">${H(kick)}</span><b>${H(x.name)}</b>${x.address?`<span class="otv">${H(x.address)}</span>`:''}${x.phone?`<span class="otw">${H(x.phone)}</span>`:''}<span class="otd">Visit →</span></a>`}
const R=()=>Math.random();
const XM=[['img/story/tree-lighting-poster.jpg','jamestown-town-tree-holiday-2026','Jamestown Tree Lighting and Concert, Saturday, December 5, 5:30 PM, East Ferry Wharf'],['img/story/santa-arrives-coastal-queen.jpg','santa-mrs-claus-arrive-by-sea-2026','Santa and Mrs. Claus arrive by boat, Saturday, December 5, 1 PM, East Ferry Wharf']];
function card(f,b){const sz='';return `<div class="otc${sz}"><div class="otin" style="animation-duration:${(11+R()*9).toFixed(1)}s;animation-delay:-${(R()*20).toFixed(1)}s">${f}${b.replace('class="otf','class="otf otback')}</div></div>`}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function build(){const td=ymd(new Date()),end=ymd(new Date(Date.now()+45*864e5));
 const seen=new Set(),ev=[];(EV||[]).filter(e=>e.date>=td&&e.date<=end&&!MUSIC.test(e.genre||'')&&!DULL.test(e.artists||'')).sort((a,b)=>a.date<b.date?-1:1).forEach(e=>{const k=String(e.artists||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,24);if(!k||seen.has(k))return;seen.add(k);ev.push(e)});
 const sec=k=>(((BIZ||{}).sections||[]).find(s=>s.key===k)||{}).items||[];
 const biz=[].concat(sec('shop').filter(x=>x.status!=='closed'&&x.address).map(x=>[x,'Shop local']),sec('eat').filter(x=>x.address).map(x=>[x,'Eat on the island']),sec('icecream').map(x=>[x,'Treats on the island']));
 const faces=shuf(ev.slice(0,30).map((e,i)=>evFace(e,Math.floor(R()*6))).concat(biz.map(([x,k],i)=>bizFace(x,Math.floor(R()*6),k))));
 let h='';if(Date.now()<Date.parse('2026-12-06T00:00:00-05:00'))h+=`<div class="otc oth2 otxm"><div class="otin">${XM.map((x,i)=>`<a class="otf otxp${i?' otback':''}" href="#" data-story="${x[1]}" aria-label="${H(x[2])}"><img src="${x[0]}" alt="${H(x[2])}" loading="lazy" decoding="async"></a>`).join('')}</div></div>`;for(let i=0;i+1<faces.length;i+=2)h+=card(faces[i],faces[i+1]);
 return h}
function mount(){const v=document.getElementById('view');const front=typeof STATE!=='undefined'&&STATE.view==='front';
 document.documentElement.classList.toggle('ot',front);
 if(!front||!v||EV===null||BIZ===null)return;
 if(v.querySelector('#otAds'))return;
 const s=document.createElement('section');s.id='otAds';s.setAttribute('aria-label','Our Town');
 s.innerHTML=`<h2 class="room">Our Town</h2><div class="otg">${build()}</div>`;
 v.appendChild(s);
 s.querySelectorAll('a.otp').forEach(a=>{const e=EVS[+a.dataset.ev];try{window.evPoster&&window.evPoster(a,{ev:e,bigText:String(e.artists||'').split(/\s+[|@]\s+/)[0]})}catch(_){}
  if(!a.firstChild)a.innerHTML=`<span class="otk">Come one, come all</span><b>${H(e.artists)}</b>`})}
fetch('data/cal.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{EV=d.events||[];mount()}).catch(()=>{EV=[]});
fetch('data/visit.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{BIZ=d;mount()}).catch(()=>{BIZ={}});
setInterval(mount,150);window.addEventListener('hashchange',mount);document.addEventListener('click',()=>setTimeout(mount,0),true);
})();
