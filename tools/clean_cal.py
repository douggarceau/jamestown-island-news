"""Calendar clean-up for Jamestown Island News (safe to run every update).
- Merges the same event listed twice by two sources (same date, same start time,
  same or blank venue, very similar title). Keeps the organizer's own listing and
  fills any blank fields from the other copy.
- Turns placeholder times like "unknown" into "" (unknown stays unknown).
- Files rehearsals under "community" so they do not count as concerts.
Run: python3 tools/clean_cal.py   (prints what it merged)"""
import json,re,difflib,sys
P='data/cal.json'
d=json.load(open(P));E=d['events']
GENERIC={'Jamestown Public Calendar','jamestownri.gov',''}
vk=lambda e:re.sub(r'[^a-z]','',(e.get('venue') or '').lower())[:8]
def core(s):
    s=s.lower();s=re.sub(r"\b(20\d\d|day \d|opening reception|reception|gallery viewing|viewing|exhibition|afternoon|hours|gathering|with [a-z .'’]+)\b",'',s)
    return re.sub(r'[^a-z]','',s)
def same(a,b):
    if a['date']!=b['date'] or (a.get('time') or '')!=(b.get('time') or '') or not a.get('time'):return False
    va,vb=vk(a),vk(b)
    if va and vb and va!=vb:return False
    ta,tb=a['artists'].lower(),b['artists'].lower()
    if difflib.SequenceMatcher(None,ta,tb).ratio()>=0.6:return True
    ca,cb=core(ta),core(tb)
    return len(ca)>=8 and len(cb)>=8 and (ca[:10]==cb[:10] or ca in cb or cb in ca)
for e in E:
    if str(e.get('time','')).strip().lower() in('unknown','tbd','tba','n/a'):e['time']=''
    if re.search(r'(?i)rehears',e.get('artists','')) and e.get('genre') in('live','classical','rock','jazz'):e['genre']='community'
out=[];merged=[]
for e in E:
    hit=next((k for k in out if same(k,e)),None)
    if not hit:out.append(e);continue
    keep,drop=(hit,e)
    if (hit.get('src') in GENERIC) and (e.get('src') not in GENERIC):
        out[out.index(hit)]=e;keep,drop=e,hit
    for f,v in drop.items():
        if v and not keep.get(f):keep[f]=v
    al=keep.setdefault('also_as',[])
    if drop['artists']!=keep['artists'] and drop['artists'] not in al:al.append(drop['artists'])
    merged.append((keep['date'],keep.get('time'),keep['artists'],'<=',drop['artists']))
d['events']=out
json.dump(d,open(P,'w'),ensure_ascii=False,indent=1)
print('merged',len(merged),'events',len(E),'->',len(out))
for m in merged[:int(sys.argv[1]) if len(sys.argv)>1 else 60]:print(' ',m)
