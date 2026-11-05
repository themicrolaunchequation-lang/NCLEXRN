import os, sys, subprocess, json, html, shutil
sys.path.insert(0, os.path.dirname(__file__))
from data import *
ROOT='/tmp/claude-0/-home-user/64875240-536c-5f55-bced-1f66042dcbfa/scratchpad/pack'
STAGE=ROOT+'/stage'
OTHERDIR={'LeanSixSigma':'lean-six-sigma','GulfRegionNursing':'gulf-region-nursing','Evinca':'evinca'}
def path(v,shape):
    suf='landscape-16x9' if shape=='wide' else 'portrait-9x16'
    p=(MINE if v['src']=='mine' else OTHER+'/'+OTHERDIR[v['app']])+f"/{v['file']}-{suf}.mp4"
    return p if os.path.exists(p) else None
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
def mmss(s): s=int(round(s)); return f'{s//60}:{s%60:02d}'
for v in VIDEOS:
    v['wide']=path(v,'wide'); v['tall']=path(v,'tall'); v['dur']=dur(v['wide'] or v['tall'])
# extra: Lumen short portrait only
VIDEOS.insert([i for i,v in enumerate(VIDEOS) if v['file']=='Lumen-ReaderAllFeatures'][0]+1, dict(app='Lumen',file='Lumen-ReaderShort45s',src='mine',title='Your PDF Can Do Way More Than You Think | Lumen',hook='Your PDF can do way more than you think.',
  summary='Draw, highlight, magnify, drop clinical stickers, calculate, turn notes into slides or export to PowerPoint and Word, then recall before you reveal. PDFs stay on your device.',
  points=['Pen and highlight','Magnifier, stickers, calculator','Slides, export, recall'],kw_extra='pdf study app, study hacks',ref='reader-short',lang='en',short_title='Your PDF can do more',li_open=None,
  wide=None,tall=MINE+'/Lumen-ReaderShort45s-portrait-9x16.mp4',dur=dur(MINE+'/Lumen-ReaderShort45s-portrait-9x16.mp4')))

def yt_title(v):
    a=APPS[v['app']]; t=v['title']
    if v['lang']=='en' and '|' not in t and len(t+' | '+a['name'])<=70: t=t+' | '+a['name']
    return t
def tags(v):
    a=APPS[v['app']]; t=(v['kw_extra']+', '+a['tags_base']) if v['lang']=='en' else (v['kw_extra']+', '+a['tags_base'])
    out=[];n=0
    for x in [s.strip() for s in t.split(',') if s.strip()]:
        if x.lower() in [o.lower() for o in out]: continue
        if n+len(x)+2>480: break
        out.append(x); n+=len(x)+2
    return ', '.join(out)
def link(v,plat): return APPS[v['app']]['url']+f"?ref={v['ref']}-{plat}"
def notes(v):
    a=APPS[v['app']]; L=[]
    if v['lang']=='ar': L.append(GULF_DISC_AR); L.append(GULF_DISC)
    else:
        if a['disc']: L.append(a['disc'])
        if a.get('sample'): L.append(a['sample'])
    L.append('صُنعت الأصوات بالذكاء الاصطناعي.' if v['lang']=='ar' else 'Voices are AI-generated.')
    return L
AR_HT=['#تمريض','#اختبار_التمريض','#برومترك','#ممرضات','#ترخيص_مهني']
REG_AR={'saudi-ar':'#هيئة_التخصصات_الصحية #السعودية','qatar-ar':'#قطر #DHP','dubai-ar':'#دبي #DHA','abudhabi-ar':'#أبوظبي #DOH'}
def hts(v,n=5):
    if v['lang']=='ar': return ' '.join(AR_HT[:3])+' '+REG_AR.get(v['ref'],'')
    return ' '.join(APPS[v['app']]['ht'][:n])

