const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,LevelFormat,Footer,Header,PageNumber,PageBreak}=require('docx');
const {apps,DISC,BASE,L}=require('./content.js');
const NAVY='10253A',GOLD='B8862B',CREAM='F7F3EA',LINE='E4DCCB',W=9026;
const run=(t,o={})=>new TextRun({text:t,font:'Arial',size:o.size||21,bold:o.bold,italics:o.it,color:o.color});
const P=(t,o={})=>new Paragraph({spacing:{after:o.after??120,before:o.before??0},alignment:o.align,keepNext:o.keepNext,children:Array.isArray(t)?t:[run(t,o)]});
const LP=(label,t)=>P([run(label+': ',{bold:true}),run(t)]);
const H1=(t)=>new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun(t)]});
const H2=(t)=>new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun(t)]});
const H3=(t)=>new Paragraph({heading:HeadingLevel.HEADING_3,children:[new TextRun(t)]});
const B=(t,lvl=0)=>new Paragraph({numbering:{reference:'bul',level:lvl},spacing:{after:60},children:Array.isArray(t)?t:[run(t)]});
const N=(t,ref='num')=>new Paragraph({numbering:{reference:ref,level:0},spacing:{after:60},children:[run(t)]});
const brk=()=>new Paragraph({children:[new PageBreak()]});
const bd={style:BorderStyle.SINGLE,size:4,color:LINE};
const borders={top:bd,bottom:bd,left:bd,right:bd};
function copyBox(label,lines,link){
  const out=[new Paragraph({keepNext:true,spacing:{before:120,after:40},children:[run(label.toUpperCase(),{bold:true,size:16,color:GOLD})]})];
  const cell=new TableCell({width:{size:W,type:WidthType.DXA},shading:{fill:CREAM,type:ShadingType.CLEAR,color:'auto'},margins:{top:120,bottom:120,left:160,right:160},
    borders:{top:{style:BorderStyle.SINGLE,size:6,color:GOLD},bottom:bd,left:{style:BorderStyle.SINGLE,size:18,color:GOLD},right:bd},
    children:lines.map((l,i)=>new Paragraph({spacing:{after:i<lines.length-1?100:0},children:[run(link?l.replace(/\{LINK\}/g,link):l,{size:20})]}))});
  out.push(new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({cantSplit:false,children:[cell]})]}));
  return out;
}
function table(head,rows,widths){
  const mk=(t,h)=>new TableCell({width:{size:0,type:WidthType.DXA},borders,margins:{top:80,bottom:80,left:100,right:100},shading:h?{fill:NAVY,type:ShadingType.CLEAR,color:'auto'}:undefined,
     children:(Array.isArray(t)?t:[t]).map(x=>new Paragraph({spacing:{after:40},children:[run(x,{size:18,bold:h,color:h?'FFFFFF':undefined})]}))});
  const r=(cells,h)=>new TableRow({tableHeader:h,cantSplit:true,children:cells.map((c,i)=>{const c2=mk(c,h);c2.options={};return new TableCell({width:{size:widths[i],type:WidthType.DXA},borders,margins:{top:80,bottom:80,left:100,right:100},shading:h?{fill:NAVY,type:ShadingType.CLEAR,color:'auto'}:(undefined),children:(Array.isArray(c)?c:[c]).map(x=>new Paragraph({spacing:{after:40},children:[run(x,{size:18,bold:h,color:h?'FFFFFF':undefined})]}))})})});
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:widths,rows:[r(head,true),...rows.map(x=>r(x,false))]});
}
const kids=[];
// ---------- cover ----------
kids.push(P([run('HEALTHCARE CROWN ACADEMY',{bold:true,size:20,color:GOLD})],{before:2400,after:200}));
kids.push(new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun('Publishing pack: app tour videos')]}));
kids.push(P('Copy-ready titles, descriptions, captions, keywords and targeting for 7 apps on YouTube, YouTube Shorts, TikTok, Facebook, LinkedIn, Telegram and Instagram.',{size:24,after:300}));
kids.push(P('Prepared 3 November 2026 · Contact: hello@healthcarecrownacademy.co.uk',{color:'5A6A7E'}));
kids.push(P('Apps: MedLex · Lumen · Carecraft · Serein · Gulf Region Nursing · Evinca · Lean Six Sigma Green Belt',{color:'5A6A7E',before:200}));
kids.push(brk());
// ---------- contents ----------
kids.push(H1('What is inside'));
['How to use this pack','Rules for every post','Platform playbook','Files for each app','Keywords and audiences at a glance','14-day launch calendar',...apps.map(a=>a.name+': all platforms'),'Measuring results'].forEach((t,i)=>kids.push(N(t,'toc')));
kids.push(H1('How to use this pack'));
['Pick the app and the platform from the calendar on the launch day.','Upload the right file: landscape (16:9) for YouTube, Facebook, LinkedIn and Telegram; portrait (9:16) for TikTok, YouTube Shorts and Instagram Reels.','Copy the text from the cream boxes exactly. Links already carry a ?ref= tag so you can see which platform sends visitors.','Upload the matching subtitle file (.srt) wherever the platform allows it. Search engines read subtitles, and most people watch with the sound off.','Reply to every comment within 24 hours for the first two weeks. Early replies tell the platform the post is worth showing to more people.','After 14 days, check the results (last section) and repeat what worked.'].forEach(t=>kids.push(N(t)));
// ---------- rules ----------
kids.push(H1('Rules for every post'));
[['Upload videos natively. ','Upload the MP4 to Facebook, LinkedIn and Telegram directly. Do not paste a YouTube link instead: native video reaches far more people.'],
 ['Hook first. ','The first line (or the first 2 seconds of a video) decides whether people stop. Every caption below starts with the hook.'],
 ['Keywords early. ','Put the main search phrase in the title and the first two lines of the description. Platforms show and index these first.'],
 ['LinkedIn links go in the first comment. ','Posts with an outside link in the main text usually reach fewer people. Post, then add the link as the first comment straight away.'],
 ['Gulf disclaimer, always. ','Every Gulf Region Nursing caption, description and ad must include: "'+DISC+'" The videos already show it on screen. Never crop it.'],
 ['Accurate wording. ','The Green Belt gives a Certificate of Completion, not an accredited certification. Never write "official questions", "guaranteed pass" or "certified".'],
 ['Serein safety line. ','Wherever space allows, keep: "Serein is not therapy or emergency care. If you are in crisis, contact your local emergency number."'],
 ['No patient information. ','Never post patient details, real cases or real exam questions.'],
 ['Check keywords before paying for ads. ','The keywords here follow how people commonly search for these topics. Before a paid campaign, confirm them with YouTube and TikTok search suggestions and Google Keyword Planner.']].forEach(([a,b])=>kids.push(B([run(a,{bold:true}),run(b)])));
