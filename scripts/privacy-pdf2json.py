import re, json, subprocess, sys
src, out = sys.argv[1], sys.argv[2]
txt = subprocess.run(['pdftotext', src, '-'], capture_output=True, text=True).stdout
lines = [l.strip() for l in txt.replace('\f', '\n').split('\n')]
# drop page numbers / empty
lines = [l for l in lines if l and not re.fullmatch(r'\d{1,2}', l)]
title, subtitle, meta = lines[0], lines[1], lines[2]
doc = {'title': title, 'subtitle': subtitle, 'meta': meta, 'sections': []}
sec = None; blocks = None; cur = None
def flush():
    global cur
    if cur: blocks.append(cur); cur = None
# Sub-headings (same in UZ / RU / EN PDFs)
HEADS = {'3.1', '3.2', '3.3', '3.4', '7.1', '7.2', '7.3'}
body = lines[3:]
for i, l in enumerate(body):
    m = re.match(r'^(\d{1,2})\.\s+(.+)$', l)
    if m and not re.match(r'^\d+\.\d', l):
        flush(); sec = {'n': int(m.group(1)), 'title': m.group(2), 'blocks': []}; doc['sections'].append(sec); blocks = sec['blocks']; continue
    if sec is None: continue
    if l in ('–', '-', '—', '•'):
        flush(); cur = {'t': 'li', 'text': ''}; continue
    m2 = re.match(r'^(\d+\.\d+(?:\.\d+)?)\.?\s+(.*)$', l)
    if m2:
        flush()
        nxt = body[i + 1] if i + 1 < len(body) else ''
        txt2 = m2.group(2)
        if m2.group(1) in HEADS and txt2[-1] not in '.:;,':
            blocks.append({'t': 'h', 'n': m2.group(1), 'text': txt2}); continue
        cur = {'t': 'p', 'n': m2.group(1), 'text': txt2}; continue
    if cur is None: cur = {'t': 'p', 'text': l}
    else:
        if cur['t'] == 'li' and not cur['text']: cur['text'] = l
        else: cur['text'] = (cur['text'] + ' ' + l).strip()
flush()
# fix hyphen line breaks like "560-II" + "son" -> keep, join "O'RQ764" can't detect; leave
json.dump(doc, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(src, 'sections', len(doc['sections']), [s['title'][:25] for s in doc['sections']])
