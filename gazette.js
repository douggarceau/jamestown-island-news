/* 1790 gazette front: the masthead and the site's sections set as period news stories.
   Each story is a plain-named section; clicking it presses the matching menu button. */
(function(){
const STORIES=[
 ['[data-go="cal"]','Jamestown Event Calendar','A faithful Account of every Gathering, Service of Worship and Amusement to be held upon Conanicut Island, set down by Day and Hour.'],
 ['[data-go="ann"]','Island Announcements','Notices of the Season’s chief Occasions, with the Day, Hour and Place of each, that no Inhabitant be left uninformed.'],
 ['[data-go="front"]','Our Town','Wherein the Shops, Tradesmen and public Doings of the Village are made known to the Reader.'],
 ['[data-go="visit"]','Visit Jamestown','For the Traveller newly arrived: where he may Dine, Lodge, Worship and take the Sea Air.'],
 ['[data-go="stories"]','Jamestown News','The latest Intelligence from about the Island, gathered from the Town and its Neighbours, with Sources named.'],
 ['#nbAdv','Advertise','Merchants and Tradesmen desirous of making their Wares known to the Island may here inquire of Terms.'],
 ['#nbSub','Subscribe','Receive each new Number of this Paper by Letter, as soon as it is printed.'],
 ['#nbShare','Share','Pass this Paper along to a Neighbour, that the whole Island may be informed.'],
 ['#nbSis','Sister Publications','Our Companion Papers, printed for the Readers of other Towns.']
];
const H=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function build(){
 const nav=document.getElementById('nav'),mast=document.querySelector('header.mast');
 if(!nav||!mast)return false;
 if(STORIES.some(s=>!nav.querySelector(s[0])))return false;
 if(document.getElementById('gaz1790'))return true;
 const g=document.createElement('section');g.id='gaz1790';g.setAttribute('aria-label','Sections');
 const day=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'America/New_York'});
 g.innerHTML='<div class="gz-paper"><div class="gz-top"></div><div class="gz-date"><span>Vol. I</span><span>Jamestown, on Conanicut Island, Rhode-Island</span><span>'+H(day)+'</span></div><div class="gz-cols"></div></div>';
 const h1=mast.querySelector('h1');if(h1)g.querySelector('.gz-top').appendChild(h1);
 const cols=g.querySelector('.gz-cols');
 STORIES.forEach(([sel,head,blurb],i)=>{const b=nav.querySelector(sel);const tag=b.querySelector('.jpost,.new3-glow');
  const a=document.createElement('button');a.type='button';a.className='gz-st'+(i<2?' gz-lead':'');
  a.innerHTML=(tag?'<span class="gz-tag">'+H(tag.textContent.trim())+'</span>':'')+'<b>'+H(head)+'</b><span class="gz-rule"></span><span class="gz-b">'+H(blurb)+'</span><span class="gz-more">Read on →</span>';
  a.addEventListener('click',()=>{const t=nav.querySelector(sel);if(t)t.click();});cols.appendChild(a)});
 const f=document.getElementById('nbSearch');if(f){const c=document.createElement('div');c.className='gz-st gz-srch';c.innerHTML='<b>Search</b><span class="gz-rule"></span><span class="gz-b">Seek any Story or Event printed in these Pages.</span>';c.appendChild(f);cols.appendChild(c)}
 const P=[],r=()=>Math.random(),N=46;for(let i=0;i<=N;i++)P.push((i/N*100).toFixed(2)+'% '+(r()*7).toFixed(1)+'px');for(let i=1;i<=N;i++)P.push('calc(100% - '+(r()*7).toFixed(1)+'px) '+(i/N*100).toFixed(2)+'%');for(let i=N-1;i>=0;i--)P.push((i/N*100).toFixed(2)+'% calc(100% - '+(r()*7).toFixed(1)+'px)');for(let i=N-1;i>0;i--)P.push((r()*7).toFixed(1)+'px '+(i/N*100).toFixed(2)+'%');
 g.querySelector('.gz-paper').style.clipPath='polygon('+P.join(',')+')';
 mast.after(g);document.documentElement.classList.add('gz-on');return true}
if(!build()){let n=0;const t=setInterval(()=>{if(build()||++n>80)clearInterval(t)},100)}
})();
