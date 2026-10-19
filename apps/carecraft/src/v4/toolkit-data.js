/* Toolkit content. Every example is invented. Frameworks named here are recognised public frameworks (AHRQ TeamSTEPPS, AHRQ SHARE, IHI Model for Improvement,
   Gibbs, Just Culture). Nothing here is a clinical instruction, a statistic or a quotation; learners adapt it to their role and local policy. */
const TK_GROUPS=[
 {id:'hand',label:'Hand over',blurb:'Pass on what matters, and make sure someone owns it.'},
 {id:'speak',label:'Speak up',blurb:'Raise a concern or a difficult issue clearly and respectfully.'},
 {id:'explain',label:'Explain',blurb:'Help people understand, and decide together.'},
 {id:'check',label:'Check & decide',blurb:'Pause, appraise a claim and set priorities.'},
 {id:'reflect',label:'Reflect',blurb:'Learn from what happened, fairly and usefully.'},
 {id:'improve',label:'Improve',blurb:'Understand causes and test small changes safely.'},
 {id:'reset',label:'Reset',blurb:'Optional moments to look after yourself.'}
];
const TK_ALL_WHO=['Students','New graduates','Practising clinicians','Support workers'];
const TK_ROLE_NOTE='Use invented details only. Work within your role and local policy. This is a learning aid, not a clinical record, instruction or CPD credit.';
const TK_URGENT='In an emergency or if someone may be at risk now, use your local emergency or escalation process first. Do not delay it to complete a template.';

const TK_META={
 sbar:{group:'hand',level:'Starter',mins:5,icon:'sbar',tag:'Build an SBAR or ISBAR message with a live preview and a spoken script.'},
 huddle:{group:'hand',level:'Core',mins:8,icon:'debrief',tag:'Plan a team brief, adjust in a huddle, or run a fair debrief.'},
 medrec:{group:'hand',level:'Core',mins:8,icon:'med-transitions',tag:'Prompts for comparing medicine lists when care moves, without ever suggesting a change.'},
 doc:{group:'hand',level:'Starter',mins:6,icon:'documentation',tag:'Write a clear, factual note and check it against a documentation checklist.'},
 cus:{group:'speak',level:'Core',mins:6,icon:'speakup',tag:'Prepare a CUS message and your next step if the first is not heard.'},
 desc:{group:'speak',level:'Core',mins:8,icon:'conflict',tag:'Plan a respectful, specific conversation about a difficult issue.'},
 teach:{group:'explain',level:'Starter',mins:5,icon:'teachback-skill',tag:'Plan how to explain one point, invite the person’s own words and check again.'},
 shared:{group:'explain',level:'Core',mins:8,icon:'shared',tag:'Plan a shared-decision conversation using the five SHARE steps.'},
 risk:{group:'explain',level:'Stretch',mins:8,icon:'risk-evidence',tag:'Turn two fictional risks into natural frequencies, icon arrays and plain words.'},
 safety:{group:'check',level:'Starter',mins:3,icon:'safety',tag:'A short pause-and-check list with saved ticks.'},
 evidence:{group:'check',level:'Core',mins:10,icon:'ai',tag:'Appraise a claim, from a person, a leaflet or an AI answer, and plan to verify it.'},
 priority:{group:'check',level:'Starter',mins:5,icon:'reasoning',tag:'Sort your own tasks by urgency and importance, and see when to ask for help.'},
 reflect:{group:'reflect',level:'Starter',mins:8,icon:'humility',tag:'Reflect with Gibbs’ cycle or a quick What? So what? Now what?'},
 justculture:{group:'reflect',level:'Core',mins:10,icon:'just-culture',tag:'Look at an event through the system, the person’s view and a fair response.'},
 qi:{group:'improve',level:'Core',mins:12,icon:'improvement',tag:'Plan a small improvement test with the IHI questions and a PDSA cycle.'},
 fishbone:{group:'improve',level:'Core',mins:10,icon:'human-factors',tag:'Map possible contributors to a process problem, then plan how to test them.'},
 pause:{group:'reset',level:'Starter',mins:1,icon:'wellbeing',tag:'An optional quiet minute, at your own pace.',legacy:true,outputs:'Guided pause'},
 movement:{group:'reset',level:'Starter',mins:3,icon:'movement',tag:'Three optional seated movements, with demonstrations.',legacy:true,outputs:'Guided practice'}
};

