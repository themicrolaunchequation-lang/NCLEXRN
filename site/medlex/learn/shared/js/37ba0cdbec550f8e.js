
"use strict";
/* ================= DATA : 66 PREFIXES ================= */
const CATS={
 neg:{name:"Negation & Opposition",icon:"🚫",g:["#4e9b9c","#377478"]},
 num:{name:"Numbers & Quantity",icon:"🔢",g:["#7bb6ba","#518b9d"]},
 pos:{name:"Position & Direction",icon:"🧭",g:["#4f9b86","#6fb59b"]},
 size:{name:"Size, Speed & Degree",icon:"🚀",g:["#8f9fbd","#b8bed0"]},
 time:{name:"Time, Order & Change",icon:"⏰",g:["#b9a477","#d0bd92"]},
 tog:{name:"Togetherness & Sameness",icon:"🤝",g:["#78aaa9","#59838f"]}
};
const DATA=[
{p:"a-",m:"absence or lack",ex:"apnoea",root:"-pnoea = breathing",exm:"temporary absence of breathing",i:"👻",n:"A- makes things Absent — like a ghost, it is simply NOT there! In apnoea, the breathing has vanished into thin air.",c:"neg",s:"ah",b:"afebrile = without fever",L:1},
{p:"ab-",m:"away from",ex:"abduction",root:"-duction = leading / carrying",exm:"movement away from the body's midline",i:"👽",n:"Aliens ABduct you AWAY from Earth! Abduction carries a limb AWAY from the midline — UFO style.",c:"pos",s:"ab",b:"abnormal = away from normal"},
{p:"ad-",m:"towards",ex:"adduction",root:"-duction = leading / carrying",exm:"movement towards the midline",i:"🧲",n:"ADDuction ADDs the limb back TOWARDS your body — like a magnet pulling it in to your side.",c:"pos",s:"ad",b:"adhesion = sticking towards / together"},
{p:"an-",m:"absence or lack (before a vowel)",ex:"anaesthesia",root:"-aesthesia = sensation / feeling",exm:"absence of sensation",i:"😴",n:"AN- is A-'s twin, used before vowels. Anaesthesia switches feeling OFF — sensation is absent, fast asleep.",c:"neg",s:"an",b:"anorexia = lack of appetite"},
{p:"ante-",m:"before",ex:"antenatal",root:"natal = birth",exm:"care before birth",i:"🐜",n:"The hardworking ANT always arrives BEFORE everyone else! Antenatal care happens BEFORE the birth.",c:"time",s:"AN-tee",b:"antepartum = before childbirth"},
{p:"anti-",m:"against or opposing",ex:"anticoagulant",root:"coagulant = clotting agent",exm:"a drug that works against blood clotting",i:"🛡️",n:"ANTI- is the bodyguard fighting AGAINST the enemy. Anticoagulants battle AGAINST dangerous blood clots.",c:"neg",s:"AN-ty",b:"antibiotic = against bacterial life"},
{p:"auto-",m:"self",ex:"autoimmunity",root:"immunity = immune defence",exm:"the immune system attacking the body's own tissues",i:"🪞",n:"AUTO- is SELFie mode! In autoimmunity the body attacks its SELF — like punching your own reflection in the mirror.",c:"tog",s:"AW-toh",b:"autograft = graft of your own tissue"},
{p:"bi-",m:"two",ex:"bilateral",root:"lateral = side",exm:"affecting both (two) sides",i:"🚲",n:"A BIcycle has TWO wheels — bilateral means TWO sides: left AND right together.",c:"num",s:"by",b:"biceps = muscle with two heads"},
{p:"brady-",m:"slow",ex:"bradycardia",root:"-cardia = heart condition",exm:"slow heart rate (under 60 bpm)",i:"🐌",n:"Brad the snail takes everything SLOW. Bradycardia is a heart dawdling along at snail speed.",c:"size",s:"BRAY-dee",b:"bradypnoea = slow breathing",L:1},
{p:"circum-",m:"around",ex:"circumoral",root:"oral = mouth",exm:"around the mouth",i:"🎪",n:"The CIRCUS ring wraps AROUND the performers — circumoral means AROUND the mouth.",c:"pos",s:"SIR-kum",b:"circumduction = circular movement"},
{p:"co-",m:"together or with",ex:"co-infection",root:"infection = invasion by microbes",exm:"two infections present together",i:"👯",n:"CO-pilots fly TOGETHER. A co-infection is two infections teaming up in one body at the same time.",c:"tog",s:"koh",b:"comorbidity = another illness alongside"},
{p:"contra-",m:"against or opposite",ex:"contralateral",root:"lateral = side",exm:"on the opposite side",i:"🥊",n:"CONTRA- stands in the OPPOSITE corner of the boxing ring. Contralateral = the opposite side of the body.",c:"neg",s:"KON-trah",b:"contraception = against conception"},
{p:"de-",m:"removal or reversal",ex:"dehydration",root:"hydr- = water",exm:"loss / removal of water from the body",i:"🏜️",n:"DE- DELETES and reverses! Dehydration deletes water from the body — turning it into a dry desert.",c:"neg",s:"dee",b:"defibrillation = reversing fibrillation"},
{p:"di-",m:"two or double",ex:"diplegia",root:"-plegia = paralysis",exm:"paralysis of two corresponding limbs",i:"🎲",n:"DI- rolls DOUBLE dice — TWO at once! Diplegia strikes TWO limbs (usually both legs).",c:"num",s:"dy",b:"diplopia = double vision"},
{p:"dia-",m:"through or across",ex:"dialysis",root:"-lysis = separation / loosening",exm:"filtering blood through a membrane",i:"🚇",n:"DIA- travels THROUGH like a train through a tunnel (think DIAgonal!). Dialysis cleans blood as it passes THROUGH a filter.",c:"pos",s:"DY-ah",b:"diarrhoea = flowing through"},
{p:"dis-",m:"apart, reversal or absence",ex:"dislocation",root:"location = place / position",exm:"a joint displaced apart from its socket",i:"🧩",n:"DIS-connect the puzzle! A dislocation pulls a joint APART so the pieces no longer fit together.",c:"neg",s:"dis",b:"dissection = cutting apart"},
{p:"dys-",m:"difficult, abnormal or impaired",ex:"dysphagia",root:"-phagia = swallowing",exm:"difficulty swallowing",i:"😖",n:"DYS- = DYSfunctional and DIFFICULT. With dysphagia, every single swallow is a struggle.",c:"neg",s:"dis",b:"dyspnoea = difficult breathing",L:1},
{p:"ecto-",m:"outside or outer",ex:"ectoderm",root:"-derm = skin / layer",exm:"the outermost embryonic layer",i:"🍊",n:"ECTO- is the OUTER peel of the orange. The ectoderm is the outside layer that becomes your skin and nerves.",c:"pos",s:"EK-toh",b:"ectopic pregnancy = outside the uterus"},
{p:"endo-",m:"within or inner",ex:"endocardium",root:"cardi- = heart",exm:"the inner lining of the heart",i:"🏠",n:"ENDO- stays INDOORS! The endocardium lines the INSIDE of the heart — cosy and within.",c:"pos",s:"EN-doh",b:"endoscopy = looking within the body"},
{p:"epi-",m:"upon or above",ex:"epidermis",root:"dermis = true skin",exm:"the skin layer lying upon the dermis",i:"🎩",n:"EPI- perches ON TOP like a top hat. The epidermis sits UPON the dermis as the skin's outer hat.",c:"pos",s:"EP-ee",b:"epigastric = above the stomach"},
{p:"eu-",m:"normal, good or well",ex:"euglycaemia",root:"glyc- = sugar, -aemia = blood",exm:"a normal blood sugar level",i:"😊",n:"EU- says: YOU are doing GREAT! Euglycaemia = blood sugar that is GOOD and perfectly normal.",c:"size",s:"yoo",b:"eupnoea = normal, easy breathing"},
{p:"exo-",m:"outside or outward",ex:"exocrine",root:"-crine = to secrete",exm:"glands secreting outward through ducts",i:"🚀",n:"EXO- EXITS outwards like a rocket blasting into the exosphere! Exocrine glands secrete OUT through ducts.",c:"pos",s:"EK-soh",b:"exophthalmos = eyeballs bulging outward"},
{p:"extra-",m:"outside or beyond",ex:"extracellular",root:"cellular = relating to cells",exm:"located outside the cells",i:"🌌",n:"EXTRA-terrestrials live BEYOND Earth — extracellular fluid floats OUTSIDE and BEYOND the cells.",c:"pos",s:"EK-strah",b:"extracorporeal = outside the body"},
{p:"hemi-",m:"half",ex:"hemiplegia",root:"-plegia = paralysis",exm:"paralysis of one half (side) of the body",i:"🌗",n:"A HEMIsphere is HALF the planet. Hemiplegia paralyses HALF the body — one whole side.",c:"num",s:"HEM-ee",b:"hemiparesis = weakness of one side",L:1},
{p:"hetero-",m:"different",ex:"heterozygous",root:"zygous = yoked / paired",exm:"having two different alleles",i:"🧦",n:"HETERO- wears mismatched socks — DIFFERENT! Heterozygous = two different gene copies: one red sock, one blue.",c:"tog",s:"HET-er-oh",b:"heterogeneous = made of different parts"},
{p:"homo-",m:"same",ex:"homozygous",root:"zygous = yoked / paired",exm:"having two identical alleles",i:"♊",n:"HOMO- = SAME, like identical twins in matching socks. Homozygous = two identical alleles.",c:"tog",s:"HOH-moh",b:"homogeneous = the same throughout"},
{p:"hyper-",m:"above normal or excessive",ex:"hyperglycaemia",root:"glyc- = sugar, -aemia = blood",exm:"excessively high blood sugar",i:"📈",n:"A HYPER child on sugar bounces off the walls — way TOO MUCH! Hyperglycaemia = blood sugar rocketing above normal.",c:"size",s:"HY-per",b:"hypertension = high blood pressure",L:1},
{p:"hypo-",m:"below normal or deficient",ex:"hypoglycaemia",root:"glyc- = sugar, -aemia = blood",exm:"abnormally low blood sugar",i:"📉",n:"HYPO- sinks LOW into a hole. Golden trick: hypO ends in O — and so does lOw! Hypoglycaemia = sugar dropped too low.",c:"size",s:"HY-poh",b:"hypotension = low blood pressure",L:1},
{p:"in-",m:"not (sometimes: in / into)",ex:"incontinence",root:"continence = control / holding in",exm:"inability to control urine or faeces",i:"⛔",n:"IN- often means NOT — INcapable, INcomplete. Incontinence = NOT having control. Warning: in 'incision' in- means INTO — context is king!",c:"neg",s:"in",b:"insomnia = not able to sleep"},
{p:"infra-",m:"below or beneath",ex:"infraclavicular",root:"clavicular = collarbone",exm:"below the clavicle",i:"⬇️",n:"INFRA-red sits BELOW red in the spectrum. Infraclavicular hides BELOW the collarbone.",c:"pos",s:"IN-frah",b:"infraspinatus = below the scapular spine"},
{p:"inter-",m:"between",ex:"intercostal",root:"costal = ribs",exm:"between the ribs",i:"🌉",n:"INTERnational bridges link BETWEEN countries. Intercostal muscles stretch BETWEEN your ribs.",c:"pos",s:"IN-ter",b:"intervertebral = between the vertebrae"},
{p:"intra-",m:"within",ex:"intravenous",root:"venous = vein",exm:"within a vein",i:"💉",n:"INTRA- goes INSIDE one single thing. Intravenous = right WITHIN the vein. Remember: INTER = between many; INTRA = inside one!",c:"pos",s:"IN-trah",b:"intramuscular = within a muscle"},
{p:"iso-",m:"equal or same",ex:"isotonic",root:"tonic = tension / concentration",exm:"equal concentration to body fluids",i:"⚖️",n:"ISO- keeps the scales perfectly EQUAL. Isotonic fluids match your body's concentration exactly.",c:"tog",s:"EYE-soh",b:"isometric = equal measure / length"},
{p:"macro-",m:"large",ex:"macrocytosis",root:"cyt- = cell, -osis = condition",exm:"condition of abnormally large red blood cells",i:"🐘",n:"MACRO- is elephant-sized — LARGE! In macrocytosis, red blood cells grow oversized like elephants.",c:"size",s:"MAK-roh",b:"macrophage = large 'eater' cell"},
{p:"mal-",m:"bad, poor or abnormal",ex:"malabsorption",root:"absorption = taking in nutrients",exm:"poor absorption of nutrients",i:"🤢",n:"MAL- is BAD news — like MALware infecting a computer! Malabsorption = the gut doing a BAD job of absorbing food.",c:"neg",s:"mal",b:"malnutrition = bad / poor nutrition"},
{p:"meta-",m:"beyond, change or after",ex:"metaplasia",root:"-plasia = formation / growth",exm:"change of one cell type into another",i:"🦋",n:"META-morphosis = total CHANGE, caterpillar to butterfly! Metaplasia is cells changing into a different type.",c:"time",s:"MET-ah",b:"metastasis = spread beyond the origin"},
{p:"micro-",m:"small",ex:"microcephaly",root:"cephal- = head",exm:"abnormally small head",i:"🔬",n:"You need a MICROscope for MICRO things — tiny! Microcephaly = an abnormally SMALL head and brain.",c:"size",s:"MY-kroh",b:"microorganism = tiny living thing"},
{p:"mid-",m:"middle",ex:"midline",root:"line = imaginary dividing line",exm:"the middle line of the body",i:"🎯",n:"MID- hits the exact MIDDLE of the target. The midline splits the body into left and right halves.",c:"pos",s:"mid",b:"midbrain = middle part of the brain"},
{p:"mono-",m:"one or single",ex:"monoplegia",root:"-plegia = paralysis",exm:"paralysis of one limb",i:"1️⃣",n:"A MONOrail rides on ONE rail. Monoplegia = paralysis of just ONE single limb.",c:"num",s:"MON-oh",b:"monocyte = white cell with one nucleus"},
{p:"multi-",m:"many or multiple",ex:"multigravida",root:"gravida = pregnant woman",exm:"a woman pregnant for the second (or more) time",i:"🎉",n:"MULTI-vitamins pack in MANY vitamins! A multigravida has been pregnant MANY times.",c:"num",s:"MUL-tee",b:"multipara = given birth more than once"},
{p:"neo-",m:"new",ex:"neonatal",root:"natal = birth",exm:"relating to the newborn (first 28 days)",i:"👶",n:"NEO- = brand NEW! The neonatal period is a baby's NEW beginning — the first 28 days of life.",c:"time",s:"NEE-oh",b:"neoplasm = new (abnormal) growth",L:1},
{p:"non-",m:"not or absence of",ex:"noninvasive",root:"invasive = entering the body",exm:"not entering or cutting the body",i:"✋",n:"NON- simply says NOT — hands off! Noninvasive tests never break the skin: no needles, no cuts.",c:"neg",s:"non",b:"nonmalignant = not cancerous"},
{p:"nulli-",m:"none",ex:"nullipara",root:"-para = births given",exm:"a woman who has never given birth",i:"0️⃣",n:"NULL = ZERO, NONE — 'null and void'! A nullipara has given birth ZERO times.",c:"num",s:"NUL-ee",b:"nulligravida = never been pregnant"},
{p:"oligo-",m:"few or scanty",ex:"oliguria",root:"-uria = urine condition",exm:"scanty urine output",i:"💧",n:"OLIGO- = only a FEW drops left in the bottle. Oliguria is a mere trickle of urine.",c:"num",s:"OL-ih-goh",b:"oligospermia = few sperm",L:1},
{p:"pan-",m:"all or entire",ex:"pancytopenia",root:"cyto- = cells, -penia = deficiency",exm:"deficiency of all blood cell types",i:"🌍",n:"PAN- means ALL — a PANdemic spreads across ALL countries. Pancytopenia = ALL blood cell lines running low.",c:"num",s:"pan",b:"panacea = a cure-all"},
{p:"para-",m:"beside, near or abnormal",ex:"parathyroid",root:"thyroid = the thyroid gland",exm:"small glands beside the thyroid",i:"🚗",n:"PARAllel parking puts your car BESIDE the kerb. The parathyroid glands park right BESIDE the thyroid. (Para- can also mean abnormal — check context!)",c:"pos",s:"PA-rah",b:"parasympathetic = beside the sympathetic system"},
{p:"peri-",m:"around",ex:"pericardium",root:"cardium = heart",exm:"the sac around the heart",i:"🫀",n:"A PERImeter fence runs AROUND a field. The pericardium wraps protectively AROUND the heart.",c:"pos",s:"PEH-ree",b:"periosteum = membrane around bone"},
{p:"poly-",m:"many or much",ex:"polyuria",root:"-uria = urine condition",exm:"passing excessive amounts of urine",i:"🌊",n:"POLY- = PLENTY! A polygon has MANY sides, and polyuria unleashes a FLOOD of urine.",c:"num",s:"POL-ee",b:"polydipsia = excessive thirst"},
{p:"post-",m:"after or behind",ex:"postoperative",root:"operative = surgery",exm:"the period after surgery",i:"📬",n:"POST arrives AFTER it is sent, and a P.S. (postscript) comes AFTER the letter. Postoperative = AFTER the operation.",c:"time",s:"pohst",b:"postpartum = after childbirth"},
{p:"pre-",m:"before",ex:"prenatal",root:"natal = birth",exm:"before birth",i:"🔮",n:"A PREview screens BEFORE the movie. Prenatal care watches over the baby BEFORE birth — the ultimate sneak peek!",c:"time",s:"pree",b:"preoperative = before surgery",L:1},
{p:"primi-",m:"first",ex:"primigravida",root:"gravida = pregnant woman",exm:"a woman in her first pregnancy",i:"🥇",n:"PRIMI- takes FIRST place — gold medal! (The PRIME minister is the 'first' minister.) Primigravida = FIRST-ever pregnancy.",c:"num",s:"PRY-mee",b:"primipara = given birth for the first time",L:1},
{p:"pseudo-",m:"false or resembling",ex:"pseudocyst",root:"cyst = fluid-filled sac",exm:"a false cyst lacking a true lining",i:"🎭",n:"PSEUDO- is a FAKE in disguise — a pseudonym is an author's fake name! A pseudocyst only PRETENDS to be a real cyst.",c:"neg",s:"SOO-doh",b:"pseudomembrane = false membrane"},
{p:"re-",m:"again or back",ex:"reabsorption",root:"absorption = taking in",exm:"absorbing a substance back again",i:"🔁",n:"RE-play, RE-wind, RE-do — AGAIN! In reabsorption the kidneys take water and salts BACK into the blood.",c:"time",s:"ree",b:"regurgitation = flowing back"},
{p:"retro-",m:"backward or behind",ex:"retroperitoneal",root:"peritoneal = abdominal lining",exm:"behind the peritoneum",i:"🕹️",n:"RETRO games look BACKWARD to the past. Retroperitoneal organs (like the kidneys) hide BEHIND the peritoneum.",c:"pos",s:"RET-roh",b:"retrograde = moving backward"},
{p:"semi-",m:"half or partial",ex:"semilunar",root:"lunar = moon",exm:"half-moon shaped (heart valves)",i:"🌙",n:"A SEMIcircle is HALF a circle. Semilunar valves curve like little HALF-moons in the heart.",c:"num",s:"SEM-ee",b:"semicircular canals = half-circle ear canals"},
{p:"sub-",m:"under or below",ex:"subcutaneous",root:"cutaneous = skin",exm:"under the skin",i:"🤿",n:"A SUBmarine dives UNDER the waves and the SUBway runs UNDERground. Subcutaneous injections go UNDER the skin.",c:"pos",s:"sub",b:"sublingual = under the tongue",L:1},
{p:"supra-",m:"above",ex:"suprapubic",root:"pubic = pubic bone region",exm:"above the pubic bone",i:"🦸",n:"SUPRA- soars ABOVE like SUPERman! A suprapubic catheter enters ABOVE the pubic bone.",c:"pos",s:"SOO-prah",b:"suprarenal = above the kidney (adrenal gland)"},
{p:"syn-",m:"together",ex:"syndactyly",root:"dactyl- = fingers / toes",exm:"fingers or toes fused together",i:"🤝",n:"SYN- = SYNchronised swimmers moving as one. In syndactyly, digits are joined TOGETHER like best friends holding hands.",c:"tog",s:"sin",b:"syndrome = symptoms running together"},
{p:"tachy-",m:"fast",ex:"tachycardia",root:"-cardia = heart condition",exm:"fast heart rate (over 100 bpm)",i:"🏎️",n:"TACHY- redlines the race-car TACHometer — FAST! Tachycardia is a heart racing at full throttle.",c:"size",s:"TAK-ee",b:"tachypnoea = fast breathing",L:1},
{p:"tele-",m:"distant",ex:"telemedicine",root:"medicine = healing practice",exm:"medical care delivered from a distance",i:"🔭",n:"A TELEscope spies DISTANT stars and TELEvision beams pictures from far away. Telemedicine heals across DISTANCE.",c:"pos",s:"TEL-eh",b:"telemetry = distant measurement (heart monitoring)"},
{p:"tetra-",m:"four",ex:"tetraplegia",root:"-plegia = paralysis",exm:"paralysis of all four limbs",i:"4️⃣",n:"TETRA- = FOUR — every Tetris block is built from 4 squares! Tetraplegia affects all FOUR limbs.",c:"num",s:"TET-rah",b:"tetralogy of Fallot = four heart defects"},
{p:"trans-",m:"across or through",ex:"transdermal",root:"dermal = skin",exm:"passing through the skin",i:"✈️",n:"TRANS-atlantic flights cross ACROSS the ocean. Transdermal patches send medicine THROUGH the skin.",c:"pos",s:"tranz",b:"transfusion = transferring blood across"},
{p:"tri-",m:"three",ex:"tricuspid",root:"cuspid = points / leaflets",exm:"a valve with three leaflets",i:"🔺",n:"A TRIcycle has THREE wheels and a TRIangle THREE sides. The tricuspid valve flaps with THREE leaflets.",c:"num",s:"try",b:"triceps = three-headed muscle"},
{p:"ultra-",m:"beyond",ex:"ultrasonography",root:"sono- = sound, -graphy = recording",exm:"imaging using sound beyond human hearing",i:"🦇",n:"ULTRA- goes BEYOND the limits! Ultrasound uses sound BEYOND human hearing — doctors 'see' like bats.",c:"size",s:"UL-trah",b:"ultraviolet = beyond violet light",L:1},
{p:"un-",m:"not or reversal",ex:"unconscious",root:"conscious = aware",exm:"not aware / not responsive",i:"😵",n:"UN-do, UN-lock, UN-tie — UN- reverses and negates. Unconscious = awareness switched OFF, NOT conscious.",c:"neg",s:"un",b:"unstable angina = not stable"},
{p:"uni-",m:"one",ex:"unilateral",root:"lateral = side",exm:"affecting one side only",i:"🦄",n:"A UNIcorn sports ONE horn and a UNIcycle balances on ONE wheel. Unilateral = ONE side only.",c:"num",s:"YOO-nee",b:"unicellular = single-celled"}
];
const SHORT={neg:"Negation",num:"Numbers",pos:"Position",size:"Speed & Size",time:"Time",tog:"Togetherness"};
const $=s=>document.querySelector(s);
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}

