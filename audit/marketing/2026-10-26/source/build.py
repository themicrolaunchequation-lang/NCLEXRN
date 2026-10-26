"""Builds one bilingual (English + Arabic) marketing-plan HTML per app. render.js prints them to PDF."""
import html, importlib, pathlib, sys

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'html'
OUT.mkdir(exist_ok=True)
e = html.escape

# Figures used in every plan. Each one has a source in SHARED_SOURCES.
SHARED_SOURCES = [
    ('Meta ads, education CPC about US$0.70 (Vaizle)', 'https://insights.vaizle.com/facebook-ad-benchmarks/'),
    ('Meta ads, education CPC about US$1.06 (Trendtrack)', 'https://www.trendtrack.io/blog-post/meta-ad-spend-by-industry'),
    ('Google Ads, education CPC US$6.23, up 41.9% (WordStream 2025 data via Sender)', 'https://www.sender.net/marketing-glossary/cost-per-click-cpc/statistics/'),
    ('LinkedIn ads, healthcare CPC about US$6-12 (WebFX)', 'https://www.webfx.com/blog/social-media/linkedin-benchmarks/'),
    ('Creator rates: UK nano creators about £50-£250 per post (Awin, Lilach Bullock, Later)', 'https://www.awin.com/gb/sector-insights/uk-influencer-marketing-cost'),
    ('UK ad rules: ads must be obviously identifiable, use #ad (ASA / CAP Code)', 'https://www.asa.org.uk/advice-and-resources.html'),
    ('Saudi Arabia: paid promotion needs a Mawthooq licence, SAR 15,000 for 3 years (Arab News, Saudipedia)', 'https://saudipedia.com/en/what-is-the-mawthooq-license'),
]

CSS = (HERE / 'style.css').read_text()


def li(items, lang):
    return ''.join(f'<li>{x}</li>' for x in (i[lang] if isinstance(i, dict) else i for i in items))


def T(d, lang):
    return d[lang] if isinstance(d, dict) else d


def section(n, title, body, cls=''):
    return f'<section class="sec {cls}"><h2><span class="n">{n}</span>{title}</h2>{body}</section>'


L = {
    'en': dict(part='Part 1 · English', glance='At a glance', goal='90-day goal', who='Who to reach', top='Best channels', rec='Recommended option',
               s1='The app in one minute', s2='Who we are talking to', s3='The message', hooks='Hooks to open videos and posts', s4='Where to market, best first',
               ch='Channel', why='Why it works', cost='Cost', s5='SEO: get found on Google for free', kw='Starter keywords (check volumes before writing)', pages='Pages to build',
               s6='Three budget options', spend='Where the money goes', expect='Planning guess', time='Your time', s7='Your step-by-step plan',
               s8='What Claude can do for you', s8h='Who does what', s8b='What only you can do', s9='Numbers to check every month', s10='Rules and watch-outs',
               s11='Key dates', assume='How the planning guesses work',
               assume_t='Visits come from the cost per click (CPC) figures in the sources. Sign-ups and sales use two planning assumptions, not measured facts: 10-20% of visitors make a free account, and 2-5% of free accounts start paying. Replace them with your real numbers after 30 days.',
               conn='Connectors: the Ahrefs, Similarweb, HubSpot, Klaviyo, Canva and Notion connectors did not connect in this session. Reconnect them and I can pull real keyword volumes and competitor traffic, and build your email flows directly.',
               month='a month', recd='Recommended'),
    'ar': dict(part='الجزء 2 · العربية', glance='نظرة سريعة', goal='هدف 90 يوماً', who='الفئة المستهدفة', top='أفضل القنوات', rec='الخيار المقترح',
               s1='التطبيق في دقيقة', s2='من نخاطب؟', s3='الرسالة', hooks='جمل افتتاحية للفيديوهات والمنشورات', s4='أين نسوّق؟ الأهم أولاً',
               ch='القناة', why='لماذا تنجح', cost='التكلفة', s5='تحسين الظهور في Google (SEO) مجاناً', kw='كلمات بحث مبدئية (تأكد من حجم البحث قبل الكتابة)', pages='صفحات يجب إنشاؤها',
               s6='ثلاثة خيارات للميزانية', spend='أين يُصرف المال', expect='تقدير تخطيطي', time='وقتك', s7='خطتك خطوة بخطوة',
               s8='ما يستطيع Claude فعله لك', s8h='من يفعل ماذا؟', s8b='ما لا يستطيع أحد غيرك فعله', s9='أرقام تراجعها كل شهر', s10='قواعد وتنبيهات',
               s11='مواعيد مهمة', assume='كيف حُسبت التقديرات',
               assume_t='عدد الزيارات مبني على تكلفة النقرة (CPC) من المصادر. أما التسجيلات والمبيعات فمبنية على افتراضين للتخطيط وليسا أرقاماً مُقاسة: 10-20% من الزوار يفتحون حساباً مجانياً، و2-5% من الحسابات المجانية تشترك. استبدلهما بأرقامك الحقيقية بعد 30 يوماً.',
               conn='الأدوات المتصلة: أدوات Ahrefs وSimilarweb وHubSpot وKlaviyo وCanva وNotion لم تتصل في هذه الجلسة. أعد ربطها لأستطيع جلب أحجام البحث الحقيقية وزيارات المنافسين وبناء رسائل البريد مباشرة.',
               month='شهرياً', recd='مقترح'),
}


