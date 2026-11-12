#!/usr/bin/env python3
"""Weather & Marine tab: collect the official sources that browsers cannot read directly
(no CORS): NOAA NDBC buoy and shore-station reports, U.S. Coast Guard NAVCEN maritime safety
notices near Jamestown, and the NWS coastal waters forecast text for Narragansett Bay.
Writes data/marine.json. Standard library only. Public data, read only.

Usage: python3 -I tools/marine/fetch_marine.py [repo_dir]
"""
import json, math, os, sys, time, datetime as dt, urllib.request

UA = {'User-Agent': 'JamestownIslandNews/1.0 (weather tab; jamestownislandnews.com)'}
HOME = (41.4968, -71.3672)   # Jamestown, Conanicut Island
NEAR_NM = 25                  # Coast Guard notices within this many nautical miles

BUOYS = [  # NOAA NDBC station id, plain name, what it is
    ('NWPR1', 'Newport (Naval Station pier)', 'Shore station: wind, pressure, water temperature'),
    ('PDVR1', 'Quonset / Port of Davisville', 'Shore station: wind, water temperature'),
    ('CPTR1', 'Conimicut Light', 'Upper bay: wind, water temperature'),
    ('PRUR1', 'Prudence Island', 'Mid-bay: air temperature, wind'),
    ('44097', 'Block Island buoy (offshore)', 'Open ocean: wave height, period, direction'),
    ('BUZM3', 'Buzzards Bay tower', 'Offshore tower: wind, pressure'),
]
NAVCEN_LAYERS = ['msib', 'hazNav', 'marEvent', 'safeZone', 'misc', 'bridge', 'marCon', 'navalAct', 'tmpChange']


def get(url, tries=3):
    for a in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:
            if getattr(e, 'code', None) in (403, 404): raise
            time.sleep(3 + 5 * a)
    raise RuntimeError('unreachable: ' + url)


def num(v):
    try:
        return None if v in ('MM', '', None) else float(v)
    except ValueError:
        return None


def buoy(sid):
    lines = get(f'https://www.ndbc.noaa.gov/data/realtime2/{sid}.txt').splitlines()
    head = lines[0].lstrip('#').split()
    rows = [dict(zip(head, l.split())) for l in lines[2:50] if l.strip() and not l.startswith('#')]
    if not rows: return None
    def t(r): return dt.datetime(int(r['YY']), int(r['MM']), int(r['DD']), int(r['hh']), int(r['mm']), tzinfo=dt.timezone.utc)
    newest = t(rows[0])
    out = {'time': newest.isoformat().replace('+00:00', 'Z')}
    # Each value: the latest report of it within 3 hours of the newest report (stations skip fields).
    for k in ['WDIR', 'WSPD', 'GST', 'WVHT', 'DPD', 'MWD', 'PRES', 'ATMP', 'WTMP']:
        for r in rows:
            if newest - t(r) > dt.timedelta(hours=3): break
            v = num(r.get(k))
            if v is not None:
                out[k] = v; break
    ms_kt = 1.943844
    o = {'time': out['time']}
    if 'WDIR' in out: o['wdir'] = int(out['WDIR'])
    if 'WSPD' in out: o['wspd_kt'] = round(out['WSPD'] * ms_kt, 1)
    if 'GST' in out: o['gst_kt'] = round(out['GST'] * ms_kt, 1)
    if 'WVHT' in out: o['wvht_ft'] = round(out['WVHT'] * 3.28084, 1)
    if 'DPD' in out: o['dpd_s'] = out['DPD']
    if 'MWD' in out: o['mwd'] = int(out['MWD'])
    if 'PRES' in out: o['pres_mb'] = out['PRES']
    if 'ATMP' in out: o['atmp_f'] = round(out['ATMP'] * 9 / 5 + 32)
    if 'WTMP' in out: o['wtmp_f'] = round(out['WTMP'] * 9 / 5 + 32)
    return o


