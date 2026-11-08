#!/usr/bin/env python3
"""Map every color literal in the site's CSS/HTML/JS to the nautical palette.

Usage: python3 tools/nautical_colors.py <repo-dir>
Skips the nauticalTop block (signal flags need their true colors).
Idempotent: palette colors map to themselves.
"""
import colorsys, os, re, sys

WHITE, FLUFF, HAINT, MIST = '#FFFFFF', '#EEE9E5', '#D4ECF5', '#8A9DA1'
FLAG, YANKEE, DEEP, NAVY, RED = '#0F4C9A', '#002D57', '#0F1F36', '#0A1428', '#B5123A'
KEEP = {c.lower() for c in (WHITE, FLUFF, HAINT, MIST, FLAG, YANKEE, DEEP, NAVY, RED, '#E8B820', '#C2B2A3')}

NAMED = {'black': '000000', 'white': 'ffffff', 'red': 'ff0000', 'gold': 'ffd700', 'orange': 'ffa500',
         'yellow': 'ffff00', 'green': '008000', 'lime': '00ff00', 'pink': 'ffc0cb', 'purple': '800080',
         'magenta': 'ff00ff', 'cyan': '00ffff', 'crimson': 'dc143c', 'goldenrod': 'daa520', 'tomato': 'ff6347',
         'orangered': 'ff4500', 'hotpink': 'ff69b4', 'deeppink': 'ff1493', 'gray': '808080', 'grey': '808080',
         'silver': 'c0c0c0', 'navy': '000080', 'blue': '0000ff', 'brown': 'a52a2a', 'maroon': '800000',
         'khaki': 'f0e68c', 'tan': 'd2b48c', 'beige': 'f5f5dc', 'ivory': 'fffff0', 'wheat': 'f5deb3',
         'darkred': '8b0000', 'firebrick': 'b22222', 'teal': '008080', 'olive': '808000', 'coral': 'ff7f50',
         'salmon': 'fa8072', 'violet': 'ee82ee', 'indigo': '4b0082', 'lightgray': 'd3d3d3', 'darkgray': 'a9a9a9',
         'whitesmoke': 'f5f5f5', 'gainsboro': 'dcdcdc', 'linen': 'faf0e6', 'cornsilk': 'fff8dc'}


def target(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    h *= 360
    if s < 0.18 or l < 0.06 or l > 0.97:
        if l > 0.93: return WHITE
        if l > 0.84: return FLUFF if (r > b + 6) else WHITE
        if l > 0.66: return HAINT
        if l > 0.40: return MIST
        if l > 0.22: return YANKEE
        if l > 0.10: return DEEP
        return NAVY
    if h >= 330 or h < 18:  # reds
        if l > 0.82: return FLUFF
        if l < 0.2: return DEEP
        return RED
    if h < 75:  # orange, gold, yellow, brown
        if l > 0.84: return FLUFF
        if l < 0.28: return DEEP
        return HAINT
    if h < 170:  # greens
        if l < 0.25: return DEEP
        if l > 0.7: return HAINT
        return FLAG if l < 0.45 else HAINT
    if h < 265:  # cyans and blues
        if l < 0.13: return NAVY
        if l < 0.24: return DEEP if s < 0.7 else YANKEE
        if l < 0.38: return YANKEE
        if l < 0.62: return FLAG
        return HAINT
    # purples, magentas, pinks
    if l < 0.3: return YANKEE
    if l > 0.82: return FLUFF
    return RED


def hx(c):
    return '#%02X%02X%02X' % c


def to_rgb(t):
    t = t.lstrip('#')
    return int(t[0:2], 16), int(t[2:4], 16), int(t[4:6], 16)


def map_hex(m):
    pre, hexs = m.group(1), m.group(2)
    if len(hexs) in (3, 4):
        rgb, a = hexs[:3], hexs[3:]
        full = ''.join(ch * 2 for ch in rgb); alpha = a * 2 if a else ''
    else:
        full, alpha = hexs[:6], hexs[6:]
    if ('#' + full).lower() in KEEP: return m.group(0)
    return pre + target(*to_rgb(full)) + alpha.upper()


def map_rgb(m):
    fn, a, b_, c, rest = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5) or ''
    try:
        r, g, b = (round(float(x)) for x in (a, b_, c))
    except ValueError:
        return m.group(0)
    if max(r, g, b) > 255: return m.group(0)
    t = target(r, g, b)
    if t.lower() in KEEP and hx((r, g, b)).lower() == t.lower(): return m.group(0)
    R, G, B = to_rgb(t)
    return '%s(%d,%d,%d%s)' % (fn, R, G, B, rest)


