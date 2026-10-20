
"use strict";
/* ================= DATA: 60 ROOTS ================= */
const CATS={
heart:{n:"Heart, Blood & Lymph",s:"Heart",e:"❤️",h:264},
brain:{n:"Brain, Nerves & Mind",s:"Brain",e:"🧠",h:250},
gut:{n:"Stomach, Gut & Liver",s:"Gut",e:"🍽️",h:278},
bone:{n:"Bone, Joint & Muscle",s:"Bone",e:"🦴",h:236},
sense:{n:"Skin & Senses",s:"Senses",e:"👁️",h:288},
chest:{n:"Chest, Air & Breathing",s:"Chest",e:"🫁",h:222},
repro:{n:"Kidney, Urine & Reproduction",s:"Kidney",e:"🌸",h:300},
science:{n:"Body Science, Drugs & Scans",s:"Science",e:"🔬",h:255}
};
/* root | meaning | example | category | icon | say-it | hook title | hook story | word breakdown | also seen in */
const RAW=[
["aden","gland or lymph node","Lymphadenopathy","heart","🛡️","AD-en","A DEN for guard glands","Picture tiny guard dogs living in a DEN, ready to bark at invaders. Lymph nodes are the body guard-posts — when they swell up on duty, doctors call it lymphadenopathy.","lymph (lymph) + aden (gland / lymph node) + -pathy (disease) = disease of the lymph glands","Adenitis • Adenopathy • Lymphadenopathy"],
["aem","blood","Anaemia","heart","🩸","EEM (in -aemia)","AIM at the blood","AEM sounds like AIM — aim the needle at the BLOOD. In anaemia the blood tank of healthy red cells is running low, so the body feels tired and pale.","an- (without / lacking) + -aemia (blood condition) = a lack of healthy blood / red cells","Anaemia • Bacteraemia • Hyperglycaemia"],
["angi","vessel","Angioplasty","heart","🛣️","AN-jee-oh","Angie fixes the pipes","ANGIE the plumber arrives with a tiny balloon to unblock the pipes. Blood vessels are the body pipes, and angioplasty is the job that opens a narrowed vessel.","angi (vessel) + -plasty (surgical repair) = repair that opens a blood vessel","Angioplasty • Angiogram • Angiography"],
["arthr","joint","Arthralgia","bone","🔩","AR-throh","King Arthur joints creak","Poor King ARTHUR! The JOINTS of his armour creak and ache at every step. Arthralgia means pain in a joint — no sword-fighting today.","arthr (joint) + -algia (pain) = joint pain","Arthralgia • Arthritis • Arthroscopy"],
["ather","fatty plaque","Atherosclerosis","heart","🧈","ATH-er-oh","Butter-porridge in the artery","The Greek word athere meant porridge. Imagine buttery porridge sludge — fatty plaque — slowly clogging an artery until it hardens. That is atherosclerosis.","ather (fatty plaque) + -sclerosis (hardening) = hardening of the arteries by fatty plaque","Atherosclerosis • Atheroma"],
["bacter","bacteria","Bacteraemia","science","🦠","BAK-ter","Bacteria gatecrash the blood","An army of tiny rod-shaped invaders with backpacks gatecrashes the bloodstream party. Bacteria where they should never be — in the blood — is bacteraemia.","bacter (bacteria) + -aemia (in the blood) = bacteria in the blood","Bacteraemia • Bacterial • Bacteriology"],
["bi","life","Biopsy","science","🌱","BY-oh","Bio means ALIVE","BIO is anything ALIVE — a sprouting seedling. A biopsy snips a tiny piece of LIVING tissue and puts it under the microscope to check it.","bi / bio (life) + -opsy (viewing) = viewing living tissue removed for testing","Biopsy • Biology • Antibiotic"],
["bronch","bronchus","Bronchoscopy","chest","🌳","BRONK","The upside-down bronchial tree","Your bronchi branch like an upside-down tree inside the lungs. In bronchoscopy a tiny camera climbs down the trunk and peeps along the branches.","bronch (bronchus / airway) + -scopy (looking inside) = camera examination of the airways","Bronchoscopy • Bronchitis • Bronchial"],
["card","heart","Tachycardia","heart","❤️","KARD","A CARD sent from the heart","A Valentine CARD arrives and your HEART races with excitement — tachycardia is an abnormally fast heartbeat. Every love card comes from the card-heart.","tachy- (fast) + card (heart) + -ia (condition) = abnormally fast heartbeat","Tachycardia • Bradycardia • Cardiac • Cardiology • Pericarditis"],
["cardi","heart","Electrocardiogram","heart","🫀","KAR-dee-oh","Cardio = heart workout","CARDI is card plus an i — the heart doing CARDIO on a treadmill. An electrocardiogram (ECG) records every electric beat of that workout.","electr- (electricity) + cardi (heart) + -gram (recording) = recording of the heart electrical activity","Electrocardiogram • Cardiomyopathy • Cardiologist"],
["cholecyst","gallbladder","Cholecystectomy","gut","🍐","KOH-leh-sist","The gallbladder bile purse","Tucked under the liver sits a little pear-shaped purse storing green bile. Cholecystectomy is simply removing that purse — the gallbladder.","cholecyst (gallbladder) + -ectomy (surgical removal) = removal of the gallbladder","Cholecystectomy • Cholecystitis"],
["cutane","skin","Subcutaneous","sense","🧥","kyoo-TAY-nee","Your cute skin coat","Your SKIN is the coat you never take off. A subcutaneous injection slips the medicine just UNDER that coat — sub means under.","sub- (under) + cutane (skin) = under the skin","Subcutaneous • Cutaneous"],
["cyst","bladder","Cystoscopy","repro","🎈","SIST-oh","The bladder balloon","The urinary bladder inflates like a balloon as it fills. In cystoscopy a tiny camera travels inside the balloon to look around.","cyst (bladder) + -scopy (looking inside) = camera examination of the bladder","Cystoscopy • Cystitis"],
["cyt","cell","Thrombocytopenia","science","🧫","SITE-oh","Sight the tiny cell","Put a CELL in your SIGHT under the microscope — a tiny room where life happens. Thrombocytopenia means too few platelet cells to help the blood clot.","thromb (clot / platelet) + cyt (cell) + -penia (deficiency) = low platelet count","Thrombocytopenia • Cytology • Erythrocyte • Leucocyte"],
["dermat","skin","Dermatitis","sense","🖐️","DER-mat","The skin shield goes on strike","Your SKIN shield turns red, itchy and cross — dermatitis. The dermatologist is the skin-shield doctor who calms it down.","dermat (skin) + -itis (inflammation) = inflammation of the skin","Dermatitis • Dermatology • Dermatologist"],
["dynamics","action or force","Pharmacodynamics","science","💥","dy-NAM-iks","Dynamite ACTION","DYNAMICS is dynamite ACTION — what the drug DOES to the body when it goes BOOM at its target. Force, effect, action!","pharmac (drug) + dynamics (action / force) = what a drug does to the body","Pharmacodynamics • Dynamic"],
["electr","electricity","Electrocardiogram","science","⚡","ee-LEK-troh","Electric sparks of the heart","Every heartbeat begins as a tiny ELECTRIC spark. The ECG machine catches those lightning sparks and draws them as the famous wiggly line.","electr (electricity) + cardi (heart) + -gram (recording) = recording of heart electricity","Electrocardiogram • Electrolytes • Electrotherapy"],
["encephal","brain","Encephalitis","brain","🧠","en-SEF-al-oh","The treasure IN the head","En means IN, cephal means head — the treasure inside the skull is the BRAIN. When that treasure becomes inflamed, it is encephalitis.","encephal (brain) + -itis (inflammation) = inflammation of the brain","Encephalitis • Encephalopathy"],
["enter","intestine","Gastroenteritis","gut","🌀","EN-ter-oh","ENTER the gut tunnel","Press ENTER and whoosh — you slide into the long, winding INTESTINE tunnel where food travels. Gastroenteritis inflames both stomach and tunnel.","gastr- (stomach) + enter (intestine) + -itis (inflammation) = inflammation of stomach and intestine","Gastroenteritis • Enteritis • Enteral"],
["erythem","redness","Erythema","sense","🌹","er-ith-EE-mah","Blushing tomato-red skin","Blood rushes to the skin surface and you blush tomato-RED with embarrassment. That visible redness of the skin is erythema.","erythem (redness / flush) = redness of the skin","Erythema • Erythematous"],
["erythr","red","Erythrocyte","heart","🚕","ER-ith-roh","Red-cell taxis","Millions of tiny RED taxis — erythrocytes — carry oxygen passengers along the blood highways and drop them off at every cell in town.","erythr (red) + -cyte (cell) = red blood cell","Erythrocyte • Erythropoietin"],
["gastr","stomach","Gastritis","gut","🍽️","GAS-troh","The grumbling stomach","Your STOMACH grumbles and churns like a washing machine full of food. When its lining becomes inflamed and sore, that is gastritis.","gastr (stomach) + -itis (inflammation) = inflammation of the stomach lining","Gastritis • Gastroenteritis • Gastroscopy"],
["glyc","sugar","Hyperglycaemia","heart","🍬","GLIKE-oh","Candy sugar in the blood","GLYC is sweet candy — glucose SUGAR floating in the bloodstream. Hyperglycaemia means far too much candy in the blood river.","hyper- (too much) + glyc (sugar) + -aemia (in the blood) = high blood sugar","Hyperglycaemia • Hypoglycaemia • Glycosuria"],
["gravida","pregnant person","Primigravida","repro","🤰","GRAV-id-ah","The gravity bump","GRAVIDA carries a beautiful bump pulled by GRAVITY. Primi means first — a primigravida is pregnant for the very first time.","primi- (first) + gravida (pregnant person) = a person pregnant for the first time","Primigravida • Multigravida • Gravidity"],
["haem","blood","Haemostasis","heart","🩸","HEEM","Haem = BLOOD, British style","Spot the British AE team: HAEM always means BLOOD. Haemostasis is the body turning off the tap — the process that stops bleeding.","haem (blood) + -stasis (stopping / standing still) = stopping of bleeding","Haemostasis • Haemoglobin • Haemorrhage"],
["haemat","blood","Haematuria","heart","🧪","HEE-mat-oh","Blood in the test tube","HAEMAT is the longer BLOOD root you meet in the lab — haematology. Haematuria turns urine pink because blood has leaked into it.","haemat (blood) + -uria (in the urine) = blood in the urine","Haematuria • Haematology • Haematoma"],
["hedon","pleasure","Anhedonia","brain","😄","HEE-don","The pleasure sparkle switch","HEDON is pure PLEASURE — music, food, laughter. Add an- (without) and the sparkle switch turns off: anhedonia, the inability to feel joy.","an- (without) + hedon (pleasure) + -ia (condition) = inability to feel pleasure","Anhedonia • Hedonism"],
["hepat","liver","Hepatomegaly","gut","🏭","HEP-at-oh","The liver chemical factory","The LIVER is a huge chemical factory filtering blood and making vital products. Hepatomegaly means the factory has become enlarged — megaly means big.","hepat (liver) + -megaly (enlargement) = enlarged liver","Hepatomegaly • Hepatitis • Hepatology"],
["hyster","uterus","Hysterectomy","repro","🌸","HIS-ter-oh","The womb house","HYSTER is the UTERUS — the small, strong house where a baby can grow. A hysterectomy is the surgical removal of that house.","hyster (uterus) + -ectomy (surgical removal) = removal of the uterus","Hysterectomy • Hysteroscopy"],
["kinetics","movement","Pharmacokinetics","science","🏃","kin-ET-iks","The drug goes travelling","KINETICS is MOVEMENT. Give the drug a passport: absorbed, travelling, changed, and finally leaving the body. Pharmacokinetics follows the whole journey.","pharmac (drug) + kinetics (movement) = how the body absorbs, moves, changes and removes a drug","Pharmacokinetics • Kinetic energy"],
["leuc","white","Leucocyte","heart","⚪","LOO-koh","White-uniform soldiers","Leucocytes march in WHITE uniforms — the white blood cells, soldier-defenders that hunt down infection. Leuc always shouts white (US spelling: leuk-).","leuc (white) + -cyte (cell) = white blood cell","Leucocyte • Leucocytosis • Leucopenia"],
["lith","stone","Nephrolithiasis","repro","🪨","LITH","A stone in the plumbing","A hard STONE gets lodged in the kidney plumbing and — ouch! — blocks the flow. Nephrolithiasis is the condition of kidney stones.","nephr (kidney) + lith (stone) + -iasis (condition) = condition of kidney stones","Nephrolithiasis • Lithotripsy • Cholelithiasis"],
["lymph","lymph","Lymphadenopathy","heart","💧","LIMF","The clear cleaning river","LYMPH is a clear river quietly draining and cleaning the tissues, passing checkpoint nodes on its way. Swollen checkpoints? Lymphadenopathy.","lymph (lymph) + aden (gland / node) + -pathy (disease) = disease of the lymph nodes","Lymphadenopathy • Lymphoma • Lymphocyte"],
["my","muscle","Myocarditis","bone","💪","MY-oh","MY muscle power","Flex your arm and shout MY MUSCLE! Myocarditis is inflammation of the hardest-working muscle of all — the heart muscle. (Combining form: myo-)","my (muscle) + cardi (heart) + -itis (inflammation) = inflammation of the heart muscle","Myocarditis • Myalgia • Myopathy"],
["myel","bone marrow","Osteomyelitis","bone","🦴","MY-el-oh","The soft centre of the bone","Cut a bone open and find the soft centre — the MARROW factory that makes blood cells. Osteomyelitis is infection reaching bone and marrow together.","oste (bone) + myel (bone marrow) + -itis (inflammation) = inflammation of bone and marrow","Osteomyelitis • Myeloma"],
["nat","birth","Prenatal","repro","👶","NAT / NAYT-al","Nature birthday","NAT is the BIRTH day — day zero of a new life. Prenatal care happens BEFORE that birthday: scans, checks and first hellos to the baby.","pre- (before) + nat (birth) + -al = before birth","Prenatal • Neonatal • Postnatal"],
["nephr","kidney","Nephrectomy","repro","🫘","NEF-roh","Kidney-bean filters","Two bean-shaped filters clean your blood all day and make urine — the KIDNEYS. A nephrectomy removes one of those hard-working beans.","nephr (kidney) + -ectomy (surgical removal) = removal of a kidney","Nephrectomy • Nephritis • Nephrology"],
["neur","nerve","Neuralgia","brain","🌐","NYOO-roh","The electric wire network","NERVES are electric wires carrying messages at lightning speed. Neuralgia is a fault in the wire — sudden, electric-shock nerve pain.","neur (nerve) + -algia (pain) = nerve pain","Neuralgia • Neurology • Neurone"],
["ophthalm","eye","Ophthalmology","sense","👁️","of-THAL-moh","Big word, BIG eyes","Open your eyes wide — O! OPHTHALM is the grand, tricky-spelt root for EYE. Ophthalmology is the whole world of eye medicine.","ophthalm (eye) + -ology (study of) = the study and care of the eyes","Ophthalmology • Ophthalmologist • Ophthalmoscope"],
["orch","testis","Orchitis","repro","🥚","ORK","The egg-shaped testis","ORCH points to the TESTIS, the egg-shaped organ that produces sperm and testosterone. Orchitis is its painful inflammation.","orch (testis) + -itis (inflammation) = inflammation of the testis","Orchitis • Orchidectomy"],
["oste","bone","Osteoarthritis","bone","💀","OS-tee-oh","The skeleton bone dance","OSTE is BONE — click-clack goes the dancing skeleton! In osteoarthritis the bone-and-joint surfaces wear down and the dance becomes painful.","oste (bone) + arthr (joint) + -itis = joint disease involving bone and cartilage wear","Osteoarthritis • Osteoporosis • Osteomyelitis"],
["ot","ear","Otitis","sense","👂","OHT-oh","OH! My ear!","Grab your EAR and shout OH! — OT is ear, and otitis is the sore, inflamed ear that makes you shout it.","ot (ear) + -itis (inflammation) = inflammation of the ear","Otitis • Otoscope • Otology"],
["ox","oxygen","Hypoxaemia","chest","🫧","OKS","Oxygen, the invisible fuel","Every cell is a little engine and OXYGEN is its fuel. Hypoxaemia lights the warning lamp: the blood is running low on oxygen fuel.","hypo- (low) + ox (oxygen) + -aemia (in the blood) = low oxygen in the blood","Hypoxaemia • Hypoxia • Oxygen therapy"],
["path","disease","Pathogen","science","🤒","PATH","Disease takes the wrong path","The body was walking the healthy PATH — then DISEASE blocked the road. A pathogen is the germ that produces (-gen) that disease.","path (disease) + -gen (producer) = an organism that produces disease","Pathogen • Pathology • Pathogenic"],
["pharmac","drug","Pharmacokinetics","science","💊","FAR-mak-oh","The pharmacy drug shelf","PHARMAC points straight to the PHARMACY shelf of DRUGS. Pharmacokinetics follows one of those drugs on its journey through the body.","pharmac (drug) + kinetics (movement) = the movement of a drug through the body","Pharmacokinetics • Pharmacodynamics • Pharmacology"],
["pneum","air","Pneumothorax","chest","🎈","NYOOM","Air in the wrong place","PNEUM is AIR, like a pneumatic tyre. In pneumothorax, air leaks into the chest space where it does not belong and squashes the lung flat — pop!","pneum (air) + thorax (chest) = air in the chest cavity","Pneumothorax • Pneumonia • Pneumatic"],
["por","pore or passage","Osteoporosis","bone","🧽","POR","A sponge full of pores","Squeeze a sponge — it is full of PORES and passages. In osteoporosis, bone becomes holey and fragile like that sponge.","oste (bone) + por (pore / passage) + -osis (condition) = condition of porous, weak bones","Osteoporosis • Pore • Porous"],
["prostat","prostate","Prostatectomy","repro","🌰","PROS-tat","The walnut gland","The PROSTATE is a walnut-sized gland sitting just under the bladder in males. A prostatectomy removes that walnut.","prostat (prostate) + -ectomy (surgical removal) = removal of the prostate gland","Prostatectomy • Prostatitis"],
["radi","radiation","Radiography","science","📸","RAY-dee-oh","Rays take a skeleton selfie","RADI sends X-RAY radiation through the body and — flash! — takes a skeleton selfie. Radiography is imaging with radiation.","radi (radiation / rays) + -graphy (recording) = imaging using radiation","Radiography • Radiology • Radiograph"],
["rhin","nose","Rhinorrhoea","sense","🦏","RY-noh","The RHINO giant nose","The RHINOceros carries its horn on a giant NOSE. Rhinorrhoea is a nose turned into a river: rhin (nose) + -rrhoea (flow) = runny nose!","rhin (nose) + -rrhoea (flow / discharge) = runny nose, nasal discharge","Rhinorrhoea • Rhinitis • Rhinoplasty"],
["salping","fallopian tube","Salpingectomy","repro","🎺","SAL-ping-goh","The trumpet tubes","Salpinx is Greek for trumpet — and the FALLOPIAN TUBES really do flare like trumpet bells to catch the egg. Salpingectomy removes one trumpet.","salping (fallopian tube) + -ectomy (surgical removal) = removal of a fallopian tube","Salpingectomy • Salpingitis"],
["somn","sleep","Insomnia","brain","😴","SOM-n","Sleepy under the moon","SOMN whispers SLEEP under a quiet moon. But insomnia keeps the eyes wide open, counting stars instead of sleeping.","in- (not) + somn (sleep) + -ia (condition) = inability to sleep","Insomnia • Somnolence • Somnambulism"],
["son","sound","Ultrasonography","science","🔊","SON-oh","Sound paints a picture","Like a bat navigating by echoes, ultrasonography bounces SOUND waves inside the body and paints a picture — often the first portrait of a baby!","ultra- (beyond hearing) + son (sound) + -graphy (imaging) = imaging using sound waves","Ultrasonography • Sonographer • Ultrasound"],
["splen","spleen","Splenomegaly","heart","🟣","SPLEN-oh","The purple blood sponge","Hidden on the left under the ribs, the SPLEEN is a purple sponge that filters blood and backs up the immune system. Splenomegaly = an enlarged sponge.","splen (spleen) + -megaly (enlargement) = enlarged spleen","Splenomegaly • Splenectomy"],
["tension","pressure","Hypertension","heart","📈","TEN-shun","Pressure in the hose","Turn a garden hose up too high and the PRESSURE strains its walls. Hypertension is that same strain inside your arteries — high blood pressure.","hyper- (high / too much) + tension (pressure) = high blood pressure","Hypertension • Hypotension"],
["thorax","chest","Pneumothorax","chest","🩻","THOR-aks","The treasure chest","Your rib cage is a treasure CHEST guarding heart and lungs. In pneumothorax, loose air rattles around inside the chest where no air should be.","pneum (air) + thorax (chest) = air in the chest cavity","Pneumothorax • Thoracic • Thoracotomy"],
["thromb","clot","Thrombocytopenia","heart","🧱","THROMB-oh","Clot bricks block the road","THROMB builds CLOT bricks that seal leaks — helpful! But thrombocytopenia means too few platelet bricklayers, so bleeding is hard to stop.","thromb (clot / platelet) + cyt (cell) + -penia (deficiency) = low platelet count","Thrombocytopenia • Thrombosis • Thrombocyte"],
["thyroid","thyroid gland","Hypothyroidism","science","🦋","THY-royd","The butterfly speed controller","A butterfly-shaped gland in the neck — the THYROID — sets the speed of your whole body. In hypothyroidism the butterfly flies too slowly.","hypo- (under / low) + thyroid (thyroid gland) + -ism (condition) = underactive thyroid gland","Hypothyroidism • Hyperthyroidism • Thyroidectomy"],
["tom","section or cut","Tomography","science","🍞","TOM-oh","The body sliced like bread","TOM means to CUT into SECTIONS. Tomography (CT) photographs the body slice by slice, exactly like cutting a loaf of bread to see inside.","tom (section / cut) + -graphy (imaging) = imaging the body in sections or slices","Tomography • Anatomy • Atom (un-cuttable!)"],
["ur","urine","Haematuria","repro","💧","YOOR-oh","The yellow urine river","UR points to URINE, the yellow river leaving the body. When blood joins that river and turns it pink, doctors call it haematuria.","haemat (blood) + ur (urine) + -ia (condition) = blood in the urine","Haematuria • Dysuria • Urology"]
];
const DATA=RAW.map((a,i)=>({id:i,r:a[0],m:a[1],ex:a[2],cat:a[3],icon:a[4],say:a[5],hook:a[6],story:a[7],br:a[8],also:a[9]}));
const MEDLEX="https://medlex.healthcarecrownacademy.co.uk/#library/lab?w=";
const LEVELS=[[0,"Novice 🌱"],[200,"Med Student 📚"],[500,"Intern 🩺"],[900,"Resident 💉"],[1400,"Specialist 🔬"],[2000,"Consultant 🏅"],[2800,"Root Professor 👑"]];
const BADGES=[
{id:"intro",e:"🌳",n:"Root Ready",d:"Complete the Roots intro",t:s=>!!s.intro&&s.intro.size>=4},
{id:"first",e:"🌱",n:"First Root",d:"Open your first card",t:s=>s.opened.size>=1},
{id:"exp10",e:"🧭",n:"Explorer",d:"Open 10 cards",t:s=>s.opened.size>=10},
{id:"exp30",e:"🗺️",n:"Halfway Hero",d:"Open 30 cards",t:s=>s.opened.size>=30},
{id:"legend",e:"👑",n:"Root Legend",d:"Open all 60 cards",t:s=>s.opened.size>=60},
{id:"ears",e:"👂",n:"Super Listener",d:"Use Listen 10 times",t:s=>s.listenCount>=10},
{id:"mast10",e:"🎓",n:"Rising Clinician",d:"Master 10 roots",t:s=>s.mastered.size>=10},
{id:"mast30",e:"🏅",n:"Root Master",d:"Master 30 roots",t:s=>s.mastered.size>=30},
{id:"mast60",e:"🏆",n:"Grand Master",d:"Master all 60 roots",t:s=>s.mastered.size>=60},
{id:"streak",e:"🔥",n:"Hot Streak",d:"5 quiz answers in a row",t:s=>s.streakBest>=5},
{id:"perfect",e:"🌟",n:"Quiz Perfection",d:"Score 10/10 in Quiz Arena",t:s=>s.quizPerfect},
{id:"match",e:"🧩",n:"Match Champion",d:"Win a Match Rush round",t:s=>s.matchWins>=1}
];
/* ================= STATE ================= */
const KEY="rootQuest60v1";
let state={xp:0,mastered:new Set(),stars:new Set(),opened:new Set(),listened:new Set(),mini:new Set(),intro:new Set(),badges:new Set(),listenCount:0,quizBest:0,streakBest:0,quizPerfect:false,matchWins:0};
function save(){try{localStorage.setItem(KEY,JSON.stringify({xp:state.xp,mastered:[...state.mastered],stars:[...state.stars],opened:[...state.opened],listened:[...state.listened],mini:[...state.mini],intro:[...state.intro],badges:[...state.badges],listenCount:state.listenCount,quizBest:state.quizBest,streakBest:state.streakBest,quizPerfect:state.quizPerfect,matchWins:state.matchWins}))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(!d)return;state.xp=d.xp||0;["mastered","stars","opened","listened","mini","intro","badges"].forEach(k=>state[k]=new Set(d[k]||[]));state.listenCount=d.listenCount||0;state.quizBest=d.quizBest||0;state.streakBest=d.streakBest||0;state.quizPerfect=!!d.quizPerfect;state.matchWins=d.matchWins||0}catch(e){}}
load();
let filterCat="all",lastRendered=DATA.map(d=>d.id),currentId=null,shuffleOrder=null,soundOn=true;
/* ================= HELPERS ================= */
const $=id=>document.getElementById(id);
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const pickUniqueMeaning=n=>{const out=[],seen=new Set();for(const d of shuffle(DATA)){if(!seen.has(d.m)){seen.add(d.m);out.push(d);if(out.length===n)break}}return out};
function getOptions(item,n){const pool=[],seen=new Set([item.m]);for(const d of shuffle(DATA)){if(!seen.has(d.m)){seen.add(d.m);pool.push(d.m);if(pool.length===n-1)break}}return shuffle([item.m,...pool])}
function toast(msg){const t=document.createElement("div");t.className="toast";t.innerHTML=msg;$("toasts").appendChild(t);setTimeout(()=>{t.style.opacity="0";t.style.transition="opacity .4s";setTimeout(()=>t.remove(),420)},3400)}
function confetti(n){n=n||70;const cols=["#E8A33D","#3AA6B9","#7FA8C9","#3BA97C","#D65A7A","#CBDCEA"];for(let i=0;i<n;i++){const s=document.createElement("span");s.className="confettiPiece";s.style.left=Math.random()*100+"vw";s.style.background=cols[i%cols.length];s.style.setProperty("--drift",(Math.random()*220-110)+"px");s.style.animationDuration=(2.2+Math.random()*1.8)+"s";s.style.animationDelay=(Math.random()*.35)+"s";if(Math.random()>.5)s.style.borderRadius="50%";document.body.appendChild(s);setTimeout(()=>s.remove(),4600)}}
/* sound effects */
let AC=null;
function tone(f,delay,dur){if(!soundOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=f;o.connect(g);g.connect(AC.destination);const t=AC.currentTime+delay;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.05)}catch(e){}}
const sfx={click:()=>tone(520,0,.08),good:()=>{tone(659,0,.14);tone(880,.11,.2)},great:()=>{tone(523,0,.13);tone(659,.1,.13);tone(784,.2,.13);tone(1046,.3,.28)},bad:()=>tone(175,0,.28),pop:()=>tone(740,0,.07)};
/* speech */
let GBvoice=null;
function pickVoice(){try{const v=speechSynthesis.getVoices();GBvoice=v.find(x=>/^en[-_]GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||v[0]||null}catch(e){}}
if("speechSynthesis" in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function speak(text,rootId,award,btn){
  if(!("speechSynthesis" in window)){toast("🔇 Sorry — this browser has no speech voice. Try Chrome or Edge for the Listen buttons.");return}
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";if(GBvoice)u.voice=GBvoice;u.rate=.92;u.pitch=1;
    if(btn){btn.classList.add("speaking");u.onend=u.onerror=()=>btn.classList.remove("speaking")}
    speechSynthesis.speak(u);
    state.listenCount++;
    if(award&&rootId!==null&&rootId!==undefined&&!state.listened.has(rootId)){state.listened.add(rootId);addXP(2,"👂 First listen to <b>"+DATA[rootId].r+"</b>")}
    checkBadges();save();updateHUD();
  }catch(e){toast("🔇 Speech is blocked here — open the downloaded file in Chrome/Edge to listen.")}
}
function stopSpeak(){try{speechSynthesis.cancel()}catch(e){}document.querySelectorAll(".speaking").forEach(b=>b.classList.remove("speaking"))}
const cleanSpeak=s=>s.replace(/\+/g,", plus,").replace(/=/g,", means,").replace(/[•·]/g,",");
/* XP / levels / badges */
function levelInfo(xp){let cur=LEVELS[0],next=null;for(let i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i][0]){cur=LEVELS[i];next=LEVELS[i+1]||null}}return{cur,next}}
function addXP(n,reason){if(n<=0)return;const before=levelInfo(state.xp).cur[1];state.xp+=n;const after=levelInfo(state.xp).cur[1];if(reason)toast("⭐ <b>+"+n+" XP</b> — "+reason);if(after!==before){setTimeout(()=>{toast("🎉 <b>LEVEL UP!</b> You are now <b>"+after+"</b>");confetti(110);sfx.great()},350)}checkBadges();save();updateHUD()}
function checkBadges(){BADGES.forEach(b=>{if(!state.badges.has(b.id)&&b.t(state)){state.badges.add(b.id);setTimeout(()=>{toast(b.e+" <b>Badge unlocked: "+b.n+"</b><br><span style='font-weight:700;color:var(--mut)'>"+b.d+"</span>");confetti(45);sfx.great()},250)}})}
/* ================= RENDER ================= */
function renderCats(){
  const counts={all:DATA.length};DATA.forEach(d=>counts[d.cat]=(counts[d.cat]||0)+1);
  let html=`<button class="pill ${filterCat==="all"?"active":""}" data-cat="all" style="--h:265">🌈 All systems (${counts.all})</button>`;
  Object.entries(CATS).forEach(([k,c])=>{html+=`<button class="pill ${filterCat===k?"active":""}" data-cat="${k}" style="--h:${c.h}">${c.e} ${c.n} (${counts[k]||0})</button>`});
  $("catPills").innerHTML=html;
}
function currentList(){
  const q=$("searchInput").value.trim().toLowerCase(),view=$("viewSel").value,sort=$("sortSel").value;
  let list=DATA.filter(d=>{
    if(filterCat!=="all"&&d.cat!==filterCat)return false;
    if(view==="mastered"&&!state.mastered.has(d.id))return false;
    if(view==="learning"&&state.mastered.has(d.id))return false;
    if(view==="starred"&&!state.stars.has(d.id))return false;
    if(view==="unopened"&&state.opened.has(d.id))return false;
    if(q&&!(d.r+" "+d.m+" "+d.ex+" "+d.also+" "+CATS[d.cat].n).toLowerCase().includes(q))return false;
    return true});
  if(sort==="azroot")list.sort((a,b)=>a.r.localeCompare(b.r));
  else if(sort==="azmean")list.sort((a,b)=>a.m.localeCompare(b.m));
  else if(sort==="shuffle"){if(!shuffleOrder)shuffleOrder=shuffle(DATA.map(d=>d.id));list.sort((a,b)=>shuffleOrder.indexOf(a.id)-shuffleOrder.indexOf(b.id))}
  else list.sort((a,b)=>(state.mastered.has(a.id)-state.mastered.has(b.id))||a.id-b.id);
  return list;
}
function renderGrid(){
  const list=currentList();lastRendered=list.map(d=>d.id);
  $("resultCount").textContent="🃏 Showing "+list.length+" of 60 roots"+(filterCat!=="all"?" • "+CATS[filterCat].n:"")+" — tap a card to pop it open!";
  $("emptyState").style.display=list.length?"none":"block";
  $("grid").innerHTML=list.map((d,i)=>{
    const c=CATS[d.cat],mas=state.mastered.has(d.id),st=state.stars.has(d.id);
    return `<article class="card ${mas?"mastered":""}" role="group" aria-label="Root ${d.r}, meaning ${d.m}" data-id="${d.id}" data-icon="${d.icon}" style="--h:${c.h};--d:${Math.min(i,20)*35}ms">
    ${mas?'<div class="stamp">✓ MASTERED</div>':""}
    <div class="cardTop"><span class="catTag">${c.e} ${c.s}</span>
    <span class="cardActs"><button class="miniAct" data-card-speak="${d.id}" title="Listen" aria-label="Listen to ${d.r}">🔊</button><button class="miniAct ${st?"starred":""}" data-card-star="${d.id}" title="Star" aria-label="Star ${d.r}">${st?"⭐":"☆"}</button></span></div>
    <div class="iconBubble">${d.icon}</div>
    <div class="rootWord">${d.r}<small> ROOT #${d.id+1}</small></div>
    <div class="meaning">= ${d.m}</div>
    <div class="hookTease">🧠 “${d.hook}”</div>
    <span class="exChip">🔬 as in <b>${d.ex}</b></span>
    <button type="button" class="tapHint" aria-label="Open root ${d.r}: picture, memory hook and game">👆 TAP FOR PICTURE + HOOK + GAME</button></article>`}).join("");
  attachTilt();
}
function attachTilt(){
  document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("mousemove",e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(700px) rotateX(${(-y*9).toFixed(1)}deg) rotateY(${(x*11).toFixed(1)}deg) translateY(-5px) scale(1.02)`});
    card.addEventListener("mouseleave",()=>card.style.transform="");
  });
}
function renderBadges(){$("badgeShelf").innerHTML=BADGES.map(b=>`<div class="badge ${state.badges.has(b.id)?"on":""}"><div class="be">${b.e}</div><div class="bn">${b.n}</div><div class="bd">${b.d}</div></div>`).join("")}
function updateHUD(){
  const li=levelInfo(state.xp);
  $("xpText").textContent=state.xp.toLocaleString()+" XP";
  $("levelText").textContent=li.cur[1];
  $("masteredText").textContent=state.mastered.size+"/60 mastered";
  $("openedText").textContent=state.opened.size+" explored";
  if(li.next){$("nextText").textContent=(li.next[0]-state.xp)+" XP to go";$("levelBar").style.width=Math.round((state.xp-li.cur[0])/(li.next[0]-li.cur[0])*100)+"%"}
  else{$("nextText").textContent="MAX LEVEL 👑";$("levelBar").style.width="100%"}
  const pct=Math.round(state.mastered.size/60*100);
  $("masterPct").textContent=pct+"%";$("masterFrac").textContent=state.mastered.size+" of 60 roots mastered";$("masterBar").style.width=pct+"%";
  $("catProgress").innerHTML=Object.entries(CATS).map(([k,c])=>{const tot=DATA.filter(d=>d.cat===k).length,done=DATA.filter(d=>d.cat===k&&state.mastered.has(d.id)).length;return `<div class="cpRow" style="--h:${c.h}">${c.e} ${c.n.split(",")[0]} — ${done}/${tot}<div class="bar"><i style="width:${tot?done/tot*100:0}%"></i></div></div>`}).join("");
  renderBadges();
}
/* ================= DETAIL POPUP ================= */
function highlightEx(d){const i=d.ex.toLowerCase().indexOf(d.r.toLowerCase());if(i<0)return d.ex;return d.ex.slice(0,i)+"<mark>"+d.ex.slice(i,i+d.r.length)+"</mark>"+d.ex.slice(i+d.r.length)}
function openDetail(id){
  currentId=id;const d=DATA[id],c=CATS[d.cat];
  const first=!state.opened.has(id);state.opened.add(id);
  const m=$("detailModal");m.style.setProperty("--h",c.h);
  $("dCat").textContent=c.e+" "+c.n.toUpperCase();$("dNum").textContent="ROOT #"+(id+1)+" / 60";
  $("dWater").textContent=d.r;$("dSceneIcon").textContent=d.icon;
  $("dRoot").textContent=d.r;$("dSay").textContent="🗣️ say it: "+d.say;
  $("dMeaning").textContent=d.m;
  $("dHook").textContent=d.icon+" “"+d.hook+"”";$("dStory").textContent=d.story;
  $("dExample").innerHTML=highlightEx(d);
  $("dBreak").textContent=d.br;
  $("dAlso").innerHTML="<span style='font-weight:900;color:var(--mut);font-size:.8rem'>👀 Also seen in:</span> "+d.also.split("•").map(w=>`<span class="chip">${w.trim()}</span>`).join("");
  const twins=DATA.filter(x=>x.id!==d.id&&x.m===d.m);
  $("dTwinsWrap").innerHTML=twins.length?`<div style="font-weight:900;color:var(--gold);font-size:.85rem">👯 Root twins — same meaning, different spelling:</div><div class="chips">${twins.map(t=>`<span class="chip chipBtn" data-twin="${t.id}">${t.icon} ${t.r} →</span>`).join("")}</div>`:"";
  $("dLink").href=MEDLEX+d.ex.toLowerCase().replace(/[^a-z]/g,"");
  $("dLink").textContent="📖 Open “"+d.ex+"” in MedLex ↗";
  $("dStar").textContent=state.stars.has(id)?"⭐":"☆";
  updMasterBtn();
  buildMini(d);
  $("detailOverlay").classList.add("open");document.body.style.overflow="hidden";$("detailOverlay").scrollTop=0;
  sfx.pop();
  if(first){addXP(5,"🔎 First look at <b>"+d.r+"</b>")}else{checkBadges();save();updateHUD()}
  renderGrid();
}
function updMasterBtn(){const mas=state.mastered.has(currentId);$("dMaster").innerHTML=mas?"✅ MASTERED! (tap to undo)":"✅ Mark as MASTERED (+20 XP)";$("dMaster").classList.toggle("green",!mas);$("dMaster").classList.toggle("ghost",mas)}
function closeDetail(){$("detailOverlay").classList.remove("open");document.body.style.overflow="";stopSpeak()}
function stepDetail(dir){if(currentId===null)return;let i=lastRendered.indexOf(currentId);if(i<0)i=currentId;const n=lastRendered.length||60;const nid=lastRendered.length?lastRendered[(i+dir+n)%n]:(currentId+dir+60)%60;openDetail(nid)}
/* mini-check */
let miniAnswered=false;
function buildMini(d){
  miniAnswered=false;$("miniNew").style.display="none";$("miniFeed").innerHTML="";
  $("miniQ").innerHTML="❓ What does <b style='color:var(--gold)'>"+d.r+"</b> mean?";
  const opts=getOptions(d,3);
  $("miniOpts").innerHTML=opts.map((o,i)=>`<button class="opt" data-mini="${i}">${"ABC"[i]}. ${o}</button>`).join("");
  $("miniOpts").querySelectorAll("[data-mini]").forEach(b=>b.onclick=()=>{
    if(miniAnswered)return;const choice=opts[+b.dataset.mini];
    if(choice===d.m){miniAnswered=true;b.classList.add("correct");$("miniOpts").querySelectorAll(".opt").forEach(x=>x.disabled=true);
      $("miniFeed").innerHTML="🎉 <span style='color:var(--green)'>CORRECT!</span> "+d.icon+" Remember: <b>“"+d.hook+"”</b> — "+d.r+" = "+d.m+".";sfx.good();confetti(35);
      if(!state.mini.has(d.id)){state.mini.add(d.id);addXP(10,"⚡ Mini-Check smashed for <b>"+d.r+"</b>")}save();
    }else{b.classList.add("wrong");b.disabled=true;sfx.bad();$("miniFeed").innerHTML="😬 Not that one! Hint: picture "+d.icon+" — <b>“"+d.hook+"”</b>. Try again!"}
    $("miniNew").style.display=miniAnswered?"inline-block":"none";
  });
}
$("miniNew").onclick=()=>buildMini(DATA[currentId]);
/* detail buttons */
$("dClose").onclick=closeDetail;$("dPrev").onclick=()=>stepDetail(-1);$("dNext").onclick=()=>stepDetail(1);
$("dRandom").onclick=()=>openRandom();
$("dStar").onclick=()=>{toggleStar(currentId);$("dStar").textContent=state.stars.has(currentId)?"⭐":"☆"};
$("dMaster").onclick=()=>{
  const d=DATA[currentId];
  if(state.mastered.has(currentId)){state.mastered.delete(currentId);toast("↩️ <b>"+d.r+"</b> moved back to learning.")}
  else{state.mastered.add(currentId);sfx.great();confetti(80);addXP(20,"🏆 Mastered <b>"+d.r+"</b> — "+state.mastered.size+"/60 done!")}
  updMasterBtn();save();updateHUD();renderGrid();
};
$("dSpeakRoot").onclick=e=>{const d=DATA[currentId];speak("The root "+d.r+". "+d.r+" means "+d.m+". Say it with me: "+d.r+".",currentId,true,e.currentTarget)};
$("dSpeakExample").onclick=e=>{const d=DATA[currentId];speak(d.ex+". "+cleanSpeak(d.br)+".",currentId,true,e.currentTarget)};
$("dSpeakHook").onclick=e=>{const d=DATA[currentId];speak("Memory hook. "+d.hook+". "+d.story,currentId,true,e.currentTarget)};
$("dSpeakAll").onclick=e=>{const d=DATA[currentId];speak("Root Quest lesson. The root "+d.r+" means "+d.m+". Memory hook: "+d.hook+". "+d.story+" Example word: "+d.ex+". "+cleanSpeak(d.br)+". Also seen in: "+cleanSpeak(d.also)+".",currentId,true,e.currentTarget)};
$("dTwinsWrap").addEventListener("click",e=>{const t=e.target.closest("[data-twin]");if(t)openDetail(+t.dataset.twin)});
function toggleStar(id){state.stars.has(id)?state.stars.delete(id):state.stars.add(id);sfx.click();save();renderGrid()}
function openRandom(){const pool=DATA.filter(d=>!state.mastered.has(d.id));const pick=pool.length?pool[Math.floor(Math.random()*pool.length)]:DATA[Math.floor(Math.random()*60)];openDetail(pick.id)}
/* grid events */
$("grid").addEventListener("click",e=>{
  const sp=e.target.closest("[data-card-speak]");if(sp){const d=DATA[+sp.dataset.cardSpeak];speak(d.r+". "+d.r+" means "+d.m+", as in "+d.ex+".",d.id,true,null);return}
  const st=e.target.closest("[data-card-star]");if(st){toggleStar(+st.dataset.cardStar);return}
  const card=e.target.closest(".card");if(card)openDetail(+card.dataset.id);
});
$("grid").addEventListener("keydown",e=>{const card=e.target.closest(".card");if(card&&card===e.target&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openDetail(+card.dataset.id)}});
/* toolbar events */
$("catPills").addEventListener("click",e=>{const p=e.target.closest("[data-cat]");if(!p)return;filterCat=p.dataset.cat;sfx.click();renderCats();renderGrid()});
$("searchInput").addEventListener("input",renderGrid);
$("viewSel").addEventListener("change",renderGrid);
$("sortSel").addEventListener("change",renderGrid);
$("btnShuffle").onclick=()=>{shuffleOrder=shuffle(DATA.map(d=>d.id));$("sortSel").value="shuffle";sfx.click();renderGrid();toast("🔀 Cards shuffled — new adventure order!")};
$("btnPrint").onclick=()=>window.print();
$("btnReset").onclick=()=>{if(confirm("Reset ALL progress, XP, stars and badges?")){state={xp:0,mastered:new Set(),stars:new Set(),opened:new Set(),listened:new Set(),mini:new Set(),intro:new Set(),badges:new Set(),listenCount:0,quizBest:0,streakBest:0,quizPerfect:false,matchWins:0};save();updateHUD();renderGrid();renderIntro(true);toast("↺ Fresh quest started. Good luck, Novice 🌱")}};
$("btnExplore").onclick=()=>$("explorer").scrollIntoView({behavior:"smooth"});
$("btnRandomHero").onclick=openRandom;
$("soundToggle").onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?"🔊":"🔇";if(soundOn)sfx.good();toast(soundOn?"🔊 Sound effects ON":"🔇 Sound effects OFF (Listen buttons still work)")};
/* ================= INTERACTIVE ROOTS INTRO ================= */
const INTRO_LABELS={core:"🌳 Core idea discovered",build:"🧱 Build-a-Word completed",join:"🔗 Combining vowel unlocked",decode:"🕵️ Decode challenge cracked"};
function renderIntro(reset){
  if(!$("introBar"))return;
  if(!state.intro)state.intro=new Set();
  const n=Math.min(state.intro.size,4);
  $("introProgressText").textContent=n+" / 4";
  $("introBar").style.width=(n/4*100)+"%";
  document.querySelectorAll("[data-intro-tab]").forEach(t=>{const done=state.intro.has(t.dataset.introTab);t.classList.toggle("done",done);const tick=t.querySelector("[data-intro-tick]");if(tick)tick.textContent=done?"✓":""});
  $("introDoneBanner").classList.toggle("show",n>=4);
  if(reset){
    document.querySelectorAll("[data-core-seg]").forEach(b=>b.classList.remove("selected"));
    $("coreFeed").className="infoCallout";$("coreFeed").innerHTML="👆 Your mission: tap the part that means <b>HEART</b>. That part is the root of <b>tachycardia</b>.";
    buildBuilt=false;renderBuild();
    setJoin(false,false);
    decodeFound.clear();applyDecode();
  }
  if(state.intro.has("core")){
    const rb=document.querySelector('[data-core-seg="root"]');if(rb)rb.classList.add("selected");
    $("coreFeed").className="infoCallout good";$("coreFeed").innerHTML="🎉 <b>Exactly!</b> <b>cardi = heart</b> is the ROOT. So <b>tachycardia</b> = fast + heart + condition = a fast-heart condition.";
  }
  if(state.intro.has("join"))setJoin(true,false);
  if(state.intro.has("decode")){decodeFound=new Set(["suffix","roots","prefix"]);applyDecode();markDecodeCorrect(false)}
}
function completeIntro(id){
  if(!state.intro)state.intro=new Set();
  const fresh=!state.intro.has(id);state.intro.add(id);
  if(fresh){sfx.good();confetti(state.intro.size>=4?100:28);addXP(10,INTRO_LABELS[id]||"🌳 Roots intro discovery")}
  renderIntro(false);save();
}
function switchIntroTab(id){
  document.querySelectorAll("[data-intro-tab]").forEach(t=>{const on=t.dataset.introTab===id;t.classList.toggle("active",on);t.setAttribute("aria-selected",on?"true":"false")});
  document.querySelectorAll(".introPanel").forEach(p=>p.classList.toggle("active",p.id==="intro-"+id));
  sfx.click();
}
document.querySelectorAll("[data-intro-tab]").forEach(t=>t.onclick=()=>switchIntroTab(t.dataset.introTab));
$("btnIntroHero").onclick=()=>$("rootIntro").scrollIntoView({behavior:"smooth"});
$("introToCards").onclick=()=>$("explorer").scrollIntoView({behavior:"smooth"});
$("introListen").onclick=e=>speak("What is a root? A root is the core, or trunk, of a medical word. It carries the main meaning, often a body part or substance. For example, cardi means heart, nephr means kidney, and gastr means stomach. Prefixes adjust the meaning at the start, and suffixes often describe a condition or procedure at the end. Learn the root, and long medical words begin to make sense.",null,false,e.currentTarget);
document.querySelectorAll("#rootIntro [data-open-root]").forEach(b=>b.onclick=()=>openDetail(+b.dataset.openRoot));
/* Intro 1: spot the root */
const CORE_INFO={
 prefix:"↩️ <b>tachy-</b> is a <b>PREFIX</b>. It sits at the start and adjusts the root: tachy- means <b>fast</b>. Helpful — but it is not the main body part. Try the middle block!",
 root:"🎉 <b>Exactly!</b> <b>cardi = heart</b> is the ROOT. It gives tachycardia its main meaning: fast + heart + condition.",
 suffix:"🏁 <b>-ia</b> is a <b>suffix</b>. Endings often signal a condition or state. Now find the block that names the body part!"
};
document.querySelectorAll("[data-core-seg]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("[data-core-seg]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
  const kind=b.dataset.coreSeg;$("coreFeed").className="infoCallout"+(kind==="root"?" good":" warn");$("coreFeed").innerHTML=CORE_INFO[kind];
  speak(kind==="root"?"Yes. Cardi is the root, and it means heart.":kind==="prefix"?"Tachy is a prefix. It means fast.":"I A is a suffix, meaning a condition.",null,false,null);
  if(kind==="root")completeIntro("core");else sfx.click();
});
/* Intro 2: build-a-word */
const RECIPES={
 cardiology:{word:"Cardiology",parts:[["cardi","ROOT • heart","rootSeg"],["o","joining vowel","vowelSeg"],["-logy","study of","suffixSeg"]],mean:"🫀 <b>Cardiology</b> = the study / medical specialty of the <b>heart</b>. The root tells you the topic instantly."},
 gastritis:{word:"Gastritis",parts:[["gastr","ROOT • stomach","rootSeg"],["-itis","inflammation","suffixSeg"]],mean:"🍽️ <b>Gastritis</b> = inflammation of the <b>stomach</b>. No joining “o” is needed because -itis begins with a vowel."},
 nephrectomy:{word:"Nephrectomy",parts:[["nephr","ROOT • kidney","rootSeg"],["-ectomy","surgical removal","suffixSeg"]],mean:"🫘 <b>Nephrectomy</b> = surgical removal of a <b>kidney</b>. Same root idea, very different ending!"},
 hepatomegaly:{word:"Hepatomegaly",parts:[["hepat","ROOT • liver","rootSeg"],["o","joining vowel","vowelSeg"],["-megaly","enlargement","suffixSeg"]],mean:"🏭 <b>Hepatomegaly</b> = enlargement of the <b>liver</b>. Spot hepat, and you already know the organ."}
};
let currentRecipe="cardiology",buildBuilt=false;
function renderBuild(){
  const r=RECIPES[currentRecipe];
  $("buildSegs").innerHTML=r.parts.map((p,i)=>(i?'<span class="segPlus">+</span>':"")+`<span class="seg ${p[2]}"><b>${p[0]}</b><span>${p[1]}</span></span>`).join("");
  $("buildWord").textContent=buildBuilt?r.word:r.parts.map(p=>p[0]).join(" + ");
  $("buildWord").classList.toggle("built",buildBuilt);
  $("buildMeaning").innerHTML=buildBuilt?r.mean:"Press “Build it” to reveal the finished word and its meaning.";
}
function setRecipe(key){currentRecipe=key;buildBuilt=false;document.querySelectorAll("[data-recipe]").forEach(b=>b.classList.toggle("active",b.dataset.recipe===key));renderBuild();sfx.click()}
document.querySelectorAll("[data-recipe]").forEach(b=>b.onclick=()=>setRecipe(b.dataset.recipe));
$("buildBtn").onclick=()=>{buildBuilt=true;renderBuild();sfx.great();completeIntro("build")};
$("buildSpeak").onclick=e=>{const r=RECIPES[currentRecipe];speak(r.word+". "+r.mean.replace(/<[^>]+>/g,""),null,false,e.currentTarget);if(!buildBuilt){buildBuilt=true;renderBuild()}};
renderBuild();
/* Intro 3: combining vowel */
let joinOn=false;
function setJoin(on,award){
  joinOn=on;const btn=$("joinToggle");btn.classList.toggle("on",on);btn.setAttribute("aria-pressed",on?"true":"false");btn.textContent=on?"ON o":"o OFF";
  $("joinWord").textContent=on?"Cardiology":"cardi + logy";$("joinWord").classList.toggle("built",on);
  $("joinFeed").className="infoCallout "+(on?"good":"warn");
  $("joinFeed").innerHTML=on?"✨ <b>Smooth!</b> <b>cardi + o</b> makes the combining form <b>cardio-</b>, so the finished word is <b>cardiology</b>. That little “o” is a connector, not a root.":"😬 Without the “o”, the join feels bumpy. Flip the switch ON to add the combining vowel.";
  if(on&&award)completeIntro("join");
}
$("joinToggle").onclick=()=>{setJoin(!joinOn,true);sfx.click()};
/* Intro 4: decode challenge */
let decodeFound=new Set();
const DECODE_INFO={
 suffix:"1️⃣ <b>-iasis</b> means a <b>condition / presence of something</b>. Good — the ending tells us this is not an operation.",
 roots:"2️⃣ Two roots found: <b>nephr = kidney</b> and <b>lith = stone</b>, joined smoothly by <b>-o-</b>.",
 prefix:"3️⃣ No prefix here — nothing at the start is changing the meaning. Now put the story together!"
};
function applyDecode(){
  const reveal=(id,txt,on)=>{const el=$(id);el.classList.toggle("revealed",on);el.querySelector("small").textContent=on?txt:"?"};
  reveal("dec-nephr","ROOT • kidney",decodeFound.has("roots"));
  reveal("dec-o","joining vowel",decodeFound.has("roots"));
  reveal("dec-lith","ROOT • stone",decodeFound.has("roots"));
  reveal("dec-iasis","condition / presence",decodeFound.has("suffix"));
  document.querySelectorAll("[data-decode-step]").forEach(b=>b.classList.toggle("revealed",decodeFound.has(b.dataset.decodeStep)));
  const unlocked=decodeFound.size>=3;
  document.querySelectorAll("[data-decode-answer]").forEach(b=>{if(!state.intro||!state.intro.has("decode"))b.disabled=!unlocked});
  if(!unlocked)$("decodeFeed").innerHTML="🔎 Reveal all 3 steps to unlock the final question. <b>"+decodeFound.size+" / 3 revealed.</b>";
  else if(!state.intro||!state.intro.has("decode"))$("decodeFeed").innerHTML="✅ Steps complete: condition + kidney + stone. Now choose the meaning!";
  if(!unlocked){$("decodeAnswerFeed").innerHTML="";document.querySelectorAll("[data-decode-answer]").forEach(b=>b.classList.remove("correct","wrong"))}
}
function markDecodeCorrect(celebrate){
  document.querySelectorAll("[data-decode-answer]").forEach(b=>{b.disabled=true;if(b.dataset.decodeAnswer==="correct")b.classList.add("correct")});
  $("decodeFeed").className="infoCallout good";$("decodeFeed").innerHTML="🧩 Story solved: <b>nephr</b> (kidney) + <b>o</b> + <b>lith</b> (stone) + <b>-iasis</b> (condition).";
  $("decodeAnswerFeed").innerHTML="🎉 <span style='color:var(--green)'>Correct!</span> <b>Nephrolithiasis</b> is the condition of having <b>kidney stones</b>. You decoded a 15-letter word from its roots!";
  if(celebrate){sfx.great();confetti(55)}
}
document.querySelectorAll("[data-decode-step]").forEach(b=>b.onclick=()=>{
  decodeFound.add(b.dataset.decodeStep);applyDecode();
  if(decodeFound.size<3)$("decodeFeed").innerHTML=DECODE_INFO[b.dataset.decodeStep]+"<br><b>"+decodeFound.size+" / 3 revealed.</b>";
  else $("decodeFeed").innerHTML=DECODE_INFO[b.dataset.decodeStep]+"<br>✅ Final question unlocked below!";
  sfx.pop();
});
document.querySelectorAll("[data-decode-answer]").forEach(b=>b.onclick=()=>{
  if(b.dataset.decodeAnswer==="correct"){markDecodeCorrect(true);completeIntro("decode")}
  else{b.classList.add("wrong");b.disabled=true;sfx.bad();$("decodeAnswerFeed").innerHTML="😬 Not quite. Follow the roots again: kidney + stone + condition."}
});
applyDecode();

/* ================= QUIZ ARENA ================= */
let quiz=null;
function startQuiz(){
  quiz={qs:pickUniqueMeaning(10).map(d=>({d,opts:getOptions(d,4)})),i:0,score:0,streak:0,best:0,xp:0,locked:false,timer:null,time:15};
  $("quizOverlay").classList.add("open");document.body.style.overflow="hidden";
  $("qResult").style.display="none";$("qPlayArea").style.display="block";showQ();sfx.great();
}
function showQ(){
  const q=quiz.qs[quiz.i];quiz.locked=false;quiz.time=15;
  $("qProgress").textContent="Q "+(quiz.i+1)+"/10";$("qScore").textContent=quiz.score;$("qStreak").textContent=quiz.streak;
  $("qIcon").textContent=q.d.icon;$("qRoot").textContent=q.d.r;$("qFeed").innerHTML="";$("qNext").style.display="none";
  $("qOpts").innerHTML=q.opts.map((o,i)=>`<button class="opt" data-q="${i}">${"ABCD"[i]}. ${o}</button>`).join("");
  $("qOpts").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>answerQ(q.opts[+b.dataset.q],b));
  updTimer();clearInterval(quiz.timer);
  quiz.timer=setInterval(()=>{quiz.time-=.1;if(quiz.time<=0){quiz.time=0;updTimer();answerQ(null,null)}else updTimer()},100);
}
function updTimer(){$("qTimerBar").style.width=(quiz.time/15*100)+"%";$("qTimerText").textContent=Math.ceil(quiz.time)}
function answerQ(choice,btn){
  if(!quiz||quiz.locked)return;quiz.locked=true;clearInterval(quiz.timer);
  const q=quiz.qs[quiz.i],correct=choice===q.d.m;
  $("qOpts").querySelectorAll(".opt").forEach(b=>{b.disabled=true;if(b.textContent.slice(3)===q.d.m)b.classList.add("correct")});
  if(correct){quiz.score++;quiz.streak++;quiz.best=Math.max(quiz.best,quiz.streak);
    let pts=15+(quiz.streak>=3?5:0);quiz.xp+=pts;sfx.good();
    $("qFeed").innerHTML="🎉 <span style='color:var(--green)'>CORRECT! +"+pts+" XP</span> "+q.d.icon+" “"+q.d.hook+"” — as in <b>"+q.d.ex+"</b>.";
    addXP(pts,"🏟️ Quiz: <b>"+q.d.r+"</b>"+(quiz.streak>=3?" (🔥 streak bonus!)":""));
    if(quiz.streak>=3)confetti(25);
  }else{quiz.streak=0;sfx.bad();if(btn)btn.classList.add("wrong");
    $("qFeed").innerHTML=(choice===null?"⏰ <span style='color:var(--red)'>Time up!</span> ":"😬 <span style='color:var(--red)'>Not quite.</span> ")+"<b>"+q.d.r+"</b> means <b>"+q.d.m+"</b>. "+q.d.icon+" Remember: “"+q.d.hook+"”";}
  state.streakBest=Math.max(state.streakBest,quiz.best);checkBadges();save();
  $("qScore").textContent=quiz.score;$("qStreak").textContent=quiz.streak;
  $("qNext").textContent=quiz.i>=9?"See my results 🏆":"Next question ➜";$("qNext").style.display="inline-block";
}
$("qNext").onclick=()=>{quiz.i++;quiz.i>=10?finishQuiz():showQ()};
$("qListen").onclick=e=>{if(quiz)speak("What does the root "+quiz.qs[quiz.i].d.r+" mean?",null,false,e.currentTarget)};
function finishQuiz(){
  $("qPlayArea").style.display="none";$("qResult").style.display="block";
  const s=quiz.score;state.quizBest=Math.max(state.quizBest,s);
  if(s===10)state.quizPerfect=true;
  const trophy=s===10?"👑":s>=8?"🏆":s>=6?"🥈":s>=4?"🥉":"🌱";
  const title=s===10?"PERFECT 10/10 — FLAWLESS!":s>=8?"Outstanding clinician!":s>=6?"Great work — almost there!":s>=4?"Good effort — keep questing!":"Every professor started here!";
  $("qTrophy").textContent=trophy;$("qFinalTitle").textContent=title;
  $("qFinalStats").innerHTML="⭐ Score: <b style='color:var(--txt)'>"+s+"/10</b> • 🔥 Best streak: <b style='color:var(--txt)'>"+quiz.best+"</b> • ✨ XP earned: <b style='color:var(--txt)'>"+quiz.xp+"</b><br>🏅 Your all-time quiz best: <b style='color:var(--txt)'>"+state.quizBest+"/10</b>"+(s<10?"<br>💡 Tip: re-open the cards you missed and picture their memory hooks!":"");
  checkBadges();save();updateHUD();
  if(s>=6){confetti(s===10?160:80);sfx.great()}
}
function closeQuiz(){if(quiz)clearInterval(quiz.timer);$("quizOverlay").classList.remove("open");document.body.style.overflow="";stopSpeak()}
$("qClose").onclick=closeQuiz;$("qDone").onclick=closeQuiz;$("qAgain").onclick=startQuiz;$("btnQuizHero").onclick=startQuiz;
/* ================= MATCH RUSH ================= */
let match=null;
function startMatch(){
  const items=pickUniqueMeaning(6);
  match={items,left:shuffle(items),right:shuffle(items),selL:null,selR:null,matched:new Set(),moves:0,timer:null,start:Date.now(),won:false};
  $("matchOverlay").classList.add("open");document.body.style.overflow="hidden";
  $("mFeed").innerHTML="";$("mResult").innerHTML="";renderMatch();
  clearInterval(match.timer);match.timer=setInterval(()=>{$("mTime").textContent=Math.floor((Date.now()-match.start)/1000)},500);
  $("mTime").textContent="0";sfx.pop();
}
function renderMatch(){
  $("mMoves").textContent=match.moves;$("mPairs").textContent=match.matched.size+"/6";
  $("mLeft").innerHTML=match.left.map(d=>`<button class="mBtn ${match.matched.has(d.id)?"done":""} ${match.selL===d.id?"sel":""}" data-ml="${d.id}" ${match.matched.has(d.id)?"disabled":""} style="--h:${CATS[d.cat].h}">${d.icon} ${d.r}</button>`).join("");
  const rainbow=[262,38,155,322,195,48]; /* shuffled hues so colour never gives the answer away */
  $("mRight").innerHTML=match.right.map((d,i)=>`<button class="mBtn ${match.matched.has(d.id)?"done":""} ${match.selR===d.id?"sel":""}" data-mr="${d.id}" ${match.matched.has(d.id)?"disabled":""} style="--h:${rainbow[i%rainbow.length]}">${d.m}</button>`).join("");
  document.querySelectorAll("[data-ml]").forEach(b=>b.onclick=()=>{match.selL=+b.dataset.ml;sfx.click();renderMatch();tryMatch()});
  document.querySelectorAll("[data-mr]").forEach(b=>b.onclick=()=>{match.selR=+b.dataset.mr;sfx.click();renderMatch();tryMatch()});
}
function tryMatch(){
  if(match.selL===null||match.selR===null)return;
  const L=match.selL,R=match.selR,d=DATA[L];match.moves++;
  if(L===R){match.matched.add(L);match.selL=match.selR=null;sfx.good();
    $("mFeed").innerHTML="💚 <span style='color:var(--green)'>MATCH!</span> "+d.icon+" <b>"+d.r+"</b> = "+d.m+" — “"+d.hook+"”";
    speak(d.r+" means "+d.m+".",L,false,null);addXP(10,"🧩 Match Rush pair: <b>"+d.r+"</b>");renderMatch();
    if(match.matched.size===6&&!match.won){match.won=true;clearInterval(match.timer);state.matchWins++;
      const secs=Math.floor((Date.now()-match.start)/1000);confetti(130);sfx.great();
      addXP(50,"🧩 Match Rush board cleared in "+secs+"s!");
      $("mResult").innerHTML=`<div class="resultBox"><div class="trophy">🧩🏆</div><h2>Board cleared!</h2><p style="color:var(--mut);font-weight:800">⏱️ ${secs} seconds • 🎯 ${match.moves} moves • 🏅 Match wins: ${state.matchWins}</p><button class="btn cyan" data-oc="startMatch()">🔁 Play a new round</button></div>`;
      checkBadges();save();updateHUD()}
  }else{sfx.bad();$("mFeed").innerHTML="💔 Not a pair — <b>"+d.r+"</b> does not mean “"+DATA[R].m+"”. Picture the icon "+d.icon+" and try again!";
    document.querySelectorAll(".mBtn.sel").forEach(b=>b.classList.add("shakeIt"));
    setTimeout(()=>{match.selL=match.selR=null;renderMatch()},480)}
}
function closeMatch(){if(match)clearInterval(match.timer);$("matchOverlay").classList.remove("open");document.body.style.overflow="";stopSpeak()}
$("mClose").onclick=closeMatch;$("mAgain").onclick=startMatch;$("btnMatchHero").onclick=startMatch;
/* global close behaviour */
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o){closeDetail();closeQuiz();closeMatch()}}));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeDetail();closeQuiz();closeMatch()}
  if($("detailOverlay").classList.contains("open")){if(e.key==="ArrowRight")stepDetail(1);if(e.key==="ArrowLeft")stepDetail(-1)}
});
/* ================= INIT ================= */
renderCats();renderGrid();updateHUD();renderIntro(false);checkBadges();save();
setTimeout(()=>{if(state.xp===0)toast("👋 Welcome to <b>Root Quest 60</b>! Tap any glowing card to begin your first mission. 🎧 Do not forget the Listen buttons!")},600);
