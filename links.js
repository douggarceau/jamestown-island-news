/* Jamestown News Links: headline links to other outlets' fresh Jamestown news, newest first.
   Data: data/links.json, topped up three times a day by the news-links desk. Plain rows, no boxes. */
(function(){
 let D=null,asked=false,err=false;
 const st={t:''};
 const X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const U=u=>{const t=String(u==null?'':u);return /^https?:\/\//i.test(t)?X(t):'#'};
 const TOPICS={town:'Town news',roads:'Bridges, ferry & roads',events:'Events & arts',schools:'Schools',weather:'Weather & the bay',business:'Business',other:'Other'};
 const fmt=d=>{const t=new Date(d+'T12:00:00');return isNaN(t)?X(d):t.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})};
 function load(){if(asked)return;asked=true;fetch('data/links.json?'+Math.floor(Date.now()/9e5)).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{D=j;fill()}).catch(()=>{err=true;asked=false;fill()})}
 function fill(){const root=document.getElementById('lkRoot');if(!root)return;const L=root.querySelector('#lkList');
  if(err){L.innerHTML='<p>Couldn’t load the news links. <button type="button" id="lkRetry">Retry</button></p>';return}
  if(!D){L.innerHTML='<p>Loading…</p>';return}
  if(D.asof)root.querySelector('#lkUpd').textContent='Updated '+new Date(D.asof).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const items=(D.items||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const S=root.querySelector('#lkTopic');if(S.options.length<2){const ks=[...new Set(items.map(x=>x.topic||'other'))];S.innerHTML='<option value="">All topics</option>'+Object.keys(TOPICS).filter(k=>ks.includes(k)).map(k=>'<option value="'+k+'">'+TOPICS[k]+'</option>').join('');S.value=st.t}
  const rows=items.filter(x=>!st.t||(x.topic||'other')===st.t);
  if(!rows.length){L.innerHTML='<p>No links yet. New ones are added every day.</p>';return}
  let last='',h='';
  rows.forEach(x=>{if(x.date!==last){if(last)h+='</ul>';h+='<h3>'+fmt(x.date)+'</h3><ul class="lk-l">';last=x.date}
   h+='<li><a href="'+U(x.url)+'" target="_blank" rel="noopener">'+X(x.headline)+'</a> <span class="lk-o">'+X(x.outlet)+' · '+(TOPICS[x.topic]||TOPICS.other)+'</span></li>'});
  L.innerHTML=h+'</ul>'}
 window.vLinks=function(){setTimeout(()=>{load();fill()},0);
  return '<section class="box lk" id="lkRoot"><h2>Jamestown News Links</h2>'
   +'<p class="lk-note">Fresh Jamestown news from other outlets and the Town, newest first. Each link opens the original story on its own site.</p>'
   +'<div class="lk-f"><label for="lkTopic">Topic</label> <select id="lkTopic"><option value="">All topics</option></select> <span id="lkUpd" class="lk-o"></span></div>'
   +'<div id="lkList"></div></section>'};
 document.addEventListener('change',e=>{if(e.target&&e.target.id==='lkTopic'){st.t=e.target.value;fill()}});
 document.addEventListener('click',e=>{if(e.target&&e.target.id==='lkRetry'){err=false;load();fill()}});
 const css=document.createElement('style');css.textContent=`
#view #lkRoot{display:block!important}
#lkRoot>*{width:auto;max-width:100%}
#lkRoot .lk-note{margin:4px 0 8px;padding-left:8px;border-left:2px solid #B5123A;color:#D4ECF5}
#lkRoot .lk-f{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 10px}
#view #lkRoot .lk-f select{width:auto!important;height:30px;padding:0 6px;border:1px solid #D4ECF544;border-radius:4px;background:#0A1428;color:#fff;margin:0!important}
#lkRoot h3{margin:12px 0 4px;color:#D4ECF5;font-size:1em;border-bottom:1px solid #D4ECF533;padding-bottom:3px}
#lkRoot ul.lk-l{list-style:none;margin:0;padding:0}
#lkRoot ul.lk-l li{padding:6px 0;border-bottom:1px solid #D4ECF51f;line-height:1.4}
#lkRoot ul.lk-l a{color:#fff;font-weight:600;text-decoration:none}
#lkRoot ul.lk-l a:hover{text-decoration:underline}
#lkRoot .lk-o{color:#B9CAD6;font-size:.88em;white-space:nowrap}
#lkRoot #lkRetry{all:unset;cursor:pointer;padding:3px 8px;border:1px solid #D4ECF566;border-radius:4px;color:#D4ECF5}`;document.head.appendChild(css);
 /* menu button stays hidden until the page has at least 5 links from the last 7 days */
 fetch('data/links.json?'+Math.floor(Date.now()/9e5)).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;const c=new Date(Date.now()-7*864e5).toISOString().slice(0,10);if((j.items||[]).filter(x=>(x.date||'')>=c).length>=5){const b=document.getElementById('nbLinks');if(b){b.hidden=false;b.style.display=''}}}).catch(()=>{});
 if(typeof STATE!=='undefined'&&STATE.view==='links'&&!document.getElementById('lkRoot')&&typeof render==='function')render();
})();