// ---------- playbook ----------
kids.push(H1('Platform playbook'));
kids.push(table(['Platform','File','Settings that matter','Hashtags'],[
 ['YouTube','Landscape 16:9','Title under 70 characters, keyword first. Paste tags. Upload the .srt subtitles. Add to playlist. Audience: "No, it\'s not made for kids". Add an end screen to the Academy channel. Pin the comment.','3 in the description'],
 ['YouTube Shorts','Portrait 9:16','Shorts accept up to 3 minutes, and every tour is under 2:15. Use the Shorts title. Link the related long video.','2 in the title'],
 ['TikTok','Portrait 9:16','Add the hook as on-screen text for the first 2 seconds. Turn on captions. Use the caption keywords: TikTok search reads them. Business account for the bio link.','3 to 5'],
 ['Facebook','Landscape 16:9','Upload natively. Upload the .srt. First line is the hook. Pin the first post on the Page.','1 to 3'],
 ['LinkedIn','Landscape 16:9','Upload natively with the .srt. Hook in the first two lines (about 200 characters show before "see more"). Link in the first comment.','3'],
 ['Telegram','Landscape 16:9','Send the video with the post text as its caption. Pin the latest tour.','None needed'],
 ['Instagram Reels','Portrait 9:16','When the account is restored. Keyword-rich caption, alt text, cover image.','3 to 5']],[1500,1400,4626,1500]));