/* ================= STATE ================= */
const KEY="prefixQuest66";
let S={xp:0,mastered:[],opened:[],heard:[],listens:0,quizCorrect:0,bestStreak:0,matchWins:0,perfectRounds:0,badges:[],sound:true,rate:0.95};
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);for(const k in S){if(p[k]!==undefined)S[k]=p[k]}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const LEVELS=[[0,"🌱 Novice"],[100,"🔭 Explorer"],[250,"📚 Scholar"],[450,"🧠 Terminologist"],[700,"🩺 Word Surgeon"],[1000,"👑 Prefix Master"],[1400,"🏆 Grand Master"]];
function levelOf(xp){let idx=0;LEVELS.forEach((l,i)=>{if(xp>=l[0])idx=i});return{idx:idx,name:LEVELS[idx][1]}}
const BADGES=[
{id:"first",i:"👣",n:"First Steps",d:"Open your first prefix card",ok:()=>S.opened.length>=1},
{id:"exp10",i:"🔭",n:"Explorer",d:"Open 10 different cards",ok:()=>S.opened.length>=10},
{id:"exp33",i:"🗺️",n:"Halfway Hero",d:"Open 33 different cards",ok:()=>S.opened.length>=33},
{id:"exp66",i:"📖",n:"Bookworm",d:"Open all 66 cards",ok:()=>S.opened.length>=66},
{id:"mas10",i:"⭐",n:"Rising Star",d:"Master 10 prefixes",ok:()=>S.mastered.length>=10},
{id:"mas33",i:"🌟",n:"Halfway Master",d:"Master 33 prefixes",ok:()=>S.mastered.length>=33},
{id:"mas66",i:"👑",n:"Prefix Royalty",d:"Master all 66 prefixes",ok:()=>S.mastered.length>=66},
{id:"ears",i:"🎧",n:"Super Listener",d:"Use Listen 15 times",ok:()=>S.listens>=15},
{id:"quiz10",i:"🎯",n:"Quiz Whiz",d:"Answer 10 quiz questions correctly",ok:()=>S.quizCorrect>=10},
{id:"streak5",i:"🔥",n:"On Fire!",d:"Get a 5-answer quiz streak",ok:()=>S.bestStreak>=5},
{id:"match1",i:"🧩",n:"Match Maker",d:"Complete a Match Mania game",ok:()=>S.matchWins>=1},
{id:"perfect",i:"💯",n:"Flawless Victory",d:"Score 10/10 in a Quiz Quest",ok:()=>S.perfectRounds>=1}
];
function checkBadges(){
  BADGES.forEach(b=>{
    if(!S.badges.includes(b.id)&&b.ok()){
      S.badges.push(b.id);S.xp+=25;save();updateHUD();
      setTimeout(()=>{toast("🏆 Badge unlocked: <b>"+b.i+" "+esc(b.n)+"</b> (+25 XP)");sndFanfare();confettiBurst(innerWidth/2,innerHeight/3,70)},450);
    }
  });
}
function updateHUD(){
  $("#xpVal").textContent=S.xp;
  $("#levelVal").textContent=levelOf(S.xp).name;
  $("#streakVal").textContent=S.bestStreak;
  $("#progFill").style.width=(S.mastered.length/66*100)+"%";
  $("#progLabel").textContent=S.mastered.length+"/66 mastered";
  $("#soundBtn").textContent=S.sound?"🔊":"🔇";
}
function xpFloat(txt,x,y){
  const el=document.createElement("div");el.className="xpfloat";el.textContent=txt;
  el.style.left=Math.max(8,x-30)+"px";el.style.top=Math.max(8,y-14)+"px";
  document.body.appendChild(el);setTimeout(()=>el.remove(),1180);
}
function addXP(n,label,ev){
  if(n<=0)return;
  const before=levelOf(S.xp).idx;S.xp+=n;const after=levelOf(S.xp).idx;
  let x,y;
  if(ev&&ev.clientX){x=ev.clientX;y=ev.clientY}else{const r=$("#xpVal").getBoundingClientRect();x=r.left+r.width/2;y=r.bottom+16}
  xpFloat("+"+n+" XP"+(label?" • "+label:""),x,y);
  if(after>before){setTimeout(()=>{toast("🎉 <b>LEVEL UP!</b> You are now a <b>"+levelOf(S.xp).name+"</b>");sndFanfare();confettiRain()},350)}
  save();updateHUD();checkBadges();
}
function toast(msg){
  const t=document.createElement("div");t.className="toast";t.innerHTML=msg;
  $("#toasts").appendChild(t);
  setTimeout(()=>{t.style.transition="opacity .4s";t.style.opacity="0";setTimeout(()=>t.remove(),430)},3400);
}

