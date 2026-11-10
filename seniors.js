/* Seniors tab (Jamestown): one simple page for island seniors and their families.
   Built from what the site already has: the Senior Help Network research (data/help.json, checked Nov. 10, 2026),
   the event calendar (senior events next 14 days) and the Help & Benefits tab (opened pre-filtered through window.hpOpen).
   Free for everyone. Nothing typed or chosen here is saved or sent anywhere. */
(function(){
 const X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tel=p=>'<a class="sn-tel" href="tel:+1'+p.replace(/\D/g,'').slice(-10)+'">'+p+'</a>';
 const TZ='America/New_York',ymd=d=>d.toLocaleDateString('en-CA',{timeZone:TZ});
 const CALL=[
  ['Jamestown Senior Services','Lunch, classes, trips, help with forms and benefits. Start here.','401-423-2658'],
  ['Fire Dept. COAST','Free rides to medical appointments, home safety checks, check-in visits, loaner equipment like walkers.','401-423-5904'],
  ['Jamestown Village','Volunteer rides, errands, shopping, light chores, help with phones and computers.','401-661-7203'],
  ['Jamestown Community Food Pantry','Groceries; home delivery or curbside pickup can be arranged.','401-560-4080'],
  ['The POINT (state aging help line)','Free help finding home care, Medicare counseling, caregiver support and more, for 55+.','401-462-4444'],
  ['Library tech help','One-on-one appointments for phones, tablets and computers.','401-423-7280']];
 const NEEDS=[['Rides','Transportation'],['Meals & food','Free and discounted meals'],['Meals delivered','Meal delivery'],['Help at home','Household assistance'],['Home repairs & safety','Home repairs'],
  ['Health & Medicare','Healthcare support'],['Visits & company','Friendly visiting'],['Caregiver help','Caregiver support'],['Tech help','Technology assistance'],['Legal & paperwork','Legal and administrative help'],
  ['Emergency help','Emergency assistance'],['Pets','Pet assistance'],['End of life','End-of-life support']];
 const open=o=>{if(window.hpOpen)hpOpen(Object.assign({town:'Jamestown',zip:'',age:'',cost:'',home:false,ride:false,role:'',strict:false,q:'',closed:false},o))};
 function events(){const L=(typeof up!=='undefined'&&Array.isArray(up))?up:[];const t=ymd(new Date()),e=ymd(new Date(Date.now()+14*864e5));
  return L.filter(x=>x.genre!=='support'&&x.date>=t&&x.date<e&&(/55|senior|older adult/i.test((x.ages||'')+' '+(x.src||''))||/medicare|medicaid/i.test(x.artists||'')))}
 window.vSeniors=function(){
  const day=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const ev=events();
  if(!ev.length&&(window.__snTry=(window.__snTry||0)+1)<8)setTimeout(()=>{try{if(STATE.view==='seniors'&&events().length)render()}catch(_){}},700);
  return '<section class="box sn"><div class="sn-head">'+(window.helpBar?helpBar('seniors'):'')+'<h2>Seniors in Jamestown</h2><p>Help, programs and benefits for island seniors and the people who care for them. Free to use.</p>'+
   '<p class="sn-urgent"><b>Emergency? Call <a class="sn-tel" href="tel:911">911</a>.</b> Crisis or feeling low, call or text <a class="sn-tel" href="tel:988">988</a>. Any help, any time: <a class="sn-tel" href="tel:211">211</a>.</p></div>'+
   '<h3 class="sn-h">Who to call</h3><div class="sn-call">'+CALL.map(c=>'<div class="sn-c"><b>'+X(c[0])+'</b><span>'+X(c[1])+'</span>'+tel(c[2])+'</div>').join('')+'</div>'+
   '<h3 class="sn-h">What do you need?</h3><p class="sn-p">Tap one to see every service that serves Jamestown.</p><div class="sn-needs">'+
    NEEDS.map(n=>'<button type="button" data-snneed="'+X(n[1])+'">'+X(n[0])+'</button>').join('')+'<button type="button" data-snneed="">See everything</button></div>'+
   '<h3 class="sn-h">Benefits that can save you money</h3><p class="sn-p">Property tax breaks, heating help, Medicare savings, prescription help, food benefits and more. These are programs to check, not a promise you qualify.</p>'+
   '<div class="sn-needs"><button type="button" data-snben="A">Senior benefits</button><button type="button" data-snben="B">Income-based help</button><button type="button" data-snben="energy">Heating, energy &amp; repairs</button></div>'+
   '<h3 class="sn-h">Senior events, next two weeks</h3>'+(ev.length?'<ul class="sn-ev">'+ev.map(e=>'<li><b>'+X(day(e.date))+(e.time?' · '+X(e.time):'')+'</b> '+(/^https?:/.test(e.url||'')?'<a href="'+X(e.url)+'" target="_blank" rel="noopener noreferrer">'+X(e.artists)+'</a>':X(e.artists))+(e.venue?' <span>· '+X(e.venue)+'</span>':'')+(e.price?' <span>· '+X(e.price)+'</span>':'')+'</li>').join('')+'</ul>':'<p class="sn-p">No senior events listed in the next two weeks. Call Senior Services for the current schedule.</p>')+
   '<p class="sn-p"><button type="button" class="sn-link" data-go="cal">Full event calendar ›</button> · <button type="button" class="sn-link" data-go="mh">Mental health &amp; support groups ›</button></p>'+
   '<p class="sn-foot">From official published information, checked Nov. 10, 2026. Programs and hours change: call before you go. Independent and privately run by Jamestown Island News; not a government agency.</p></section>'};
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-snneed],[data-snben]');if(!b||!b.closest('.sn'))return;e.preventDefault();
  if(b.dataset.snben!=null)open({tab:'benefits',view:b.dataset.snben,bcat:''});else open({tab:'find',cat:b.dataset.snneed})});
 const css=document.createElement('style');css.textContent=`
.sn{padding-bottom:16px}.sn-head{padding:14px 18px 4px}.sn-head h2{margin:12px 0 6px;font:700 clamp(20px,3.4vw,26px)/1.15 "Playfair Display",Georgia,serif;color:#D4ECF5}.sn-head p{margin:0 0 6px;font:400 14px/1.45 Georgia,serif;color:#EEE9E5}
.sn-urgent{padding:10px 12px;border-left:4px solid #B5123A;background:#ffffff0d}.sn-urgent b{color:#fff}.sn-tel{font-weight:800;color:#fff!important;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;font-size:15px}
.sn-h{margin:14px 18px 6px;font:800 13px/1.3 "Libre Franklin",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#D4ECF5}.sn-p{margin:5px 18px;font:400 14px/1.45 Georgia,serif;color:#EEE9E5}
.sn-call{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin:0 18px}.sn-c{display:flex;flex-direction:column;gap:3px;padding:10px 12px;border:1px solid #D4ECF544;border-radius:6px;background:#ffffff08}
.sn-c b{font:700 16px/1.25 "Playfair Display",Georgia,serif;color:#fff}.sn-c span{font:400 14px/1.4 Georgia,serif;color:#EEE9E5}
.sn-needs{display:flex;flex-wrap:wrap;gap:8px;margin:8px 18px}.sn-needs button{all:unset;cursor:pointer;padding:7px 11px;border-radius:5px;border:1px solid #D4ECF566;font:700 14px/1.1 "Libre Franklin",system-ui,sans-serif;color:#fff}.sn-needs button:hover{background:#D4ECF522}
.sn-ev{margin:5px 18px;padding-left:18px;font:400 14px/1.5 Georgia,serif;color:#EEE9E5}.sn-ev b{color:#fff}.sn-ev span{color:#C9D6DF}.sn-ev a{color:#D4ECF5}
.sn-link{all:unset;cursor:pointer;font:700 16px/1.3 "Libre Franklin",system-ui,sans-serif;color:#D4ECF5;text-decoration:underline}.sn-foot{margin:16px 18px 0;font:italic 13px/1.5 Georgia,serif;color:#C9D6DF}
.sn a:focus-visible,.sn button:focus-visible{outline:3px solid #E9C46A;outline-offset:2px}
@media(max-width:560px){.sn-head{padding:18px 12px 6px}.sn-h,.sn-p,.sn-call,.sn-needs,.sn-ev,.sn-foot{margin-left:8px;margin-right:8px}.sn-call{grid-template-columns:minmax(0,1fr)}}`;document.head.appendChild(css);
 try{if(typeof STATE!=='undefined'&&STATE.view==='seniors'&&typeof render==='function')render()}catch(_){}
})();
