/* Island Announcements: the story artwork with the event, the date and time, and a link to the full story */
(function(){
const H=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
window.vAnn=function(){
  const t=today();
  const L=(typeof STORIES!=='undefined'?STORIES:[]).filter(s=>s.ann&&s.img&&(!s.until||s.until>=t)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const rows=L.map(s=>`<article class="ann-i">
    ${s.vid?`<video class="ann-vid" controls playsinline preload="metadata" poster="${H(s.img)}" src="${H(s.vid)}" aria-label="${H(s.imgAlt||'')}"></video>`:`<button type="button" class="ann-pic" data-story="${H(s.slug)}" aria-label="${H(s.ann.head||s.title)}: see story for details"><img src="${H(s.img)}" alt="${H(s.imgAlt||'')}" decoding="async"></button>`}
    <div class="ann-t"><p class="ann-when">${H(s.ann.when)}</p><h2>${H(s.ann.head||s.title)}</h2>${s.ann.where?`<p class="ann-where">${H(s.ann.where)}</p>`:''}<button type="button" class="ann-go" data-story="${H(s.slug)}">See story for details &rarr;</button></div>
  </article>`).join('');
  return `<section class="annv xlbox"><div class="xl" aria-hidden="true"><i></i><i></i><i></i><i></i></div><h1 class="ann-h">Island Announcements</h1>${rows||'<p class="ann-none">No announcements right now.</p>'}</section>`;
};
})();
