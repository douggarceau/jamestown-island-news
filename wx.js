/* Jamestown Weather & Marine: an islander's command center for Conanicut Island and Narragansett Bay.
   Live in the browser (these send open CORS headers): NWS api.weather.gov (alerts, marine zone forecasts,
   7-day and hourly forecast, wind grids, Quonset observations), NOAA CO-OPS (tides, currents, Newport wind,
   water level and temperature), USNO (sun and moon), NWS radar and NOAA GOES satellite images.
   Hourly from data/marine.json (tools/marine/fetch_marine.py): NDBC buoys and shore stations, U.S. Coast
   Guard NAVCEN notices near Jamestown, and the Narragansett Bay coastal waters forecast text.
   Not for navigation. Every panel links its official source. Compact text, no big boxes. */
(function(){
 const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const U=u=>{const t=String(u==null?'':u);return /^(javascript|data|vbscript):/i.test(t.replace(/[\s\x00-\x1f]/g,''))?'#':X(t)};
 const A=(u,t)=>'<a href="'+U(u)+'" target="_blank" rel="noopener">'+t+'</a>';
 const TZ='America/New_York';
 const LAT=41.4968,LON=-71.3672;
 const NWS='https://api.weather.gov';
 const GRID=NWS+'/gridpoints/BOX/68,60';
 const ZONES=[['ANZ236','Narragansett Bay'],['ANZ235','Rhode Island Sound'],['ANZ237','Block Island Sound']];
 const COOPS='https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?application=JamestownIslandNews&time_zone=lst_ldt&units=english&format=json';
 const TIDE_ST=['8453742','West Jamestown (Dutch Island Harbor)'];
 const OBS_ST=['8452660','Newport'];
 const CURRENTS=[['ACT2211','West Passage, Dutch Island / Beaver Head'],['ACT2106','East Passage, Bull Point'],['ACT2131','East Passage, west of Rose Island'],['ACT2101','East Passage, Castle Hill']];
 const S={},err={},busy={};let timer=null,winMode='kt',zone='ANZ236';

 /* ---------- small helpers ---------- */
 const tfmt=(d,o)=>new Date(d).toLocaleString('en-US',Object.assign({timeZone:TZ},o));
 const hm=d=>tfmt(d,{hour:'numeric',minute:'2-digit'});
 const dayhm=d=>tfmt(d,{weekday:'short',hour:'numeric',minute:'2-digit'});
 const ago=d=>{const m=Math.round((Date.now()-new Date(d))/6e4);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' hr ago':Math.round(m/1440)+' days ago'};
 const COMP=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
 const comp=deg=>deg==null||isNaN(deg)?'':COMP[Math.round(((+deg%360)+360)%360/22.5)%16];
 const kt2mph=k=>k*1.15078;
 const W=k=>k==null||isNaN(k)?'–':winMode==='kt'?Math.round(k)+' kt':Math.round(kt2mph(k))+' mph';
 const Wboth=k=>k==null||isNaN(k)?'–':Math.round(k)+' kt ('+Math.round(kt2mph(k))+' mph)';
 const arrow=deg=>deg==null||isNaN(deg)?'':'<span class="wx-arr" style="transform:rotate('+((+deg+180)%360)+'deg)" title="From '+comp(deg)+'">↑</span>';
 const coopsT=s=>new Date(s.replace(' ','T')+':00'+nyOff());           // CO-OPS local "YYYY-MM-DD HH:MM"
 function nyOff(){const p=new Intl.DateTimeFormat('en-US',{timeZone:TZ,timeZoneName:'shortOffset'}).formatToParts(new Date()).find(x=>x.type==='timeZoneName');const m=/GMT([+-]\d+)/.exec(p&&p.value||'');const h=m?+m[1]:-5;return (h<0?'-':'+')+String(Math.abs(h)).padStart(2,'0')+':00'}
 const todayNY=()=>new Date().toLocaleDateString('en-CA',{timeZone:TZ});
 const ymd=()=>todayNY().replace(/-/g,'');
 function get(k,url,opt){if(busy[k])return;busy[k]=1;
  fetch(url,Object.assign({headers:{Accept:'application/geo+json, application/json'}},opt||{})).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
   .then(j=>{if(j&&j.error&&!j.features)throw new Error(j.error.message||'no data');S[k]=j;S[k+'_at']=Date.now();delete err[k]}).catch(e=>{err[k]=String(e.message||e)}).finally(()=>{busy[k]=0;fill()})}
 function loadAll(){
  get('alerts',NWS+'/alerts/active?zone='+ZONES.map(z=>z[0]).join(',')+',RIZ007');
  ZONES.forEach(([z])=>get('mz_'+z,NWS+'/zones/marine/'+z+'/forecast'));
  get('fc',GRID+'/forecast');get('hr',GRID+'/forecast/hourly');get('grid',GRID);
  get('obs',NWS+'/stations/KOQU/observations/latest');get('obs2',NWS+'/stations/KPVD/observations/latest');
  get('tide',COOPS+'&station='+TIDE_ST[0]+'&product=predictions&datum=MLLW&interval=hilo&begin_date='+ymd()+'&range=72');
  get('tidecurve',COOPS+'&station='+TIDE_ST[0]+'&product=predictions&datum=MLLW&interval=30&begin_date='+ymd()+'&range=36');
  get('wl',COOPS+'&station='+OBS_ST[0]+'&product=water_level&datum=MLLW&date=latest');
  get('wtemp',COOPS+'&station='+OBS_ST[0]+'&product=water_temperature&date=latest');
  get('wind',COOPS+'&station='+OBS_ST[0]+'&product=wind&range=12');
  get('press',COOPS+'&station='+OBS_ST[0]+'&product=air_pressure&range=6');
  CURRENTS.forEach(([c])=>get('cur_'+c,COOPS+'&station='+c+'&product=currents_predictions&interval=MAX_SLACK&begin_date='+ymd()+'&range=48'));
  const off=+(nyOff().slice(0,3));get('sun','https://aa.usno.navy.mil/api/rstt/oneday?date='+todayNY()+'&coords='+LAT+','+LON+'&tz='+off);
  get('marine','data/marine.json?'+Math.floor(Date.now()/6e5));
 }

 /* ---------- NWS wind grid: expand "start/PT3H" periods into hourly values ---------- */
 function hours(series,conv){const out=new Map();if(!series||!series.values)return out;
  for(const v of series.values){const [st,dur]=v.validTime.split('/');const m=/P(?:(\d+)D)?T?(?:(\d+)H)?/.exec(dur||'PT1H');const n=(+(m[1]||0))*24+(+(m[2]||0))||1;
   const t0=new Date(st).getTime();for(let i=0;i<n;i++)out.set(t0+i*36e5,v.value==null?null:conv(v.value))}
  return out}
 const kmh2kt=v=>v/1.852;
 function windSeries(){const g=S.grid&&S.grid.properties;if(!g)return [];
  const sp=hours(g.windSpeed,kmh2kt),gu=hours(g.windGust,kmh2kt),di=hours(g.windDirection,v=>v),wv=hours(g.waveHeight,v=>v*3.28084);
  const now=Date.now()-36e5,out=[];
  [...sp.keys()].sort((a,b)=>a-b).forEach(t=>{if(t>=now&&out.length<60)out.push({t,s:sp.get(t),g:gu.get(t),d:di.get(t),w:wv.get(t)})});
  return out}

 /* ---------- alerts and flags ---------- */
 const FLAGS=[[/hurricane force wind warning|hurricane warning/i,'Hurricane warning flags','▮▮','wx-fl4'],[/storm warning/i,'Storm warning flag','▮','wx-fl3'],[/gale warning/i,'Gale warning: 2 red pennants','▶▶','wx-fl2'],[/small craft advisory/i,'Small craft advisory: 1 red pennant','▶','wx-fl1']];
 function flagOf(evs){for(const [re,label,sym,cls] of FLAGS)if(evs.some(e=>re.test(e)))return '<span class="wx-flag '+cls+'" title="'+X(label)+'">'+sym+'</span> '+X(label);return ''}
 function alertsHTML(){
  if(err.alerts&&!S.alerts)return '<p class="wx-s">Couldn’t reach the National Weather Service for alerts. Check '+A('https://www.weather.gov/alerts','weather.gov/alerts')+'.</p>';
  if(!S.alerts)return '<p class="wx-s">Checking for warnings…</p>';
  const f=(S.alerts.features||[]).map(x=>x.properties).filter(p=>p&&p.status==='Actual');
  const seen=new Set(),list=f.filter(p=>{const k=p.event+'|'+p.ends+'|'+p.areaDesc;if(seen.has(k))return false;seen.add(k);return true})
   .sort((a,b)=>(['Extreme','Severe','Moderate','Minor','Unknown'].indexOf(a.severity))-(['Extreme','Severe','Moderate','Minor','Unknown'].indexOf(b.severity)));
  const ugc=p=>(p.geocode&&p.geocode.UGC)||[];
  const NAMES=Object.fromEntries(ZONES.concat([['RIZ007','Jamestown (Newport County)']]));
  const area=p=>{const n=ugc(p).filter(z=>NAMES[z]).map(z=>NAMES[z]);return n.length?n.join(', '):p.areaDesc};
  const fl=ZONES.map(([z,n])=>{const f=flagOf(list.filter(p=>ugc(p).includes(z)).map(p=>p.event));return f?'<span class="wx-fz">'+n+': '+f+'</span>':''}).filter(Boolean).join('');
  if(!list.length)return '<p class="wx-ok">✓ No active weather or marine warnings for Jamestown or Narragansett Bay.</p>';
  return (fl?'<p class="wx-flagline">'+fl+'</p><p class="wx-s">Flags are the traditional coastal warning displays for each advisory.</p>':'')+'<ul class="wx-al">'+list.map(p=>{const sev=/Extreme|Severe/.test(p.severity)?'wx-r':'wx-o';
   return '<li class="'+sev+'"><details><summary><b>'+X(p.event)+'</b> <span class="wx-s">'+X(area(p))+(p.ends||p.expires?' · until '+X(dayhm(p.ends||p.expires)):'')+'</span></summary>'
    +(p.headline?'<p>'+X(p.headline)+'</p>':'')+'<p class="wx-pre">'+X(p.description||'')+'</p>'+(p.instruction?'<p class="wx-pre"><b>What to do:</b> '+X(p.instruction)+'</p>':'')+'<p class="wx-s">Issued by '+X(p.senderName||'NWS')+' · '+X(dayhm(p.sent))+'</p></details></li>'}).join('')+'</ul>'}

 /* ---------- right now ---------- */
 function nowHTML(){
  const cells=[];
  const ws=S.wind&&S.wind.data&&S.wind.data.length?S.wind.data[S.wind.data.length-1]:null;
  if(ws){const s=+ws.s,g=+ws.g;cells.push(['Wind, Newport',arrow(+ws.d)+' '+X(ws.dr||comp(+ws.d))+' '+W(s)+(g?' · gusts '+W(g):''),'NOAA '+OBS_ST[1]+', '+hm(coopsT(ws.t))])}
  else cells.push(['Wind, Newport',err.wind?'not reporting':'…','NOAA CO-OPS']);
  const oa=S.obs&&S.obs.properties,ob=S.obs2&&S.obs2.properties;
  const o=oa&&ob?(new Date(ob.timestamp)-new Date(oa.timestamp)>45*6e4&&ob.temperature&&ob.temperature.value!=null?ob:oa):(oa||ob);
  if(o){const c=o.temperature&&o.temperature.value,f=c==null?null:Math.round(c*9/5+32),wc=o.windChill&&o.windChill.value,hi=o.heatIndex&&o.heatIndex.value;
   cells.push(['Air',(f==null?'–':f+'°F')+' · '+X(o.textDescription||''),(wc!=null?'feels '+Math.round(wc*9/5+32)+'° · ':'')+(hi!=null&&wc==null?'feels '+Math.round(hi*9/5+32)+'° · ':'')+(o===ob?'Providence (T.F. Green)':'Quonset airport')+', '+hm(o.timestamp)])}
  const wt=S.wtemp&&S.wtemp.data&&S.wtemp.data[0];if(wt)cells.push(['Water temperature',Math.round(+wt.v)+'°F','Newport, '+hm(coopsT(wt.t))]);
  const by=S.marine&&S.marine.buoys||[],bi=by.find(b=>b.id==='44097');
  if(bi&&bi.wvht_ft!=null)cells.push(['Seas offshore',bi.wvht_ft+' ft'+(bi.dpd_s?' every '+Math.round(bi.dpd_s)+' s':'')+(bi.mwd!=null?' from '+comp(bi.mwd):''),'Block Island buoy, '+hm(bi.time)]);
  const td=tideNow();if(td)cells.push(['Tide',td[0],td[1]]);
  const pr=S.press&&S.press.data;if(pr&&pr.length>1){const a=+pr[0].v,b=+pr[pr.length-1].v,d=b-a;cells.push(['Pressure',b.toFixed(1)+' mb '+(d>1?'↑ rising':d<-1?'↓ falling':'→ steady'),'Newport, last 6 hr '+(d>=0?'+':'')+d.toFixed(1)])}
  const sn=S.sun&&S.sun.properties&&S.sun.properties.data;
  if(sn){const g=(arr,ph)=>((arr||[]).find(x=>x.phen===ph)||{}).time||'';const t=s=>{if(!s)return '–';const [h,m]=s.split(':').map(Number);return ((h+11)%12+1)+':'+String(m).padStart(2,'0')+(h<12?' am':' pm')};
   cells.push(['Sun',t(g(sn.sundata,'Rise'))+' – '+t(g(sn.sundata,'Set')),'Moon: '+X(sn.curphase||'')+(sn.fracillum?' ('+X(sn.fracillum)+')':'')])}
  return '<div class="wx-now">'+cells.map(c=>'<div><span class="wx-k">'+c[0]+'</span><b>'+c[1]+'</b><span class="wx-s">'+c[2]+'</span></div>').join('')+'</div>'}
 function tideNow(){const p=S.tide&&S.tide.predictions;if(!p||!p.length)return null;const now=Date.now();
  const nx=p.map(x=>({t:coopsT(x.t),v:+x.v,ty:x.type})).filter(x=>x.t>now);if(!nx.length)return null;const n=nx[0];
  return [(n.ty==='H'?'Rising':'Falling')+', '+(n.ty==='H'?'high':'low')+' at '+hm(n.t),n.v.toFixed(1)+' ft at '+TIDE_ST[1].split(' (')[0]]}

 /* ---------- wind forecast chart ---------- */
 function windHTML(){
  const ws=windSeries();if(!ws.length)return '<p class="wx-s">'+(err.grid?'Couldn’t load the NWS wind forecast. '+A('https://forecast.weather.gov/MapClick.php?lat='+LAT+'&lon='+LON+'&FcstType=graphical','See it on weather.gov')+'.':'Loading the wind forecast…')+'</p>';
  const max=Math.max(30,...ws.map(x=>Math.max(x.s||0,x.g||0)))*1.1,H=170,bw=16,Wd=ws.length*bw+40,y=v=>H-20-(v/max)*(H-40);
  let svg='<svg class="wx-chart" viewBox="0 0 '+Wd+' '+H+'" role="img" aria-label="Wind speed and gusts, next '+ws.length+' hours">';
  [10,20,30,40,50].filter(v=>v<max).forEach(v=>{svg+='<line x1="34" x2="'+Wd+'" y1="'+y(v)+'" y2="'+y(v)+'" class="wx-gl'+(v===20?' wx-gl2':'')+'"/><text x="30" y="'+(y(v)+4)+'" class="wx-ax" text-anchor="end">'+(winMode==='kt'?v:Math.round(kt2mph(v)))+'</text>'});
  let gp='';ws.forEach((x,i)=>{const cx=40+i*bw;const c=x.s>=25?'#E76F51':x.s>=15?'#E9C46A':'#7FB7D6';
   if(x.s!=null)svg+='<rect x="'+(cx+2)+'" y="'+y(x.s)+'" width="'+(bw-4)+'" height="'+Math.max(1,H-20-y(x.s))+'" fill="'+c+'"><title>'+X(dayhm(x.t))+': '+Wboth(x.s)+(x.g?', gusts '+Wboth(x.g):'')+' from '+comp(x.d)+'</title></rect>';
   if(x.g!=null)gp+=(gp?' L':'M')+(cx+bw/2)+' '+y(x.g);
   const h=+tfmt(x.t,{hour:'numeric',hour12:false});
   if(h%6===0)svg+='<text x="'+(cx+bw/2)+'" y="'+(H-6)+'" class="wx-ax" text-anchor="middle">'+(h===0?tfmt(x.t,{weekday:'short'}):tfmt(x.t,{hour:'numeric'}).replace(' ',''))+'</text>';
   if(i%3===0&&x.d!=null)svg+='<g transform="translate('+(cx+bw/2)+' 12) rotate('+((x.d+180)%360)+')"><path d="M0 -6 L4 4 L0 2 L-4 4 Z" class="wx-dir"/></g>'});
  svg+='<path d="'+gp+'" class="wx-gust"/></svg>';
  const pk=ws.slice(0,24).reduce((a,x)=>(x.g||x.s||0)>(a.g||a.s||0)?x:a,ws[0]);
  return '<p class="wx-s">Bars: sustained wind. Line: gusts. Arrows show where the wind is blowing <i>to</i>. Blue under 15 kt, gold 15–24 kt, red 25 kt and up. Speeds in '+(winMode==='kt'?'knots':'mph')+'. '
   +'<button type="button" class="wx-btn" data-wx-unit>'+(winMode==='kt'?'Show mph':'Show knots')+'</button></p>'
   +'<div class="wx-scroll">'+svg+'</div><p class="wx-s">Strongest in the next 24 hours: '+Wboth(pk.g||pk.s)+' around '+X(dayhm(pk.t))+' from the '+comp(pk.d)+'. Source: '+A('https://forecast.weather.gov/MapClick.php?lat='+LAT+'&lon='+LON+'&FcstType=graphical','NWS Boston/Norton forecast grid')+'.</p>'}

 /* ---------- marine forecast ---------- */
 function marineHTML(){
  const tabs='<div class="wx-tabs">'+ZONES.map(([z,n])=>'<button type="button" data-wx-zone="'+z+'"'+(z===zone?' class="on" aria-current="true"':'')+'>'+n+'</button>').join('')+'</div>';
  const m=S['mz_'+zone],p=m&&m.properties;
  let body;
  if(p&&p.periods&&p.periods.length)body='<dl class="wx-mz">'+p.periods.slice(0,8).map(x=>'<dt>'+X(x.name)+'</dt><dd>'+X(x.detailedForecast)+'</dd>').join('')+'</dl><p class="wx-s">Updated '+X(dayhm(p.updated))+' · '+A('https://forecast.weather.gov/shmrn.php?mz='+zone.toLowerCase(),'NWS marine forecast '+zone)+'</p>';
  else if(zone==='ANZ236'&&S.marine&&S.marine.cwf)body='<pre class="wx-pre">'+X(S.marine.cwf.text.replace(/^[\s\S]*?(ANZ236)/,'$1'))+'</pre>';
  else body='<p class="wx-s">'+(err['mz_'+zone]?'Couldn’t load the marine forecast. '+A('https://forecast.weather.gov/shmrn.php?mz='+zone.toLowerCase(),'Open it on weather.gov')+'.':'Loading…')+'</p>';
  return tabs+body}

 /* ---------- 7-day ---------- */
 function sevenHTML(){const p=S.fc&&S.fc.properties&&S.fc.properties.periods;
  if(!p)return '<p class="wx-s">'+(err.fc?'Couldn’t load the forecast. '+A('https://forecast.weather.gov/MapClick.php?lat='+LAT+'&lon='+LON,'Open it on weather.gov')+'.':'Loading…')+'</p>';
  return '<table class="wx-t wx-7"><thead><tr><th>When</th><th>Temp</th><th>Wind</th><th>Rain</th><th>Forecast</th></tr></thead><tbody>'+p.slice(0,14).map(x=>'<tr><td><b>'+X(x.name)+'</b></td><td>'+X(x.temperature)+'°</td><td>'+X(x.windDirection)+' '+X(x.windSpeed)+'</td><td>'+(x.probabilityOfPrecipitation&&x.probabilityOfPrecipitation.value!=null?X(x.probabilityOfPrecipitation.value)+'%':'')+'</td><td>'+X(x.detailedForecast)+'</td></tr>').join('')+'</tbody></table><p class="wx-s">'+A('https://forecast.weather.gov/MapClick.php?lat='+LAT+'&lon='+LON,'NWS forecast for Jamestown')+' · updated '+X(dayhm(S.fc.properties.updateTime||S.fc.properties.updated))+'</p>'}
 function hourlyHTML(){const p=S.hr&&S.hr.properties&&S.hr.properties.periods;if(!p)return '';
  const now=Date.now()-36e5,rows=p.filter(x=>new Date(x.endTime)>now).slice(0,24);
  return '<details class="wx-det"><summary>Hour by hour, next 24 hours</summary><table class="wx-t"><thead><tr><th>Time</th><th>Temp</th><th>Wind</th><th>Rain</th><th>Sky</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+X(dayhm(x.startTime))+'</td><td>'+X(x.temperature)+'°</td><td>'+X(x.windDirection)+' '+X(x.windSpeed)+'</td><td>'+(x.probabilityOfPrecipitation&&x.probabilityOfPrecipitation.value!=null?X(x.probabilityOfPrecipitation.value)+'%':'')+'</td><td>'+X(x.shortForecast)+'</td></tr>').join('')+'</tbody></table></details>'}

 /* ---------- tides and currents ---------- */
 function tideHTML(){const p=S.tide&&S.tide.predictions;let h='';
  if(p){const now=Date.now()-2*36e5;h+='<table class="wx-t"><thead><tr><th>Tide</th><th>Time</th><th>Height</th></tr></thead><tbody>'+p.map(x=>({t:coopsT(x.t),v:+x.v,ty:x.type})).filter(x=>x.t>now).slice(0,8).map(x=>'<tr><td>'+(x.ty==='H'?'High':'Low')+'</td><td>'+X(dayhm(x.t))+'</td><td>'+x.v.toFixed(1)+' ft</td></tr>').join('')+'</tbody></table>'}
  else h+='<p class="wx-s">'+(err.tide?'Couldn’t load tides.':'Loading tides…')+'</p>';
  const c=S.tidecurve&&S.tidecurve.predictions;
  if(c&&c.length>4){const pts=c.map(x=>({t:coopsT(x.t).getTime(),v:+x.v})),t0=pts[0].t,t1=pts[pts.length-1].t,mn=Math.min(...pts.map(x=>x.v)),mx=Math.max(...pts.map(x=>x.v)),Wd=600,H=90;
   const xx=t=>(t-t0)/(t1-t0)*Wd,yy=v=>H-8-(v-mn)/(mx-mn||1)*(H-20),now=Date.now();
   h+='<svg class="wx-chart wx-tidec" viewBox="0 0 '+Wd+' '+H+'" role="img" aria-label="Tide curve"><path class="wx-tide" d="M'+pts.map(x=>xx(x.t).toFixed(1)+' '+yy(x.v).toFixed(1)).join(' L')+'"/>'+(now>t0&&now<t1?'<line class="wx-nowl" x1="'+xx(now)+'" x2="'+xx(now)+'" y1="0" y2="'+H+'"/><text class="wx-ax" x="'+(xx(now)+4)+'" y="12">now</text>':'')+'</svg>'}
  const wl=S.wl&&S.wl.data&&S.wl.data[0];
  h+='<p class="wx-s">Predictions for '+A('https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id='+TIDE_ST[0],TIDE_ST[1])+', feet above mean lower low water.'+(wl?' Measured at Newport now: '+(+wl.v).toFixed(1)+' ft ('+X(hm(coopsT(wl.t)))+').':'')+'</p>';
  h+='<h4>Currents (predicted)</h4><table class="wx-t"><thead><tr><th>Where</th><th>Next changes</th></tr></thead><tbody>';
  for(const [id,name] of CURRENTS){const d=S['cur_'+id],l=d&&d.current_predictions&&d.current_predictions.cp;
   const now=Date.now();const nx=(l||[]).map(x=>({t:coopsT(x.Time),ty:x.Type,v:+x.Velocity_Major})).filter(x=>x.t>now).slice(0,4);
   h+='<tr><td><b>'+X(name)+'</b><br><span class="wx-s">'+A('https://tidesandcurrents.noaa.gov/noaacurrents/predictions?id='+id+'_1','NOAA '+id)+'</span></td><td>'+(nx.length?nx.map(x=>(x.ty==='slack'?'Slack':(x.ty==='flood'?'Max flood ':'Max ebb ')+Math.abs(x.v).toFixed(1)+' kt')+' '+X(dayhm(x.t))).join(' · '):err['cur_'+id]?'not available':'…')+'</td></tr>'}
  return h+'</tbody></table><p class="wx-s">Flood runs into the bay (north), ebb runs out (south).</p>'}

 /* ---------- buoys ---------- */
 function buoyHTML(){const m=S.marine;if(!m)return '<p class="wx-s">'+(err.marine?'Couldn’t load buoy reports.':'Loading…')+'</p>';
  return '<table class="wx-t"><thead><tr><th>Station</th><th>Wind</th><th>Waves</th><th>Water</th><th>Air · pressure</th></tr></thead><tbody>'+m.buoys.map(b=>{const old=Date.now()-new Date(b.time)>3*36e5;
   return '<tr'+(old?' class="wx-old"':'')+'><td><b>'+A('https://www.ndbc.noaa.gov/station_page.php?station='+b.id.toLowerCase(),X(b.name))+'</b><br><span class="wx-s">'+X(b.what)+' · '+X(ago(b.time))+'</span></td><td>'+(b.wspd_kt!=null?arrow(b.wdir)+' '+X(comp(b.wdir))+' '+Wboth(b.wspd_kt)+(b.gst_kt!=null?'<br><span class="wx-s">gusts '+Wboth(b.gst_kt)+'</span>':''):'–')+'</td><td>'+(b.wvht_ft!=null?b.wvht_ft+' ft'+(b.dpd_s?', '+Math.round(b.dpd_s)+' s':'')+(b.mwd!=null?' from '+comp(b.mwd):''):'–')+'</td><td>'+(b.wtmp_f!=null?b.wtmp_f+'°F':'–')+'</td><td>'+(b.atmp_f!=null?b.atmp_f+'°F':'–')+(b.pres_mb!=null?' · '+b.pres_mb+' mb':'')+'</td></tr>'}).join('')+'</tbody></table><p class="wx-s">NOAA National Data Buoy Center reports, collected '+X(ago(m.updated))+'. Waves are measured offshore at Block Island; seas in the bay are usually smaller.</p>'}

 /* ---------- bridges, ferry ---------- */
 function travelHTML(){const ws=windSeries().slice(0,12),pk=ws.reduce((a,x)=>Math.max(a,x.g||x.s||0),0),pkm=Math.round(kt2mph(pk));
  const live=S.wind&&S.wind.data&&S.wind.data.length?S.wind.data[S.wind.data.length-1]:null,lg=live?Math.round(kt2mph(+live.g||+live.s)):null;
  return '<ul class="wx-l"><li><b>Newport Pell and Jamestown Verrazzano bridges.</b> High winds can bring restrictions for trucks, trailers and other high-profile vehicles. '
   +(lg!=null?'Gusts at Newport right now: '+lg+' mph. ':'')+(pk?'Strongest gust forecast in the next 12 hours: about '+pkm+' mph. ':'')
   +'Official notices: '+A('https://www.ritba.org/','Rhode Island Turnpike and Bridge Authority')+'.</li>'
   +'<li><b>Jamestown–Newport ferry.</b> Seasonal; trips can be cancelled for sea conditions. Check '+A('https://cruiseri.com/jamestown-newport-ferry/','the ferry operator')+' before you go.</li>'
   +'<li><b>Roads.</b> '+A('https://www.dot.ri.gov/travel/','RIDOT travel information')+'.</li></ul>'}

 /* ---------- Coast Guard ---------- */
 function uscgHTML(){const m=S.marine,l=m&&m.uscg||[];
  let h='<p class="wx-s">Active U.S. Coast Guard maritime safety notices within 25 nautical miles of Jamestown, nearest first.</p>';
  if(!m)h+='<p class="wx-s">'+(err.marine?'Couldn’t load the notices.':'Loading…')+'</p>';
  else if(!l.length)h+='<p class="wx-s">No active notices nearby.</p>';
  else h+='<ul class="wx-l wx-cg">'+l.slice(0,40).map(x=>{return '<li><details><summary><b>'+X(x.type||x.group||'Notice')+'</b> · '+X(x.waterway||x.title.split(' - ')[0])+' <span class="wx-s">'+X(x.nm)+' nm away'+(x.end&&x.end<'2030'?' · until '+X(x.end):'')+'</span></summary><p class="wx-pre">'+X(x.desc)+'</p></details></li>'}).join('')+'</ul>';
  return h+'<p class="wx-s">Source: '+A('https://www.navcen.uscg.gov/maritime-safety-information','USCG Navigation Center')+'. Also: '+A('https://www.navcen.uscg.gov/broadcast-notice-to-mariners-search?district=1','Broadcast Notices to Mariners (District 1)')+' · '+A('https://www.navcen.uscg.gov/local-notices-to-mariners?district=1+0&subdistrict=n','Local Notice to Mariners')+' · '+A('https://www.news.uscg.mil/Press-Releases/','Coast Guard news')+'.</p>'}

 /* ---------- radio ---------- */
 function radioHTML(){return '<table class="wx-t"><tbody>'
  +'<tr><td><b>VHF 16</b></td><td>Distress, safety and calling. Coast Guard monitors 24 hours. <b>Mayday</b> here, or call 911.</td></tr>'
  +'<tr><td><b>VHF 22A</b></td><td>Coast Guard safety broadcasts and working channel (announced first on 16).</td></tr>'
  +'<tr><td><b>VHF 13</b></td><td>Bridge-to-bridge: ships talk passing arrangements in the bay.</td></tr>'
  +'<tr><td><b>VHF 9</b></td><td>Recreational boater calling channel.</td></tr>'
  +'<tr><td><b>WX2 · 162.400 MHz</b></td><td>NOAA Weather Radio <b>WXJ39</b>, Providence transmitter, run by NWS Boston/Norton. Weather-alert radios: SAME code <b>044005</b> (Newport County).</td></tr>'
  +'</tbody></table><p class="wx-s">Listen online: '+A('https://www.broadcastify.com/listen/feed/43728','Narragansett Bay marine VHF scanner')+' (Broadcastify, volunteer feed) · '+A('https://www.weather.gov/nwr/station_listing?State=RI','NOAA Weather Radio stations in RI')+'.</p>'}

 /* ---------- radar, satellite, live map ---------- */
 function mapsHTML(){const b=Math.floor(Date.now()/3e5);
  return '<div class="wx-img"><figure><img loading="lazy" src="https://radar.weather.gov/ridge/standard/KBOX_loop.gif?'+b+'" alt="NWS Boston radar loop"><figcaption>'+A('https://radar.weather.gov/station/kbox/standard','NWS radar, Boston/Norton (KBOX)')+'</figcaption></figure>'
   +'<figure><img loading="lazy" src="https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ne/GEOCOLOR/600x600.jpg?'+b+'" alt="GOES-19 satellite, Northeast"><figcaption>'+A('https://www.star.nesdis.noaa.gov/GOES/sector.php?sat=G19&sector=ne','NOAA GOES-19 satellite, Northeast')+'</figcaption></figure></div>'
   +'<p><button type="button" class="wx-btn" data-wx-windy>Show the live wind map (Windy)</button></p><div id="wxWindy"></div>'}

 /* ---------- page ---------- */
 const SECTIONS=[['wxA','Warnings and flags',alertsHTML],['wxN','Right now',nowHTML],['wxW','Wind forecast',windHTML],['wxM','Marine forecast',marineHTML],['wxB','Buoys and shore stations',buoyHTML],['wxT','Tides and currents',tideHTML],['wxF','7-day forecast',()=>sevenHTML()+hourlyHTML()],['wxR','Radar and satellite',mapsHTML],['wxG','Coast Guard notices',uscgHTML],['wxV','Marine and weather radio',radioHTML],['wxX','Bridges and ferry',travelHTML]];
 function fill(){const root=document.getElementById('wxRoot');if(!root){stop();return}
  for(const [id,,fn] of SECTIONS){const el=root.querySelector('#'+id);if(!el||id==='wxR'&&el.dataset.done)continue;try{el.innerHTML=fn()}catch(e){el.innerHTML='<p class="wx-s">This panel couldn’t be drawn.</p>'}if(id==='wxR')el.dataset.done='1'}
  const u=root.querySelector('#wxUpd');if(u)u.textContent='Updated '+hm(Date.now())+'. Refreshes every 10 minutes while open.'}
 function stop(){if(timer){clearInterval(timer);timer=null}}
 window.vWx=function(){setTimeout(()=>{loadAll();fill();stop();timer=setInterval(()=>{if(!document.getElementById('wxRoot')){stop();return}if(document.hidden)return;loadAll()},6e5)},0);
  return '<section class="box wx" id="wxRoot"><h2>Jamestown Weather &amp; Marine</h2>'
   +'<p class="wx-s">Live conditions and official forecasts for Conanicut Island and Narragansett Bay, from the National Weather Service, NOAA and the U.S. Coast Guard. <b>Not for navigation.</b> Check official sources before you go out. <span id="wxUpd"></span></p>'
   +'<nav class="wx-jump" aria-label="Sections">'+SECTIONS.map(([id,t])=>'<a href="#'+id+'" data-wx-jump="'+id+'">'+t+'</a>').join('')+'</nav>'
   +SECTIONS.map(([id,t])=>'<h3 id="'+id+'h">'+t+'</h3><div id="'+id+'"></div>').join('')
   +'<p class="wx-s wx-foot">Sources: '+A('https://www.weather.gov/box/','NWS Boston/Norton')+' · '+A('https://tidesandcurrents.noaa.gov/','NOAA Tides &amp; Currents')+' · '+A('https://www.ndbc.noaa.gov/','NOAA buoys')+' · '+A('https://www.navcen.uscg.gov/','USCG NAVCEN')+' · '+A('https://aa.usno.navy.mil/data/RS_OneDay','U.S. Naval Observatory')+'. Public records and government data, shown as published; verify when it matters.</p></section>'};
 document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#wxRoot'))return;
  if(t.closest('[data-wx-unit]')){winMode=winMode==='kt'?'mph':'kt';fill();return}
  const z=t.closest('[data-wx-zone]');if(z){zone=z.dataset.wxZone;fill();return}
  const j=t.closest('[data-wx-jump]');if(j){e.preventDefault();const h=document.getElementById(j.dataset.wxJump+'h');if(h)window.scrollTo(0,h.getBoundingClientRect().top+window.scrollY-70);return}
  if(t.closest('[data-wx-windy]')){const w=document.getElementById('wxWindy');if(w&&!w.firstChild)w.innerHTML='<iframe title="Windy live wind map" loading="lazy" src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=%C2%B0F&metricWind=kt&zoom=10&overlay=wind&product=ecmwf&level=surface&lat='+LAT+'&lon='+LON+'&detailLat='+LAT+'&detailLon='+LON+'&detail=true&message=true"></iframe><p class="wx-s">Map by '+A('https://www.windy.com/','Windy.com')+' (computer forecast models, not NWS).</p>';t.closest('[data-wx-windy]').remove()}});
 const css=document.createElement('style');css.textContent=`
#view #wxRoot{display:block!important}#wxRoot>*{max-width:100%}
#wxRoot h2{margin:0 0 4px}#wxRoot h3{margin:16px 0 4px;padding-top:6px;border-top:1px solid #D4ECF533;scroll-margin-top:70px}#wxRoot h4{margin:10px 0 4px}
#wxRoot .wx-s{color:#B9CAD6;font-size:.9em}#wxRoot a{color:#D4ECF5}
#wxRoot .wx-jump{display:flex;flex-wrap:wrap;gap:4px 12px;margin:6px 0 2px;font-size:.9em}
#wxRoot .wx-ok{color:#8FD694;margin:4px 0}
#wxRoot .wx-flagline{margin:4px 0;font-weight:700;display:flex;flex-wrap:wrap;gap:2px 16px}#wxRoot .wx-flag{color:#E76F51;letter-spacing:-2px;margin-right:4px}
#wxRoot ul.wx-al,#wxRoot ul.wx-l{margin:4px 0;padding-left:18px}#wxRoot ul.wx-al li,#wxRoot ul.wx-l li{margin:4px 0}
#wxRoot ul.wx-al li.wx-r summary b{color:#E76F51}#wxRoot ul.wx-al li.wx-o summary b{color:#E9C46A}
#wxRoot summary{cursor:pointer}#wxRoot .wx-pre{white-space:pre-wrap;font-size:.9em;margin:4px 0}#wxRoot pre.wx-pre{font-family:inherit}
#wxRoot .wx-now{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px 14px;margin:4px 0}
#wxRoot .wx-now>div{display:flex;flex-direction:column;border-left:2px solid #E9C46A;padding-left:8px}
#wxRoot .wx-k{font-size:.8em;text-transform:uppercase;letter-spacing:.03em;color:#B9CAD6}
#wxRoot .wx-arr{display:inline-block;color:#E9C46A}
#wxRoot .wx-scroll{overflow-x:auto}#wxRoot svg.wx-chart{display:block;min-width:560px;width:100%;height:auto}#wxRoot svg.wx-tidec{min-width:0;max-width:600px;margin-top:6px}
#wxRoot .wx-gl{stroke:#D4ECF522}#wxRoot .wx-gl2{stroke:#D4ECF555}#wxRoot .wx-ax{fill:#B9CAD6;font-size:11px}
#wxRoot .wx-gust{fill:none;stroke:#fff;stroke-width:1.5;stroke-dasharray:3 2}#wxRoot .wx-dir{fill:#D4ECF5}
#wxRoot .wx-tide{fill:none;stroke:#7FB7D6;stroke-width:2}#wxRoot .wx-nowl{stroke:#E9C46A;stroke-width:1.5}
#wxRoot .wx-btn,#wxRoot .wx-tabs button{all:unset;cursor:pointer;padding:2px 8px;border:1px solid #D4ECF566;border-radius:4px;font-size:.9em}
#wxRoot .wx-btn:focus-visible,#wxRoot .wx-tabs button:focus-visible{outline:2px solid #E9C46A}
#wxRoot .wx-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}#wxRoot .wx-tabs button.on{background:#E9C46A;color:#0A1428;border-color:#E9C46A}
#wxRoot dl.wx-mz{margin:4px 0}#wxRoot dl.wx-mz dt{font-weight:700;margin-top:6px}#wxRoot dl.wx-mz dd{margin:0 0 0 0}
#wxRoot table.wx-t{width:100%;border-collapse:collapse;margin:4px 0}
#wxRoot .wx-t th{text-align:left;color:#B9CAD6;border-bottom:1px solid #D4ECF544;padding:3px 6px;font-weight:600}
#wxRoot .wx-t td{border-bottom:1px solid #D4ECF51f;padding:4px 6px;vertical-align:top}
#wxRoot tr.wx-old td{opacity:.6}
#wxRoot .wx-img{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
#wxRoot figure{margin:0}#wxRoot figure img{width:100%;height:auto;border-radius:4px;background:#0A1428}#wxRoot figcaption{font-size:.85em;margin-top:2px}
#wxRoot #wxWindy iframe{width:100%;height:420px;border:0;border-radius:4px}
#wxRoot .wx-foot{margin-top:14px}
@media (max-width:640px){
 #wxRoot table.wx-7 thead{display:none}#wxRoot table.wx-7,#wxRoot table.wx-7 tbody,#wxRoot table.wx-7 tr,#wxRoot table.wx-7 td{display:block}
 #wxRoot table.wx-7 tr{border-bottom:1px solid #D4ECF533;padding:4px 0}#wxRoot table.wx-7 td{border:0;padding:1px 0}
 #wxRoot table.wx-7 td:nth-child(2),#wxRoot table.wx-7 td:nth-child(3),#wxRoot table.wx-7 td:nth-child(4){display:inline-block;margin-right:10px}
 #wxRoot .wx-t td,#wxRoot .wx-t th{padding:3px 4px}
 #wxRoot #wxWindy iframe{height:340px}
}`;document.head.appendChild(css);
 if(typeof STATE!=='undefined'&&STATE.view==='wx'&&!document.getElementById('wxRoot')&&typeof render==='function')render();
})();
