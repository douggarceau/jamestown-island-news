/* "Help & Support This Week" box at the top of the Jamestown Event Calendar.
   Dated help listings (food pantries, Medicare/Medicaid counseling, thrift shop, tax help, clinics) come from the calendar itself, next 7 days only.
   Standing help lines come from the Senior Help Network research (data/help.json, checked Nov. 10, 2026).
   Recovery meetings: weekly times from the Rhode Island AA meeting list (rhodeisland-aa.org, entries updated 2025-2026) and RI Al-Anon (Aug. 2026). */
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
   '</ul><p class="sp-p"><b>Recovery meetings at St. Matthew’s, 87 Narragansett Ave.</b> (every week, open to anyone unless marked):</p><ul class="sp-list">'+
   '<li><b>Sun 4:30 pm</b> AA Time for Promises</li><li><b>Mon 6 am</b> AA Morning Glory · <b>6 pm</b> Al-Anon Live &amp; Let Live (for families)</li>'+
   '<li><b>Tue 5:15 pm</b> AA Happy Hour II</li><li><b>Wed 5:30 pm</b> AA Come to Believe</li>'+
   '<li><b>Thu 6 am</b> AA Morning Glory · <b>5:30 pm</b> AA Eleventh Step <span>(closed: for people who want to stop drinking)</span></li>'+
   '<li><b>Fri 5 pm</b> AA Happy Hour I</li><li><b>Sat 9 am</b> AA Jamestown Step Workshop</li>'+
   '<li><b>NA (Narcotics Anonymous):</b> no meetings on the island; nearest ones are on the <a href="https://gpana.org/?current-meeting-list=1" target="_blank" rel="noopener noreferrer">official NA list</a>, helpline '+tel('866-624-3578')+'</li>'+
   '<li><span>From the <a href="https://rhodeisland-aa.org/archives/meetings/" target="_blank" rel="noopener noreferrer">Rhode Island AA meeting list</a>. AA 24/7 line</span> '+tel('401-438-8860')+' · <button type="button" class="sp-link" data-go="mh">More support on Mental Health ›</button></li>'+
   '</ul><p class="sp-p">More: <button type="button" class="sp-link" data-go="help">Help &amp; Benefits ›</button> · Crisis, call or text <a class="sp-tel" href="tel:988">988</a> · Any help, <a class="sp-tel" href="tel:211">211</a></p></details>'};
 const css=document.createElement('style');css.textContent=`
.sp-box{margin:0 0 14px;border:2px solid #2F5B4F;border-left:6px solid #2F5B4F;border-radius:8px;background:#2F5B4F22;padding:0 14px 10px}
.sp-box>summary{list-style:none;cursor:pointer;display:flex;flex-direction:column;gap:3px;padding:12px 0 6px}.sp-box>summary::-webkit-details-marker{display:none}
.sp-box>summary b{font:700 17px/1.2 "Playfair Display",Georgia,serif;color:#fff}.sp-box>summary span{font:400 15px/1.4 Georgia,serif;color:#EEE9E5}
.sp-list{margin:3px 0 6px;padding-left:16px;font:400 14px/1.45 Georgia,serif;color:#EEE9E5}.sp-list li{margin:3px 0}.sp-list b{color:#fff}.sp-list span{color:#C9D6DF}.sp-list a{color:#D4ECF5}
.sp-p{margin:5px 0;font:400 14px/1.45 Georgia,serif;color:#EEE9E5}.sp-tel{font-weight:800;color:#fff!important;text-decoration:underline;white-space:nowrap}
.sp-link{all:unset;cursor:pointer;font:700 15px/1.3 "Libre Franklin",system-ui,sans-serif;color:#D4ECF5;text-decoration:underline}
.sp-box a:focus-visible,.sp-link:focus-visible,.sp-box summary:focus-visible{outline:3px solid #E9C46A;outline-offset:2px}`;document.head.appendChild(css);
 try{if(typeof STATE!=='undefined'&&STATE.view==='cal'&&typeof render==='function')render()}catch(_){}
})();
