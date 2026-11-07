#!/usr/bin/env python3
"""Fail the build if a Jamestown record is tied to any state other than Rhode Island."""
import glob, re, sys
OTHER = r"(North Dakota|, ND\b|\bND \d|New York|, NY\b|, CA\b|California|Massachusetts|, MA\b|Connecticut|, CT\b|, NH\b|, VT\b|, ME\b|Ohio|, OH\b|Florida|Texas|Minnesota|Michigan|Illinois|Colorado|Wisconsin|Iowa|Oregon)"
pat = re.compile(r"Jamestown[^\n\"]{0,60}" + OTHER + r"|" + OTHER + r"[^\n\"]{0,60}Jamestown", re.I)
bad = []
for f in glob.glob('data/*.json') + ['index.html']:
    for m in pat.finditer(open(f, encoding='utf-8').read()):
        bad.append(f"{f}: {m.group(0)[:120]}")
if bad:
    print('\n'.join(bad)); sys.exit(1)
print('ok: no out-of-state Jamestown records')
