/* Calendar in color: each listing box and each category button share one bright color per category */
(function(){
const C={community:'#2f80ed',arts:'#f08a24',family:'#22a861',worship:'#8e4fd6',live:'#e5484d',rock:'#e5484d',jazz:'#3f6db3',classical:'#1fa8d6',theater:'#d9a400',comedy:'#d9a400',film:'#6c5ce7',civic:'#c2185b',recreation:'#0fa3a3',talks:'#d35400',volunteer:'#00a884',dance:'#e84393',support:'#607d8b',sports:'#607d8b'};
const col=g=>C[String(g||'').toLowerCase().trim()]||'#5a6b7d';
function paint(){if(typeof STATE==='undefined'||STATE.view!=='cal')return;const v=document.getElementById('view');if(!v)return;
 v.querySelectorAll('.pad[data-genre]').forEach(p=>{if(p.dataset.cc)return;const g=p.dataset.genre;const c=g==='all'?'#e8b818':col(g);p.dataset.cc=1;p.style.setProperty('--gc',c);p.style.background=`linear-gradient(180deg,${c},color-mix(in srgb,${c} 70%,#000))`;p.style.borderColor=c;p.style.color='#fff';p.style.boxShadow=`0 0 12px color-mix(in srgb,${c} 55%,transparent)`});
 v.querySelectorAll('a.sh').forEach(a=>{if(a.dataset.cc)return;const t=a.querySelector('.gtag');const c=col(t&&t.textContent);a.dataset.cc=1;a.style.background=`linear-gradient(100deg,${c} 0%,color-mix(in srgb,${c} 62%,#000) 100%)`;a.style.borderColor=c;a.style.boxShadow=`0 0 14px color-mix(in srgb,${c} 45%,transparent),inset 0 1px 0 #ffffff44`;if(t){t.style.background='#ffffff26';t.style.borderColor='#fff';t.style.color='#fff'}})}
setInterval(paint,250);document.addEventListener('click',()=>setTimeout(paint,30),true);
})();