def youtube(v, shorts=False):
    a=APPS[v['app']]; ar=v['lang']=='ar'; plat='ytshorts' if shorts else 'yt'
    if shorts:
        title=(v['hook'] if len(v['hook'])<=90 else v['hook'][:88]+'…')+' #Shorts'
    else: title=yt_title(v)
    pts=''.join(f'\n• {p}' for p in v['points'])
    if ar:
        desc=f"{v['hook']}\n{v['summary']}\n\n▶ ابدأوا مجانًا: {link(v,plat)}\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v)}"
    else:
        desc=f"{v['hook']} {v['summary']}"+(f"\n\nIn this video:{pts}" if pts and not shorts else '')+f"\n\n▶ Try it free: {link(v,plat)}\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v,3)}"
    s=dict(Title=title,Description=desc)
    if not shorts:
        s['Tags (paste into Tags box)']=tags(v)
        s['Pinned comment']=('ما أصعب جزء في الاختبار بالنسبة لكم؟ جرّبوا عشرة أسئلة مجانًا: '+link(v,'ytcomment')) if ar else f"What would you try first? Start free here: {link(v,'ytcomment')}"
        t=v['short_title']
        if len(t)>34:
            w=t.split('.')[0].split('?')[0].split(); t=''
            for x in w:
                if len(t+' '+x)>34: break
                t=(t+' '+x).strip()
        s['Thumbnail text (3–5 words)']=t
        s['Playlist']=a['playlist']
        s['Settings']=('Category: Education · Audience: No, not made for kids · Video language: Arabic · Captions: burned in; also upload Arabic auto-captions after review · Altered or synthetic content: Yes (AI voices) · End screen: Subscribe + this playlist + the English version · Comments: on, hold potentially inappropriate'
            if ar else 'Category: Education · Audience: No, not made for kids · Video language: English (UK) · Captions: burned in; also publish auto-captions after review · Altered or synthetic content: Yes (AI voices) · Licence: Standard YouTube · Allow embedding: on · End screen: Subscribe + this playlist (last 10–15 s) · Card at the CTA moment: link to the app if your channel is eligible')
    else:
        s['Settings']='Upload as a Short (vertical, under 3 min). Related video: link the landscape version. Same category, audience and AI-voice disclosure as the main video.'
    return s
def facebook(v):
    a=APPS[v['app']]; ar=v['lang']=='ar'; reel=v['fb']=='tall'
    if ar: cap=f"{v['hook']}\n{v['summary']}\n\n👈 ابدأوا مجانًا: {link(v,'fb')}\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v)}"
    else: cap=f"{v['hook']}\n\n{v['summary']}\n\n👉 Try it free: {link(v,'fb')}\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v,4)}"
    return {'Post as':('Reel (9:16)' if reel else 'Video post (16:9)')+' on the Healthcare Crown Academy Page','Caption':cap,
        'Settings':'Title: '+v['title']+' · Cover: a clear frame from the hook · Turn on auto-generated captions · AI info: label as AI-generated audio if asked · Share to Instagram as well if your accounts are linked · If boosting: button "Learn more" to the link above',
        'Boost targeting (if you pay to promote)':APPS[v['app']]['fb_target']+(' Language: Arabic.' if ar else '')}
def linkedin(v):
    a=APPS[v['app']]; ar=v['lang']=='ar'
    pts=''.join(f'\n▸ {p}' for p in v['points'])
    if ar: post=f"{v['hook']}\n\n{v['summary']}\n\nالرابط في التعليق الأول 👇\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v)}"
    else: post=f"{v['hook']}\n\n{v['summary']}"+(f"\n{pts}" if pts else '')+"\n\nLink in the first comment 👇\n\n"+'\n'.join(notes(v))+f"\n\n{hts(v,4)}"
    return {'Post as':('Native video, '+('9:16' if v['li']=='tall' else '16:9')+', from the company Page, then reshare from your personal profile with one line of your own'),
        'Post text':post,'First comment (paste right after posting)':('ابدأوا مجانًا: ' if ar else 'Try it free: ')+link(v,'li'),
        'Settings':'Video title: '+v['title']+' · Add a thumbnail from the hook · Captions are burned in · Post Tue–Thu, 08:00–10:00 audience local time · Reply to every comment in the first hour',
        'Targeting (if sponsoring)':a['li_target']}

# platform file choice
for v in VIDEOS:
    v['fb']='tall' if (v['tall'] and v['dur']<=90) or not v['wide'] else 'wide'
    v['li']=v['fb']
    v['yt_short']=bool(v['tall'] and v['dur']<=180)

# ---------- stage folders (hard links, no extra disk)
shutil.rmtree(STAGE,ignore_errors=True)
PL={'YouTube':'YouTube','Facebook':'Facebook','LinkedIn':'LinkedIn'}
def ln(src,dst): os.makedirs(os.path.dirname(dst),exist_ok=True); os.link(src,dst)
def block(title,d):
    return f"\n=== {title} ===\n"+'\n'.join(f"\n[{k}]\n{val}" for k,val in d.items())+'\n'