def part(a, lang):
    t = L[lang]
    hooks = ''.join(f'<li class="hook">“{h[lang]}”</li>' for h in a['hooks'])
    personas = ''.join(f'<div class="card"><h4>{p["t"][lang]}</h4><p>{p["d"][lang]}</p></div>' for p in a['who'])
    rows = ''.join(
        f'<tr><td><b>{i+1}. {c["n"][lang]}</b></td><td>{c["w"][lang]}</td><td class="nowrap"><bdi>{T(c["c"], lang)}</bdi></td></tr>'
        for i, c in enumerate(a['channels']))
    opts = ''
    for i, o in enumerate(a['options']):
        badge = f'<span class="badge">{t["recd"]}</span>' if i == a['recommended'] else ''
        opts += (f'<div class="opt{" is-rec" if i == a["recommended"] else ""}">{badge}<h4>{o["n"][lang]}</h4>'
                 f'<p class="price"><bdi dir="ltr">{o["p"]}</bdi><small> {t["month"]}</small></p>'
                 f'<p class="lbl">{t["spend"]}</p><ul>{li(o["spend"], lang)}</ul>'
                 f'<p class="lbl">{t["expect"]}</p><p>{o["exp"][lang]}</p>'
                 f'<p class="lbl">{t["time"]}</p><p>{o["time"][lang]}</p></div>')
    steps = ''.join(
        f'<div class="phase"><h4>{ph["t"][lang]}</h4><ol>{li(ph["i"], lang)}</ol></div>' for ph in a['steps'])
    kpis = ''.join(f'<tr><td>{k["k"][lang]}</td><td class="nowrap">{T(k["v"], lang)}</td></tr>' for k in a['kpis'])
    dates = ''.join(f'<tr><td class="nowrap"><b>{d["d"][lang]}</b></td><td>{d["w"][lang]}</td></tr>' for d in a['dates'])
    pages = ''.join(f'<li>{p[lang]}</li>' for p in a['seo_pages'])
    kw = ''.join(f'<span class="kw">{k}</span>' for k in a['keywords'])
    body = f'''
<div class="part-head"><span>{t["part"]}</span><b>{a["name"][lang]}</b></div>
<div class="glance"><h3>{t["glance"]}</h3><div class="g4">
 <div><span>{t["goal"]}</span><p>{a["goal"][lang]}</p></div>
 <div><span>{t["who"]}</span><p>{a["glance_who"][lang]}</p></div>
 <div><span>{t["top"]}</span><p>{a["glance_top"][lang]}</p></div>
 <div><span>{t["rec"]}</span><p>{a["options"][a["recommended"]]["n"][lang]} · <bdi dir="ltr">{a["options"][a["recommended"]]["p"]}</bdi></p></div>
</div></div>
{section(1, t["s1"], f'<p class="lead">{a["oneminute"][lang]}</p><ul class="facts">{li(a["facts"], lang)}</ul>')}
{section(2, t["s2"], f'<div class="cards">{personas}</div>')}
{section(3, t["s3"], f'<p class="bigidea">{a["bigidea"][lang]}</p><p>{a["message"][lang]}</p><h3>{t["hooks"]}</h3><ul class="hooks">{hooks}</ul>')}
{section(4, t["s4"], f'<table class="tbl"><thead><tr><th>{t["ch"]}</th><th>{t["why"]}</th><th>{t["cost"]}</th></tr></thead><tbody>{rows}</tbody></table>')}
{section(5, t["s5"], f'<p>{a["seo_intro"][lang]}</p><h3>{t["kw"]}</h3><div class="kws" dir="ltr">{kw}</div><h3>{t["pages"]}</h3><ul>{pages}</ul>')}
{section(6, t["s6"], f'<div class="opts">{opts}</div><div class="note"><b>{t["assume"]}.</b> {t["assume_t"]}</div>', 'keep')}
{section(7, t["s7"], f'<div class="phases">{steps}</div>')}
{section(8, t["s8h"], f'<div class="two"><div class="col claude"><h3>{t["s8"]}</h3><ul class="ticks">{li(a["claude"], lang)}</ul></div><div class="col you"><h3>{t["s8b"]}</h3><ul class="ticks">{li(a["you"], lang)}</ul></div></div><p class="small">{t["conn"]}</p>')}
{section(9, t["s9"], f'<table class="tbl kpi"><tbody>{kpis}</tbody></table>', 'keep')}
{section(10, t["s10"], f'<ul class="warn">{li(a["watch"], lang)}</ul>', 'keep')}
{section(11, t["s11"], f'<table class="tbl"><tbody>{dates}</tbody></table>', 'keep')}
'''
    return f'<div class="part" lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}">{body}</div>'


