// Regulators and exam specifications are versioned independently of the shared UI.
// "Provisional" parameters must not be represented as confirmed official examination rules.
export const PROFILES = Object.freeze({
 snle:{
  id:'snle',country:'Saudi Arabia',region:'Saudi Arabia',name:'SNLE',fullName:'Saudi Nursing Licensure Examination',regulator:'Saudi Commission for Health Specialties (SCFHS)',accent:'#087d72',stage:'Existing reference edition',verification:'SOURCE_VERIFIED',publishable:false,
  questions:200,minutes:240,blocks:[{questions:100,minutes:120},{questions:100,minutes:120}],breakMinutes:30,pass:'500 on a 200–800 scaled score; not 50%',passingType:'scaled',
  formatNote:'Two 100-question blocks, each 120 minutes, with a scheduled break. Current licensing instructions control.',
  domains:[{key:'fundamentals',label:'Nursing Fundamentals',count:40},{key:'adult',label:'Adult Nursing',count:80},{key:'maternal',label:'Maternal–Child Nursing',count:60},{key:'management',label:'Management and Leadership',count:20}],
  sources:[{label:'SCFHS Applicant Guide',url:'https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20.pdf'}],
  warning:'Source format is documented; the imported questions and posters still require independent clinical review.'
 },
 qatar:{
  id:'qatar',country:'Qatar',region:'Qatar',name:'DHP Registered General Nurse',fullName:'Qatar Registered General Nurse Qualifying Examination',regulator:'Department of Healthcare Professions (DHP), Ministry of Public Health',accent:'#8e3c58',stage:'First Gulf proof-of-concept',verification:'DURATION_CONFLICT',publishable:false,
  questions:150,minutes:180,blocks:null,breakMinutes:null,pass:'50% published minimum; not a personalized pass prediction',passingType:'published-percentage',
  formatNote:'The current DHP exam webpage lists 3 hours. Its older official blueprint PDF states 3½ hours. Verify at booking before claiming simulation fidelity.',
  domains:[{key:'fundamentals',label:'Nursing Fundamentals',count:30},{key:'adult',label:'Adult Nursing',count:61},{key:'maternal',label:'Maternal–Child Nursing',count:44},{key:'management',label:'Unit Management and Leadership',count:15}],
  sources:[{label:'Current DHP qualifying examinations',url:'https://dhp.moph.gov.qa/en/Pages/QualifyingExamination.aspx'},{label:'Official RN blueprint and reference PDF',url:'https://dhp.moph.gov.qa/en/Documents/NurseAndMidwiferyBlueprintAndReference.pdf'}],
  warning:'Blueprint allocations are documented. The official duration conflict and question-level clinical mapping remain open.'
 },
 dubai:{
  id:'dubai',country:'United Arab Emirates',region:'Dubai',name:'DHA Registered Nurse',fullName:'Dubai DHA Registered Nurse Assessment',regulator:'Dubai Health Authority (DHA)',accent:'#a97637',stage:'Second Gulf edition',verification:'CBT_ROW_PENDING',publishable:false,
  questions:null,minutes:null,blocks:null,breakMinutes:null,pass:'Not configured until the current DHA RN CBT row is independently verified',passingType:'unverified',
  formatNote:'A 150-question/3-hour/50% RN CBT format is publicly reported, but this edition will not assert it as authoritative until the current DHA specialty-specific guideline row is captured and reviewed.',
  domains:[{key:'fundamentals',label:'Nursing Fundamentals',count:null},{key:'adult',label:'Adult Nursing',count:null},{key:'maternal',label:'Maternal–Child Nursing',count:null},{key:'management',label:'Unit Management and Leadership',count:null}],
  sources:[{label:'Official DHA CBT assessment guideline',url:'https://dha.gov.ae/sheryan/wps/contenthandler/%21ut/p/digest%21L_negPqVWa2FDiru8UDKPw/war/SheryanHomeThemeStatic/themes/Portal8.5/docs/Final_Online_Exam_Guideline_CBT.pdf'},{label:'Official DHA Get Registered',url:'https://www.dha.gov.ae/sheryan/wps/portal/home/services-professional/service-description?CATALOGUE_TYPE=PROFESSIONAL&scode=NRG'}],
  warning:'Exact current RN exam row and any category weights require primary-source confirmation before an exam-length mock.'
 },
 abudhabi:{
  id:'abudhabi',country:'United Arab Emirates',region:'Abu Dhabi',name:'DOH Registered Nurse',fullName:'Abu Dhabi Department of Health Registered Nurse',regulator:'Department of Health – Abu Dhabi (DOH)',accent:'#526b96',stage:'Third Gulf edition',verification:'EXAM_SPEC_PENDING',publishable:false,
  questions:null,minutes:null,blocks:null,breakMinutes:null,pass:'Not verified',passingType:'unverified',
  formatNote:'The UAE unified PQR informs professional eligibility, not the exact DOH test timing, passing rules or nursing examination weights.',
  domains:[{key:'fundamentals',label:'Nursing Fundamentals',count:null},{key:'adult',label:'Adult Nursing',count:null},{key:'maternal',label:'Maternal–Child Nursing',count:null},{key:'management',label:'Management and Professional Practice',count:null}],
  sources:[{label:'DOH professional qualification requirements',url:'https://www.doh.gov.ae/en/pqr'},{label:'UAE common PQR guidance',url:'https://mohap.gov.ae/en/w/evaluation-of-health-professional'}],
  warning:'Regulator-specific RN blueprint, exam mode and scoring are unverified. Do not create an official-format simulation.'
 }
});
export const ORDER=['snle','qatar','dubai','abudhabi'];
export const DOMAIN_KEYS=['fundamentals','adult','maternal','management'];
export function getProfile(id){return PROFILES[id]||PROFILES.snle;}
export function assertBlueprint(profile){
 if(!Number.isInteger(profile.questions)||!Number.isInteger(profile.minutes))return {valid:false,reason:'Exam specification is pending primary-source verification'};
 if(!Array.isArray(profile.domains)||profile.domains.some(x=>!Number.isInteger(x.count)))return {valid:false,reason:'Exam domain allocations are not verified'};
 const sum=profile.domains.reduce((n,d)=>n+d.count,0);
 if(sum!==profile.questions)return {valid:false,reason:'Domain allocation total does not match question count'};
 if(profile.verification!=='SOURCE_VERIFIED')return {valid:false,reason:'One or more exam specifications remain unresolved'};
 return {valid:true,reason:'Blueprint arithmetic passes; content and release approval are separate gates'};
}