/* ================= SOUND EFFECTS ================= */
let AC=null;
function tone(f,t0,dur,type,vol){
  if(!S.sound)return;
  try{
    if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+t0;
    o.type=type||"sine";o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.14,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+0.05);
  }catch(e){}
}
function sndPop(){tone(650,0,.09,"triangle",.11);tone(920,.05,.08,"triangle",.07)}
function sndClick(){tone(520,0,.06,"triangle",.08)}
function sndGood(){[659,784,1047].forEach((f,i)=>tone(f,i*.08,.17,"sine",.13))}
function sndBad(){tone(165,0,.26,"sawtooth",.09);tone(140,.05,.22,"sawtooth",.07)}
function sndFanfare(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.1,.3,"triangle",.14))}
function sndFlip(){tone(320,0,.11,"triangle",.09);tone(560,.07,.1,"triangle",.07)}
function sndMatch(){tone(880,0,.12,"sine",.12);tone(1175,.09,.2,"sine",.12)}

/* ================= SPEECH (LISTEN) ================= */
let voices=[];
function loadVoices(){try{voices=speechSynthesis.getVoices()}catch(e){}}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
function pickVoice(){
  return voices.find(v=>/en[-_]GB/i.test(v.lang)&&/sonia|libby|female|zira/i.test(v.name))
      ||voices.find(v=>/en[-_]GB/i.test(v.lang))
      ||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;
}
function speak(text,onend){
  if(!("speechSynthesis" in window)){toast("🔇 Sorry — text-to-speech is not supported in this browser.");if(onend)onend();return}
  const u=new SpeechSynthesisUtterance(text);
  u.lang="en-GB";const v=pickVoice();if(v)u.voice=v;
  u.rate=S.rate;u.pitch=1.05;
  if(onend){u.onend=onend;u.onerror=()=>onend()}
  speechSynthesis.speak(u);
}
function speakNow(text,btn){
  if(tourOn)stopTour();
  try{speechSynthesis.cancel()}catch(e){}
  document.querySelectorAll(".speaking").forEach(el=>el.classList.remove("speaking"));
  if(btn)btn.classList.add("speaking");
  speak(text,()=>{if(btn)btn.classList.remove("speaking")});
}
function speakChain(parts,btn){
  if(tourOn)stopTour();
  try{speechSynthesis.cancel()}catch(e){}
  if(btn)btn.classList.add("speaking");
  let k=0;
  (function next(){if(k>=parts.length){if(btn)btn.classList.remove("speaking");return}speak(parts[k++],next)})();
}
function clean(d){return d.p.replace(/-$/,"")}
function splitRoot(d){const k=d.root.indexOf("=");return k<0?[d.root,""]:[d.root.slice(0,k).trim(),d.root.slice(k+1).trim()]}
function sayParts(d){
  return{
    p:d.s+". The prefix "+clean(d)+".",
    m:clean(d)+" means: "+d.m.replace(/\//g," or ")+".",
    e:"Example: "+d.ex+". "+d.ex+" means "+d.exm+".",
    n:"Memory hook! "+d.n,
    b:"Word lab. Also: "+d.b.replace(/=/g," means ")+"."
  };
}
function heardListen(d,ev){
  S.listens++;
  if(!S.heard.includes(d.p)){S.heard.push(d.p);save();addXP(2,"First listen: "+d.p,ev)}
  else{save();checkBadges()}
}

/* ================= CONFETTI ================= */
const cvs=$("#confetti"),ctx=cvs.getContext("2d");
let parts=[],confOn=false;
function cvsResize(){cvs.width=innerWidth;cvs.height=innerHeight}
addEventListener("resize",cvsResize);cvsResize();
const CCOLORS=["#ffd93d","#ff6a9f","#8f94fb","#2ee6a8","#00c6ff","#ff4b2b","#ffffff"];
function confettiBurst(x,y,n){
  for(let k=0;k<(n||60);k++){const a=Math.random()*Math.PI*2,v=2.5+Math.random()*6;
    parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-3,w:5+Math.random()*6,h:7+Math.random()*7,c:pick(CCOLORS),r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,life:70+Math.random()*40})}
  runConf();
}
function confettiRain(){
  for(let k=0;k<150;k++)parts.push({x:Math.random()*cvs.width,y:-20-Math.random()*cvs.height*.4,vx:(Math.random()-.5)*2,vy:2+Math.random()*3.5,w:5+Math.random()*6,h:7+Math.random()*7,c:pick(CCOLORS),r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,life:200+Math.random()*80});
  runConf();
}
function runConf(){
  if(confOn)return;confOn=true;
  (function frame(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    parts=parts.filter(p=>p.life>0&&p.y<cvs.height+30);
    parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.vx*=.99;p.r+=p.vr;p.life--;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.min(1,p.life/40);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()});
    if(parts.length)requestAnimationFrame(frame);else{confOn=false;ctx.clearRect(0,0,cvs.width,cvs.height)}
  })();
}

