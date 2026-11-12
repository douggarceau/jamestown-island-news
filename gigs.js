/* Jamestown Jobs & Paid Gigs: every advertised paid job and gig on Conanicut Island, all skill levels.
   Data: data/gigs.json (research snapshot of employer pages and employer-posted ads). Jamestown only. No boxes.
   Also provides window.jtJobTabs(cur) for the Jobs page tab row. */
(function(){
 let D=null,asked=false,err=false;
 const st={q:'',cat:'',easy:''};
 const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const U=u=>{const t=String(u==null?'':u);return /^(javascript|data|vbscript):/i.test(t.replace(/[\s\x00-\x1f]/g,''))?'#':X(t)}; // links: never allow script URLs from outside data
 const uniq=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y));
 const dl=v=>{const d=new Date(String(v).slice(0,10)+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
 const TODAY=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
 const live=j=>!j.deadline||String(j.deadline).slice(0,10)>=TODAY(); // hide anything past its deadline even before the daily check runs
 const NP=v=>!v||/^not published/i.test(v);
 const tel=p=>'<a href="tel:'+X(p.replace(/ext.*/i,'').replace(/[^0-9]/g,'').slice(0,10))+'">'+X(p)+'</a>';
 const PRI={lower_barrier:['Easier to get started','gg-g'],training_available:['Training available','gg-g'],early_career_with_training:['Early career, with training','gg-g'],standard:['','']};
 const KIND={employer_or_authorized_recruitment:'Employer’s own posting',employer_branded_job_board_post:'Employer’s ad on a job site',client_posted_request:'Posted by a household on Care.com'};
 window.jtJobTabs=cur=>'<nav class="gg-tabs" aria-label="Job lists"><span class="gg-lab">Job lists:</span>'+[['gigs','All Jamestown jobs','Every advertised job and gig'],['jobs','Town, school & state job boards','Updated every morning']].map(([k,l,d])=>k===cur?'<button type="button" class="on" aria-current="page"><b>'+l+'</b><small>'+d+'</small></button>':'<button type="button" data-go="'+k+'"><b>'+l+'</b><small>'+d+'</small></button>').join('')+'</nav>';
 const SEL='table.gg-t,table.jb-t';
 const label=()=>document.querySelectorAll(SEL).forEach(t=>{const h=[...t.querySelectorAll('thead th')].map(th=>th.textContent.trim());t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(h[i]&&!td.hasAttribute('data-label'))td.setAttribute('data-label',h[i])}))});
 new MutationObserver(ms=>{for(const m of ms)if(m.addedNodes.length){label();break}}).observe(document.documentElement,{childList:true,subtree:true});
 function load(){if(asked)return;asked=true;fetch('data/gigs.json?d='+new Date().toISOString().slice(0,10)).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{D=j;fill()}).catch(()=>{err=true;asked=false;fill()})}
 function fill(){const root=document.getElementById('ggRoot');if(!root)return;const B=root.querySelector('#ggBody');
  if(err){B.innerHTML='<p>Couldn’t load the list. <button type="button" id="ggRetry">Retry</button></p>';return}
  if(!D){B.innerHTML='<p>Loading…</p>';return}
  const C=root.querySelector('#ggCat');if(C.options.length<2)C.innerHTML='<option value="">All kinds of work</option>'+uniq(D.jobs.map(j=>j.category)).map(c=>'<option>'+X(c)+'</option>').join('');
  C.value=st.cat;root.querySelector('#ggEasy').value=st.easy;
  const q=st.q.trim().toLowerCase(),has=o=>!q||JSON.stringify(o).toLowerCase().includes(q);
  const jobs=D.jobs.filter(j=>live(j)&&(!st.cat||j.category===st.cat)&&(!st.easy||j.priority!=='standard')&&has(j)).sort((a,b)=>((a.priority==='standard')-(b.priority==='standard'))||a.category.localeCompare(b.category)||a.employer.localeCompare(b.employer));
  root.querySelector('#ggCount').textContent=jobs.length+' advertised job'+(jobs.length===1?'':'s')+(D.listing_check?' · closed listings removed daily, last check '+D.listing_check.date:'');
  let h='<div class="gg-scroll"><table class="gg-t"><thead><tr><th>Job</th><th>Pay · hours</th><th>What it takes</th><th>How to apply</th></tr></thead><tbody>'
   +(jobs.map(j=>{const p=PRI[j.priority]||PRI.standard;const url=j.application_url||j.source_url;
    return '<tr><td><a href="'+U(url)+'" target="_blank" rel="noopener"><b>'+X(j.title)+'</b></a><br><span class="gg-s">'+X(j.employer)+' · '+X(j.category)+'</span>'+(p[0]?'<br><span class="'+p[1]+'">'+p[0]+'</span>':'')+(j.location_scope&&!/Jamestown worksite/i.test(j.location_scope)?'<br><span class="gg-s">'+X(j.location_scope)+'</span>':'')+'</td>'
    +'<td>'+(NP(j.pay_text)?'<span class="gg-s">Pay not published</span>':X(j.pay_text))+(NP(j.hours)?'':'<br><span class="gg-s">'+X(j.hours)+'</span>')+(j.deadline?'<br>Apply by '+X(dl(j.deadline)):'')+'</td>'
    +'<td>'+X(j.requirements||'')+(NP(j.arrangement)||/W-2\/1099 form not published/.test(j.arrangement)?'':'<br><span class="gg-s">'+X(j.arrangement)+'</span>')+'</td>'
    +'<td><a class="gg-apply" href="'+U(url)+'" target="_blank" rel="noopener">'+(j.source_kind==='client_posted_request'?'Reply on Care.com':'Apply on the employer’s page')+'</a><br><span class="gg-s">'+X(KIND[j.source_kind]||'')+'</span>'+(NP(j.phone)?'':'<br>'+tel(j.phone))+(NP(j.email)?'':'<br><a href="mailto:'+X(j.email)+'">'+X(j.email)+'</a>')+(j.contact_note?'<br><span class="gg-s gg-n">'+X(j.contact_note)+'</span>':'')+'</td></tr>'}).join('')||'<tr><td colspan="4">No jobs match.</td></tr>')+'</tbody></table></div>';
  if(!st.cat&&!st.easy){
   const P=(D.pipelines||[]).filter(has),L=(D.leads||[]).filter(has);
   if(P.length)h+='<h3>Always taking applications</h3><ul class="gg-l">'+P.map(p=>'<li><a href="'+U(p.source_url)+'" target="_blank" rel="noopener"><b>'+X(p.employer)+': '+X(p.title)+'</b></a>'+(NP(p.pay_text)?'':' · '+X(p.pay_text))+(NP(p.phone)?'':' · '+tel(p.phone))+(NP(p.email)?'':' · <a href="mailto:'+X(p.email)+'">'+X(p.email)+'</a>')+(p.notes?'<br><span class="gg-s">'+X(p.notes)+'</span>':'')+'</li>').join('')+'</ul>';
   if(L.length)h+='<h3>Not yet confirmed</h3><p class="gg-s">Seen in job ads for Jamestown, but we couldn’t confirm the ad is still open. Check with the employer before applying.</p><ul class="gg-l">'+L.map(l=>'<li><a href="'+U(l.source_url)+'" target="_blank" rel="noopener">'+X(l.employer)+': '+X(l.title)+'</a>'+(NP(l.pay_text)?'':' · '+X(l.pay_text))+(l.reason?'<br><span class="gg-s">'+X(l.reason)+'</span>':'')+'</li>').join('')+'</ul>'}
  B.innerHTML=h}
 window.vGigs=function(){setTimeout(()=>{load();const r=document.getElementById('ggRoot');if(r)r.querySelector('#ggQ').value=st.q;fill()},0);
  return '<section class="box gg" id="ggRoot">'+jtJobTabs('gigs')+'<h2>Jamestown Jobs &amp; Paid Gigs</h2>'
   +'<p class="gg-s">Every paid job and gig we found advertised for Jamestown on Nov. 12, 2026: restaurants, schools, the Town, marinas, landscaping, the arts and household help. Jobs that are easier to start come first.</p>'
   +'<p class="gg-note"><b>Public records, verify when needed.</b> Drawn from employers’ own pages and employer-posted ads. A posting doesn’t guarantee the job is still open, and pay, hours and terms can change: confirm with the employer before relying on a listing. Household listings come from public Care.com requests and carry no contact details. Jamestown Island News is not the employer and does not take applications.</p>'
   +'<div class="gg-f"><input type="search" id="ggQ" placeholder="Search a job, employer or skill" aria-label="Search Jamestown jobs">'
   +'<select id="ggCat" aria-label="Kind of work"><option value="">All kinds of work</option></select>'
   +'<select id="ggEasy" aria-label="Experience"><option value="">Any experience</option><option value="1">Easier to start or training provided</option></select>'
   +'<button type="button" id="ggClear">Clear</button> <span id="ggCount" class="gg-s"></span></div>'
   +'<div id="ggBody"></div></section>'};
 document.addEventListener('input',e=>{const t=e.target;if(!t.closest||!t.closest('#ggRoot'))return;const m={ggQ:'q',ggCat:'cat',ggEasy:'easy'}[t.id];if(!m)return;st[m]=t.value;fill()});
 document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#ggRoot'))return;
  if(t.id==='ggRetry'){err=false;load();fill()}else if(t.id==='ggClear'){Object.assign(st,{q:'',cat:'',easy:''});document.getElementById('ggQ').value='';fill()}});
 const css=document.createElement('style');css.textContent=`
#view #ggRoot{display:block!important}
#ggRoot>*{width:auto;max-width:100%}
.gg-tabs{display:flex;flex-wrap:wrap;gap:6px;align-items:stretch;margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #D4ECF533}
.gg-tabs .gg-lab{align-self:center;color:#B9CAD6;font-weight:700;margin-right:2px}
.gg-tabs button{all:unset;cursor:pointer;display:flex;flex-direction:column;padding:4px 10px;border:1px solid #D4ECF566;border-radius:5px;color:#D4ECF5;line-height:1.25}
.gg-tabs button small{font-size:.8em;color:#B9CAD6}
.gg-tabs button:hover,.gg-tabs button:focus-visible{border-color:#E9C46A;outline:none}
.gg-tabs button.on{background:#E9C46A;border-color:#E9C46A;color:#0A1428;cursor:default}
.gg-tabs button.on small{color:#0A1428}
@media (max-width:640px){
 .gg-tabs{display:grid;grid-template-columns:1fr 1fr;gap:5px}.gg-tabs .gg-lab{grid-column:1/-1}
 :is(table.gg-t,table.jb-t){display:block;width:100%!important;min-width:0!important}
 :is(table.gg-t,table.jb-t) thead{display:none}
 :is(table.gg-t,table.jb-t) tbody,:is(table.gg-t,table.jb-t) tr{display:block}
 :is(table.gg-t,table.jb-t) tr{border:1px solid #D4ECF533;border-radius:6px;padding:6px 8px;margin:0 0 8px}
 :is(table.gg-t,table.jb-t) td{display:block;border:0!important;padding:3px 0!important;white-space:normal!important;min-width:0!important}
 :is(table.gg-t,table.jb-t) td:empty{display:none!important}
 :is(table.gg-t,table.jb-t) td[data-label]:not(:first-child)::before{content:attr(data-label);display:block;font-size:.8em;font-weight:700;color:#B9CAD6;text-transform:uppercase;letter-spacing:.03em}
 #ggRoot .gg-scroll{overflow:visible}
}
#ggRoot .gg-f{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
#view #ggRoot .gg-f>input[type=search]{width:auto!important;flex:1 1 220px!important;min-width:0;height:30px;padding:0 8px;border:1px solid #D4ECF544;border-radius:4px;background:#0A1428;color:#fff;margin:0!important}
#view #ggRoot .gg-f>select{width:auto!important;flex:0 1 230px!important;height:30px;padding:0 6px;border:1px solid #D4ECF544;border-radius:4px;background:#0A1428;color:#fff;margin:0!important}
#ggRoot .gg-f button,#ggRoot #ggRetry{all:unset;cursor:pointer;padding:3px 8px;border:1px solid #D4ECF566;border-radius:4px;color:#D4ECF5}
#ggRoot .gg-s{color:#B9CAD6}#ggRoot .gg-n{font-style:italic}#ggRoot .gg-g{color:#8FD694;font-weight:700}
#ggRoot .gg-note{margin:4px 0 6px;padding-left:8px;border-left:2px solid #E9C46A;color:#D4ECF5}
#ggRoot .gg-scroll{overflow-x:auto}
#ggRoot table.gg-t{width:100%;border-collapse:collapse}
#ggRoot .gg-t th{text-align:left;color:#B9CAD6;border-bottom:1px solid #D4ECF544;padding:3px 6px;font-weight:600}
#ggRoot .gg-t td{border-bottom:1px solid #D4ECF51f;padding:4px 6px;vertical-align:top}
#ggRoot ul.gg-l{margin:4px 0;padding-left:18px}#ggRoot ul.gg-l li{margin:4px 0}
#ggRoot h3{margin:12px 0 4px}#ggRoot a.gg-apply{font-weight:700;color:#E9C46A}#ggRoot a{color:#D4ECF5}`;document.head.appendChild(css);
 if(typeof STATE!=='undefined'&&STATE.view==='gigs'&&!document.getElementById('ggRoot')&&typeof render==='function')render();
})();
