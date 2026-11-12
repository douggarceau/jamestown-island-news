/* Town Government: Jamestown officials, contacts, meetings, projects, budget, boards and records.
   Data: data/gov.json (research snapshot from official Town, school, fire, library and state sources).
   Compact rows, no boxes. Every row links to its official source. */
(function(){
 let D=null,asked=false,err=false;
 const st={tab:'contacts',q:'',dept:'',lim:150};
 const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const U=u=>{const t=String(u==null?'':u);return /^(javascript|data|vbscript):/i.test(t.replace(/[\s\x00-\x1f]/g,''))?'#':X(t)}; // links: never allow script URLs from outside data
 const uniq=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y));
 const NP=v=>!v||/^not (published|confirmed)/i.test(v);
 const src=(u,t)=>u?'<a class="gv-src" href="'+U(u)+'" target="_blank" rel="noopener">'+(t||'source')+'</a>':'';
 const money=n=>n==null?'':'$'+Math.round(n).toLocaleString('en-US');
 const day=s=>{if(!s)return '';const t=new Date(s.length<=10?s+'T12:00:00':s);return isNaN(t)?s:t.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})};
 const time=s=>{if(!s||String(s).length<=10)return 'Time not posted';const t=new Date(s);return isNaN(t)?'':t.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
 const TABS=[['contacts','People & contacts'],['meetings','Meetings'],['projects','Projects & decisions'],['money','Budget & taxes'],['bodies','Offices & boards'],['records','Records & services']];
 function load(){if(asked)return;asked=true;fetch('data/gov.json?v=20261112b').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{D=j;fill()}).catch(()=>{err=true;asked=false;fill()})}
 const has=(o,q)=>!q||JSON.stringify(o).toLowerCase().includes(q);

 function contacts(q){
  const all=D.contacts;const depts=uniq(all.flatMap(c=>c.roles.map(r=>r.department)));
  const rows=all.filter(c=>(!st.dept||c.roles.some(r=>r.department===st.dept))&&has([c.name,c.roles,c.email,c.phone],q))
   .sort((a,b)=>(a.roles[0].department+a.name).localeCompare(b.roles[0].department+b.name));
  const sel='<select id="gvDept" aria-label="Department or board"><option value="">All departments and boards</option>'+depts.map(d=>'<option'+(d===st.dept?' selected':'')+'>'+X(d)+'</option>').join('')+'</select>';
  return [rows.length,sel,'<div class="gv-scroll"><table class="gv-t"><thead><tr><th>Name</th><th>Position · department</th><th>Phone</th><th>Email</th></tr></thead><tbody>'+rows.slice(0,st.lim).map(c=>'<tr><td><b>'+X(NP(c.name)?'Office mailbox':c.name)+'</b></td><td>'+c.roles.map(r=>X(r.position)+' <span class="gv-s">· '+X(r.department)+'</span>').join('<br>')+(c.notes&&c.notes.length?'<br><span class="gv-s gv-n">'+X(c.notes.filter(n=>!/^https?:/.test(n)&&!/^Published incumbent/.test(n)).join(' '))+'</span>':'')+' '+src(c.source)+'</td><td class="gv-nw">'+(NP(c.phone)?'<span class="gv-s">—</span>':'<a href="tel:'+X(c.phone.replace(/[^0-9]/g,'').slice(0,10))+'">'+X(c.phone)+'</a>')+'</td><td>'+(NP(c.email)?'<span class="gv-s">—</span>':'<a href="mailto:'+X(c.email)+'">'+X(c.email)+'</a>')+'</td></tr>').join('')+'</tbody></table></div>'+(rows.length>st.lim?'<button type="button" id="gvMore">Show more</button>':'')+'<p class="gv-s">“—” means the office did not publish it. Elected rosters are as the Town and school websites publish them; confirm November 2026 election results and swearing-in before relying on them.</p>']}

 function meetings(q){
  const up=D.meetings.filter(m=>has(m,q)).sort((a,b)=>a.start_local.localeCompare(b.start_local));
  const fut=up.filter(m=>m.start_local.slice(0,10)>=today),past=up.filter(m=>m.start_local.slice(0,10)<today).reverse();
  const row=m=>'<tr'+(m.status==='cancelled'?' class="gv-x"':'')+'><td class="gv-nw">'+day(m.start_local)+'<br><span class="gv-s">'+time(m.start_local)+'</span></td><td><b>'+X(m.body.replace(/^\*+/,''))+'</b>'+(m.status==='cancelled'?' <span class="gv-tag">Cancelled</span>':'')+'<br><span class="gv-s">'+X(NP(m.location)?'Location not listed':m.location)+'</span>'+(m.attachments||[]).slice(0,3).map(a=>' '+src(a.url||a.source,X(a.title||'agenda'))).join('')+' '+src(m.source,'calendar')+'</td></tr>';
  const recs=D.recent_meeting_record_index.filter(r=>has([r.title,r.category_paths],q)).sort((a,b)=>(b.display_date||'').localeCompare(a.display_date||''));
  return [fut.length,'','<p class="gv-s">Dates come from the Town calendar, school calendar and posted agendas; nothing is assumed from a regular schedule. Read the latest posted agenda before attending.</p>'
   +'<h3>Coming up ('+fut.length+')</h3><div class="gv-scroll"><table class="gv-t"><tbody>'+(fut.map(row).join('')||'<tr><td>None found.</td></tr>')+'</tbody></table></div>'
   +(past.length?'<h3>Earlier this month</h3><div class="gv-scroll"><table class="gv-t"><tbody>'+past.map(row).join('')+'</tbody></table></div>':'')
   +'<h3>Recent agendas, minutes and videos ('+recs.length+')</h3><ul class="gv-l">'+recs.slice(0,st.lim).map(r=>'<li><a href="'+U(r.source)+'" target="_blank" rel="noopener">'+X(r.title)+'</a> <span class="gv-s">'+X(((r.category_paths||[])[0]||[]).join(' › '))+'</span></li>').join('')+'</ul>'+(recs.length>st.lim?'<button type="button" id="gvMore">Show more</button>':'')]}

 function projects(q){
  const rows=D.projects_and_decisions.filter(p=>has(p,q)).sort((a,b)=>(b.record_date||'').localeCompare(a.record_date||''));
  return [rows.length,'','<p class="gv-s">“Approved” means a recorded vote. “Agenda-listed” means proposed business. Grant awards, appropriations, contract ceilings and actual spending are different amounts.</p><ul class="gv-l gv-p">'+rows.map(p=>'<li><b>'+X(p.title)+'</b> <span class="gv-s">'+X(p.responsible_body)+(p.record_date?' · '+day(p.record_date):'')+'</span><br><span class="gv-st">'+X(p.status)+'.</span> '+X(p.summary)+(p.amount_usd!=null?' <b>'+money(p.amount_usd)+'</b>'+(p.amount_type?' <span class="gv-s">('+X(p.amount_type)+')</span>':''):'')+(p.next_verification?'<br><span class="gv-s gv-n">Still to confirm: '+X(p.next_verification)+'</span>':'')+' '+src(p.source)+'</li>').join('')+'</ul>']}

 function money_(q){
  const b=D.budgets.filter(x=>has(x,q)),r=D.rates_and_financial_links.filter(x=>has(x,q));
  return [b.length,'','<div class="gv-scroll"><table class="gv-t"><thead><tr><th>Item</th><th class="gv-r">Amount</th><th>Period · basis</th></tr></thead><tbody>'+b.map(x=>'<tr><td><b>'+X(x.name)+'</b></td><td class="gv-r gv-nw">'+money(x.amount_usd)+'</td><td><span class="gv-s">'+X(x.period)+' · '+X(x.basis)+'</span> '+src(x.source)+'</td></tr>').join('')+'</tbody></table></div>'
   +(D.budget_reconciliation?'<p class="gv-s">'+X(D.budget_reconciliation.explanation)+' '+X(D.budget_reconciliation.individual_payroll||'')+' '+src(D.budget_reconciliation.source)+'</p>':'')
   +'<h3>Tax rates and finance links</h3><ul class="gv-l">'+r.map(x=>'<li><b>'+X(x.name)+'</b>: '+X(x.detail)+' '+src(x.source)+'</li>').join('')+'</ul>']}

 function bodies(q){
  const g=D.government_breakdown.filter(x=>has(x,q)),reg=D.public_body_registry.filter(x=>has(x,q));
  return [g.length,'','<ul class="gv-l gv-p">'+g.map(x=>'<li><b>'+X(x.name)+'</b> <span class="gv-s">'+X(x.type)+'</span><br>'+X(x.function)+((x.leadership||[]).length?'<br><span class="gv-s">Led by: '+X(x.leadership.join('; '))+'</span>':'')+(x.notes?'<br><span class="gv-s gv-n">'+X(x.notes)+'</span>':'')+' '+src(x.source)+'</li>').join('')+'</ul>'
   +'<h3>Every Jamestown public body on the state open-meetings portal ('+reg.length+')</h3><p class="gv-s">Some are inactive or historical; the portal does not say which.</p><ul class="gv-l gv-cols">'+reg.map(x=>'<li><a href="'+U(x.source)+'" target="_blank" rel="noopener">'+X(x.name)+'</a></li>').join('')+'</ul>']}

 function records(q){
  const s=D.public_safety.filter(x=>has(x,q)),a=D.announcements_and_service_notices.filter(x=>has(x,q)),w=D.records_and_publication_workflow.filter(x=>has(x,q));
  return [s.length+a.length+w.length,'','<h3>Emergencies and public safety</h3><p><b>Emergency: 911.</b> Police non-emergency: <a href="tel:4014231212">401-423-1212</a>. Fire/EMS station: <a href="tel:4014230062">401-423-0062</a>.</p><ul class="gv-l">'+s.map(x=>'<li><b>'+X(x.name)+'</b>: '+X(x.detail)+' '+src(x.source)+'</li>').join('')+'</ul>'
   +'<h3>Notices and announcements</h3><ul class="gv-l">'+a.map(x=>'<li><b>'+X(x.title)+'</b> <span class="gv-s">'+(x.relevant_date&&!/^not published/i.test(x.relevant_date)?X(x.relevant_date)+' · ':'')+X(x.status)+'</span><br>'+X(x.summary)+' '+src(x.source)+'</li>').join('')+'</ul>'
   +'<h3>How to get public records</h3><ul class="gv-l">'+w.map(x=>'<li><b>'+X(x.name)+'</b>: '+X(x.instructions)+' '+src(x.source)+'</li>').join('')+'</ul>'
   +'<p class="gv-s">Town job openings are on the <a href="#" data-go="jobs">Jobs</a> tab, refreshed every morning.</p>']}

 const FN={contacts,meetings,projects,money:money_,bodies,records};
 function fill(){const root=document.getElementById('gvRoot');if(!root)return;const B=root.querySelector('#gvBody');
  if(err){B.innerHTML='<p>Couldn’t load the government directory. <button type="button" id="gvRetry">Retry</button></p>';return}
  if(!D){B.innerHTML='<p>Loading…</p>';return}
  const q=st.q.trim().toLowerCase();const [n,extra,html]=FN[st.tab](q);
  root.querySelector('#gvExtra').innerHTML=extra;root.querySelector('#gvCount').textContent=q?n+' match'+(n===1?'':'es'):'';
  root.querySelectorAll('[data-gvtab]').forEach(b=>b.classList.toggle('on',b.dataset.gvtab===st.tab));
  B.innerHTML=html}
 window.vGov=function(){setTimeout(()=>{load();const r=document.getElementById('gvRoot');if(r)r.querySelector('#gvQ').value=st.q;fill()},0);
  return '<section class="box gv" id="gvRoot"><h2>Jamestown Town Government</h2>'
   +'<p class="gv-note"><b>Public records, verify when needed.</b> This independent directory is compiled from public records and official sources: the Town of Jamestown, the Jamestown schools, the Jamestown Fire Department, the library and state agencies. It is not affiliated with or endorsed by the Town. Names, roles, contacts, meetings and projects change: confirm with the responsible office before relying on anything here. Listed contacts are the ones published for official business; nothing missing has been guessed. Snapshot as of Nov. 11, 2026.</p>'
   +'<div class="gv-tabs">'+TABS.map(([k,l])=>'<button type="button" data-gvtab="'+k+'">'+l+'</button>').join('')+'</div>'
   +'<div class="gv-f"><input type="search" id="gvQ" placeholder="Search names, offices, projects, meetings" aria-label="Search government"><span id="gvExtra"></span><button type="button" id="gvClear">Clear</button> <span id="gvCount" class="gv-s"></span></div>'
   +'<div id="gvBody"></div></section>'};
 document.addEventListener('input',e=>{const t=e.target;if(!t.closest||!t.closest('#gvRoot'))return;
  if(t.id==='gvQ')st.q=t.value;else if(t.id==='gvDept')st.dept=t.value;else return;st.lim=150;fill()});
 document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#gvRoot'))return;
  const tb=t.closest('[data-gvtab]');if(tb){st.tab=tb.dataset.gvtab;st.lim=150;fill();return}
  if(t.id==='gvMore'){st.lim+=300;fill()}else if(t.id==='gvRetry'){err=false;load();fill()}
  else if(t.id==='gvClear'){st.q='';st.dept='';document.getElementById('gvQ').value='';st.lim=150;fill()}});
 const css=document.createElement('style');css.textContent=`
#view #gvRoot{display:block!important}
#gvRoot>*{width:auto;max-width:100%}
#gvRoot .gv-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}
#gvRoot .gv-tabs button{all:unset;cursor:pointer;padding:3px 9px;border:1px solid #D4ECF544;border-radius:4px;color:#D4ECF5}
#gvRoot .gv-tabs button.on{background:#D4ECF5;color:#0A1428;font-weight:700}
#gvRoot .gv-f{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
#gvRoot #gvExtra{display:contents}
#view #gvRoot .gv-f input[type=search]{width:auto!important;flex:1 1 220px!important;min-width:0;height:30px;padding:0 8px;border:1px solid #D4ECF544;border-radius:4px;background:#0A1428;color:#fff;margin:0!important}
#view #gvRoot .gv-f select{width:auto!important;flex:0 1 240px!important;height:30px;padding:0 6px;border:1px solid #D4ECF544;border-radius:4px;background:#0A1428;color:#fff;margin:0!important}
#gvRoot .gv-f button,#gvRoot #gvMore,#gvRoot #gvRetry{all:unset;cursor:pointer;padding:3px 8px;border:1px solid #D4ECF566;border-radius:4px;color:#D4ECF5}
#gvRoot #gvMore{display:block;margin:8px auto}
#gvRoot .gv-s{color:#B9CAD6}
#gvRoot .gv-n{font-style:italic}
#gvRoot .gv-st{color:#E9C46A}
#gvRoot .gv-note{margin:4px 0 6px;padding-left:8px;border-left:2px solid #E9C46A;color:#D4ECF5}
#gvRoot .gv-scroll{overflow-x:auto}
#gvRoot table.gv-t{width:100%;border-collapse:collapse}
#gvRoot .gv-t th{text-align:left;color:#B9CAD6;border-bottom:1px solid #D4ECF544;padding:3px 6px;font-weight:600}
#gvRoot .gv-t td{border-bottom:1px solid #D4ECF51f;padding:4px 6px;vertical-align:top}
#gvRoot .gv-nw{white-space:nowrap}
#gvRoot .gv-r{text-align:right}
#gvRoot tr.gv-x td{opacity:.6}
#gvRoot .gv-tag{color:#F4A261;font-weight:700}
#gvRoot .gv-src{font-size:.85em;color:#8FB8D0}
#gvRoot ul.gv-l{margin:4px 0;padding-left:18px}
#gvRoot ul.gv-l li{margin:3px 0}
#gvRoot ul.gv-p li{margin:6px 0}
#gvRoot ul.gv-cols{columns:2 260px}
#gvRoot h3{margin:10px 0 4px}
#gvRoot a{color:#D4ECF5}`;document.head.appendChild(css);
 if(typeof STATE!=='undefined'&&STATE.view==='gov'&&!document.getElementById('gvRoot')&&typeof render==='function')render();
})();