/* ================= LEARN CARDS ================= */
let curCat="all",curSearch="",curSort="az",shuffleOrder=null;
function buildChips(){
  const wrap=$("#chips");let h="";
  const todo=66-S.mastered.length;
  function chip(id,label,count,g){
    const act=curCat===id;
    const style=act&&g?` style="background:linear-gradient(90deg,${g[0]},${g[1]})"`:(act?` style="background:linear-gradient(90deg,#ff6a9f,#8f94fb)"`:"");
    return `<button class="chip${act?" active":""}" data-cat="${id}"${style}>${label} <span class="n">${count}</span></button>`;
  }
  h+=chip("all","🌍 All Worlds",66,null);
  Object.keys(CATS).forEach(k=>{h+=chip(k,CATS[k].icon+" "+CATS[k].name,DATA.filter(d=>d.c===k).length,CATS[k].g)});
  h+=chip("todo","⭐ Still to Learn",todo,null);
  wrap.innerHTML=h;
}
function filteredList(){
  let list=DATA.map((d,i)=>i);
  if(curCat==="todo")list=list.filter(i=>!S.mastered.includes(DATA[i].p));
  else if(curCat!=="all")list=list.filter(i=>DATA[i].c===curCat);
  if(curSearch){
    const q=curSearch.toLowerCase();
    list=list.filter(i=>{const d=DATA[i];return d.p.toLowerCase().includes(q)||d.m.toLowerCase().includes(q)||d.ex.toLowerCase().includes(q)||d.exm.toLowerCase().includes(q)||d.b.toLowerCase().includes(q)});
  }
  const catOrder=Object.keys(CATS);
  if(curSort==="az")list.sort((a,b)=>DATA[a].p.localeCompare(DATA[b].p));
  else if(curSort==="cat")list.sort((a,b)=>catOrder.indexOf(DATA[a].c)-catOrder.indexOf(DATA[b].c)||DATA[a].p.localeCompare(DATA[b].p));
  else if(curSort==="todo")list.sort((a,b)=>(S.mastered.includes(DATA[a].p)?1:0)-(S.mastered.includes(DATA[b].p)?1:0)||DATA[a].p.localeCompare(DATA[b].p));
  else if(curSort==="shuffle"&&shuffleOrder)list.sort((a,b)=>shuffleOrder.indexOf(a)-shuffleOrder.indexOf(b));
  return list;
}
function render(){
  buildChips();
  const list=filteredList(),grid=$("#grid");
  grid.innerHTML=list.map((i,pos)=>{
    const d=DATA[i],cat=CATS[d.c],mst=S.mastered.includes(d.p),opn=S.opened.includes(d.p);
    return `<div class="card${mst?" mastered":""}" data-i="${i}" style="--g1:${cat.g[0]};--g2:${cat.g[1]};animation-delay:${(pos%14)*35}ms">
      <span class="num">#${String(i+1).padStart(2,"0")}</span>
      ${mst?'<span class="star">⭐</span>':(opn?"":'<span class="newdot" title="New! +5 XP"></span>')}
      <div class="bubble">${d.i}</div>
      <div class="pfx">${d.p}</div>
      <div class="mean">${esc(d.m)}</div>
      <span class="exchip">e.g. <b>${esc(d.ex)}</b></span>
      <div class="row"><button class="spk" data-spk="${i}" title="Listen to ${d.p}">🔊</button><span class="cat">${cat.icon} ${SHORT[d.c]}</span><span class="tap">Tap to pop ➜</span></div>
    </div>`;
  }).join("");
  $("#emptyMsg").style.display=list.length?"none":"block";
  grid.style.display=list.length?"grid":"none";
}