for app in APPS:
    vids=[v for v in VIDEOS if v['app']==app]
    ytt=f"{APPS[app]['name']} · YouTube copy (paste-ready)\nPlaylist: {APPS[app]['playlist']}\n"
    fbt=f"{APPS[app]['name']} · Facebook copy (paste-ready)\n"; lit=f"{APPS[app]['name']} · LinkedIn copy (paste-ready)\n"
    for v in vids:
        base=f"HCA-YouTube/{app}"
        if v['wide']: ln(v['wide'],f"{STAGE}/{base}/Main-16x9/{os.path.basename(v['wide'])}"); ytt+=block(f"MAIN VIDEO · {os.path.basename(v['wide'])} · {mmss(v['dur'])}",youtube(v))
        if v['yt_short']: ln(v['tall'],f"{STAGE}/{base}/Shorts-9x16/{os.path.basename(v['tall'])}"); ytt+=block(f"SHORT · {os.path.basename(v['tall'])} · {mmss(v['dur'])}",youtube(v,True))
        f=v[v['fb']]; ln(f,f"{STAGE}/HCA-Facebook/{app}/{os.path.basename(f)}"); fbt+=block(f"{os.path.basename(f)} · {mmss(v['dur'])}",facebook(v))
        f=v[v['li']]; ln(f,f"{STAGE}/HCA-LinkedIn/{app}/{os.path.basename(f)}"); lit+=block(f"{os.path.basename(f)} · {mmss(v['dur'])}",linkedin(v))
    for pdir,txt,name in [('HCA-YouTube',ytt,'YouTube'),('HCA-Facebook',fbt,'Facebook'),('HCA-LinkedIn',lit,'LinkedIn')]:
        open(f"{STAGE}/{pdir}/{app}/{app}-{name}-COPY.txt",'w').write(txt)
json.dump([{k:v[k] for k in ('app','file','dur','fb','li','yt_short','lang','src')} for v in VIDEOS],open(ROOT+'/inventory.json','w'),indent=1)

# ---------- PDF
KW=json.load(open(ROOT+'/kw.json'))
E=html.escape
def tbl(rows,head):
    return '<table><tr>'+''.join(f'<th>{h}</th>' for h in head)+'</tr>'+''.join('<tr>'+''.join(f'<td>{c}</td>' for c in r)+'</tr>' for r in rows)+'</table>'
