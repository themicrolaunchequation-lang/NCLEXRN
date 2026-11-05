import csv,datetime as D,os
P=os.path.abspath('build.py')
g={'__file__':P}; exec(open(P).read().split('# ---------- stage folders')[0],g)
V=g['VIDEOS'];A=g['APPS']
def post(v):
    t=g['linkedin'](v)['Post text']; ar=v['lang']=='ar'; l=g['link'](v,'li')
    for s in ["\n\nLink in the first comment 👇","\n\nالرابط في التعليق الأول 👇"]: t=t.replace(s,'')
    return t.replace(v['summary'],v['summary']+("\n\n👉 "+("ابدأوا مجانًا: " if ar else "Try it free: ")+l),1),l
def spread(vs):
    from collections import defaultdict
    by=defaultdict(list)
    for v in vs: by[v['app']].append(v)
    keyed=[((i+0.5)/len(L),k,v) for k,L in by.items() for i,v in enumerate(L)]
    out=[x[2] for x in sorted(keyed,key=lambda x:(x[0],x[1]))]
    for i in range(1,len(out)):   # avoid same app back-to-back
        if out[i]['app']==out[i-1]['app']:
            for j in range(i+1,len(out)):
                if out[j]['app']!=out[i]['app'] and (j+1>=len(out) or out[j+1]['app']!=out[i-1]['app'] or True):
                    out[i],out[j]=out[j],out[i];break
    return out
def dates(start,days,n,time):
    d=start;r=[]
    while len(r)<n:
        if d.weekday() in days: r.append((d,time))
        d+=D.timedelta(1)
    return r
hca=spread([v for v in V if v['app']!='LeanSixSigma']); lss=[v for v in V if v['app']=='LeanSixSigma']
rows=[]
for page,vs,dl in [('Healthcare Crown Academy',hca,dates(D.date(2026,11,10),{1,2,3},len(hca),'09:00')),('Lean Six Sigma for Healthcare',lss,dates(D.date(2026,11,11),{2},len(lss),'10:00'))]:
    for v,(d,t) in zip(vs,dl):
        f=os.path.basename(v[v['li']]); txt,l=post(v)
        rows.append({'Date':d.isoformat(),'Day':d.strftime('%a'),'Time':t,'Time zone':'Asia/Riyadh (GMT+3)','LinkedIn page':page,'App':A[v['app']]['name'],'Language':'Arabic' if v['lang']=='ar' else 'English',
          'Video file':f,'Video length':g['mmss'](v['dur']),'Shape':'9:16' if v['li']=='tall' else '16:9','Thumbnail file':f[:-4]+'.jpg','Video title':v['title'],
          'Post text':txt,'Link':l,'Characters':len(txt),'Video URL (fill in)':'','Thumbnail URL (fill in)':''})
H=list(rows[0])
def w(n,rs):
    with open('csv/'+n,'w',newline='',encoding='utf-8-sig') as f: c=csv.DictWriter(f,H);c.writeheader();c.writerows(rs)
w('LinkedIn-Schedule-ALL.csv',rows)
w('LinkedIn-Schedule-HealthcareCrownAcademy.csv',[r for r in rows if r['LinkedIn page'].startswith('Health')])
w('LinkedIn-Schedule-LeanSixSigma.csv',[r for r in rows if r['LinkedIn page'].startswith('Lean')])
for r in rows: print(r['Date'],r['Day'],r['LinkedIn page'][:4],r['App'][:14].ljust(14),r['Shape'],r['Characters'],r['Video file'])