/* ================= POP-UP MODAL ================= */
let curModal=-1;
function openModal(i,ev){
  curModal=i;const d=DATA[i],cat=CATS[d.c],mst=S.mastered.includes(d.p);
  if(!S.opened.includes(d.p)){S.opened.push(d.p);save();render();setTimeout(()=>addXP(5,"New card: "+d.p,ev),150)}
  const url="https://medlex.healthcarecrownacademy.co.uk/#library/lab?w="+encodeURIComponent(d.ex);
  $("#modalCard").innerHTML=`
  <div class="mhead" style="--g1:${cat.g[0]};--g2:${cat.g[1]};background:linear-gradient(140deg,${cat.g[0]},${cat.g[1]})">
    <button class="mclose" id="mClose" title="Close (Esc)">✖</button>
    <button class="mnav prev" id="mPrev" title="Previous">◀</button>
    <button class="mnav next" id="mNext" title="Next">▶</button>
    <div class="miconwrap"><div class="mring"></div><div class="micon">${d.i}</div></div>
    <div class="mpfx">${d.p}</div>
    <div class="mpills">
      <button class="mpill" data-say="p" title="Listen to the pronunciation">/${d.s}/ 🔊</button>
      <span class="mpill">${cat.icon} ${esc(cat.name)}</span>
      <span class="mpill">Card ${i+1} of 66</span>
      ${mst?'<span class="mpill">⭐ Mastered</span>':""}
    </div>
  </div>
  <div class="mbody" style="--g1:${cat.g[0]};--g2:${cat.g[1]}">
    <div class="mlabel">💡 Meaning</div>
    <div class="mmean">${esc(d.m)}</div>
    <div class="mlabel">🧪 Word-Building Lab</div>
    <div class="eq">
      <span class="eqchip">${d.p}<small>= ${esc(d.m)}</small></span><span class="op">+</span>
      <span class="eqchip">${esc(splitRoot(d)[0])}<small>= ${esc(splitRoot(d)[1])}</small></span><span class="op">➜</span>
      <span class="eqchip result">${esc(d.ex)}<small>= ${esc(d.exm)}</small></span>
    </div>
    <div class="mlabel">🧠 Memory Hook — picture this!</div>
    <div class="hook"><span class="ht">${d.i} The story:</span>${esc(d.n)}</div>
    <div class="mlabel">🔬 More words with ${d.p}</div>
    <div class="lab">✨ ${esc(d.b)}</div>
    ${d.L?`<a class="medlex" href="${url}" target="_blank" rel="noopener">🔍 Explore “${esc(d.ex)}” in the MedLex Lab ↗</a>`:""}
    <div class="mlabel">🎧 Listen &amp; Repeat</div>
    <div class="listenrow">
      <button class="lbtn" data-say="p">🔊 Prefix</button>
      <button class="lbtn" data-say="m">🔊 Meaning</button>
      <button class="lbtn" data-say="e">🔊 Example</button>
      <button class="lbtn" data-say="n">🔊 Memory Hook</button>
      <button class="lbtn" data-say="all">▶️ Listen to ALL</button>
    </div>
    <div class="mactions">
      <button class="btn ${mst?"green":""}" id="mKnow">${mst?"✅ Mastered! (tap to undo)":"⭐ I Know This! +10 XP"}</button>
      <button class="btn ghost" id="mNextBtn">Next Prefix ➜</button>
    </div>
  </div>`;
  $("#modal").classList.add("open");
  document.body.style.overflow="hidden";
  $("#modalCard").scrollTop=0;
  sndPop();
  $("#mClose").addEventListener("click",closeModal);
  $("#mPrev").addEventListener("click",e=>{sndFlip();openModal((curModal+65)%66,e)});
  const goNext=e=>{sndFlip();openModal((curModal+1)%66,e)};
  $("#mNext").addEventListener("click",goNext);
  $("#mNextBtn").addEventListener("click",goNext);
  $("#mKnow").addEventListener("click",ev2=>toggleKnow(ev2));
  document.querySelectorAll("#modalCard [data-say]").forEach(btn=>{
    btn.addEventListener("click",ev2=>{
      const kind=btn.getAttribute("data-say"),dd=DATA[curModal],sp=sayParts(dd);
      heardListen(dd,ev2);
      if(kind==="all")speakChain([sp.p,sp.m,sp.e,sp.n,sp.b],btn);
      else speakNow(sp[kind],btn);
    });
  });
}
function toggleKnow(ev){
  const d=DATA[curModal],btn=$("#mKnow");
  if(S.mastered.includes(d.p)){
    S.mastered=S.mastered.filter(x=>x!==d.p);save();updateHUD();render();
    btn.textContent="⭐ I Know This! +10 XP";btn.classList.remove("green");sndClick();
  }else{
    S.mastered.push(d.p);save();updateHUD();render();
    btn.textContent="✅ Mastered! (tap to undo)";btn.classList.add("green");
    sndGood();
    const r=btn.getBoundingClientRect();confettiBurst(r.left+r.width/2,r.top,55);
    addXP(10,"Mastered "+d.p,ev);
    if(S.mastered.length===66)setTimeout(()=>{toast("👑 <b>INCREDIBLE!</b> You mastered all 66 prefixes!");confettiRain()},600);
  }
}
function closeModal(){
  $("#modal").classList.remove("open");
  document.body.style.overflow="";
  try{speechSynthesis.cancel()}catch(e){}
  sndClick();
}

