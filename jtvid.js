/* Front page: James Taylor "Fire and Rain" (official YouTube video) under the flipping poster box */
(function(){
function put(){const cv=document.querySelector('#coverSlot .cvr'),im=cv&&cv.querySelector(':scope>.cimg');if(!im||cv.querySelector('.jtv'))return;
 const w=im.offsetWidth||405;
 const d=document.createElement('div');d.className='jtv';d.style.maxWidth=w+'px';
 d.innerHTML='<div class="jtv-f"><iframe src="https://www.youtube-nocookie.com/embed/_1nKGVDhQ60?rel=0" title="James Taylor, Fire and Rain (BBC In Concert, 1970)" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="jtv-c">James Taylor &middot; Fire and Rain &middot; BBC In Concert, 1970</p>';
 im.after(d)}
new MutationObserver(()=>requestAnimationFrame(put)).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',put);
})();