def nm(lat, lon):
    la1, lo1 = map(math.radians, HOME); la2, lo2 = math.radians(lat), math.radians(lon)
    a = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 3440.065 * 2 * math.asin(math.sqrt(a))


def coords(g):
    """Every [lon, lat] pair in a GeoJSON geometry."""
    if not g: return []
    c, out = g.get('coordinates'), []
    def walk(x):
        if isinstance(x, (list, tuple)) and len(x) >= 2 and all(isinstance(v, (int, float)) for v in x[:2]):
            out.append(x); return
        for y in x or []: walk(y)
    walk(c)
    return out


def uscg():
    now_ms = time.time() * 1000
    items, seen, errors = [], set(), []
    for layer in NAVCEN_LAYERS:
        for shape in ('', 'Line', 'Poly'):
            url = f'https://www.navcen.uscg.gov/sites/default/files/msi/{layer}{shape}_1.geojson'
            try:
                d = json.loads(get(url))
            except Exception as e:
                if shape == '': errors.append(f'{layer}: {e}')
                continue
            for f in d.get('features', []):
                p = f.get('properties') or {}
                if p.get('END_DATE') and p['END_DATE'] < now_ms: continue
                pts = coords(f.get('geometry'))
                if not pts and p.get('DECIMAL_LATITUDE'): pts = [[p['DECIMAL_LONGITUDE'], p['DECIMAL_LATITUDE']]]
                if not pts: continue
                dist = min(nm(y, x) for x, y in pts)
                if dist > NEAR_NM: continue
                key = (p.get('TITLE'), p.get('BEGIN_DATE'))
                if key in seen: continue
                seen.add(key)
                desc = ' '.join((p.get('DESCRIPTION') or '').split())
                ms = lambda v: dt.datetime.fromtimestamp(v / 1000, dt.timezone.utc).date().isoformat() if v else ''
                items.append({'title': p.get('TITLE') or '', 'group': p.get('SUB_CATEGORY') or p.get('MSI_GROUP') or '',
                              'type': p.get('TYPE') or '', 'waterway': p.get('WATERWAY_NAME') or '',
                              'begin': ms(p.get('BEGIN_DATE')), 'end': ms(p.get('END_DATE')),
                              'updated': ms(p.get('MODIFIED_DATE')), 'nm': round(dist, 1), 'desc': desc[:900]})
    items.sort(key=lambda x: (x['nm'], x['title']))
    return items, errors


def main():
    repo = sys.argv[1] if len(sys.argv) > 1 else '.'
    path = os.path.join(repo, 'data', 'marine.json')
    prev = json.load(open(path)) if os.path.exists(path) else {}
    out = {'updated': dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z'),
           'note': 'Collected hourly from NOAA NDBC, U.S. Coast Guard NAVCEN and NWS. Not for navigation.',
           'buoys': [], 'uscg': [], 'cwf': None, 'errors': []}
    old = {b['id']: b for b in prev.get('buoys', [])}
    for sid, name, what in BUOYS:
        try:
            b = buoy(sid)
        except Exception as e:
            out['errors'].append(f'{sid}: {e}'); b = None
        if b is None and sid in old:   # keep the last good report, marked by its own time
            b = {k: v for k, v in old[sid].items() if k not in ('id', 'name', 'what')}
        if b: out['buoys'].append({'id': sid, 'name': name, 'what': what, **b})
    try:
        out['uscg'], errs = uscg(); out['errors'] += errs
    except Exception as e:
        out['errors'].append(f'uscg: {e}'); out['uscg'] = prev.get('uscg', [])
    try:
        txt = get('https://tgftp.nws.noaa.gov/data/forecasts/marine/coastal/an/anz236.txt')
        out['cwf'] = {'zone': 'ANZ236', 'name': 'Narragansett Bay', 'text': txt.strip()[:6000]}
    except Exception as e:
        out['errors'].append(f'cwf: {e}'); out['cwf'] = prev.get('cwf')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print(f"buoys {len(out['buoys'])}, coast guard notices {len(out['uscg'])}, errors {out['errors']}")


if __name__ == '__main__':
    main()