/* ================= AUDIO TOUR ================= */
let tourOn=false,tourList=[],tourIdx=0;
function tourButtons(){
  const label=tourOn?"⏹ Stop Tour":"🎧 Audio Tour";
  $("#tourBtn").textContent=label;$("#heroTour").textContent=label;
}
function startTour(){
  setMode("learn");
  tourList=filteredList();
  if(!tourList.length){toast("🕵️ No cards to tour — clear your filters first!");return}
  tourOn=true;tourIdx=0;tourButtons();
  toast("🎧 Audio Tour started — sit back, look &amp; listen! ("+tourList.length+" prefixes)");
  stepTour();
}
function stepTour(){
  if(!tourOn)return;
  if(tourIdx>=tourList.length){stopTour();toast("🎧🏁 Audio Tour complete — superb listening!");confettiRain();return}
  const i=tourList[tourIdx],d=DATA[i];
  document.querySelectorAll(".card.touring").forEach(el=>el.classList.remove("touring"));
  const el=document.querySelector('.card[data-i="'+i+'"]');
  if(el){el.classList.add("touring");el.scrollIntoView({behavior:"smooth",block:"center"})}
  heardListen(d,null);
  const sp=sayParts(d);
  speak("Number "+(tourIdx+1)+". "+sp.p+" "+sp.m+" "+sp.e,()=>{tourIdx++;setTimeout(stepTour,300)});
}
function stopTour(){
  tourOn=false;tourButtons();
  try{speechSynthesis.cancel()}catch(e){}
  document.querySelectorAll(".card.touring").forEach(el=>el.classList.remove("touring"));
}
function toggleTour(){if(tourOn){stopTour();toast("🎧 Audio Tour stopped.")}else startTour()}

/* ================= FLASHCARDS ================= */
let deck=[],deckPos=0,flipped=false,deckCelebrated=false;
function buildDeck(shuf){
  deck=DATA.map((d,i)=>i);
  if(shuf)deck=shuffle(deck);
  deckPos=0;deckCelebrated=false;showFlash();
}
function showFlash(){
  flipped=false;
  const fc=$("#fcard");fc.classList.remove("flipped");
  if(deckPos>=deck.length){
    fc.style.setProperty("--g1","#f7971e");fc.style.setProperty("--g2","#ffd200");
    $("#finner").innerHTML=`<div class="fface ffront"><div class="fi">🏁</div><div class="fp" style="font-size:38px">Deck Complete!</div><div class="fh">You reviewed all 66 prefixes 🎉 — hit Shuffle to go again!</div></div><div class="fface fback"><div class="fm">🎉 Amazing work!</div><div class="fd">Mastered so far: ${S.mastered.length}/66</div></div>`;
    $("#fProgFill").style.width="100%";
    $("#fCount").textContent="🎉 Deck finished! Mastered: "+S.mastered.length+"/66";
    if(!deckCelebrated){deckCelebrated=true;confettiRain();sndFanfare()}
    return;
  }
  const d=DATA[deck[deckPos]],cat=CATS[d.c];
  fc.style.setProperty("--g1",cat.g[0]);fc.style.setProperty("--g2",cat.g[1]);
  $("#finner").innerHTML=`
   <div class="fface ffront">
     <div class="fi">${d.i}</div>
     <div class="fp">${d.p}</div>
     <div class="fh">🤔 What does it mean? Tap to flip 🔄</div>
     <div class="fh" style="background:rgba(255,255,255,.22)">${cat.icon} ${esc(cat.name)}${S.mastered.includes(d.p)?" • ⭐ Mastered":""}</div>
   </div>
   <div class="fface fback">
     <div style="font-size:34px">${d.i}</div>
     <div class="fm">${d.p} = ${esc(d.m)}</div>
     <div class="fe">💊 ${esc(d.ex)}</div>
     <div class="fd">${esc(d.exm)}</div>
     <div class="fn">🧠 ${esc(d.n)}</div>
   </div>`;
  $("#fProgFill").style.width=(deckPos/deck.length*100)+"%";
  $("#fCount").textContent="Card "+(deckPos+1)+" of "+deck.length+" • ⭐ Mastered: "+S.mastered.length+"/66";
}
function nextFlash(){
  deckPos++;
  if(flipped){$("#fcard").classList.remove("flipped");setTimeout(showFlash,300)}
  else showFlash();
}

