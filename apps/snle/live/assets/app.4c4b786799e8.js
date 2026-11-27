
  (()=>{
    const snleStorage=window.SNLEStorage;
    const P=window.SNLE_POSTERS,Q=window.SNLE_QUESTIONS,S=window.SNLE_STATS,L=window.SNLE_LEARNING||{glossary:[]};
    const groups=[...new Set(P.map(x=>x.groupLabel))];
    const CLINICAL_DOSSIERS=(window.GULF_DOSSIERS||[{"id":"CD-001","sourceId":66,"title":"Antepartum & Prenatal Safety","focus":"Prenatal priorities are maternal stability, fetal well-being, gestational-age context, and rapid escalation of warning signs.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":91,"specialty":"Maternity & Women’s Health","links":["Safety First","Fetal Monitoring & Obstetric Emergency","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Prioritize Hypotheses","Generate Solutions","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Pregnant patient"],"processes":["pain assessment / symptom assessment","urinary catheter / CAUTI","antepartum & prenatal","fall / mobility safety","antepartum high-risk pregnancy","labor / fetal monitoring"]},{"id":"CD-002","sourceId":67,"title":"Hypertensive Disorders of Pregnancy","focus":"Severe hypertension, neurologic symptoms, pulmonary edema, hepatic/renal dysfunction, and fetal compromise require urgent escalation.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":94,"specialty":"Maternity & Women’s Health","links":["Safety First","Fetal Monitoring & Obstetric Emergency","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Prioritize Hypotheses","Analyze Cues"],"difficulties":["Medium","Hard"],"settings":["Inpatient/acute care","Labor and delivery","Postpartum unit"],"populations":["Pregnant patient","Pregnant/postpartum patient","Postpartum patient"],"processes":["acute deterioration / prioritization","mood disorder / antidepressant safety","seizure / status epilepticus","pain assessment / symptom assessment","heart failure / pulmonary edema","hypertensive disorders of pregnancy"]},{"id":"CD-003","sourceId":68,"title":"Gestational Diabetes & Pregnancy Glycemia","focus":"Glycemic management protects both mother and fetus; treat hypoglycemia immediately and escalate metabolic decompensation.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":93,"specialty":"Maternity & Women’s Health","links":["Glycemia & Diabetes Acute Safety","Medication Administration Safety Checks","Fetal Monitoring & Obstetric Emergency"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Analyze Cues","Prioritize Hypotheses","Generate Solutions","Evaluate Outcomes"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care","Labor and delivery","Postpartum unit"],"populations":["Pregnant patient","Newborn/neonate","Pregnant/postpartum patient","Postpartum patient"],"processes":["diabetes / glycemic emergency"]},{"id":"CD-004","sourceId":69,"title":"Labor Progress & Intrapartum Nursing","focus":"In labor, monitor maternal-fetal status, progress, pain/coping, membranes, and complications; intervene for deterioration, not arbitrary timelines alone.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":90,"specialty":"Maternity & Women’s Health","links":["Fetal Monitoring & Obstetric Emergency","Assess Before Acting","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium"],"settings":["Labor and delivery","Inpatient/acute care"],"populations":["Pregnant/postpartum patient","Pregnant patient"],"processes":["labor / fetal monitoring","acute deterioration / prioritization","labor progress & intrapartum nursing","pain assessment / symptom assessment"]},{"id":"CD-005","sourceId":70,"title":"Fetal Monitoring Clinical Decisions","focus":"Interpret fetal heart rate by baseline, variability, accelerations, decelerations, contractions, maternal status, and trend; respond to compromise promptly.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":86,"specialty":"Maternity & Women’s Health","links":["Fetal Monitoring & Obstetric Emergency","VEAL-CHOP Fetal Heart Rate Memory Guide","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Analyze Cues","Take Action","Recognize Cues","Generate Solutions"],"difficulties":["Medium","Hard"],"settings":["Inpatient/acute care","Labor and delivery"],"populations":["Pregnant/postpartum patient"],"processes":["labor / fetal monitoring","acute deterioration / prioritization","medication administration / adverse-effect safety","fetal monitoring clinical decisions"]},{"id":"CD-006","sourceId":71,"title":"Obstetric Emergencies","focus":"Obstetric emergencies require simultaneous maternal stabilization, fetal assessment when viable, cause-specific action, and early team activation.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":97,"specialty":"Maternity & Women’s Health","links":["Safety First","ABCDE First-Look & Action Guide","Fetal Monitoring & Obstetric Emergency"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Prioritize Hypotheses"],"difficulties":["Medium","Easy"],"settings":["Labor and delivery","Postpartum unit","Inpatient/acute care"],"populations":["Pregnant/postpartum patient","Pregnant patient","Postpartum patient"],"processes":["labor / fetal monitoring","obstetric emergencies","pain assessment / symptom assessment","postpartum hemorrhage / recovery","acute deterioration / prioritization","antepartum high-risk pregnancy","seizure / status epilepticus"]},{"id":"CD-007","sourceId":72,"title":"Postpartum Care & Hemorrhage","focus":"Postpartum assessment centers on bleeding, uterine tone, vital signs, bladder, pain, infection, thromboembolism, breastfeeding, and warning signs.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":92,"specialty":"Maternity & Women’s Health","links":["Four Ts of Postpartum Hemorrhage","Deterioration & First-Action Coach","Safety First"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Labor and delivery","Postpartum unit","Inpatient/acute care"],"populations":["Pregnant/postpartum patient","Postpartum patient","Infant"],"processes":["postpartum hemorrhage / recovery","coagulation / bleeding disorder","postpartum care & hemorrhage","pain assessment / symptom assessment","communication / escalation / handoff"]},{"id":"CD-008","sourceId":73,"title":"Postpartum Infection & Thromboembolism","focus":"Postpartum fever, focal pain, wound changes, uterine tenderness, unilateral leg symptoms, chest pain, and dyspnea require cause-focused assessment and timely escalation.","domain":"Maternal-Child Nursing","subs":["Maternity nursing"],"sub":"Maternity nursing","items":10,"hyp":87,"specialty":"Maternity & Women’s Health","links":["Deterioration & First-Action Coach","Safety First","Infection Control Selector"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Postpartum unit","Labor and delivery","Inpatient/acute care"],"populations":["Postpartum patient","Pregnant/postpartum patient"],"processes":["postpartum hemorrhage / recovery","pulmonary embolism / venous thromboembolism","acute coronary syndrome / myocardial ischemia","postpartum infection & thromboembolism","fall / mobility safety","sepsis / serious infection"]},{"id":"CD-009","sourceId":74,"title":"Gynecologic Nursing Priorities","focus":"Gynecologic nursing priorities include hemorrhage, infection, pregnancy-related emergencies, cancer warning signs, postoperative complications, and respectful reproductive care.","domain":"Maternal-Child Nursing","subs":["Gynecology"],"sub":"Gynecology","items":10,"hyp":72,"specialty":"Maternity & Women’s Health","links":["Assess Before Acting","Safety First","Professional Practice & Legal Decision Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Recognize Cues","Analyze Cues","Evaluate Outcomes"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care","Perioperative/postoperative care"],"populations":["Adult gynecology patient","Pregnant patient"],"processes":["pain assessment / symptom assessment","gynecologic nursing priorities","pulmonary embolism / venous thromboembolism","oncology emergency / treatment toxicity","acute kidney injury / renal dysfunction"]},{"id":"CD-010","sourceId":75,"title":"Newborn Transition & Resuscitation","focus":"Newborn resuscitation is driven by breathing, heart rate, tone, temperature, and response to ventilation; APGAR documents rather than directs initial resuscitation.","domain":"Maternal-Child Nursing","subs":["Neonatal nursing"],"sub":"Neonatal nursing","items":10,"hyp":90,"specialty":"Neonatal & Paediatric","links":["APGAR Newborn Assessment Guide","Oxygenation, Oxygen Therapy & Suctioning","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Evaluate Outcomes","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Labor and delivery","Newborn nursery/NICU"],"populations":["Newborn/neonate"],"processes":["neonatal resuscitation / transition","acute deterioration / prioritization","newborn transition & resuscitation","respiratory failure / hypoxemia","communication / escalation / handoff"]},{"id":"CD-011","sourceId":76,"title":"Neonatal Jaundice, Hypoglycemia & Sepsis","focus":"Newborn deterioration can be subtle; poor feeding, temperature instability, respiratory change, lethargy, jaundice pattern, and glucose risk require prompt assessment.","domain":"Maternal-Child Nursing","subs":["Neonatal nursing"],"sub":"Neonatal nursing","items":10,"hyp":95,"specialty":"Neonatal & Paediatric","links":["Pediatric & Newborn Rapid Pattern Atlas","Glycemia & Diabetes Acute Safety","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Newborn nursery/NICU","Labor and delivery"],"populations":["Infant","Newborn/neonate"],"processes":["diabetes / glycemic emergency","neonatal jaundice / hypoglycemia / sepsis","acute coronary syndrome / myocardial ischemia","sepsis / serious infection","communication / escalation / handoff"]},{"id":"CD-012","sourceId":77,"title":"Pediatric Respiratory Emergencies","focus":"In children, worsening work of breathing, fatigue, cyanosis, altered mental status, silent chest, or poor air movement signal impending respiratory failure.","domain":"Maternal-Child Nursing","subs":["Pediatric medical"],"sub":"Pediatric medical","items":10,"hyp":94,"specialty":"Neonatal & Paediatric","links":["Pediatric Assessment Triangle","ABCDE First-Look & Action Guide","Oxygenation, Oxygen Therapy & Suctioning"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Analyze Cues","Recognize Cues"],"difficulties":["Medium","Easy"],"settings":["Pediatric acute care"],"populations":["Child","Infant"],"processes":["upper-airway obstruction / stridor","acute coronary syndrome / myocardial ischemia","pediatric respiratory emergency","pneumonia / lower respiratory infection","asthma / bronchospasm","respiratory failure / hypoxemia","communication / escalation / handoff","acute deterioration / prioritization"]},{"id":"CD-013","sourceId":78,"title":"Pediatric GI, Fluids & Dehydration","focus":"Pediatric fluid decisions depend on perfusion, dehydration severity, ongoing losses, weight, electrolytes, and the child's ability to drink safely.","domain":"Maternal-Child Nursing","subs":["Pediatric medical"],"sub":"Pediatric medical","items":10,"hyp":86,"specialty":"Neonatal & Paediatric","links":["Pediatric Assessment Triangle","IV Fluid Types & Selection","Critical Lab & Electrolyte Prioritizer"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action"],"difficulties":["Medium","Easy"],"settings":["Pediatric acute care","Emergency/acute care"],"populations":["Infant","Child"],"processes":["shock / tissue hypoperfusion","pediatric dehydration / GI disorder","electrolyte / acid-base disorder","pain assessment / symptom assessment","bowel obstruction / acute abdomen","acute kidney injury / renal dysfunction","pediatric gi, fluids & dehydration","acute coronary syndrome / myocardial ischemia"]},{"id":"CD-014","sourceId":79,"title":"Pediatric Neurologic & Infectious Emergencies","focus":"Pediatric neurologic emergencies prioritize airway, seizure safety, glucose, perfusion, infection control, and rapid recognition of intracranial or systemic deterioration.","domain":"Maternal-Child Nursing","subs":["Pediatric medical"],"sub":"Pediatric medical","items":10,"hyp":94,"specialty":"Neonatal & Paediatric","links":["Pediatric Assessment Triangle","Glasgow Coma Scale","Infection Control Selector"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action"],"difficulties":["Medium"],"settings":["Pediatric acute care"],"populations":["Child"],"processes":["seizure / status epilepticus","sepsis / serious infection","acute deterioration / prioritization","increased intracranial pressure / neurologic deterioration","shock / tissue hypoperfusion","diabetes / glycemic emergency","respiratory failure / hypoxemia"]},{"id":"CD-015","sourceId":80,"title":"Pediatric Surgical & Congenital Care","focus":"Pediatric surgical care emphasizes airway and perfusion, early recognition of obstruction/infection, age-appropriate pain control, nutrition, and protection of congenital defects.","domain":"Maternal-Child Nursing","subs":["Pediatric surgical"],"sub":"Pediatric surgical","items":10,"hyp":84,"specialty":"Neonatal & Paediatric","links":["Pediatric Assessment Triangle","Post-Op Complication Lab","NG / Enteral Tube Safety"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Analyze Cues","Take Action","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Pediatric acute care","Perioperative/postoperative care"],"populations":["Newborn/neonate","Infant","Child"],"processes":["acute deterioration / prioritization","pediatric surgical & congenital care","acute coronary syndrome / myocardial ischemia","enteral tube / aspiration prevention","bowel obstruction / acute abdomen","coagulation / bleeding disorder"]},{"id":"CD-016","sourceId":81,"title":"Acute Coronary Syndrome & Ischemic Heart Disease","focus":"Treat possible myocardial ischemia as time-sensitive: assess symptoms and ECG promptly, give indicated therapy, and escalate instability without waiting for biomarkers.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":85,"specialty":"Adult Medical-Surgical","links":["ECG & Lethal Rhythm Rapid Reader","ABCDE First-Look & Action Guide","Deterioration & First-Action Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Analyze Cues"],"difficulties":["Medium","Hard","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["acute coronary syndrome / myocardial ischemia","medication administration / adverse-effect safety","acute coronary syndrome & ischemic heart disease","pain assessment / symptom assessment","GI bleeding / hemorrhage","heart failure / pulmonary edema"]},{"id":"CD-017","sourceId":82,"title":"Heart Failure & Circulatory Shock","focus":"In heart failure and shock, assess perfusion and congestion, support oxygenation, treat the cause, and reassess response to fluids, diuretics, vasopressors, or inotropes.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":89,"specialty":"Adult Medical-Surgical","links":["ABCDE First-Look & Action Guide","Deterioration & First-Action Coach","IV Therapy & Fluid Balance"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Recognize Cues","Analyze Cues","Prioritize Hypotheses"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["heart failure / pulmonary edema","shock / tissue hypoperfusion","acute coronary syndrome / myocardial ischemia"]},{"id":"CD-018","sourceId":83,"title":"Dysrhythmias & Cardiac Rhythm Emergencies","focus":"For rhythm emergencies, first determine pulse and stability; pulseless rhythms follow cardiac-arrest algorithms, while unstable rhythms with a pulse require rhythm-specific treatment.","domain":"Adult Nursing","subs":["Critical care nursing"],"sub":"Critical care nursing","items":10,"hyp":96,"specialty":"Adult Medical-Surgical","links":["ECG & Lethal Rhythm Rapid Reader","Deterioration & First-Action Coach","ABCDE First-Look & Action Guide"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Critical/acute care"],"populations":["Adult/unspecified"],"processes":["cardiac arrest / CPR","pain assessment / symptom assessment","dysrhythmia / rhythm emergency","medication administration / adverse-effect safety"]},{"id":"CD-019","sourceId":84,"title":"COPD, Asthma & Pneumonia","focus":"Respiratory disease priorities are oxygenation, ventilation, work of breathing, mental status, infection severity, and response to therapy; individualized oxygen targets matter.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":92,"specialty":"Adult Medical-Surgical","links":["Oxygenation, Oxygen Therapy & Suctioning","ABG Stepwise Interpreter","ABCDE First-Look & Action Guide"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Recognize Cues"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["COPD / chronic airflow limitation","asthma / bronchospasm","sepsis / serious infection","pneumonia / lower respiratory infection","shock / tissue hypoperfusion"]},{"id":"CD-020","sourceId":85,"title":"Pulmonary Embolism, Respiratory Failure & Chest Tubes","focus":"Sudden hypoxemia, chest pain, hemodynamic instability, or chest-tube problems require rapid assessment of oxygenation, ventilation, circulation, and device function.","domain":"Adult Nursing","subs":["Critical care nursing"],"sub":"Critical care nursing","items":10,"hyp":97,"specialty":"Adult Medical-Surgical","links":["Oxygenation, Oxygen Therapy & Suctioning","ABG Stepwise Interpreter","Tubes / Drains Troubleshooter"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Perioperative/postoperative care","Critical/acute care"],"populations":["Adult/unspecified"],"processes":["pulmonary embolism / venous thromboembolism","shock / tissue hypoperfusion","acute deterioration / prioritization","pneumothorax / chest-tube problem","respiratory failure / hypoxemia","pulmonary embolism, respiratory failure & chest tubes"]},{"id":"CD-021","sourceId":87,"title":"Seizures, Intracranial Pressure & Spinal Cord Emergencies","focus":"Neurologic emergencies prioritize airway, seizure safety, cerebral/spinal perfusion, early recognition of herniation or autonomic dysreflexia, and cause-specific treatment.","domain":"Adult Nursing","subs":["Critical care nursing"],"sub":"Critical care nursing","items":10,"hyp":95,"specialty":"Adult Medical-Surgical","links":["Glasgow Coma Scale","AVPU Clinical Decision Guide","ABCDE First-Look & Action Guide"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action"],"difficulties":["Easy","Medium"],"settings":["Critical/acute care"],"populations":["Adult/unspecified"],"processes":["seizure / status epilepticus","increased intracranial pressure / neurologic deterioration","spinal cord injury / neurogenic compromise","respiratory failure / hypoxemia","seizures, intracranial pressure & spinal cord emergencies","sepsis / serious infection","acute deterioration / prioritization"]},{"id":"CD-022","sourceId":88,"title":"Acute Kidney Injury & Chronic Kidney Disease","focus":"Renal nursing decisions focus on perfusion, urine output, potassium, acid-base balance, fluid status, nephrotoxins, dialysis indications, and medication dosing.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":86,"specialty":"Adult Medical-Surgical","links":["Critical Lab & Electrolyte Prioritizer","IV Therapy & Fluid Balance","Core Laboratory Pattern Atlas"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Analyze Cues","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["acute kidney injury / renal dysfunction","heart failure / pulmonary edema","seizure / status epilepticus"]},{"id":"CD-023","sourceId":89,"title":"Diabetes & Endocrine Emergencies","focus":"Endocrine emergencies are pattern-based: treat hypoglycemia immediately, DKA/HHS with fluids and protocolized insulin/electrolytes, and adrenal/thyroid crises with urgent supportive and hormone-specific therapy.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":92,"specialty":"Adult Medical-Surgical","links":["Glycemia & Diabetes Acute Safety","Critical Lab & Electrolyte Prioritizer","Medication Administration Safety Checks"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium","Hard"],"settings":["Inpatient/acute care","Perioperative/postoperative care"],"populations":["Adult/unspecified"],"processes":["diabetes / glycemic emergency","electrolyte / acid-base disorder","heart failure / pulmonary edema","coagulation / bleeding disorder","seizure / status epilepticus"]},{"id":"CD-024","sourceId":90,"title":"GI Bleeding, Liver Disease & Pancreatitis","focus":"GI emergencies prioritize bleeding and perfusion, airway protection, sepsis/peritonitis recognition, hepatic encephalopathy, and pancreatitis complications.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":89,"specialty":"Adult Medical-Surgical","links":["ABCDE First-Look & Action Guide","Blood & Blood Products Safety","Critical Lab & Electrolyte Prioritizer"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Prioritize Hypotheses","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care","Perioperative/postoperative care"],"populations":["Adult/unspecified"],"processes":["GI bleeding / hemorrhage","liver disease / hepatic encephalopathy","acute coronary syndrome / myocardial ischemia","respiratory failure / hypoxemia"]},{"id":"CD-025","sourceId":91,"title":"Sepsis & Serious Infection","focus":"Sepsis is organ dysfunction from infection: recognize deterioration early, obtain cultures when feasible without harmful delay, give timely antimicrobials, support perfusion, and reassess.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":94,"specialty":"Adult Medical-Surgical","links":["ABCDE First-Look & Action Guide","Deterioration & First-Action Coach","Infection Control Selector"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Hard","Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["sepsis / serious infection","shock / tissue hypoperfusion","acute coronary syndrome / myocardial ischemia","neutropenia / immunosuppression","infection prevention / isolation","sepsis & serious infection"]},{"id":"CD-026","sourceId":92,"title":"Hematology, Coagulation & Blood Disorders","focus":"Hematologic priorities are active bleeding, severe anemia/hypoxia, thrombosis, transfusion reactions, neutropenic infection, and disease-specific complications.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":85,"specialty":"Adult Medical-Surgical","links":["Blood & Blood Products Safety","Critical Lab & Electrolyte Prioritizer","Medication Administration Safety Checks"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium","Hard"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["GI bleeding / hemorrhage","coagulation / bleeding disorder","respiratory failure / hypoxemia","blood transfusion / transfusion reaction","neutropenia / immunosuppression","hematology, coagulation & blood disorders"]},{"id":"CD-027","sourceId":95,"title":"Psychosis, Delusions & Hallucinations","focus":"Acknowledge the patient's experience without validating the false belief, assess safety and command content, present reality briefly, and reduce stimulation when needed.","domain":"Adult Nursing","subs":["Mental/psychiatric nursing"],"sub":"Mental/psychiatric nursing","items":10,"hyp":81,"specialty":"Mental Health","links":["Psychiatric Nursing Decision & Safety Guide","Therapeutic Communication Simulator","Safety First"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action"],"difficulties":["Medium","Easy"],"settings":["Mental health/psychiatric care"],"populations":["Adult psychiatric patient"],"processes":["psychosis / hallucinations / delusions","suicide / self-harm risk","psychosis, delusions & hallucinations","medication administration / adverse-effect safety"]},{"id":"CD-028","sourceId":96,"title":"Mood Disorders & Antidepressant Safety","focus":"Mood-disorder care combines suicide assessment, functional support, medication monitoring, sleep/activity stabilization, and recognition of mania or serious adverse effects.","domain":"Adult Nursing","subs":["Mental/psychiatric nursing"],"sub":"Mental/psychiatric nursing","items":10,"hyp":82,"specialty":"Mental Health","links":["Suicide & Psychiatric Safety Algorithm","Therapeutic Communication Simulator","Medication Administration Safety Checks"],"sourceStatus":"new","replaces":null,"posters":["50_Psychiatric Nursing Clinical Safety Guide.png"],"qs":[],"judgments":["Take Action","Evaluate Outcomes","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Mental health/psychiatric care"],"populations":["Adult psychiatric patient"],"processes":["suicide / self-harm risk","mood disorder / antidepressant safety","mood disorders & antidepressant","medication administration / adverse-effect safety"]},{"id":"CD-029","sourceId":97,"title":"Anxiety, Panic, OCD & Trauma","focus":"Match intervention to anxiety level: severe panic needs calm presence and simple directions; longer-term care uses evidence-based therapy, medication, and trauma-informed support.","domain":"Adult Nursing","subs":["Mental/psychiatric nursing"],"sub":"Mental/psychiatric nursing","items":10,"hyp":80,"specialty":"Mental Health","links":["Therapeutic Communication Simulator","Safety First","Medication Administration Safety Checks"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Evaluate Outcomes"],"difficulties":["Medium","Easy"],"settings":["Mental health/psychiatric care"],"populations":["Adult psychiatric patient"],"processes":["anxiety / panic / OCD / trauma response","anxiety, panic, ocd & trauma","legal / scope / documentation","mood disorder / antidepressant safety"]},{"id":"CD-030","sourceId":98,"title":"Substance Use, Withdrawal & Behavioral Safety","focus":"Withdrawal can be medically dangerous; treat alcohol/benzodiazepine withdrawal urgently, opioid overdose with ventilation and naloxone, and use nonjudgmental evidence-based care.","domain":"Adult Nursing","subs":["Mental/psychiatric nursing"],"sub":"Mental/psychiatric nursing","items":10,"hyp":79,"specialty":"Mental Health","links":["ABCDE First-Look & Action Guide","Medication Administration Safety Checks","Therapeutic Communication Simulator"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Mental health/psychiatric care"],"populations":["Adult psychiatric patient"],"processes":["seizure / status epilepticus","psychosis / hallucinations / delusions","mood disorder / antidepressant safety","substance withdrawal / intoxication","substance use, withdrawal & behavioral","communication / escalation / handoff"]},{"id":"CD-031","sourceId":100,"title":"Communicable Disease & Outbreak Control","focus":"Outbreak control requires rapid case recognition, appropriate isolation, reporting, contact management, vaccination/prophylaxis when indicated, and clear risk communication.","domain":"Adult Nursing","subs":["Community nursing"],"sub":"Community nursing","items":10,"hyp":72,"specialty":"Community & Population Health","links":["Infection Control Selector","Isolation Precautions","WHO 5 Moments for Hand Hygiene"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Evaluate Outcomes"],"difficulties":["Medium","Easy"],"settings":["Community/public health"],"populations":["Community/population"],"processes":["communicable disease / outbreak control","communicable disease & outbreak control"]},{"id":"CD-032","sourceId":101,"title":"Maternal-Child & School Community Health","focus":"Community maternal-child care emphasizes prenatal access, safe infancy, development, immunization, school health, injury prevention, and timely referral for warning signs.","domain":"Adult Nursing","subs":["Community nursing"],"sub":"Community nursing","items":10,"hyp":73,"specialty":"Community & Population Health","links":["Safety First","Teach-Back","Research & EBP Quick Filter"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Evaluate Outcomes","Take Action","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Community/public health"],"populations":["Newborn/neonate","Infant","Child","Adolescent","Community/population"],"processes":["acute deterioration / prioritization","asthma / bronchospasm","maternal-child & school community health","communicable disease / outbreak control","research / evidence-based practice"]},{"id":"CD-033","sourceId":102,"title":"Disaster, Environmental & Occupational Health","focus":"Disaster and environmental nursing prioritizes scene safety, triage, exposure control, population risk, continuity of essential services, and clear incident-command communication.","domain":"Adult Nursing","subs":["Community nursing"],"sub":"Community nursing","items":10,"hyp":74,"specialty":"Community & Population Health","links":["RACE & PASS Fire Safety","Safety First","Leadership & Management Decision Matrix"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Prioritize Hypotheses","Analyze Cues"],"difficulties":["Medium","Easy"],"settings":["Community/public health"],"populations":["Community/population"],"processes":["fall / mobility safety","acute deterioration / prioritization","disaster, environmental & occupational health","stroke / acute neurologic deficit","medication administration / adverse-effect safety","asthma / bronchospasm","communicable disease / outbreak control"]},{"id":"CD-034","sourceId":104,"title":"Chemotherapy, Immunotherapy & Radiation Safety","focus":"Cancer treatment safety depends on agent-specific toxicity, infection and bleeding risk, extravasation prevention, immune-related adverse events, radiation precautions, and symptom escalation.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":86,"specialty":"Oncology & Supportive Care","links":["Medication Administration Safety Checks","Infection Control Selector","Blood & Blood Products Safety"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Evaluate Outcomes","Generate Solutions"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["oncology emergency / treatment toxicity","coagulation / bleeding disorder","respiratory failure / hypoxemia","neutropenia / immunosuppression","heart failure / pulmonary edema","medication administration / adverse-effect safety"]},{"id":"CD-035","sourceId":105,"title":"Cancer Symptom Control, Palliative & Survivorship Care","focus":"Cancer nursing balances disease-directed therapy with symptom control, function, patient goals, advance care planning, treatment complications, and survivorship needs.","domain":"Adult Nursing","subs":["Medical nursing"],"sub":"Medical nursing","items":10,"hyp":85,"specialty":"Oncology & Supportive Care","links":["OPQRST Pain Assessment","Teach-Back","Professional Practice & Legal Decision Coach"],"sourceStatus":"new","replaces":null,"posters":[],"qs":[],"judgments":["Take Action","Generate Solutions","Evaluate Outcomes"],"difficulties":["Medium","Easy"],"settings":["Inpatient/acute care"],"populations":["Adult/unspecified"],"processes":["oncology emergency / treatment toxicity","spinal cord injury / neurogenic compromise","cancer symptom control, palliative & survivorship care"]}]);
    const DOSSIER_AUDIT={"externalTotal":137,"canonicalCounterparts":65,"accepted":35,"enrichCore":10,"needsValidation":4,"holdDuplicate":23,"bankMerged":0,"validationIds":[86,99,103,109],"enrichIds":[93,94,106,107,108,110,111,112,113,114],"holdIds":[115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137],"acceptedSourceIds":[66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,87,88,89,90,91,92,95,96,97,98,100,101,102,104,105]};;

    const initial={answered:0,correct:0,streak:0,lastStudyDate:'',wrongIds:[],flaggedIds:[],studiedPosterIds:[],resetSessions:0,domains:{}};
    let progress=initial;
    try{progress={...initial,...JSON.parse(snleStorage.getItem('snle-react-interact-progress-v1')||'{}')}}catch(e){}
    let state={view:'home',lang:'en',arabicAssist:snleStorage.getItem('snle-arabic-assist')==='1',colorMode:window.GULF_EDITION?'green':(snleStorage.getItem('snle-color-mode')||'green'),search:'',group:'all',hypFilter:'all',catalogView:snleStorage.getItem('snle-catalog-view')||(window.GULF_EDITION?'compact':'cards'),catalogSort:snleStorage.getItem('snle-catalog-sort')||'hyp-desc',sidebarCollapsed:snleStorage.getItem('snle-sidebar-collapsed')==='1',poster:null,tab:'learn',zoom:1,focus:false,teachingScale:Number(snleStorage.getItem('snle-teaching-scale')||1.12),annotationTool:'edit',annotationColor:'#85144b',coachSession:[],coachIndex:0,coachSelected:'',coachRevealed:false,coachCorrect:0,coachHint:false,learningLayer:'',lensFocus:'',lensOption:'',session:[],sessionTitle:'',index:0,selected:'',revealed:false,sessionCorrect:0,mockLength:20,mockMode:'tutor',examSimulation:false,examSection:1,examSectionEndsAt:0,examBreak:false,examBreakEndsAt:0,examAnswers:[],sessionAnswers:[],glossaryQuery:'',glossaryCategory:(window.GULF_GLOSS||{}).cat||'Question anatomy',glossaryTerm:(window.GULF_GLOSS||{}).term||'Stem',guideTab:'glance',guideDomainInfo:null,glossaryInfo:false,committeeInfo:false,learningJourneyInfo:false,courseLibraryInfo:false,resetTimingInfo:false,glossaryListWidth:Number(snleStorage.getItem('snle-glossary-list-width')||390),glossaryAnnotTool:'off',glossaryAnnotColor:snleStorage.getItem('snle-glossary-annot-color')||'#4272ff',glossaryAnnotMin:snleStorage.getItem('snle-glossary-annot-min')!=='0',resetContext:'before-mock',resetExercise:'premock',resetStep:0,resetChecks:{},resetDone:false,dossierSearch:'',dossierDomain:'all',dossierSpecialty:'all',dossierHyp:'all',dossierOpen:null,dossierTab:'overview',dossierPracticeIndex:0,dossierPracticeSelected:'',dossierPracticeRevealed:false,dossierPracticeMode:'all'};
    const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const shuffle=(a)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
    const accuracy=()=>progress.answered?Math.round(progress.correct/progress.answered*100):0;
    const tone=(n)=>n>=80?'Strong':n>=65?'Building':'Start here';
    const themeAccent=(c)=>{const k=String(c||'').toLowerCase();if(state.colorMode!=='blue')return c;return ({'#2d5652':'#356fb5','#97d3c0':'#a9ccef','#0a6b4c':'#1f5f9f','#0f6268':'#2469a6','#087f7a':'#2f72b8'}[k]||c)};
    const save=()=>snleStorage.setItem('snle-react-interact-progress-v1',JSON.stringify(progress));
    const dossierInitial={answers:{}};let dossierProgress=dossierInitial;try{dossierProgress={...dossierInitial,...JSON.parse(snleStorage.getItem('snle-clinical-dossier-progress-v1')||'{}'),answers:{...(JSON.parse(snleStorage.getItem('snle-clinical-dossier-progress-v1')||'{}').answers||{})}}}catch(e){dossierProgress={answers:{}}}const saveDossierProgress=()=>snleStorage.setItem('snle-clinical-dossier-progress-v1',JSON.stringify(dossierProgress));
    let annotations={};try{annotations=JSON.parse(snleStorage.getItem('snle-poster-annotations-v2')||'{}')}catch(e){}
    const saveAnnotations=()=>snleStorage.setItem('snle-poster-annotations-v2',JSON.stringify(annotations));
    const posterMarks=(id)=>annotations[id]||(annotations[id]={paths:[],notes:[]});
    let pageAnnotations={};
    try{pageAnnotations=JSON.parse(snleStorage.getItem('snle-page-annotations-v1')||'{}')||{}}catch(e){pageAnnotations={}}
    try{const legacy=JSON.parse(snleStorage.getItem('snle-glossary-annotations-v1')||'null');if(legacy&&!pageAnnotations.glossary)pageAnnotations.glossary={paths:legacy.paths||[],texts:legacy.texts||[]}}catch(e){}
    const annotationContextKey=()=>state.view==='practice'?(state.session.length?(state.examSimulation?'mock-exam':'practice-session'):'practice'):state.view;
    const pageMarks=()=>{const k=annotationContextKey();return pageAnnotations[k]||(pageAnnotations[k]={paths:[],texts:[]})};
    const savePageAnnotations=()=>snleStorage.setItem('snle-page-annotations-v1',JSON.stringify(pageAnnotations));
    const GLOSSARY_ANNOT_COLORS=['#4272ff','#2bbac5','#ffd84d','#85144b'];
    const mock=(n)=>{const R=window.GULF_RATIOS||[['Nursing Fundamentals',.2],['Adult Nursing',.4],['Maternal-Child Nursing',.3],['Nursing Management and Leadership',.1]];const take=R.map(([d,r])=>[d,Math.floor(n*r),n*r-Math.floor(n*r)]);let left=n-take.reduce((a,t)=>a+t[1],0);if(window.GULF_RATIOS){[...take].sort((a,b)=>b[2]-a[2]).forEach(t=>{if(left>0){t[1]++;left--}})}return shuffle(take.flatMap(([d,k])=>shuffle(Q.filter(q=>q.domain===d)).slice(0,window.GULF_RATIOS?k:Math.round(n*(R.find(x=>x[0]===d)||[0,0])[1]))))};
    const titles={home:'Today',tools:'React & Interact',dossier:'Clinical Dossier',glossary:'Glossary',labs:'Interactive Labs',guide:'SNLE Guide',practice:'Practice Hub',reset:'Reset & Recharge',progress:'My Progress'};
    const nav=[['home','home','Today','Overview'],['guide','guide','SNLE Guide','Learn'],['glossary','book','Glossary','Learn'],['labs','bolt','Interactive Labs','Learn'],['tools','tools','React & Interact','Learn'],['dossier','book','Clinical Dossier','Learn'],['practice','target','Practice Hub','Practice'],['reset','reset','Reset & Recharge','Wellbeing'],['progress','chart','My Progress','You']];
    const app=document.getElementById('app');
    const snleViews=new Set(['home','guide','glossary','labs','tools','dossier','practice','reset','progress']);
    const routeView=()=>location.hash.replace(/^#\/?/,'').split(/[?\/]/)[0];
    if(snleViews.has(routeView()))state.view=routeView();
    let snleLastView=null,snleRenderTicket=0;
    function syncSnleRoute(){
      if(snleLastView!==state.view){
        document.body.classList.remove('snle-focus-active');
        if(routeView()!==state.view)history[snleLastView===null?'replaceState':'pushState'](null,'','#'+state.view);
        snleLastView=state.view;
      }
    }
    function restoreSnleRoute(){
      const next=routeView();
      if(snleViews.has(next)&&state.view!==next){
        clearInterval(resetTimer);clearInterval(window.__examClock);
        state.view=next;state.poster=null;state.dossierOpen=null;state.session=[];state.examSimulation=false;
        state.guideDomainInfo=null;state.glossaryInfo=false;state.committeeInfo=false;
        state.learningJourneyInfo=false;state.courseLibraryInfo=false;state.resetTimingInfo=false;
        render();scrollTo(0,0);
      }
    }
    addEventListener('hashchange',restoreSnleRoute);addEventListener('popstate',restoreSnleRoute);

    const iconPaths={
      heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      home:'<path d="m3 11.5 9-7.5 9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
      tools:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M17 14v6m-3-3h6"/>',
      book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z"/>',
      guide:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/><circle cx="12" cy="12" r=".8"/>',
      target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/><path d="M18.5 5.5 21 3"/>',
      reset:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/><path d="M8 14c2.8 0 5-2.2 5-5-2.8 0-5 2.2-5 5Z"/>',
      chart:'<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
      bolt:'<path d="m13 2-8 12h6l-1 8 8-12h-6Z"/>',
      coach:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2"/>',
      sprint:'<path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.3-4.5 2.3.9-5-3.6-3.5 5-.7Z"/>',
      repair:'<path d="M15.5 6.5a4.5 4.5 0 0 0-6 6L4 18l2 2 5.5-5.5a4.5 4.5 0 0 0 6-6l-3 3-2-2Z"/>',
      mock:'<path d="M5 4h14v16H5Z"/><path d="M8 8h8M8 12h8M8 16h5"/>'
    };
    function icon(name){
      return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(iconPaths[name]||iconPaths.tools)+'</svg>';
    }
    function navMarkup(){
      let group="";
      return nav.map(function(item){
        const id=item[0],ic=item[1],label=item[2],section=item[3];
        let prefix="";
        if(section!==group){
          group=section;
          prefix='<div class="sidebar-section-label">'+esc(section)+'</div>';
        }
        return prefix+'<button data-nav="'+id+'" title="'+esc(label)+'" class="'+(state.view===id?'active':'')+'"><span class="nav-icon">'+icon(ic)+'</span><span class="nav-label">'+esc(label)+'</span></button>';
      }).join("");
    }

    function shell(content){
      return `<div class="app-shell ${state.sidebarCollapsed?'sidebar-collapsed':''} ${state.colorMode==='blue'?'theme-blue':'theme-green'} ${state.arabicAssist?'arabic-assist-on':''}" dir="ltr"><aside class="sidebar"><div class="brand-lockup"><img class="snle-crest" src="/assets/crest.svg" width="43" height="43" alt=""><div class="brand-copy"><strong>SNLE</strong><span>Healthcare Crown Academy</span></div></div><button class="sidebar-collapse" data-sidebar-toggle aria-label="${state.sidebarCollapsed?'Expand sidebar':'Collapse sidebar 75%'}" title="${state.sidebarCollapsed?'Expand sidebar':'Collapse sidebar 75%'}">${state.sidebarCollapsed?'›':'‹'}</button><nav>${navMarkup()}</nav></aside><main class="main-canvas"><header class="topbar"><div class="topbar-context"><span class="eyebrow">SNLE · DECISION TRAINING</span><strong>${titles[state.view]}</strong></div><div class="topbar-actions"><button class="page-edit-trigger ${state.glossaryAnnotMin?'':'is-open'}" data-glossary-annot-toggle title="${state.glossaryAnnotMin?'Open page annotation tools':'Minimize page annotation tools'}"><span>✎</span><b>Edit</b></button><button class="language-button arabic-assist-toggle ${state.arabicAssist?'is-active':''}" data-lang aria-pressed="${state.arabicAssist?'true':'false'}" title="${state.arabicAssist?'Turn off Arabic hover translation':'Turn on Arabic hover translation'}"><span>◎</span><span>العربية</span><i aria-hidden="true"></i></button><button class="color-mode-button ${state.colorMode==='blue'?'is-blue':''}" data-color-mode title="${state.colorMode==='blue'?'Return to green clinical palette':'Switch to blue clinical palette'}"><span class="mode-dot"></span><span>${state.colorMode==='blue'?'Green':'Blue'}</span></button></div></header>${content}</main><nav class="snle-mobile-tabs" aria-label="SNLE mobile navigation">${[['home','Today'],['tools','Tools'],['practice','Practice'],['progress','Progress']].map(([id,label])=>`<button data-nav="${id}" aria-current="${state.view===id?'page':'false'}">${label}</button>`).join('')}</nav>${glossaryAnnotatorMarkup()}${state.poster?modal(state.poster):''}${state.glossaryInfo?glossaryInfoModal():''}${state.committeeInfo?committeeInfoModal():''}${state.learningJourneyInfo?learningJourneyInfoModal():''}${state.courseLibraryInfo?courseLibraryModal():''}${state.resetTimingInfo?resetTimingModal():''}${state.guideDomainInfo?guideDomainModal():''}${state.dossierOpen?clinicalDossierModal():''}</div>`
    }


    function dossierBand(h){return h>=90?'Critical':h>=80?'High':h>=70?'Core':'Foundation'}
    function dossierTone(h){return h>=90?'#85144b':h>=80?'#c6932d':h>=70?'#287c64':'#5d7384'}
    function dossierAnswerKey(d,q){return d.id+':'+q.g}
    function dossierStats(d){
      let attempted=0,correct=0,attempts=0,missed=0;
      d.qs.forEach(function(q){const a=dossierProgress.answers[dossierAnswerKey(d,q)];if(a){attempted++;attempts+=Number(a.attempts||1);if(a.correct)correct++;else missed++}});
      return {attempted:attempted,correct:correct,missed:missed,attempts:attempts,pct:attempted?Math.round(correct/attempted*100):0,total:d.qs.length};
    }
    function dossierOverallStats(){let attempted=0,correct=0,total=0;CLINICAL_DOSSIERS.forEach(function(d){const s=dossierStats(d);attempted+=s.attempted;correct+=s.correct;total+=s.total});return {attempted:attempted,correct:correct,total:total,pct:attempted?Math.round(correct/attempted*100):0}}
    function dossierPracticeSet(d){
      if(state.dossierPracticeMode==='missed'){
        const missed=d.qs.filter(function(q){const a=dossierProgress.answers[dossierAnswerKey(d,q)];return a&&a.everMissed});
        if(missed.length)return missed;
      }
      return d.qs;
    }
    function dossierDerivedTeaching(d){
      const sorted=[...d.qs].sort(function(a,b){return Number(b.h||0)-Number(a.h||0)});
      const recognize=sorted.slice(0,5);
      const groups={};d.qs.forEach(function(q){const k=q.c||'Clinical judgment';(groups[k]||(groups[k]=[])).push(q)});
      const judgment=Object.entries(groups).sort(function(a,b){return b[1].length-a[1].length});
      return {recognize:recognize,judgment:judgment};
    }
    function dossierRecommendations(rows){
      const wrong=(rows||[]).filter(function(r){return !r.correct});if(!wrong.length)return [];
      return CLINICAL_DOSSIERS.map(function(d){let score=0,reasons=[];wrong.forEach(function(r){const q=r.q||{};if(q.domain&&q.domain===d.domain){score+=1;reasons.push(q.domain)};if(q.toolName&&d.links.includes(q.toolName)){score+=5;reasons.push(q.toolName)};const sd=String(q.subdomain||'').toLowerCase(),ds=String(d.sub||'').toLowerCase();if(sd&&ds&&(sd.includes(ds)||ds.includes(sd))){score+=3;reasons.push(q.subdomain)}});return {d:d,score:score,reasons:[...new Set(reasons)].slice(0,3)}}).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score||b.d.hyp-a.d.hyp}).slice(0,3);
    }
    function clinicalDossierPage(){
  const q=String(state.dossierSearch||'').trim().toLowerCase();
  const specialties=[...new Set(CLINICAL_DOSSIERS.map(x=>x.specialty))].sort();
  const domains=[...new Set(CLINICAL_DOSSIERS.map(x=>x.domain))].sort();
  const hypOk=(h)=>state.dossierHyp==='all'||(state.dossierHyp==='critical'&&h>=90)||(state.dossierHyp==='high'&&h>=80&&h<90)||(state.dossierHyp==='core'&&h>=70&&h<80)||(state.dossierHyp==='foundation'&&h<70);
  const items=CLINICAL_DOSSIERS.filter(function(d){return (state.dossierDomain==='all'||d.domain===state.dossierDomain)&&(state.dossierSpecialty==='all'||d.specialty===state.dossierSpecialty)&&hypOk(d.hyp)&&(!q||(d.title+' '+d.focus+' '+d.domain+' '+d.sub+' '+d.specialty+' '+d.links.join(' ')+' '+d.processes.join(' ')).toLowerCase().includes(q))}).sort((a,b)=>window.GULF_ORDER?window.GULF_ORDER(a.hyp,b.hyp,a.title,b.title):b.hyp-a.hyp||a.title.localeCompare(b.title));
  const weak=CLINICAL_DOSSIERS.map(function(d){return {d:d,s:dossierStats(d)}}).filter(function(x){return x.s.attempted>=2&&x.s.pct<80}).sort(function(a,b){return a.s.pct-b.s.pct||b.s.missed-a.s.missed}).slice(0,4);
  return `<div class="page-content dossier-page dossier-phase3"><section class="dossier-hero dossier-hero-simple"><div><span class="eyebrow">PHASE 3 · SPECIALTY APPLICATION + PRACTICE</span><h1>Clinical Dossier</h1><p>Apply the 67 reusable reasoning tools inside specialty and condition-focused scenarios. Explore the curated dossier library, open a dossier, and practice its cases in a larger and easier-to-read learning popup.</p></div></section>
  ${weak.length?`<section class="dossier-repair-strip"><div><span class="eyebrow">YOUR REPAIR QUEUE</span><h2>Return to the weakest specialty applications</h2></div><div class="dossier-repair-items">${weak.map(function(x){return `<button data-dossier-open="${x.d.id}" data-dossier-start-practice="missed"><b>${esc(x.d.title)}</b><span>${x.s.pct}% · ${x.s.missed} missed</span></button>`}).join('')}</div></section>`:''}
  <section class="dossier-toolbar"><input id="dossier-search" value="${esc(state.dossierSearch)}" placeholder="Search dossier, process, specialty, or linked tool…"><select id="dossier-specialty"><option value="all">All specialties</option>${specialties.map(x=>`<option value="${esc(x)}" ${state.dossierSpecialty===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="dossier-domain"><option value="all">All SCFHS domains</option>${domains.map(x=>`<option value="${esc(x)}" ${state.dossierDomain===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="dossier-hyp"><option value="all">All HYP ranges</option><option value="critical" ${state.dossierHyp==='critical'?'selected':''}>Critical · 90–100</option><option value="high" ${state.dossierHyp==='high'?'selected':''}>High · 80–89</option><option value="core" ${state.dossierHyp==='core'?'selected':''}>Core · 70–79</option><option value="foundation" ${state.dossierHyp==='foundation'?'selected':''}>Foundation · &lt;70</option></select></section>
  <div class="dossier-section-head"><div><span class="eyebrow">SPECIALTY APPLICATION LIBRARY</span><h2>${items.length} dossiers shown</h2></div><small>Source-derived case content · v19 Core Tool architecture · independent practice tracking</small></div>
  <section class="dossier-grid">${items.length?items.map(function(d){const s=dossierStats(d);return `<article class="dossier-card" style="--dossier-tone:${dossierTone(d.hyp)}"><div class="dossier-card-top"><span class="dossier-code">${d.id}</span><span class="dossier-badge review">${esc(d.specialty)}</span><span class="dossier-badge import">SOURCE T${d.sourceId}</span></div><h3>${esc(d.title)}</h3><p class="dossier-focus">${esc(d.focus)}</p><div class="dossier-meta"><span>${esc(d.domain)}</span><span>${esc(d.sub)}</span><span>${d.qs.length} cases</span><span>HYP ${d.hyp} · ${dossierBand(d.hyp)}</span></div><div class="dossier-progress-mini"><div><b>${s.attempted}/${s.total}</b><span>attempted</span></div><div class="dossier-mini-meter"><i style="width:${s.attempted?s.pct:0}%"></i></div><strong>${s.attempted?s.pct+'%':'Not started'}</strong></div><div class="dossier-links"><b>Core-tool connections:</b> ${d.links.map(esc).join(' · ')}</div><div class="dossier-card-actions"><button class="dossier-open" data-dossier-open="${d.id}">Open dossier</button><button class="dossier-practice-go" data-dossier-open="${d.id}" data-dossier-start-practice="all">${s.attempted?'Continue practice':'Start practice'}</button></div></article>`}).join(''):'<div class="dossier-empty"><strong>No dossiers match these filters.</strong><br><small>Clear or broaden the filters to continue.</small></div>'}</section></div>`;
}
    function dossierChipList(values,empty){return values&&values.length?values.map(x=>`<span>${esc(x)}</span>`).join(''):`<em>${esc(empty||'Not specified in source')}</em>`}
    function dossierPracticeHtml(d){
      const set=dossierPracticeSet(d),idx=Math.max(0,Math.min(set.length-1,state.dossierPracticeIndex||0)),q=set[idx]||d.qs[0];if(!q)return '<div class="dossier-empty">No cases available.</div>';
      const stored=dossierProgress.answers[dossierAnswerKey(d,q)],sel=state.dossierPracticeSelected===''?(stored&&!state.dossierPracticeRevealed?String(stored.selected):''):String(state.dossierPracticeSelected),revealed=!!state.dossierPracticeRevealed;
      const letters=['A','B','C','D'];
      return `<section class="dossier-practice-shell"><header class="dossier-practice-head"><div><span class="eyebrow">SOURCE PRACTICE · ISOLATED FROM MAIN BANK</span><h3>${state.dossierPracticeMode==='missed'?'Missed-case repair':'Dossier practice'} · Case ${idx+1} of ${set.length}</h3></div><div class="dossier-practice-pills"><span>HYP ${q.h??'—'}</span><span>${esc(q.d||'')}</span><span>${esc(q.c||'')}</span></div></header><div class="dossier-practice-progress"><i style="width:${((idx+1)/set.length)*100}%"></i></div><p class="dossier-practice-stem">${esc(q.stem||'')}</p><div class="dossier-practice-options">${(q.o||[]).map(function(opt,i){const selected=sel===String(i),correct=revealed&&i===Number(q.a),wrong=revealed&&selected&&i!==Number(q.a);return `<button data-dossier-option="${i}" class="${selected?'selected ':''}${correct?'correct ':''}${wrong?'wrong ':''}" ${revealed?'disabled':''}><b>${letters[i]||String(i+1)}</b><span>${esc(opt)}</span>${revealed&&correct?'<em>✓</em>':revealed&&wrong?'<em>×</em>':''}</button>`}).join('')}</div>${revealed?`<section class="dossier-feedback ${Number(sel)===Number(q.a)?'correct':'repair'}"><div class="dossier-feedback-title"><strong>${Number(sel)===Number(q.a)?'Correct — keep the decision rule':'Repair this decision'}</strong><span>Best answer: ${letters[Number(q.a)]}</span></div><p><b>Rationale</b>${esc(q.r||'Source rationale not supplied.')}</p>${q.p?`<p><b>Clinical pearl</b>${esc(q.p)}</p>`:''}${q.t?`<p><b>Trap to avoid</b>${esc(q.t)}</p>`:''}<div class="dossier-feedback-meta"><span>${esc(q.pr||'Process not specified')}</span><span>${esc(q.st||'Setting not specified')}</span><span>${esc(q.pop||'Population not specified')}</span></div>${Number(sel)!==Number(q.a)?`<div class="dossier-repair-tools"><b>Repair with Core Tools</b>${d.links.map(x=>`<button data-dossier-core="${esc(x)}">${esc(x)} ↗</button>`).join('')}</div>`:''}</section>`:''}<footer class="dossier-practice-actions"><div><button class="secondary-button" data-dossier-practice-mode="all">All cases</button><button class="secondary-button" data-dossier-practice-mode="missed">Retry missed</button></div><div>${!revealed?`<button class="primary-button" data-dossier-check ${sel===''?'disabled':''}>Check answer</button>`:`<button class="primary-button" data-dossier-next>${idx+1>=set.length?'Restart set':'Next case →'}</button>`}</div></footer></section>`;
    }
    function clinicalDossierModal(){
  const d=CLINICAL_DOSSIERS.find(x=>x.id===state.dossierOpen);if(!d)return '';
  const tabs=[['overview','Overview'],['recognize','Recognize'],['decide','Decide & Act'],['practice','Practice'],['map','Connections']];
  const tab=tabs.some(x=>x[0]===state.dossierTab)?state.dossierTab:'overview',teach=dossierDerivedTeaching(d),s=dossierStats(d);
  let body='';
  if(tab==='overview')body=`<section class="dossier-summary-row"><article><b>SCFHS domain</b><span>${esc(d.domain)}</span></article><article><b>Subdomain</b><span>${esc(d.sub||'Not specified')}</span></article><article><b>Specialty</b><span>${esc(d.specialty)}</span></article><article><b>HYP</b><span>${d.hyp} · ${dossierBand(d.hyp)}</span></article><article><b>Your practice</b><span>${s.attempted?s.pct+'% · '+s.attempted+'/'+s.total:'Not started'}</span></article></section><section class="dossier-detail-grid"><article class="dossier-panel"><span class="eyebrow">SOURCE-DERIVED</span><h3>Clinical focus</h3><p>${esc(d.focus)}</p><div class="dossier-overview-cta"><button class="primary-button" data-dossier-start-practice="all">${s.attempted?'Continue Dossier Practice':'Start Dossier Practice'} →</button></div></article><article class="dossier-panel"><h3>Source metadata footprint</h3><div class="dossier-source-groups"><b>Clinical judgment</b><div>${dossierChipList(d.judgments)}</div><b>Difficulty</b><div>${dossierChipList(d.difficulties)}</div><b>Population</b><div>${dossierChipList(d.populations)}</div><b>Setting</b><div>${dossierChipList(d.settings)}</div></div></article></section>`;
  if(tab==='recognize')body=`<section class="dossier-map-intro"><span class="eyebrow">RECOGNIZE · SOURCE-DERIVED CASE SIGNALS</span><h3>Learn the situations that trigger this dossier.</h3><p>These recognition cards are taken from the highest-HYP migrated cases and their source rationales; no new clinical facts are being added here.</p></section><section class="dossier-recognize-grid">${teach.recognize.map(function(q,i){return `<article><div><b>${String(i+1).padStart(2,'0')}</b><span>HYP ${q.h??'—'} · ${esc(q.c||'Clinical judgment')}</span></div><p>${esc(q.stem||'')}</p><small><strong>Why it matters</strong>${esc(q.r||'No source rationale supplied.')}</small></article>`}).join('')}</section>`;
  if(tab==='decide')body=`<section class="dossier-map-intro"><span class="eyebrow">DECIDE → ACT</span><h3>See how the source cases distribute across clinical-judgment functions.</h3><p>The actions below summarize the source case rationales by judgment function; use the linked Core Tools for the reusable decision framework.</p></section><section class="dossier-judgment-grid">${teach.judgment.map(function(entry){const name=entry[0],qs=entry[1],avg=Math.round(qs.reduce((n,q)=>n+Number(q.h||0),0)/qs.length);return `<article><header><b>${esc(name)}</b><span>${qs.length} case${qs.length===1?'':'s'} · HYP avg ${avg}</span></header>${qs.slice(0,3).map(function(q){return `<p><strong>${esc(q.pr||'Clinical process')}</strong>${esc(q.r||'No source rationale supplied.')}</p>`}).join('')}</article>`}).join('')}</section>`;
  if(tab==='practice')body=dossierPracticeHtml(d);
  if(tab==='map')body=`<section class="dossier-map-intro"><span class="eyebrow">CORE TOOL CONNECTIONS</span><h3>Dossier = clinical context. Core Tool = reusable reasoning rule.</h3><p>Open any connected Core Tool to rebuild the framework, then return to this dossier and transfer the rule to a different specialty case.</p></section><section class="dossier-panel"><h3>Connected Core Tools</h3><div class="dossier-core-buttons">${d.links.map(x=>`<button data-dossier-core="${esc(x)}">${esc(x)} <span>↗</span></button>`).join('')}</div></section><section class="dossier-panel"><h3>Related dossiers in ${esc(d.specialty)}</h3><div class="dossier-related-buttons">${CLINICAL_DOSSIERS.filter(x=>x.id!==d.id&&x.specialty===d.specialty).slice(0,6).map(x=>`<button data-dossier-related="${x.id}"><b>${esc(x.title)}</b><span>HYP ${x.hyp}</span></button>`).join('')}</div></section><section class="dossier-panel"><h3>Processes represented in source cases</h3><div class="dossier-connection-list">${dossierChipList(d.processes,'No process metadata supplied')}</div></section>`;
  return `<div class="dossier-overlay" data-dossier-overlay><section class="dossier-dialog dossier-dialog-v21 dossier-dialog-v22" role="dialog" aria-modal="true" aria-label="${esc(d.title)}"><header class="dossier-dialog-head"><button class="dossier-close" data-dossier-close aria-label="Close">×</button><span class="dossier-dialog-kicker">${d.id} · SOURCE T${d.sourceId} · PHASE 3 LEARNING LAYER</span><h2><span class="marker-highlight">${esc(d.title)}</span></h2><p>${esc(d.focus)}</p></header><nav class="dossier-tabs">${tabs.map(x=>`<button data-dossier-tab="${x[0]}" class="${tab===x[0]?'active':''}">${x[1]}</button>`).join('')}</nav><div class="dossier-dialog-body">${body}</div></section></div>`;
}

    function home(){return `<div class="page-content home-view"><section class="hero-grid"><div class="hero-copy"><div class="home-intro-row"><button class="home-info-chip committee-chip" data-committee-info><span class="chip-icon">✦</span><span><b>Scientific Committee</b><small>Welcome & introductions</small></span></button><button class="home-info-chip journey-chip" data-learning-journey-info><span class="chip-icon">↗</span><span><b>Learning Journey</b><small>How to get the most from this course</small></span></button><button class="home-info-chip library-chip" data-course-library-info><span class="chip-icon">▦</span><span><b>Course Library</b><small>All tools + both question banks</small></span></button></div><h1>Train the decision.<br><em>Master the reasoning.</em></h1><p>Move from the decisive clue to the safest action, then test the same reasoning in a new clinical context.</p><div class="hero-actions"><button class="primary-button" data-start="quick" data-count="10">▶ Start 10-question check</button><button class="secondary-button" data-nav="tools">◎ Explore upgraded tools</button></div><div class="trust-row"><span>✓ 1,297 standardized items</span><span>✓ 137 topic families</span><span>✓ Local progress saved</span></div></div><div class="decision-pulse-card"><div class="pulse-header"><div><span class="eyebrow">YOUR DECISION PULSE</span><h2>${progress.answered?'Keep your reasoning warm':'Your baseline starts here'}</h2></div><span>⌁</span></div><div class="pulse-orbit" style="--score:${Math.max(accuracy(),4)*3.6}deg"><div><strong>${accuracy()}%</strong><span>accuracy</span></div></div><div class="metric-strip"><div><strong>${progress.answered}</strong><span>answered</span></div><div><strong>${progress.wrongIds.length}</strong><span>to repair</span></div><div><strong>${progress.studiedPosterIds.length}</strong><span>tools studied</span></div></div><button class="text-button" data-nav="progress">Open readiness view →</button></div></section><section class="content-snapshot"><div><span class="eyebrow">CONTENT SNAPSHOT</span><h2>Built for high-yield clinical judgment</h2><p>Every question retains its SCFHS domain, clinical-judgment function, HYP score, difficulty, evidence status, rationale, Clinical Pearl, and Trap Hunter. The bank is deliberately balanced across answer keys and spans the complete four-domain blueprint.</p></div><div class="snapshot-stats"><div><strong>${S.questions.toLocaleString()}</strong><span>standardized items</span></div><div><strong>${S.highYieldCount}</strong><span>HYP ≥ 80 items</span></div><div><strong>${S.canonicalPosterPages}</strong><span>canonical tools</span></div><div><strong>${S.toolTopics}</strong><span>topic families</span></div><div><strong>${S.difficultyDistribution.Medium}</strong><span>medium difficulty</span></div><div><strong>4</strong><span>SCFHS domains</span></div></div></section></div>`}

    function tools(){
      const query=state.search.toLowerCase();
      const hypMatch=(score)=>state.hypFilter==='all'||(state.hypFilter==='critical'&&score>=90)||(state.hypFilter==='high'&&score>=80&&score<90)||(state.hypFilter==='core'&&score>=70&&score<80)||(state.hypFilter==='foundation'&&score<70);
      let items=P.filter(p=>(state.group==='all'||p.groupLabel===state.group)&&hypMatch(Number(p.meanHyp||0))&&(!query||(p.title+' '+p.arabic+' '+p.job).toLowerCase().includes(query)));
      if(state.catalogSort==='hyp-desc')items=[...items].sort((a,b)=>window.GULF_ORDER?window.GULF_ORDER(a.meanHyp,b.meanHyp,a.title,b.title):Number(b.meanHyp||0)-Number(a.meanHyp||0)||a.title.localeCompare(b.title));
      else if(state.catalogSort==='hyp-asc')items=[...items].sort((a,b)=>Number(a.meanHyp||0)-Number(b.meanHyp||0)||a.title.localeCompare(b.title));
      else if(state.catalogSort==='az')items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
      const hypOptions=[['all','All HYP ranges'],['critical','Critical · 90–100'],['high','High · 80–89'],['core','Core · 70–79'],['foundation','Foundation · <70']];
      const sortOptions=[['hyp-desc','HYP highest → lowest'],['hyp-asc','HYP lowest → highest'],['az','Title A → Z'],['default','Canonical order']];
      const compact=state.catalogView==='compact';
      const bandClass=(score)=>score>=90?'hyp5':score>=80?'hyp4':score>=70?'hyp3':'hyp2';
      return `<div class="page-content tools-view ${compact?'catalog-is-compact':''}"><section class="tools-intro"><div><span class="eyebrow">REACT & INTERACT · UPGRADED</span><h1>Clinical decision tools</h1><p>Poster recognition, decision boundaries, coached cases, and framework switching—inside one learning popup.</p></div><div class="upgrade-badge"><span>⇄</span><div><strong>67 canonical posters</strong><span>1 older duplicate retired</span></div></div></section><div class="catalog-toolbar"><label class="search-box"><span>⌕</span><input id="tool-search" value="${esc(state.search)}" placeholder="Search frameworks, labs, or decisions"><button data-clear-search>×</button></label><select class="group-select" id="group-select"><option value="all">All learning groups</option>${groups.map(g=>`<option ${state.group===g?'selected':''}>${esc(g)}</option>`).join('')}</select><select class="hyp-select" id="hyp-select" aria-label="Filter by HYP range">${hypOptions.map(([v,label])=>`<option value="${v}" ${state.hypFilter===v?'selected':''}>${label}</option>`).join('')}</select><select class="catalog-sort" id="catalog-sort" aria-label="Sort clinical decision tools">${sortOptions.map(([v,label])=>`<option value="${v}" ${state.catalogSort===v?'selected':''}>${label}</option>`).join('')}</select><div class="catalog-view-toggle" role="group" aria-label="Catalog view"><button data-catalog-view="cards" class="${compact?'':'active'}" aria-pressed="${!compact}">▦ Cards</button><button data-catalog-view="compact" class="${compact?'active':''}" aria-pressed="${compact}">☷ Compact</button></div></div><div class="catalog-meta"><strong>${items.length}</strong> learning tools · Poster + practice + boundaries <span>·</span> <b>${hypOptions.find(x=>x[0]===state.hypFilter)?.[1]||'All HYP ranges'}</b> <span>·</span> <b>${sortOptions.find(x=>x[0]===state.catalogSort)?.[1]||'Canonical order'}</b></div><section class="tool-grid ${compact?'compact-grid':''}">${items.map(p=>`<button class="tool-card ${compact?'compact':''} tool-${bandClass(Number(p.meanHyp||0))}" data-poster="${p.id}"><div class="tool-thumb"><img loading="lazy" decoding="async" src="${p.dataUri}" alt="" loading="lazy"><span class="tool-group">${esc(p.groupLabel)}</span><span class="tool-open">↗</span></div><div class="tool-card-body"><h3>${state.lang==='ar'?esc(p.arabic):esc(p.title)}</h3><p>${esc(p.job)}</p><div class="tool-card-footer"><span>▤ ${p.questionCount} questions</span>${hypSig(p.meanHyp)}</div></div></button>`).join('')}</section></div>`
    }

    function mockBreakProfile(n){if(n===200)return {at:100,seconds:1800,label:"30-minute scheduled break",official:true};if(n>=100)return {at:Math.floor(n/2),seconds:300,label:"5-minute midpoint reset",official:false};if(n>=50)return {at:Math.floor(n/2),seconds:180,label:"3-minute midpoint reset",official:false};return {at:Math.floor(n/2),seconds:90,label:"90-second midpoint reset",official:false}}
    function setup(){
      const mins=Math.round(state.mockLength*1.2),bp=mockBreakProfile(state.mockLength),halfMins=Math.round(mins/2);
      return `<div class="page-content practice-view mock-only-hub"><section class="practice-heading"><div><span class="eyebrow">PRACTICE HUB · 1,297 ITEMS</span><h1>SNLE mock exam</h1><p>Train the same blueprint in either coached Tutor mode or a timed Exam Simulation. Choose the length, then commit to one mode.</p></div><div class="bank-seal"><span>✓</span><span><strong>Complete bank included</strong>1,297 standardized items · offline ready</span></div></section><section class="mock-command-center"><div class="mock-command-copy"><span class="eyebrow">${window.GULF_BP_EYEBROW||'BLUEPRINT · 20 / 40 / 30 / 10'}</span><h2>One exam card. Two ways to train.</h2><p>${window.GULF_BP_TEXT||'20% Nursing Fundamentals · 40% Adult Nursing · 30% Maternal–Child Nursing · 10% Management & Leadership.'}</p><div class="mock-mode-switch mock-mode-switch-v15" role="group" aria-label="Mock exam mode"><button class="${state.mockMode==='tutor'?'active':''}" data-mock-mode="tutor"><span class="mode-orb">01</span><span><b>Tutor Mock</b><small>Answer → immediate rationale → Clinical Pearl → next item.</small></span></button><button class="${state.mockMode==='exam'?'active':''}" data-mock-mode="exam"><span class="mode-orb">02</span><span><b>Exam Simulation</b><small>Timed · answers hidden · midpoint break reminder.</small></span></button></div><div class="mock-evidence-note ${state.mockMode==='exam'?'exam':''}">${state.mockMode==='exam'?`<b>Timing:</b> ${state.mockLength===200?`100 questions / 120 min → official 30-min break → 100 questions / 120 min.`:`${bp.at} questions / ${halfMins} min → ${bp.label} → remaining ${state.mockLength-bp.at} questions / ${halfMins} min.`} Correct answers stay hidden until completion.`:`<b>Tutor mode:</b> feedback stays immediate. For long study sessions, use short recovery pauses when attention or physical tension drops rather than passively rereading.`}</div></div><aside class="mock-launch-panel"><div class="mock-length-display"><small>SELECT LENGTH</small><strong>${state.mockLength}</strong><span>questions</span></div><label>Question count<select class="mock-select mock-select-v15" id="mock-length" aria-label="Mock exam length">${(window.GULF_MOCKS||[20,50,100,200]).map(n=>`<option ${state.mockLength===n?'selected':''} value="${n}">${n} questions</option>`).join('')}</select></label><div class="mock-launch-meta"><span>≈ ${mins} min total question time</span><span>Midpoint: Q${bp.at}</span><span>${bp.official?'SCFHS scheduled break':'Study-only reset reminder'}</span></div><button class="primary-button mock-launch" data-start="${state.mockMode==='exam'?'mock-exam':'mock'}" data-count="${state.mockLength}">${state.mockMode==='exam'?'Start timed simulation':'Begin tutor mock'} →</button><button class="secondary-button" data-nav="reset">Reset & Recharge first</button></aside></section></div>`}

        function formatClock(ms){const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(r).padStart(2,'0')}
    function tutorBreakScreen(){const n=state.session.length,at=Math.floor(n/2),sec=n>=100?300:n>=50?180:90,label=sec===300?'5-minute study reset':sec===180?'3-minute study reset':'90-second study reset';return `<div class="page-content practice-view"><section class="exam-break-card tutor-midpoint"><span class="eyebrow">TUTOR MOCK · MIDPOINT REMINDER</span><div class="break-icon">↻</div><h1>Pause before the second half.</h1><p>You have completed ${at} of ${n} coached questions. This is a study-only recovery prompt—not an official SNLE break rule.</p><div class="break-clock"><strong>${formatClock(sec*1000)}</strong><span>${label}</span></div><div class="exam-break-actions"><button class="secondary-button" data-nav="reset">Open Reset & Recharge</button><button class="primary-button" data-tutor-break-continue>Continue to question ${at+1} →</button></div><small>Stand or change posture, relax shoulders/hands, look away from the screen, then return to one defined question. Short breaks can support fatigue and attention management; they are not a guaranteed performance boost.</small></section></div>`}
    function examBreakScreen(){const bp=mockBreakProfile(state.session.length),left=state.examBreakEndsAt?formatClock(state.examBreakEndsAt-Date.now()):formatClock(bp.seconds*1000);return `<div class="page-content practice-view"><section class="exam-break-card"><span class="eyebrow">EXAM SIMULATION · MIDPOINT RESET</span><div class="break-icon">Ⅱ</div><h1>${bp.official?'Section 1 complete.':'Midpoint reached.'}</h1><p>You have reached question ${bp.at} of ${state.session.length}. ${bp.official?'This matches the scheduled midpoint break in the official 200-question SNLE structure.':'This is an optional study-simulation reset, not an official SNLE break rule.'}</p><div class="break-clock"><strong data-break-time>${left}</strong><span>${state.examBreakEndsAt?'break timer running':bp.label}</span></div><div class="exam-break-actions">${!state.examBreakEndsAt?`<button class="secondary-button" data-break-start>Start ${bp.label}</button>`:''}<button class="primary-button" data-break-continue>Continue to question ${bp.at+1} →</button></div><small>Stand or change posture, relax shoulders/hands, look away from the screen, hydrate if needed, then return. Correct answers remain hidden during Exam Simulation.</small></section></div>`}
    function examQuestion(){if(state.examBreak)return examBreakScreen();const q=state.session[state.index];if(!q)return result();const pct=(state.index/state.session.length)*100;const timeLabel='Section '+state.examSection+' time';return `<div class="page-content practice-view exam-simulation-view"><section class="question-shell"><div class="question-topline exam-topline"><div><span class="eyebrow">SNLE EXAM SIMULATION · ANSWERS HIDDEN</span><strong>Question ${state.index+1} of ${state.session.length}</strong></div><div class="exam-status"><span>${timeLabel}</span><strong data-exam-time>${formatClock(state.examSectionEndsAt-Date.now())}</strong><button class="flag-button ${progress.flaggedIds.includes(q.id)?'flagged':''}" data-flag="${q.id}">⚑ ${progress.flaggedIds.includes(q.id)?'Flagged':'Flag'}</button></div></div><div class="question-progress" style="height:5px;border-radius:9px;background:linear-gradient(90deg,var(--teal) ${pct}%,#dce3df 0)"></div><div class="question-meta"><span>${esc(q.domain)}</span><span>HYP ${q.hyp} · ${esc(q.hypBand)}</span><span>${esc(q.difficulty)}</span><span>${esc(q.judgment)}</span><span>${q.id}</span></div><article class="question-card exam-question-card"><span class="question-tool">▰ Timed blueprint simulation</span><h1>${esc(q.stem)}</h1><div class="option-list">${q.options.map(o=>`<button class="option-button ${state.selected===o.label?'selected':''}" data-answer="${o.label}"><span class="option-label">${o.label}</span><span>${esc(o.text)}</span><b></b></button>`).join('')}</div></article><div class="question-actions exam-actions"><span>Choose one best answer. Feedback is intentionally suppressed until the simulation ends.</span><button class="primary-button" data-exam-submit ${state.selected?'':'disabled'}>${state.index+1===state.session.length?'Submit final answer':'Lock answer & continue'} →</button></div></section></div>`}

    function question(){const q=state.session[state.index];if(!q)return result();const correct=state.selected===q.key;return `<div class="page-content practice-view"><section class="question-shell"><div class="question-topline"><div><span class="eyebrow">${esc(state.sessionTitle)}</span><strong>Question ${state.index+1} of ${state.session.length}</strong></div><button class="flag-button ${progress.flaggedIds.includes(q.id)?'flagged':''}" data-flag="${q.id}">⚑ ${progress.flaggedIds.includes(q.id)?'Flagged':'Flag'}</button></div><div class="question-progress" style="height:5px;border-radius:9px;background:linear-gradient(90deg,var(--teal) ${((state.index+(state.revealed?1:0))/state.session.length)*100}%,#dce3df 0)"></div><div class="question-meta"><span>${esc(q.domain)}</span><span>HYP ${q.hyp} · ${esc(q.hypBand)}</span><span>${esc(q.difficulty)}</span><span>${esc(q.judgment)}</span><span>${q.id}</span></div><article class="question-card"><span class="question-tool">⚕ ${esc(q.toolName)}</span><h1>${esc(q.stem)}</h1><div class="option-list">${q.options.map(o=>{const sel=state.selected===o.label,ok=state.revealed&&o.label===q.key,bad=state.revealed&&sel&&o.label!==q.key;return `<button class="option-button ${sel?'selected':''} ${ok?'correct':''} ${bad?'wrong':''}" data-answer="${o.label}" ${state.revealed?'disabled':''}><span class="option-label">${o.label}</span><span>${esc(o.text)}</span><b>${ok?'✓':bad?'×':''}</b></button>`}).join('')}</div></article>${!state.revealed?`<div class="question-actions"><span>Select one best answer, then commit.</span><button class="primary-button" data-check ${state.selected?'':'disabled'}>Check answer →</button></div>`:`<section class="debrief ${correct?'debrief-correct':'debrief-wrong'}"><div class="debrief-result"><span>${correct?'✓':'×'}</span><div><span>${correct?'Correct decision':'Not yet—repair the reasoning'}</span><strong>${q.key}. ${esc(q.answerText)}</strong></div></div><div class="debrief-grid"><article><span>WHY IT WINS</span><p>${esc(q.rationale)}</p></article><article><span>CLINICAL PEARL</span><p>${esc(q.pearl)}</p></article><article><span>TRAP HUNTER</span><p>${esc(q.trap)}</p></article>${!correct&&state.selected?`<article><span>YOUR DISTRACTOR</span><p>${esc(q.misconceptions[state.selected]||'This option does not best match the decisive clue, timing, or safety priority.')}</p></article>`:''}</div><div class="debrief-footer"><span>✓ ${esc(q.evidence)} · ${esc(q.quality)} · ${esc(q.actionRequired)}</span><button class="primary-button" data-next>${state.index+1===state.session.length?'See results':'Next question'} →</button></div></section>`}</section></div>`}

    function reportRows(){
      const source=(state.sessionAnswers&&state.sessionAnswers.length)?state.sessionAnswers:(state.examAnswers||[]);
      const answerMap=new Map(source.map(function(x){return [x.id,x]}));
      return (state.session||[]).map(function(q){
        const a=answerMap.get(q.id)||{};
        return {q:q,answer:a.answer||"",correct:Boolean(a.correct)};
      });
    }
    function groupPerformance(rows,keyFn){
      const map=new Map();
      rows.forEach(function(r){
        const key=String(keyFn(r.q)||"Unspecified");
        const cur=map.get(key)||{name:key,total:0,correct:0,misses:0,hypSum:0};
        cur.total++;cur.correct+=r.correct?1:0;cur.misses+=r.correct?0:1;cur.hypSum+=Number(r.q.hyp||0);map.set(key,cur);
      });
      return Array.from(map.values()).map(function(x){
        x.pct=x.total?Math.round(x.correct/x.total*100):0;
        x.avgHyp=x.total?Math.round(x.hypSum/x.total):0;
        x.priority=(100-x.pct)*(1+x.misses*.18)*(0.72+x.avgHyp/180);
        return x;
      });
    }
    function reportBand(p){return p>=85?["Transfer-ready","#20795f","#e7f5ef"]:p>=75?["Consolidating","#2f6fa9","#eaf3fb"]:p>=65?["Building","#b87a00","#fff4d7"]:["Priority repair","#85144b","#faeaf1"]}
    function reportBar(p){return Math.max(3,Math.min(100,Number(p)||0))}
    function result(){
      const total=Math.max(1,state.session.length),pct=Math.round(state.sessionCorrect/total*100),rows=reportRows(),band=reportBand(pct);
      const domains=groupPerformance(rows,function(q){return q.domain}).sort(function(a,b){return a.pct-b.pct||b.misses-a.misses});
      const subdomains=groupPerformance(rows,function(q){return q.subdomain}).filter(function(x){return x.total>0}).sort(function(a,b){return b.priority-a.priority}).slice(0,6);
      const tools=groupPerformance(rows,function(q){return q.toolName}).filter(function(x){return x.total>0}).sort(function(a,b){return b.priority-a.priority}).slice(0,6);
      const judgments=groupPerformance(rows,function(q){return q.judgment}).sort(function(a,b){return a.pct-b.pct||b.total-a.total}).slice(0,5);
      const wrong=rows.filter(function(r){return !r.correct}).sort(function(a,b){return Number(b.q.hyp||0)-Number(a.q.hyp||0)}).slice(0,6);
       const dossierRecs=dossierRecommendations(rows);
      const strongest=domains.slice().sort(function(a,b){return b.pct-a.pct||b.total-a.total})[0],weakest=domains[0],weakSub=subdomains[0],weakTool=tools[0];
      const blueprint={"Nursing Fundamentals":20,"Adult Nursing":40,"Maternal–Child Nursing":30,"Nursing Management and Leadership":10};
      const mode=state.examSimulation?"Timed Exam Simulation":"Tutor Mock";
      const nextAdvice=pct<65
        ?"Reduce new-content volume for the next two sessions. Repair the two highest-weighted gaps first, using retrieval before rereading."
        :pct<80
          ?"Keep mixed practice, but allocate the first half of the next session to the weakest domain/subdomain and the second half to interleaved transfer questions."
          :"Maintain mixed retrieval and deliberately target the remaining high-HYP misses; avoid replacing retrieval with passive review.";
      return `<div class="page-content result-report-view"><section class="session-report" id="session-performance-report">
        <header class="report-hero">
          <div class="report-score-orbit" style="--score:${pct*3.6}deg"><div><strong>${pct}%</strong><span>${state.sessionCorrect} / ${state.session.length}</span></div></div>
          <div class="report-hero-copy"><span class="eyebrow">SNLE PRACTICE DIAGNOSTIC · SESSION COMPLETE</span><h1>${band[0]}</h1><p>${esc(state.sessionTitle)} · ${mode}</p><div class="report-hero-pills"><span>${state.session.length} items</span><span>${state.session.length-state.sessionCorrect} to repair</span><span>${progress.flaggedIds.filter(function(id){return state.session.some(function(q){return q.id===id})}).length} flagged</span></div></div>
          <aside class="report-boundary"><b>Important boundary</b><span>This is a practice-performance diagnostic, not an official SNLE score prediction. SCFHS reports the licensure result on a 200–800 scale with 500 as the passing score.</span></aside>
        </header>

        <section class="report-section">
          <div class="report-section-head"><div><span class="eyebrow">01 · BLUEPRINT PERFORMANCE</span><h2>Where performance is strong — and where it leaks</h2></div><span class="report-chip">${esc(strongest?strongest.name:"Session")} strongest</span></div>
          <div class="report-domain-grid">${["Adult Nursing","Maternal–Child Nursing","Nursing Fundamentals","Nursing Management and Leadership"].map(function(name){
            const d=domains.find(function(x){return x.name===name})||{name:name,total:0,correct:0,pct:0,misses:0};
            return `<article class="${d.pct<65&&d.total?'risk':''}"><div><b>${esc(name)}</b><span>${blueprint[name]||""}% blueprint</span></div><strong>${d.total?d.pct+"%":"—"}</strong><div class="report-meter"><i style="width:${d.total?reportBar(d.pct):0}%"></i></div><small>${d.correct}/${d.total} correct · ${d.misses} miss${d.misses===1?"":"es"}</small></article>`;
          }).join("")}</div>
        </section>

        <section class="report-section">
          <div class="report-section-head"><div><span class="eyebrow">02 · WEAKNESS MAP</span><h2>Priority repair targets</h2></div><span class="report-chip warning">HYP-weighted</span></div>
          <div class="report-three-col">
            <article><h3>Subdomains</h3>${subdomains.length?subdomains.map(function(x,i){return `<div class="report-rank"><b>${String(i+1).padStart(2,"0")}</b><span><strong>${esc(x.name)}</strong><small>${x.correct}/${x.total} correct · HYP avg ${x.avgHyp}</small></span><em>${x.pct}%</em></div>`}).join(""):'<p>No subdomain data in this session.</p>'}</article>
            <article><h3>Aligned tools</h3>${tools.length?tools.map(function(x,i){return `<div class="report-rank"><b>${String(i+1).padStart(2,"0")}</b><span><strong>${esc(x.name)}</strong><small>${x.misses} miss${x.misses===1?"":"es"} · HYP avg ${x.avgHyp}</small></span><em>${x.pct}%</em></div>`}).join(""):'<p>No tool data in this session.</p>'}</article>
            <article><h3>Clinical-judgment functions</h3>${judgments.length?judgments.map(function(x,i){return `<div class="report-rank"><b>${String(i+1).padStart(2,"0")}</b><span><strong>${esc(x.name)}</strong><small>${x.correct}/${x.total} correct</small></span><em>${x.pct}%</em></div>`}).join(""):'<p>No judgment-function data in this session.</p>'}</article>
          </div>
        </section>

        <section class="report-section">
          <div class="report-section-head"><div><span class="eyebrow">03 · HIGH-YIELD MISSES</span><h2>Repair the errors most likely to transfer</h2></div><span class="report-chip">${wrong.length} reviewed</span></div>
          <div class="report-miss-grid">${wrong.length?wrong.map(function(r){
            const selected=r.q.options.find(function(o){return o.label===r.answer});
            return `<article><div class="report-miss-top"><span>HYP ${r.q.hyp}</span><b>${esc(r.q.toolName)}</b></div><p>${esc(r.q.stem)}</p><div class="report-answer-compare"><span><b>Your answer</b>${esc(r.answer?r.answer+". "+(selected?selected.text:""):"No answer")}</span><span class="correct"><b>Best answer</b>${esc(r.q.key+". "+r.q.answerText)}</span></div><small><b>Repair rule:</b> ${esc(r.q.pearl||r.q.rationale)}</small></article>`;
          }).join(""):'<article class="report-no-misses"><b>No incorrect items in this session.</b><span>Use mixed transfer questions next rather than repeating identical items.</span></article>'}</div>
        </section>

        ${dossierRecs.length?`<section class="report-section dossier-report-recs">
          <div class="report-section-head"><div><span class="eyebrow">04 · CLINICAL DOSSIER TRANSFER</span><h2>Apply weak reasoning inside a specialty context</h2></div><span class="report-chip">Optional transfer practice</span></div>
          <div class="dossier-report-grid">${dossierRecs.map(function(x){return `<article><span class="eyebrow">${esc(x.d.specialty)}</span><h3>${esc(x.d.title)}</h3><p>${esc(x.d.focus)}</p><small>Suggested because of: ${esc(x.reasons.join(' · '))}</small><button data-report-dossier="${x.d.id}">Open Recognize pathway →</button></article>`}).join('')}</div>
          <div class="dossier-safety-note"><span>i</span><div><b>Recommendation boundary:</b> this matches your missed domain/tool signals to a related Clinical Dossier for transfer practice. It does not add dossier items to the scored session or change the official-style mock bank.</div></div>
        </section>`:''}

        <section class="report-section report-advice">
          <div class="report-section-head"><div><span class="eyebrow">05 · EXPERT ACTION PLAN</span><h2>What to do next</h2></div><span class="report-chip good">Evidence-informed</span></div>
          <div class="report-advice-grid">
            <article class="priority"><span>NOW</span><h3>Repair before adding volume</h3><p>${esc(nextAdvice)}</p><b>${weakest?esc(weakest.name):"Weakest domain"}${weakSub?" → "+esc(weakSub.name):""}</b></article>
            <article><span>WITHIN 24 HOURS</span><h3>Retrieve the rule first</h3><p>Without looking at the rationale, write the decisive clue, the decision rule, and the safest first action for the top missed tool${weakTool?" ("+esc(weakTool.name)+")":""}. Then answer 5–10 new questions.</p></article>
            <article><span>48–72 HOURS</span><h3>Interleave the weak area</h3><p>Mix the repaired topic with a stronger domain so you must choose the correct framework rather than recognize a repeated pattern.</p></article>
            <article><span>DAY 7</span><h3>Spaced re-test</h3><p>Re-test flagged/high-HYP misses after a delay. If the same reasoning error recurs, return to the aligned clinical tool and rebuild the boundary before more questions.</p></article>
          </div>
          <div class="report-evidence-strip">
            <div><strong>Retrieval / distributed practice</strong><span>A 2024 systematic review found significant benefit in 43 of 63 health-professions experiments.</span></div>
            <div><strong>Test-enhanced learning</strong><span>A health-professions review reported 21/23 retention outcomes and all 7 transfer outcomes favoring testing/retrieval.</span></div>
            <div><strong>Spaced repetition</strong><span>A 2026 medical-education meta-analysis of 21,415 learners found an overall SMD 0.78 favoring spaced repetition.</span></div>
          </div>
          <div class="report-source-links"><a href="https://pubmed.ncbi.nlm.nih.gov/37615780/" target="_blank" rel="noreferrer">Trumble et al. 2024 ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/29390949/" target="_blank" rel="noreferrer">Green et al. 2018 ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/41601436/" target="_blank" rel="noreferrer">Maye & Hurley 2026 ↗</a><a href="https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20.pdf" target="_blank" rel="noreferrer">SCFHS Applicant Guide 2025 ↗</a></div>
        </section>

        <section class="report-section report-footer-section">
          <div><span class="eyebrow">REPORT GENERATED IN SNLE EVIDENCE LAB</span><p>Use this report to direct the next study cycle. Do not convert the practice percentage into an estimated official SNLE scaled score.</p></div>
          <div class="report-actions"><button class="secondary-button" data-retry>↻ Retry shuffled</button><button class="secondary-button" data-hub>▦ Practice Hub</button><button class="primary-button" data-save-report>⇩ Save as PDF report</button></div>
        </section>
      </section></div>`;
    }

    function progressView(){return `<div class="page-content progress-view"><section class="progress-heading"><div><span class="eyebrow">LOCAL LEARNING RECORD</span><h1>Your readiness view</h1><p>Your data remains on this device. Use it to decide the next practice action.</p></div><button class="primary-button" data-nav="practice">▶ Start practice</button></section><section class="progress-kpis"><article><span>⌁</span><span>Accuracy</span><strong>${accuracy()}%</strong><small>${tone(accuracy())}</small></article><article><span>▤</span><span>Questions answered</span><strong>${progress.answered}</strong><small>of 1,297</small></article><article><span>▦</span><span>Tools studied</span><strong>${progress.studiedPosterIds.length}</strong><small>of 67</small></article><article><span>↻</span><span>Items to repair</span><strong>${progress.wrongIds.length}</strong><button data-start="mistakes" data-count="${progress.wrongIds.length}" ${progress.wrongIds.length?'':'disabled'}>Fix now →</button></article></section><section class="domain-panel"><div class="section-heading"><div><span class="eyebrow">SCFHS DOMAINS</span><h2>Accuracy by domain</h2></div></div><div class="domain-list">${Object.entries(S.domainDistribution).map(([d,total])=>{const sc=progress.domains[d]||{answered:0,correct:0},v=sc.answered?Math.round(sc.correct/sc.answered*100):0;return `<div class="domain-row"><span class="domain-dot" style="background:var(--teal)"></span><div><strong>${esc(d)}</strong><small>${sc.answered} answered · ${total} available</small></div><div style="height:7px;border-radius:9px;background:linear-gradient(90deg,var(--teal) ${v}%,#e7ebe8 0)"></div><b>${v}%</b></div>`}).join('')}</div></section><section class="integrity-note"><span>✓</span><div><strong>What this score means</strong><p>This is a study-progress indicator, not a psychometrically validated pass prediction. Evidence and quality labels remain visible at item level.</p></div></section></div>`}


    /* Restored learning modules from the v0.21.23 handover. */
    let resetTimer=null;
    const STEP_PHOTOS={"posture": "/assets/media/4d76f109291e8365.jpg", "breath": "/assets/media/9bdc4fa7690f6bc3.jpg", "pacing": "/assets/media/8dfd86522ac91b93.jpg", "strategy": "/assets/media/41ae3fd97470d8fc.jpg", "stand": "/assets/media/2d19ff98d13d7a52.jpg", "turn": "/assets/media/2bca2a88c823a193.jpg"};
    const RITUAL_VISUALS=[
      ["Posture","posture","Feet flat or supported, shoulders relaxed, neck easy.","A stable sitting position reduces body tension and gives a clean starting signal."],
      ["Breath","breath","Two comfortable slow breaths without forcing depth.","Slowing the first moments starts the block with steadiness rather than hurry."],
      ["Pacing","pacing","Choose a simple timing rule before the first item.","A pacing rule stops one difficult question from stealing time from the rest."],
      ["Strategy","strategy","Read the lead-in first so you know what you are searching for.","Reading the task first filters the options faster."]
    ];
    const MOVEMENT_VISUALS=[
      ["Drop the shoulders away from the ears","posture","Let the shoulders fall away from the ears.","A deliberate shoulder drop signals the body to release tension."],
      ["Relax both hands and unclench the jaw","breath","Open the fingers softly and let the jaw unclench.","Tension often hides in the hands and jaw during long blocks."],
      ["Stand or safely change posture","stand","Safely stand or shift position to interrupt sitting.","Changing posture refreshes circulation and attention."],
      ["Gently turn the head and upper body within comfort","turn","Turn only within comfort, never into pain.","A small rotation breaks fixed posture without becoming a workout."],
      ["Look at a distant object and take two easy breaths","strategy","Look far away and take two easy breaths.","Distance focus plus two calm breaths makes the next question feel like a restart."]
    ];
    function stepPhotoHtml(key,title){
      const src=STEP_PHOTOS[key];
      if(!src)return "";
      return '<figure class="reset-step-media"><img class="reset-step-photo" loading="lazy" src="'+src+'" alt="'+esc(title)+'"></figure>';
    }
    const RESET_EXERCISES=[
      {id:"breathing",icon:"□",title:"Animated Box Breathing",duration:"64 sec · 4 cycles",accent:"#2d5652",contexts:["before-mock","racing-thoughts","after-error","breathing-reset"],summary:"Follow a visual 4–4–4–4 box: inhale, hold, exhale, hold, with the cue moving exactly along each 4-second side.",what:"A paced visual breathing exercise using four equal 4-second phases: inhale → hold → exhale → hold.",when:"Use before a timed set, after a stressful item, or when you want a short structured pause. Four cycles take 64 seconds; extend only if it remains comfortable.",how:"Sit or stand comfortably and relax the shoulders. Follow the moving cue. Keep the breath easy; if breath-holding is uncomfortable, skip the holds and return to normal breathing.",why:"A predictable visual rhythm gives attention one simple task and a clear stopping point before returning to study.",example:"Before a 100-question practice block, complete four comfortable cycles, then state one intention: ‘I will read the lead-in before comparing options.’"},
      {id:"grounding",icon:"⌖",title:"5–4–3–2–1 Grounding",duration:"60–90 sec",accent:"#4272ff",contexts:["racing-thoughts","after-error"],summary:"Use the senses to reconnect attention with the present environment.",what:"A short sensory sequence: notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste or appreciate.",when:"Use when attention is scattered, thoughts are racing, or a difficult result keeps replaying.",how:"Complete one sensory group at a time. Choose ordinary, neutral details rather than searching for a perfect answer.",why:"It redirects attention toward concrete present information and ends with one clear next study action.",example:"After missing a priority question, notice five objects in the room, four contact sensations, three sounds, two scents, and one thing you appreciate; then return to one transfer question."},
      {id:"movement",icon:"↟",title:"Posture & Movement Reset",duration:"60–90 sec",accent:"#2d5652",contexts:["long-session"],summary:"Release shoulders, hands, jaw, posture, and prolonged sitting between study blocks.",what:"A five-step, low-intensity movement checklist that can be done beside the desk without equipment.",when:"Use when you notice physical tension or between extended study blocks. In tutor/study mode, the app may suggest a 60–90 second micro-break; do not interrupt an official-style timed block unless needed.",how:"Move gently and within your comfort. Skip any movement that is painful, unsafe, or not suitable for you.",why:"Micro-break evidence supports small improvements in vigor and fatigue; performance benefits are less consistent, so the aim is recovery rather than a guaranteed score gain.",example:"After an extended question-review block, stand, drop the shoulders, unclench both hands, look away from the screen, take two easy breaths, then resume with one defined question set."},
      {id:"eyes",icon:"◌",title:"Distance-Focus Eye Reset",duration:"20–30 sec",accent:"#42eaff",contexts:["eye-strain","long-session"],summary:"Look away from near work and focus on a distant, comfortable target.",what:"A brief distance-view break from continuous screen or near-focus work.",when:"Use when the eyes feel tired or between digital question blocks. Treat 20–30 seconds as a comfort prompt, not a medical prescription.",how:"Look toward a distant object, blink naturally, and avoid staring into bright light.",why:"It interrupts continuous near-focus demand. It is a comfort strategy, not treatment for an eye condition.",example:"Between question blocks, look through a window at a distant object for about 20–30 seconds while blinking naturally."},
      {id:"clarity",icon:"◇",title:"SNLE One-Question Reset",duration:"45–60 sec",accent:"#ffb343",contexts:["stuck-question","after-error"],summary:"Return to Task → Clue → Framework → Action instead of rereading everything.",what:"A four-step cognitive reset built specifically for one-best-answer nursing questions.",when:"Use when you have reread the stem but still feel stuck, or after eliminating options without a clear principle.",how:"Name the task, extract one discriminating clue, select the framework, then choose the immediate nursing action.",why:"It reduces unstructured rereading and reconnects the question with a repeatable clinical reasoning process.",example:"Scenario: 2 hours after extubation, an adult develops new inspiratory stridor and increasing retractions. Task: first action. Clue: evolving upper-airway obstruction. Framework: ABCDE/airway priority. Action: urgent airway support and escalation—not routine reassessment."},
      {id:"premock",icon:"▶",title:"Pre-Mock Start Ritual",duration:"60–90 sec",accent:"#ff7e42",contexts:["before-mock"],summary:"A consistent pre-assessment sequence for posture, breathing, pacing, and first-question strategy.",what:"A brief four-step start routine completed immediately before a timed assessment.",when:"Use before any timed mock or high-stakes practice block.",how:"Set posture, complete two slow comfortable breaths, choose a pacing rule, and commit to reading the lead-in before options.",why:"A repeatable start removes last-minute decision noise and gives the first question a deliberate approach.",example:"Before starting: ‘If a question is not resolving, I will choose the safest defensible option, flag it, and protect time for later items.’"},
      {id:"recovery",icon:"↺",title:"Confident-Error Recovery",duration:"60–90 sec",accent:"#85144b",contexts:["after-error"],summary:"Convert a wrong answer into one repair action without spiraling into passive rereading.",what:"A three-step recovery: label the error, retrieve the missed clue, and choose the repair question or tool.",when:"Use after a confident error, safety-critical mistake, or an answer change that turned correct into incorrect.",how:"Do not reread the entire rationale repeatedly. Write one sentence for the mistake and one rule for the next case.",why:"The goal is transfer: a mistake changes status only after correct reasoning in a related unseen context.",example:"Scenario: a postoperative patient has BP 82/48, HR 124, cool skin and new confusion. You chose ‘recheck later.’ Repair sentence: ‘I missed instability/shock.’ Rule: unstable before stable; reassess ABCs and escalate. Then answer one new deterioration question."}
    ];
        const RESET_CONTEXTS=[
      {id:"before-mock",label:"Before timed practice",recommend:"premock"},
      {id:"racing-thoughts",label:"Racing thoughts",recommend:"grounding"},
      {id:"breathing-reset",label:"Need a breathing reset",recommend:"breathing"},
      {id:"after-error",label:"After a difficult error",recommend:"recovery"},
      {id:"long-session",label:"Long session / shoulders or hands tense",recommend:"movement"},
      {id:"eye-strain",label:"Screen / eye fatigue",recommend:"eyes"},
      {id:"stuck-question",label:"Stuck on one question",recommend:"clarity"}
    ];
    const GROUNDING_STEPS=[
      ["5","things you can see","Look for ordinary visual details around you."],
      ["4","things you can feel","Notice contact, posture, or neutral body sensations."],
      ["3","things you can hear","Listen for neutral sounds nearby or at a distance."],
      ["2","things you can smell","Notice a mild scent or the absence of smell."],
      ["1","thing you can taste or appreciate","Name one present taste or one thing you appreciate."]
    ];
    const MOVEMENT_STEPS=[
      "Drop the shoulders away from the ears",
      "Relax both hands and unclench the jaw",
      "Stand or safely change posture",
      "Gently turn the head and upper body within comfort",
      "Look at a distant object and take two easy breaths"
    ];
    const RITUAL_STEPS=[
      "Posture · Feet supported and shoulders relaxed",
      "Breath · Two slow, comfortable breaths",
      "Pacing · Choose a time rule before starting",
      "Strategy · Read the lead-in before the options"
    ];

    function glossaryCategories(){
      return Array.from(new Set((L.glossary||[]).map(function(row){return row.category})));
    }
    function glossaryRows(){
      const query=String(state.glossaryQuery||"").trim().toLowerCase();
      return (L.glossary||[]).filter(function(row){
        const categoryMatch=!state.glossaryCategory||state.glossaryCategory==="All terms"||row.category===state.glossaryCategory;
        const hay=[row.term,row.category,row.definition,row.memory,row.arabic].join(" ").toLowerCase();
        return (!query?categoryMatch:true)&&(!query||hay.indexOf(query)>-1);
      });
    }
    function selectedGlossary(rows){
      let row=rows.find(function(item){return item.term===state.glossaryTerm});
      if(!row)row=rows[0]||(L.glossary||[])[0];
      if(row)state.glossaryTerm=row.term;
      return row;
    }
    var GLOSS_LENSES=[
      ["stem","Show stem","The complete clinical story that carries the information you need."],
      ["lead","Show lead-in","The final sentence that tells you the exact task to answer."],
      ["clue","Show clue","The clinical finding that carries useful signal for the decision."],
      ["key","Show key","The option that solves the exact task and fits the decisive clue."],
      ["distractors","Show distractors","Each incorrect option and the reasoning error it represents."],
      ["rationale","Show rationale","The explanation linking the decisive clue to the correct action."],
      ["discriminator","Show discriminator","The feature that makes the best option fit better than its closest competitor."]
    ];
    function glossaryFocus(term){
      var key=String(term||"").toLowerCase();
      if(key==="stem")return "stem";
      if(key==="lead-in"||key.indexOf("lead-in")>-1)return "lead";
      if(key.indexOf("distractor")>-1)return "distractors";
      if(key.indexOf("rationale")>-1)return "rationale";
      if(key.indexOf("discriminator")>-1)return "discriminator";
      if(key.indexOf("correct answer")>-1||key==="key")return "key";
      if(key.indexOf("clue")>-1)return "clue";
      return "term";
    }
    function glossaryUsesCustomTerm(row){
      return !!row && row.category!=="Question anatomy";
    }
    function glossaryTermSignals(row){
      var term=String((row&&row.term)||"").toLowerCase();
      var known={
        "stable":["stable","baseline","unchanged","routine","scheduled","expected","chronic","monitor"],
        "unstable":["unstable","rapid","new symptom","new symptoms","acute","deteriorat","immediate","urgent","threat","abnormal"],
        "priority":["priority","prioritized","first","immediate","urgent","greatest","most important"],
        "first":["first","before","initial","earliest"],
        "immediate":["immediate","now","urgent","prompt","without delay"],
        "best":["best","most appropriate","most defensible","safest"],
        "requires follow-up":["follow-up","follow up","reassess","review","report","notify"],
        "indicates understanding":["understanding","correct understanding","teach-back","states"],
        "needs further teaching":["further teaching","incorrect understanding","needs teaching","misunderstanding"],
        "best indicates improvement":["improvement","effective","effectiveness","better","resolved"],
        "question the order":["question the order","clarify","unsafe order","contraindicat"],
        "assess before acting":["assess","assessment","check","verify","reassess"],
        "act before assessing":["act","intervene","treat","call for help","emergency"],
        "reassessment":["reassess","recheck","repeat","trend","response"],
        "evaluation":["evaluate","effectiveness","outcome","response"],
        "delegation":["delegate","delegation","assign","assistive","licensed"],
        "scope of practice":["scope","role","competence","licensed","qualified"],
        "standard precautions":["standard precautions","hand hygiene","ppe","blood","body fluid"],
        "contact precautions":["contact","gown","gloves"],
        "droplet precautions":["droplet","mask"],
        "airborne precautions":["airborne","respirator","negative pressure"],
        "teach-back":["teach-back","teach back","understanding","explain back"],
        "ppe":["ppe","gloves","gown","mask","respirator"],
        "mar":["mar","medication administration record","medication"],
        "prn":["prn","as needed"],
        "npo":["npo","nothing by mouth","oral intake"],
        "i&o":["intake","output","urine"],
        "spo₂":["spo2","oxygen saturation","saturation"],
        "abg":["abg","ph","paco","hco"],
        "dka":["dka","ketone","glucose","acidosis"],
        "siadh":["siadh","sodium","fluid restriction","hyponatrem"],
        "dvt":["dvt","deep vein","leg swelling","calf"],
        "pe":["pulmonary embol","pe","dyspnea","chest pain"],
        "confidence rating":["confidence","certain","uncertain"],
        "confident error":["error","wrong","confidence"],
        "worked example":["example","demonstration","model"],
        "guided reasoning":["reasoning","clue","framework"],
        "spaced review":["spaced","review","later","delay"],
        "interleaving":["mixed","interleav","different topics"],
        "pilot question":["pilot","unscored"],
        "blueprint":["blueprint","domain","distribution"]
      };
      var list=(known[term]||[]).slice();
      String((row&&row.term)||"").split(/[^A-Za-z0-9₂]+/).forEach(function(w){
        w=w.toLowerCase();if(w.length>=3&&list.indexOf(w)<0)list.push(w);
      });
      return list.slice(0,12);
    }
    function glossaryTextHasSignal(text,row){
      var hay=String(text||"").toLowerCase();
      return glossaryTermSignals(row).some(function(k){return k&&hay.indexOf(k)>-1});
    }
    function glossaryActive(exampleId,row){
      state.glossaryShow=state.glossaryShow||{};
      if(!state.glossaryShow[exampleId]){
        var d={},focus=glossaryFocus(row&&row.term);d[focus]=true;
        if(glossaryUsesCustomTerm(row))d.term=true;
        state.glossaryShow[exampleId]=d;
      }
      return state.glossaryShow[exampleId];
    }
    function glossaryStemParts(stem){
      var text=String(stem||"").trim();
      var markers=[" Which "," What "," Who "," How "," When "," Where "];
      var start=-1;
      markers.forEach(function(marker){var found=text.lastIndexOf(marker);if(found>start)start=found});
      if(start<0)return {context:"",lead:text};
      return {context:text.slice(0,start+1),lead:text.slice(start+1)};
    }
    function glossaryClueText(example){
      var why=String(example.why||"");
      var m=why.match(/discriminating\s+(?:findings?|data|clues?)\s+(?:are|is|:)\s*([^.]+)/i);
      if(m&&m[1])return m[1].trim();
      var st=String(example.stem||"").match(/discriminating\s+data\s*:\s*([^.]+)/i);
      if(st&&st[1])return st[1].trim();
      m=why.match(/^(?:For|In)\s+[^,]+,\s*(.+?)\.?$/i);
      return m&&m[1]?m[1].trim():"";
    }
    function glossaryMarkPhrase(html,phrase,on,klass){
      if(!phrase||!on)return html;
      var needle=esc(phrase).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      try{return html.replace(new RegExp("("+needle+")","i"),'<mark class="gl-mark '+klass+'">$1</mark>')}
      catch(e){return html}
    }
    function glossaryMarkClue(html,clue,on){return glossaryMarkPhrase(html,clue,on,"gl-mark-clue")}
    function glossaryMarkDiscriminator(html,clue,on){return glossaryMarkPhrase(html,clue,on,"gl-mark-discriminator")}

    function glossaryOptions(example,active,row){
      var source=example.options||{},letters=["A","B","C","D"],termOn=!!active.term&&glossaryUsesCustomTerm(row);
      return '<div class="glossary-options" aria-label="Four answer options">'+letters.map(function(letter){
        var text=Array.isArray(source)?((source.find(function(option){return option.label===letter})||{}).text||""):source[letter];
        var isKey=letter===example.correct;
        var lit=(active.distractors&&!isKey)||(active.key&&isKey);
        var signal=termOn&&glossaryTextHasSignal(text,row);
        var cls="glossary-option"+(lit?" is-aligned":"")+(lit&&isKey?" gl-lit-key":"")+(lit&&!isKey?" gl-lit-distractor":"")+
          (active.discriminator?" gl-discriminator-option":"")+(active.discriminator&&isKey?" gl-discriminator-key":"")+
          (termOn?" is-term-aligned":"");
        var tags="";
        if(lit)tags+=(isKey?'<em class="gl-tag gl-tag-key">KEY</em>':'<em class="gl-tag gl-tag-distractor">DISTRACTOR</em>');
        if(active.discriminator)tags+='<em class="gl-tag gl-tag-discriminator">'+(isKey?'BEST FIT':'COMPARE')+'</em>';
        if(termOn)tags+='<em class="gl-tag gl-tag-term'+(signal?' signal':'')+'">'+esc(row.term)+(signal?' SIGNAL':' ?')+'</em>';
        var body=lit?'<mark class="gl-mark '+(isKey?'gl-mark-key':'gl-mark-distractor')+'">'+esc(text||"Option unavailable")+'</mark>':esc(text||"Option unavailable");
        return '<div class="'+cls+'"><b>'+letter+'</b><span>'+body+tags+'</span></div>';
      }).join("")+'</div>';
    }
    function glossaryExampleHtml(example,index,row){
      var exampleId=(example.id||("ex"+index))+"-"+index;
      var active=glossaryActive(exampleId,row);
      var parts=glossaryStemParts(example.stem);
      var clue=glossaryClueText(example);
      var ctxHtml=esc(parts.context);
      ctxHtml=glossaryMarkClue(ctxHtml,clue,active.clue&&!active.discriminator);
      ctxHtml=glossaryMarkDiscriminator(ctxHtml,clue,active.discriminator);
      if(active.stem)ctxHtml='<mark class="gl-mark gl-mark-stem">'+ctxHtml+'</mark>';
      var leadHtml=esc(parts.lead);
      leadHtml=glossaryMarkClue(leadHtml,clue,active.clue&&!active.discriminator&&!active.stem);
      leadHtml=glossaryMarkDiscriminator(leadHtml,clue,active.discriminator&&!active.stem);
      if(active.lead)leadHtml='<mark class="gl-mark gl-mark-lead">'+leadHtml+'</mark>';
      var customTerm=glossaryUsesCustomTerm(row);
      var controls='<div class="gl-controls" role="group" aria-label="Highlight controls">'+
        GLOSS_LENSES.map(function(x){
          var on=!!active[x[0]];
          return '<button class="gl-control gl-control-'+x[0]+(on?' on':'')+'" data-gl-lens="'+exampleId+':'+x[0]+
                 '" aria-pressed="'+on+'" title="'+esc(x[2])+'">'+esc(x[1])+'</button>';
        }).join("")+
        (customTerm?'<button class="gl-control gl-control-term'+(active.term?' on':'')+'" data-gl-lens="'+exampleId+
          ':term" aria-pressed="'+(!!active.term)+'" title="'+esc(row.definition||"Apply the selected glossary concept to the stem and every option.")+
          '">Show '+esc(row.term)+'</button>':"")+
        '<button class="gl-control gl-control-all" data-gl-lens="'+exampleId+':__all">Show all</button>'+
        '<button class="gl-control gl-control-clear" data-gl-lens="'+exampleId+':__none">Clear</button></div>';
      var legend=GLOSS_LENSES.filter(function(x){return active[x[0]]}).map(function(x){
        return '<span class="gl-legend-item gl-legend-'+x[0]+'"><i></i>'+esc(x[1].replace("Show ",""))+' — '+esc(x[2])+'</span>';
      }).join("");
      if(customTerm&&active.term)legend+='<span class="gl-legend-item gl-legend-term"><i></i>'+esc(row.term)+' — '+esc(row.definition||"Selected glossary concept")+'</span>';
      var clueBlock=active.clue?'<div class="glossary-clue is-aligned"><span>ALIGNED CLUE / TOOL</span><strong>'+
        esc(example.tool||"Clinical reasoning")+'</strong><p>'+esc(example.why||"Apply the term to the exact task and decisive clue.")+'</p></div>':"";
      var discriminatorBlock=active.discriminator?'<div class="glossary-clue is-aligned" style="border-color:#91aebe;background:#f2f7fa;box-shadow:inset 5px 0 #0c2c47"><span style="color:#0c2c47">DISCRIMINATOR</span><strong>'+
        esc(clue||"Compare each option against the decisive finding")+'</strong><p>The discriminator is the feature that makes one answer fit the task and evidence better than the closest distractor. Use the BEST FIT / COMPARE tags below.</p></div>':"";
      var termBlock=customTerm&&active.term?'<div class="gl-term-lens"><b>TERM LENS · '+esc(row.term)+'</b><span>'+esc(row.definition||"Apply this term to the clinical wording and compare how it changes each option.")+'</span></div>':"";
      var rationaleOpen=active.rationale?" open":"";
      return '<details class="glossary-example" '+(index===0?"open":"")+'><summary><b>'+String(index+1).padStart(2,"0")+
        '</b><span><strong>'+esc(example.topic||"Clinical example")+'</strong><small>'+esc(example.domain||"")+' · '+
        esc(example.tool||"Reasoning")+'</small></span><span class="glossary-reveal-label">Open teaching case ↓</span></summary>'+
        '<div class="glossary-case">'+controls+
        (legend?'<div class="gl-legend">'+legend+'</div>':"")+termBlock+
        '<div class="glossary-stem'+(customTerm&&active.term?' is-term-aligned':'')+'"><span class="glossary-component-label">QUESTION STEM · all controls apply here</span><p>'+
        (ctxHtml?'<span>'+ctxHtml+'</span> ':"")+leadHtml+'</p></div>'+clueBlock+discriminatorBlock+
        '<span class="glossary-component-label">ANSWER OPTIONS</span>'+glossaryOptions(example,active,row)+
        '<details class="glossary-solution'+(active.rationale?" is-aligned":"")+'"'+rationaleOpen+
        '><summary>Reveal correct answer + rationale</summary><div class="glossary-answer">'+
        '<div class="glossary-correct"><strong>Correct answer '+esc(example.correct||"")+'</strong><br>'+
        esc(example.correctAnswer||"")+'</div><div><strong>Why it connects</strong><br>'+
        (active.rationale?'<mark class="gl-mark gl-mark-rationale">'+esc(example.rationale||example.why||"")+'</mark>':esc(example.rationale||example.why||""))+
        '</div></div></details></div></details>';
    }
    function courseLibraryModal(){
  return `<div class="course-info-overlay" data-course-library-overlay><section class="course-info-modal course-library-modal" role="dialog" aria-modal="true" aria-labelledby="course-library-title"><button class="course-info-close" data-course-library-close aria-label="Close">×</button><header class="course-library-hero"><div class="committee-kicker">SNLE EVIDENCE LAB · VIEW-ONLY LIBRARY</div><h2 id="course-library-title">Open the complete learning library</h2><p>Choose the resource you need. Each companion HTML view is designed for structured on-screen study with search, filtering, and controlled answer reveal.</p></header><div class="library-choice-grid"><a class="library-choice" href="SNLE_All_Tools_ViewOnly_v19.html" target="_blank" rel="noopener"><span class="library-choice-icon">▦</span><span><small>VISUAL TOOL LIBRARY</small><h3>Open all 67 clinical tools</h3><p>Browse every canonical poster with HYP sorting, clinical job, boundary, pearl, trap, and a full-screen poster viewer.</p></span><span class="library-count">67 TOOLS</span></a><a class="library-choice" href="SNLE_Question_Bank_ViewOnly_v19.html" target="_blank" rel="noopener"><span class="library-choice-icon">?</span><span><small>COMPLETE QUESTION BANK</small><h3>Open all 1,297 questions</h3><p>Search and filter the full standardized bank by tool, domain, HYP, difficulty, and clinical-judgment function, with controlled answer reveal.</p></span><span class="library-count">1,297 ITEMS</span></a><a class="library-choice" href="SNLE_Clinical_Dossier_Question_Bank_ViewOnly_v23_1_Smaller_Stem.html" target="_blank" rel="noopener"><span class="library-choice-icon">✚</span><span><small>CLINICAL DOSSIER QUESTION BANK</small><h3>Open all 350 dossier questions</h3><p>Review the separate Clinical Dossier case bank by dossier, specialty, domain, HYP, difficulty, and clinical-judgment function, with controlled answer reveal.</p></span><span class="library-count">350 CASES</span></a></div><div class="library-protection-note"><span>◈</span><div><b>View-only design:</b> the library omits download/export controls, blocks ordinary print/save shortcuts, disables image dragging and right-click, and adds a privacy shield when the page loses focus. Browser-based controls can deter casual copying, but no ordinary HTML page can guarantee prevention of operating-system screenshots.</div></div></section></div>`;
}

    function committeeInfoModal(){
      const people=[
        {initials:'HA',name:'Hossam AlDhaher',role:'Head of Scientific Committee & Presenter',tag:'Course lead',icon:'✦'},
        {initials:'OA',name:'Dr. Ohud AlArfaj',role:'Director of Health Training Administration',tag:'Training leadership',icon:'◎'},
        {initials:'OO',name:'ObaidUllah AlOnaizi',role:'Chairperson, Academic Nursing Training Department',tag:'Academic nursing',icon:'◇'},
        {initials:'BB',name:'Basmah Balgith',role:'Head of Undergraduate Nursing Section',tag:'Undergraduate education',icon:'▤'}
      ];
      return `<div class="course-info-overlay" data-committee-overlay><section class="course-info-modal committee-modal" role="dialog" aria-modal="true" aria-labelledby="committee-title"><button class="course-info-close" data-committee-close aria-label="Close">×</button><div class="committee-hero"><div class="committee-glow one"></div><div class="committee-glow two"></div><div class="committee-kicker">WELCOME TO THE SNLE EVIDENCE LAB</div><div class="committee-emblem"><span>SC</span></div><h2 id="committee-title"><span class="marker-highlight">Meet your Scientific Committee</span></h2><p>We are pleased to welcome you to a learning experience built around clinical reasoning, safe decisions, and deliberate practice. Our shared goal is to help you move beyond memorizing phrases and become confident in recognizing the clue that changes the nursing decision.</p><div class="committee-welcome"><span>“</span><div><b>A message from the committee</b><p>Engage actively, challenge your first answer, use the feedback, and bring every mistake back into your next practice set. Progress comes from the quality of your reasoning—not from passive exposure.</p></div></div></div><div class="committee-grid">${people.map((p,i)=>`<article class="committee-person tone-${i+1}"><div class="person-top"><div class="person-avatar">${p.initials}</div><div class="person-symbol">${p.icon}</div></div><span class="person-tag">${p.tag}</span><h3>${p.name}</h3><p>${p.role}</p></article>`).join('')}</div><div class="committee-footer"><div><span>01</span><b>Think clinically</b><small>Prioritize the decisive clue.</small></div><div><span>02</span><b>Practice deliberately</b><small>Answer before you reveal.</small></div><div><span>03</span><b>Transfer the rule</b><small>Use it in a new context.</small></div><button class="primary-button" data-committee-close>Enter the learning journey →</button></div></section></div>`;
    }

    function learningJourneyInfoModal(){
      const steps=[
        ['01','Prepare','Before the session','Open the SNLE Guide and Glossary, complete a short baseline check, define one learning goal, and keep your device charged with a reliable connection.'],
        ['02','Preview','2–3 min','Scan the framework title, “when to use,” and boundaries before reading details. Predict what decision the tool is designed to support.'],
        ['03','Learn actively','15–25 min','Study one framework at a time. Pause at examples, explain the rule in your own words, and avoid highlighting everything.'],
        ['04','Retrieve','5 min','Close the explanation and reconstruct the key rule, decisive clue, first action, and major trap from memory.'],
        ['05','Apply','10–20 min','Answer questions before revealing feedback. Use clues only after committing to an initial interpretation.'],
        ['06','Debrief','3–5 min','Record why the correct answer wins, why your distractor was tempting, and what would change the decision next time.'],
        ['07','Space & revisit','24 h · 3 d · 7 d','Return to weak tools and flagged questions after a delay. Mix topics so you practise choosing the right framework, not merely repeating it.']
      ];
      const checklist=['Laptop or tablet with a modern browser','Reliable internet if using linked references','Notebook or digital notes + pen/stylus','Charger / power source','Headphones for a focused environment','Water and a planned study-break schedule'];
      return `<div class="course-info-overlay" data-learning-journey-overlay><section class="course-info-modal journey-modal" role="dialog" aria-modal="true" aria-labelledby="journey-info-title"><button class="course-info-close" data-learning-journey-close aria-label="Close">×</button><header class="journey-modal-head"><div><div class="committee-kicker">YOUR EFFECTIVE LEARNING PLAYBOOK</div><h2 id="journey-info-title"><span class="marker-highlight">Turn the course into a learning system</span></h2><p>The platform is most useful when you <b>predict → retrieve → apply → debrief → revisit</b>. Use the tools below as a repeatable study routine rather than moving through pages passively.</p></div><div class="journey-loop"><span class="loop-center">LEARN<br>BETTER</span><i class="loop-node n1">Predict</i><i class="loop-node n2">Retrieve</i><i class="loop-node n3">Apply</i><i class="loop-node n4">Review</i></div></header><div class="journey-info-layout"><section class="journey-path"><div class="journey-section-title"><span>THE 7-STEP LOOP</span><b>Use this for every major topic</b></div>${steps.map(s=>`<article class="journey-step"><div class="journey-step-no">${s[0]}</div><div><div class="journey-step-top"><h3>${s[1]}</h3><span>${s[2]}</span></div><p>${s[3]}</p></div></article>`).join('')}</section><aside class="journey-side"><section class="ready-card"><div class="ready-icon">✓</div><h3>Bring these with you</h3>${checklist.map(x=>`<label><span>□</span>${x}</label>`).join('')}</section><section class="notes-card"><span class="notes-kicker">SMART NOTES</span><h3>Do not copy the slide. Capture the decision.</h3><div class="note-template"><div><b>CLUE</b><span>What finding changes priority?</span></div><div><b>RULE</b><span>What principle decides the answer?</span></div><div><b>TRAP</b><span>Why was the distractor tempting?</span></div><div><b>TRANSFER</b><span>When would the decision change?</span></div></div></section><section class="course-do-card"><h3>During every practice set</h3><p><b>1.</b> Answer before revealing the rationale.</p><p><b>2.</b> Flag uncertainty, not just wrong answers.</p><p><b>3.</b> Use HYP to prioritize—not to ignore lower-yield foundations.</p><p><b>4.</b> Stop and reset when attention drops; quality beats exhausted volume.</p><p><b>5.</b> End with a short error log and one action for the next session.</p></section></aside></div><footer class="journey-modal-footer"><div><b>Your target:</b> leave each session able to explain the decision rule without looking at the screen.</div><button class="primary-button" data-learning-journey-close>Start prepared →</button></footer></section></div>`;
    }

    function glossaryInfoModal(){
      return '<div class="glossary-info-overlay" data-glossary-info-overlay><section class="glossary-info-modal" role="dialog" aria-modal="true" aria-labelledby="glossary-info-title">'+
        '<button class="glossary-info-close" data-glossary-info-close aria-label="Close">×</button>'+
        '<header class="glossary-info-hero"><span class="eyebrow">WHY THIS LEARNING DESIGN MATTERS</span><h2 id="glossary-info-title"><span class="glossary-title-white">Decode the wording. Protect the clinical decision.</span></h2><p>This screen does not claim that a glossary alone raises an SNLE score. It shows the stronger evidence behind the learning methods used across this app: <strong>practice questions, retrieval, structured reasoning, elaborated feedback, error analysis, and spaced revisit.</strong></p></header>'+
        '<div class="glossary-info-content">'+
          '<div class="glossary-proof-grid evidence-first">'+
            '<article class="glossary-proof-card proof-retrieval"><span class="proof-icon">↻</span><strong>21 / 23</strong><h3>Retention outcomes favored testing</h3><p>A systematic review of test-enhanced learning in health-professions education found that 21 of 23 retention outcomes favored retrieval/testing over study comparison conditions; all 7 transfer outcomes also favored testing.</p><small>Green, Moeller & Spak · Medical Teacher · 2018.</small></article>'+
            '<article class="glossary-proof-card proof-distributed"><span class="proof-icon">⟳</span><strong>43 / 63</strong><h3>Experiments showed significant benefit</h3><p>A 2024 systematic review found significant benefits from distributed practice and/or retrieval practice in 43 of 63 health-professions experiments, supporting repeated question practice rather than one-pass review.</p><small>Trumble et al. · Advances in Health Sciences Education · 2024.</small></article>'+
            '<article class="glossary-proof-card proof-spacing"><span class="proof-icon">≋</span><strong>SMD 0.78</strong><h3>Spaced repetition improved objective tests</h3><p>A 2026 medical-education meta-analysis of 21,415 learners found a significant overall advantage for spaced repetition versus standard study techniques (95% CI 0.56–0.99; p&lt;0.0001).</p><small>Maye & Hurley · The Clinical Teacher · 2026.</small></article>'+
            '<article class="glossary-proof-card proof-licensing"><span class="proof-icon">✓</span><strong>445 MCQs</strong><h3>Practice volume tracked licensing performance</h3><p>In one observational cohort of 72 medical students, each additional 445 boards-style practice questions was associated with about one additional Step 1 point after adjustment. This is an association—not proof of causation and not an SNLE conversion.</p><small>Deng, Gluckstein & Larsen · Perspectives on Medical Education · 2015.</small></article>'+
          '</div>'+
          '<section class="glossary-evidence-flow"><div class="evidence-flow-head"><div><span class="eyebrow">THE APP LEARNING PATH</span><h3>Break the item down, choose a framework, then learn from the answer</h3><p>These steps translate the research into the behaviors this platform asks the learner to repeat.</p></div><span class="evidence-badge">ACTIVE &gt; PASSIVE</span></div><div class="glossary-flow-row">'+
            '<div class="glossary-flow-node"><b>01</b><div><strong>Decode the task</strong><span>stem · lead-in · clue · discriminator</span></div></div><span class="glossary-flow-arrow">→</span>'+
            '<div class="glossary-flow-node"><b>02</b><div><strong>Match the framework</strong><span>priority · safety · scope · timing · reassessment</span></div></div><span class="glossary-flow-arrow">→</span>'+
            '<div class="glossary-flow-node"><b>03</b><div><strong>Commit before feedback</strong><span>retrieve first · then reveal rationale</span></div></div><span class="glossary-flow-arrow">→</span>'+
            '<div class="glossary-flow-node"><b>04</b><div><strong>Debrief + revisit</strong><span>why it wins · distractor trap · transfer · spaced review</span></div></div>'+
          '</div></section>'+
          '<div class="glossary-evidence-bottom">'+
            '<article class="glossary-boundary-card evidence-translation"><h3>Why the question/answer breakdown matters</h3><p><b>Elaborated feedback:</b> in randomized studies of medical students learning diagnosis from case-based worked examples, explaining why an answer or approach was right or wrong supported diagnostic knowledge better than simply showing the correct result. That is why this app exposes <b>rationale, distractor logic, Clinical Pearl, Trap Hunter, and transfer prompts</b> instead of only a keyed answer.</p><div class="evidence-mini-grid"><span><b>Question anatomy</b> makes the requested task explicit.</span><span><b>Framework matching</b> makes the decision rule visible and reusable.</span><span><b>Distractor analysis</b> turns an error into a reusable boundary.</span><span><b>Spaced revisit</b> moves the same rule into later retrieval.</span></div></article>'+
            '<article class="glossary-sources-card"><h3>Evidence behind this screen</h3><div class="glossary-source-list">'+
              '<a href="https://pubmed.ncbi.nlm.nih.gov/29390949/" target="_blank" rel="noreferrer"><b>01</b><span><strong>Test-enhanced learning · systematic review</strong><small>19 studies; retention and transfer outcomes largely favored retrieval/testing.</small></span></a>'+
              '<a href="https://pubmed.ncbi.nlm.nih.gov/37615780/" target="_blank" rel="noreferrer"><b>02</b><span><strong>Distributed + retrieval practice · systematic review</strong><small>56 studies, 63 experiments; 43 reported significant benefit.</small></span></a>'+
              '<a href="https://doi.org/10.1111/tct.70353" target="_blank" rel="noreferrer"><b>03</b><span><strong>Spaced repetition · 2026 meta-analysis</strong><small>21,415 learners; SMD 0.78 in favor of spaced repetition.</small></span></a>'+
              '<a href="https://pubmed.ncbi.nlm.nih.gov/19930513/" target="_blank" rel="noreferrer"><b>04</b><span><strong>Worked examples + elaborated feedback</strong><small>Randomized medical-student study; elaborated feedback fostered diagnostic knowledge.</small></span></a>'+
              '<a href="https://pubmed.ncbi.nlm.nih.gov/26498443/" target="_blank" rel="noreferrer"><b>05</b><span><strong>Practice MCQs and licensing performance</strong><small>Observational association in 72 students; useful signal, not causal proof.</small></span></a>'+
            '</div></article>'+
          '</div>'+
          '<article class="pareto-card"><div class="pareto-icon">80/20</div><div><h3>Use Pareto as a prioritization heuristic—not as an exam law</h3><p>Start with high-HYP, high-risk, frequently recurring decision patterns to gain efficiency, then complete the full blueprint. The classic 80/20 idea is useful for <b>where to start</b>; it is not validated as “80% of SNLE marks come from 20% of topics.”</p></div></article>'+
        '</div></section></div>';
    }
    function glossaryAnnotatorMarkup(){
      var tool=state.glossaryAnnotTool||'off', active=tool!=='off', marks=pageMarks();
      var paths=(marks.paths||[]).map(function(path){return '<polyline points="'+path.points.map(function(pt){return pt.join(',')}).join(' ')+'" fill="none" stroke="'+esc(path.color)+'" stroke-width="'+(path.tool==='highlight'?24:4)+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+(path.tool==='highlight'?'.30':'.96')+'"></polyline>'}).join('');
      var texts=(marks.texts||[]).map(function(n,i){return '<button class="glossary-annotation-text" data-glossary-text-index="'+i+'" style="left:'+n.x+'%;top:'+n.y+'%;--note-color:'+esc(n.color||'#4272ff')+'">'+esc(n.text)+'</button>'}).join('');
      var layer='<div class="glossary-annotation-layer '+(active?'is-active':'')+'" data-glossary-annotation-layer data-tool="'+esc(tool)+'"><svg class="glossary-annotation-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Page annotations">'+paths+'</svg>'+texts+'</div>';
      var colors=GLOSSARY_ANNOT_COLORS.map(function(c){return '<button class="glossary-color '+(state.glossaryAnnotColor===c?'active':'')+'" data-glossary-annot-color="'+c+'" style="--swatch:'+c+'" title="Use '+c+'" aria-label="Use annotation color '+c+'"></button>'}).join('');
      var panel='<div class="glossary-annotator page-annotator" data-glossary-annotator style="'+(state.glossaryAnnotMin?'display:none;':'')+'"><section class="glossary-edit-panel"><header class="glossary-annot-head" data-glossary-annot-drag><div><strong>Page edit layer</strong><span>drag this bar · '+esc(titles[state.view]||'Current page')+'</span></div><button data-glossary-annot-toggle title="Minimize">−</button></header><div class="glossary-annot-body"><div class="glossary-annot-tools">'+
        '<button data-glossary-annot-tool="highlight" class="'+(tool==='highlight'?'active':'')+'"><b>▰</b>Highlight</button>'+
        '<button data-glossary-annot-tool="pen" class="'+(tool==='pen'?'active':'')+'"><b>✎</b>Pen</button>'+
        '<button data-glossary-annot-tool="text" class="'+(tool==='text'?'active':'')+'"><b>Aa</b>Add text</button>'+
        '<button data-glossary-annot-clear class="danger"><b>⌫</b>Clear</button></div><div class="glossary-annot-colors"><span>4 colors</span>'+colors+'</div><p class="glossary-annot-hint">Mark the current page with highlight, pen or text. Each main page keeps its own saved annotation layer. Click the active tool again to return to normal interaction.</p></div></section></div>';
      return layer+panel;
    }
    function glossaryPage(){
      const categories=glossaryCategories();
      if(!state.glossaryCategory)state.glossaryCategory=categories[0]||"All terms";
      const rows=glossaryRows(),row=selectedGlossary(rows);
      const categoryButtons=categories.map(function(category){
        const count=(L.glossary||[]).filter(function(item){return item.category===category}).length;
        return '<button class="'+(state.glossaryCategory===category?'active':'')+'" data-glossary-category="'+esc(category)+'"><span>'+esc(category)+'</span><b>'+count+'</b></button>';
      }).join("");
      const termButtons=rows.map(function(item){
        return '<button class="'+(row&&row.term===item.term?'active':'')+'" data-glossary-term="'+esc(item.term)+'"><span class="gl-term-pair"><strong>'+esc(item.term)+'</strong><span lang="ar" dir="rtl">'+esc(item.arabic||"")+'</span></span></button>';
      }).join("");
      const detail=row?'<article class="glossary-detail"><span class="glossary-kicker">'+esc(row.category)+'</span><div class="glossary-title-line"><h2>'+esc(row.term)+'</h2><div class="glossary-arabic" lang="ar" dir="rtl">'+esc(row.arabic||"")+'</div></div><div class="glossary-meaning-line"><p class="glossary-definition">'+esc(row.definition||"")+'</p><div class="memory-note"><strong>Quick memory:</strong> '+esc(row.memory||"")+'</div></div><div class="example-label">03 COMPLETE FOUR-OPTION TEACHING EXAMPLES</div>'+(row.examples||[]).slice(0,3).map(function(example,index){return glossaryExampleHtml(example,index,row)}).join("")+'</article>':'<article class="glossary-detail"><h2>No term found</h2><p>Clear the search and try another term.</p></article>';
      return '<div class="page-content glossary-page"><section class="page-hero"><div><span class="eyebrow">QUESTION LANGUAGE · BILINGUAL</span><h1 class="editorial-title">Searchable Glossary</h1><p>Decode question anatomy, lead-ins, reasoning language, safety terms, frameworks, and abbreviations. Each term includes Arabic support and three aligned clinical examples.</p></div><div class="glossary-hero-actions"><button class="glossary-info-button" data-glossary-info><i>i</i><span>Why this matters</span></button><div class="page-badge">'+String((L.glossary||[]).length).padStart(2,"0")+' original terms</div></div></section><section class="glossary-shell" style="--glossary-list-width:'+Math.round(state.glossaryListWidth||390)+'px"><button class="snle-focus-toggle" data-snle-focus title="Toggle fullscreen focus mode">⛶ Focus View</button><aside class="glossary-categories"><span>GLOSSARY CATEGORIES</span><h2>Choose a language family</h2><div class="glossary-category-list">'+categoryButtons+'</div></aside><section class="glossary-list-pane"><div class="glossary-search"><label><span>⌕</span><input id="glossary-search" value="'+esc(state.glossaryQuery||"")+'" placeholder="Search term, meaning, or Arabic"><button data-glossary-clear aria-label="Clear search">×</button></label><small>'+rows.length+' '+(rows.length===1?"term":"terms")+' shown</small></div><nav class="glossary-term-list">'+(termButtons||'<div class="empty-state"><h3>No matching term</h3><p>Clear the search and try again.</p></div>')+'</nav></section><div class="glossary-splitter" data-glossary-splitter role="separator" aria-label="Resize glossary term list" aria-orientation="vertical" tabindex="0"></div>'+detail+'</section></div>';
    }


    /* ---------------- Exam-day plan: the five things that decide the day ---- */
    const PLAN_FOCUSES=[
      {n:"01",t:"Pacing discipline",why:"A fixed checkpoint reduces the chance that one difficult item consumes time needed for later items.",do:"Use a pre-decided checkpoint: item 25 by minute 30, item 50 by minute 60, item 75 by minute 90.",risk:"high"},
      {n:"02",t:"The flag-and-move rule",why:"When an item is not resolving, additional time has diminishing value and may create avoidable time pressure.",do:"Use a hard ceiling close to twice your usual item time. Choose the safest defensible option, flag, and move.",risk:"high"},
      {n:"03",t:"Read the lead-in deliberately",why:"Naming the task before comparing options helps prevent answering a different question than the one asked.",do:"Identify whether the item asks for first action, priority finding, teaching, delegation, or evaluation; then search the stem for the decisive clue.",risk:"high"},
      {n:"04",t:"Change answers for evidence, not anxiety",why:"Revision is useful when a concrete clue changes your reasoning; repeated switching without new evidence adds noise.",do:"Change only when you can name the missed clue or rule in one sentence.",risk:"medium"},
      {n:"05",t:"Protect recovery",why:"Attention is finite across a long testing session. A real break supports reset better than replaying completed questions.",do:"Move, hydrate, eat a familiar light snack if needed, and avoid post-mortem discussion of block one.",risk:"medium"},
      {n:"06",t:"Protect sleep and logistics",why:"Regular sleep supports attention, learning and performance; adult consensus guidance recommends at least 7 hours on a regular basis.",do:"Protect sleep for several nights, confirm route/ID/booking, and follow the current SCFHS reporting instructions.",risk:"medium"}
    ];
    const STUDY_MILESTONES=[
      {key:"month",n:"01",when:"1 month before",icon:"↻",evidence:"Spacing + retrieval practice",title:"Build a repeatable four-week cycle",actions:["Take a mixed baseline set and identify the two weakest decision domains.","Study on multiple days rather than massing the same hours into one or two long sessions.","Make active recall the default: answer questions, retrieve algorithms from memory, then correct with feedback.","Revisit missed concepts after a delay and keep one short error log: clue missed → rule → next action.","Complete at least one timed mixed simulation each week so pacing becomes familiar."],placeholder:"e.g. Mon–Thu 2 focused blocks; Fri mixed simulation; weak domains: maternal-child + prioritization"},
      {key:"twoWeeks",n:"02",when:"2 weeks before",icon:"◎",evidence:"Cumulative practice + feedback",title:"Shift from learning topics to retrieving decisions",actions:["Increase mixed, timed question sets and make most review cumulative rather than chapter-by-chapter.","Use corrective feedback immediately after each set, then re-test the same missed concept on a later day.","Run realistic blocks often enough to expose pacing problems without exhausting yourself every day.","Prioritize high-HYP weaknesses and safety errors; do not spend equal time on already-stable strengths.","Keep sleep/wake times increasingly consistent with the exam-day schedule."],placeholder:"e.g. Tue/Thu timed 50-question mixed sets; Sat 100-item simulation; re-test misses 48–72 h later"},
      {key:"twoDays",n:"03",when:"2 days before",icon:"▤",evidence:"Taper + targeted retrieval",title:"Reduce volume; sharpen recall",actions:["Stop adding broad new content. Use short retrieval rounds on your error log, high-HYP frameworks and weak boundaries.","Do one light mixed set only if it improves confidence and pacing; avoid an exhausting full-day cram.","Prepare identification, booking details, route, transport, clothing, water/snack plan and permitted items.","Protect a normal sleep opportunity; do not trade sleep for late-night review."],placeholder:"e.g. 30–40 mixed questions + error-log review; documents packed by 18:00; normal bedtime"},
      {key:"oneDay",n:"04",when:"1 day before",icon:"☾",evidence:"Sleep + low cognitive load",title:"Finish early enough to arrive rested",actions:["Use only a brief, confidence-building retrieval session—no deep new learning.","Review your pacing checkpoints, flag-and-move rule and one-page high-yield safety list.","Stop study at a pre-set time, eat normally, hydrate normally, and keep caffeine within your usual routine.","Aim for at least 7 hours of sleep and avoid trying unfamiliar sleep aids or routines."],placeholder:"e.g. 45 min light retrieval, stop 18:30, bag/ID ready, usual dinner, in bed 22:30"},
      {key:"examDay",n:"05",when:"Exam day",icon:"▶",evidence:"Routine + attentional control",title:"Run the plan; do not redesign it",actions:["Use a familiar meal and your usual caffeine amount if you normally use caffeine.","Arrive according to current SCFHS instructions with time for traffic, parking and registration.","At each item: name the task → find the decisive clue → choose the safest defensible action → move.","If stuck, use your ceiling and flag. If anxiety spikes, take two slow breaths and re-read only the lead-in before continuing.","Use the scheduled break for physical and mental reset, not for reviewing completed questions."],placeholder:"e.g. wake 06:00; breakfast 06:30; leave 07:00; pacing 25/30, 50/60, 75/90; reset = 2 slow breaths"}
    ];
    function planState(){
      progress.examPlan=progress.examPlan||{};
      return progress.examPlan;
    }
    function planPacing(){
      const rows=[["Block start","00:00","Item 1 — identify the task before comparing options"],
                  ["Minute 30","Item 25","On pace. If behind, shorten deliberation now."],
                  ["Minute 60","Item 50","Halfway. Correct pacing here, not at the end."],
                  ["Minute 90","Item 75","Protect the final quarter — use the flag-and-move rule."],
                  ["Minute 110","Item 92","Begin closing: every remaining item receives an answer."],
                  ["Minute 120","Item 100","Block complete. No item intentionally left blank."]];
      return '<table class="plan-pace"><thead><tr><th>Clock</th><th>Target</th><th>What it means</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td class="plan-pace-clock">'+r[0]+'</td><td class="plan-pace-item">'+r[1]+'</td><td>'+r[2]+'</td></tr>'}).join("")+'</tbody></table>';
    }
    function examDayPlanner(){
      const p=planState();
      const filled=STUDY_MILESTONES.filter(function(m){return String(p[m.key]||"").trim()}).length;
      const pct=Math.round(filled/STUDY_MILESTONES.length*100);
      const timeline=STUDY_MILESTONES.map(function(m){
        return '<article class="study-milestone"><div class="study-milestone-head"><span class="study-icon">'+m.icon+'</span><div><span class="guide-number">'+m.n+'</span><strong>'+m.when+'</strong><small>'+m.evidence+'</small></div></div><h3>'+m.title+'</h3><ul>'+m.actions.map(function(a){return '<li>'+a+'</li>'}).join("")+'</ul><label class="study-commit"><span>My plan</span><textarea rows="3" data-plan="'+m.key+'" placeholder="'+esc(m.placeholder)+'">'+esc(p[m.key]||"")+'</textarea></label></article>';
      }).join("");
      const focuses=PLAN_FOCUSES.map(function(x){return '<article class="plan-focus plan-risk-'+x.risk+'"><span class="guide-number">'+x.n+'</span><h3>'+esc(x.t)+'</h3><p class="plan-why">'+esc(x.why)+'</p><p class="plan-do"><b>Do this</b>'+esc(x.do)+'</p></article>';}).join("");
      return '<article class="guide-panel"><span class="eyebrow">04 · EVIDENCE-INFORMED PREPARATION</span><h2>Five-stage study and exam-day plan</h2><p>This planner converts learning-science evidence into a practical SNLE routine: distributed practice, repeated retrieval with feedback, cumulative mixed practice, tapering near the exam, and protected sleep. Personalize the commitments; do not use it as a substitute for current SCFHS administrative instructions.</p><div class="plan-progress"><div class="plan-progress-bar"><i style="width:'+pct+'%"></i></div><span>'+filled+' of '+STUDY_MILESTONES.length+' milestones personalized</span><button class="secondary-button" data-plan-print>Print / save as PDF</button><button class="secondary-button" data-plan-clear>Clear plan</button></div><div class="study-evidence-strip"><span>Evidence base</span><a href="https://pubmed.ncbi.nlm.nih.gov/16507066/" target="_blank" rel="noreferrer">Retrieval practice</a><a href="https://pubmed.ncbi.nlm.nih.gov/16719566/" target="_blank" rel="noreferrer">Distributed practice</a><a href="https://pubmed.ncbi.nlm.nih.gov/40564553/" target="_blank" rel="noreferrer">Applied spacing meta-analysis</a><a href="https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf" target="_blank" rel="noreferrer">Sleep ≥7 h</a></div><div class="study-timeline">'+timeline+'</div><h3 class="plan-h">Exam-day execution rules</h3><div class="plan-focus-grid">'+focuses+'</div><h3 class="plan-h">Pacing map — 100 items, 120 minutes</h3>'+planPacing()+'<div class="plan-note"><b>Evidence boundary.</b> Retrieval practice and distributed practice have robust support for long-term retention; sleep recommendations support regular adequate sleep. The exact study volume should be adjusted to your baseline, fatigue and available time. Verify current exam structure, booking, identification, reporting and break rules with SCFHS before testing.</div></article>';
    }
    function sevenSegment(text){
      const map={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
      return '<span class="segment-display" aria-label="'+esc(text)+'">'+Array.from(String(text)).map(function(ch){
        if(/[0-9]/.test(ch)){const on=map[ch]||'';return '<span class="seven-digit">'+['a','b','c','d','e','f','g'].map(function(seg){return '<i class="seg seg-'+seg+' '+(on.includes(seg)?'on':'')+'"></i>'}).join('')+'</span>'}
        if(ch===' ')return '<span class="seven-space"></span>';
        return '<span class="seven-symbol">'+esc(ch)+'</span>';
      }).join('')+'</span>';
    }

    const GUIDE_DOMAIN_DETAILS={
      "Nursing Fundamentals":{
        weight:(window.GULF_WEIGHTS||{}).f||"20%",
        note:"Basic human needs, foundational skills, assessment, pharmacology, and basic sciences.",
        subs:[
          ["Fundamentals of nursing","Foundational nursing care, prioritization, professionalism, patient-centered care, safety, health education, communication and information technology."],
          ["Physical assessment","Systematic history, focused assessment, recognition of abnormal findings, and escalation."],
          ["Pharmacology","Medication principles, safe administration, monitoring, adverse effects, and patient teaching."],
          ["Basic sciences","Core anatomy, physiology, pathophysiology and science concepts supporting nursing decisions."]
        ]
      },
      "Adult Nursing":{
        weight:(window.GULF_WEIGHTS||{}).a||"40%",
        note:"Adult care across acute, chronic, inpatient, outpatient, medical, surgical and complex/critical contexts.",
        subs:[
          ["Medical nursing","Adult medical conditions, monitoring, deterioration, chronic disease and acute medical care."],
          ["Surgical nursing","Perioperative, postoperative, wound, drain, complication and recovery-focused nursing care."],
          ["Critical care nursing","High-acuity assessment, life threats, hemodynamic/respiratory instability and emergency response."],
          ["Community nursing","Population, prevention, public-health and community-based adult nursing care."],
          ["Mental/psychiatric nursing","Safety, therapeutic communication, psychiatric assessment and mental-health nursing."]
        ]
      },
      "Maternal–Child Nursing":{
        weight:(window.GULF_WEIGHTS||{}).m||"30%",
        note:"Care of child-bearing women, newborns, infants, children and adolescents across the continuum.",
        subs:[
          ["Maternity nursing","Antenatal, intrapartum, postpartum, obstetric assessment and emergency response."],
          ["Gynecology","Common gynecologic conditions, procedures, education and nursing priorities."],
          ["Neonatal nursing","Immediate newborn assessment, adaptation, feeding, safety and neonatal deterioration."],
          ["Pediatric medical","Medical conditions and clinical assessment across infancy, childhood and adolescence."],
          ["Pediatric surgical","Pre/postoperative pediatric care, complications, pain, fluids and family-centered safety."]
        ]
      },
      "Nursing Management and Leadership":{
        weight:(window.GULF_WEIGHTS||{}).l||"10%",
        note:"Frontline leadership, coordination, quality, legal/safe delivery, teams, informatics and evidence use.",
        subs:[
          ["Resources to support and coordinate patient care","Prioritization, staffing, assignment, delegation, resources and continuity of care."],
          ["Quality and safe patient care at the frontline","Quality improvement, safety systems, incident response and prevention of harm."],
          ["Nursing teams and interprofessional relations","Team leadership, communication, conflict, escalation and interprofessional collaboration."],
          ["Nursing informatics for safe and legal delivery of patient care","Documentation, confidentiality, information systems and safe/legal data use."],
          ["Research and Evidence Based Practice","Research literacy, evidence appraisal, implementation and evaluation of practice."]
        ]
      }
    };
    function guideDomainModal(){
      const d=GUIDE_DOMAIN_DETAILS[state.guideDomainInfo];
      if(!d)return "";
      return `<div class="guide-domain-overlay" data-guide-domain-overlay><section class="guide-domain-modal" role="dialog" aria-modal="true" aria-labelledby="guide-domain-title"><button class="guide-domain-close" data-guide-domain-close aria-label="Close">×</button><header><span class="eyebrow">SCFHS 2025 BLUEPRINT · OFFICIAL SUB-SECTIONS</span><div class="guide-domain-title-row"><h2 id="guide-domain-title">${esc(state.guideDomainInfo)}</h2><strong>${d.weight}</strong></div><p>${esc(d.note)}</p></header><div class="guide-domain-subgrid">${d.subs.map(function(x,i){return `<article><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div></article>`}).join("")}</div><footer><span>Official blueprint distributions may vary by up to ±5% at each level.</span><a href="https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20.pdf" target="_blank" rel="noreferrer">Open official guide ↗</a></footer></section></div>`;
    }

    function guidePanel(){
      const tab=state.guideTab||"glance";
      if(tab==="glance"){
        const facts=[["200","questions"],["100","questions / block"],["2 × 120","minutes"],["≈72 sec","average / question"],["200–800","score scale"],["500","passing score"],["30","minute break"],["≤10%","pilot items"]];
        return '<article class="guide-panel">' +
          '<span class="eyebrow">01 · OFFICIAL STRUCTURE</span>' +
          '<h2>Know the exam before training for it</h2>' +
          '<p class="guide-lead-text">The official licensing examination structure consists of <strong>200 single-best-answer MCQs</strong> delivered in two timed blocks with a scheduled midpoint recess.</p>' +
          '<div class="guide-structure-highlights">' +
            '<div class="guide-highlight-item">' +
              '<span class="highlight-badge">Questions & Format</span>' +
              '<strong>200 MCQs (4 Options)</strong>' +
              '<span>Two 100-question blocks · One best answer</span>' +
            '</div>' +
            '<div class="guide-highlight-item">' +
              '<span class="highlight-badge">Timing & Pacing</span>' +
              '<strong>120 min / block</strong>' +
              '<span>240 min total · ~72 sec average decision window</span>' +
            '</div>' +
            '<div class="guide-highlight-item">' +
              '<span class="highlight-badge">Midpoint Recess</span>' +
              '<strong>30-minute break</strong>' +
              '<span>Separates blocks · Extra time deducts from Block 2</span>' +
            '</div>' +
            '<div class="guide-highlight-item">' +
              '<span class="highlight-badge">Scoring & Standard</span>' +
              '<strong>200–800 scaled</strong>' +
              '<span>500 pass mark · Up to 10% unscored pilot items</span>' +
            '</div>' +
          '</div>' +
          '<div class="guide-facts">'+facts.map(function(x){return '<article><b>'+sevenSegment(x[0])+'</b><span>'+x[1]+'</span></article>'}).join("")+'</div>' +
          '<div class="official-note"><strong>Source boundary:</strong> Restored from the September 2025 SCFHS Applicant Guide content in the original app. Verify the current official guide before booking or testing.</div>' +
        '</article>';
      }
      if(tab==="blueprint"){
        const rows=[["Adult Nursing",40,"#4272ff"],["Maternal–Child Nursing",30,themeAccent("#2d5652")],["Nursing Fundamentals",20,themeAccent("#97d3c0")],["Management & Leadership",10,"#ffb343"]];
        return '<article class="guide-panel"><span class="eyebrow">02 · STUDY COVERAGE</span><h2>Use the blueprint without becoming trapped by percentages</h2><p>Use the blueprint to balance study time while still prioritising high-safety weaknesses and under-sampled skills.</p><div class="blueprint-list">'+rows.map(function(x){return '<div class="blueprint-row"><div><button class="blueprint-domain-link" data-guide-domain="'+x[0]+'" title="Show official sub-sections">'+x[0]+' <i>↗</i></button><span>'+x[1]+'%</span></div><div class="blueprint-track"><i style="width:'+(x[1]*2.2)+'%;background:'+x[2]+'"></i></div></div>'}).join("")+'</div></article>';
      }
      if(tab==="language"){
        const rows=[["Which action should the nurse take first?","Find the earliest safe step in sequence."],["Which finding requires immediate follow-up?","Identify the abnormal or unsafe finding."],["Which statement indicates understanding?","Select safe application of teaching."],["Which outcome best indicates effectiveness?","Choose an objective result linked to the intervention."],["Which task can be delegated?","Match stability, task, role, instructions, and follow-up."]];
        return '<article class="guide-panel"><span class="eyebrow">03 · QUESTION ANATOMY</span><h2>Read the task before comparing options</h2><p>Say the task in your own words before searching for the best option.</p><div class="language-list">'+rows.map(function(x){return '<div class="language-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>'}).join("")+'</div></article>';
      }
      if(tab==="day"){
        return examDayPlanner();
      }
      const links=[["SNLE Applicant Guide","https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20_0.pdf","Structure, scoring, blueprint, and official instructions."],["Exam dates","https://scfhs.org.sa/en/Mumares/SPLE/DATES","Periods and registration status."],["Official practice exam","https://scfhs.org.sa/en/node/2008","SCFHS practice service."],["Exam results","https://scfhs.org.sa/en/ExaminationResult","Official result service."],["SCFHS support","https://scfhs.org.sa/en/tawasul","Tickets, calls, and virtual visits."]];
      return '<article class="guide-panel"><span class="eyebrow">05 · VERIFY BEFORE ACTING</span><h2>Official destinations</h2><p>Administrative requirements can change. Use the app for learning and the regulator for current instructions.</p><div class="official-link-grid">'+links.map(function(x){return '<a href="'+x[1]+'" target="_blank" rel="noreferrer"><b>'+x[0]+' ↗</b><small>'+x[2]+'</small></a>'}).join("")+'</div></article>';
    }
    function guidePage(){if(window.GULF_GUIDE)return window.GULF_GUIDE();
      const tabs=[["glance","At a glance"],["blueprint","Blueprint"],["language","Question language"],["day","Exam-day plan"],["links","Official links"]];
      return '<div class="page-content guide-page"><section class="page-hero"><div><span class="eyebrow">OFFICIAL ORIENTATION · RESTORED</span><h1>SNLE Guide</h1><p>Understand the exam structure, blueprint, question language, exam-day strategy, scoring boundary, and official verification routes.</p></div><div class="page-badge">05 guided sections</div></section><section class="guide-score-note"><span class="guide-number">!</span><div><h3>There is no pass percentage</h3><p>SCFHS reports a scaled score from 200 to 800, with 500 as the pass mark. That number is not a percentage and cannot be compared directly with a practice percentage in this app.</p></div></section><nav class="guide-tabs">'+tabs.map(function(x){return '<button class="'+((state.guideTab||"glance")===x[0]?'active':'')+'" data-guide-tab="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</nav>'+guidePanel()+'</div>';
    }

    function activeReset(){
      return RESET_EXERCISES.find(function(x){return x.id===state.resetExercise})||RESET_EXERCISES[0];
    }
    function hypSig(hyp,band){
      const b=band||(hyp>=90?"HYP5":hyp>=80?"HYP4":hyp>=70?"HYP3":"HYP2");
      const meta={HYP5:["!","Critical","Life-safety priority"],HYP4:["▲","High","High-yield priority"],HYP3:["✦","Core","Core exam value"],HYP2:["•","Foundation","Foundation / lower-yield value"]}[b]||["✦","Core","Core exam value"];
      return '<span class="sig sig-'+b.toLowerCase()+' sig-infographic" title="'+meta[2]+' — HYP '+hyp+'"><span class="sig-pictogram">'+meta[0]+'</span><span class="sig-copy"><b>HYP '+hyp+'</b><small>'+meta[1]+'</small></span></span>';
    }
    function diffSig(d){
      const k=String(d||"Medium").toLowerCase();
      const meta={hard:["◆◆◆","Hard"],medium:["◆◆","Medium"],easy:["◆","Easy"]}[k]||["◆◆","Medium"];
      return '<span class="sig sig-'+k+' sig-infographic sig-difficulty" title="Difficulty: '+meta[1]+'"><span class="sig-pictogram sig-gauge">'+meta[0]+'</span><span class="sig-copy"><b>'+meta[1]+'</b><small>Difficulty</small></span></span>';
    }
    function resetChecklistHtml(items,prefix,visuals){
      const checks=state.resetChecks||{};
      return '<div class="reset-checklist">'+items.map(function(text,index){
        const key=prefix+"-"+index,done=Boolean(checks[key]);
        const v=visuals&&visuals[index];
        const photo=v?stepPhotoHtml(v[1],v[0]):"";
        const copy=v?'<span class="reset-step-copy"><strong>'+esc(text)+'</strong><small>'+esc(v[2])+'</small><em>'+esc(v[3])+'</em></span>':'<span>'+esc(text)+'</span>';
        return '<button class="'+(done?'done':'')+(photo?' has-photo':'')+'" data-reset-check="'+key+'"><b>'+(done?"✓":String(index+1).padStart(2,"0"))+'</b>'+photo+copy+'</button>';
      }).join("")+'</div>';
    }
    function resetStageHtml(ex){
      if(state.resetDone)return '<div class="reset-eye-wrap"><div class="reset-complete">✓ Reset complete.</div><div class="reset-live-strip"><b>What to do now</b>Name one specific next learning action out loud — a single tool, a single question, or a single domain — then return to it immediately.</div></div>';
      if(ex.id==="breathing"){
        return '<div class="box-breath-wrap"><div class="box-breathing" data-box-breath data-phase="ready"><div class="box-breath-title">BOX BREATHING <small>4 · 4 · 4 · 4</small></div><div class="box-breath-square"><div class="box-breath-line top"></div><div class="box-breath-line right"></div><div class="box-breath-line bottom"></div><div class="box-breath-line left"></div><span class="box-arrow arrow-top">→</span><span class="box-arrow arrow-right">↓</span><span class="box-arrow arrow-bottom">←</span><span class="box-arrow arrow-left">↑</span><div class="box-phase phase-inhale" data-box-phase="inhale"><b>INHALE</b><span>4 seconds</span></div><div class="box-phase phase-hold-in" data-box-phase="hold-in"><b>HOLD</b><span>4 seconds</span></div><div class="box-phase phase-exhale" data-box-phase="exhale"><b>EXHALE</b><span>4 seconds</span></div><div class="box-phase phase-hold-out" data-box-phase="hold-out"><b>HOLD</b><span>4 seconds</span></div><span class="box-breath-dot" aria-hidden="true"></span><div class="box-breath-core"><b data-reset-time>Ready</b><span data-reset-phase>Inhale · Hold · Exhale · Hold</span></div></div><p class="box-breath-help">Follow the moving cue clockwise. Keep the breath comfortable; skip the holds if they do not feel comfortable.</p></div><div class="reset-controls"><button class="primary-button" data-reset-timer="64">Start 4 cycles</button><button class="secondary-button" data-reset-timer="128">Start 8 cycles</button><button class="secondary-button" data-reset-stop>Stop</button></div></div>';
      }
      if(ex.id==="eyes"){
        return '<div class="reset-eye-wrap"><div class="reset-horizon"><span data-reset-time>20 sec</span></div><div class="reset-live-strip"><b>What to do now</b>Look at the most distant object you can see, blink naturally, and keep the eyes soft. Do not stare into bright light.</div><div class="reset-controls"><button class="primary-button" data-reset-timer="20">Start 20 sec</button><button class="secondary-button" data-reset-stop>Stop</button></div></div>';
      }
      if(ex.id==="grounding"){
        const index=Math.min(state.resetStep||0,GROUNDING_STEPS.length-1),step=GROUNDING_STEPS[index];
        return '<div class="reset-eye-wrap" style="width:min(620px,100%)"><div class="reset-orbit" style="--reset-progress:'+(index/GROUNDING_STEPS.length*360)+'deg"><div><b>'+step[0]+'</b><span>'+esc(step[1])+'</span></div></div><div class="reset-live-strip"><b>What to do now · step '+(index+1)+' of '+GROUNDING_STEPS.length+'</b>'+esc(step[2])+'</div><div class="reset-controls"><button class="primary-button" data-reset-next>'+(index===GROUNDING_STEPS.length-1?"Complete grounding":"Next sense →")+'</button><button class="secondary-button" data-reset-restart>Restart</button></div></div>';
      }
      if(ex.id==="movement")return '<div style="width:100%">'+resetChecklistHtml(MOVEMENT_STEPS,"move",MOVEMENT_VISUALS)+'<div class="reset-controls"><button class="primary-button" data-reset-complete>Complete movement reset</button></div></div>';
      if(ex.id==="premock")return '<div style="width:100%">'+resetChecklistHtml(RITUAL_STEPS,"ritual",RITUAL_VISUALS)+'<div class="reset-controls"><button class="primary-button" data-reset-complete>I am ready to start</button></div></div>';
      if(ex.id==="clarity"){
        const q=Q.find(function(item){return progress.wrongIds.indexOf(item.id)>-1})||Q[0];
        const parts=stemParts(q.stem);
        const items=["Task · "+parts.task,"Clue · "+(q.process||q.construct||q.pearl),"Framework · "+q.toolName,"Action filter · Immediate, safe, in scope, and aligned with the clue"];
        return '<div style="width:100%"><div class="reset-scenario"><b>REALISTIC SNLE-STYLE SCENARIO</b><span>'+esc(ex.example)+'</span></div>'+resetChecklistHtml(items,"clarity")+'<div class="reset-controls"><button class="primary-button" data-reset-complete>Return with one clear decision</button></div></div>';
      }
      const q=Q.find(function(item){return progress.wrongIds.indexOf(item.id)>-1});
      const items=["Label the error without judging yourself","Retrieve one missed clue"+(q?" · "+(q.process||q.construct):""),"Choose one repair action: related tool or transfer question"];
      return '<div style="width:100%"><div class="reset-scenario"><b>REALISTIC SNLE-STYLE SCENARIO</b><span>'+esc(ex.example)+'</span></div>'+resetChecklistHtml(items,"recovery")+'<div class="reset-controls"><button class="primary-button" data-reset-complete>Complete recovery reset</button></div></div>';
    }
    function resetTimingModal(){
      return '<div class="reset-timing-overlay" data-reset-timing-overlay><section class="reset-timing-modal" role="dialog" aria-modal="true" aria-labelledby="reset-timing-title"><button class="reset-timing-close" data-reset-timing-close aria-label="Close">×</button><header class="reset-timing-hero"><span class="eyebrow">EVIDENCE-INFORMED RECOVERY TIMING</span><h2 id="reset-timing-title">Pause with a purpose. Return with a decision.</h2><p>The app separates <b>study recovery</b> from the <b>official 200-question exam break</b>. Short resets are used to manage fatigue or attention—not as a promise of higher scores.</p></header><div class="reset-timing-content"><div class="reset-timing-cards"><article class="reset-time-card study"><strong>90 sec</strong><h3>Micro-break example</h3><p>A 2025 university study tested 90-second micro-breaks every 10 minutes and reported better sustained quiz performance than one longer break at 45 minutes.</p><small>Useful as a study design signal; it is not an SNLE rule and not a universal prescription.</small></article><article class="reset-time-card meta"><strong>Mixed</strong><h3>Performance evidence is not absolute</h3><p>A 2022 meta-analysis found reliable benefits for vigor/fatigue, while the overall performance effect was not statistically significant. More demanding tasks may need longer recovery.</p><small>Use symptoms of fatigue, physical tension, or attention drift to decide whether a brief reset is warranted.</small></article><article class="reset-time-card exam"><strong>100 + 100</strong><h3>Official full-length midpoint</h3><p>For the 200-question SNLE structure in the guide used by this app: 100 questions / 120 minutes → scheduled 30-minute break → 100 questions / 120 minutes.</p><small>Do not insert extra app-created break rules into the official full-length simulation.</small></article></div><section class="reset-timing-flow"><h3>How the app should prompt recovery</h3><div class="reset-timing-line"><div class="reset-timing-node"><b>Study / Tutor</b><span>Watch for attention drift, eye fatigue, racing thoughts, or shoulder/hand tension.</span></div><span class="reset-timing-arrow">→</span><div class="reset-timing-node"><b>Shortest matching reset</b><span>20 sec eyes · 45–90 sec cognitive reset · 64 sec box-breathing cycle set · brief posture change.</span></div><span class="reset-timing-arrow">→</span><div class="reset-timing-node"><b>Return to one task</b><span>Name the next question, framework, or domain before resuming.</span></div></div><div class="reset-timing-points"><div><b>Do not use a break as avoidance.</b> If you are simply uncertain about one item, use the flag-and-move rule rather than repeatedly leaving the task.</div><div><b>Safety boundary.</b> Stop an exercise that causes pain, dizziness, breathlessness, or visual discomfort and seek appropriate help when needed.</div><div><b>Full 200-question simulation.</b> The app should alert at Q100 for the scheduled 30-minute break; answers stay hidden until completion.</div><div><b>Shorter simulations.</b> Midpoint reminders are study features only. They should be clearly labeled as optional and not official SNLE timing rules.</div></div><p style="margin:14px 2px 0;color:#6c8191;font-size:10px;line-height:1.5">Evidence used in this app: Sharpe et al., Frontiers in Psychology 2025 (PMID 40851619); Albulescu et al., PLoS One 2022 (PMID 36044424); SCFHS SNLE Applicant Guide structure used by this project.</p></section></div></section></div>';
    }

    function resetPage(){
      const ctx=RESET_CONTEXTS.find(function(x){return x.id===state.resetContext})||RESET_CONTEXTS[0];
      const recommended=RESET_EXERCISES.find(function(x){return x.id===ctx.recommend})||RESET_EXERCISES[0];
      const ex=activeReset();
      return '<div class="page-content reset-page"><section class="page-hero"><div><span class="eyebrow">RESET → REFOCUS → RETURN</span><h1 class="editorial-title">Reset & Recharge</h1><p>Choose the shortest study-support exercise that matches the moment, then return to one defined learning task. These tools do not diagnose or treat a medical or mental-health condition.</p></div><div class="reset-hero-actions"><button class="reset-timing-launch compact" data-reset-timing-info title="Open evidence and reminder timing"><i>i</i><b>Evidence & timing</b></button><div class="page-badge">'+(progress.resetSessions||0)+' resets completed</div></div></section><section class="reset-context-shell"><button class="snle-focus-toggle" data-snle-focus title="Toggle fullscreen focus mode">⛶ Focus View</button><div><span class="eyebrow" style="color:var(--aqua)">WHAT IS HAPPENING RIGHT NOW?</span><h2>Match the reset to the problem</h2><p>A purposeful pause should solve the immediate attention problem, not become a way to avoid the next question.</p><div class="reset-contexts">'+RESET_CONTEXTS.map(function(x){return '<button class="'+(ctx.id===x.id?'active':'')+'" data-reset-context="'+x.id+'">'+x.label+'</button>'}).join("")+'</div></div><aside class="reset-recommendation"><span>RECOMMENDED NOW</span><strong>'+esc(recommended.title)+'</strong><small>'+esc(recommended.summary)+'</small><button data-reset-open="'+recommended.id+'">Open recommended reset →</button></aside></section><section class="reset-studio"><article class="reset-stage"><div class="reset-stage-head"><div><span class="eyebrow">INTERACTIVE RESET</span><h2>'+esc(ex.icon)+' '+esc(ex.title)+'</h2><p>'+esc(ex.summary)+'</p></div><span class="reset-duration">'+esc(ex.duration)+'</span></div><div class="reset-stage-body">'+resetStageHtml(ex)+'</div></article><aside class="reset-guide"><span class="eyebrow">WHAT · WHEN · HOW · WHY</span><h3>'+esc(ex.title)+'</h3><div class="reset-guide-grid"><article><strong>What it is</strong><span>'+esc(ex.what)+'</span></article><article><strong>When to use it</strong><span>'+esc(ex.when)+'</span></article><article><strong>How to do it safely</strong><span>'+esc(ex.how)+'</span></article><article><strong>Why it belongs in study</strong><span>'+esc(ex.why)+'</span></article></div><div class="reset-progress-note"><strong>SNLE example:</strong> '+esc(ex.example)+'</div></aside></section><div class="reset-library-heading"><span class="eyebrow">MICRO-EXERCISE LIBRARY</span><h2>Pick a reset by purpose</h2></div><section class="reset-library">'+RESET_EXERCISES.map(function(item){return '<button class="reset-card '+(item.id===ex.id?'active':'')+'" style="--reset-accent:'+themeAccent(item.accent)+'" data-reset-open="'+item.id+'"><span class="reset-card-icon">'+item.icon+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.summary)+'</p><small>'+esc(item.duration)+'</small></button>'}).join("")+'</section><section class="integrity-note"><span>✓</span><div><strong>Study-support boundary</strong><p>Stop any exercise that causes pain, dizziness, breathlessness, visual discomfort, or other concerning symptoms. Seek appropriate professional help when needed.</p></div></section></div>';
    }
    function completeReset(){
      if(state.resetDone)return;
      clearInterval(resetTimer);
      const box=document.querySelector("[data-box-breath]");if(box){box.classList.remove("running");box.dataset.phase="ready";}
      state.resetDone=true;
      progress.resetSessions=(progress.resetSessions||0)+1;
      save();
      render();
    }
    function startResetTimer(total){
      clearInterval(resetTimer);
      state.resetDone=false;
      const totalSec=Number(total)||20,startedAt=Date.now(),endAt=startedAt+totalSec*1000;
      const update=function(){
        const now=Date.now(),remainMs=Math.max(0,endAt-now),left=Math.ceil(remainMs/1000),elapsedSec=(now-startedAt)/1000;
        const time=document.querySelector("[data-reset-time]"),phase=document.querySelector("[data-reset-phase]"),orbit=document.querySelector("[data-reset-orbit]");
        if(time)time.textContent=left+" sec";
        if(phase&&activeReset().id==="breathing"){
          const part=elapsedSec%16,phaseName=part<4?"inhale":part<8?"hold-in":part<12?"exhale":"hold-out";
          phase.textContent=phaseName==="inhale"?"Inhale · 4 seconds":phaseName==="hold-in"?"Hold · 4 seconds":phaseName==="exhale"?"Exhale · 4 seconds":"Hold · 4 seconds";
          const box=document.querySelector("[data-box-breath]");
          if(box){box.classList.add("running");box.dataset.phase=phaseName;const dot=box.querySelector('.box-breath-dot');if(dot){const p=(part%16)/16;let x=18,y=18;if(p<.25){x=18+(64*(p/.25));y=18}else if(p<.5){x=82;y=18+(64*((p-.25)/.25))}else if(p<.75){x=82-(64*((p-.5)/.25));y=82}else{x=18;y=82-(64*((p-.75)/.25))}dot.style.left=x+'%';dot.style.top=y+'%'}}
          document.querySelectorAll("[data-box-phase]").forEach(function(node){node.classList.toggle("active",node.dataset.boxPhase===phaseName)});
        }
        if(orbit)orbit.style.setProperty("--reset-progress",((totalSec-left)/totalSec*360)+"deg");
        if(remainMs<=0){completeReset();return}
      };
      update();resetTimer=setInterval(update,100);
    }

        function openCoach(p,reset=false){
      if(reset||!state.coachSession.length){const ids=new Set(p.questionIds);state.coachSession=shuffle(Q.filter(q=>ids.has(q.id))).slice(0,Math.min(10,p.questionCount));state.coachIndex=0;state.coachSelected='';state.coachRevealed=false;state.coachCorrect=0;state.coachHint=false;progress.studiedPosterIds=[...new Set([...progress.studiedPosterIds,p.id])];save()}
      state.tab='practice';render();
    }
    function recordResponse(q,ok){const today=new Date().toISOString().slice(0,10),d=progress.domains[q.domain]||{answered:0,correct:0};progress={...progress,answered:progress.answered+1,correct:progress.correct+(ok?1:0),streak:progress.lastStudyDate===today?progress.streak:progress.streak+1,lastStudyDate:today,wrongIds:ok?progress.wrongIds.filter(id=>id!==q.id):[...new Set([...progress.wrongIds,q.id])],domains:{...progress.domains,[q.domain]:{answered:d.answered+1,correct:d.correct+(ok?1:0)}}};save()}
    const lensStop=new Set('about after again against also because been before being between both cannot could does doing down during each from further had has have having into itself more most other over same should some such than that their them then there these they this those through under until very what when where which while with would your patient nurse nursing best action response finding findings appropriate following indicates question tool guide framework clinical'.split(' '));
    const lensRx=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    function lensTokens(text){return (String(text||'').match(/[A-Za-z][A-Za-z'-]{2,}/g)||[]).map(x=>x.toLowerCase()).filter(x=>!lensStop.has(x)&&x.length>3)}
    function uniqueLensTerms(list,limit=18){const seen=new Set;return list.filter(x=>{if(seen.has(x))return false;seen.add(x);return true}).slice(0,limit)}
    function stemParts(stem){const s=String(stem||''),m=s.match(/\b(What|Which|How|When|Who|Where)\b[^?]*\??$/i);if(m&&m.index>20)return {context:s.slice(0,m.index).trim(),task:s.slice(m.index).trim()};return {context:s,task:'Identify the safest one-best response.'}}
    function toolTerms(q,p){const corpus=[p.title,p.job,p.boundary,p.pearl,p.trap,(p.utilityKeys||[]).join(' '),q.toolName,q.process,q.construct,q.answerText,q.rationale,q.pearl].join(' '),set=new Set(lensTokens(corpus));const visible=lensTokens(q.stem+' '+q.options.map(o=>o.text).join(' '));return uniqueLensTerms(visible.filter(t=>set.has(t)),24)}
    function clueTerms(q){const support=new Set(lensTokens([q.answerText,q.rationale,q.pearl,q.process,q.construct].join(' '))),urgent=/^(sudden|severe|new|rapid|wors|declin|absent|quiet|unresponsive|altered|exhaust|rigid|cool|pale|cyan|hypoten|tachy|brady|bleed|distress|failure|collapse|priority|immediate|increas|decreas|change|unable|stridor|retraction|obstruction)/;const visible=lensTokens(q.stem+' '+q.options.map(o=>o.text).join(' '));let hits=uniqueLensTerms(visible.filter(t=>support.has(t)||urgent.test(t)),14);if(!hits.length){const key=q.options.find(o=>o.label===q.key);hits=uniqueLensTerms(lensTokens(key?.text||q.answerText),8)}return hits}
    function markLensTerms(text,terms,cls){if(!terms.length)return esc(text);const re=new RegExp('\\b('+terms.map(lensRx).sort((a,b)=>b.length-a.length).join('|')+')\\b','gi');return esc(text).replace(re,(m)=>`<mark class="${cls} ${state.lensFocus===m.toLowerCase()?'focused':''}">${m}</mark>`)}
    function questionStemHtml(q,p,layer){if(layer==='anatomy'){const parts=stemParts(q.stem);return `<span class="anatomy-part anatomy-context" title="Clinical situation and cues">${esc(parts.context)}</span> <span class="anatomy-part anatomy-task" title="Task or command">${esc(parts.task)}</span>`}if(layer==='clues')return markLensTerms(q.stem,clueTerms(q),'lens-clue');if(layer==='alignment')return markLensTerms(q.stem,toolTerms(q,p),'lens-tool');return esc(q.stem)}
    function optionHtml(q,p,o,layer){let text=layer==='alignment'?markLensTerms(o.text,toolTerms(q,p),'lens-tool'):layer==='clues'?markLensTerms(o.text,clueTerms(q),'lens-clue'):esc(o.text);if(layer==='options'&&state.coachRevealed){const logic=o.label===q.key?'Best tool match — this option responds to the decisive cue and stays inside the framework boundary.':(q.misconceptions?.[o.label]||'Related language may appear, but this option does not best fit the decisive clue, timing, safety, or scope.');text+=`<small class="option-logic-note">${esc(logic)}</small>`}return text}
    function lensPanel(q,p,layer){if(!layer)return '';const parts=stemParts(q.stem),clues=clueTerms(q),terms=toolTerms(q,p);if(layer==='anatomy')return `<section class="question-lens-panel"><div class="lens-panel-head"><div><span>QUESTION MAP</span><strong>See how the item is constructed</strong></div><small>Blue marks the clinical situation; purple marks exactly what the learner must decide.</small></div><div class="lens-panel-body"><div class="lens-fact"><b>Clinical situation</b>${esc(parts.context)}</div><div class="lens-fact"><b>Task / command</b>${esc(parts.task)}</div><div class="lens-fact"><b>Patient + setting</b>${esc([q.population,q.setting].filter(Boolean).join(' · ')||'Not specified')}</div><div class="lens-fact"><b>Tested construct</b>${esc(q.construct||q.process||q.judgment)}</div></div></section>`;if(layer==='clues')return `<section class="question-lens-panel"><div class="lens-panel-head"><div><span>DECISIVE CLUES</span><strong>Find the cues that should change the decision</strong></div><small>Click a clue below to emphasize the same word inside the question stem.</small></div><div class="lens-panel-body"><div class="lens-coaching-warning">Coaching layer: these highlights can guide the answer. Turn it off for an independent attempt.</div><div class="lens-chip-list">${clues.length?clues.map(t=>`<button class="lens-chip ${state.lensFocus===t?'active':''}" data-lens-focus="${esc(t)}">✦ ${esc(t)}</button>`).join(''):'<span class="lens-fact">Use the change in condition, urgency, timing, and safety language as the decisive cues.</span>'}</div></div></section>`;if(layer==='alignment')return `<section class="question-lens-panel"><div class="lens-panel-head"><div><span>TOOL ALIGNMENT</span><strong>${esc(p.title)} ↔ this clinical question</strong></div><small>Teal highlights show language that connects the stem and answer choices to this tool’s reasoning job.</small></div><div class="lens-panel-body"><div class="lens-fact"><b>Tool reasoning job</b>${esc(p.job)}</div><div class="lens-fact"><b>Question construct</b>${esc(q.construct||q.process||q.judgment)}</div><div class="lens-coaching-warning">Before commitment, every tool-relevant phrase is highlighted neutrally. After commitment, the correct and selected options keep their green/coral feedback.</div><div class="lens-chip-list">${terms.map(t=>`<button class="lens-chip ${state.lensFocus===t?'active':''}" data-lens-focus="${esc(t)}">◎ ${esc(t)}</button>`).join('')}</div></div></section>`;return `<section class="question-lens-panel"><div class="lens-panel-head"><div><span>OPTION LOGIC</span><strong>Why each answer fits—or fails—the tool</strong></div><small>Available after commitment so the independent attempt is protected.</small></div><div class="lens-panel-body"><div class="lens-option-map">${q.options.map(o=>`<button class="${o.label===q.key?'key':''} ${state.lensOption===o.label?'active':''}" data-lens-option="${o.label}"><b>${o.label}</b><span>${esc(o.label===q.key?'Best tool match: '+q.answerText:(q.misconceptions?.[o.label]||'Does not best match the decisive cue or framework boundary.'))}</span></button>`).join('')}</div></div></section>`}
    function coachPanel(p){
      if(!state.coachSession.length){return `<div class="coach-launch"><div class="coach-icon">◎</div><span class="eyebrow">CONTAINED COACH PRACTICE</span><h3>${p.questionCount} aligned questions are ready</h3><p>The coached case opens here in this popup with Teaching Lens overlays, hints, feedback, transfer, and previous/next learning flow.</p><button class="primary-button" data-open-coach="${p.id}">▶ Start 10-question coached set</button></div>`}
      if(state.coachIndex>=state.coachSession.length){const pct=Math.round(state.coachCorrect/state.coachSession.length*100);return `<section class="coach-result"><span class="eyebrow">COACHED SET COMPLETE</span><h3>${pct}% · ${state.coachCorrect}/${state.coachSession.length}</h3><p>You stayed inside ${esc(p.title)}. Re-run the set or return to the decision lens.</p><div class="hero-actions"><button class="secondary-button" data-tab="learn">Decision lens</button><button class="primary-button" data-coach-restart>↻ New shuffled set</button></div></section>`}
      const q=state.coachSession[state.coachIndex],correct=state.coachSelected===q.key,layer=state.learningLayer==='options'&&!state.coachRevealed?'':state.learningLayer;
      const progressPct=((state.coachIndex+(state.coachRevealed?1:0))/state.coachSession.length)*100;
      const hint=`Look for the finding that changes urgency, safety, or sequence. The tested judgment is ${esc(q.judgment)}; focus on ${esc(q.process||q.construct||'the decisive clinical cue')}.`;
      const layers=[['anatomy','Question map'],['clues','Key clues'],['alignment','Tool match'],['options','Option logic']];
      return `<section class="coach-workspace"><div class="coach-topline"><div><span class="eyebrow">${esc(p.title)} · COACH PRACTICE</span><strong>Question ${state.coachIndex+1} of ${state.coachSession.length}</strong><small>${state.coachCorrect} correct so far · ${q.id}</small></div><div class="coach-meta"><span class="sig sig-domain">${esc(q.domain)}</span><span class="sig sig-judgment">${esc(q.judgment)}</span>${hypSig(q.hyp,q.hypBand)}${diffSig(q.difficulty)}</div><div class="coach-top-actions"><div class="coach-layer-picker"><span>Teaching lens</span>${layers.map(([id,label])=>`<button class="coach-layer-button ${layer===id?'active':''}" data-learning-layer="${id}" aria-pressed="${layer===id}" ${id==='options'&&!state.coachRevealed?'disabled title="Commit an answer first"':''}>${label}</button>`).join('')}</div><button class="flag-button ${progress.flaggedIds.includes(q.id)?'flagged':''}" data-flag="${q.id}">⚑ ${progress.flaggedIds.includes(q.id)?'Flagged':'Flag'}</button></div></div><div class="coach-progress"><span style="width:${progressPct}%"></span></div>${lensPanel(q,p,layer)}<article class="coach-question-card"><h3>${questionStemHtml(q,p,layer)}</h3><div class="coach-options">${q.options.map(o=>{const sel=state.coachSelected===o.label,ok=state.coachRevealed&&o.label===q.key,bad=state.coachRevealed&&sel&&o.label!==q.key;return `<button class="coach-option ${sel?'selected':''} ${ok?'correct':''} ${bad?'wrong':''} ${state.lensOption===o.label?'lens-option-focus':''}" data-coach-answer="${o.label}" ${state.coachRevealed?'disabled':''}><b>${o.label}</b><span>${optionHtml(q,p,o,layer)}</span><b>${ok?'✓':bad?'×':''}</b></button>`}).join('')}</div>${state.coachHint&&!state.coachRevealed?`<div class="hint-box-large"><strong>Light hint:</strong> ${hint}</div>`:''}<div class="coach-actions"><div class="action-cluster"><button class="secondary-button" data-coach-prev ${state.coachIndex===0?'disabled':''}>← Previous</button>${!state.coachRevealed?`<button class="secondary-button" data-coach-hint>${state.coachHint?'Hide hint':'Show hint'}</button>`:''}</div>${!state.coachRevealed?`<button class="primary-button" data-coach-check ${state.coachSelected?'':'disabled'}>Commit answer →</button>`:`<button class="primary-button" data-coach-next>${state.coachIndex+1===state.coachSession.length?'See result':'Next question'} →</button>`}</div></article>${state.coachRevealed?`<section class="coach-debrief"><div class="coach-debrief-head ${correct?'':'wrong'}">${correct?'✓ Correct decision':'× Not yet—repair the reasoning'}<strong>${q.key}. ${esc(q.answerText)}</strong></div><div class="coach-debrief-grid"><article><span>WHY IT WINS</span><p>${esc(q.rationale)}</p></article><article><span>CLINICAL PEARL</span><p>${esc(q.pearl)}</p></article><article><span>TRAP HUNTER</span><p>${esc(q.trap)}</p></article>${!correct&&state.coachSelected?`<article><span>YOUR DISTRACTOR</span><p>${esc(q.misconceptions[state.coachSelected]||'This option does not best match the decisive clue, timing, or safety priority.')}</p></article>`:''}<article><span>WHAT-IF TRANSFER</span><p>If the decisive cue, timing, or stability changed, pause and re-run the same framework before committing.</p></article><article><span>CLINICAL VOCABULARY</span><p>${esc([q.population,q.setting,q.construct].filter(Boolean).join(' · '))}</p></article></div></section><p class="coach-source">${esc(q.evidence)} · ${esc(q.quality)} · ${esc(q.actionRequired)}</p>`:''}</section>`;
    }
    function posterPanel(p){const marks=posterMarks(p.id);return `<div class="poster-toolbar"><div class="toolbar-group"><button data-zoom="-.15" title="Zoom out">− Zoom</button><span class="zoom-readout">${Math.round(state.zoom*100)}%</span><button data-zoom=".15" title="Zoom in">+ Zoom</button><button data-reset-zoom>↻ Reset</button></div><div class="toolbar-group"><button data-annotation-tool="edit" class="${state.annotationTool==='edit'?'active':''}">↖ Edit</button><button data-annotation-tool="highlight" class="${state.annotationTool==='highlight'?'active':''}">▰ Highlight</button><button data-annotation-tool="pen" class="${state.annotationTool==='pen'?'active':''}">✎ Pen</button><label title="Pen color"><input type="color" data-annotation-color value="${state.annotationColor}"></label></div><div class="toolbar-group"><button data-annotation-tool="note" class="${state.annotationTool==='note'?'active':''}">＋ Note</button><button data-annotation-tool="sticky" class="${state.annotationTool==='sticky'?'active':''}">▧ Sticky note</button><button class="danger" data-clear-annotations>⌫ Clear</button></div><span class="annotation-status">Auto-saved for this poster · ${marks.paths.length} marks · ${marks.notes.length} notes</span></div><div class="standalone-poster-stage"><div class="poster-canvas" data-poster-canvas data-tool="${state.annotationTool}" style="width:${state.zoom*100}%"><img loading="lazy" decoding="async" src="${p.dataUri}" alt="${esc(p.title)} poster" draggable="false"><svg class="poster-markup" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Poster annotations">${marks.paths.map((path,i)=>`<polyline data-mark="${i}" points="${path.points.map(pt=>pt.join(',')).join(' ')}" fill="none" stroke="${path.color}" stroke-width="${path.tool==='highlight'?22:4}" stroke-linecap="round" stroke-linejoin="round" opacity="${path.tool==='highlight'?.34:.96}"></polyline>`).join('')}</svg>${marks.notes.map((n,i)=>`<button class="annotation-note ${n.sticky?'sticky':''}" style="left:${n.x}%;top:${n.y}%" data-note-index="${i}" title="Click in Edit mode to change this note">${n.sticky?'<span class="note-type">Sticky note</span>':''}${esc(n.text)}</button>`).join('')}</div><div class="annotation-help">${state.annotationTool==='pen'?'Pen active: draw directly on the poster.':state.annotationTool==='highlight'?'Highlighter active: drag across the teaching point.':state.annotationTool==='note'?'Add note: click the poster where the note should appear.':state.annotationTool==='sticky'?'Sticky note: click the poster to place a teaching reminder.':'Edit mode: click an existing note to revise or delete it.'}</div></div>`}
    function modal(p){let content='';if(state.tab==='learn')content=`<div class="decision-layout"><article class="decision-primary"><span class="card-kicker">REASONING JOB</span><h3>${esc(p.job)}</h3><div class="decision-loop"><span><i>01</i>Task</span><b>→</b><span><i>02</i>Decisive clue</span><b>→</b><span><i>03</i>Commit</span><b>→</b><span><i>04</i>Reassess</span></div></article><article class="boundary-card"><span class="card-kicker">! QUICK BOUNDARY</span><p>${esc(p.boundary)}</p></article><article class="pearl-card"><span class="card-kicker">✦ CLINICAL PEARL</span><p>${esc(p.pearl)}</p></article><article class="trap-card"><span class="card-kicker">× TRAP HUNTER</span><p>${esc(p.trap)}</p></article></div>`;else if(state.tab==='poster')content=posterPanel(p);else if(state.tab==='practice')content=coachPanel(p);else if(state.tab==='evidence')content=`<div class="evidence-grid"><article><span>Poster source</span><strong>Upgraded collection · page ${p.page}</strong><p>${esc(p.selectionNote)}</p></article><article><span>Question alignment</span><strong>${p.questionCount} standardized items</strong><p>${esc(p.domains.join(' · '))}</p></article><article><span>Evidence labels</span><strong>E1–E4 retained per item</strong><p>Guideline family, established principle, local-policy dependence, or educational heuristic.</p></article><article><span>Validation boundary</span><strong>Educational decision support</strong><p>Local policy, Saudi scope, clinical escalation, and expert review remain controlling.</p></article></div>`;else content=`<div class="summary-sheet"><span class="eyebrow">FINAL SUMMARY</span><h3>${esc(p.title)}</h3><div class="summary-row"><span>Use it to</span><p>${esc(p.job)}</p></div><div class="summary-row"><span>Do not let it become</span><p>${esc(p.boundary)}</p></div><div class="summary-row"><span>Remember</span><p>${esc(p.pearl)}</p></div>${p.handoffs.length?`<div class="handoff-list"><strong>Switch tools when the job changes</strong>${p.handoffs.map(h=>`<div>→ <span><b>${esc(h.tool)}</b> — ${esc(h.trigger)}</span></div>`).join('')}</div>`:''}<button class="primary-button" data-open-coach="${p.id}">◎ Prove it here in Coach Practice</button></div>`;
      if(state.tab==='learn')content+=window.SNLEGuidance.render(p);
      const sizeOptions=[[.98,'A−'],[1.12,'A'],[1.28,'A+']];return `<div class="standalone-modal-overlay"><div role="dialog" aria-modal="true" aria-label="${esc(p.title)}" class="standalone-modal ${state.focus?'focus':''}" style="--teach-scale:${state.teachingScale}"><button class="standalone-close" data-close-modal aria-label="Close">×</button><div class="tool-dialog-header"><div class="dialog-title-row"><div><span class="eyebrow">${esc(p.groupLabel)} · HYP ${p.meanHyp}</span><h2>${state.lang==='ar'?esc(p.arabic):esc(p.title)}</h2><p>${esc(p.job)}</p></div><div class="modal-header-actions"><div class="teaching-size" aria-label="Teaching text size"><span>Teaching size</span>${sizeOptions.map(([v,label])=>`<button data-teaching-size="${v}" class="${Math.abs(state.teachingScale-v)<.02?'active':''}">${label}</button>`).join('')}</div><button class="focus-button" data-focus>${state.focus?'▣ Exit focus':'□ Focus'}</button></div></div></div><div class="standalone-tabbar">${[['learn','Decision lens'],['poster','Poster + annotate'],['practice','Coach practice'],['evidence','Evidence & scope'],['summary','Summary']].map(([id,label])=>`<button data-tab="${id}" class="${state.tab===id?'active':''}">${label}</button>`).join('')}</div><div class="standalone-tabcontent ${state.tab==='poster'?'poster-tab':''}">${content}</div></div></div>`}

    function start(mode,count,poster){let chosen=[],title='';const examMode=mode==='mock-exam';if(mode==='mock-hub'){state.view='practice';state.session=[];state.examSimulation=false;render();return}if(mode==='hub'){state.view='practice';state.session=[];state.examSimulation=false;render();return}if(mode==='quick'){chosen=shuffle(Q.filter(q=>q.hyp>=80)).slice(0,count);title='Start Check · high-yield mixed decisions'}else if(mode==='mixed'){chosen=shuffle(Q).slice(0,count);title=count+'-question mixed coach'}else if(mode==='high-yield'){chosen=shuffle(Q.filter(q=>q.hyp>=85)).slice(0,count);title=count+'-question high-yield sprint'}else if(mode==='mock'||examMode){chosen=mock(count);title=(examMode?'SNLE exam simulation · ':'SNLE blueprint tutor mock · ')+count+' questions'}else if(mode==='mistakes'){const ids=new Set(progress.wrongIds);chosen=shuffle(Q.filter(q=>ids.has(q.id)));title='Fix Mistakes · targeted recovery'}else if(mode==='tool'){const ids=new Set(poster.questionIds);chosen=shuffle(Q.filter(q=>ids.has(q.id))).slice(0,Math.min(10,poster.questionCount));title=poster.title+' · coached practice';progress.studiedPosterIds=[...new Set([...progress.studiedPosterIds,poster.id])];save()}const sectionMs=examMode?Math.round(count*.6)*60*1000:0;state={...state,view:'practice',poster:null,session:chosen,sessionTitle:title,index:0,selected:'',revealed:false,sessionCorrect:0,examSimulation:examMode,examSection:1,examSectionEndsAt:examMode?Date.now()+sectionMs:0,examBreak:false,examBreakEndsAt:0,tutorBreak:false,examAnswers:[],sessionAnswers:[]};render();scrollTo(0,0)}
        function check(){const q=state.session[state.index];if(!state.selected||state.revealed)return;const ok=state.selected===q.key;if(ok)state.sessionCorrect++;state.sessionAnswers=(state.sessionAnswers||[]).filter(function(x){return x.id!==q.id});state.sessionAnswers.push({id:q.id,answer:state.selected,correct:ok});const today=new Date().toISOString().slice(0,10),d=progress.domains[q.domain]||{answered:0,correct:0};progress={...progress,answered:progress.answered+1,correct:progress.correct+(ok?1:0),streak:progress.lastStudyDate===today?progress.streak:progress.streak+1,lastStudyDate:today,wrongIds:ok?progress.wrongIds.filter(id=>id!==q.id):[...new Set([...progress.wrongIds,q.id])],domains:{...progress.domains,[q.domain]:{answered:d.answered+1,correct:d.correct+(ok?1:0)}}};save();state.revealed=true;render()}


    const ARABIC_HOVER_TERMS={"Stem": "نص السؤال وسياق الحالة", "Lead-in": "صيغة المطلوب في نهاية السؤال", "Clue": "قرينة سريرية", "Key clue": "القرينة الحاسمة", "Distractor": "خيار مُشتِّت", "Rationale": "تفسير الإجابة", "Discriminator": "علامة فارقة", "Priority": "الأولوية", "First": "أول إجراء", "Immediate": "فوري / دون تأخير", "Best": "الأفضل / الأنسب", "Requires follow-up": "يتطلب متابعة", "Indicates understanding": "يدل على الفهم الصحيح", "Needs further teaching": "يحتاج إلى مزيد من التثقيف", "Best indicates improvement": "أفضل مؤشر على التحسن", "Question the order": "الاعتراض على أمر طبي غير آمن للمريض", "Stable": "مستقر", "Unstable": "غير مستقر", "Assess before acting": "قيِّم الحالة قبل التدخل", "Act before assessing": "تدخّل أولًا عند وجود خطر فوري", "Reassessment": "إعادة التقييم", "Evaluation": "تقييم النتيجة أو الاستجابة", "Delegation": "التفويض", "Scope of practice": "نطاق الممارسة المهنية", "Standard precautions": "الاحتياطات القياسية", "Contact precautions": "احتياطات التلامس", "Droplet precautions": "احتياطات الرذاذ", "Airborne precautions": "احتياطات الانتقال الهوائي", "ABCDE": "مجرى الهواء، التنفس، الدورة الدموية، الوعي، الكشف", "ADPIE": "التقييم، التشخيص، التخطيط، التنفيذ، التقويم", "SBAR / ISBAR": "التواصل المنظم SBAR / ISBAR", "I-PASS": "شدة المرض، الملخص، الإجراءات، الوعي بالموقف، إعادة الاستقبال", "AVPU": "يقظ، يستجيب للصوت، للألم، غير مستجيب", "GCS": "مقياس غلاسكو للغيبوبة", "OPQRST": "بداية العرض، المحفزات، الوصف، المكان، الشدة، الزمن", "SAMPLE": "الأعراض، الحساسية، الأدوية، التاريخ، آخر تناول، الأحداث", "BE-FAST": "التوازن، العينان، الوجه، الذراع، الكلام، الوقت", "RACE": "الإنقاذ، الإنذار، الاحتواء، الإطفاء أو الإخلاء", "PASS": "اسحب المسمار، وجّه، اضغط، حرّك", "APGAR": "المظهر، النبض، الاستجابة، التوتر العضلي، التنفس", "VEAL–CHOP": "ربط أنماط نبض الجنين بأسبابها الشائعة", "Four Ts": "انقباض الرحم، الرضوض، الأنسجة، التخثر", "Teach-back": "التحقق من الفهم بإعادة الشرح", "PPE": "معدات الوقاية الشخصية", "MAR": "سجل إعطاء الدواء", "PRN": "عند الحاجة", "NPO": "ممنوع تناول شيء عن طريق الفم", "I&O": "المدخول والإخراج", "SpO₂": "تشبع الأكسجين", "ABG": "غازات الدم الشريانية", "DKA": "الحماض الكيتوني السكري", "SIADH": "متلازمة الإفراز غير الملائم للهرمون المضاد لإدرار البول", "DVT": "الخثار الوريدي العميق", "PE": "الانصمام الرئوي", "Confidence rating": "تقييم الثقة", "Confident error": "خطأ مع ثقة عالية", "Worked example": "مثال محلول", "Guided reasoning": "استدلال موجّه", "Spaced review": "مراجعة متباعدة", "Interleaving": "مزج الموضوعات في التدريب", "Pilot question": "سؤال تجريبي غير محسوب", "Blueprint": "مخطط توزيع الاختبار", "ABCDE First-Look & Action Guide": "دليل ABCDE للتقييم والتدخل الأولي", "ABG Stepwise Interpreter": "المفسر المتدرج لغازات الدم الشرياني", "ADPIE Framework": "إطار العملية التمريضية ADPIE", "APGAR Newborn Assessment Guide": "دليل تقييم حديث الولادة APGAR", "AVPU Clinical Decision Guide": "دليل القرار السريري AVPU", "Actual Before Potential": "المشكلة الفعلية قبل المحتملة", "Acute Before Chronic": "الحاد قبل المزمن", "Assess Before Acting": "قيّم قبل أن تتدخل", "BE-FAST Stroke Recognition": "التعرف السريع على السكتة BE-FAST", "Blood & Blood Products Safety": "سلامة الدم ومشتقاته", "CAB First-Look & Action Guide": "دليل CAB للإنعاش القلبي", "CUS Clinical Decision Guide": "دليل التصعيد الآمن CUS", "Closed-Loop Communication": "التواصل ذو الحلقة المغلقة", "Core Laboratory Pattern Atlas": "أطلس أنماط التحاليل الأساسية", "Critical Lab & Electrolyte Prioritizer": "ترتيب أولوية التحاليل الحرجة والكهارل", "Deterioration & First-Action Coach": "مدرب التدهور وأول تدخل", "Difference / Contrast Decision Lab": "مختبر الفروق والمقارنة", "ECG & Lethal Rhythm Rapid Reader": "القارئ السريع لتخطيط القلب والنظم المميتة", "Emergency Exception": "استثناء الطوارئ", "Fall Prevention & Post-Fall Response": "الوقاية من السقوط والاستجابة بعده", "Fetal Monitoring & Obstetric Emergency": "مراقبة الجنين وطوارئ الولادة", "Five Rights of Delegation": "الحقوق الخمسة للتفويض", "Four Ts of Postpartum Hemorrhage": "الأسباب الأربعة لنزف ما بعد الولادة", "Glasgow Coma Scale": "مقياس غلاسكو للغيبوبة", "Glycemia & Diabetes Acute Safety": "سلامة سكر الدم والسكري الحاد", "I-PASS Handoff": "تسليم الرعاية باستخدام I-PASS", "IV Fluid Types & Selection": "أنواع السوائل الوريدية واختيارها", "IV Therapy & Fluid Balance": "العلاج الوريدي وتوازن السوائل", "Infection Control Selector": "محدد مكافحة العدوى", "Infusion Pump Safety": "سلامة مضخة التسريب", "Isolation Precautions": "احتياطات العزل", "Leadership & Management Decision Matrix": "مصفوفة قرارات القيادة والإدارة", "Least Restrictive & Least Invasive": "الأقل تقييداً والأقل تدخلاً", "Maslow Clinical Priority Guide": "دليل ماسلو للأولوية السريرية", "Medication Math Lab - Foundations": "مختبر حسابات الدواء - الأساسيات", "Medication Math Lab - Advanced": "مختبر حسابات الدواء - المتقدم", "Medication Administration Safety Checks": "فحوص سلامة إعطاء الدواء", "NG / Enteral Tube Safety": "سلامة الأنبوب الأنفي المعدي والتغذية المعوية", "Chain of Command": "التسلسل الإداري للتصعيد", "Scope-of-Practice Filter": "مرشح نطاق الممارسة", "OPQRST Pain Assessment": "تقييم الألم باستخدام OPQRST", "Oxygenation, Oxygen Therapy & Suctioning": "الأكسجة والعلاج بالأكسجين والشفط", "Patient Safety Event & Sentinel Event": "حدث سلامة المريض والحدث الجسيم", "Pediatric & Newborn Rapid Pattern Atlas": "أطلس الأنماط السريعة للأطفال وحديثي الولادة", "Pediatric Assessment Triangle": "مثلث تقييم الطفل", "Peripheral vs Central Vascular Access Decision Lab": "مختبر قرار الوصول الوعائي الطرفي مقابل المركزي", "Post-Op Complication Lab": "مختبر مضاعفات ما بعد الجراحة", "Professional Practice & Legal Decision Coach": "مدرب الممارسة المهنية والقرار القانوني", "Psychiatric Nursing Decision & Safety Guide": "دليل القرار والسلامة في التمريض النفسي", "RACE & PASS Fire Safety": "سلامة الحريق RACE وPASS", "Research & EBP Quick Filter": "مرشح البحث والممارسة المبنية على الدليل", "SAMPLE Emergency History": "التاريخ الإسعافي SAMPLE", "Safety First": "السلامة أولاً", "Special Medications, Diseases & Laboratory Considerations": "اعتبارات الأدوية الخاصة والأمراض والتحاليل", "Suicide & Psychiatric Safety Algorithm": "خوارزمية سلامة الانتحار والطب النفسي", "Teach-Back": "التحقق من الفهم بإعادة الشرح", "Therapeutic Communication Simulator": "محاكي التواصل العلاجي", "Tracheostomy Emergency & Care": "طوارئ ورعاية فغر الرغامى", "Tubes / Drains Troubleshooter": "دليل استكشاف مشكلات الأنابيب والمصارف", "Two Patient Identifiers": "معرّفان معتمدان للمريض", "Unexpected Before Expected": "غير المتوقع قبل المتوقع", "Unstable Before Stable": "غير المستقر قبل المستقر", "Urinary Catheter & CAUTI Safety": "سلامة القسطرة البولية والوقاية من CAUTI", "VEAL-CHOP Fetal Heart Rate Memory Guide": "دليل VEAL-CHOP لذاكرة نبض الجنين", "WHO 5 Moments for Hand Hygiene": "لحظات منظمة الصحة العالمية الخمس لنظافة اليدين", "Wound & Pressure Injury Decision Lab": "مختبر قرار الجروح وإصابات الضغط", "Today": "اليوم / نظرة عامة", "Overview": "نظرة عامة شاملة", "SNLE Guide": "دليل اختبار الهيئة SNLE", "Searchable Glossary": "قاموس المصطلحات القابل للبحث", "Glossary": "قاموس المصطلحات التمريضية", "React & Interact": "التفاعل والتدريب السريري", "Practice Hub": "مركز التدريب والتمارين", "Reset & Recharge": "استعادة النشاط والتوازن الذهني", "Scientific Committee": "اللجنة العلمية", "Learning Journey": "رحلة التعلّم", "Course Library": "مكتبة الدورة", "Clinical Tool Library": "مكتبة الأدوات السريرية", "Complete Question Bank": "بنك الأسئلة الكامل", "Decision lens": "عدسة القرار", "Poster + annotate": "الملصق + التعليق", "Coach practice": "التدريب الموجّه", "Evidence & scope": "الدليل والنطاق", "Summary": "الملخص", "Teaching lens": "عدسة التعليم", "Question map": "خريطة السؤال", "Key clues": "القرائن الحاسمة", "Tool match": "مطابقة الأداة", "Option logic": "منطق الخيارات", "Flag": "وضع علامة", "Focus": "وضع التركيز", "Clinical decision tools": "أدوات القرار السريري", "Clinical decision": "القرار السريري", "Clinical reasoning": "الاستدلال السريري", "Clinical judgment": "الحكم السريري", "clinical-judgment function": "وظيفة الحكم السريري", "Clinical Pearl": "لؤلؤة سريرية", "Trap Hunter": "كاشف الفخاخ", "Quick Boundary": "الحد السريري السريع", "Quick Boundary Rule": "قاعدة الحد السريري السريع", "Question Bank": "بنك الأسئلة", "Question stem": "نص السؤال", "Answer options": "خيارات الإجابة", "Correct answer": "الإجابة الصحيحة", "Reveal correct answer": "إظهار الإجابة الصحيحة", "Difficulty": "مستوى الصعوبة", "Easy": "سهل", "Medium": "متوسط", "Hard": "صعب", "Critical": "حرج", "High": "مرتفع", "Core": "أساسي", "Foundation": "تأسيسي", "High-Yield": "عالي العائد", "High Yield": "عالي العائد", "HYP": "أولوية عالية العائد", "SCFHS domain": "مجال الهيئة السعودية للتخصصات الصحية", "Domain": "المجال", "Subdomain": "المجال الفرعي", "Population": "الفئة السكانية", "Setting": "بيئة الرعاية", "Tested construct": "المهارة المقاسة", "Evidence status": "حالة الدليل", "Item quality": "جودة السؤال", "Action required": "الإجراء المطلوب", "Mock Exam": "اختبار تجريبي", "SNLE mock exam": "اختبار SNLE التجريبي", "Tutor Mock": "اختبار تدريبي موجّه", "Exam Simulation": "محاكاة الاختبار", "Question count": "عدد الأسئلة", "Midpoint": "منتصف الاختبار", "Break reminder": "تذكير بالاستراحة", "scheduled break": "الاستراحة المجدولة", "Evidence & timing": "الدليل والتوقيت", "Retrieval practice": "ممارسة الاسترجاع", "Spaced repetition": "التكرار المتباعد", "Spaced practice": "الممارسة المتباعدة", "Elaborated feedback": "تغذية راجعة تفسيرية", "Error analysis": "تحليل الأخطاء", "Active recall": "الاستدعاء النشط", "Practice questions": "أسئلة تدريبية", "Transfer": "نقل التعلّم إلى سياق جديد", "Debrief": "مراجعة ما بعد الأداء", "Revisit": "إعادة المراجعة", "Pilot items": "أسئلة تجريبية", "Passing score": "درجة النجاح", "Score scale": "مقياس الدرجات", "Question anatomy": "بنية السؤال", "Lead-in language": "لغة صيغة المطلوب", "Safety & scope": "السلامة ونطاق الممارسة", "Frameworks & abbreviations": "الأطر والاختصارات", "Learning & exam": "التعلّم والاختبار", "Open teaching case": "فتح الحالة التعليمية", "Show stem": "إظهار نص السؤال", "Show lead-in": "إظهار صيغة المطلوب", "Show clue": "إظهار القرينة", "Show key": "إظهار المفتاح", "Show distractors": "إظهار المشتتات", "Show rationale": "إظهار التفسير", "Show discriminator": "إظهار العلامة الفارقة", "Show all": "إظهار الكل", "Clear": "مسح", "Why this matters": "لماذا هذا مهم", "Exam-day plan": "خطة يوم الاختبار", "1 month before": "قبل شهر", "2 weeks before": "قبل أسبوعين", "2 days before": "قبل يومين", "1 day before": "قبل يوم واحد", "Exam day": "يوم الاختبار", "Pacing discipline": "الالتزام بإدارة الوقت", "flag-and-move rule": "قاعدة ضع علامة وانتقل", "patient safety": "سلامة المريض", "evidence-based practice": "الممارسة المبنية على الدليل", "EBP": "الممارسة المبنية على الدليل", "scope of practice": "نطاق الممارسة المهنية", "Nursing Fundamentals": "أساسيات التمريض", "Adult Nursing": "تمريض البالغين", "Maternal-Child Nursing": "تمريض الأم والطفل", "Nursing Management and Leadership": "إدارة وقيادة التمريض", "Psychiatric Nursing": "التمريض النفسي", "Community Nursing": "تمريض صحة المجتمع", "Pediatric Nursing": "تمريض الأطفال", "Medical-surgical unit": "وحدة طبية جراحية", "medical-surgical": "طبي جراحي", "Emergency department": "قسم الطوارئ", "Intensive care unit": "وحدة العناية المركزة", "ICU": "وحدة العناية المركزة", "High-dependency unit": "وحدة رعاية عالية الاعتماد", "Operating room": "غرفة العمليات", "Post-anesthesia care unit": "وحدة رعاية ما بعد التخدير", "PACU": "وحدة رعاية ما بعد التخدير", "Antenatal": "ما قبل الولادة", "Postpartum": "ما بعد الولادة", "Newborn": "حديث الولادة", "Neonate": "وليد حديث", "Pediatric": "طب الأطفال", "Older adult": "كبير السن", "Registered nurse": "ممرض/ممرضة مسجل", "RN": "ممرض/ممرضة مسجل", "charge nurse": "الممرض المسؤول", "provider": "مقدم الرعاية الصحية", "patient": "المريض", "caregiver": "مقدم الرعاية", "Airway": "مجرى الهواء", "Breathing": "التنفس", "Circulation": "الدورة الدموية", "Disability": "الوعي/العجز العصبي", "Exposure": "الكشف والفحص الكامل", "assessment": "التقييم", "reassessment": "إعادة التقييم", "evaluation": "تقييم الاستجابة", "intervention": "التدخل", "escalation": "التصعيد", "priority": "الأولوية", "safety": "السلامة", "baseline": "خط الأساس", "acute": "حاد", "chronic": "مزمن", "actual": "فعلي", "potential": "محتمل", "expected": "متوقع", "unexpected": "غير متوقع", "stable": "مستقر", "unstable": "غير مستقر", "deterioration": "تدهور سريري", "vital signs": "العلامات الحيوية", "level of consciousness": "مستوى الوعي", "mental status": "الحالة العقلية", "pain assessment": "تقييم الألم", "oxygenation": "الأكسجة", "perfusion": "التروية", "hemodynamic": "ديناميكا الدم", "hemodynamics": "ديناميكا الدم", "fluid balance": "توازن السوائل", "intake and output": "المدخول والإخراج", "respiratory distress": "ضائقة تنفسية", "airway obstruction": "انسداد مجرى الهواء", "upper-airway obstruction": "انسداد مجرى الهواء العلوي", "hypoxia": "نقص الأكسجة", "hypoxemia": "نقص أكسجين الدم", "cyanosis": "الزرقة", "stridor": "صرير تنفسي", "wheezing": "أزيز", "retractions": "تراجعات تنفسية", "apnea": "انقطاع التنفس", "dyspnea": "ضيق التنفس", "respiratory rate": "معدل التنفس", "oxygen therapy": "العلاج بالأكسجين", "suctioning": "الشفط", "tracheostomy": "فغر الرغامى", "endotracheal tube": "أنبوب داخل الرغامى", "mechanical ventilation": "التهوية الميكانيكية", "ventilator": "جهاز التنفس الصناعي", "pneumonia": "التهاب رئوي", "pneumothorax": "استرواح الصدر", "asthma": "الربو", "COPD": "مرض الانسداد الرئوي المزمن", "PaO₂": "الضغط الجزئي للأكسجين الشرياني", "PaCO₂": "الضغط الجزئي لثاني أكسيد الكربون الشرياني", "HCO₃": "البيكربونات", "cardiac arrest": "توقف القلب", "cardiopulmonary arrest": "توقف القلب والتنفس", "CPR": "الإنعاش القلبي الرئوي", "AED": "جهاز مزيل الرجفان الخارجي الآلي", "shock": "الصدمة", "hypotension": "انخفاض ضغط الدم", "hypertension": "ارتفاع ضغط الدم", "tachycardia": "تسرع القلب", "bradycardia": "بطء القلب", "chest pain": "ألم الصدر", "myocardial infarction": "احتشاء عضلة القلب", "heart failure": "فشل القلب", "atrial fibrillation": "الرجفان الأذيني", "ventricular tachycardia": "تسرع القلب البطيني", "ventricular fibrillation": "الرجفان البطيني", "asystole": "توقف النشاط الكهربائي للقلب", "ECG": "تخطيط كهربائية القلب", "pulse": "النبض", "peripheral pulse": "النبض الطرفي", "stroke": "السكتة الدماغية", "seizure": "نوبة تشنجية", "pupil": "حدقة العين", "neurologic": "عصبي", "neurological": "عصبي", "confusion": "ارتباك", "delirium": "هذيان", "unresponsive": "غير مستجيب", "infection": "عدوى", "sepsis": "إنتان", "septic shock": "صدمة إنتانية", "isolation": "العزل", "hand hygiene": "نظافة اليدين", "standard precautions": "الاحتياطات القياسية", "contact precautions": "احتياطات التلامس", "droplet precautions": "احتياطات الرذاذ", "airborne precautions": "احتياطات الانتقال الهوائي", "sterile technique": "تقنية معقمة", "sentinel event": "حدث جسيم", "fall prevention": "الوقاية من السقوط", "pressure injury": "إصابة الضغط", "wound care": "العناية بالجروح", "IV": "وريدي", "intravenous": "عن طريق الوريد", "peripheral IV": "قسطرة وريدية طرفية", "central line": "قسطرة وريدية مركزية", "central venous catheter": "قسطرة وريدية مركزية", "vascular access": "الوصول الوعائي", "infusion pump": "مضخة التسريب", "infiltration": "ارتشاح وريدي", "extravasation": "تسرب دواء خارج الوريد", "phlebitis": "التهاب الوريد", "blood transfusion": "نقل الدم", "blood products": "مشتقات الدم", "transfusion reaction": "تفاعل نقل الدم", "urinary catheter": "قسطرة بولية", "CAUTI": "عدوى المسالك البولية المرتبطة بالقسطرة", "nasogastric tube": "أنبوب أنفي معدي", "NG tube": "أنبوب أنفي معدي", "enteral feeding": "تغذية معوية", "drain": "مصرف جراحي", "chest tube": "أنبوب صدري", "diabetes mellitus": "داء السكري", "diabetes": "السكري", "hypoglycemia": "نقص سكر الدم", "hyperglycemia": "ارتفاع سكر الدم", "glucose": "الجلوكوز", "insulin": "الإنسولين", "sodium": "الصوديوم", "potassium": "البوتاسيوم", "calcium": "الكالسيوم", "magnesium": "المغنيسيوم", "creatinine": "الكرياتينين", "BUN": "نيتروجين يوريا الدم", "hemoglobin": "الهيموغلوبين", "platelet": "الصفائح الدموية", "platelets": "الصفائح الدموية", "INR": "النسبة المعيارية الدولية للتخثر", "aPTT": "زمن الثرومبوبلاستين الجزئي المنشط", "troponin": "التروبونين", "electrolytes": "الكهارل", "laboratory": "التحاليل المخبرية", "critical lab": "تحليل مخبري حرج", "deep vein thrombosis": "الخثار الوريدي العميق", "pulmonary embolism": "الانصمام الرئوي", "medication": "دواء", "medications": "أدوية", "medication administration": "إعطاء الدواء", "dose": "الجرعة", "route": "طريق الإعطاء", "allergy": "حساسية", "allergies": "حساسيات", "opioid": "دواء أفيوني", "opioids": "أدوية أفيونية", "naloxone": "نالوكسون", "warfarin": "وارفارين", "heparin": "هيبارين", "digoxin": "ديجوكسين", "furosemide": "فوروسيميد", "anticoagulant": "مضاد التخثر", "anticoagulation": "مضادات التخثر", "fetal heart rate": "معدل نبض قلب الجنين", "fetal monitoring": "مراقبة الجنين", "deceleration": "تباطؤ نبض الجنين", "variability": "تذبذب نبض الجنين", "contraction": "انقباض رحمي", "preeclampsia": "ما قبل تسمم الحمل", "eclampsia": "تسمم الحمل", "postpartum hemorrhage": "نزف ما بعد الولادة", "PPH": "نزف ما بعد الولادة", "uterine atony": "وهن الرحم", "placenta previa": "المشيمة المنزاحة", "placental abruption": "انفصال المشيمة", "newborn assessment": "تقييم حديث الولادة", "Apgar score": "درجة أبغار", "suicide": "الانتحار", "suicidal ideation": "أفكار انتحارية", "self-harm": "إيذاء النفس", "depression": "الاكتئاب", "anxiety": "القلق", "psychosis": "الذهان", "therapeutic communication": "التواصل العلاجي", "closed-loop communication": "التواصل ذو الحلقة المغلقة", "teach-back": "التحقق من الفهم بإعادة الشرح", "handoff": "تسليم الرعاية", "chain of command": "التسلسل الإداري للتصعيد", "delegation": "التفويض", "procedure": "إجراء", "procedures": "إجراءات", "diagnosis": "تشخيص", "disease": "مرض", "diseases": "أمراض", "postoperative": "ما بعد الجراحة", "preoperative": "ما قبل الجراحة", "legal": "قانوني", "informed consent": "الموافقة المستنيرة", "confidentiality": "السرية", "two patient identifiers": "معرّفان للمريض", "patient identifiers": "معرّفات المريض", "Pearl": "درّة سريرية / فائدة جوهرية", "Clinical pearl": "درّة سريرية حاسمة", "Trap": "فخ اختباري شائع", "Common trap": "فخ اختباري شائع", "Scenario": "سيناريو سريري", "Case scenario": "سيناريو الحالة السريرية", "Options": "خيارات الإجابة", "Context": "سياق الحالة والبيئة السريرية", "Vital signs": "العلامات الحيوية", "Assessment": "التقييم السريري الشامل", "Intervention": "التدخل التمريضي", "Hypoxemia": "نقص تأكسج الدم", "Accessory muscles": "عضلات التنفس المساعدة (دليل إجهاد تنفسي)", "Analgesic": "مُسكّن ألم", "Golden rule": "القاعدة الذهبية", "Tachypnea": "تسرع التنفس (>20 نَفَس/دقيقة)", "Restlessness": "تململ وقلق حركي (علامة نقص أكسجة مبكرة)", "Postoperative": "بعد العملية الجراحية", "Accessory muscle": "عضلة تنفسية مساعدة", "Decisive clue": "القرينة الحاسمة المؤكدة", "Distractors": "الخيارات المُشتِّتة", "Clinical Dossier": "الملف السريري التخصصي", "My Progress": "متابعة تقدمي وإحصاءاتي", "Interactive Labs": "المختبرات التفاعلية لتحليل الأسئلة", "Question Blueprint": "مخطط تشريح وهيكل السؤال", "Stem Types": "أنماط نص السؤال وسياقاته", "Scenario Structures": "هياكل وبناء السيناريوهات السريرية", "Clue Atlas": "أطلس القرائن والعلامات الحاسمة", "Lead-in Decoder": "مفكك صيغة المطلوب والأسئلة", "Clinical Judgment Map": "خريطة الحكم واتخاذ القرار السريري", "Distractor Psychology": "سيكولوجية وهندسة الخيارات المُشتِّتة", "How the Correct Answer Wins": "معايير تفوق الإجابة الصحيحة", "Decoding Workflow": "منهجية وخطوات التفكيك الممنهج", "Learning regions": "المناطق والمحاور التعليمية", "Anatomy of a Question": "تشريح أجزاء السؤال السريري", "Interactive Infographic": "رسم توضيحي تفاعلي", "Read actively": "اقرأ بتركيز وتفاعل نشط", "Read in this order": "اقرأ بهذا الترتيب المنهجي", "Identify the patient": "حدّد فئة المريض وبيئته السريرية", "Find the decisive clue": "استخرج القرينة السريرية الحاسمة", "Decode the lead-in": "فكك صيغة المطلوب وحدد نوع الإجراء", "Look for changes": "ابحث عن التغيرات والحدود القصوى والأولويات", "Common errors": "الأخطاء الشائعة وفخاخ التشتيت", "Why this lab matters": "لماذا يُعد هذا المختبر جوهرياً؟", "Micro-lab": "تمرين تدريبي مُركَّز", "Key terms": "المصطلحات المفتاحية الهامة", "How it works": "كيف تعمل هذه المنظومة التفاعلية", "Coach": "المدرب السريري الموجّه", "Exam": "وضع الاختبار والتقييم", "Reset": "إعادة ضبط المحاولة", "First-attempt accuracy": "دقة الإجابة من المحاولة الأولى", "Exercises mastered": "التمارين المتقنة بالكامل", "Short of breath": "ضيق في التنفس / عسر تنفس", "Shortness of breath": "ضيق وصعوبة في التنفس", "Restless": "متململ / قلق حركي (علامة نقص أكسجة مبكرة)", "Dyspnea": "عسر وصعوبة التنفس", "Bradypnea": "بطء معدل التنفس (<12 نَفَس/دقيقة)", "Tachycardia": "تسارع ضربات القلب (>100 نبضة/دقيقة)", "Bradycardia": "تباطؤ ضربات القلب (<60 نبضة/دقيقة)", "Cyanosis": "ازرقاق الجلد والأغشية (علامة نقص أكسجة متأخرة)", "Pallor": "شحوب لون الجلد (فقر دم أو نقص تروية)", "Diaphoresis": "تعرق غزير مفرط (صدمة، ألم حاد، أو نقص سكر)", "Diaphoretic": "متعرق بغزارة", "Crackles": "فرقعة / خرخرة رئوية (احتباس سوائل أو ذات رئة)", "Wheezing": "أزيز / صفير تنفسي (تضيق القصبات الهوائية)", "Wheezes": "أصوات صفير تنفسية", "Stridor": "صرير تنفسي حاد (انسداد طارئ بمجرى الهواء العلوي)", "Hypotension": "انخفاض ضغط الدم (صدمة أو نزف حاد)", "Hypertension": "ارتفاع ضغط الدم", "Orthostatic hypotension": "هبوط الضغط الانتصابي عند الوقوف", "Edema": "وذمة / تورم ناتج عن احتباس السوائل", "Pitting edema": "وذمة منطبعة (تترك انطباعاً عند الضغط)", "Chest pain": "ألم صدري (يستوجب استبعاد احتشاء القلب فوراً)", "Oliguria": "شح وقلة البول (<400 مل/يوم أو <0.5 مل/كغ/ساعة)", "Anuria": "انقطاع البول التام (<100 مل/يوم)", "Polyuria": "كثرة / إفراط إدرار البول", "Jaundice": "يرقان (اصفرار الجلد والصلبة نتيجة ارتفاع البيليروبين)", "Petechiae": "حبرات دموية نقطية تحت الجلد (نقص صفائح)", "Purpura": "فرفرية (بقع دموية نزفية واسعة تحت الجلد)", "Ecchymosis": "كدمة دموية واسعة تحت الجلد", "Confusion": "تشوش ذهني وارتباك (علامة نقص أكسجة أو إنتان)", "Lethargy": "خمول ونعاس مرضي وتبلد استجابة", "Lethargic": "خامل ومتبلد الاستجابة", "Altered mental status": "تغير واضطراب الحالة العقلية والوعي", "Seizure": "نوبة تشنجية صرعية حادة", "Seizures": "نوبات تشنجية", "Tremor": "رعاش / ارتعاش لا إرادي", "Tremors": "ارتجاف ورعاش لا إرادي في الأطراف", "Fever": "حمى / ارتفاع حرارة الجسم", "Febrile": "محموم / مصاب بالحمى", "Afebrile": "طبيعي الحرارة / غير محموم", "Hypothermia": "انخفاض حرارة الجسم الشديد (<35 مئوية)", "Nausea": "غثيان", "Vomiting": "قيء / استرجاع", "Abdominal distension": "انتفاخ وتمدد تجويف البطن", "Rigidity": "صلابة وتخشب جدار البطن (التهاب صفاق طارئ)", "Rebound tenderness": "مضض ارتدادي (ألم شديد عند رفع اليد فجأة)", "Hemoptysis": "نفث وبصاق الدم من الرئتين", "Hematemesis": "قيء مدمم", "Melena": "براز أسود قطراني (نزف هضمي علوي)", "Hematochezia": "خروج دم أحمر قاني مع البراز", "Hematuria": "وجود دم في البول", "Dysuria": "عسر وحرقة عند التبول", "Urinary retention": "احتباس البول في المثانة", "Incontinence": "سلس البول أو البراز اللاإرادي", "Pruritus": "حكة جلدية شديدة", "Urticaria": "شرى / طفح جلدي تحسسي حاك", "Angioedema": "وذمة وعائية سريعة بالوجه والشفتين واللسان", "Anaphylaxis": "صدمة الحساسية المفرطة الحادة (مهددة للحياة)", "Weak pulse": "نبض ضعيف خيطي (علامة صدمة)", "Thready pulse": "نبض خيطي دقيق ضعيف", "Bounding pulse": "نبض وثاب قوي وممتلئ", "Jugular venous distension": "احتقان وبروز الوريد الوداجي (فشل القلب الأيمن)", "Capillary refill": "زمن امتلاء الشعيرات الدموية (الطبيعي < ثانيتين)", "Clubbing": "تعجر نهايات الأصابع (نقص أكسجة مزمن)", "Preoperative": "قبل العملية الجراحية", "Intraoperative": "أثناء العملية الجراحية", "Work of breathing": "المجهود المبذول في التنفس", "Acute hypoxemia": "نقص حاد ومفاجئ في تأكسج الدم", "Incentive spirometer": "جهاز التنفس التحفيزي لمنع انخماص الرئة", "Incentive spirometry": "التدريب بمقياس التنفس التحفيزي", "Atelectasis": "انخماص جزئي في الحويصلات الرئوية (شائع بعد الجراحة)", "Pneumothorax": "استرواح الصدر (تجمع هواء في التجويف البلوري)", "Pleural effusion": "انصباب بلوري (تجمع سوائل في التجويف البلوري)", "Chest tube": "أنبوب تصريف الصدر", "Water seal chamber": "حجرة الختم المائي (يجب أن تتذبذب مع التنفس)", "Air leak": "تسريب هوائي في منظومة تصريف الصدر", "Continuous bubbling": "فقاعات مستمرة في الختم المائي (دليل تسريب)", "Deep vein thrombosis": "خثار وريدي عميق في الساق", "Pulmonary embolism": "انصمام رئوي حاد (ألم صدري مفاجئ وضيق نفس)", "Sepsis": "إنتان / تعفن دموي جهازي مهدد للحياة", "Septic shock": "صدمة إنتانية (هبوط ضغط حاد لا يستجيب للسوائل)", "Hypovolemic shock": "صدمة نقص حجم الدم أو السوائل", "Cardiogenic shock": "صدمة قلبية المنشأ (عجز عضلة القلب)", "Neurogenic shock": "صدمة عصبية (هبوط ضغط مع بطء نبض)", "Hypoglycemia": "هبوط حاد في سكر الدم (<70 ملغ/دل)", "Hyperglycemia": "ارتفاع سكر الدم", "Kussmaul breathing": "تنفس كوسماول السريع والعميق (في DKA)", "Hyperkalemia": "ارتفاع بوتاسيوم الدم (>5.0: خطر لا نظميات مميتة)", "Hypokalemia": "انخفاض بوتاسيوم الدم (<3.5: ضعف عضلي ولا نظميات)", "Hyponatremia": "انخفاض صوديوم الدم (<135: خطر وذمة دماغية وتشنجات)", "Hypernatremia": "ارتفاع صوديوم الدم (>145: جفاف وارتباك)", "Hypocalcemia": "انخفاض كالسيوم الدم (علامتا شفوستيك وتروسو)", "Nasogastric tube": "أنبوب التغذية الأنفي المعدي", "Enteral feeding": "التغذية الأنبوبية المعوية", "Residual volume": "حجم الرواسب المعدية المتبقية قبل الوجبة", "Aspiration": "استنشاق المحتويات أو دخولها لمجرى الهواء", "Aspiration pneumonia": "التهاب رئوي ناتج عن الاستنشاق", "High Fowler": "وضعية فاولر المرتفعة (90 درجة لتسهيل التنفس)", "Semi-Fowler": "وضعية شبه فاولر (30 إلى 45 درجة)", "Trendelenburg": "وضعية ترندلبورغ (خفض الرأس ورفع الساقين)", "Supine": "وضعية الاستلقاء المسطح على الظهر", "Prone": "وضعية الاستلقاء على البطن (لتحسين أكسجة الرئتين)", "Notify the physician": "إخطار واستدعاء الطبيب فوراً", "Notify the provider": "إخطار ممارس الرعاية الصحية المسؤول", "Question the prescription": "مراجعة الطبيب والاعتراض على الأمر الدوائي غير الآمن", "Hold the medication": "إيقاف / تعليق إعطاء الجرعة الدوائية", "Administer oxygen": "تطبيق وإعطاء الأكسجين العلاجي", "Elevate head of bed": "رفع رأس السرير لتحسين التهوئة", "Stay with the patient": "البقاء مع المريض ومراقبته لضمان سلامته", "Suction airway": "شفط إفرازات مجرى الهواء", "Assess first": "قيّم حالة المريض شخصياً قبل أي إجراء", "Check blood glucose": "فحص مستوى السكر في الدم فوراً", "Two patient identifiers": "استخدام معرّفين اثنين للمريض (الاسم والرقم)", "Rights of medication": "حقوق إعطاء الدواء السليمة", "Narrow therapeutic index": "نطاق دوائي علاجي ضيق (يتطلب مراقبة السمية)", "Extravasation": "تسرب دواء حارق خارج الوريد للأنسجة المحيطة", "Phlebitis": "التهاب الجدار الوريدي (ألم وخط أحمر دافئ)", "Infiltration": "ارتشاح السوائل تحت الجلد (تورم وبرودة)", "Central line": "القسطرة الوريدية المركزية", "Hand hygiene": "غسل وتطهير اليدين (أهم إجراء لمنع العدوى)", "Isolation": "عزل المريض لمنع انتقال العدوى", "Negative pressure": "غرفة ذات ضغط سلبي (عزل هوائي للسل)", "Fall risk": "خطر التعرض للسقوط", "Call light": "جرس استدعاء التمريض بجوار المريض", "Restraints": "أدوات التقييد الطبي (آخر ملاذ وتتطلب أمراً محدداً)", "Informed consent": "الموافقة المستنيرة (مسؤولية الطبيب وتوثيق التمريض)", "Autonomy": "حق المريض في الاستقلالية وتقرير مصيره", "Beneficence": "الإحسان والعمل لمصلحة المريض", "Nonmaleficence": "تجنب إلحاق أي ضرر بالمريض", "Confidentiality": "الحفاظ التام على سرية وخصوصية بيانات المريض", "Cannot delegate": "لا يجوز تفويضه (التقييم، التعليم، التخطيط، الحكم السريري)", "Teaching": "التثقيف والتعليم الصحي للمريض", "Discharge": "إجراءات مغادرة وخروج المريض", "Discharge planning": "التخطيط لمغادرة المريض (يبدأ فور التنويم)"};
    const ARABIC_HOVER_KEYS=Object.keys(ARABIC_HOVER_TERMS).sort(function(a,b){return b.length-a.length}).map(function(term){return term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")});
    let ARABIC_HOVER_RE=null;
    try{ARABIC_HOVER_RE=new RegExp("(?<![A-Za-z0-9])("+ARABIC_HOVER_KEYS.join("|")+")(?![A-Za-z0-9])","gi")}
    catch(error){ARABIC_HOVER_RE=new RegExp("("+ARABIC_HOVER_KEYS.join("|")+")","gi")}

    function arabicAssistEligible(node){
      if(!node||!node.parentElement||!node.nodeValue||!node.nodeValue.trim())return false;
      const p=node.parentElement;
      if(p.closest(".ar-hover-term,#arabic-hover-tooltip,script,style,textarea,input,select,option,svg,canvas,[contenteditable=true],.page-annotator,.glossary-annotator,.annotation-layer,[data-no-arabic-assist]"))return false;
      if(/[\u0600-\u06FF]/.test(node.nodeValue))return false;
      return true;
    }
    function arabicLookup(key){
      if(ARABIC_HOVER_TERMS[key])return ARABIC_HOVER_TERMS[key];
      const low=String(key||"").toLowerCase();
      const found=Object.keys(ARABIC_HOVER_TERMS).find(function(k){return k.toLowerCase()===low});
      return found?ARABIC_HOVER_TERMS[found]:"";
    }
    function wrapArabicAssistTextNode(node){
      if(!arabicAssistEligible(node)||!ARABIC_HOVER_RE)return;
      const text=node.nodeValue;ARABIC_HOVER_RE.lastIndex=0;
      let match,last=0,changed=false;const frag=document.createDocumentFragment();
      while((match=ARABIC_HOVER_RE.exec(text))){
        const raw=match[0],key=match[1]||raw,idx=match.index;
        const before=idx>0?text[idx-1]:"",after=text[idx+raw.length]||"";
        if((/[A-Za-z0-9]/.test(raw[0]||"")&&/[A-Za-z0-9]/.test(before))||
           (/[A-Za-z0-9]/.test(raw[raw.length-1]||"")&&/[A-Za-z0-9]/.test(after)))continue;
        if(idx>last)frag.appendChild(document.createTextNode(text.slice(last,idx)));
        const span=document.createElement("span");span.className="ar-hover-term";span.textContent=raw;
        span.dataset.ar=arabicLookup(key);span.setAttribute("aria-label",raw+" — "+span.dataset.ar);
        frag.appendChild(span);last=idx+raw.length;changed=true;
      }
      if(!changed)return;
      if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
      node.replaceWith(frag);
    }
    
    window.applyArabicHoverTranslations = applyArabicHoverTranslations;
    window.__showArabicTooltip = function(arabicText, x, y) {
        const t = document.getElementById("arabic-hover-tooltip");
        if(t) {
            t.innerHTML = '<small>العربية</small><strong>'+esc(arabicText)+'</strong>';
            t.classList.add("show");
            let th = t.offsetHeight, tw = t.offsetWidth;
            let tx = x + 10, ty = y + 15;
            if(tx + tw > window.innerWidth - 10) tx = window.innerWidth - tw - 10;
            if(ty + th > window.innerHeight - 10) ty = y - th - 10;
            t.style.left = tx + 'px';
            t.style.top = ty + 'px';
        }
    };
    window.__hideArabicTooltip = function() {
        const t = document.getElementById("arabic-hover-tooltip");
        if(t) t.classList.remove("show");
    };
function applyArabicHoverTranslations(root){
      if(!state.arabicAssist||!root)return;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){return arabicAssistEligible(node)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
      const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);nodes.forEach(wrapArabicAssistTextNode);ensureArabicHoverTooltip();
    }
    function ensureArabicHoverTooltip(){
      let tip=document.getElementById("arabic-hover-tooltip");
      if(!tip){tip=document.createElement("div");tip.id="arabic-hover-tooltip";tip.setAttribute("role","tooltip");document.body.appendChild(tip)}
      if(window.__snleArabicHoverBound)return;window.__snleArabicHoverBound=true;
      const hide=function(){const t=document.getElementById("arabic-hover-tooltip");if(t)t.classList.remove("show")};
      const show=function(target){
        const t=document.getElementById("arabic-hover-tooltip");if(!t||!target||!target.dataset.ar)return;
        t.innerHTML='<small>العربية</small><strong>'+esc(target.dataset.ar)+'</strong>';t.classList.add("show");
        const r=target.getBoundingClientRect(),tr=t.getBoundingClientRect();
        let left=r.left+(r.width-tr.width)/2;left=Math.max(10,Math.min(window.innerWidth-tr.width-10,left));
        let top=r.bottom+9;if(top+tr.height>window.innerHeight-10)top=Math.max(10,r.top-tr.height-9);
        t.style.left=Math.round(left)+"px";t.style.top=Math.round(top)+"px";
      };
      document.addEventListener("pointerover",function(e){if(!state.arabicAssist)return;const target=e.target&&e.target.closest?e.target.closest(".ar-hover-term"):null;if(target)show(target)},true);
      document.addEventListener("pointerout",function(e){const from=e.target&&e.target.closest?e.target.closest(".ar-hover-term"):null;const to=e.relatedTarget&&e.relatedTarget.closest?e.relatedTarget.closest(".ar-hover-term"):null;if(from&&from!==to)hide()},true);
      document.addEventListener("focusin",function(e){const target=e.target&&e.target.closest?e.target.closest(".ar-hover-term"):null;if(target&&state.arabicAssist)show(target)},true);
      document.addEventListener("focusout",hide,true);window.addEventListener("scroll",hide,true);window.addEventListener("resize",hide);
    }

    function bind(){
      const dossierSearch=document.getElementById('dossier-search');if(dossierSearch)dossierSearch.oninput=function(e){state.dossierSearch=e.target.value;const caret=e.target.selectionStart;clearTimeout(window.__dossierRender);window.__dossierRender=setTimeout(function(){render();const input=document.getElementById('dossier-search');if(input){input.focus();try{input.setSelectionRange(caret,caret)}catch(err){}}},90)};
      const dossierSpecialty=document.getElementById('dossier-specialty');if(dossierSpecialty)dossierSpecialty.onchange=function(){state.dossierSpecialty=this.value;render()};
      const dossierDomain=document.getElementById('dossier-domain');if(dossierDomain)dossierDomain.onchange=function(){state.dossierDomain=this.value;render()};
      const dossierHyp=document.getElementById('dossier-hyp');if(dossierHyp)dossierHyp.onchange=function(){state.dossierHyp=this.value;render()};
      document.querySelectorAll('[data-dossier-open]').forEach(function(b){b.onclick=function(){state.dossierOpen=b.dataset.dossierOpen;state.dossierTab='overview';render()}});
      document.querySelectorAll('[data-dossier-tab]').forEach(function(b){b.onclick=function(){state.dossierTab=b.dataset.dossierTab;render()}});
      document.querySelectorAll('[data-dossier-start-practice]').forEach(function(b){b.onclick=function(){if(b.dataset.dossierOpen)state.dossierOpen=b.dataset.dossierOpen;state.dossierTab='practice';state.dossierPracticeMode=b.dataset.dossierStartPractice||'all';state.dossierPracticeIndex=0;state.dossierPracticeSelected='';state.dossierPracticeRevealed=false;render()}});
      document.querySelectorAll('[data-dossier-option]').forEach(function(b){b.onclick=function(){if(state.dossierPracticeRevealed)return;state.dossierPracticeSelected=b.dataset.dossierOption;render()}});
      const dossierCheck=document.querySelector('[data-dossier-check]');if(dossierCheck)dossierCheck.onclick=function(){const d=CLINICAL_DOSSIERS.find(x=>x.id===state.dossierOpen);if(!d||state.dossierPracticeSelected==='')return;const set=dossierPracticeSet(d),q=set[Math.max(0,Math.min(set.length-1,state.dossierPracticeIndex||0))];if(!q)return;const key=dossierAnswerKey(d,q),prev=dossierProgress.answers[key]||{};dossierProgress.answers[key]={selected:Number(state.dossierPracticeSelected),correct:Number(state.dossierPracticeSelected)===Number(q.a),attempts:Number(prev.attempts||0)+1,everMissed:!!prev.everMissed||Number(state.dossierPracticeSelected)!==Number(q.a),lastAt:Date.now()};saveDossierProgress();state.dossierPracticeRevealed=true;render()};
      const dossierNext=document.querySelector('[data-dossier-next]');if(dossierNext)dossierNext.onclick=function(){const d=CLINICAL_DOSSIERS.find(x=>x.id===state.dossierOpen);if(!d)return;const set=dossierPracticeSet(d);state.dossierPracticeIndex=(state.dossierPracticeIndex+1)%Math.max(1,set.length);state.dossierPracticeSelected='';state.dossierPracticeRevealed=false;render()};
      document.querySelectorAll('[data-dossier-practice-mode]').forEach(function(b){b.onclick=function(){state.dossierPracticeMode=b.dataset.dossierPracticeMode||'all';state.dossierPracticeIndex=0;state.dossierPracticeSelected='';state.dossierPracticeRevealed=false;render()}});
      document.querySelectorAll('[data-dossier-related]').forEach(function(b){b.onclick=function(){state.dossierOpen=b.dataset.dossierRelated;state.dossierTab='overview';state.dossierPracticeIndex=0;state.dossierPracticeSelected='';state.dossierPracticeRevealed=false;render()}});
      document.querySelectorAll('[data-report-dossier]').forEach(function(b){b.onclick=function(){state.view='dossier';state.dossierOpen=b.dataset.reportDossier;state.dossierTab='recognize';state.dossierPracticeIndex=0;state.dossierPracticeSelected='';state.dossierPracticeRevealed=false;render();scrollTo(0,0)}});

      document.querySelectorAll('[data-dossier-core]').forEach(function(b){b.onclick=function(){const title=b.dataset.dossierCore;const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const wanted=norm(title);let p=P.find(x=>norm(x.title)===wanted)||P.find(x=>norm(x.title).includes(wanted)||wanted.includes(norm(x.title)));if(p){state.dossierOpen=null;state.poster=p;state.tab='learn';state.zoom=1;state.coachSession=[];render()}}});
      document.querySelectorAll('[data-dossier-close]').forEach(function(b){b.onclick=function(){state.dossierOpen=null;render()}});
      const dossierOverlay=document.querySelector('[data-dossier-overlay]');if(dossierOverlay)dossierOverlay.onclick=function(e){if(e.target===dossierOverlay){state.dossierOpen=null;render()}};
      if(window.__dossierEsc)window.removeEventListener('keydown',window.__dossierEsc);window.__dossierEsc=function(e){if(e.key==='Escape'&&state.dossierOpen){state.dossierOpen=null;render()}};window.addEventListener('keydown',window.__dossierEsc);
      document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{clearInterval(resetTimer);clearInterval(window.__examClock);state.examSimulation=false;state.view=b.dataset.nav;state.session=[];state.index=0;render();scrollTo(0,0)});
      const labsMount = document.getElementById('labs-iframe-mount');
      if (labsMount && window.SNLE_HAS_LABS) {
        let iframe = document.getElementById('labs-iframe');
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'labs-iframe';
          const lastLab = snleStorage.getItem('snle-last-lab-page') || 'SNLE_Decoder_Lab_Index.html';
          iframe.src = 'SNLE_Decoder_Interactive_Labs_v3/' + lastLab;
          iframe.style.cssText = 'width:100%; height:100%; border:none; display:block;';
          iframe.onload = function() {
            broadcastToLabsIframe();
          };
          labsMount.appendChild(iframe);
        }
        setTimeout(broadcastToLabsIframe, 80);
      }
      const lang=document.querySelector('[data-lang]');
      if(lang)lang.onclick=()=>{
        state.lang='en';
        state.arabicAssist=!state.arabicAssist;
        snleStorage.setItem('snle-arabic-assist',state.arabicAssist?'1':'0');
        if(state.view==='labs'){
          lang.classList.toggle('is-active', state.arabicAssist);
          lang.setAttribute('aria-pressed', state.arabicAssist ? 'true' : 'false');
          broadcastToLabsIframe();
        } else {
          render();
        }
      };
      const colorMode=document.querySelector('[data-color-mode]');
      if(colorMode)colorMode.onclick=()=>{
        state.colorMode=state.colorMode==='blue'?'green':'blue';
        snleStorage.setItem('snle-color-mode',state.colorMode);
        if(state.view==='labs'){
          colorMode.classList.toggle('is-blue', state.colorMode==='blue');
          const lbl = colorMode.querySelector('span:last-child');
          if(lbl) lbl.textContent = state.colorMode==='blue' ? 'Green' : 'Blue';
          document.body.classList.toggle('theme-blue-body', state.colorMode==='blue');
          document.documentElement.classList.toggle('theme-blue-html', state.colorMode==='blue');
          const shellEl = document.querySelector('.app-shell');
          if(shellEl) {
            shellEl.classList.toggle('theme-blue', state.colorMode==='blue');
            shellEl.classList.toggle('theme-green', state.colorMode!=='blue');
          }
          broadcastToLabsIframe();
        } else {
          render();
        }
      };
      const sidebarToggle=document.querySelector('[data-sidebar-toggle]');if(sidebarToggle)sidebarToggle.onclick=()=>{state.sidebarCollapsed=!state.sidebarCollapsed;snleStorage.setItem('snle-sidebar-collapsed',state.sidebarCollapsed?'1':'0');render()};
      const glossarySearch=document.getElementById("glossary-search");
      if(glossarySearch)glossarySearch.oninput=function(event){
        state.glossaryQuery=event.target.value;
        const caret=event.target.selectionStart;
        clearTimeout(window.__glossaryRender);
        window.__glossaryRender=setTimeout(function(){
          render();
          const input=document.getElementById("glossary-search");
          if(input){input.focus();try{input.setSelectionRange(caret,caret)}catch(error){}}
        },100);
      };
      document.querySelectorAll("[data-plan]").forEach(function(input){
        input.oninput=function(){
          const p=planState();p[input.dataset.plan]=input.value;save();
          const bar=document.querySelector(".plan-progress-bar i"),lab=document.querySelector(".plan-progress span");
          if(bar&&lab){
            const filled=STUDY_MILESTONES.filter(function(m){return String(p[m.key]||"").trim()}).length;
            bar.style.width=Math.round(filled/STUDY_MILESTONES.length*100)+"%";
            lab.textContent=filled+" of "+STUDY_MILESTONES.length+" milestones personalized";
          }
        };
      });
      const planPrint=document.querySelector("[data-plan-print]");
      if(planPrint)planPrint.onclick=function(){window.print()};
      const planClear=document.querySelector("[data-plan-clear]");
      if(planClear)planClear.onclick=function(){
        if(confirm("Clear every field in your exam-day plan?")){progress.examPlan={};save();render()}
      };
      document.querySelectorAll("[data-gl-lens]").forEach(function(button){
        button.onclick=function(){
          var parts=button.dataset.glLens.split(":"),id=parts[0],lens=parts[1];
          state.glossaryShow=state.glossaryShow||{};
          var cur=state.glossaryShow[id]||{};
          if(lens==="__all"){cur={term:true};GLOSS_LENSES.forEach(function(x){cur[x[0]]=true})}
          else if(lens==="__none"){cur={}}
          else{cur=Object.assign({},cur);cur[lens]=!cur[lens]}
          state.glossaryShow[id]=cur;render();
        };
      });
      document.querySelectorAll("[data-glossary-category]").forEach(function(button){
        button.onclick=function(){
          state.glossaryCategory=button.dataset.glossaryCategory;
          state.glossaryQuery="";
          state.glossaryTerm="";
          render();
        };
      });
      document.querySelectorAll("[data-glossary-term]").forEach(function(button){
        button.onclick=function(){state.glossaryTerm=button.dataset.glossaryTerm;render()};
      });
      const glossaryClear=document.querySelector("[data-glossary-clear]");
      if(glossaryClear)glossaryClear.onclick=function(){state.glossaryQuery="";state.glossaryTerm="";render()};
      const glossarySplitter=document.querySelector('[data-glossary-splitter]');
      if(glossarySplitter){
        const shell=glossarySplitter.closest('.glossary-shell');let dragging=false,startX=0,startW=0;
        const setWidth=function(px){const shellRect=shell.getBoundingClientRect(),cat=shell.querySelector('.glossary-categories'),catW=cat?cat.getBoundingClientRect().width:285,max=Math.max(320,shellRect.width-catW-12-440);state.glossaryListWidth=Math.max(320,Math.min(max,px));shell.style.setProperty('--glossary-list-width',Math.round(state.glossaryListWidth)+'px');snleStorage.setItem('snle-glossary-list-width',String(Math.round(state.glossaryListWidth)))};
        glossarySplitter.onpointerdown=function(e){dragging=true;startX=e.clientX;startW=state.glossaryListWidth||390;glossarySplitter.classList.add('is-dragging');glossarySplitter.setPointerCapture?.(e.pointerId);e.preventDefault()};
        glossarySplitter.onpointermove=function(e){if(!dragging)return;setWidth(startW+(e.clientX-startX))};
        glossarySplitter.onpointerup=function(){dragging=false;glossarySplitter.classList.remove('is-dragging')};
        glossarySplitter.onpointercancel=function(){dragging=false;glossarySplitter.classList.remove('is-dragging')};
        glossarySplitter.onkeydown=function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setWidth((state.glossaryListWidth||390)+(e.key==='ArrowRight'?24:-24))}};
      }
      const committeeInfo=document.querySelector('[data-committee-info]');
      if(committeeInfo)committeeInfo.onclick=function(){state.committeeInfo=true;render()};
      document.querySelectorAll('[data-committee-close]').forEach(function(button){button.onclick=function(){state.committeeInfo=false;render()}});
      const committeeOverlay=document.querySelector('[data-committee-overlay]');
      if(committeeOverlay)committeeOverlay.onclick=function(e){if(e.target===committeeOverlay){state.committeeInfo=false;render()}};
      const journeyInfo=document.querySelector('[data-learning-journey-info]');
      if(journeyInfo)journeyInfo.onclick=function(){state.learningJourneyInfo=true;render()};
      document.querySelectorAll('[data-learning-journey-close]').forEach(function(button){button.onclick=function(){state.learningJourneyInfo=false;render()}});
      const journeyOverlay=document.querySelector('[data-learning-journey-overlay]');
      if(journeyOverlay)journeyOverlay.onclick=function(e){if(e.target===journeyOverlay){state.learningJourneyInfo=false;render()}};
      const courseLibraryInfo=document.querySelector('[data-course-library-info]');
      if(courseLibraryInfo)courseLibraryInfo.onclick=function(){state.courseLibraryInfo=true;render()};
      document.querySelectorAll('[data-course-library-close]').forEach(function(button){button.onclick=function(){state.courseLibraryInfo=false;render()}});
      const courseLibraryOverlay=document.querySelector('[data-course-library-overlay]');
      if(courseLibraryOverlay)courseLibraryOverlay.onclick=function(e){if(e.target===courseLibraryOverlay){state.courseLibraryInfo=false;render()}};
      if(window.__courseInfoEsc)window.removeEventListener('keydown',window.__courseInfoEsc);
      window.__courseInfoEsc=function(e){if(e.key==='Escape'&&(state.committeeInfo||state.learningJourneyInfo||state.courseLibraryInfo||state.resetTimingInfo||state.guideDomainInfo)){state.committeeInfo=false;state.learningJourneyInfo=false;state.courseLibraryInfo=false;state.resetTimingInfo=false;state.guideDomainInfo=null;render()}};
      window.addEventListener('keydown',window.__courseInfoEsc);
      const resetTimingInfo=document.querySelector('[data-reset-timing-info]');
      if(resetTimingInfo)resetTimingInfo.onclick=function(){state.resetTimingInfo=true;render()};
      document.querySelectorAll('[data-reset-timing-close]').forEach(function(button){button.onclick=function(){state.resetTimingInfo=false;render()}});
      const resetTimingOverlay=document.querySelector('[data-reset-timing-overlay]');
      if(resetTimingOverlay)resetTimingOverlay.onclick=function(e){if(e.target===resetTimingOverlay){state.resetTimingInfo=false;render()}};
      const glossaryInfo=document.querySelector("[data-glossary-info]");
      if(glossaryInfo)glossaryInfo.onclick=function(){state.glossaryInfo=true;render()};
      const glossaryInfoClose=document.querySelector("[data-glossary-info-close]");
      if(glossaryInfoClose)glossaryInfoClose.onclick=function(){state.glossaryInfo=false;render()};
      const glossaryInfoOverlay=document.querySelector("[data-glossary-info-overlay]");
      if(glossaryInfoOverlay)glossaryInfoOverlay.onclick=function(e){if(e.target===glossaryInfoOverlay){state.glossaryInfo=false;render()}};
      if(window.__glossaryInfoEsc)window.removeEventListener('keydown',window.__glossaryInfoEsc);
      window.__glossaryInfoEsc=function(e){if(e.key==='Escape'&&state.glossaryInfo){state.glossaryInfo=false;render()}};
      window.addEventListener('keydown',window.__glossaryInfoEsc);

      const annotator=document.querySelector('[data-glossary-annotator]');
      if(annotator){
        try{const p=JSON.parse(snleStorage.getItem('snle-page-annot-pos')||'null');if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top)){annotator.style.left=p.left+'px';annotator.style.top=p.top+'px';annotator.style.right='auto';annotator.style.bottom='auto'}}catch(e){}
      }
      function updateAnnotatorUI(){
        const layer=document.querySelector('[data-glossary-annotation-layer]');
        const annotator=document.querySelector('[data-glossary-annotator]');
        const trigger=document.querySelector('[data-glossary-annot-toggle].page-edit-trigger');
        const tool=state.glossaryAnnotTool||'off';
        const isActive=tool!=='off';
        if(layer){
          layer.classList.toggle('is-active',isActive);
          layer.dataset.tool=tool;
          // Hide layer when tool is off so mouse wheel scrolling passes cleanly into iframes
          layer.style.display=isActive?'block':'none';
        }
        document.querySelectorAll('[data-glossary-annot-tool]').forEach(function(btn){
          btn.classList.toggle('active',btn.dataset.glossaryAnnotTool===tool);
        });
        document.querySelectorAll('[data-glossary-annot-color]').forEach(function(btn){
          btn.classList.toggle('active',btn.dataset.glossaryAnnotColor===state.glossaryAnnotColor);
        });
        if(trigger){
          trigger.classList.toggle('is-open',!state.glossaryAnnotMin);
        }
        if(annotator){
          annotator.classList.toggle('is-minimized',!!state.glossaryAnnotMin);
          annotator.setAttribute('data-minimized',state.glossaryAnnotMin?'true':'false');
          annotator.style.display=state.glossaryAnnotMin?'none':'';
        }
      }

      document.querySelectorAll('[data-glossary-annot-toggle]').forEach(function(annotToggle){
        annotToggle.onpointerdown=function(e){
          e.stopPropagation();
        };
        annotToggle.onclick=function(e){
          e.preventDefault();
          e.stopPropagation();
          // If clicking inside the annotator panel, always minimize
          if(annotToggle.closest('.glossary-annot-head')){
            state.glossaryAnnotMin=true;
            state.glossaryAnnotTool='off';
          } else {
            state.glossaryAnnotMin=!state.glossaryAnnotMin;
            if(state.glossaryAnnotMin)state.glossaryAnnotTool='off';
          }
          snleStorage.setItem('snle-glossary-annot-min',state.glossaryAnnotMin?'1':'0');
          updateAnnotatorUI();
        };
      });

      document.querySelectorAll('[data-glossary-annot-tool]').forEach(function(button){
        button.onclick=function(e){
          e.stopPropagation();
          var t=button.dataset.glossaryAnnotTool;
          state.glossaryAnnotTool=state.glossaryAnnotTool===t?'off':t;
          updateAnnotatorUI();
        };
      });

      document.querySelectorAll('[data-glossary-annot-color]').forEach(function(button){
        button.onclick=function(e){
          e.stopPropagation();
          state.glossaryAnnotColor=button.dataset.glossaryAnnotColor;
          snleStorage.setItem('snle-glossary-annot-color',state.glossaryAnnotColor);
          updateAnnotatorUI();
        };
      });

      const annotClear=document.querySelector('[data-glossary-annot-clear]');
      if(annotClear){
        annotClear.onclick=function(e){
          e.stopPropagation();
          if(confirm('Clear all highlights, pen marks and text notes from this page?')){
            const marks=pageMarks();
            marks.paths=[];
            marks.texts=[];
            savePageAnnotations();
            state.glossaryAnnotTool='off';
            const svg=document.querySelector('.glossary-annotation-svg');
            if(svg)svg.innerHTML='';
            document.querySelectorAll('.glossary-annotation-text').forEach(function(n){n.remove()});
            updateAnnotatorUI();
          }
        };
      }

      const annotDrag=document.querySelector('[data-glossary-annot-drag]');
      if(annotator&&annotDrag){
        let dragging=false,dx=0,dy=0;
        annotDrag.onpointerdown=function(e){
          dragging=true;
          const r=annotator.getBoundingClientRect();
          dx=e.clientX-r.left;
          dy=e.clientY-r.top;
          annotDrag.setPointerCapture?.(e.pointerId);
          e.preventDefault();
        };
        annotDrag.onpointermove=function(e){
          if(!dragging)return;
          const left=Math.max(6,Math.min(window.innerWidth-annotator.offsetWidth-6,e.clientX-dx)),
                top=Math.max(76,Math.min(window.innerHeight-annotator.offsetHeight-6,e.clientY-dy));
          annotator.style.left=left+'px';
          annotator.style.top=top+'px';
          annotator.style.right='auto';
          annotator.style.bottom='auto';
        };
        annotDrag.onpointerup=function(){
          if(!dragging)return;
          dragging=false;
          const r=annotator.getBoundingClientRect();
          snleStorage.setItem('snle-page-annot-pos',JSON.stringify({left:r.left,top:r.top}));
        };
        annotDrag.onpointercancel=function(){dragging=false;};
      }

      function attachNoteClickHandler(note){
        note.onclick=function(e){
          e.stopPropagation();
          if(state.glossaryAnnotTool!=='text')return;
          const marks=pageMarks(),i=Number(note.dataset.glossaryTextIndex),cur=marks.texts[i];
          if(!cur)return;
          const text=prompt('Edit text note. Leave blank to delete.',cur.text);
          if(text===null)return;
          if(!text.trim()){
            marks.texts.splice(i,1);
            note.remove();
          }else{
            cur.text=text.trim();
            note.textContent=cur.text;
          }
          savePageAnnotations();
          state.glossaryAnnotTool='off';
          updateAnnotatorUI();
        };
      }
      document.querySelectorAll('[data-glossary-text-index]').forEach(attachNoteClickHandler);

      const glossLayer=document.querySelector('[data-glossary-annotation-layer]');
      if(glossLayer){
        const svg=glossLayer.querySelector('.glossary-annotation-svg');
        let drawing=null,poly=null;
        const point=function(e){
          const r=glossLayer.getBoundingClientRect();
          return [Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))];
        };
        glossLayer.onpointerdown=function(e){
          if(state.glossaryAnnotTool==='off')return;
          if(e.target.closest('[data-glossary-text-index]'))return;
          const marks=pageMarks();
          if(state.glossaryAnnotTool==='text'){
            const pt=point(e),text=prompt('Add text note:');
            if(text&&text.trim()){
              const noteData={x:pt[0]/10,y:pt[1]/10,text:text.trim(),color:state.glossaryAnnotColor};
              marks.texts.push(noteData);
              savePageAnnotations();
              state.glossaryAnnotTool='off';
              const btn=document.createElement('button');
              btn.className='glossary-annotation-text';
              btn.dataset.glossaryTextIndex=marks.texts.length-1;
              btn.style.left=noteData.x+'%';
              btn.style.top=noteData.y+'%';
              btn.style.setProperty('--note-color',noteData.color||'#4272ff');
              btn.textContent=noteData.text;
              attachNoteClickHandler(btn);
              glossLayer.appendChild(btn);
              updateAnnotatorUI();
            }
            return;
          }
          if(!['pen','highlight'].includes(state.glossaryAnnotTool))return;
          e.preventDefault();
          drawing={tool:state.glossaryAnnotTool,color:state.glossaryAnnotColor,points:[point(e)]};
          marks.paths.push(drawing);
          poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
          poly.setAttribute('fill','none');
          poly.setAttribute('stroke',drawing.color);
          poly.setAttribute('stroke-width',drawing.tool==='highlight'?'24':'4');
          poly.setAttribute('stroke-linecap','round');
          poly.setAttribute('stroke-linejoin','round');
          poly.setAttribute('opacity',drawing.tool==='highlight'?'.30':'.96');
          svg.appendChild(poly);
          glossLayer.setPointerCapture?.(e.pointerId);
        };
        glossLayer.onpointermove=function(e){
          if(!drawing)return;
          drawing.points.push(point(e));
          poly.setAttribute('points',drawing.points.map(function(pt){return pt.join(',')}).join(' '));
        };
        glossLayer.onpointerup=function(e){
          if(!drawing)return;
          drawing.points.push(point(e));
          savePageAnnotations();
          drawing=null;
          poly=null;
        };
        glossLayer.onpointercancel=function(){
          if(drawing){
            savePageAnnotations();
            drawing=null;
            poly=null;
          }
        };
      }
      document.querySelectorAll("[data-guide-tab]").forEach(function(button){
        button.onclick=function(){state.guideTab=button.dataset.guideTab;render();scrollTo(0,0)};
      });
      document.querySelectorAll("[data-guide-domain]").forEach(function(button){button.onclick=function(){state.guideDomainInfo=button.dataset.guideDomain;render()}});
      document.querySelectorAll("[data-guide-domain-close]").forEach(function(button){button.onclick=function(){state.guideDomainInfo=null;render()}});
      const guideDomainOverlay=document.querySelector("[data-guide-domain-overlay]");
      if(guideDomainOverlay)guideDomainOverlay.onclick=function(e){if(e.target===guideDomainOverlay){state.guideDomainInfo=null;render()}};

      document.querySelectorAll("[data-reset-context]").forEach(function(button){
        button.onclick=function(){
          clearInterval(resetTimer);
          state.resetContext=button.dataset.resetContext;
          const context=RESET_CONTEXTS.find(function(x){return x.id===state.resetContext});
          if(context)state.resetExercise=context.recommend;
          state.resetStep=0;
          state.resetChecks={};
          state.resetDone=false;
          render();
        };
      });
      document.querySelectorAll("[data-reset-open]").forEach(function(button){
        button.onclick=function(){
          clearInterval(resetTimer);
          state.resetExercise=button.dataset.resetOpen;
          state.resetStep=0;
          state.resetChecks={};
          state.resetDone=false;
          render();
          requestAnimationFrame(function(){document.querySelector(".reset-stage")?.scrollIntoView({behavior:"smooth",block:"start"})});
        };
      });
      document.querySelectorAll("[data-reset-check]").forEach(function(button){
        button.onclick=function(){
          state.resetChecks=state.resetChecks||{};
          const key=button.dataset.resetCheck;
          state.resetChecks[key]=!state.resetChecks[key];
          render();
        };
      });
      const resetNext=document.querySelector("[data-reset-next]");
      if(resetNext)resetNext.onclick=function(){
        if((state.resetStep||0)>=GROUNDING_STEPS.length-1)completeReset();
        else{state.resetStep=(state.resetStep||0)+1;render()}
      };
      const resetRestart=document.querySelector("[data-reset-restart]");
      if(resetRestart)resetRestart.onclick=function(){state.resetStep=0;state.resetDone=false;render()};
      document.querySelectorAll("[data-reset-timer]").forEach(function(button){
        button.onclick=function(){startResetTimer(Number(button.dataset.resetTimer))};
      });
      const resetStop=document.querySelector("[data-reset-stop]");
      if(resetStop)resetStop.onclick=function(){
        clearInterval(resetTimer);
        const time=document.querySelector("[data-reset-time]");
        const phase=document.querySelector("[data-reset-phase]");
        if(time)time.textContent="Paused";
        if(phase)phase.textContent="Breathe naturally";
        const box=document.querySelector("[data-box-breath]");if(box){box.classList.remove("running");box.dataset.phase="ready";}
        document.querySelectorAll("[data-box-phase]").forEach(function(node){node.classList.remove("active")});
      };
      const resetComplete=document.querySelector("[data-reset-complete]");
      if(resetComplete)resetComplete.onclick=completeReset;
      document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start,Number(b.dataset.count||0)));
      document.querySelectorAll('[data-poster]').forEach(b=>b.onclick=()=>{state.poster=P.find(p=>p.id===b.dataset.poster);state.tab='learn';state.zoom=1;state.coachSession=[];render()});
      const close=document.querySelector('[data-close-modal]');if(close)close.onclick=()=>{state.poster=null;render()};
      const focus=document.querySelector('[data-focus]');if(focus)focus.onclick=()=>{state.focus=!state.focus;render()};
      document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render()});
      document.querySelectorAll('[data-teaching-size]').forEach(b=>b.onclick=()=>{state.teachingScale=Number(b.dataset.teachingSize);snleStorage.setItem('snle-teaching-scale',state.teachingScale);render()});
      document.querySelectorAll('[data-annotation-tool]').forEach(b=>b.onclick=()=>{state.annotationTool=b.dataset.annotationTool;render()});
      const ac=document.querySelector('[data-annotation-color]');if(ac)ac.onchange=e=>{state.annotationColor=e.target.value};
      const ca=document.querySelector('[data-clear-annotations]');if(ca)ca.onclick=()=>{if(confirm('Clear all pen marks, highlights, and notes from this poster?')){annotations[state.poster.id]={paths:[],notes:[]};saveAnnotations();render()}};
      document.querySelectorAll('[data-note-index]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(state.annotationTool!=='edit')return;const marks=posterMarks(state.poster.id),i=Number(b.dataset.noteIndex),current=marks.notes[i];const text=prompt('Edit note. Leave blank to delete.',current.text);if(text===null)return;if(!text.trim())marks.notes.splice(i,1);else current.text=text.trim();saveAnnotations();render()});
      const canvas=document.querySelector('[data-poster-canvas]');if(canvas){const svg=canvas.querySelector('.poster-markup');let drawing=null,poly=null;const point=e=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))]};canvas.onpointerdown=e=>{if(e.target.closest('[data-note-index]'))return;if(['note','sticky'].includes(state.annotationTool)){const pt=point(e),text=prompt(state.annotationTool==='sticky'?'Sticky note text:':'Teaching note text:');if(text&&text.trim()){posterMarks(state.poster.id).notes.push({x:pt[0]/10,y:pt[1]/10,text:text.trim(),sticky:state.annotationTool==='sticky'});saveAnnotations();state.annotationTool='edit';render()}return}if(!['pen','highlight'].includes(state.annotationTool))return;e.preventDefault();drawing={tool:state.annotationTool,color:state.annotationTool==='highlight'?'#ffe04b':state.annotationColor,points:[point(e)]};posterMarks(state.poster.id).paths.push(drawing);poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');poly.setAttribute('fill','none');poly.setAttribute('stroke',drawing.color);poly.setAttribute('stroke-width',drawing.tool==='highlight'?'22':'4');poly.setAttribute('stroke-linecap','round');poly.setAttribute('stroke-linejoin','round');poly.setAttribute('opacity',drawing.tool==='highlight'?'.34':'.96');svg.appendChild(poly);canvas.setPointerCapture?.(e.pointerId)};canvas.onpointermove=e=>{if(!drawing)return;drawing.points.push(point(e));poly.setAttribute('points',drawing.points.map(pt=>pt.join(',')).join(' '))};canvas.onpointerup=e=>{if(!drawing)return;drawing.points.push(point(e));saveAnnotations();drawing=null;poly=null};canvas.onpointercancel=()=>{if(drawing){saveAnnotations();drawing=null;poly=null}}};
      document.querySelectorAll('[data-learning-layer]').forEach(b=>b.onclick=()=>{const id=b.dataset.learningLayer;if(id==='options'&&!state.coachRevealed)return;state.learningLayer=state.learningLayer===id?'':id;state.lensFocus='';state.lensOption='';render()});
      document.querySelectorAll('[data-lens-focus]').forEach(b=>b.onclick=()=>{const term=b.dataset.lensFocus;state.lensFocus=state.lensFocus===term?'':term;render()});
      document.querySelectorAll('[data-lens-option]').forEach(b=>b.onclick=()=>{const label=b.dataset.lensOption;state.lensOption=state.lensOption===label?'':label;render()});
      document.querySelectorAll('[data-coach-answer]').forEach(b=>b.onclick=()=>{state.coachSelected=b.dataset.coachAnswer;render()});
      const ccheck=document.querySelector('[data-coach-check]');if(ccheck)ccheck.onclick=()=>{if(!state.coachSelected||state.coachRevealed)return;const q=state.coachSession[state.coachIndex],ok=state.coachSelected===q.key;if(ok)state.coachCorrect++;recordResponse(q,ok);state.coachRevealed=true;render()};
      const cnext=document.querySelector('[data-coach-next]');if(cnext)cnext.onclick=()=>{state.coachIndex++;state.coachSelected='';state.coachRevealed=false;state.coachHint=false;state.lensOption='';if(state.learningLayer==='options')state.learningLayer='';render()};
      const cprev=document.querySelector('[data-coach-prev]');if(cprev)cprev.onclick=()=>{if(state.coachIndex>0){state.coachIndex--;state.coachSelected='';state.coachRevealed=false;state.coachHint=false;state.lensOption='';if(state.learningLayer==='options')state.learningLayer='';render()}};
      const chint=document.querySelector('[data-coach-hint]');if(chint)chint.onclick=()=>{state.coachHint=!state.coachHint;render()};
      const crestart=document.querySelector('[data-coach-restart]');if(crestart)crestart.onclick=()=>openCoach(state.poster,true);
      document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{state.zoom=Math.min(2.25,Math.max(.65,state.zoom+Number(b.dataset.zoom)));render()});
      const rz=document.querySelector('[data-reset-zoom]');if(rz)rz.onclick=()=>{state.zoom=1;render()};
      document.querySelectorAll('[data-open-coach]').forEach(b=>b.onclick=()=>openCoach(P.find(p=>p.id===b.dataset.openCoach),true));
      const search=document.getElementById('tool-search');if(search)search.oninput=(e)=>{state.search=e.target.value;clearTimeout(window.__sr);window.__sr=setTimeout(render,120)};
      const group=document.getElementById('group-select');if(group)group.onchange=(e)=>{state.group=e.target.value;render()};
      const hypFilter=document.getElementById('hyp-select');if(hypFilter)hypFilter.onchange=(e)=>{state.hypFilter=e.target.value;render()};
      const catalogSort=document.getElementById('catalog-sort');if(catalogSort)catalogSort.onchange=(e)=>{state.catalogSort=e.target.value;snleStorage.setItem('snle-catalog-sort',state.catalogSort);render()};
      document.querySelectorAll('[data-catalog-view]').forEach(b=>b.onclick=()=>{state.catalogView=b.dataset.catalogView;snleStorage.setItem('snle-catalog-view',state.catalogView);render()});
      const clear=document.querySelector('[data-clear-search]');if(clear)clear.onclick=()=>{state.search='';render()};
      document.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>{state.search=b.dataset.search;render()});
      document.querySelectorAll('[data-mock-mode]').forEach(b=>b.onclick=()=>{state.mockMode=b.dataset.mockMode;render()});const ml=document.getElementById('mock-length');if(ml)ml.onchange=(e)=>{state.mockLength=Number(e.target.value);render()};
      document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.answer;render()});const examSubmit=document.querySelector('[data-exam-submit]');if(examSubmit)examSubmit.onclick=()=>{if(!state.selected)return;const q=state.session[state.index],ok=state.selected===q.key;state.sessionCorrect+=ok?1:0;recordResponse(q,ok);state.examAnswers.push({id:q.id,answer:state.selected,correct:ok});state.sessionAnswers=(state.sessionAnswers||[]).filter(function(x){return x.id!==q.id});state.sessionAnswers.push({id:q.id,answer:state.selected,correct:ok});state.index++;state.selected='';const bp=mockBreakProfile(state.session.length);if(state.index===bp.at){state.examBreak=true;state.examBreakEndsAt=0}render();scrollTo(0,0)};const breakStart=document.querySelector('[data-break-start]');if(breakStart)breakStart.onclick=()=>{const bp=mockBreakProfile(state.session.length);state.examBreakEndsAt=Date.now()+bp.seconds*1000;render()};const breakContinue=document.querySelector('[data-break-continue]');if(breakContinue)breakContinue.onclick=()=>{state.examBreak=false;state.examBreakEndsAt=0;state.examSection=2;state.examSectionEndsAt=Date.now()+Math.round(state.session.length*.6)*60*1000;render();scrollTo(0,0)};if(state.examSimulation){clearInterval(window.__examClock);window.__examClock=setInterval(()=>{const t=document.querySelector('[data-exam-time]');if(t)t.textContent=formatClock(state.examSectionEndsAt-Date.now());const bt=document.querySelector('[data-break-time]');if(bt&&state.examBreakEndsAt)bt.textContent=formatClock(state.examBreakEndsAt-Date.now())},1000)}
      const cb=document.querySelector('[data-check]');if(cb)cb.onclick=check;
      const nb=document.querySelector('[data-next]');if(nb)nb.onclick=()=>{state.index++;state.selected='';state.revealed=false;if(!state.examSimulation&&String(state.sessionTitle||'').indexOf('SNLE blueprint tutor mock')===0&&state.index===Math.floor(state.session.length/2))state.tutorBreak=true;render();scrollTo(0,0)};const tutorBreakContinue=document.querySelector('[data-tutor-break-continue]');if(tutorBreakContinue)tutorBreakContinue.onclick=()=>{state.tutorBreak=false;render();scrollTo(0,0)};
      const fb=document.querySelector('[data-flag]');if(fb)fb.onclick=()=>{const id=fb.dataset.flag;progress.flaggedIds=progress.flaggedIds.includes(id)?progress.flaggedIds.filter(x=>x!==id):[...progress.flaggedIds,id];save();render()};
      const saveReport=document.querySelector("[data-save-report]");
      if(saveReport)saveReport.onclick=function(){
        document.body.classList.add("print-session-report");
        const cleanup=function(){document.body.classList.remove("print-session-report");window.removeEventListener("afterprint",cleanup)};
        window.addEventListener("afterprint",cleanup);
        setTimeout(function(){window.print()},80);
      };
      const retry=document.querySelector('[data-retry]');if(retry)retry.onclick=()=>{state.session=shuffle(state.session);state.index=0;state.selected='';state.revealed=false;state.sessionCorrect=0;state.examBreak=false;state.examBreakEndsAt=0;state.tutorBreak=false;state.examSection=1;state.examAnswers=[];state.sessionAnswers=[];if(state.examSimulation)state.examSectionEndsAt=Date.now()+Math.round(state.session.length*.6)*60*1000;render()};
      const hub=document.querySelector('[data-hub]');if(hub)hub.onclick=()=>{state.session=[];state.index=0;state.examSimulation=false;state.examBreak=false;state.tutorBreak=false;render()};
    }
    /* ================================================================
       WORLD-CLASS UI/UX ENHANCEMENT — JavaScript Layer
       Page transitions, scroll reveals, topbar shadow, number counters
       ================================================================ */

    let _agyPrevView = null;

    
    let _existingLabsIframe = null;

    function broadcastToLabsIframe() {
      const iframe = document.getElementById('labs-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            type: 'snle-sync-state',
            arabicAssist: !!state.arabicAssist,
            colorMode: state.colorMode || 'green'
          }, '*');
        } catch(e) {}
      }
    }

    window.addEventListener('message', function(e) {
      if (e.data && (e.data.type === 'snle-lab-ready' || e.data.type === 'snle-lab-loaded')) {
        broadcastToLabsIframe();
      }
    });

    function labsPage(){if(!window.SNLE_HAS_LABS)return '<div class="page-content"><span class="eyebrow">INTERACTIVE LABS</span><h1>Your labs library</h1><p>The separate Interactive Labs collection is not available in this edition yet. Your clinical tools, posters and practice questions remain available.</p><button class="primary-button" data-nav="tools">Explore React &amp; Interact</button></div>';
      return `<div class="page-content labs-page" id="labs-page-container">
        <button class="snle-focus-toggle" data-snle-focus title="Toggle fullscreen focus mode">⛶ Focus View</button>
        <div id="labs-iframe-mount" style="width:100%; height:100%;"></div>
      </div>`;
    }