HEX = re.compile(r'''((?<!href=")(?<!&)(?:^|(?<=[\s:(,'"=>\\]))|[\s:(,'"=>])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])''')
HEX = re.compile(r'''(?<![\w&/-])(#)([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])''')
RGB = re.compile(r'(rgba?)\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*((?:,|/)\s*[\d.%]+\s*)?\)')
NAMEDRE = re.compile(r'(?<=[:\s,(])(' + '|'.join(sorted(NAMED, key=len, reverse=True)) + r')(?=\s*[;!}),\'"]|\s+\d)', re.I)


def map_hexm(m):
    hexs = m.group(2)
    if len(hexs) in (3, 4):
        full = ''.join(ch * 2 for ch in hexs[:3]); alpha = hexs[3:] * 2 if len(hexs) == 4 else ''
    else:
        full, alpha = hexs[:6], hexs[6:]
    if ('#' + full).lower() in KEEP: return m.group(0)
    return target(*to_rgb(full)) + alpha.upper()


def map_css(text, named=True):
    text = HEX.sub(map_hexm, text)
    text = RGB.sub(map_rgb, text)
    if named:
        text = NAMEDRE.sub(lambda m: target(*to_rgb(NAMED[m.group(1).lower()])), text)
    return text


def css_in_js(text):
    # only touch string literals that look like CSS (contain a property: value or a color function)
    def fix(m):
        s = m.group(0)
        if re.search(r'(color|background|border|shadow|fill|stroke|outline|--[\w-]+)\s*:|rgba?\(|gradient\(', s) or re.fullmatch(r'''['"`]#[0-9a-fA-F]{3,8}['"`]''', s):
            return map_css(s, named=True)
        return s
    return re.sub(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`", fix, text)


def do_html(t):
    keep = {}
    def stash(m):
        k = '\x00K%d\x00' % len(keep); keep[k] = m.group(0); return k
    t = re.sub(r'<style id="nauticalTop">.*?</style>', stash, t, flags=re.S)
    t = re.sub(r'(<style[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + map_css(m.group(2)) + m.group(3), t, flags=re.S)
    t = re.sub(r'(<script(?![^>]*\bsrc=)[^>]*>)(.*?)(</script>)', lambda m: m.group(1) + css_in_js(m.group(2)) + m.group(3), t, flags=re.S)
    t = re.sub(r'(style=")([^"]*)(")', lambda m: m.group(1) + map_css(m.group(2)) + m.group(3), t)
    t = re.sub(r'(<meta name="theme-color" content=")([^"]*)', lambda m: m.group(1) + map_css(m.group(2)), t)
    for k, v in keep.items(): t = t.replace(k, v)
    return t


def main(repo):
    n = 0
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'preview', 'preview-light', 'img', 'data', 'tools')]
        for f in files:
            p = os.path.join(root, f)
            if f.endswith('.css'): new = map_css(open(p).read())
            elif f.endswith('.js') and f != 'sw.js': new = css_in_js(open(p).read())
            elif f.endswith('.html'): new = do_html(open(p).read())
            else: continue
            old = open(p).read()
            if new != old:
                open(p, 'w').write(new); n += 1; print('  recolored', os.path.relpath(p, repo))
    print(repo, n, 'files')


if __name__ == '__main__':
    main(sys.argv[1])