/* ================= QUIZ QUEST ================= */
let Q=null;
function meaningKey(m){return m.toLowerCase().split(",")[0].split(" or ")[0].split("(")[0].trim()}
function makeQ(i){
  const d=DATA[i],type=pick(["mean","prefix","word","whichword"]);
  const pool=DATA.map((x,k)=>k).filter(k=>k!==i&&meaningKey(DATA[k].m)!==meaningKey(d.m));
  const sameCat=shuffle(pool.filter(k=>DATA[k].c===d.c));
  const rest=shuffle(pool.filter(k=>DATA[k].c!==d.c));
  const distract=sameCat.concat(rest).slice(0,3);
  const optsIdx=shuffle([i].concat(distract));
  function optText(k){const x=DATA[k];return type==="prefix"?x.p:(type==="whichword"?x.ex:x.m)}
  let html="",plain="";
  if(type==="mean"){html=`What does the prefix <span class="hl">${d.p}</span> mean?`;plain="What does the prefix "+clean(d)+" mean?"}
  else if(type==="prefix"){html=`Which prefix means <span class="hl">“${esc(d.m)}”</span>?`;plain="Which prefix means: "+d.m+"?"}
  else if(type==="word"){html=`In the word <span class="hl">${esc(d.ex)}</span>, what does the prefix <span class="hl">${d.p}</span> mean?`;plain="In the word "+d.ex+", what does the prefix "+clean(d)+" mean?"}
  else{html=`Which word contains a prefix meaning <span class="hl">“${esc(d.m)}”</span>?`;plain="Which word contains a prefix meaning: "+d.m+"?"}
  return{i:i,type:type,html:html,plain:plain,opts:optsIdx.map(k=>({k:k,t:optText(k)})),answerPos:optsIdx.indexOf(i)};
}
function startQuiz(){
  try{speechSynthesis.cancel()}catch(e){}
  const idxs=shuffle(DATA.map((d,i)=>i)).slice(0,10);
  Q={list:idxs.map(makeQ),pos:0,score:0,right:0,streak:0,bestRun:0,missed:[],answered:false,timeLeft:20,timer:null};
  $("#quizStart").style.display="none";$("#quizEnd").style.display="none";$("#quizPlay").style.display="block";
  sndPop();showQ();
}
function showQ(){
  if(Q.timer)clearInterval(Q.timer);
  try{speechSynthesis.cancel()}catch(e){}
  Q.answered=false;Q.timeLeft=20;
  const q=Q.list[Q.pos],d=DATA[q.i],cat=CATS[d.c],panel=$("#quizPlay");
  panel.style.setProperty("--g1",cat.g[0]);panel.style.setProperty("--g2",cat.g[1]);
  $("#qNum").textContent="Question "+(Q.pos+1)+"/10";
  $("#qStreak").textContent=Q.streak;$("#qScore").textContent=Q.score;$("#qRight").textContent=Q.right;
  $("#qIcon").textContent=d.i;
  $("#qText").innerHTML=q.html;
  $("#qExpl").className="qexpl";$("#qExpl").innerHTML="";
  $("#qNext").style.display="none";
  const LET=["A","B","C","D"];
  $("#qOpts").innerHTML=q.opts.map((o,pos)=>`<button class="opt" data-pos="${pos}"><span class="letter">${LET[pos]}</span><span>${esc(o.t)}</span></button>`).join("");
  document.querySelectorAll("#qOpts .opt").forEach(btn=>btn.addEventListener("click",e=>answerQ(+btn.dataset.pos,e)));
  const fill=$("#timerFill");fill.style.width="100%";
  Q.timer=setInterval(()=>{
    Q.timeLeft-=0.1;
    fill.style.width=Math.max(0,Q.timeLeft/20*100)+"%";
    if(Q.timeLeft<=0){clearInterval(Q.timer);answerQ(-1,null)}
  },100);
  panel.scrollIntoView({behavior:"smooth",block:"center"});
}
function answerQ(pos,ev){
  if(!Q||Q.answered)return;
  Q.answered=true;if(Q.timer)clearInterval(Q.timer);
  const q=Q.list[Q.pos],d=DATA[q.i],correct=pos===q.answerPos;
  const btns=document.querySelectorAll("#qOpts .opt");
  btns.forEach((b,bp)=>{b.disabled=true;if(bp===q.answerPos)b.classList.add("correct");else if(bp===pos)b.classList.add("wrong")});
  let verdict="",gain=0;
  if(correct){
    Q.streak++;Q.bestRun=Math.max(Q.bestRun,Q.streak);Q.right++;
    const speedBonus=Math.ceil(Math.max(0,Q.timeLeft)/20*10);
    const streakBonus=Math.min((Q.streak-1)*2,10);
    gain=15+speedBonus+streakBonus;Q.score+=gain;
    S.quizCorrect++;S.bestStreak=Math.max(S.bestStreak,Q.streak);save();updateHUD();
    sndGood();
    if(Q.streak>=3)confettiBurst(innerWidth/2,innerHeight/2.6,45);
    verdict="🎉 Correct! +"+gain+" XP"+(speedBonus?" (⚡ speed +"+speedBonus+")":"")+(streakBonus?" (🔥 streak +"+streakBonus+")":"");
    addXP(gain,"Quiz Quest",ev);
  }else{
    Q.streak=0;Q.missed.push(q.i);sndBad();
    verdict=pos===-1?"⏰ Time's up!":"💡 Not quite — great try!";
  }
  $("#qStreak").textContent=Q.streak;$("#qScore").textContent=Q.score;$("#qRight").textContent=Q.right;
  const ex=$("#qExpl");
  ex.innerHTML=`<span class="verdict" style="color:${correct?"#2ee6a8":"#ffd93d"}">${verdict}</span>
    ${d.i} <b>${d.p}</b> = <b>${esc(d.m)}</b> — e.g. <b>${esc(d.ex)}</b> (${esc(d.exm)}).<br>🧠 ${esc(d.n)}
    <div style="margin-top:9px"><button class="lbtn" id="explListen" style="--g1:#8f94fb;--g2:#4e54c8">🔊 Hear this prefix</button></div>`;
  ex.classList.add("show");
  const lb=$("#explListen");
  if(lb)lb.addEventListener("click",e=>{heardListen(d,e);const sp=sayParts(d);speakChain([sp.p,sp.m,sp.e,sp.n],lb)});
  const nx=$("#qNext");nx.textContent=Q.pos===9?"🏁 See Results":"Next ➜";nx.style.display="inline-block";
}
function nextQ(){
  Q.pos++;
  if(Q.pos>=10)endQuiz();else showQ();
}
function endQuiz(){
  if(Q.timer)clearInterval(Q.timer);
  $("#quizPlay").style.display="none";$("#quizEnd").style.display="block";
  const r=Q.right;
  $("#endStars").textContent=r>=9?"⭐⭐⭐":(r>=7?"⭐⭐☆":(r>=4?"⭐☆☆":"☆☆☆"));
  $("#endEmoji").textContent=r===10?"🏆":(r>=8?"🎉":(r>=5?"👍":"💪"));
  $("#endTitle").textContent=r===10?"PERFECT QUEST!":(r>=8?"Brilliant!":(r>=5?"Well Done!":"Keep Questing!"));
  $("#endScore").textContent=r+"/10";
  let detail="You earned <b style='color:var(--gold)'>"+Q.score+" XP</b> this quest • Best streak: 🔥 "+Q.bestRun;
  if(Q.missed.length){
    detail+="<br><br>📚 <b>Review these:</b> "+Q.missed.map(i=>DATA[i].i+" <b>"+DATA[i].p+"</b> = "+esc(DATA[i].m)).join(" &nbsp;•&nbsp; ");
  }else detail+="<br>Flawless — every single prefix nailed! 👑";
  $("#endDetail").innerHTML=detail;
  if(r===10){S.perfectRounds++;save();sndFanfare();confettiRain();checkBadges()}
  else if(r>=7){sndFanfare();confettiBurst(innerWidth/2,innerHeight/3,90)}
  else sndGood();
  $("#quizEnd").scrollIntoView({behavior:"smooth",block:"center"});
}

/* ================= MATCH MANIA ================= */
let M=null;
function newMatch(){
  if(M&&M.timer)clearInterval(M.timer);
  const idxs=shuffle(DATA.map((d,i)=>i)).slice(0,8);
  let tiles=[];
  idxs.forEach(i=>{tiles.push({kind:"p",i:i,done:false});tiles.push({kind:"m",i:i,done:false})});
  M={tiles:shuffle(tiles),sel:-1,moves:0,pairs:0,secs:0,playing:true,lock:false,timer:null};
  $("#matchWin").className="matchwin";$("#matchWin").innerHTML="";
  renderMatch();updateMStats();
  M.timer=setInterval(()=>{if(M&&M.playing){M.secs++;$("#mTime").textContent=M.secs+"s"}},1000);
}
function renderMatch(){
  $("#matchGrid").innerHTML=M.tiles.map((t,ti)=>{
    const d=DATA[t.i],cat=CATS[d.c];
    const style=t.kind==="p"&&!t.done?` style="--g1:${cat.g[0]};--g2:${cat.g[1]}"`:``;
    const text=t.kind==="p"?(t.done?"✅ "+d.p:d.i+" "+d.p):(t.done?"✅ "+esc(d.m):esc(d.m));
    return `<button class="tile${t.kind==="p"?" pfx":""}${t.done?" done":""}${M.sel===ti?" sel":""}" data-t="${ti}"${style}>${text}</button>`;
  }).join("");
}
function updateMStats(){
  $("#mTime").textContent=(M?M.secs:0)+"s";
  $("#mMoves").textContent=M?M.moves:0;
  $("#mPairs").textContent=(M?M.pairs:0)+"/8";
}
function tileClick(ti,ev){
  if(!M||!M.playing||M.lock)return;
  const t=M.tiles[ti];
  if(t.done)return;
  if(M.sel===ti){M.sel=-1;renderMatch();sndClick();return}
  if(M.sel===-1){M.sel=ti;renderMatch();sndClick();return}
  const a=M.tiles[M.sel];
  if(a.kind===t.kind){M.sel=ti;renderMatch();sndClick();return}
  M.moves++;
  if(a.i===t.i){
    a.done=true;t.done=true;M.pairs++;M.sel=-1;
    sndMatch();renderMatch();updateMStats();
    addXP(6,"Pair matched!",ev);
    speakMatch(DATA[t.i]);
    if(M.pairs===8)winMatch(ev);
  }else{
    sndBad();M.lock=true;
    const els=document.querySelectorAll("#matchGrid .tile");
    if(els[M.sel])els[M.sel].classList.add("bad");
    if(els[ti])els[ti].classList.add("bad");
    updateMStats();
    setTimeout(()=>{if(!M)return;M.sel=-1;M.lock=false;renderMatch()},680);
  }
}
function speakMatch(d){
  if(!S.sound)return;
  try{speechSynthesis.cancel()}catch(e){}
  speak(d.s+". "+clean(d)+" means "+d.m.replace(/\//g," or ")+".");
}
function winMatch(ev){
  M.playing=false;if(M.timer)clearInterval(M.timer);
  S.matchWins++;
  const timeBonus=Math.max(0,60-M.secs),bonus=25+timeBonus;
  save();
  const stars=M.moves<=10?"⭐⭐⭐":(M.moves<=15?"⭐⭐☆":"⭐☆☆");
  const w=$("#matchWin");
  w.innerHTML=`<div style="font-size:44px">🏆</div><h2 style="font-size:26px;font-weight:900">Match Complete!</h2>
    <div class="bigstars" style="font-size:32px">${stars}</div>
    <p style="color:var(--dim);line-height:1.7">⏱️ Time: <b style="color:var(--txt)">${M.secs}s</b> • 🖱️ Moves: <b style="color:var(--txt)">${M.moves}</b><br>Completion bonus: <b style="color:var(--gold)">+${bonus} XP</b>${timeBonus?" (includes ⚡ speed bonus +"+timeBonus+")":""}</p>
    <br><button class="btn" data-oc="newMatch();sndPop()">🔀 Play Again</button>`;
  w.classList.add("show");
  sndFanfare();confettiRain();
  addXP(bonus,"Match Mania clear!",ev);
  w.scrollIntoView({behavior:"smooth",block:"center"});
}

/* ================= BADGES MODAL ================= */
function renderBadges(){
  $("#badgesGrid").innerHTML=BADGES.map(b=>{
    const un=S.badges.includes(b.id);
    return `<div class="badge${un?" unlocked":""}"><div class="bi">${b.i}</div><div class="bn">${esc(b.n)}</div><div class="bd">${esc(b.d)}</div><div class="bd" style="font-weight:800">${un?"✅ Unlocked":"🔒 Locked"}</div></div>`;
  }).join("");
  $("#badgeCount").textContent=S.badges.length+" of 12 badges collected • "+levelOf(S.xp).name+" • "+S.xp+" XP";
}

/* ================= MODE SWITCHING ================= */
function setMode(m){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.mode===m));
  document.querySelectorAll("section.mode").forEach(s=>s.classList.toggle("show",s.id==="mode-"+m));
  if(m!=="learn"&&tourOn)stopTour();
  try{speechSynthesis.cancel()}catch(e){}
  if(m==="flash"){if(!deck.length)buildDeck(true);else showFlash()}
  if(m==="match"&&!M)newMatch();
  const y=document.querySelector(".tabs").getBoundingClientRect().top+scrollY-72;
  scrollTo({top:y,behavior:"smooth"});
}