def pre(s,ar=False): return f'<div class="copy" dir="{"rtl" if ar else "ltr"}">{E(s)}</div>'
H=[]
H.append(f'''<section class="cover"><div class="kicker">Healthcare Crown Academy</div><h1>Social Publishing Pack</h1><p class="sub">YouTube · Facebook · LinkedIn<br>{len(VIDEOS)} videos · 7 apps · English and Arabic</p><p class="small">Prepared 4 November 2026. Every title, description, tag set and post below is ready to copy and paste. Keyword data: vidIQ (YouTube search estimates, retrieved 4 Nov 2026).</p></section>''')
H.append('''<h2>1. How to use this pack</h2><ol>
<li>Each zip holds one platform: <b>HCA-YouTube</b>, <b>HCA-Facebook</b>, <b>HCA-LinkedIn</b>. Inside, there is one folder per app with the videos and a <b>COPY.txt</b> file containing exactly what you paste.</li>
<li>YouTube folders have <b>Main-16x9</b> (normal uploads) and <b>Shorts-9x16</b> (vertical, under 3 minutes). Facebook and LinkedIn folders hold the single best shape for that platform: vertical for videos up to 90 seconds, landscape for longer ones.</li>
<li>Every link carries a <code>?ref=</code> code (for example <code>?ref=copq-yt</code>) so you can see which platform and video brought each visitor.</li>
<li>Keep the honesty lines in every post: the Gulf disclaimer, “illustrative samples” where shown, “not medical treatment” for Serein, and “Voices are AI-generated”.</li>
<li>Prices and discount codes are deliberately left out (except where your other account’s Gulf “Why Us” video already shows them on screen).</li></ol>''')
# keyword research
krows=[(E(k['kw']),k['vol'],k['comp'],k['search'],E(k['use'])) for k in KW]
H.append('<h2>2. Keyword research (YouTube)</h2><p>Volume and competition are vidIQ scores from 0 to 100. Lower competition is easier to rank for. Monthly searches are vidIQ estimates for YouTube only; Facebook and LinkedIn do not publish search volumes, so they rely on hashtags, the first line of text and audience targeting.</p>'+tbl(krows,['Keyword','Volume','Competition','Est. monthly searches','How we use it']))
H.append('''<h3>What the data says</h3><ul>
<li><b>Exact niche terms are tiny on YouTube</b>: “SNLE exam”, “DHA exam for nurses”, “SBAR nursing”, “medical terminology” and “nursing awards” each show under 750 searches a month. That is good news, because the competition is also low (12–34), so a well-titled video can rank near the top. Always pair the niche term with one broad, high-volume term in the title or first line.</li>
<li><b>Best opportunities (high volume, low competition)</b>: “lean six sigma healthcare” (5.3k, competition 30), “operational excellence” (8.7k, 27), “nurse burnout” (6.6k, 30), “burnout recovery” (64k, 39), “how to lock in studying” (21.7k, 30), “green belt” (7.2k, rising +80%), “six sigma” (20k, rising +83%), “medical terms” (8.1k, rising +148%), “nclex review” (9.9k, rising +84%).</li>
<li><b>Gulf</b>: most searchers come from the source countries (India, the Philippines, Egypt and others), so English titles that name the exam (SNLE, DHA, DOH, DHP, Prometric) reach them. Arabic titles and hashtags reach candidates already in the Gulf.</li></ul>''')
H.append('''<h2>3. Platform settings: the essentials</h2>'''+tbl([
 ['Title','70 characters or fewer, main keyword first, app name last','The first line of the caption is the headline (about 125 characters show)','The first 2 lines show before “see more”: put the hook there'],
 ['Description / text','The first 150 characters appear in search: hook + keyword + benefit. Then the summary, link, disclaimer and 3 hashtags','Hook, one benefit line, link, disclaimer, 3–5 hashtags','Hook, 2–4 short lines, “link in first comment”, 3–5 hashtags'],
 ['Links','In the description and the pinned comment','In the caption; the “Learn more” button when boosting','Put the link in the first comment: posts with links in the body get less reach'],
 ['Format','Landscape main video + vertical Short (under 3 min)','Reels (vertical, up to 90 s) reach the most people','Native upload; vertical works well on mobile'],
 ['Captions','Burned in; also publish the auto-captions','Burned in; turn on auto-captions','Burned in'],
 ['AI disclosure','“Altered or synthetic content”: Yes (AI voices)','Label as AI-generated audio if asked','Say “Voices are AI-generated” in the text'],
 ['Best times to post (starting points, then check your analytics)','Weekdays 17:00–20:00 audience local time; Shorts any day','Weekdays 12:00–15:00 and evenings 19:00–21:00','Tuesday to Thursday 08:00–10:00'],
 ['Rhythm','2 main videos + 3 Shorts a week','1 Reel a day','2–3 posts a week'],
],['Setting','YouTube','Facebook','LinkedIn']))
H.append('''<h3>Four-week posting plan (suggested)</h3>'''+tbl([
 ['Week 1','Gulf: All-in-one + SNLE (EN and AR) · MedLex: Decode any word','Lean Six Sigma: Cost of Poor Quality · Carecraft: SBAR'],
 ['Week 2','Gulf: DHA and DOH (EN and AR) · Lumen: Reader (full + short)','Lean Six Sigma: Red Bead Ward · Serein: Two-minute pause'],
 ['Week 3','Gulf: Qatar DHP (EN and AR), Why Us · MedLex: Build the word, Root cards','Evinca: Where do you come in, Proof page · Carecraft: Teach-back'],
 ['Week 4','Gulf: Reasoning, BE-FAST, Glossary · Lumen: Recall cards, Focus','Lean Six Sigma: Certificate, Cp/Cpk, Swimlane · Serein and Evinca remaining'],
],['Week','Mostly Gulf, students (YouTube Shorts, Facebook Reels)','Professionals (LinkedIn, YouTube main)']))
# playlists/channel
H.append('<h3>YouTube channel set-up</h3><ul><li>One playlist per app (names are in each copy block). Add every Short to its app playlist too.</li><li>Channel keywords: '+E('Healthcare Crown Academy, nursing education, medical terminology, lean six sigma healthcare, SNLE, DHA exam, nurse burnout, study tips')+'.</li><li>Channel trailer: Gulf Region Nursing “Why Us” for Gulf visitors, or Lumen reader for students.</li><li>Use the Arabic videos with an Arabic title and description, and add the English version as a related video.</li></ul>')
# per app sections
for app,a in APPS.items():
    vids=[v for v in VIDEOS if v['app']==app]
    H.append(f'<h2 class="pb">{E(a["name"])} · {len(vids)} videos</h2><p><b>Link:</b> {E(a["url"])}<br><b>Primary keywords:</b> {E(", ".join(a["kw"]))}<br><b>Facebook targeting:</b> {E(a["fb_target"])}<br><b>LinkedIn targeting:</b> {E(a["li_target"])}</p>')
    H.append(tbl([(E(v['file']),mmss(v['dur']),'AR' if v['lang']=='ar' else 'EN',('16:9'+(' + Short' if v['yt_short'] else '')) if v['wide'] else 'Short only',('Reel 9:16' if v['fb']=='tall' else '16:9'),('9:16' if v['li']=='tall' else '16:9')) for v in vids],['Video','Length','Lang','YouTube','Facebook','LinkedIn']))
    for v in vids:
        ar=v['lang']=='ar'
        H.append(f'<h3>{E(v["file"])} <span class="tag">{mmss(v["dur"])}</span></h3>')
        if v['wide']:
            y=youtube(v); H.append('<h4>YouTube (main)</h4>'+''.join(f'<div class="lbl">{E(k)}</div>'+pre(val,ar and k in("Title","Description","Pinned comment")) for k,val in y.items()))
        if v['yt_short']:
            y=youtube(v,True); H.append('<h4>YouTube Short</h4>'+''.join(f'<div class="lbl">{E(k)}</div>'+pre(val,ar and k!="Settings") for k,val in y.items()))
        f=facebook(v); H.append('<h4>Facebook</h4>'+''.join(f'<div class="lbl">{E(k)}</div>'+pre(val,ar and k=="Caption") for k,val in f.items()))
        l=linkedin(v); H.append('<h4>LinkedIn</h4>'+''.join(f'<div class="lbl">{E(k)}</div>'+pre(val,ar and k in("Post text","First comment (paste right after posting)")) for k,val in l.items()))