kids.push(P('Best times to post (starting points, then adjust to your own analytics): LinkedIn Tuesday to Thursday 8 to 10 am; Facebook lunchtime and 7 to 9 pm; TikTok, Shorts and Instagram 7 to 10 pm; YouTube about 2 hours before the evening peak. Always use the time zone of the people you want to reach. For Gulf Region Nursing, that means India, the Philippines and the Gulf, not the UK.',{before:160,it:true,size:19}));
// ---------- files ----------
kids.push(H1('Files for each app'));
kids.push(table(['App','Landscape video','Portrait video','Subtitles'],apps.map(a=>[a.name,a.file+'-tour-landscape-16x9-1080p.mp4',a.file+'-tour-portrait-9x16-1080p.mp4',[a.file+'-tour-landscape.en.srt',a.file+'-tour-portrait.en.srt']]),[1700,2600,2600,2126]));
kids.push(P('Use the subtitle file that matches the shape of the video: the timings differ slightly between the two.',{before:120,it:true,size:19}));
// ---------- keyword map ----------
kids.push(H1('Keywords and audiences at a glance'));
kids.push(table(['App','Main keyword','Supporting keywords','Who to reach'],apps.map(a=>[a.name,a.kw.primary,a.kw.secondary.slice(0,4).join(', '),a.audience.split('.')[0]+'.']),[1500,1700,2900,2926]));
// ---------- calendar ----------
kids.push(H1('14-day launch calendar'));
kids.push(table(['Day','App','Where'],[
 ['1','MedLex','YouTube, LinkedIn (Academy page), Facebook, Telegram'],
 ['2','MedLex','TikTok, YouTube Shorts'],
 ['3','Serein','YouTube, Facebook, LinkedIn, TikTok'],
 ['4','Gulf Region Nursing','YouTube, Facebook, Telegram, TikTok, YouTube Shorts'],
 ['5','Carecraft','YouTube, LinkedIn, Facebook, TikTok'],
 ['6','All','Reply to comments. Share the best post so far from your personal LinkedIn and Facebook.'],
 ['7','Lumen','YouTube, TikTok, Facebook, Telegram'],
 ['8','Green Belt','LinkedIn Showcase Page (then share from the Academy page and your profile), YouTube'],
 ['9','Evinca','LinkedIn, YouTube, Facebook'],
 ['10','Gulf Region Nursing','Share the Facebook post into Gulf exam groups and Telegram groups, only where the rules allow'],
 ['11','Lumen and Carecraft','YouTube Shorts, Instagram (if restored)'],
 ['12','Evinca and Green Belt','TikTok'],
 ['13','Serein','YouTube Shorts, Telegram'],
 ['14','All','Check results (last section) and plan the next fortnight']],[900,2200,5926]));