/* ================= INIT & BINDINGS ================= */
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{sndClick();setMode(t.dataset.mode)}));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{sndPop();setMode(b.dataset.go)}));
$("#tourBtn").addEventListener("click",toggleTour);
$("#heroTour").addEventListener("click",toggleTour);
$("#search").addEventListener("input",e=>{curSearch=e.target.value.trim();render()});
$("#sortSel").addEventListener("change",e=>{curSort=e.target.value;if(curSort==="shuffle")shuffleOrder=shuffle(DATA.map((d,i)=>i));sndClick();render()});
$("#rateSel").addEventListener("change",e=>{S.rate=parseFloat(e.target.value);save();toast("🗣️ Speech speed updated — tap any 🔊 to try it!");speakNow("Listening speed updated!")});
$("#chips").addEventListener("click",e=>{const ch=e.target.closest("[data-cat]");if(!ch)return;curCat=ch.dataset.cat;sndClick();render()});
$("#clearFilters").addEventListener("click",()=>{curCat="all";curSearch="";$("#search").value="";render()});
$("#grid").addEventListener("click",e=>{
  const spk=e.target.closest("[data-spk]");
  if(spk){
    const d=DATA[+spk.dataset.spk],sp=sayParts(d);
    heardListen(d,e);
    speakChain([sp.p,sp.m,sp.e],spk);
    return;
  }
  const card=e.target.closest(".card");
  if(card)openModal(+card.dataset.i,e);
});
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
$("#badgeModal").addEventListener("click",e=>{if(e.target.id==="badgeModal")$("#badgeModal").classList.remove("open")});
$("#badgesBtn").addEventListener("click",()=>{renderBadges();$("#badgeModal").classList.add("open");sndPop()});
$("#badgeClose").addEventListener("click",()=>$("#badgeModal").classList.remove("open"));
$("#soundBtn").addEventListener("click",()=>{
  S.sound=!S.sound;save();updateHUD();
  if(S.sound){sndPop();toast("🔊 Sound effects ON")}else toast("🔇 Sound effects OFF (speech/listening still works)");
});
$("#resetBtn").addEventListener("click",()=>{
  if(!confirm("Reset ALL progress (XP, badges, mastered cards)?"))return;
  const keepRate=S.rate,keepSound=S.sound;
  S={xp:0,mastered:[],opened:[],heard:[],listens:0,quizCorrect:0,bestStreak:0,matchWins:0,perfectRounds:0,badges:[],sound:keepSound,rate:keepRate};
  save();updateHUD();render();showFlash();
  toast("🗑️ Progress reset — fresh start, future Prefix Master! 🌱");
});
/* flashcards */
$("#fcard").addEventListener("click",()=>{
  if(deckPos>=deck.length)return;
  flipped=!flipped;$("#fcard").classList.toggle("flipped",flipped);sndFlip();
});
$("#fKnow").addEventListener("click",e=>{
  if(deckPos>=deck.length)return;
  const d=DATA[deck[deckPos]];
  if(!S.mastered.includes(d.p)){
    S.mastered.push(d.p);save();updateHUD();render();sndGood();
    const r=e.target.getBoundingClientRect();confettiBurst(r.left+r.width/2,r.top,40);
    addXP(10,"Flashcard mastered: "+d.p,e);
  }else{toast("⭐ "+d.p+" already mastered — nice revision!");sndGood()}
  nextFlash();
});
$("#fDont").addEventListener("click",()=>{if(deckPos>=deck.length)return;sndClick();nextFlash()});
$("#fShuffle").addEventListener("click",()=>{buildDeck(true);sndPop();toast("🔀 Deck shuffled — 66 cards!")});
$("#fListen").addEventListener("click",e=>{
  if(deckPos>=deck.length)return;
  const d=DATA[deck[deckPos]],sp=sayParts(d);
  heardListen(d,e);
  if(flipped)speakChain([sp.p,sp.m,sp.e,sp.n],e.target);
  else speakNow(sp.p,e.target);
});
/* quiz */
$("#quizGo").addEventListener("click",startQuiz);
$("#quizAgain").addEventListener("click",startQuiz);
$("#quizReview").addEventListener("click",()=>setMode("learn"));
$("#qNext").addEventListener("click",()=>{sndClick();nextQ()});
$("#qListen").addEventListener("click",e=>{
  if(!Q)return;
  const q=Q.list[Q.pos];
  heardListen(DATA[q.i],e);
  speakNow(q.plain+" Options: "+q.opts.map(o=>o.t).join(". ")+".",e.target);
});
/* match */
$("#mNew").addEventListener("click",()=>{sndPop();newMatch()});
$("#matchGrid").addEventListener("click",e=>{
  const t=e.target.closest("[data-t]");
  if(t)tileClick(+t.dataset.t,e);
});
/* keyboard */
document.addEventListener("keydown",e=>{
  const modalOpen=$("#modal").classList.contains("open");
  if(e.key==="Escape"){if(modalOpen)closeModal();$("#badgeModal").classList.remove("open");if(tourOn)stopTour()}
  else if(modalOpen&&e.key==="ArrowRight"){sndFlip();openModal((curModal+1)%66,null)}
  else if(modalOpen&&e.key==="ArrowLeft"){sndFlip();openModal((curModal+65)%66,null)}
  else if(e.key===" "&&$("#mode-flash").classList.contains("show")&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){
    e.preventDefault();$("#fcard").click();
  }
});
/* go! */
$("#rateSel").value=String(S.rate);
updateHUD();render();buildDeck(true);
if(S.opened.length===0)setTimeout(()=>toast("👋 Welcome to <b>Prefix Quest</b>! Tap any card with a gold dot to pop it open and earn <b>+5 XP</b>."),600);
else setTimeout(()=>toast("👋 Welcome back! "+S.mastered.length+"/66 mastered • "+S.xp+" XP • Keep questing, "+levelOf(S.xp).name+"!"),600);