const TK_SPECS={

/* ---------------------------------------------------------------- SBAR / ISBAR */
sbar:{
 title:'SBAR and ISBAR handover builder',sub:'Situation · Background · Assessment · Recommendation',
 purpose:'A short, structured message that makes the concern, the context and the request unmistakable, whether you say it on the phone, at the bedside or write it down. ISBAR adds Identify at the start so the listener knows who you are and who it is about.',
 use:['Handing over a concern or a change to a colleague, team or another service.','Preparing a phone call or written message before you make it.','Practising until the structure comes easily when you are busy.'],
 notUse:['When someone may be at risk now: call for help through your local emergency process first.','As a clinical record, or instead of your organisation’s approved handover tool.','With real names or identifiers. Use invented details here.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['sbar','documentation'],acts:['sbar-studio','sim-handover'],ev:'handoff',refs:['team','research-handoff'],
 safety:TK_URGENT,
 pitfalls:[['Burying the request','Putting the “ask” last in a long story. Say what you need early, then give the reasons.'],['Mixing fact and opinion','State what you saw, measured or were told before you say what you think it means.'],['Assuming it was understood','A message is not handed over until the listener can say the plan back.'],['Vague timing','“Soon” means different things to different people. Give a time or a trigger.']],
 checks:['I have said who I am, who I am speaking to and who this is about, using approved identifiers.','I have said how urgent this is.','I can separate what I observed from what I think.','I know what I am asking for, from whom and by when.','I have a plan if I do not get a response, using the local escalation route.','I will ask the listener to say the plan back.'],
 modes:[
 {id:'sbar',label:'SBAR',key:'sbar',doc:'SBAR handover draft',
  fields:[
   {n:'Situation',l:'Situation: what is happening now, and how urgent is it?',h:'Who it is about and the immediate concern, in a sentence or two.',p:'The planned review has not been arranged and the transfer is this afternoon…',r:3},
   {n:'Background',l:'Background: the context that changes the next decision',h:'Only what the listener needs: recent changes, relevant history, what has already been tried.',p:'The plan agreed on admission includes…',r:3},
   {n:'Assessment',l:'Assessment: what you observed, your concern and your uncertainty',h:'Facts first (seen, measured, told), then what worries you. Say what you do not know. Stay within your role.',p:'I have seen… I am concerned that… I am not sure whether…',r:3},
   {n:'Recommendation',l:'Recommendation: what you need, from whom and by when',h:'A specific request with an owner and a time.',p:'Could you… by…?',r:3},
   {n:'Close the loop',l:'Close the loop: the plan said back, and the back-up',h:'Ask the listener to say back the plan. Agree what happens if it does not happen.',p:'To confirm, you will… If I have not heard by…, I will…',r:3}],
  steps:[{b:'S',t:'Situation',f:[0]},{b:'B',t:'Background',f:[1]},{b:'A',t:'Assessment',f:[2]},{b:'R',t:'Recommendation',f:[3]},{b:'↺',t:'Close the loop',f:[4]}],shape:'chain',
  cues:[
   {t:'Situation is short (about 60 words or fewer)',f:0,fn:t=>t.trim().split(/\s+/).length<=60},
   {t:'Assessment states a concern or an uncertainty',f:2,re:/(concern|worr|uncertain|not sure|may |might|don’t know|do not know|unsure)/i},
   {t:'Recommendation asks for something specific',f:3,re:/(please|could you|can you|would you|i (need|would like|am asking|request)|request)/i},
   {t:'A time or deadline is stated',f:3,re:/(\bby\b|within|before|today|\bnow\b|this (morning|afternoon|evening)|\d{1,2}([:.]\d\d)?\s?(am|pm)\b|\d+\s?(min|minutes|hour|hours)|tonight|tomorrow)/i},
   {t:'The loop is closed with a confirmation and a back-up',f:4,fn:t=>/(confirm|read back|repeat|say back)/i.test(t)&&/(if |otherwise|escalat|ring again|call again|speak to)/i.test(t)}],
  weak:{v:['A review is needed.','It came up earlier.','Someone probably knows.','Please follow up.','I have passed it on.'],why:['No person, place or urgency, so the listener cannot tell what “a review” is or how soon it matters.','No context, so the listener cannot judge what has changed.','Opinion without observation. “Probably” hides what you know and what you do not.','“Follow up” does not say who, what or by when.','Passing it on is not the same as the plan being understood and owned.']},
  examples:[
   {s:'Hospital ward',t:'A review that has no owner',v:[
    'I am calling about Mr A (fictional) in bay 2. The mobility review agreed at this morning’s board round has not been requested, and he is due to be moved for discharge planning this afternoon.',
    'A plan agreed on admission says he has a mobility review before any move. The board round noted the review but did not name who would request it.',
    'I have not found a request in the record. I am concerned the plan could be missed during the move. I may not have the full picture, so I want to check with you.',
    'Could you tell me who will request the review, and whether it can happen before the move? I need an answer by 2 pm so I can tell the transfer team.',
    'To confirm: you will arrange the review today and tell me the time. If I have not heard by 2 pm, I will ring you again and speak to the nurse in charge.'],
    why:['The request and the deadline are in the first half, not buried.','Observation (“have not found a request”) is kept apart from concern.','The loop names a back-up: the nurse in charge.']},
   {s:'Community visit',t:'Equipment the care plan expects',v:[
    'I am a support worker visiting Mrs B (fictional) at home. The shower seat in her care plan has not arrived and she is managing without it.',
    'The plan was updated last week to include the seat. Mrs B says she was told it would come “soon”.',
    'She says she is managing but is worried about getting in and out of the shower. I cannot judge the risk myself, and I am concerned.',
    'Please can you find out when the seat will be delivered and tell me what Mrs B should do until then? I need a reply today so I can tell her before I leave.',
    'I will note this on the visit record and ring you at 4 pm. If I cannot reach you I will call the on-call line.'],
    why:['The support worker names the limit of their role (“cannot judge the risk myself”).','The request has an owner (“you”), a time (“today”) and a reason.','The follow-up call has a clock time and a route if it fails.']},
   {s:'Care home',t:'A change from someone’s usual',v:[
    'At handover I want to flag that Mr C (fictional) has eaten less than usual at his last three meals.',
    'He moved here two weeks ago. His usual pattern, from his care plan and his daughter, is a good appetite at lunch.',
    'I do not know the reason and it may be nothing. It is a change from his usual and it has lasted a day, so I am concerned.',
    'Could the nurse in charge review him today, and tell the night staff what to watch for and when to call?',
    'Night staff: please say back what you will watch for. If he refuses fluids or seems worse, call the nurse in charge straight away.'],
    why:['“Usual” is defined, so the change is clear.','Uncertainty is said aloud (“it may be nothing”) without hiding the concern.','The listener is asked to say back what they will do.']}]},
 {id:'isbar',label:'ISBAR',key:'sbar-isbar',doc:'ISBAR handover draft',
  fields:[
   {n:'Identify',l:'Identify: who you are, your role, who you are speaking to and who it is about',h:'Use approved identifiers in real life. Here, invented details only.',p:'This is Sam, a staff nurse on Ward 3, speaking to…',r:2,i:5},
   {n:'Situation',l:'Situation: what is happening now, and how urgent is it?',h:'The immediate concern, in a sentence or two.',p:'The planned review has not been arranged…',r:3,i:0},
   {n:'Background',l:'Background: the context that changes the next decision',h:'Only what the listener needs.',p:'The plan agreed on admission includes…',r:3,i:1},
   {n:'Assessment',l:'Assessment: what you observed, your concern and your uncertainty',h:'Facts first, then concern. Say what you do not know.',p:'I have seen… I am concerned that…',r:3,i:2},
   {n:'Recommendation',l:'Recommendation: what you need, from whom and by when',h:'A specific request with an owner and a time.',p:'Could you… by…?',r:3,i:3},
   {n:'Close the loop',l:'Close the loop: the plan said back, and the back-up',h:'Ask the listener to say back the plan.',p:'To confirm… If I have not heard by…',r:3,i:4}],
  steps:[{b:'I',t:'Identify',f:[0]},{b:'S',t:'Situation',f:[1]},{b:'B',t:'Background',f:[2]},{b:'A',t:'Assessment',f:[3]},{b:'R',t:'Recommendation',f:[4]},{b:'↺',t:'Close the loop',f:[5]}],shape:'chain',
  cues:[
   {t:'You say who you are and your role',f:0,re:/(this is|i am|i’m|my name|speaking)/i},
   {t:'Situation is short (about 60 words or fewer)',f:1,fn:t=>t.trim().split(/\s+/).length<=60},
   {t:'Recommendation asks for something specific',f:4,re:/(please|could you|can you|would you|i (need|would like|am asking|request)|request)/i},
   {t:'A time or deadline is stated',f:4,re:/(\bby\b|within|before|today|\bnow\b|this (morning|afternoon|evening)|\d{1,2}([:.]\d\d)?\s?(am|pm)\b|\d+\s?(min|minutes|hour|hours)|tonight|tomorrow)/i},
   {t:'The loop is closed with a confirmation and a back-up',f:5,fn:t=>/(confirm|read back|repeat|say back)/i.test(t)&&/(if |otherwise|escalat|ring again|call again|speak to)/i.test(t)}],
  weak:{v:['Hi.','A review is needed.','It came up earlier.','Someone probably knows.','Please follow up.','I have passed it on.'],why:['The listener does not know who is calling, from where, or about whom.','No person, place or urgency.','No context.','Opinion without observation.','No owner, task or time.','Passing it on is not a shared plan.']},
  examples:[
   {s:'Hospital ward',t:'Phone call to a coordinator',v:[
    'This is Sam, a staff nurse on Ward 3 (fictional), speaking to the discharge coordinator, about Mr A in bay 2.',
    'The mobility review agreed at this morning’s board round has not been requested, and he is due to be moved this afternoon.',
    'A plan agreed on admission says he has a mobility review before any move. Nobody was named to request it.',
    'I cannot find a request in the record. I am concerned the plan could be missed during the move, and I may not have the full picture.',
    'Could you tell me who will request the review, and whether it can happen before the move? I need an answer by 2 pm.',
    'To confirm: you will arrange it today and tell me the time. If I have not heard by 2 pm, I will ring again and speak to the nurse in charge.'],
    why:['The first sentence tells the listener who, where and about whom.','Urgency and deadline appear before the detail.','The back-up route is agreed in advance.']},
   {s:'Student on placement',t:'Asking your supervisor for help',v:[
    'This is Priya, a second-year student on placement (fictional), speaking to my supervisor, about Mr D’s afternoon plan.',
    'I was asked to help Mr D walk to the day room, but I have not yet been shown how to use his walking aid safely.',
    'I have watched it done once. I do not feel safe doing it alone, and I do not want to guess.',
    'I am concerned I could do it wrongly. This is outside what I have been taught so far.',
    'Could you or another staff member show me, or do it with me, before the 3 pm walk?',
    'To confirm: you will come with me at 3 pm. If you are busy, I will wait and ask the nurse in charge for someone else.'],
    why:['The student states a limit of competence clearly and without apology.','Asking for supervision is framed as a safety step, not a weakness.','There is a back-up person if the first is unavailable.']}]}
 ]},

/* ---------------------------------------------------------------- Huddle / brief / debrief */
huddle:{
 title:'Brief, huddle and debrief',sub:'Align before, adjust during, learn after',
 purpose:'Three short team conversations. A brief sets the plan and who owns each action. A huddle adjusts the plan when something changes. A debrief looks at what helped and what got in the way, so the team learns without blaming individuals.',
 use:['Before a shift, session or shared task: agree purpose, roles and contingencies.','When something changes and the team needs to regroup quickly.','Afterwards, to turn an event, good or difficult, into one or two agreed actions.'],
 notUse:['As a clinical staffing, acuity or allocation tool. Those follow your service’s own processes.','To assign blame. A debrief looks at conditions and systems, not just individuals.','In place of immediate help. If someone needs urgent support, get it first.'],
 who:['Practising clinicians','Support workers','New graduates','Students'],
 lessons:['debrief','human-factors','inclusive-leadership'],acts:['huddle','sim-interruptions'],ev:'simulation',refs:['team'],
 safety:'This is a communication and team-learning template. Keep personal and patient details out of it.',
 pitfalls:[['“Everyone helps”','If everyone owns it, no one does. Name one owner per action.'],['No contingency','A plan without “if this changes, then…” has no room for reality.'],['A debrief that only praises, or only blames','Ask what helped and what got in the way. Look for conditions you can change.'],['No action at the end','A conversation that ends without one owned action rarely changes anything.']],
 checks:['Everyone has had a chance to speak, including the quietest voice.','We talked about conditions and systems, not just individuals.','We agreed one or two actions, each with an owner and a date.','Anyone affected has been offered support through local routes.','Wider learning has gone to the right place through the local reporting route.'],
 modes:[
 {id:'board',label:'Brief · huddle · debrief board',key:'huddle',doc:'Brief, huddle and debrief board',
  fields:[
   {n:'Shared purpose',l:'Shared purpose: what are we trying to achieve?',h:'One sentence the whole team could say back.',p:'Prepare the session so that…',r:2},
   {n:'Roles',l:'Roles: who owns each next action?',h:'Name one owner for each action.',p:'Alex checks…; Sam checks…',r:3},
   {n:'Constraints',l:'Constraints: what has changed or needs support?',h:'New information, missing resources, competing demands.',p:'The room has changed and…',r:3},
   {n:'Contingency',l:'Contingency: when and how will we regroup?',h:'A time or trigger to meet again, and a plan B.',p:'We regroup at… If… then…',r:3},
   {n:'Debrief',l:'Debrief: what helped, what got in the way, what will change?',h:'One thing to keep, one thing to change, and an owner.',p:'What helped was… Next time we will…',r:3}],
  steps:[{b:'B',t:'Brief (before)',f:[0,1]},{b:'H',t:'Huddle (as things change)',f:[2,3]},{b:'D',t:'Debrief (after)',f:[4]}],shape:'chain',
  cues:[
   {t:'Roles name specific people or roles',f:1,re:/\b[A-Z][a-z]+ (checks|confirms|sends|leads|owns|will|takes|books|calls)|;|\bowner\b/},
   {t:'There is a time or trigger to regroup',f:3,re:/(\bat\b|before|after|when|if |by )/i},
   {t:'The debrief includes a change and who owns it',f:4,re:/(next time|will change|we will|agree|owner|by )/i}],
  weak:{v:['Get everything done.','Everyone helps.','No issues expected.','We will manage somehow.','It was fine.'],why:['Too broad to check. Nobody could say when it is done.','Everyone owning it means no one does.','Plans meet reality. Naming the constraints is the point of a brief.','“Somehow” is not a contingency.','Nothing to keep, change or own.']},
  examples:[
   {s:'Hospital ward',t:'Start-of-shift brief',v:[
    'Make sure each person in bay 3 has their plan for the day clear to the team, and that tasks due before lunchtime have an owner.',
    'Jo leads the board round for the bay; Kim confirms the transfer times with the porters; Lee checks the equipment is where the plan says it should be.',
    'Two staff are on a training session this morning and one bed is being prepared for a new arrival.',
    'We meet again at 11:30. If the new arrival comes earlier, Kim tells Jo and we re-agree who covers the board round.',
    'After the shift: keep the 11:30 regroup. Change: confirm transfer times before the board round, not after. Owner: Kim.'],
    why:['The purpose can be checked by the end of the morning.','Each action has one named owner.','The regroup has a time and an “if”.']},
   {s:'Community team',t:'Team huddle after a change',v:[
    'Make sure everyone on today’s visit list knows who is covering Mrs E’s calls after a colleague’s absence.',
    'Ana re-plans the visit order; Ben phones the people whose times will move; Cass tells the office which calls are re-allocated.',
    'The schedule changed overnight and two visits are now close together. Ben’s car is being serviced.',
    'Quick check at 10:00. If any visit will be more than 30 minutes late, Ben calls the person and tells Ana.',
    'At the end of the day: tell the office the same evening when plans change. Owner: Ana.'],
    why:['The huddle is a short regroup about a change, not a long meeting.','The constraint is named honestly.','The trigger for action is concrete.']}]},
 {id:'debrief',label:'Structured debrief',key:'huddle-debrief',doc:'Structured team debrief',
  fields:[
   {n:'What we planned',l:'What we planned or expected',h:'The plan or goal, in neutral words.',p:'We planned to…',r:2},
   {n:'What happened',l:'What actually happened',h:'Facts and sequence. No labels or blame.',p:'In practice…',r:3},
   {n:'What helped',l:'What helped',h:'People, tools or conditions to keep.',p:'It helped that…',r:3},
   {n:'What got in the way',l:'What got in the way',h:'Conditions, not character. Interruptions, information, equipment, communication.',p:'It was harder because…',r:3},
   {n:'What we change',l:'What we will change, who owns it and when we will look again',h:'One or two actions. A named owner. A review date.',p:'We will… Owner… Review…',r:3}],
  steps:[{b:'1',t:'Plan',f:[0]},{b:'2',t:'What happened',f:[1]},{b:'3',t:'What helped',f:[2]},{b:'4',t:'What got in the way',f:[3]},{b:'5',t:'Change',f:[4]}],shape:'chain',
  cues:[
   {t:'Describes what happened without labels',f:1,fn:t=>!/\b(careless|lazy|stupid|incompetent|always|never)\b/i.test(t)},
   {t:'Names something that helped',f:2,re:/\S{4}/},
   {t:'Names a condition, not only a person',f:3,re:/(interrupt|busy|workload|equipment|process|information|communicat|time|noise|space|staffing|handover|form|template)/i},
   {t:'The action has an owner and a date',f:4,fn:t=>/(owner|will lead|lead:|\b[A-Z][a-z]+ will)/.test(t)&&/(by |review|next week|friday|monday|tuesday|wednesday|thursday|weeks?)/i.test(t)}],
  weak:{v:['Do it again.','Went badly.','It went fine.','Some people were not paying attention.','Try harder next time.'],why:['No plan stated, so there is nothing to compare with.','A verdict, not a description.','Nothing the team can learn from.','Points at people, not at conditions that can change.','No action, owner or review date.']},
  examples:[
   {s:'After a busy shift',t:'A hot debrief in ten minutes',v:[
    'We planned to move two people to the day room before lunch with the equipment ready.',
    'The first move was on time. The second was late because the hoist was in use elsewhere and we did not know until we went to get it.',
    'The brief at the start named who was doing each move. People asked for help early.',
    'There is no easy way to see where shared equipment is. We found out by walking round.',
    'Add a “where is shared equipment?” line to the morning brief. Owner: Jo. We will look again at Friday’s brief.'],
    why:['The neutral timeline separates facts from verdicts.','One thing that helped is kept as well as one thing changed.','The action is small, owned and dated.']},
   {s:'Student group',t:'Learning from a simulation',v:[
    'We planned to practise a handover using SBAR in pairs and then swap roles.',
    'The first pair ran out of time before the recommendation, and the listener did not say the plan back.',
    'The structure card on the table helped us keep to order.',
    'We started with too much background, and there was no timer.',
    'Next round, one minute timer and the listener says the plan back. Owner: Ravi (timer). We will repeat next week.'],
    why:['The group looks at conditions it can change: the timer, the structure.','It names a helpful tool as well as a problem.','The action has one owner and a date.']}]}
 ]},

/* ---------------------------------------------------------------- Medication reconciliation prompts */
medrec:{
 title:'Medicine list comparison prompts',sub:'Gather · Compare · Clarify · Communicate · Check',
 purpose:'Prompts to help you compare medicine lists when someone moves between settings, so differences are noticed, explained and passed on. It never suggests doses, changes or stopping anything. Those decisions belong to the prescriber and pharmacist under local policy.',
 use:['Preparing to take part in a medicines check at admission, transfer or discharge, within your role.','Learning what questions to ask the person, and what to hand on.','Practising how to describe a difference without guessing the reason.'],
 notUse:['To decide whether a medicine is right, or to change, start or stop anything.','To replace your service’s approved medicines reconciliation process.','With real medicine lists or identifiers. Use invented details.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['med-transitions','safety'],acts:['cc-reconcile','med-case'],ev:'medication',refs:['med','research-medication'],
 safety:'Follow your local medicines policy. Anything unclear goes to the person who can decide, such as the prescriber or pharmacist. Nothing here is advice about a medicine.',
 pitfalls:[['Relying on one list','Lists can be out of date or incomplete. Use at least two sources and ask the person.'],['Forgetting what is not prescribed','Over-the-counter items, herbal products, creams, inhalers and patches may not be on any list.'],['Guessing the reason','A difference may be intended or not. Record it as unexplained until someone who can decide says.'],['Not telling the person','The person needs to understand their list. Teach-back helps.']],
 checks:['I asked the person (and family or carer, if the person wishes) what they actually take, including anything not prescribed.','I used at least two sources and noted which.','I compared the lists line by line.','Every difference has a reason recorded, or an owner to find out.','Anything unclear has gone to the person who can decide, by the local route.','The updated list is clear to the person and shared with the next service.'],
 modes:[{id:'prompts',label:'Prompts',key:'medrec',doc:'Medicine list comparison draft',
  fields:[
   {n:'The transition',l:'The transition: where is care moving from and to?',h:'For example hospital to home, or home to a care home.',p:'Moving from… to…',r:2},
   {n:'Sources',l:'Sources I will use: at least two, and what each can tell me',h:'The person and family, a previous list, a repeat record, the medicines themselves, a pharmacy record: whatever local policy allows.',p:'The person; the transfer list; the…',r:3},
   {n:'Differences',l:'What looks different between the lists?',h:'List every difference without judging: missing, extra, different form or timing, unclear.',p:'The transfer list shows… the home list shows…',r:3},
   {n:'Clarify',l:'Which differences are explained, which are not, and who can clarify?',h:'Mark each as “explained” or “unexplained”, with the name or role who can decide.',p:'Explained by… Unexplained: ask…',r:3},
   {n:'Communicate',l:'How will the updated list reach the next person, and the person themselves?',h:'Who receives it, in what form and by when.',p:'The updated list goes to… by…',r:3},
   {n:'Check understanding',l:'Teach-back: how will the person explain their medicines in their own words?',h:'An invitation that checks your explanation, not their memory.',p:'To check I explained clearly, could you tell me…',r:3}],
  steps:[{b:'1',t:'Gather',f:[0,1]},{b:'2',t:'Compare',f:[2]},{b:'3',t:'Clarify',f:[3]},{b:'4',t:'Communicate',f:[4]},{b:'5',t:'Check',f:[5]}],shape:'chain',
  cues:[
   {t:'More than one source is named',f:1,fn:t=>/( and |,|;|\+|\n)/.test(t)&&t.trim().length>12},
   {t:'Differences are described without a reason being assumed',f:2,fn:t=>!/\b(obviously|clearly mistake|must be|probably)\b/i.test(t)},
   {t:'Unexplained differences have someone to ask',f:3,re:/(ask|prescriber|pharmacist|doctor|clinician|GP|nurse in charge)/i},
   {t:'Teach-back is an invitation, not “do you understand?”',f:5,fn:t=>!/do you understand/i.test(t)&&/(in your own words|tell me|show me|explain)/i.test(t)}],
  weak:{v:['Going home.','Looked at the list.','Some things are different.','Left it for someone else.','Gave the person the paper.','Asked if they understood.'],why:['Where from and where to is missing, so the list may not be compared with the right one.','One source, not named.','“Some things” cannot be acted on.','No owner, no route for the unexplained difference.','Handing over a paper is not the same as being understood.','“Do you understand?” invites “yes”.']},
  examples:[
   {s:'Hospital to home',t:'Discharge medicines check',v:[
    'Moving from a hospital ward to home (fictional). Mr F lives with his daughter.',
    'Mr F himself; his daughter; the discharge list; his home list from last month; the medicines he brought in a bag.',
    'The discharge list has a medicine not on his home list. One tablet on his home list is not on the discharge list. He says he also uses a cream not written anywhere.',
    'The new medicine: explained in the discharge summary. The tablet missing from the discharge list: unexplained, so ask the pharmacist. The cream: tell the prescriber so it can be recorded.',
    'The updated list goes to Mr F and his daughter, and to the community pharmacist and practice, today before he leaves.',
    'To check I explained clearly, could you tell me in your own words what you will take each morning and who you will ring with a question?']},
   {s:'Care home admission',t:'Comparing the transfer list',v:[
    'Moving from home to a care home (fictional). Mrs G has just moved in.',
    'Mrs G; her son; the transfer list from the practice; the pharmacy’s dispensing list; the medicines delivered with her.',
    'Two lists show a different timing for one medicine. A third item is listed as “as needed” on one list and as regular on another.',
    'Both are unexplained. Ask the prescriber and the pharmacist through the local route before the next medicines round.',
    'The reconciled list goes to the care home team, the practice and Mrs G’s son, in the format the home uses.',
    'I will invite Mrs G to tell me what she understands about her medicines, and I will ask her son what would help.']}]}]},

/* ---------------------------------------------------------------- Documentation */
doc:{
 title:'Documentation builder and checklist',sub:'Write so the next person can act',
 purpose:'Practise writing a short, factual note that says what you observed, what was done, who was told and what happens next, then check it against a documentation checklist. A live scan points out vague words you may want to make specific.',
 use:['Practising notes before you write in a real record, using invented details.','Reviewing a draft against a checklist of good habits.','Teaching colleagues what a clear entry looks like.'],
 notUse:['As a clinical record. Real documentation follows your organisation’s policy and systems.','To store anyone’s real information. Use fictional details only.','To change or add to an existing record. Follow local late-entry policy.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['documentation','data-stewardship'],acts:['sbar-studio'],refs:['patient'],
 safety:'This is practice writing. Real records follow your organisation’s policy, the law and your professional standards.',
 pitfalls:[['Vague words','“Comfortable”, “fine” and “normal” mean different things to different readers. Say what you saw or heard.'],['Labels instead of facts','Describe behaviour and the person’s own words rather than judging them.'],['No next step','The next reader needs to know what happens next, who owns it and by when.'],['Writing for yourself','Imagine a colleague who was not there. Could they act on what you wrote?']],
 checks:['It is the right record for the right person, and it is dated and timed.','It says what I saw, heard or measured, not my guess.','Where the person’s own words matter, I quoted them.','It says what was done, by whom, and why it mattered.','It says who was told and what was agreed.','The next step has an owner and a time.','I used plain words and only locally approved abbreviations.','It is signed with my role. A late entry is marked as late, and nothing was changed outside local policy.'],
 modes:[{id:'note',label:'Note builder',key:'doc',doc:'Documentation practice note',
  fields:[
   {n:'Observed',l:'What I observed or was told, with the time',h:'Facts first: seen, heard, measured. The person’s own words in quotes where useful.',p:'14:10 Mrs D said…',r:3},
   {n:'Did',l:'What I did or what was done',h:'Actions in order, and who was involved.',p:'I…',r:3},
   {n:'Told',l:'Who I told, and their response',h:'Name the role, the time and what they said or agreed.',p:'I told the nurse in charge at…',r:3},
   {n:'Next',l:'What happens next: owner and time',h:'One or two next steps, each with who and when.',p:'Review by… Recheck at…',r:3}],
  steps:[{b:'1',t:'Observed',f:[0]},{b:'2',t:'Did',f:[1]},{b:'3',t:'Told',f:[2]},{b:'4',t:'Next',f:[3]}],shape:'chain',
  cues:[
   {t:'A time is recorded',f:0,re:/(\b\d{1,2}[:.]\d\d\b|\b\d{1,2}\s?(am|pm)\b|\bat \d)/i},
   {t:'No vague words found (such as fine, normal, comfortable)',f:-1,bad:true,re:/\b(ok|okay|fine|normal|stable|appropriate|usual|as expected|good|poor|seems?|appeared|satisfactory|unremarkable|comfortable|settled)\b/i,list:true},
   {t:'Says who was told',f:2,re:/(told|informed|asked|handed over|spoke|discussed)/i},
   {t:'The next step has a time or an owner',f:3,re:/(\bby\b|\bat\b|before|after|today|tomorrow|owner|will|\d{1,2}[:.]\d\d)/i}],
  weak:{v:['Patient seemed fine today.','Did usual care.','Told staff.','Will keep an eye.'],why:['“Seemed fine” is a guess. It gives the next reader nothing to compare with.','“Usual” means different things to different people.','Which staff, when, and what did they say?','No owner, no time, no trigger.']},
  examples:[
   {s:'Hospital ward',t:'A change in how someone moves',v:[
    '14:10 Mrs D (fictional) said, “My left leg feels heavy when I stand.” She walked five metres with her frame and one helper, then asked to sit.',
    'I sat her in the chair, stayed with her and asked a colleague to bring the nurse in charge.',
    'At 14:20 I told the nurse in charge what Mrs D said and what I saw. She came to see Mrs D and asked me to record this note.',
    'The nurse in charge will review Mrs D by 14:40. I will stay with her until then and tell the nurse in charge straight away if anything changes.'],
    why:['Time, the person’s words and what you saw are all in the first line.','Who was told, when, and what happened next are stated.','The next step has an owner and a time.']},
   {s:'Community visit',t:'Visit note with an agreed follow-up',v:[
    '09:30 At the visit Mr H (fictional) said he had not been able to open his post for a week. Three letters were unopened on the table.',
    'I read the letters aloud with his agreement. Two were routine. One asked him to book an appointment.',
    'I told my team leader by phone at 10:15. She will ask the practice how Mr H can be supported to book.',
    'The team leader will call me back by 12:00. I will pass Mr H the answer at tomorrow’s visit if it is not sooner.'],
    why:['The person’s situation is described, not judged.','The support worker records their action and who they told.','There is a callback time and a fallback.']},
   {s:'Care home',t:'End-of-shift entry',v:[
    '20:00 Mr J (fictional) ate about half of his evening meal and drank two cups of tea. He said, “I’m just not hungry tonight.”',
    'I offered a snack at 21:00. He declined, and I left a drink and snack within reach.',
    'I told the night nurse at 21:30 and recorded the same in the handover sheet.',
    'The night team will offer a drink and snack at 23:00 and record what he takes. The day team will be told at 07:30.'],
    why:['Amounts and the person’s own words replace “ate poorly”.','Each action is dated and timed.','The next shift knows what is expected of them.']}]}]},

/* ---------------------------------------------------------------- CUS */
cus:{
 title:'CUS and escalation script builder',sub:'Concerned · Uncomfortable · Safety issue · and what happens next',
 purpose:'A script for raising a concern so it cannot be missed. CUS (Concerned, Uncomfortable, Safety issue) is a TeamSTEPPS phrase that rises in strength. If the first message is not acknowledged, the Two-Challenge Rule says to voice it again. This tool helps you draft both messages and your next step.',
 use:['Preparing to raise a concern with a senior colleague, a peer or another team.','Practising words that are clear, respectful and hard to misread.','Planning what you will do if the first message is not heard.'],
 notUse:['In an emergency: use direct words and your local emergency or rapid-response process immediately.','For bullying, harassment or abuse: use the dedicated local routes and support.','As a way to avoid a conversation you can safely have face to face.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['speakup','deterioration'],acts:['cus','sim-handover'],ev:'handoff',refs:['team'],
 safety:TK_URGENT,
 pitfalls:[['Waiting to be certain','You do not need proof to raise a concern, only an honest observation.'],['Hinting','“Is it me, or…?” can be missed. Say what you saw and what you are asking for.'],['Blaming words','“You always…” makes people defend. Describe the situation and the risk instead.'],['Stopping after the first no','If the concern stands, say it again and use the local escalation route.']],
 checks:['I have said what I saw or heard, in plain words.','I have said why it matters for safety.','I have asked for a specific response.','I know who I will go to next if it is not resolved, within local policy.','If it is urgent, I will say so and use the emergency route.'],
 modes:[{id:'script',label:'Script',key:'cus',doc:'CUS and escalation script',script:true,
  fields:[
   {n:'Who and when',l:'Who I need to speak to, and the right moment',h:'If it is not an emergency, choose a moment and place where you can be heard.',p:'The nurse in charge, before the move…',r:2,i:4},
   {n:'Concerned',l:'Concerned: what I saw or heard, and why it matters to me',h:'Start with “I am concerned that…” and name the observation.',p:'I am concerned that…',r:2,i:0},
   {n:'Uncomfortable',l:'Uncomfortable: what I cannot go along with yet',h:'Start with “I am uncomfortable…” and name what is unresolved.',p:'I am uncomfortable proceeding until…',r:2,i:1},
   {n:'Safety issue',l:'Safety issue: the specific risk, in plain words',h:'Start with “This is a safety issue because…” and say what could happen.',p:'This is a safety issue because…',r:2,i:2},
   {n:'Request and route',l:'What I am asking for, and the escalation route if there is no response',h:'A clear request, then the local route you will use next.',p:'Please… If this is not resolved, I will…',r:3,i:3},
   {n:'If not heard',l:'If it is still not resolved: my second challenge or next step',h:'The Two-Challenge Rule: say it again, then use the local route.',p:'I will say it again and then speak to…',r:3,i:5}],
  steps:[{b:'C',t:'Concerned',f:[1]},{b:'U',t:'Uncomfortable',f:[2]},{b:'S',t:'Safety issue',f:[3]},{b:'↑',t:'Ask and escalate',f:[4,5]}],shape:'ladder',
  scriptOrder:[1,2,3,4,5],
  cues:[
   {t:'Begins with the observation, not a judgement',f:1,fn:t=>/^(i am concerned|i’m concerned|i have|i saw|i noticed)/i.test(t.trim())||/concerned that/i.test(t)},
   {t:'No blaming words (you always, you never)',f:-1,bad:true,re:/\byou (always|never)\b/i},
   {t:'The safety issue says what could happen',f:3,re:/(could|may|might|risk|harm|fall|miss|injur|wrong)/i},
   {t:'The request is specific',f:4,re:/(please|could you|can you|i need|i am asking)/i},
   {t:'A next step is planned if it is not heard',f:5,re:/(again|escalat|speak to|nurse in charge|manager|supervisor|senior|route|policy)/i}],
  weak:{v:['Catch the manager when they are free.','Something is wrong.','I do not like it.','Something could go wrong.','Someone should do something.','I will let it go.'],why:['No moment or person is chosen, so the message may never be delivered.','Does not say what the listener should notice.','Feelings without the situation: the listener cannot act on it.','No specific risk, so it sounds like worry rather than a safety issue.','No request and no owner.','No second step, so a single brush-off ends it.']},
  examples:[
   {s:'Hospital ward',t:'Before a move without the agreed aid',v:[
    'The nurse in charge, now, before the move starts. It is not an emergency, but it is time-sensitive.',
    'I am concerned that Mr A is about to be moved to the chair without the walking aid his plan says he uses.',
    'I am uncomfortable going ahead until we have checked the plan.',
    'This is a safety issue because he could fall during the move.',
    'Please can we pause and check the plan with the physiotherapist, or have another member of staff help. I will stay with him until we agree.',
    'If we still cannot agree, I will say it again and ask the senior nurse on call to help us decide.']},
   {s:'Student on placement',t:'A worn piece of equipment',v:[
    'My supervisor, as soon as I can speak to her, before the next transfer.',
    'I am concerned that the sling for Mrs K looks frayed at one edge.',
    'I am uncomfortable using it until someone has checked it.',
    'This is a safety issue because it may not hold her safely.',
    'Please can we use another sling, or have it checked first. I will not use this one until then.',
    'If I am told to use it anyway, I will ask the nurse in charge and report the sling through the local equipment route.']},
   {s:'Support worker',t:'A missing step in the care plan',v:[
    'The registered nurse who supervises my visits, by phone, before I leave the house.',
    'I am concerned that Mr L’s care plan says to use a bed rail, but the rail has not been fitted.',
    'I am uncomfortable continuing the visit as planned until we know what to do instead.',
    'This is a safety issue because he could fall out of bed overnight.',
    'Please can you tell me what to do tonight, and arrange for the rail or another plan to be put in place. I need to know before I leave.',
    'If I cannot reach you, I will call the on-call line and record what I was told.']}]}]},

/* ---------------------------------------------------------------- DESC */
desc:{
 title:'DESC conversation planner',sub:'Describe · Express · Suggest · Consequences',
 purpose:'A way to prepare a respectful, specific conversation about a behaviour or process that is getting in the way. DESC, from AHRQ TeamSTEPPS, stands for Describe the situation, Express your concern, Suggest an alternative and state the Consequences for the shared goal.',
 use:['Preparing to talk to a colleague about a repeated problem.','Practising how to use “I” statements instead of labels.','Turning frustration into a request that can be agreed.'],
 notUse:['For bullying, harassment, discrimination or unsafe situations: use local reporting routes and support.','For an urgent safety concern: use CUS and escalate immediately.','To win an argument or deliver an ultimatum.'],
 who:['New graduates','Practising clinicians','Students','Support workers'],
 lessons:['conflict','feedback','inclusive-leadership'],acts:['cus','cc-bias'],refs:['team'],
 safety:'If you feel unsafe, or the issue involves bullying or harassment, use local support and reporting routes rather than a one-to-one conversation.',
 pitfalls:[['Starting with a label','“You are rude” invites defence. Start with what happened, in observable words.'],['Skipping the suggestion','A concern without an alternative leaves the other person with nowhere to go.'],['Threatening consequences','Consequences means the effect on the shared goal, not a punishment.'],['The wrong place','Choose a private time and place where both can listen.']],
 checks:['I have described what happened without judging.','I have used an “I” statement for my concern.','I have a specific, reasonable suggestion.','I have named the effect on our shared goal.','I have chosen a private time and place.','I am ready to listen to the other view.'],
 modes:[{id:'desc',label:'DESC',key:'desc',doc:'DESC conversation plan',script:true,
  fields:[
   {n:'Before I speak',l:'Before I speak: my aim, and the right time and place',h:'What outcome do you hope for? Choose privacy, and a time when neither of you is rushed.',p:'I want us to agree…. After the meeting, in a quiet room.',r:2,i:4},
   {n:'Describe',l:'Describe the specific, observable situation',h:'What happened, when, where. No labels or guesses.',p:'In Tuesday’s meeting…',r:3,i:0},
   {n:'Express',l:'Express your concern using an “I” statement',h:'“I am concerned that…” or “I felt…”. Own the feeling.',p:'I am concerned that…',r:3,i:1},
   {n:'Suggest',l:'Suggest an alternative and invite agreement',h:'One reasonable alternative, then ask, “Could we try…?”',p:'Could we agree to…?',r:3,i:2},
   {n:'Consequences',l:'Consequences: the effect on your shared goal',h:'How the change helps both of you and the work. Not a punishment.',p:'That would help us…',r:3,i:3}],
  steps:[{b:'D',t:'Describe',f:[1]},{b:'E',t:'Express',f:[2]},{b:'S',t:'Suggest',f:[3]},{b:'C',t:'Consequences',f:[4]}],shape:'chain',
  scriptOrder:[1,2,3,4],
  cues:[
   {t:'No labels or “always/never” words',f:-1,bad:true,re:/\b(always|never|rude|lazy|difficult|dominate|selfish|unprofessional)\b/i},
   {t:'Concern uses an “I” statement',f:2,re:/\bI (am|feel|felt|was|worry|have)\b|\bI’m\b/},
   {t:'The suggestion invites agreement',f:3,re:/(could we|can we|would you|how about|shall we|would it work)/i},
   {t:'Consequences are about the shared goal',f:4,re:/(help|us|our|together|goal|patient|person|team|clear)/i}],
  weak:{v:['Tell them off at the meeting.','You always dominate the team.','Everyone is unhappy with you.','Stop being difficult.','If it happens again, you will regret it.'],why:['Public, unplanned and about winning.','“You always” is a label and an exaggeration.','Speaking for everyone is a generalisation and cannot be checked.','An order with no alternative. “Difficult” is a label.','A threat is not a consequence for the shared goal.']},
  examples:[
   {s:'Team meeting',t:'Being interrupted',v:[
    'After the meeting, in the quiet room, when we both have ten minutes. I want us to agree how we let each other finish.',
    'In Tuesday’s meeting my question was interrupted twice before I could explain my concern.',
    'I am concerned that we may miss important information when people cannot finish.',
    'Could we agree to let each person finish, then ask clarifying questions?',
    'It would help us understand each concern and make a clearer plan together. Can we try it in the next meeting?']},
   {s:'Between colleagues',t:'A task regularly left half-done',v:[
    'At the end of the shift, privately. I want to find a way to hand over the task cleanly.',
    'Three times this week the supplies check was started but not finished when I took over.',
    'I felt frustrated, and I am concerned that the next shift cannot tell what was done.',
    'Could we agree to write on the sheet what is finished and what is not, before we hand over?',
    'That would help the whole team know where we are, and save us both time at the start of the next shift.']},
   {s:'Support worker and manager',t:'A rota that does not allow a break',v:[
    'In my supervision on Friday. I want to ask for a change to the visit order that allows a short break.',
    'On the last four long days, my visit list had no gap of more than five minutes between 08:00 and 16:00.',
    'I am concerned that I am rushing the later visits, and that I will not be at my best for the people I visit.',
    'Could we look at moving one visit earlier or later to leave a break, and see how it works over two weeks?',
    'That would help me give the people I visit my full attention and help the team rely on the rota.']}]}]},

/* ---------------------------------------------------------------- Teach-back */
teach:{
 title:'Teach-back planner',sub:'Explain · Ask · Listen · Repair',
 purpose:'Teach-back checks how well you explained something, not how well the person remembered it. You explain one point, invite the person to say it in their own words, listen for gaps, and repair your explanation until it is clear. It is one tool in health literacy practice, not a test of the person.',
 use:['Planning how to explain a plan, a next step or a service contact.','Practising a non-judgemental invitation that avoids “Do you understand?”.','Preparing different ways of saying the same thing.'],
 notUse:['As a replacement for accessible formats, interpreters or support the person needs. Offer those first.','To judge a person’s ability. If they cannot explain it back, the explanation needs repair.','In an emergency. Act first, and explain as soon as it is safe.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['teachback-skill','health-literacy','communication'],acts:['cc-teach','teachback'],ev:'teachback',refs:['share','literacy','research-teachback'],
 safety:'Adapt language, format and support to the person and your service. Keep fictional details only in this tool.',
 pitfalls:[['“Do you understand?”','It usually gets “yes”. Ask for their words instead.'],['Testing the person','Frame it as checking your explanation: “I want to be sure I explained that clearly.”'],['Too much at once','Explain one or two points, then check. Do not explain everything and ask once.'],['Repeating the same words','If there is a gap, explain it a different way.']],
 checks:['I explained one small piece at a time, in plain language.','I invited the person’s own words, and framed it as a check on me.','I listened for gaps and did not interrupt.','I repaired my explanation in a different way.','I checked again.','The person knows what to do next and who to contact, using the local route.'],
 modes:[{id:'teach',label:'Planner',key:'teach',doc:'Teach-back plan',script:true,
  fields:[
   {n:'About the person',l:'About the person: what helps them understand?',h:'Language, format, pace, hearing or vision, who they want present, what matters to them.',p:'Prefers short written steps and wants her son there…',r:2,i:4},
   {n:'One point',l:'One point to explain, in plain language',h:'The one thing that matters most now. Short words.',p:'The next step is…',r:2,i:0},
   {n:'Invitation',l:'My non-judgemental teach-back invitation',h:'“To check I explained that clearly, how will you…?”',p:'To check that I explained that clearly…',r:2,i:1},
   {n:'A gap I might hear',l:'A gap I might hear in the person’s answer',h:'What would show me the message did not land?',p:'They might say…',r:2,i:2},
   {n:'Repair and check again',l:'How I will repair my explanation and check again',h:'A different way of saying it, then a second invitation.',p:'Thank you, I did not explain that clearly…',r:3,i:3},
   {n:'Follow-up',l:'Follow-up and safety net, within local policy',h:'Who to contact, when, and how.',p:'If you are unsure, ring…',r:2,i:5}],
  steps:[{b:'E',t:'Explain',f:[1]},{b:'A',t:'Ask',f:[2]},{b:'L',t:'Listen',f:[3]},{b:'R',t:'Repair',f:[4]}],shape:'cycle',
  scriptOrder:[1,2,4,5],
  cues:[
   {t:'The invitation is not “Do you understand?”',f:2,fn:t=>!/do you understand|any questions|is that clear|ok\?/i.test(t)},
   {t:'The invitation frames it as a check on the explainer',f:2,re:/(to check|to make sure|i want to be sure|i explained|did i explain)/i},
   {t:'The invitation asks for their own words or an action',f:2,re:/(your own words|tell me|show me|how will you|what will you|what would you)/i},
   {t:'The repair uses a different explanation',f:4,re:/(different way|another way|let me try again|let us revisit|let’s revisit|re-?explain|show you)/i}],
  weak:{v:['Whenever they are ready.','Follow the advice in the leaflet.','Do you understand?','Yes.','Good. We are finished.','Ring if you are worried.'],why:['Nothing is planned about the person, so the explanation may not fit them.','A leaflet is not an explanation, and several points at once is too many.','Closed question that invites “yes”.','The answer shows nothing about whether they understood.','Skips the repair and the second check.','“If you are worried” is vague. Say who and how.']},
  examples:[
   {s:'Outpatient clinic',t:'A follow-up arrangement',v:[
    'Mrs M (fictional) prefers short written steps. Her daughter usually attends. She has asked me to speak a little slower.',
    'The next step is to ring the clinic on the number on the card to book your follow-up.',
    'I want to be sure I explained that clearly. How will you book your follow-up when you get home?',
    'She may say she will wait for the clinic to ring her.',
    'Thank you, I did not explain that clearly. You need to ring them. Let me show you the number on the card. How will you do that?',
    'If you have not booked in a week, ring the same number, or ask your daughter to help.']},
   {s:'Community equipment',t:'A new walking aid',v:[
    'Mr N (fictional) likes to be shown rather than told. He wears glasses to read.',
    'When you stand up, hold both handles before you take a step.',
    'To check I explained this well, could you show me what you will do when you stand up?',
    'He might stand up first and reach for the handles afterwards.',
    'Let me show you in a different way. Hands on the handles first, then stand. Would you show me again?',
    'If anything feels unsafe or the aid feels loose, call the community equipment number on this card.']},
   {s:'Care home or support worker',t:'How to get help at night',v:[
    'Mrs O (fictional) has a mild hearing loss and is a little anxious at night.',
    'If you need help in the night, press the red button by your bed and wait. Someone will come.',
    'I want to check I have explained it well. What will you do if you need help in the night?',
    'She might say she will call out, because the button is hard to find.',
    'Thank you for telling me. That is helpful. I will move the button within reach, and show you again. Could you press it now so I can see?',
    'I will check with the night staff that they know where the button is and that we have talked about it.']}]}]},

/* ---------------------------------------------------------------- Shared decision */
shared:{
 title:'Shared-decision conversation planner',sub:'Seek · Help explore · Assess · Reach · Evaluate',
 purpose:'A planner for a conversation in which a person and a clinician decide together when more than one reasonable option exists. It follows the five SHARE steps from AHRQ: Seek participation, Help the person explore and compare options, Assess values and preferences, Reach a decision, Evaluate the decision. Some of these steps are within the clinician’s role. Support staff may help the person prepare questions.',
 use:['Preparing for a conversation where there is more than one reasonable option.','Planning how to describe benefits and harms in plain numbers where you know them.','Practising how to ask what matters to the person.'],
 notUse:['To choose an option for the person. It plans a conversation, not a decision.','Where there is only one safe option or an emergency. Follow local pathways.','To give treatment advice. Decisions rest with the person and their clinician.'],
 who:['Practising clinicians','New graduates','Students','Support workers'],
 lessons:['shared','risk-dialogue','dignity'],acts:['sim-shared-choice','cc-risk'],ev:'engagement',refs:['share','research-engagement'],
 safety:'This planner supports a conversation. It does not recommend an option or give clinical advice.',
 pitfalls:[['Offering one option as if it were the only one','Say honestly that there is a choice, including doing nothing or waiting, where that is a reasonable option.'],['Percentages without a baseline','Use natural frequencies: “about 10 in 100”. Give absolute as well as relative.'],['Not asking what matters','Ask what is important to the person. Two people may reasonably choose differently.'],['Treating the decision as final','Plan when to review the choice, and make it easy to change.']],
 checks:['I have said there is a choice to make, and invited the person to take part.','I have described each reasonable option, including waiting or doing nothing where that is one.','I have given benefits and harms in plain words, with natural frequencies where I know them.','I have asked what matters most to the person.','I have checked the person is ready to decide, or offered more time.','I have planned when we will review the decision.'],
 modes:[{id:'share',label:'SHARE planner',key:'shared',doc:'Shared-decision conversation plan',
  fields:[
   {n:'Seek',l:'Seek participation: how I will open the conversation',h:'Say there is a decision to make together, and invite their view.',p:'There is more than one way forward, and I would like to talk it through with you…',r:3},
   {n:'Help explore',l:'Help explore options: what each involves, with benefits and harms in plain words',h:'Include waiting or doing nothing if that is reasonable. Use numbers like “about 10 in 100” if you know them.',p:'Option A…, Option B…, Option C…',r:4},
   {n:'Assess',l:'Assess values and preferences: what I will ask',h:'What matters most? What worries them? What do they hope to avoid?',p:'What matters most to you about…?',r:3},
   {n:'Reach',l:'Reach a decision: how I will check readiness, or offer more time or support',h:'Offer time, written summaries or a second conversation.',p:'Do you feel ready to decide, or would more time help?',r:3},
   {n:'Evaluate',l:'Evaluate: when and how we will review the decision',h:'A time, a person, and a way to change course.',p:'We will review this at…',r:3}],
  steps:[{b:'S',t:'Seek',f:[0]},{b:'H',t:'Explore',f:[1]},{b:'A',t:'Assess',f:[2]},{b:'R',t:'Reach',f:[3]},{b:'E',t:'Evaluate',f:[4]}],shape:'cycle',
  cues:[
   {t:'Opens by saying there is a choice',f:0,re:/(choice|options?|more than one|together|decide)/i},
   {t:'Options include waiting or doing nothing, where reasonable',f:1,re:/(wait|nothing|no (treatment|programme|change)|watchful|not to)/i},
   {t:'Numbers are given as “x in N”',f:1,re:/\b\d+\s+(in|out of)\s+\d+\b/i},
   {t:'Asks what matters to the person',f:2,re:/(matters|important|worr|hope|prefer|value)/i},
   {t:'A review is planned',f:4,re:/(review|revisit|check|look again|follow)/i}],
  weak:{v:['We will do option A, okay?','Option A is best.','Do you have any questions?','Sign here.','Nothing more.'],why:['A closed question that treats the decision as made.','One option, no harms and no alternatives.','Does not ask what matters, so values are missing.','Signing is not the same as being ready to decide.','No review, so there is no way back.']},
  examples:[
   {s:'Outpatient clinic',t:'Choosing between two approaches',v:[
    'There are a few reasonable ways forward and I would like to go through them with you before we decide anything.',
    'A weekly group programme (fictional): about 14 in 100 people have a fall over a year. One-to-one sessions (fictional): about 12 in 100. Doing neither for now: about 20 in 100. The group meets in the evening and the one-to-one is at home.',
    'What matters most to you? What would make one option easier for you to keep up?',
    'There is no hurry. I can give you the written summary and we can talk again on the phone.',
    'We will look again in six weeks, and you can tell me earlier if it is not working.']},
   {s:'Community nursing',t:'Where and how to have care',v:[
    'This visit I would like to talk with you about where and how we help you, because there is more than one way.',
    'Visits at home: we can come three times a week. Clinic visits: you travel but can be seen at a set time. Doing this yourself with support: needs training first. Each has benefits and demands.',
    'What is most important to you: staying at home, saving effort, or something else? What worries you?',
    'You can take the leaflet home and tell me by Friday. I can ring you.',
    'We will check how it is going at the next visit.']},
   {s:'Care home',t:'A daily routine choice',v:[
    'Mr P (fictional), I would like to talk about the time you get up in the morning. There are a few ways we can do this.',
    'Getting up with the early staff, a later start after breakfast in bed, or choosing each day. Each means a different amount of staff time and different meal times.',
    'What matters most: sleep, company at breakfast, or something else?',
    'We can try one option this week and change if you want.',
    'I will ask you on Friday how it is going and write down what you tell me.']}]}]},

/* ---------------------------------------------------------------- Risk communication */
risk:{
 title:'Risk communication helper',sub:'Natural frequencies · absolute and relative change · icon arrays',
 purpose:'A learning aid for turning two fictional risks into plain words and a picture. Natural frequencies (“about 14 in 100”) are usually easier to understand than percentages, and showing the absolute change as well as the relative one avoids making a small difference sound large. Everything you type is invented. This calculator is not evidence and not a clinical tool.',
 use:['Practising how to say a risk so that it is not misread.','Seeing how the same change looks in relative and absolute terms.','Preparing wording for a shared decision conversation (with real figures from approved sources, outside this tool).'],
 notUse:['To estimate any real person’s risk, or to decide on any real treatment.','With real figures from a study you have not appraised. Check them with a reliable source first.','As a substitute for appraising evidence. Use the critical appraisal tool for that.'],
 who:['Practising clinicians','New graduates','Students'],
 lessons:['risk-evidence','risk-dialogue'],acts:['cc-risk'],ev:'engagement',refs:['share','research-engagement'],
 safety:'All numbers here are fictional. Real conversations use figures from reliable, current sources and follow local guidance.',
 pitfalls:[['Relative change alone','“Halves the risk” can mean 2 in 1,000 to 1 in 1,000. Give the baseline and the absolute change.'],['Mixed denominators','Compare “14 in 100” with “12 in 100”, not “14 in 100” with “1 in 8”.'],['No time frame','Risk of what, over how long? Always say.'],['A number without meaning','Ask what the number means to the person, and what matters to them.']],
 checks:['I have named the outcome and the time frame.','I have used the same denominator for both options.','I have given the absolute change as well as the relative one.','I have said where the numbers come from, and how sure we are.','I have asked what matters to the person.'],
 custom:'risk',
 modes:[{id:'risk',label:'Calculator',key:'risk',doc:'Risk communication practice',
  fields:[
   {n:'Option',l:'The option or exposure (fictional)',type:'line',h:'For example “Programme A”. Invented.',p:'Programme A (fictional)',i:0},
   {n:'Outcome',l:'The outcome',type:'line',h:'What happens, in plain words.',p:'having a fall',i:1},
   {n:'Time frame',l:'Over what time frame?',type:'line',h:'Always say it.',p:'over one year',i:2},
   {n:'Without',l:'Without the option: about how many people in N have the outcome?',type:'num',h:'A whole number from 0 to N.',p:'20',i:3},
   {n:'With',l:'With the option: about how many in N have the outcome?',type:'num',h:'A whole number from 0 to N.',p:'14',i:4},
   {n:'Out of',l:'Out of how many people?',type:'choice',opts:['100','1000'],h:'Pick the denominator. For 1,000 each dot on the picture stands for 10 people.',i:5},
   {n:'What matters',l:'What I will ask the person, and what I will check they understood',h:'What matters to them? What would help them decide?',p:'What does that number mean to you? What matters most?',r:3,i:6}],
  steps:[],shape:'risk',
  cues:[
   {t:'Both numbers are whole numbers within the denominator',f:-2,fn:(t,v)=>tkRiskParse(v).ok},
   {t:'The outcome and time frame are stated',f:-2,fn:(t,v)=>!!(v[1]||'').trim()&&!!(v[2]||'').trim()},
   {t:'The absolute change is calculated alongside the relative change',f:-2,fn:(t,v)=>tkRiskParse(v).ok},
   {t:'There is a plan to ask what matters to the person',f:6,re:/(matters|important|worr|hope|prefer|mean to you)/i}],
  weak:{v:['It works.','having problems','','','','100','Tell them it cuts risk by half.'],why:['“It works” has no number and no outcome.','“Problems” is vague. Name the outcome.','No time frame.','No baseline.','No comparison number.','No denominator.','A relative claim with no baseline can mislead. Show 2 in 1,000 vs 1 in 1,000 on this page to see why.']},
  examples:[
   {s:'Falls programme (fictional)',t:'A sensible-sized difference',v:['Programme A (fictional)','having a fall','over one year','20','14','100','What does that difference mean to you? What matters most about staying steady on your feet?']},
   {s:'Headline claim (fictional)',t:'“Halves the risk”, in absolute terms',v:['Product X (fictional)','having a side effect','over one year','2','1','1000','The leaflet says it halves the risk. What would help you weigh up 1 in 1,000 against the benefit?']},
   {s:'A risk that rises (fictional)',t:'When the option adds risk',v:['Procedure Y (fictional)','having a minor complication','during the first month','3','8','100','What would you want to know before deciding? Which matters more to you, the benefit or this risk?']}]}]},

/* ---------------------------------------------------------------- Before you act */
safety:{
 title:'Before you act: a pause-and-check list',sub:'A short list with saved ticks. Always use your organisation’s required checks.',
 purpose:'A seven-question pause to run before a task: Am I allowed and trained? Is this the right person and task? Do I know the risks and the plan? Do I know how to get help? It is a learning aid to build the habit of pausing, not a complete clinical checklist.',
 use:['Building the habit of a brief pause before an unfamiliar or interrupted task.','Teaching new staff what a pause sounds like.','Reflecting on a task that felt rushed.'],
 notUse:['Instead of your organisation’s required checks, identification or consent procedures.','In an emergency. Activate your local response and act within your training.','As a record that a check was done. It is not a record.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['safety','infection','human-factors'],acts:['room','hygiene','cc-interrupt'],ev:'interruptions',refs:['med','ipc','patient'],
 safety:'Stop and clarify uncertainty. In an emergency, activate your local response immediately and act within your training.',
 pitfalls:[['Ticking without pausing','The pause matters more than the tick. If you tick without thinking, stop and start again.'],['Rushing after an interruption','Interruptions make steps easy to miss. Restart from the last point you are sure of.'],['Guessing','If anything is unclear, ask. “I am not sure” is a safe sentence.'],['Doing it alone','If you are unsure of your role or training, say so before you start.']],
 checks:['Am I working within my role, training and authorisation?','Have I used the required identifiers and confirmed the intended task?','Have I checked relevant allergies, risks and the current approved plan?','Are hand hygiene, PPE and equipment preparation appropriate?','Does the person understand what is proposed, and has the required consent process been followed?','Is anything unclear, and have I paused to clarify it?','Do I know how to get help or escalate a concern?'],
 checkWhy:['Acting outside your role or training is a safety risk in itself. Say so early.','Wrong-person and wrong-task errors are often caught by identifying the person and the task.','Plans change. The current plan is the one that counts.','Preparation prevents interruptions during the task.','Consent and understanding are part of the task, not an extra.','Uncertainty is information. Resolve it before you start.','Know the route before you need it.'],
 modes:[{id:'pause',label:'Pause list',key:'safety',doc:'Before-you-act pause',
  fields:[{n:'To clarify',l:'What I need to clarify, and who I will ask',h:'One line is enough. Leave empty if everything is clear.',p:'I need to confirm… with…',r:2}],
  steps:[],shape:'ring',cues:[{t:'Anything unclear has someone to ask',f:0,re:/(ask|confirm|check|clarify|nurse|supervisor|pharmacist|colleague)/i}],
  weak:null,
  examples:[
   {s:'Student on placement',t:'A new task, a familiar room',story:'A student is asked to help with a task they have watched but never done. The room and people feel familiar, so it is tempting to start.',v:['I need to confirm with my supervisor that I am allowed to do this on my own, and ask to be shown first.']},
   {s:'After an interruption',t:'Restarting from a known point',story:'A staff member is interrupted halfway through preparing for a task. They return and are not sure which step they had reached.',v:['I am not sure which step I had reached. I will restart from the last step I am sure of and ask a colleague to check with me.']},
   {s:'Support worker',t:'The plan has changed',story:'A support worker arrives for a visit and notices the care plan in the house is different from the copy they had yesterday.',v:['The plan on the table is different from my copy. I will ring my supervisor to confirm which one is current before I start.']}]}]},

/* ---------------------------------------------------------------- Critical appraisal */
evidence:{
 title:'Critical appraisal checklist',sub:'Question the claim before you rely on it',
 purpose:'A structured way to question a claim, whether it comes from a paper, a headline, a leaflet, a colleague or an AI answer. It follows the three broad questions common to many appraisal tools: Are the results valid? What are they, in absolute terms? Will they help here? It is an editorial learning aid, not a validated appraisal instrument.',
 use:['Before repeating or applying a claim you have met.','Checking an AI-generated summary against its real source.','Planning what you will read, and who you will ask, to verify a claim.'],
 notUse:['As a substitute for current guidance or local policy. Those take priority.','To appraise a real study formally. Use a recognised appraisal tool for that.','With real patient information. Keep details fictional.'],
 who:['Practising clinicians','New graduates','Students'],
 lessons:['ai','reasoning','risk-evidence','humility'],acts:['ai-case','cc-verify'],ev:'digital',refs:['ai','research-digital'],
 safety:'A single study, or a polished AI answer, is not a complete basis for a clinical decision. Involve the appropriate clinician and follow local policy.',
 pitfalls:[['Trusting a confident tone','Fluent text can be wrong. Find the source and read beyond the summary.'],['Relative numbers only','“50% lower” needs a baseline and an absolute change.'],['Wrong population','Results from one group may not apply to the people you care for.'],['One study as proof','Check whether it agrees with guidance and other evidence.']],
 checks:['Is the source real, and have I read beyond the headline or generated summary?','What question was asked, and is the study design right for it?','How large and clinically meaningful is the effect, including absolute benefits and harms?','How uncertain are the results, and what limitations or conflicts matter?','Does the population and setting resemble the person and context in front of me?','Is it consistent with current authoritative guidance and local policy?','Have I involved the appropriate clinician and considered the person’s preferences?'],
 legacy:{key:'evidence',map:{0:5}},
 practice:'flags',
 modes:[{id:'appraise',label:'Appraisal',key:'evidence-appraisal',doc:'Critical appraisal draft',
  fields:[
   {n:'The claim',l:'The claim, in my own words, and where I met it',h:'Where did you find it: a paper, an AI answer, a leaflet, a colleague?',p:'A leaflet says… I met it in…',r:2,i:0},
   {n:'The question (PICO)',l:'The question: who was studied (Population), what was done (Intervention), compared with what (Comparison), and what was measured (Outcome)?',h:'If you cannot fill this in, find the source.',p:'Population… Intervention… Comparison… Outcome…',r:3,i:1},
   {n:'Size and certainty',l:'How big is the effect in absolute terms, and how certain is it?',h:'Look for numbers “in N”. Note the time frame and any uncertainty range.',p:'The paper reports… in 100…',r:3,i:2},
   {n:'Limits',l:'Limits, conflicts of interest and what is missing',h:'Small numbers, short follow-up, funding, missing groups.',p:'The study was small…',r:3,i:3},
   {n:'Fit',l:'Does it fit my setting and this person? What does current guidance say?',h:'Compare population, setting and guidance.',p:'My people differ because… Guidance says…',r:3,i:4},
   {n:'Verification plan',l:'My independent verification plan: the source I will find and who I will ask',h:'Name a real source to locate and a person to review it with.',p:'I will find… and ask…',r:3,i:5}],
  steps:[{b:'1',t:'Claim',f:[0]},{b:'2',t:'Question',f:[1]},{b:'3',t:'Size',f:[2]},{b:'4',t:'Limits',f:[3]},{b:'5',t:'Fit',f:[4]},{b:'6',t:'Verify',f:[5]}],shape:'chain',
  cues:[
   {t:'The source is named',f:0,re:/(leaflet|paper|journal|article|study|AI|headline|colleague|website|guideline|report|news)/i},
   {t:'Absolute numbers “in N” are noted',f:2,re:/\b\d+\s*(in|out of)\s*\d+\b/i},
   {t:'A limit or a conflict is named',f:3,re:/(small|short|funding|conflict|missing|bias|limit|sample|follow-up|unclear)/i},
   {t:'The verification plan names a source and a person',f:5,fn:t=>/(find|locate|read|check|search)/i.test(t)&&/(ask|colleague|pharmacist|librarian|supervisor|team|review)/i.test(t)}],
  weak:{v:['Someone told me it works.','It is in a study so it is true.','It cuts risk by half.','Nothing to add.','It applies to everyone.','I will use it.'],why:['No source, no wording of the claim.','A study existing is not proof. Which question, population and outcome?','Relative with no baseline or time frame.','Every study has limits and every source has an interest.','“Everyone” is a population claim you cannot check.','No verification, no person to review it with.']},
  examples:[
   {s:'AI answer',t:'A confident summary with a vague reference',v:[
    'An AI assistant (fictional) said, “A recent study proves this method works for every patient and reduces risk by 50%.” I met it while preparing a teaching session.',
    'The answer does not name the study. I do not know who was studied, what the comparison was, or what outcome was measured.',
    'No absolute numbers or time frame are given.',
    'The reference is vague and I have not located it.',
    '“Every patient” is more than any one study can show. I do not know whether my setting resembles the study.',
    'I will search for the actual paper by title and authors, read the methods and results, and ask a colleague or librarian to review it with me before I repeat it.']},
   {s:'Leaflet or poster',t:'A headline on a wall chart',v:[
    'A poster (fictional) says a daily programme “halves your risk”. It was in the waiting room.',
    'The poster does not say who was studied, for how long, or compared with what.',
    'No numbers “in N”. “Halves” is relative. I do not know the baseline.',
    'The poster is produced by the company that sells the programme, so there may be a conflict of interest.',
    'I do not know whether the people it describes are like the people I care for.',
    'I will ask the poster’s source for the study, read it and review it with my supervisor.']}]}]},

/* ---------------------------------------------------------------- Priority matrix */
priority:{
 title:'Priority-setting matrix',sub:'Urgent and important: a planning aid for your own work',
 purpose:'List up to six of your own tasks, mark each urgent or not and important or not, and see how they sort into four boxes: do now, plan, ask for help or renegotiate, and let go or check. This is a time-management aid for organising your own work. It is not clinical triage. Safety-critical tasks and any change in a person’s condition follow your escalation process and are never “later”.',
 use:['Organising a busy shift, visit list or week, within your role.','Noticing when too many things are “do now”, which is a prompt to ask for help.','Teaching new colleagues to say what can wait, and to whom they tell it.'],
 notUse:['To decide clinical priority or acuity. Use your service’s triage and escalation processes.','To postpone anything safety-critical. If a person may be at risk now, act and escalate.','To avoid telling someone a task will be late. Say so.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['reasoning','accountability','compassion-boundaries'],acts:['cc-interrupt','flow'],refs:['patient'],
 safety:'This is not clinical triage. Safety-critical tasks and any change in a person’s condition follow your local escalation process, not this matrix.',
 pitfalls:[['Everything is urgent','If more than three things are “do now”, ask who can help or what can change.'],['Important but not urgent is neglected','Plan these on purpose. They quietly become urgent.'],['Not telling anyone','If a task will slip, tell the person it affects, and your supervisor if needed.'],['Using it for clinical decisions','Clinical priority follows your service’s triage and escalation processes.']],
 checks:['I have checked whether any task is safety-critical and needs escalation now.','I have asked for help for urgent tasks that are not mine alone.','I have told the people affected by anything that will be late.','I have planned time for the important tasks that are not urgent.','I have checked that I am working within my role.'],
 custom:'priority',
 modes:[{id:'matrix',label:'Matrix',key:'priority',doc:'Priority-setting matrix',
  fields:[
   {n:'Task 1',l:'Task 1',type:'task',i:0},{n:'Task 2',l:'Task 2',type:'task',i:1},{n:'Task 3',l:'Task 3',type:'task',i:2},
   {n:'Task 4',l:'Task 4',type:'task',i:3},{n:'Task 5',l:'Task 5',type:'task',i:4},{n:'Task 6',l:'Task 6',type:'task',i:5},
   {n:'Help and renegotiation',l:'What I need to check, renegotiate or ask help with, and who I will tell',h:'Who needs to know that something will slip? Who can help?',p:'I will ask… I will tell… that…',r:3,i:6}],
  steps:[],shape:'matrix',
  cues:[
   {t:'At least three tasks are listed',f:-2,fn:(t,v)=>tkTasks(v).length>=3},
   {t:'No more than three tasks are in “Do now”',f:-2,fn:(t,v)=>tkTasks(v).length>0&&tkTasks(v).filter(x=>x.u&&x.im).length<=3},
   {t:'A plan to ask for help or tell someone is written down',f:6,re:/(ask|tell|inform|let .* know|help|renegotiate|handover|supervisor)/i}],
  weak:null,
  examples:[
   {s:'Busy morning on a ward',t:'Non-clinical tasks for the next two hours',v:['1|1|Answer the family’s call-back request about visiting times','1|0|Restock the supplies trolley before the next round','0|1|Finish my mandatory learning module due on Friday','0|0|Tidy the staff notice board','1|1|Hand over the unresolved equipment query to the next shift','','I will ask a colleague to take the trolley. I will tell the family I will ring back by 11:00.']},
   {s:'Community round',t:'A visit list that has changed',v:['1|1|Ring the person whose visit time has moved','1|0|Collect equipment from the depot before the next visit','0|1|Write up yesterday’s visit notes','0|1|Book my supervision session','0|0|Re-sort the car boot','','I will tell the office which visits are late and ask whether another worker can take the depot run.']},
   {s:'Student week',t:'Placement and study',v:['1|1|Prepare for tomorrow’s supervisor review','0|1|Draft my reflection for the tutorial','1|0|Reply to the group chat about next week’s session','0|1|Read the policy my supervisor suggested','0|0|Re-organise my folders','','I will ask my supervisor whether the reflection can be handed in a day later, and tell my group I will reply tonight.']}]}]},

/* ---------------------------------------------------------------- Reflection */
reflect:{
 title:'Structured reflection',sub:'Gibbs’ cycle, or What? So what? Now what?',
 purpose:'Reflection turns an experience into learning and a next action. Use Gibbs’ reflective cycle for a thorough look at one event, or What? So what? Now what? for a quick one. Keep everything anonymous: no names of patients or colleagues, and no confidential details.',
 use:['After a placement day, a difficult conversation, or something that went well.','Preparing for supervision, appraisal or revalidation discussions, using your own words.','Building the habit of ending a shift with one useful thought.'],
 notUse:['As an incident report. Use your local reporting route for incidents.','To record identifiable information about patients or colleagues.','As a substitute for support. If you are distressed, speak to someone through your local support routes.'],
 who:['Students','New graduates','Practising clinicians','Support workers'],
 lessons:['humility','feedback','wellbeing'],acts:['cc-bias','cc-compassion'],refs:['work'],
 safety:'Keep reflections anonymous. This is a private learning aid, not an incident report or a professional record. If you feel distressed, use your local support routes.',
 pitfalls:[['Describing without learning','Facts are the start. Ask what you learned and what you will do.'],['Only the negative','Reflect on what went well too, and why.'],['No next step','End with one action you can actually take, with a date.'],['Identifiable detail','Anonymise. Write about the situation, not the individuals.']],
 checks:['I have kept names, places and confidential details out.','I have included how I felt, as well as what happened.','I have named something that went well.','I have written one action I can do, with a date.'],
 modes:[
 {id:'gibbs',label:'Gibbs’ cycle',key:'reflect',doc:'Reflection (Gibbs’ cycle)',
  fields:[
   {n:'Description',l:'Description: what happened?',h:'Just the facts. Keep it short.',p:'On my shift…',r:3},
   {n:'Feelings',l:'Feelings: what was I thinking and feeling?',h:'Name them honestly, without judging yourself.',p:'I felt…',r:3},
   {n:'Evaluation',l:'Evaluation: what was good and what was not?',h:'Include what went well.',p:'What went well was… What was harder…',r:3},
   {n:'Analysis',l:'Analysis: why did it go that way? What might explain it?',h:'Look at the situation and your own part.',p:'It may have been because…',r:3},
   {n:'Conclusion',l:'Conclusion: what did I learn? What else could I have done?',h:'One or two lessons.',p:'I learned that…',r:3},
   {n:'Action plan',l:'Action plan: what will I do next time, and when?',h:'A single action with a date.',p:'Next time I will… by…',r:3}],
  steps:[{b:'D',t:'Describe',f:[0]},{b:'F',t:'Feelings',f:[1]},{b:'E',t:'Evaluate',f:[2]},{b:'A',t:'Analyse',f:[3]},{b:'C',t:'Conclude',f:[4]},{b:'P',t:'Plan',f:[5]}],shape:'cycle',
  cues:[
   {t:'Includes how I felt',f:1,re:/(felt|feel|anxious|worried|proud|nervous|frustrated|calm|uncertain|relieved)/i},
   {t:'Names something that went well',f:2,re:/(went well|good|helped|pleased|managed|worked)/i},
   {t:'The action has a date or a time frame',f:5,re:/(next|by |tomorrow|this week|tonight|before|on friday|on monday|\d)/i}],
  weak:{v:['It was a bad day.','Fine.','Not good.','I do not know.','I will try harder.','Do better.'],why:['A verdict, not a description.','No feelings named.','No specifics about what was and was not good.','No attempt at explanation.','No lesson stated.','No actionable step or date.']},
  examples:[
   {s:'Student after a first handover',t:'Giving a first handover on placement',v:[
    'I gave my first handover to the next shift about a person’s afternoon plan. I read from my notes and was asked two questions I could not answer.',
    'I felt nervous before and a bit embarrassed when I could not answer. Afterwards I felt relieved and wanted to do better.',
    'I covered the plan and the reasons in order. The listener’s questions were fair and I did not have the information they needed.',
    'I had not checked what the next shift would need. I had also not asked my supervisor to look at my notes first.',
    'I learned that a structure helps, and that I need to ask “what will they ask me?” before I hand over.',
    'Before my next handover I will write the likely questions and ask my supervisor to look at my notes. I will do this on Thursday.']},
   {s:'Experienced nurse',t:'After a difficult conversation',v:[
    'I told a family member that a planned discharge was delayed. They were upset and the conversation ended abruptly.',
    'I felt tense and a little defensive. Afterwards I felt sad that I had not managed it better.',
    'I explained the reason clearly and stayed calm. I did not ask how they felt or what would help them.',
    'It was a busy time. I may have rushed because I had other tasks waiting.',
    'I learned that I can acknowledge feelings first. Fixing the problem is not always what is needed.',
    'Next time I will say what I am hearing before I explain, and I will try this on my next difficult conversation this week.']}]},
 {id:'wsw',label:'What? So what? Now what?',key:'reflect-wsw',doc:'Reflection (What? So what? Now what?)',
  fields:[
   {n:'What?',l:'What? What happened?',h:'The facts. Keep it short and anonymous.',p:'The situation was…',r:3},
   {n:'So what?',l:'So what? Why does it matter, and what did I learn?',h:'Feelings, meaning, what it showed you about your practice.',p:'It mattered because… I noticed…',r:3},
   {n:'Now what?',l:'Now what? What will I do, and when?',h:'One action with a date, and who might help.',p:'I will… by…',r:3}],
  steps:[{b:'1',t:'What?',f:[0]},{b:'2',t:'So what?',f:[1]},{b:'3',t:'Now what?',f:[2]}],shape:'chain',
  cues:[
   {t:'Explains why it mattered',f:1,re:/(because|mattered|important|learn|noticed|showed)/i},
   {t:'The action has a date or time frame',f:2,re:/(next|by |tomorrow|this week|tonight|before|on friday|on monday|\d)/i}],
  weak:{v:['It was fine.','Whatever.','Do better.'],why:['No description.','No meaning drawn.','No action or date.']},
  examples:[
   {s:'Support worker',t:'A quiet end to a long shift',v:[
    'A person I support asked me to sit with them for a few minutes at the end of my shift. I said I was late for handover and left.',
    'It mattered because I think they wanted company. I noticed I was thinking about my to-do list and not about them.',
    'Tomorrow I will plan five minutes at the end of my visit, and tell my team leader if my list does not allow it.']},
   {s:'Student',t:'A piece of feedback',v:[
    'My supervisor told me my notes were hard to follow. I felt defensive.',
    'It matters because the next reader needs to follow them. I realised I had written in a rush.',
    'This week I will use the documentation tool to practise two notes and ask my supervisor to read them on Friday.']}]}
 ]},

/* ---------------------------------------------------------------- Just culture */
justculture:{
 title:'Just culture event reflection',sub:'The system · the person’s view · a fair response',
 purpose:'A structured way to think about an event fairly. A just culture looks at what happened, what made sense at the time and what in the system made it likely, before it asks about responsibility. The lens used here separates three kinds of behaviour from the Just Culture literature: human error, at-risk behaviour and reckless behaviour, each with a different kind of response. This is a reflection aid, not a decision tool. Local accountability processes make real decisions.',
 use:['Reflecting on an event with a fictional or fully anonymised example.','Learning the difference between a slip, a shortcut and a conscious disregard of risk.','Preparing to talk about a system problem when you report an event.'],
 notUse:['To decide whether a real person is to blame. Real decisions follow local policy and human-resources processes.','As an incident report. Use the local reporting route.','With identifiable details. Anonymise everything.'],
 who:['Practising clinicians','New graduates','Students'],
 lessons:['just-culture','human-factors','accountability'],acts:['cc-interrupt','sim-interruptions'],ev:'harm',refs:['patient','research-harm'],
 safety:'Keep it anonymous. This is a reflection aid. Real events go through your local reporting and accountability processes.',
 pitfalls:[['Starting with the person','Start with what happened and the conditions. The person comes after the system.'],['Hindsight','The person did not know the outcome. Ask what made sense to them at the time.'],['Treating all events alike','A slip, a shortcut and a conscious risk call for different responses: console, coach, or local accountability processes.'],['Stopping at the person','A fair response includes a system fix as well, so the next person is not set up to do the same.']],
 checks:['I have described what happened without blame or hindsight.','I have asked what made sense to the person at the time.','I have looked for system factors: workload, interruptions, equipment, process, communication, training.','I have used the substitution test: would a colleague with similar training in the same conditions probably have done the same?','I have planned a fair response and a system fix.','I know how this would go to the local reporting route.'],
 custom:'justculture',
 modes:[{id:'lens',label:'Reflection',key:'justculture',doc:'Just culture reflection',
  fields:[
   {n:'What happened',l:'What happened: facts only, with no names and no blame',h:'In order. No hindsight.',p:'A task due at… was not done…',r:3,i:0},
   {n:'The person’s view',l:'What was the person trying to do, and why did it make sense to them at the time?',h:'Assume a reasonable person acting for good reasons.',p:'They were trying to…',r:3,i:1},
   {n:'System factors',l:'System and situation factors: workload, interruptions, equipment, process, communication, training',h:'What made this event more likely?',p:'Several interruptions… no prompt on the form…',r:3,i:2},
   {n:'Behaviour lens',l:'Behaviour lens: which best fits what happened, from what you know so far?',type:'choice',opts:['Human error','At-risk behaviour','Reckless behaviour','Not sure yet'],h:'Human error: an unintended slip or lapse. At-risk: a shortcut where the risk was not recognised or was believed justified. Reckless: conscious disregard of a substantial, unjustifiable risk. If you do not have the facts, say so.',i:3},
   {n:'Substitution test',l:'Substitution test: would a colleague with similar training in the same conditions probably have done the same? Why or why not?',h:'If yes, the system needs to change.',p:'Probably yes, because…',r:3,i:4},
   {n:'Fair response',l:'A fair response: console, coach or other support, and one system fix',h:'Console human error and fix the conditions. Coach at-risk behaviour and look at why the shortcut made sense. Reckless behaviour goes to local accountability processes.',p:'Console… Coach… System fix…',r:3,i:5},
   {n:'Learning route',l:'How this would be raised through the local reporting and learning route',h:'Who, when, and how.',p:'Report through… and share learning at…',r:2,i:6}],
  steps:[],shape:'lens',
  cues:[
   {t:'No names or blame words',f:-1,bad:true,re:/\b(careless|lazy|stupid|negligent|incompetent|fault|blame)\b/i},
   {t:'The person’s view is included',f:1,re:/(trying|thought|believed|aimed|wanted|intended)/i},
   {t:'At least one system factor is named',f:2,re:/(workload|interrupt|equipment|process|communicat|training|staffing|form|template|handover|noise|time|policy|rota)/i},
   {t:'A system fix is planned',f:5,re:/(fix|change|add|redesign|improve|prompt|process|template|policy|equipment)/i}],
  weak:{v:['The nurse missed it.','They should have known.','Careless.','Reckless behaviour','Yes, anyone would be careless.','Tell them to be more careful.','Nothing to report.'],why:['Names a person, not the event.','Hindsight bias: they did not know.','A label, not an analysis. No system factors considered.','Jumps to the most serious lens without the facts.','Substitution test misapplied: it asks about conditions, not character.','A response that changes nothing in the system.','A missed opportunity to share learning.']},
  examples:[
   {s:'Hospital ward',t:'A task done late after interruptions',v:[
    'A planned task due before lunch was done two hours late. Nobody was harmed. It was noticed at the afternoon handover.',
    'The staff member was trying to complete several tasks in order and was interrupted several times. They believed the task could be done at the next opportunity.',
    'Several interruptions in a short time; the task list had no prompt for time-critical items; two colleagues were absent.',
    'Human error',
    'Probably yes. A colleague with similar training in the same conditions might have made the same slip.',
    'Console and support the staff member. Fix the system by adding a time-critical prompt to the task list and reviewing cover when colleagues are absent.',
    'Report through the local incident route, and share learning at the next team meeting without naming anyone.']},
   {s:'Community team',t:'A workaround because equipment was missing',v:[
    'A support worker used a different method to move equipment between visits because the usual trolley was not in the car.',
    'They were trying to keep to the visit times so no one would be kept waiting. They believed the alternative was safe enough.',
    'The trolley is shared and there is no check-out system. The visit schedule leaves no slack.',
    'At-risk behaviour',
    'Probably yes. A colleague in a similar spot, with the same pressure, might have improvised too.',
    'Coach the support worker on the safer method and on how to say, “I cannot do this safely.” Fix the system with a check-out for the trolley and a note on the schedule for equipment collection.',
    'Report through the local equipment or incident route and discuss the check-out idea at the next team meeting.']}]}]},

/* ---------------------------------------------------------------- QI / PDSA */
qi:{
 title:'Improvement test planner (PDSA)',sub:'Aim · measures · change · Plan, Do, Study, Act',
 purpose:'Plan one small test of change using the IHI Model for Improvement: What are we trying to accomplish? How will we know a change is an improvement? What change can we make that will result in improvement? Then run it as a Plan-Do-Study-Act cycle. Always obtain local approval first, and keep the first test small.',
 use:['Planning a small, safe test of a change in your own area, with agreement.','Writing down a prediction before you test, so you can learn from the result.','Deciding what to do next: adapt, adopt or abandon.'],
 notUse:['To change practice without the relevant team’s approval.','To make claims about results from a single small test.','As a research protocol. A research study needs its own ethical review.'],
 who:['Practising clinicians','New graduates','Students','Support workers'],
 lessons:['improvement','human-factors','accountability'],acts:['flow','huddle'],ev:'audit',refs:['patient','research-audit'],
 safety:'Obtain appropriate local approval before changing practice. No invented benchmark or promised outcome is included here.',
 pitfalls:[['Starting too big','Start with one team, one shift, or a few people. You can scale up later.'],['No prediction','Without a prediction you cannot learn from surprise. Write it down.'],['Only measuring the good','Add a balancing measure: what might get worse, or add burden?'],['Declaring victory from one test','One small test shows something to learn from. Repeat or adapt before concluding.']],
 checks:['I have local approval, or I know who to ask.','The aim says what, for whom and by when, without inventing a target.','I wrote down a prediction.','The measure is defined in the same way before and during the test.','I chose a balancing measure.','I know who will review the result and decide what next.'],
 modes:[{id:'pdsa',label:'PDSA plan',key:'qi',doc:'Improvement test plan (PDSA)',
  fields:[
   {n:'Issue',l:'The process issue: describe the system, not a person',h:'What is not working, for whom, and how do you know?',p:'Handovers sometimes omit…',r:3,i:0},
   {n:'Aim',l:'Aim: what are we trying to accomplish, for whom, and by when?',h:'Specific and time-bound. No invented target.',p:'To reduce… for… by…',r:2,i:5},
   {n:'Change and approval',l:'Plan: the small change to test, and the local approval',h:'One change, one place, and who agreed it.',p:'With the team’s agreement, test…',r:3,i:1},
   {n:'Prediction',l:'Plan: what I predict will happen',h:'Write it before the test.',p:'I predict that…',r:2,i:6},
   {n:'Measure',l:'Plan: what I will measure and how',h:'Define it clearly so it is counted the same way each time.',p:'Count the number of… in the same way before and during the test.',r:3,i:2},
   {n:'Balancing measure',l:'Plan: what might get worse, or add burden? (balancing measure)',h:'Time, confusion, extra work.',p:'I will ask whether it adds time or confusion.',r:2,i:3},
   {n:'Do',l:'Do: what actually happened during the test?',h:'Record observations and problems as they happen.',p:'During the test…',r:3,i:7},
   {n:'Study',l:'Study: how do the results compare with my prediction?',h:'What did you learn? Any surprises?',p:'The results were… compared with my prediction…',r:3,i:8},
   {n:'Act',l:'Act: who reviews the result, and will we adapt, adopt or abandon?',h:'A named person and a date.',p:'The team lead and I will review on…',r:3,i:4}],
  steps:[{b:'P',t:'Plan',f:[0,1,2,3,4,5]},{b:'D',t:'Do',f:[6]},{b:'S',t:'Study',f:[7]},{b:'A',t:'Act',f:[8]}],shape:'cycle',
  cues:[
   {t:'The issue describes the system, not a person',f:0,fn:t=>!/\b(careless|lazy|do not care|don’t care|incompetent)\b/i.test(t)},
   {t:'The aim says what, for whom and by when',f:1,re:/(by |within|over |before |each |per )/i},
   {t:'A prediction is written',f:3,re:/predict|expect|think|believe|hope/i},
   {t:'A balancing measure is named',f:5,re:/(time|burden|confus|extra|workload|delay|error|worse)/i},
   {t:'A reviewer is named',f:8,re:/(lead|team|supervisor|manager|review|owner|group)/i}],
  weak:{v:['People are careless at handover.','Make handover better.','Replace the form everywhere.','It will work.','Count staff who received an email.','No balancing check needed.','','','Assume the change worked.'],why:['Blames people. A system issue describes the process.','No who, no what, no when.','Too big and no local approval.','No prediction, so no learning from the result.','Measures activity (emails) rather than the outcome.','Every change can have side effects. Look for them.','Nothing recorded about what happened.','No comparison with the prediction.','Conclusion without a review. One test cannot show it worked.']},
  examples:[
   {s:'Hospital ward',t:'An ownership prompt at handover',v:[
    'Fictional handovers on one ward sometimes leave out who owns a pending task. This was noticed at the afternoon handover on several days.',
    'To reduce the number of handovers with a missing task owner on this ward over four weeks, without adding avoidable time.',
    'With the ward manager’s agreement, add one line to the handover sheet, “Who owns it?”, for one shift pattern on one ward.',
    'I predict fewer pending tasks without an owner, and that the handover will take about the same time.',
    'Count handovers that omit a task owner, using the same definition each week, for two weeks before the test and two weeks during.',
    'Ask staff whether the prompt adds time or confusion.',
    '',
    '',
    'The ward manager and the shift leads will review the results at the end of the fourth week and decide whether to adapt, adopt or stop.']},
   {s:'Community team',t:'Telling people about late visits',v:[
    'In a fictional community team, people are sometimes not told when a visit will be late. Some have waited without knowing.',
    'To make sure people are told when a visit is likely to be more than 30 minutes late, for one team over three weeks.',
    'With the team leader’s agreement, add a “late visit call” step to the huddle for one team, for three weeks.',
    'I predict that most late visits will be called ahead, and that office staff will feel more confident about handling calls.',
    'Count late visits and how many had a call ahead, each week, using the same definition.',
    'Ask whether the call adds pressure on the visit round or on the office.',
    '',
    '',
    'The team leader and I will review at the end of week three and decide what to do next.']}]}]},

/* ---------------------------------------------------------------- Fishbone */
fishbone:{
 title:'Cause-and-effect map',sub:'A fishbone to explore possible contributors',
 purpose:'A fishbone (Ishikawa) diagram helps a team explore possible contributors to a process problem under familiar headings, so the discussion widens beyond individuals. Everything on the diagram is a hypothesis until it is investigated. It does not prove causation.',
 use:['Starting a team conversation about why a process does not work as intended.','Making sure a quality discussion looks at conditions as well as people.','Planning what evidence would test each idea.'],
 notUse:['To prove a cause. The diagram lists hypotheses to test.','To identify who to blame.','In place of a formal investigation of a serious event, which follows local policy.'],
 who:['Practising clinicians','New graduates','Students','Support workers'],
 lessons:['human-factors','improvement','just-culture'],acts:['flow','cc-interrupt'],refs:['patient'],
 safety:'Possible contributors are hypotheses. Investigate before drawing conclusions. Serious events follow local investigation processes.',
 pitfalls:[['Treating ideas as causes','The diagram lists possibilities. Gather evidence before you conclude.'],['Blaming people','Look for conditions: process, equipment, environment and workload as well as people.'],['One cause only','Most problems have several contributors. Note them all and test them.'],['No evidence plan','Decide how you will check each idea, for example by observing, counting or asking.']],
 checks:['I have defined the problem specifically.','I have looked at all five headings, not just people.','I have marked each idea as a hypothesis.','I have written what evidence would test each one.','I have chosen one thing to look at first.'],
 custom:'fishbone',
 modes:[{id:'bone',label:'Map',key:'fishbone',doc:'Cause-and-effect map',
  fields:[
   {n:'Effect',l:'Effect: the specific process problem',h:'One sentence. What goes wrong, where, how often if known.',p:'Handovers omit the owner of a pending task…',r:2},
   {n:'People and teamwork',l:'People and teamwork: possible contributors',h:'Shared assumptions, roles, training, communication.',p:'Sender and receiver may assume…',r:3},
   {n:'Process and policy',l:'Process and policy: possible contributors',h:'Steps, forms, rules, who does what.',p:'The form has no field for…',r:3},
   {n:'Equipment and materials',l:'Equipment and materials: possible contributors',h:'Tools, templates, supplies, IT.',p:'The shared template…',r:3},
   {n:'Environment and workload',l:'Environment and workload: possible contributors',h:'Interruptions, noise, space, demand.',p:'Frequent interruptions…',r:3},
   {n:'Measurement',l:'Measurement: what evidence would test these ideas?',h:'Observe, count, compare, ask.',p:'Observe… count… ask…',r:3}],
  steps:[],shape:'fishbone',
  cues:[
   {t:'The effect is specific',f:0,fn:t=>t.trim().split(/\s+/).length>=5},
   {t:'At least three headings have ideas',f:-2,fn:(t,v)=>[1,2,3,4].filter(i=>(v[i]||'').trim()).length>=3},
   {t:'Ideas are described as possible, not certain',f:-1,re:/(may|might|possible|could|hypothes|perhaps)/i},
   {t:'The measurement line says how to test the ideas',f:5,re:/(observe|count|compare|ask|review|audit|interview|measure)/i}],
  weak:{v:['Handover is bad.','People do not care.','The policy is wrong.','Everything is outdated.','It is always too busy.','The cause is obvious; no further evidence needed.'],why:['Not specific enough to investigate.','A judgement about character, not a possible contributor.','Too broad. Which part of which policy?','Overgeneralised, with no example.','“Always” and “busy” give nothing to measure.','Treats a hypothesis as a fact and stops looking.']},
  examples:[
   {s:'Hospital handover',t:'A missing task owner',v:[
    'Handovers on the ward sometimes omit the owner of a pending task, so some tasks are picked up late.',
    'Sender and receiver may assume the other will confirm who owns the task.',
    'The handover sheet may have no field for the task owner.',
    'The shared template may open an older version by default.',
    'Interruptions may occur during handover, so the owner is forgotten.',
    'Observe a sample of handovers, compare template versions, and ask both sender and receiver how they understand “ownership”. These stay hypotheses until investigated.']},
   {s:'Community equipment',t:'Late equipment deliveries',v:[
    'Equipment ordered for people at home sometimes arrives later than the date we gave them.',
    'Office and visiting staff may not agree who confirms the delivery date.',
    'The order form may not have a field for the date the person needs it.',
    'The stock system may not show real-time availability.',
    'Several orders may arrive from different teams on the same day.',
    'Look at a sample of orders from request to delivery, compare the dates, and ask staff how they decide the delivery date.']}]}]}
};

/* Plain-language explanations for tools whose diagram is not a simple step list. */
TK_SPECS.priority.modes[0].explain=[['Do now','Urgent and important. Keep this box small. More than three means ask for help or renegotiate.'],['Plan it','Important but not urgent. Give it a time before it becomes urgent.'],['Ask or renegotiate','Urgent, but less important for you. Ask whether someone else can do it or whether the deadline can move.'],['Check or let go','Neither urgent nor important. Check that is true, and tell anyone who is waiting.']];
TK_SPECS.risk.modes[0].explain=[['Name the outcome and time frame','Risk of what, over how long?'],['Use natural frequencies','Say “about 14 in 100”, not only “14%”. Use the same denominator for both options.'],['Give absolute and relative change','Both, so that a small change does not sound large.'],['Say how sure you are','Where the numbers came from and how certain they are.'],['Ask what matters','The number starts the conversation. It does not end it.']];
TK_SPECS.justculture.modes[0].explain=[['Human error','An unintended slip or lapse. Console the person and fix the conditions.'],['At-risk behaviour','A shortcut where the risk was not recognised or was believed justified. Coach, and ask why the shortcut made sense.'],['Reckless behaviour','Conscious disregard of a substantial, unjustifiable risk. Local accountability processes decide.'],['Not sure yet','Gather facts before choosing. Many events turn out to be about the system first.']];
TK_SPECS.fishbone.modes[0].explain=[['People and teamwork','Shared assumptions, roles, training, communication.'],['Process and policy','Steps, forms, rules and who does what.'],['Equipment and materials','Tools, templates, supplies, IT.'],['Environment and workload','Interruptions, noise, space, demand.'],['Measurement','What you will observe, count or ask to test each idea.']];
TK_SPECS.safety.modes[0].explain=[['Role and training','Acting outside your role or training is a safety risk in itself.'],['Right person, right task','Identify the person and confirm the task.'],['Plan and risks','Plans change. The current approved plan is the one that counts.'],['Hygiene and preparation','Prepare so you are not interrupted mid-task.'],['Consent and understanding','Part of the task, not an extra.'],['Uncertainty','Resolve it before you start.'],['Help and escalation','Know the route before you need it.']];