def page(a):
    src = ''.join(f'<li>{e(n)} — <a href="{u}">{e(u)}</a></li>' for n, u in a['sources'] + SHARED_SOURCES)
    fonts = HERE / 'fonts'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{e(a["name"]["en"])} marketing plan</title>
<style>
@font-face{{font-family:Inter;src:url({(fonts/'inter-latin-400-normal.woff2').as_uri()});font-weight:400}}
@font-face{{font-family:Inter;src:url({(fonts/'inter-latin-600-normal.woff2').as_uri()});font-weight:600}}
@font-face{{font-family:Inter;src:url({(fonts/'inter-latin-700-normal.woff2').as_uri()});font-weight:700}}
@font-face{{font-family:Inter;src:url({(fonts/'inter-latin-800-normal.woff2').as_uri()});font-weight:800}}
@font-face{{font-family:Naskh;src:url({(fonts/'noto-naskh-arabic-arabic-400-normal.woff2').as_uri()});font-weight:400}}
@font-face{{font-family:Naskh;src:url({(fonts/'noto-naskh-arabic-arabic-700-normal.woff2').as_uri()});font-weight:700}}
@font-face{{font-family:SansAr;src:url({(fonts/'noto-sans-arabic-arabic-400-normal.woff2').as_uri()});font-weight:400}}
@font-face{{font-family:SansAr;src:url({(fonts/'noto-sans-arabic-arabic-700-normal.woff2').as_uri()});font-weight:700}}
:root{{--c:{a["color"]};--c2:{a["color2"]}}}
{CSS}</style></head><body>
<div class="cover">
 <div class="brand">Healthcare Crown Academy · أكاديمية هيلثكير كراون</div>
 <p class="kicker">Marketing plan · خطة تسويق</p>
 <h1>{a["name"]["en"]}</h1>
 <h1 class="ar" dir="rtl">{a["name"]["ar"]}</h1>
 <p class="tag">{a["tagline"]["en"]}</p>
 <p class="tag ar" dir="rtl">{a["tagline"]["ar"]}</p>
 <div class="meta"><span>Written 26 October 2026 · Plan for November 2026 to January 2027</span><span dir="rtl">كُتبت في 26 أكتوبر 2026 · خطة نوفمبر 2026 إلى يناير 2027</span></div>
 <div class="howto">
  <p><b>How to use this plan.</b> Read “At a glance”, pick one of the three budget options, then follow section 7 week by week. English first, Arabic second: both say the same thing.</p>
  <p dir="rtl" lang="ar"><b>كيف تستخدم هذه الخطة؟</b> اقرأ «نظرة سريعة»، واختر أحد خيارات الميزانية الثلاثة، ثم اتبع القسم 7 أسبوعاً بأسبوع. الإنجليزية أولاً ثم العربية، والمحتوى واحد.</p>
 </div>
</div>
{part(a, "en")}
{part(a, "ar")}
<section class="sources"><h2>Sources · المصادر</h2><p class="small">Figures are directional benchmarks from the sources below, checked on 26 October 2026. Ad prices change by country, season and audience. الأرقام مؤشرات استرشادية من المصادر التالية، وتتغير أسعار الإعلانات حسب البلد والموسم والجمهور.</p><ol>{src}</ol></section>
</body></html>'''


if __name__ == '__main__':
    for key in sys.argv[1:] or ['medlex', 'carecraft', 'serein', 'lumen', 'gulf', 'evinca', 'lss']:
        a = importlib.import_module(f'apps.{key}').APP
        (OUT / f'{key}.html').write_text(page(a))
        print('built', key)