function render(){
      syncSnleRoute();const renderTicket=++snleRenderTicket;const account=app.querySelector('.hca-acct');if(account)document.body.append(account);
      document.body.classList.toggle('theme-blue-body',state.colorMode==='blue');
      document.documentElement.classList.toggle('theme-blue-html',state.colorMode==='blue');
      let content=state.view==='home'?home():state.view==='tools'?tools():state.view==='dossier'?clinicalDossierPage():state.view==='glossary'?glossaryPage():state.view==='labs'?labsPage():state.view==='guide'?guidePage():state.view==='reset'?resetPage():state.view==='progress'?progressView():(state.session.length?(state.tutorBreak?tutorBreakScreen():(state.index<state.session.length?(state.examSimulation?examQuestion():question()):result())):setup());

      const pageContent = app.querySelector('.page-content');
      const viewChanged = _agyPrevView !== null && _agyPrevView !== state.view;

      if (viewChanged && pageContent && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pageContent.classList.add('agy-page-exit');
        setTimeout(() => {
          if(renderTicket!==snleRenderTicket)return;
          app.innerHTML = shell(content);
          bind();
          if(state.arabicAssist) applyArabicHoverTranslations(app);
          const newPage = app.querySelector('.page-content');
          if (newPage) {
            newPage.classList.add('agy-page-enter');
            newPage.addEventListener('animationend', () => newPage.classList.remove('agy-page-enter'), { once: true });
          }
          _agyInitScrollReveals();
          _agyAnimateNumbers();
        }, 180);
      } else {
        app.innerHTML = shell(content);
        bind();
        if(state.arabicAssist) applyArabicHoverTranslations(app);
        _agyInitScrollReveals();
        _agyAnimateNumbers();
      }
      _agyPrevView = state.view;
    }

    /* ---- IntersectionObserver: Scroll-triggered card reveals ---- */
    let _agyObserver = null;
    function _agyInitScrollReveals() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!_agyObserver) {
        _agyObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('agy-visible');
              _agyObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      }
      /* Tag cards, KPI stats, journey sections, and tool cards for reveal */
      const selectors = [
        '.journey-card', '.tool-card', '.mode-card', '.stat-card',
        '.kpi-card', '.debrief-card', '.glossary-term-card',
        '.reset-card', '.dossier-card', '.blueprint-card',
        '.coach-card', '.guide-section', '.progress-card'
      ];
      const els = app.querySelectorAll(selectors.join(','));
      els.forEach((el, i) => {
        if (!el.classList.contains('agy-visible')) {
          el.classList.add('agy-reveal');
          el.style.transitionDelay = `${Math.min(i * 50, 400)}ms`;
          _agyObserver.observe(el);
        }
      });
    }

    /* ---- Animated number counters for KPI big numbers ---- */
    function _agyAnimateNumbers() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const numEls = app.querySelectorAll('[data-agy-count]');
      numEls.forEach(el => {
        const target = parseInt(el.getAttribute('data-agy-count'), 10);
        if (isNaN(target)) return;
        const duration = 800;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
          el.textContent = Math.round(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    /* ---- Topbar scroll shadow ---- */
    (function _agyTopbarShadow() {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const topbar = document.querySelector('.topbar');
            if (topbar) {
              if (window.scrollY > 10) {
                topbar.style.boxShadow = '0 2px 12px rgba(12,44,71,.10)';
              } else {
                topbar.style.boxShadow = '';
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    })();

    render();
  })();
  