// ---------- apps ----------
for(const a of apps){
  kids.push(brk());
  kids.push(H1(`${a.name}: ${a.role}`));
  kids.push(LP('Links used below',`each platform has its own tagged link, for example ${L(a.url,'youtube')}`));
  if(a.gulf) kids.push(P([run('Disclaimer required everywhere: ',{bold:true,color:'9A3412'}),run(DISC)]));
  kids.push(H2('Keywords'));
  kids.push(LP('Main keyword',a.kw.primary));
  kids.push(P('Supporting keywords:',{bold:true,after:40,keepNext:true}));a.kw.secondary.forEach(k=>kids.push(B(k)));
  kids.push(P('Questions people search (use them as video and post topics):',{bold:true,after:40,before:80,keepNext:true}));a.kw.longtail.forEach(k=>kids.push(B(k)));
  kids.push(H2('Who to reach and where'));
  kids.push(P(a.audience));
  a.places.forEach(p=>kids.push(B(p)));
  kids.push(P([run('Paid targeting, Meta (Facebook and Instagram): ',{bold:true}),run(a.paid.meta)],{before:100}));
  kids.push(P([run('Paid targeting, LinkedIn: ',{bold:true}),run(a.paid.linkedin)]));
  kids.push(H2('YouTube (landscape)'));
  kids.push(...copyBox('Title',[a.yt.title]));
  kids.push(...copyBox('Description',a.yt.desc,L(a.url,'youtube')));
  kids.push(...copyBox('Tags (paste into the Tags box)',[a.yt.tags]));
  kids.push(...copyBox('Pinned comment',[a.yt.pinned],L(a.url,'youtube')));
  kids.push(P('Settings:',{bold:true,before:120,after:40,keepNext:true}));
  [`Playlists: ${a.yt.playlist}.`,`Thumbnail text: ${a.yt.thumb}.`,`Subtitles: upload ${a.file}-tour-landscape.en.srt (Subtitles, then Upload file, then With timing).`,'End screen: subscribe button plus one other app tour.','Audience: No, it\'s not made for kids.'].forEach(t=>kids.push(B(t)));
  kids.push(H2('YouTube Shorts (portrait)'));
  kids.push(...copyBox('Shorts title',[a.shorts]));
  kids.push(P(`Subtitles: ${a.file}-tour-portrait.en.srt. In "Related video", link the long landscape tour.`,{size:19}));
  kids.push(H2('TikTok (portrait)'));
  kids.push(...copyBox('On-screen text for the first 2 seconds',[a.tiktok.hook]));
  kids.push(...copyBox('Caption',[a.tiktok.caption+' '+a.tiktok.tags]));
  kids.push(P('Turn on auto captions and check the spelling of app names. Use the hook as the cover text. Put the tagged link in the bio: '+L(a.url,'tiktok'),{size:19}));
  kids.push(H2('Facebook (landscape)'));
  kids.push(...copyBox('Post',a.fb,L(a.url,'facebook')));
  kids.push(H2('LinkedIn (landscape)'));
  kids.push(...copyBox(a.key==='lss'?'Post (from the Green Belt Showcase Page)':'Post (from the Academy page)',a.li,L(a.url,'linkedin')));
  kids.push(...copyBox('First comment, straight after posting',[a.liComment],L(a.url,'linkedin')));
  kids.push(H2('Telegram (landscape)'));
  kids.push(...copyBox('Video caption',a.tg,L(a.url,'telegram')));
  kids.push(H2('Instagram Reels (portrait, when the account is restored)'));
  kids.push(...copyBox('Caption',[a.ig.caption+' '+a.ig.tags]));
  kids.push(...copyBox('Alt text',[a.ig.alt]));
  kids.push(P('Bio link: '+L(a.url,'instagram'),{size:19}));
}
// ---------- measuring ----------
kids.push(brk());
kids.push(H1('Measuring results'));
kids.push(P('Every link carries a ?ref= tag, for example ?ref=youtube-tour or ?ref=linkedin-tour. Your website analytics show which tags bring visitors and sign-ups.'));
kids.push(table(['Check weekly','Where','Good sign'],[
 ['Views and average view duration','YouTube Studio, TikTok and LinkedIn analytics','People watch past 30 seconds'],
 ['Search traffic','YouTube Studio: Traffic source, then YouTube search','Search terms that match your keywords'],
 ['Clicks to the apps','Website analytics, by ?ref= tag','Clicks from more than one platform'],
 ['Sign-ups and trials','App admin dashboards','Sign-ups that follow a post within 48 hours'],
 ['Comments and questions','Every platform','Real questions: turn them into the next posts']],[2600,3426,3000]));
kids.push(H2('What to do after 14 days'));
['Keep the two platforms that bring the most clicks, and post there twice a week.','Turn the most common comment questions into short videos (one question, one answer, under 60 seconds).','For Gulf Region Nursing, consider Arabic captions and an Arabic title line. Have a native speaker check them first.','Only start paid ads once a post has done well on its own. Boost that post, not a new one.'].forEach(t=>kids.push(N(t,'num2')));
const doc=new Document({creator:'Healthcare Crown Academy',title:'Publishing pack: app tour videos',
 styles:{default:{document:{run:{font:'Arial',size:21}}},
  paragraphStyles:[
   {id:'Title',name:'Title',basedOn:'Normal',next:'Normal',run:{font:'Arial',size:56,bold:true,color:NAVY},paragraph:{spacing:{before:0,after:200},keepNext:true}},
   {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:32,bold:true,color:NAVY},paragraph:{spacing:{before:320,after:160},keepNext:true,outlineLevel:0}},
   {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:25,bold:true,color:NAVY},paragraph:{spacing:{before:280,after:100},keepNext:true,outlineLevel:1,border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:2}}}},
   {id:'Heading3',name:'Heading 3',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:22,bold:true,color:NAVY},paragraph:{spacing:{before:200,after:80},keepNext:true,outlineLevel:2}}]},
 numbering:{config:[
  {reference:'bul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}}]},
  {reference:'num',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:360}}}}]},
  {reference:'num2',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:360}}}}]},
  {reference:'toc',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:360}}}}]}]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1300,bottom:1300,left:1440,right:1440}}},
  headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[run('Healthcare Crown Academy · Publishing pack',{size:16,color:'8A94A3'})]})]})},
  footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({children:['Page ',PageNumber.CURRENT],font:'Arial',size:16,color:'8A94A3'})]})]})},
  children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('HCA-Publishing-Pack-App-Tours.docx',b);console.log('ok',b.length)});
