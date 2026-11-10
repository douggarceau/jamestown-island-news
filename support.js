/* "Help & Support This Week" box at the top of the Jamestown Event Calendar.
   Dated help listings (food pantries, Medicare/Medicaid counseling, thrift shop, tax help, clinics) come from the calendar itself, next 7 days only.
   Standing help lines come from the Senior Help Network research (data/help.json, checked Nov. 10, 2026).
   Recovery meetings are not dated here: the Jamestown AA/Al-Anon listings are old, so they point to the Mental Health page with a "call to confirm" note. */
(function(){
 const X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tel=p=>'<a class="sp-tel" href="tel:+1'+p.replace(/\D/g,'')+'">'+p+'</a>';
 const HELP=/food pantry|pantry hours|pantry appointments|medicaid|medicare|benefit counsel|tax (help|prep)|vita\b|fuel|heating assistance|energy assistance|flu (clinic|shot)|vaccin|blood pressure|senior lunch|community (lunch|dinner|meal)|soup kitchen|free (lunch|dinner|meal)|thanksgiving (dinner|meal)|thrift|coat drive|free clothing|caregiver support|grief|bereavement|cancer support|hearing (test|screen)|legal (aid|clinic)/i;
 const NOT=/donation hours|donate|volunteer(s)? needed|fundrais|preschool/i;
 const TZ='America/New_York',ymd=d=>d.toLocaleDateString('en-CA',{timeZone:TZ});
 window.jtHelpBox=function(up){
  const today=ymd(new Date()),end=ymd(new Date(Date.now()+7*864e5));
  const L=(up||[]).filter(e=>e.genre!=='support'&&e.date>=today&&e.date<end&&HELP.test(e.artists||'')&&!NOT.test((e.artists||'')+' '+(e.blurb||'')));
  const day=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const rows=L.map(e=>'<li><b>'+X(day(e.date))+(e.time?' · '+X(e.time):'')+'</b> '+(/^https?:/.test(e.url||'')?'<a href="'+X(e.url)+'" target="_blank" rel="noopener noreferrer">'+X(e.artists)+'</a>':X(e.artists))+(e.venue?' <span>· '+X(e.venue)+'</span>':'')+'</li>').join('');
  return '<details class="sp-box" open><summary><b>Help &amp; Support This Week</b><span>Food, benefits help, rides and support on the island. Free or low cost.</span></summary>'+
   (rows?'<ul class="sp-list">'+rows+'</ul>':'<p class="sp-p">No dated help listings in the next 7 days. Call the numbers below.</p>')+
   '<p class="sp-p"><b>Call any weekday:</b></p><ul class="sp-list">'+
   '<li><b>Senior Services</b> (lunch, programs, help with forms) '+tel('401-423-2658')+'</li>'+
   '<li><b>Fire Dept. COAST</b> (free medical rides, home check-ins, equipment loans) '+tel('401-423-5904')+'</li>'+
   '<li><b>Jamestown Community Food Pantry</b> (pickup or home delivery) '+tel('401-560-4080')+'</li>'+
   '<li><b>Jamestown Village</b> (volunteer rides, errands, tech help) '+tel('401-661-7203')+'</li>'+
   '<li><b>Recovery:</b> AA and Al-Anon meet weekly at St. Matthew’s, 87 Narragansett Ave. Times aren’t confirmed: call the RI AA office '+tel('401-438-8860')+' or see <button type="button" class="sp-link" data-go="mh">Mental Health ›</button></li>'+
   '</ul><p class="sp-p">More: <button type="button" class="sp-link" data-go="help">Help &amp; Benefits ›</button> · Crisis, call or text <a class="sp-tel" href="tel:988">988</a> · Any help, <a class="sp-tel" href="tel:211">211</a></p></details>'};
 const css=document.createElement('style');css.textContent=`
.sp-box{margin:0 0 14px;border:2px solid #2F5B4F;border-left:6px solid #2F5B4F;border-radius:8px;background:#2F5B4F22;padding:0 14px 10px}
.sp-box>summary{list-style:none;cursor:pointer;display:flex;flex-direction:column;gap:3px;padding:12px 0 6px}.sp-box>summary::-webkit-details-marker{display:none}
.sp-box>summary b{font:700 21px/1.2 "Playfair Display",Georgia,serif;color:#fff}.sp-box>summary span{font:400 15px/1.4 Georgia,serif;color:#EEE9E5}
.sp-list{margin:4px 0 8px;padding-left:18px;font:400 16px/1.5 Georgia,serif;color:#EEE9E5}.sp-list li{margin:3px 0}.sp-list b{color:#fff}.sp-list span{color:#C9D6DF}.sp-list a{color:#D4ECF5}
.sp-p{margin:6px 0;font:400 16px/1.5 Georgia,serif;color:#EEE9E5}.sp-tel{font-weight:800;color:#fff!important;text-decoration:underline;white-space:nowrap}
.sp-link{all:unset;cursor:pointer;font:700 15px/1.3 "Libre Franklin",system-ui,sans-serif;color:#D4ECF5;text-decoration:underline}
.sp-box a:focus-visible,.sp-link:focus-visible,.sp-box summary:focus-visible{outline:3px solid #E9C46A;outline-offset:2px}`;document.head.appendChild(css);
 try{if(typeof STATE!=='undefined'&&STATE.view==='cal'&&typeof render==='function')render()}catch(_){}
})();
