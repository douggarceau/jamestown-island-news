(function(){document.documentElement.setAttribute('data-jt27','');const f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap';document.head.appendChild(f)})();
(function(){const OLD=/Georgia|Playfair|PT Serif|Libre Caslon|Bodoni|DM Serif|Old Standard|Cormorant|Times|serif$/i;
function fx(){document.querySelectorAll('.wrap :is(b,strong,span,a,h2,h3,h4,p,button,div,small,li,summary,label):not([data-f27]),#dirCol :is(b,span,button,div):not([data-f27])').forEach(e=>{e.dataset.f27='';if(e.closest('header.mast,.bp,.ep'))return;if(OLD.test(getComputedStyle(e).fontFamily)){e.style.setProperty('font-family','"Geist",system-ui,sans-serif','important');e.style.setProperty('font-style','normal','important')}})}
const go=()=>{fx();let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(fx,80)}).observe(document.body,{childList:true,subtree:true})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()})();

/* front page: lead story on one of the owner's island paintings, one place per story, directory in the footer */
(function(){const R=document.documentElement;const SC=["01-bridge", "02-windmill", "03-harbor", "04-lighthouse", "05-mist", "06-redlight", "07-springlight", "08-lighthouse-cottage", "09-stonelight", "10-spring-harbor", "11-lobster-dock", "12-winter-boat", "13-ferry", "14-fort-bunker", "15-tide-cove", "16-shore-cottage", "18-autumn-village", "19-fort-wall", "20-ruin-point", "21-surf-beach", "22-misty-cove-path", "23-beach-chair", "24-dune-inlet", "25-winter-beach", "26-bicycle-fence", "27-mooring-bridge", "28-catboat-light", "29-winter-yacht", "30-spring-ferry", "31-schooner", "32-autumn-yacht", "34-dawn-cruiser", "36-sunset-terrace"];
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const td=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
function lead(){let L=[];try{L=STORIES}catch(_){return null}const d=td();const ok=s=>s&&s.title&&!/^today-on-the-island-/.test(s.slug)&&(!s.until||s.until>=d);
 return L.find(s=>s.lead&&ok(s))||L.filter(ok).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0]||null}
function hero(){let v='';try{v=STATE.view}catch(_){}const old=document.getElementById('hero27');if(v!=='front'){if(old)old.remove();return}
 const s=lead();if(!s)return;if(old&&old.dataset.story===s.slug)return;if(old)old.remove();
 const a=document.getElementById('whatsOn')||document.getElementById('coverSlot');if(!a)return;
 const b=document.createElement('button');b.type='button';b.id='hero27';b.dataset.story=s.slug;
 b.style.setProperty('--hb','url(img/scenes/'+SC[hash(s.slug)%SC.length]+'-1200.webp)');
 b.innerHTML='<span class="hk">Island News</span><span class="ht">'+H(s.title)+'</span>'+(s.dek?'<span class="hd">'+H(s.dek)+'</span>':'')+'<span class="hg">Read the story →</span>';
 a.parentNode.insertBefore(b,a)}
function dedupe(){const h=document.getElementById('hero27');const ld=h&&h.dataset.story;
 document.querySelectorAll('.cvside .sea-g [data-story]').forEach(b=>{if(ld&&b.dataset.story===ld)b.style.setProperty('display','none','important')});
 const hb=document.getElementById('hlBox');if(hb){const vis=[...hb.querySelectorAll('a.hlr')].some(a=>!/^\?story=/.test(a.getAttribute('href')||''));hb.style.setProperty('display',vis?'':'none',vis?'':'important')}}
function foot(){const ft=document.querySelector('footer.site-footer');if(!ft||ft.querySelector('.ft27'))return;const d=document.createElement('div');d.className='ft27';
 d.innerHTML='<a href="https://newyorkcityscream.com/">New York City Scream</a><a href="https://rhodeislandhurricane.com/">Rhode Island Hurricane</a><a href="https://theguitardougreport.com/">The Guitar Doug Report</a><button type="button" data-dir="1">Jamestown Local Directory</button><button type="button" data-g="holiday">Holiday Guide</button><button type="button" data-g="gov">Town Government</button><button type="button" data-g="gigs">Jobs</button><button type="button" data-g="realestate">Homes for Sale</button><button type="button" data-g="help">Help</button><button type="button" data-c="nbSub">Subscribe</button><button type="button" data-g="advertise">Advertising</button><button type="button" data-g="privacy">Privacy &amp; Contact</button>';
 d.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.dir){R.classList.toggle('dir27');return}if(b.dataset.c){const x=document.getElementById(b.dataset.c);if(x)x.click();return}try{go(b.dataset.g)}catch(_){}scrollTo(0,0)});ft.insertBefore(d,ft.firstChild)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')R.classList.remove('dir27')});
const run=()=>{hero();dedupe();foot()};
const go_=()=>{run();let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,60)}).observe(document.body,{childList:true,subtree:true})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go_):go_()})();

/* plain short tab names */
(function(){const N={front:'Now',stories:'News',cal:'Calendar',ann:'Announcements',wx:'Weather & Marine',visit:'Visit'};
function lab(){document.querySelectorAll('#nav>.nb[data-go]').forEach(b=>{const t=N[b.dataset.go];if(!t)return;b.style.setProperty('order',String(Object.keys(N).indexOf(b.dataset.go)+1),'important');const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn&&tn.textContent.trim()!==t)tn.textContent=t+(b.children.length?' ':'')})}
const go_=()=>{lab();let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(lab,60)}).observe(document.getElementById('nav')||document.body,{childList:true,subtree:true,characterData:true})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go_):go_()})();
