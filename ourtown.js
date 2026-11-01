/* Our Town: the Jamestown front page as a wall of two-sided ads for real island events and businesses */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TZ='America/New_York',ymd=d=>d.toLocaleDateString('en-CA',{timeZone:TZ});
const MUSIC=/^(live|rock|indie|jazz|pop|electronic|folk|r&b|latin|metal|hip-hop|punk|experimental|world|goth|country|classical|blues|soul|reggae|funk|music|sports|support|worship)$/i;
const DULL=/pantry|thrift|rehearsal|appointment|office hours|support group|meeting\b|anonymous|al-anon|recovery|board of|council|committee|commission/i;
const PAL=[['#1d4a6e','#0a1724'],['#5a1a12','#1a0806'],['#1f4d2b','#081a0e'],['#4a2a6e','#140a24'],['#6e4a12','#241606'],['#123f4a','#06181c']];
let EV=null,BIZ=null;
const EVS=[];
function evFace(e,i){EVS.push(e);const u=/^https?:/.test(e.url||'')?e.url:'';return `<a class="otf otp" data-ev="${EVS.length-1}" href="${u?H(u):'#cal'}" ${u?'target="_blank" rel="noopener"':''}></a>`}
const ART=['wharf','bridge','story-jamestown','fair','fair2','gallery','gallery2','week2','marquee'];
function bizFace(x,i,kick){const u=/^https?:/.test(x.url||'')?x.url:'';const img=ART[Math.floor(Math.random()*ART.length)];
 return `<a class="otf otbz" style="--img:url(img/posters/${img}.jpg)" href="${u?H(u):'#visit'}" ${u?'target="_blank" rel="noopener"':''}><span class="otk">${H(kick)}</span><b>${H(x.name)}</b>${x.address?`<span class="otv">${H(x.address)}</span>`:''}${x.phone?`<span class="otw">${H(x.phone)}</span>`:''}<span class="otd">Visit →</span></a>`}
const R=()=>Math.random();
function card(f,b){const sz=R()<.14?' otw2':R()<.12?' oth2':'';return `<div class="otc${sz}"><div class="otin" style="animation-duration:${(11+R()*9).toFixed(1)}s;animation-delay:-${(R()*20).toFixed(1)}s">${f}${b.replace('class="otf"','class="otf otback"')}</div></div>`}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function build(){const td=ymd(new Date()),end=ymd(new Date(Date.now()+45*864e5));
 const seen=new Set(),ev=[];(EV||[]).filter(e=>e.date>=td&&e.date<=end&&!MUSIC.test(e.genre||'')&&!DULL.test(e.artists||'')).sort((a,b)=>a.date<b.date?-1:1).forEach(e=>{const k=String(e.artists||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,24);if(!k||seen.has(k))return;seen.add(k);ev.push(e)});
 const sec=k=>(((BIZ||{}).sections||[]).find(s=>s.key===k)||{}).items||[];
 const biz=[].concat(sec('shop').filter(x=>x.status!=='closed'&&x.address).map(x=>[x,'Shop local']),sec('eat').filter(x=>x.address).map(x=>[x,'Eat on the island']),sec('icecream').map(x=>[x,'Treats on the island']));
 const faces=shuf(ev.slice(0,30).map((e,i)=>evFace(e,Math.floor(R()*6))).concat(biz.map(([x,k],i)=>bizFace(x,Math.floor(R()*6),k))));
 let h='';for(let i=0;i+1<faces.length;i+=2)h+=card(faces[i],faces[i+1]);
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
setInterval(mount,700);
})();