H.append('<h2 class="pb">Before you post: checklist</h2><ul><li>Watch and listen to each video once (sound was not checked by ear).</li><li>Arabic titles and posts: ask a native Arabic-speaking nurse to review them.</li><li>Gulf exam numbers: confirm with the regulator if a post goes out after November 2026.</li><li>Evinca: two sets exist. The short videos (about 50 s) suit Shorts and Reels; the long ones (2½–3½ min) suit YouTube main and LinkedIn. Post the short and long versions of “Where do you come in” and “Proof page” at least two weeks apart.</li><li>Reply to comments in the first hour; pin the best question.</li></ul>')
CSS='''@page{size:A4;margin:16mm 14mm}body{font-family:Inter,"Noto Sans Arabic",Arial,sans-serif;color:#0f172a;font-size:10.5pt;line-height:1.45}
h1{font-size:34pt;margin:8px 0}h2{color:#0f766e;font-size:17pt;margin:22px 0 8px;border-bottom:2px solid #0f766e;padding-bottom:4px}h3{font-size:12.5pt;margin:16px 0 6px;color:#1e293b}h4{margin:10px 0 4px;color:#0f766e;font-size:11pt}
.pb{page-break-before:always}.cover{height:250mm;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(160deg,#071428,#0b2440 60%,#08313a);color:#fff;margin:-16mm -14mm 0;padding:0 22mm;page-break-after:always}
.cover .kicker{color:#5eead4;letter-spacing:.2em;text-transform:uppercase;font-weight:700}.cover .sub{font-size:15pt;color:#e2e8f0}.cover .small{color:#94a3b8;font-size:9.5pt;margin-top:30px}
table{border-collapse:collapse;width:100%;margin:6px 0 10px;font-size:9pt}th{background:#0f766e;color:#fff;text-align:left;padding:5px}td{border:1px solid #cbd5e1;padding:4px 5px;vertical-align:top}
.copy{white-space:pre-wrap;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:7px 9px;font-size:9.2pt;margin:2px 0 6px;page-break-inside:avoid}
.copy[dir=rtl]{text-align:right;font-family:"Noto Sans Arabic","Noto Naskh Arabic",Arial,sans-serif;font-size:10pt}.lbl{font-size:8.5pt;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
.tag{background:#e2e8f0;border-radius:4px;padding:1px 6px;font-size:9pt;font-weight:600;color:#334155}code{background:#e2e8f0;padding:0 3px;border-radius:3px}'''
open(ROOT+'/guide.html','w').write(f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>HCA Social Publishing Pack</title><style>{CSS}</style></head><body>'+''.join(H)+'</body></html>')
print('videos',len(VIDEOS))
