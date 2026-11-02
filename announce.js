/* Island Announcements: the story artwork with the event, the date and time, and a link to the full story */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
window.vAnn=function(){
  const t=today();
  const L=(typeof STORIES!=='undefined'?STORIES:[]).filter(s=>s.ann&&s.img&&(!s.until||s.until>=t)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const rows=L.map(s=>`<article class="ann-i">
    ${s.vid?`<video class="ann-vid" controls autoplay muted playsinline preload="auto" poster="${H(s.img)}" src="${H(s.vid)}" aria-label="${H(s.imgAlt||'')}"></video>`:`<button type="button" class="ann-pic" data-story="${H(s.slug)}" aria-label="${H(s.ann.head||s.title)}: see story for details"><img src="${H(s.img)}" alt="${H(s.imgAlt||'')}" decoding="async"></button>`}
    <div class="ann-t"><p class="ann-when">${H(s.ann.when)}</p><h2>${H(s.ann.head||s.title)}</h2>${s.ann.where?`<p class="ann-where">${H(s.ann.where)}</p>`:''}<button type="button" class="ann-go" data-story="${H(s.slug)}">See story for details &rarr;</button></div>
  </article>`).join('');
  return `<section class="annv xlbox"><div class="xl" aria-hidden="true"><i></i><i></i><i></i><i></i></div><h1 class="ann-h">Island Announcements</h1>${rows||'<p class="ann-none">No announcements right now.</p>'}</section>`;
};
})();

/* Santa video sound: start with sound when the browser allows it (the reader has already tapped the page); otherwise play muted with a small "Turn sound on" button */
(function(){
function arm(v){
  if(v.__arm)return;v.__arm=1;
  const b=document.createElement('button');b.type='button';b.className='snd';b.textContent='Turn sound on';
  v.insertAdjacentElement('afterend',b);
  const sync=()=>{b.hidden=!v.muted};
  v.addEventListener('volumechange',sync);
  b.addEventListener('click',e=>{e.stopPropagation();v.muted=false;v.play().catch(()=>{})});
  try{
    if(navigator.userActivation&&navigator.userActivation.hasBeenActive){
      v.muted=false;const p=v.play();
      const back=()=>{v.muted=true;v.play().catch(()=>{})};
      if(p&&p.catch)p.catch(back);
      setTimeout(()=>{if(v.paused)back()},700);
    }
  }catch(_){}
  sync();
}
const scan=()=>document.querySelectorAll('video.ann-vid,.reader figure.hero video').forEach(arm);
new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',scan);
})();
