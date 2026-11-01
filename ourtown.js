/* Our Town: the Jamestown front page as a wall of two-sided ads for real island events and businesses */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TZ='America/New_York',ymd=d=>d.toLocaleDateString('en-CA',{timeZone:TZ});
const MUSIC=/^(live|rock|indie|jazz|pop|electronic|folk|r&b|latin|metal|hip-hop|punk|experimental|world|goth|country|classical|blues|soul|reggae|funk|music|sports|support|worship)$/i;
const DULL=/pantry|thrift|rehearsal|appointment|office hours|support group|meeting\b|anonymous|al-anon|recovery|board of|council|committee|commission/i;
const PAL=[['#1d4a6e','#0a1724'],['#5a1a12','#1a0806'],['#1f4d2b','#081a0e'],['#4a2a6e','#140a24'],['#6e4a12','#241606'],['#123f4a','#06181c']];
let EV=null,BIZ=null;
function evFace(e,i){const d=new Date(e.date+'T12:00:00'),p=PAL[i%PAL.length];
 return `<a class="otf" style="--a:${p[0]};--b:${p[1]}" href="${/^https?:/.test(e.url||'')?H(e.url):'#cal'}" ${/^https?:/.test(e.url||'')?'target="_blank" rel="noopener"':''}><span class="otk">Come one, come all</span><b>${H(String(e.artists||'').split(/\s+[|@]\s+/)[0])}</b><span class="otw">${H(d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))}${e.time?' · '+H(String(e.time).replace(/:00/g,'')):''}</span><span class="otv">${H(e.venue||'')}</span><span class="otd">Details →</span></a>`}
function bizFace(x,i,kick){const p=PAL[(i+3)%PAL.length];
 return `<a class="otf" style="--a:${p[0]};--b:${p[1]}" href="${/^https?:/.test(x.url||'')?H(x.url):'#visit'}" ${/^https?:/.test(x.url||'')?'target="_blank" rel="noopener"':''}><span class="otk">${H(kick)}</span><b>${H(x.name)}</b>${x.address?`<span class="otv">${H(x.address)}</span>`:''}${x.phone?`<span class="otw">${H(x.phone)}</span>`:''}<span class="otd">Visit →</span></a>`}
function card(f,b){return `<div class="otc"><div class="otin">${f}${b.replace('class="otf"','class="otf otback"')}</div></div>`}
function build(){const td=ymd(new Date()),end=ymd(new Date(Date.now()+45*864e5));
 const seen=new Set(),ev=[];(EV||[]).filter(e=>e.date>=td&&e.date<=end&&!MUSIC.test(e.genre||'')&&!DULL.test(e.artists||'')).sort((a,b)=>a.date<b.date?-1:1).forEach(e=>{const k=String(e.artists||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,24);if(!k||seen.has(k))return;seen.add(k);ev.push(e)});
 const sec=k=>(((BIZ||{}).sections||[]).find(s=>s.key===k)||{}).items||[];
 const biz=[].concat(sec('shop').filter(x=>x.status!=='closed'&&x.address).map(x=>[x,'Shop local']),sec('eat').filter(x=>x.address).map(x=>[x,'Eat on the island']),sec('icecream').map(x=>[x,'Treats on the island']));
 const faces=[];ev.slice(0,24).forEach((e,i)=>faces.push(evFace(e,i)));biz.forEach(([x,k],i)=>faces.push(bizFace(x,i,k)));
 let h='';for(let i=0;i+1<faces.length;i+=2)h+=card(faces[i],faces[i+1]);
 return h}
function mount(){const v=document.getElementById('view');const front=typeof STATE!=='undefined'&&STATE.view==='front';
 document.documentElement.classList.toggle('ot',front);
 if(!front||!v||EV===null||BIZ===null)return;
 if(v.querySelector('#otAds'))return;
 const s=document.createElement('section');s.id='otAds';s.setAttribute('aria-label','Our Town');
 s.innerHTML=`<h2 class="room">Our Town</h2><div class="otg">${build()}</div>`;
 v.appendChild(s)}
fetch('data/cal.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{EV=d.events||[];mount()}).catch(()=>{EV=[]});
fetch('data/visit.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{BIZ=d;mount()}).catch(()=>{BIZ={}});
setInterval(mount,700);
})();
