/* Carecraft Practice: data for the Practice Lab (skills, levels, per-activity metadata and the new scenarios).
   Everything here is fictional teaching material. Nothing is clinical instruction, a protocol or a competency assessment.
   Names, places, times and numbers are invented. No statistics or studies are asserted. */
const PX_SKILLS=[
 {id:'comms',name:'Communication',short:'Communicate',icon:'dialogue',blurb:'Handover, explaining, checking understanding.'},
 {id:'escalate',name:'Escalation & speaking up',short:'Escalate',icon:'route',blurb:'Raising a concern clearly and persisting.'},
 {id:'safety',name:'Safety & systems',short:'Safety',icon:'shield',blurb:'Hazards, medicines lists, interruptions, human factors.'},
 {id:'reason',name:'Reasoning & evidence',short:'Reason',icon:'research',blurb:'Bias, numbers and uncertainty.'},
 {id:'digital',name:'Digital & data',short:'Digital',icon:'preview',blurb:'Checking AI output, protecting information.'},
 {id:'team',name:'Teamwork & priorities',short:'Team',icon:'team',blurb:'Ownership, huddles, flow and prioritising.'},
 {id:'person',name:'Person-centred care',short:'Person',icon:'reflect',blurb:'Access, shared choices, families.'},
 {id:'resilience',name:'Wellbeing & boundaries',short:'Wellbeing',icon:'spark',blurb:'Support with warmth and honest limits.'}
];
const PX_LEVELS=[
 {id:'foundation',name:'Foundation',n:1,blurb:'Recognise the issue. Cues and hints available. Short.'},
 {id:'core',name:'Core',n:2,blurb:'Decide with less support. Realistic trade-offs.'},
 {id:'advanced',name:'Advanced',n:3,blurb:'Ambiguity, pressure and consequences that carry forward.'}
];
/* Skill, level, time and "what you will practise" for every activity (existing 22 and the new ones). */
const PX_META={
 handover:{skill:'comms',also:['escalate'],level:'core',min:6,units:'4 decisions',fw:'SBAR',lesson:'sbar',practise:['Leading with the observed change','Making the request specific','Closing the loop: who, when, what if']},
 teachback:{skill:'comms',also:['person'],level:'core',min:6,units:'4 decisions',fw:'Teach-back',lesson:'teachback-skill',practise:['Checking your explanation, not the person','Repairing a misunderstanding without blame','Prioritising when time is short']},
 'ai-case':{skill:'digital',also:['reason'],level:'core',min:6,units:'4 decisions',fw:'Verify before you rely',lesson:'ai',practise:['Testing whether a source exists and fits','Spotting context that does not match','Protecting identifiable information']},
 'med-case':{skill:'safety',also:['comms'],level:'core',min:6,units:'4 decisions',fw:'Compare, clarify, communicate',lesson:'med-transitions',practise:['Treating a discrepancy as a question','Escalating when a dose may fall due','Making the resolution reach the next team']},
 room:{skill:'safety',level:'foundation',min:5,units:'6 vignettes',fw:'Five moments',lesson:'infection',practise:['Spotting the hand-hygiene moment','Reading a care space for risk']},
 hygiene:{skill:'safety',level:'foundation',min:5,units:'6 scenes',fw:'Five moments',lesson:'infection',practise:['Naming the hand-hygiene indication','Separating indication from technique']},
 'sbar-studio':{skill:'comms',level:'foundation',min:5,units:'1 builder',fw:'SBAR',lesson:'sbar',practise:['Ordering a message so it gets heard','Closing the loop']},
 movement:{skill:'resilience',level:'foundation',min:3,units:'3 movements',fw:'Optional wellbeing',lesson:'wellbeing',practise:['A short seated movement break','Pacing yourself']},
 cus:{skill:'escalate',level:'core',min:5,units:'3 moments',fw:'CUS',lesson:'speakup',practise:['Stating concern, uncertainty and safety issue','Asking for a specific response']},
 huddle:{skill:'team',level:'core',min:5,units:'3 stages',fw:'Brief, huddle, debrief',lesson:'debrief',practise:['Naming ownership','Responding when conditions change']},
 flow:{skill:'team',also:['reason'],level:'advanced',min:5,units:'1 model',fw:'PDSA',lesson:'improvement',practise:['Reading a transparent process model','Testing one change at a time']},
 'cc-teach':{skill:'comms',level:'foundation',min:4,units:'5 moves',fw:'Teach-back',lesson:'teachback-skill',practise:['Sequencing explain, ask, listen, repair, re-check']},
 'cc-risk':{skill:'reason',also:['person'],level:'core',min:5,units:'1 calculation',fw:'Absolute vs relative',lesson:'risk-evidence',practise:['Comparing absolute and relative change','Asking for the baseline']},
 'cc-reconcile':{skill:'safety',level:'core',min:5,units:'3 rows',fw:'Compare, clarify, communicate',lesson:'med-transitions',practise:['Classifying a discrepancy','Routing the unresolved question']},
 'cc-bias':{skill:'reason',level:'advanced',min:5,units:'3 moments',fw:'Updating a view',lesson:'humility',practise:['Naming a mismatch','Asking what would change the view']},
 'cc-verify':{skill:'digital',also:['reason'],level:'core',min:5,units:'3 moments',fw:'Verify before you rely',lesson:'data-stewardship',practise:['Checking a citation and its population','Using the approved route to share']},
 'cc-access':{skill:'person',level:'foundation',min:5,units:'3 moments',fw:'Ask, adapt',lesson:'dignity',practise:['Spotting an access barrier','Asking the person what works']},
 'cc-interrupt':{skill:'safety',level:'core',min:4,units:'4 moves',fw:'Human factors',lesson:'human-factors',practise:['Recovering a task state after interruption']},
 'cc-compassion':{skill:'resilience',also:['person'],level:'foundation',min:5,units:'3 moments',fw:'Warmth with limits',lesson:'compassion-boundaries',practise:['Acknowledging, then offering what you can']},
 'sim-handover':{skill:'comms',also:['escalate'],level:'advanced',min:6,units:'3 checkpoints',fw:'SBAR',lesson:'sbar',practise:['Leading with a change','Naming an owner','Agreeing a contingency']},
 'sim-interruptions':{skill:'safety',level:'advanced',min:6,units:'3 checkpoints',fw:'Human factors',lesson:'human-factors',practise:['Distinguishing competing demands','Recovering a verified task state']},
 'sim-shared-choice':{skill:'person',also:['reason'],level:'advanced',min:6,units:'3 checkpoints',fw:'Shared decisions',lesson:'shared',practise:['Comparing fictional numbers fairly','Bringing priorities into the plan']},
 /* new Practice Lab activities */
 'px-quiet':{skill:'escalate',also:['comms'],level:'foundation',min:5,units:'3 decisions',fw:'Notice, report, re-escalate',lesson:'deterioration',practise:['Reporting what you see, specifically','Not minimising','Re-escalating when the answer is "wait"']},
 'px-relative':{skill:'person',also:['resilience'],level:'foundation',min:5,units:'3 decisions',fw:'Acknowledge, boundaries, connect',lesson:'empathy',practise:['Acknowledging feeling before facts','Honest limits on what you can share','Connecting to the right person']},
 'px-dismissed':{skill:'escalate',also:['team'],level:'advanced',min:7,units:'4 decisions',fw:'CUS and the two-challenge rule',lesson:'speakup',practise:['Challenging someone senior','Persisting after a dismissal','Repairing the relationship afterwards']},
 'px-nearmiss':{skill:'team',also:['safety'],level:'advanced',min:7,units:'4 decisions',fw:'Just Culture',lesson:'just-culture',practise:['Reporting a near miss you were part of','Looking for system causes','Responding fairly']},
 'px-discharge':{skill:'comms',also:['person'],level:'advanced',min:8,units:'4 decisions',fw:'Teach-back, access and SBAR',lesson:'health-literacy',practise:['Arranging language support','Teach-back with an interpreter','A handover that beats the clock']},
 'px-sbar':{skill:'comms',also:['escalate'],level:'core',min:6,units:'3 builds',fw:'SBAR',lesson:'sbar',practise:['Choosing which facts belong where','Leaving out noise','Making a specific, time-bound request']},
 'px-ladder':{skill:'escalate',level:'core',min:6,units:'5 cases',fw:'CUS and chain of command',lesson:'speakup',practise:['Choosing the right rung for the urgency','Wording the concern','Knowing when to skip rungs']},
 'px-priorities':{skill:'team',also:['safety'],level:'core',min:6,units:'3 rounds',fw:'Four prioritising questions',lesson:'accountability',practise:['Ranking competing demands','Explaining your order','Asking for help early']},
 'px-hazard':{skill:'safety',level:'foundation',min:4,units:'1 scene',fw:'Hazard categories',lesson:'safety',practise:['Scanning a care space systematically','Telling a hazard from a decoy']},
 'px-incident':{skill:'safety',also:['team'],level:'advanced',min:8,units:'1 replay',fw:'Swiss cheese and Just Culture',lesson:'just-culture',practise:['Reading an incident as a chain of defences','Seeing where it could have been caught','Responding fairly to different behaviours']}
};
const PX_NEW_ACTIVITIES=[
 {id:'px-quiet',type:'scenarios',title:'Something has changed',desc:'A support worker notices a person is quieter and paler than this morning. The nurse is busy. What do you say, and what if the answer is “give me ten minutes”?',icon:'dialogue'},
 {id:'px-relative',type:'scenarios',title:'The worried daughter',desc:'A distressed relative asks you in the corridor whether her father will be all right. You are not his nurse and cannot share details. Acknowledge, set limits and connect.',icon:'team'},
 {id:'px-dismissed',type:'scenarios',title:'Concern, dismissed',desc:'You are junior; a senior colleague waves away your concern about a documented allergy. Use CUS, persist and repair the relationship afterwards.',icon:'route'},
 {id:'px-nearmiss',type:'scenarios',title:'The near miss nobody wrote down',desc:'You nearly selected the wrong look-alike product. A colleague stopped you and says “no harm done”. Report, learn from the system and respond fairly.',icon:'shield'},
 {id:'px-discharge',type:'scenarios',title:'Friday, 15:50 discharge',desc:'Transport at 16:30, the community team closes at 17:00 and the person’s son is translating. Protect understanding and the handover while the clock runs.',icon:'clock'},
 {id:'px-sbar',type:'studios',title:'Build the call: SBAR with live preview',desc:'Sort messy fictional notes into Situation, Background, Assessment and Request, and watch the message take shape as you work.',icon:'dialogue'},
 {id:'px-ladder',type:'studios',title:'The escalation ladder',desc:'Five fictional situations. Choose the rung, choose the words and see when it is right to skip rungs.',icon:'route'},
 {id:'px-priorities',type:'studios',title:'Four things at once',desc:'Rank competing demands by dragging or with the move buttons, then compare your order and reasoning with a worked rationale.',icon:'check'},
 {id:'px-hazard',type:'studios',title:'Spot the hazard',desc:'Scan an illustrated care bay for hazards, avoid the decoys and debrief by category. Untimed or a 60-second challenge.',icon:'room'},
 {id:'px-incident',type:'studios',title:'Replay the incident',desc:'Step through a fictional incident timeline, flag where it could have been caught and respond fairly to three behaviours.',icon:'calendar'}
];

/* ---------- Branching scenarios ----------
   opt.q: best | ok | risk   opt.fx: change to the three scenario indicators (-2..2, illustrative, not measurements)
   opt.to: next node id or 'end'. Option order is shuffled at run time. */
const PX_SCENARIOS={
'handover':{
 setting:'Fictional medical ward · 07:10 · change of shift',role:'You are the colleague receiving handover for bay 4, in your own role.',
 intro:'The outgoing colleague is already reaching for their coat. A label has been handed to you. The record says something different.',
 fw:{name:'SBAR with a closed loop',steps:[['S','Situation'],['B','Background'],['A','Assessment'],['R','Request'],['L','Loop closed']]},
 meters:[['clarity','Shared clarity'],['safety','Safety net'],['trust','Team trust']],start:'a',
 nodes:{
 a:{fw:'S',title:'Hearing “stable”',
  scene:'“Mr Reed, bed 4, day two after his operation. He’s stable, nothing to do.” The outgoing colleague is already moving towards the door. On the handover sheet you can see something that does not fit the word “stable”.',
  exhibit:{type:'table',title:'Handover sheet · Mr Alan Reed, bed 4 (fictional)',head:['Time','Breathing rate','Heart rate','Note'],rows:[['22:00','16','82','Settled'],['02:00','18','88','Asleep'],['06:15','22','104','“More sleepy than usual. Re-check 07:00.”'],['07:00','—','—','No entry']],note:'Fictional numbers for practice. They are not thresholds and do not describe any real patient.'},
  q:'What do you do in the next thirty seconds?',hint:'Situation first: what is different, and what is unresolved? The outgoing colleague is the last person who holds this information.',
  opts:[
  {t:'Ask them to stay one minute: “The 06:15 observations are different from earlier and I can’t see a 07:00 check. I’m concerned. Has he been reviewed?”',q:'best',why:'You name the observed change, state your concern and ask a direct question while the person who knows the answer is still there. Handover is a final safety net, not a formality.',then:'The outgoing colleague stops, looks at the sheet and says the 07:00 check was missed during the medicines round and nobody has been called. You now share the same picture.',fx:{clarity:2,safety:1,trust:1},to:'b'},
  {t:'Take the handover, then read the notes and check on him yourself once they have gone.',q:'ok',why:'Checking for yourself is right, but you let the one person with the missing information leave. You will have to reconstruct what happened and what was said.',then:'You find the same gap ten minutes later. The outgoing colleague has left and their phone is off. You reconstruct events from the notes alone.',fx:{clarity:-1,safety:0,trust:0},to:'b'},
  {t:'Say nothing. “Stable” is what the night team has handed over and they know him best.',q:'risk',why:'Deferring to a label over the record leaves the concern unspoken. The words in a handover can lag behind what is written.',then:'You begin your round believing he is stable. At 07:45 a healthcare assistant tells you he is hard to rouse and breathing faster.',fx:{clarity:-2,safety:-2,trust:0},to:'w'}]},
 w:{fw:'S',title:'Forty minutes later',
  scene:'The healthcare assistant stays with Mr Reed and says quietly, “He doesn’t look right.” He opens his eyes to his name but drifts off again. His breathing looks faster than it did when you were introduced at handover.',
  q:'What is your first action?',hint:'Ask what makes this immediate. Is it right to wait for a routine review?',
  opts:[
  {t:'Stay with him, send for help through the emergency or urgent-review route your service uses, and state the observed changes clearly.',q:'best',why:'A person who is hard to rouse with changed breathing needs prompt help. Use the local emergency route; say what you see, not just that you are worried.',then:'The team arrives quickly. They ask what changed and when; you can say, because you were there.',fx:{clarity:1,safety:2,trust:1},to:'d'},
  {t:'Bleep the doctor for a routine review and carry on while you wait.',q:'ok',why:'Asking for review is right, but a routine request does not match the urgency. The word “routine” may set the response time.',then:'Review is booked for “within the hour”. You keep checking him and are not comfortable. You make a second, urgent call.',fx:{clarity:0,safety:0,trust:0},to:'d'},
  {t:'Ask the assistant to repeat observations in thirty minutes and see how he is.',q:'risk',why:'A delay turns a developing problem into a decision to wait. Waiting is a decision, and here it removes the safety net.',then:'Thirty minutes is too long. The nurse in charge, passing, sees him and calls the emergency team herself. She asks why this was not raised earlier.',fx:{clarity:-1,safety:-2,trust:-2},to:'d'}]},
 b:{fw:'R',title:'Making the call',
  scene:'You decide he needs medical review and pick up the phone to the doctor covering the ward. You have about fifteen seconds before they interrupt with questions.',
  q:'Which opening is most likely to get a timely review?',hint:'The listener decides within seconds whether this is urgent. What should they hear first?',
  opts:[
  {t:'“I’m calling about Mr Reed, bed 4, ward 7. His breathing and heart rate have risen since midnight and he is more drowsy than earlier. I’m worried he is getting worse. Can you review him within fifteen minutes?”',q:'best',why:'Who, where, what has changed, your concern and a specific, time-bound request. This is the Situation and Request of SBAR in one breath; background can follow if asked.',then:'The doctor says they are finishing a procedure but will send the on-call team. They ask you to repeat the numbers.',fx:{clarity:2,safety:1,trust:1},to:'c'},
  {t:'“Hello, I’m calling about Mr Reed. He’s 72, admitted on Monday for an operation, with a past history of…” and continue through the background before reaching the change.',q:'ok',why:'Background is useful, but it buries the concern. The listener has to wait for the point and may interrupt before reaching it.',then:'The doctor interrupts after thirty seconds: “What is the problem?” You restart. The call works, but time is lost.',fx:{clarity:-1,safety:0,trust:0},to:'c'},
  {t:'“Hi, it’s the ward. Mr Reed isn’t great. Can someone have a look sometime this morning?”',q:'risk',why:'“Isn’t great” gives no observation and no urgency, and “sometime” gives no time. A vague ask invites a vague response.',then:'“I’ll try to get there,” says the doctor. No time is agreed. You are left wondering whether anyone is actually coming.',fx:{clarity:-2,safety:-1,trust:0},to:'c'}]},
 c:{fw:'A',title:'The answer is “wait”',
  scene:'The doctor says, “I’m in clinic until eleven. Just keep an eye on him and call if he gets worse.” His observations have not improved. You still have the same concern.',
  q:'What now?',hint:'Concern, uncertainty, safety: what would make this specific, and who else can you ask?',
  opts:[
  {t:'Restate it: “I’m still worried because his observations are changing. I’d like someone to see him now. Who else can I contact, or should I use the emergency call?”',q:'best',why:'You hold your position without hostility, repeat the observed facts and ask a specific question about the next route. This is persistence, not insubordination.',then:'After a pause the doctor says the on-call team will come within ten minutes. You have a named route and a time.',fx:{clarity:1,safety:2,trust:1},to:'d'},
  {t:'Agree, increase how often you check him and tell the nurse in charge.',q:'ok',why:'Telling the nurse in charge is a good step and closer monitoring helps. But the review you asked for is now deferred without a decision about what triggers action.',then:'The nurse in charge agrees with your concern and phones the on-call team herself. It works, though you did not make the ask yourself.',fx:{clarity:0,safety:1,trust:0},to:'d'},
  {t:'Say “OK”, document “doctor aware” and move on to your next patient.',q:'risk',why:'“Doctor aware” records a call, not a plan. It can look like closure while the concern remains unresolved.',then:'The note says the doctor was aware; nobody is reviewing him. The next person to read it assumes someone is acting.',fx:{clarity:-1,safety:-2,trust:-1},to:'d'}]},
 d:{fw:'L',title:'Closing the loop',
  scene:'Someone has now agreed to act. The next ten minutes decide whether the plan actually happens.',
  q:'What closes the loop?',hint:'A plan has who, when, what in the meantime and what if.',
  opts:[
  {t:'Confirm who is coming and when, agree what you will monitor until they arrive and what would trigger an emergency call, tell the nurse in charge, and record it.',q:'best',why:'Who, when, in the meantime and what-if are all explicit. The record supports the conversation; it does not replace it.',then:'The review team arrives as agreed. Because they were told what you saw, they act quickly. In the debrief someone says: “The handover sheet told us exactly what to look for.”',fx:{clarity:2,safety:2,trust:1},to:'end'},
  {t:'Document the call and carry on with the rest of your round.',q:'ok',why:'The record matters, but there is no agreed contingency and nobody else knows the plan. It works only if everything goes as hoped.',then:'The review happens, but twenty minutes later than agreed. Nobody was told what to do if it was delayed.',fx:{clarity:0,safety:0,trust:0},to:'end'},
  {t:'Assume it is sorted now that the doctor knows.',q:'risk',why:'Acknowledgement is not ownership. Without a named person and a time, a plan can fail silently.',then:'Nobody comes. Forty minutes later the nurse in charge asks why bed 4 has not been reviewed. Nobody can say who was meant to act.',fx:{clarity:-2,safety:-2,trust:-1},to:'end'}]}
 },
 endings:{strong:'Mr Reed was reviewed promptly and the team had the information they needed. The handover became a shared plan with an owner, a time and a contingency.',mixed:'Mr Reed was reviewed, but there were delays, repeated calls or gaps in who knew what. The safety net held, with some strain.',weak:'The concern was recognised late. The review was delayed and several people were acting on different assumptions. In real life this is the pattern review teams look for in systems, not in individuals.'},
 takeaways:['The handover label can lag behind the record. Compare what you hear with what you see before the person who knows leaves.','Lead with what has changed, state your concern and make a specific, time-bound request.','A closed loop has four parts: who, when, what in the meantime and what if.'],
 reflect:'Which phrase will you use next time to say “this does not fit” politely and quickly?'},

'teachback':{
 setting:'Fictional discharge lounge · 15:40 · Friday',role:'You are the colleague discharging Mrs Okafor, in your own role and within your service’s procedures.',
 intro:'Mrs Okafor has nodded through every explanation and said “yes” each time. When you ask what she will do tomorrow morning, she hesitates.',
 fw:{name:'Teach-back',steps:[['E','Explain in chunks'],['A','Ask them to explain it back'],['R','Repair the gap'],['C','Check again']]},
 meters:[['clarity','Her understanding'],['safety','Safe plan at home'],['trust','Her trust']],start:'a',
 nodes:{
 a:{fw:'A',title:'The vague “yes”',
  scene:'You have covered a new tablet, a tablet to stop, a follow-up phone call and when to seek help. Mrs Okafor smiles and says, “Yes, yes, I understand. Thank you, nurse.” But when you ask, “So what will you do tomorrow morning?” she looks at her daughter’s empty chair and says, “Take my tablets.”',
  exhibit:{type:'say',title:'The conversation so far',lines:[['You','Do you have any questions?'],['Mrs Okafor','No, no. That’s all fine, thank you.'],['You','So what will you do tomorrow morning?'],['Mrs Okafor','I’ll take my tablets… the usual ones.']]},
  q:'What is your best next move?',hint:'Whose explanation is being tested? Who holds the responsibility if it was not clear?',
  opts:[
  {t:'Take the responsibility: “I’ve given you a lot of information. Let me check I explained it clearly: could you tell me in your own words what you’ll do tomorrow morning?”',q:'best',why:'Teach-back checks your explanation, not her memory. Putting the responsibility on yourself keeps it safe to admit uncertainty.',then:'Mrs Okafor relaxes. “Oh, the little white one I stop… and the new one in the morning and evening. And somebody phones?” The partial answers are useful information.',fx:{clarity:2,safety:1,trust:2},to:'b'},
  {t:'Repeat the whole explanation again, slower and louder.',q:'risk',why:'The same explanation, delivered the same way, is likely to reach the same outcome. Volume does not help understanding and can feel patronising.',then:'She nods again and says “yes”. You are no closer to knowing what she will do at home. She looks tired.',fx:{clarity:-1,safety:-1,trust:-1},to:'b'},
  {t:'Hand her the leaflet and ask her to read it tonight.',q:'ok',why:'A leaflet can support a conversation but does not replace it, and it assumes she can read it, and has the glasses and light to do so.',then:'She thanks you and puts it in her bag. You still do not know what she understood.',fx:{clarity:0,safety:0,trust:0},to:'b'}]},
 b:{fw:'R',title:'A misunderstanding appears',
  scene:'Mrs Okafor tries again: “I’ll take the new tablet twice a day and the old white one as well, like always.” That is not the plan. You notice the clock: 15:50.',
  q:'How do you respond?',hint:'A wrong answer is information about your explanation.',
  opts:[
  {t:'Thank her for explaining, then re-explain only the tablet change in simpler words, using the actual boxes, and ask her to show you again.',q:'best',why:'You repair just the gap, in a different way, using something she can see, then check again. A misunderstanding is information for the practitioner.',then:'She picks up the white box and puts it to one side. “This one stops.” She repeats the plan correctly for the first time.',fx:{clarity:2,safety:2,trust:1},to:'c'},
  {t:'Correct her directly: “No, that’s wrong, you stop the white one.”',q:'ok',why:'The correction is accurate but it can feel like a test failed and does not check whether the corrected message has landed.',then:'She stops talking and nods quickly. You are not sure she has understood, only that she will stop disagreeing.',fx:{clarity:0,safety:0,trust:-1},to:'c'},
  {t:'Write “non-compliant with advice” on the discharge form and move on.',q:'risk',why:'Labelling a person for not yet understanding shifts blame from the explanation to the patient, and leaves the safety gap in place.',then:'The form goes with her. At home she takes both tablets. The label is read by the next service as a personal trait.',fx:{clarity:-2,safety:-2,trust:-2},to:'c'}]},
 c:{fw:'E',title:'The clock',
  scene:'Transport is booked for 16:30. The ward is busy. You still have the follow-up call, when to seek help, and how to get a repeat prescription to cover. Mrs Okafor’s daughter has gone to fetch the car and may not be back in time.',
  q:'How do you use the time you have?',hint:'What must she be able to do safely tonight and tomorrow? What can wait for the follow-up call?',
  opts:[
  {t:'Choose the three safety-critical messages (the tablet to stop, the new tablet’s timing, when to ask for help), teach-back those, pass the rest to the leaflet and the follow-up call, and tell the nurse in charge if you need more time.',q:'best',why:'Chunking and prioritising gives the best chance she remembers what matters. Telling the nurse in charge is a good use of the team when the time is short.',then:'She repeats the three messages with confidence. The nurse in charge agrees the transport can wait ten minutes. The daughter comes back in time to hear the summary.',fx:{clarity:2,safety:2,trust:1},to:'d'},
  {t:'Go through the whole list one more time at a steady pace.',q:'ok',why:'Another full pass uses the time but repeats what was already too much. Without a check, you do not know if it landed.',then:'She is tired by the end. “Yes, yes.” You are not sure what has been retained.',fx:{clarity:0,safety:0,trust:0},to:'d'},
  {t:'Let transport go on time. Her daughter will explain it at home.',q:'risk',why:'You are relying on someone who has not heard the explanation and Mrs Okafor has not agreed to that arrangement. The gap moves from the ward to the kitchen.',then:'The daughter was not told about the tablet that stops. The two of them work from the leaflet and each assumes the other knows.',fx:{clarity:-1,safety:-2,trust:-1},to:'d'}]},
 d:{fw:'C',title:'Closing the discharge',
  scene:'She is ready to leave. The final steps are what the next services will rely on.',
  q:'What do you do before she goes?',hint:'What does the record say about understanding? Who needs to know?',
  opts:[
  {t:'Record what you explained and what she could repeat back, give her a number to call, and pass any remaining concern about understanding to the follow-up team through the approved route.',q:'best',why:'The record shows what was checked, not only what was said. The follow-up team can pick up where you left off.',then:'The follow-up call two days later starts: “I understand the little white tablet has stopped. How are you getting on with the new one?”',fx:{clarity:2,safety:2,trust:1},to:'end'},
  {t:'Document “discharge advice given”.',q:'ok',why:'It is true but it records the explanation, not the understanding, and the follow-up team has no sense of what remains uncertain.',then:'The follow-up call checks the basics well; nobody knows to check the tablet change specifically.',fx:{clarity:0,safety:0,trust:0},to:'end'},
  {t:'Give her the leaflet and say “call us if you’re worried”.',q:'risk',why:'This puts the burden of recognising a problem on someone who may not know what the problem would be.',then:'She does not call. Four days later she is unwell and the family realise both tablets have been taken throughout.',fx:{clarity:-1,safety:-2,trust:-1},to:'end'}]}
 },
 endings:{strong:'Mrs Okafor went home able to say what to do and why, and the follow-up team knew what had been checked.',mixed:'Mrs Okafor went home with part of the plan clear. The follow-up call picked up the rest.',weak:'Mrs Okafor went home with the plan only partly understood and a label that did not fit the situation.'},
 takeaways:['Teach-back tests your explanation. Offer it as a check on you, not on her.','A wrong answer is information. Re-explain a smaller chunk in a different way, then check again.','When time is short, prioritise the safety-critical messages and use the team and follow-up routes for the rest.'],
 reflect:'What is one phrase you could use to introduce teach-back so that it sounds like care, not a test?'},

'ai-case':{
 setting:'Fictional learning exercise · preparing a short teaching slide',role:'You are preparing a teaching slide. An AI writing assistant has drafted a paragraph for you.',
 intro:'The draft sounds authoritative. It includes a reference you do not recognise. Everything in this exercise is invented, including the reference.',
 fw:{name:'Verify before you rely',steps:[['1','Does the source exist?'],['2','Does it support the claim?'],['3','Does it fit this context?'],['4','Is it safe to share?']]},
 meters:[['clarity','Confidence you can justify'],['safety','Safe information handling'],['trust','Audience trust']],start:'a',
 nodes:{
 a:{fw:'1',title:'A confident paragraph',
  scene:'The assistant’s draft says a “large trial” found that a fictional teaching technique “substantially improved outcomes”, and gives a reference: “Hargreaves & Lin, Journal of Clinical Insight, 2019; 14: 221–229”. You cannot recall this paper. The tone is certain.',
  exhibit:{type:'say',title:'Assistant output (fictional)',lines:[['Assistant','A large 2019 trial showed this approach substantially improved outcomes (Hargreaves & Lin, J Clin Insight 2019;14:221–229).'],['You','Are you sure that reference is real?'],['Assistant','Yes, I am confident this is accurate.']]},
  q:'Before using the claim, what should happen?',hint:'Which check is independent of the tool that wrote the claim?',
  opts:[
  {t:'Search for the publication in a trusted database or the journal’s own site and read what it actually says.',q:'best',why:'An independent check tests whether the source exists and says what is claimed. A citation is a starting point for checking, not proof.',then:'You find a journal with a similar name. There is no article with those authors, volume and pages. You also find a different, real paper on a related topic.',fx:{clarity:2,safety:1,trust:1},to:'b'},
  {t:'Ask the assistant again whether it is certain and accept a “yes”.',q:'risk',why:'Asking the same system to vouch for itself is not independent evidence. Assistants can produce fluent text, including references that do not exist.',then:'It repeats the claim with more detail. The extra detail makes the paragraph sound more convincing and less checked.',fx:{clarity:-2,safety:-1,trust:-1},to:'b'},
  {t:'Check that the reference is formatted correctly and keep it.',q:'risk',why:'Formatting is not verification. A plausible format is exactly what an assistant generates, whether or not the source exists.',then:'The formatting looks perfect. A colleague later asks for the PDF and you cannot supply one.',fx:{clarity:-1,safety:0,trust:-2},to:'b'}]},
 b:{fw:'3',title:'A real paper, but…',
  scene:'You locate a real paper on a related topic. Its participants, setting and outcome differ from the way the draft describes the claim. The paper is careful about its limits; the draft is not.',
  exhibit:{type:'table',title:'What the draft says vs what the real paper reports (fictional)',head:['','Draft claim','Real paper'],rows:[['Setting','Any clinical setting','One outpatient clinic'],['People','“Patients”','Adults in one programme'],['Outcome','“Improved outcomes”','One self-reported measure'],['Certainty','“Showed”','“Suggests; further work needed”']]},
  q:'What should change in the slide?',hint:'Does a real source support this specific claim in this specific context?',
  opts:[
  {t:'Rewrite the claim to match what the paper actually reports, with its setting and limits, and ask a qualified colleague to review it.',q:'best',why:'A real paper may not support this particular claim. Relevance, population and certainty all matter, and a second pair of eyes catches what you miss.',then:'Your revised sentence is more modest and more useful. The colleague also spots a figure you had misread.',fx:{clarity:2,safety:1,trust:2},to:'c'},
  {t:'Keep the claim because the paper is real and on the same topic.',q:'risk',why:'A real source does not make every claim attached to it true. “Same topic” is not “same population, setting and outcome”.',then:'The claim stays. At the teaching session someone from that setting asks how it applies to theirs.',fx:{clarity:-1,safety:0,trust:-2},to:'c'},
  {t:'Delete the details about setting and population so the claim is easier to read.',q:'risk',why:'Removing context makes the claim harder to assess, not more accurate. It hides the limits that a reader needs.',then:'The slide reads cleanly and says less than the paper does about when it applies. Nobody can check it.',fx:{clarity:-2,safety:0,trust:-1},to:'c'}]},
 c:{fw:'4',title:'An unsafe shortcut',
  scene:'A colleague, short of time, offers to paste a de-identified-looking clinical note from a recent case into a free public AI tool to “tidy it up” for the slide. The note has no name but includes a rare condition, the ward, the date and an unusual family circumstance.',
  q:'What do you advise?',hint:'Names are not the only identifiers. What does your organisation’s information governance route say?',
  opts:[
  {t:'Do not paste it. Use only approved tools and routes for patient information, and ask the information governance team if a tidied example is needed.',q:'best',why:'Removing a name does not make a note anonymous. A rare condition, a place and a date can identify someone. Use the approved workflow, not an improvised assumption.',then:'Your colleague pauses, then agrees. You write a short invented example instead. The information governance team replies with a template for teaching cases.',fx:{clarity:1,safety:2,trust:1},to:'d'},
  {t:'Suggest removing the name and the ward, then pasting it.',q:'risk',why:'Combinations of details can still identify someone. “Removing identifiers” by hand is easy to get wrong.',then:'The note goes out with the rare condition and the family circumstance in it. Nobody knows where the text is stored.',fx:{clarity:-1,safety:-2,trust:-1},to:'d'},
  {t:'Say it is fine if the tool is free and the slide is for teaching.',q:'risk',why:'Cost and purpose do not authorise disclosure. Whether a tool is approved depends on governance, not price.',then:'The note is uploaded. Later, information governance asks about the incident.',fx:{clarity:-2,safety:-2,trust:-2},to:'d'}]},
 d:{fw:'4',title:'What you tell the audience',
  scene:'The slide is ready. You need to decide how to present the AI’s part and your own checks.',
  q:'How should the slide handle this?',hint:'What would let the audience judge how far to rely on it?',
  opts:[
  {t:'State the claim as the paper supports it, cite the real source, and follow your organisation’s guidance on declaring AI assistance.',q:'best',why:'The audience can see what is established and what was checked. Declaring assistance follows local policy rather than guesswork.',then:'A participant asks which paper the claim comes from and you can show it. The discussion focuses on the topic, not the tool.',fx:{clarity:2,safety:1,trust:2},to:'end'},
  {t:'Present the claim without saying where it came from.',q:'ok',why:'The claim may be accurate but nobody can check how it was produced or what it relies on.',then:'The session goes well, but a later challenge to the claim is hard to answer.',fx:{clarity:0,safety:0,trust:-1},to:'end'},
  {t:'Present the original draft; it sounded right and saves time.',q:'risk',why:'It passes on an unchecked claim with a reference that does not exist.',then:'Someone asks for the reference during the session. You cannot provide it.',fx:{clarity:-2,safety:-1,trust:-2},to:'end'}]}
 },
 endings:{strong:'You presented a claim you could stand behind, with a real source, its limits and a safe route for information.',mixed:'Your slide was mostly sound, with some points you could not fully justify.',weak:'The slide passed on an unchecked claim, and information may have been handled unsafely.'},
 takeaways:['A citation is a lead to follow, not evidence in itself. Locate the source and read the claim in context.','A real paper must also fit this population, setting and outcome.','Names are not the only identifiers. Use approved routes for patient information.'],
 reflect:'What is the first thing you will check the next time an AI tool gives you a reference?'},

'med-case':{
 setting:'Fictional receiving ward · 09:05 · after a transfer from another unit',role:'You are responsible for the transfer paperwork check, within your role and local procedures.',
 intro:'Two lists tell two slightly different stories. A dose may fall due soon. The reasons for the differences are not written down.',
 fw:{name:'Compare, clarify, communicate',steps:[['1','Compare'],['2','Clarify'],['3','Communicate'],['4','Confirm']]},
 meters:[['clarity','Clarity of the plan'],['safety','Safety net'],['trust','Team and patient trust']],start:'a',
 nodes:{
 a:{fw:'1',title:'Two lists',
  scene:'The transfer sheet and the new chart do not match. Medicine A is on one list and not the other; Medicine B appears twice under different names; Medicine C is the same on both. The patient says, “I take a little blue one in the morning,” but is not sure what it is for.',
  exhibit:{type:'table',title:'Fictional transfer lists',head:['','Transfer sheet','New chart','Reason documented'],rows:[['Medicine A','Listed, current','Not listed','None'],['Medicine B (brand)','Listed once','Listed twice (brand and generic names)','None'],['Medicine C','Listed, current','Listed, current','n/a']],note:'Fictional. No real medicines or doses are represented.'},
  q:'What is the safest next step?',hint:'A discrepancy is a question. Who owns the answer?',
  opts:[
  {t:'Pause and clarify the discrepancy with the responsible prescriber or pharmacist, using the approved reconciliation process.',q:'best',why:'An unexplained discrepancy needs reconciliation by someone with the authority to decide. Do not infer a prescribing intention.',then:'You record exactly what differs and ask for clarification. The pharmacist is in a meeting for thirty minutes.',fx:{clarity:2,safety:1,trust:1},to:'b'},
  {t:'Use whichever list was printed most recently.',q:'risk',why:'Print time does not tell you which list is correct. Either list may contain the error.',then:'The newest list is used. It is the one missing Medicine A. Nobody knows why.',fx:{clarity:-2,safety:-2,trust:-1},to:'b'},
  {t:'Combine both lists so nothing is missed.',q:'risk',why:'Combining lists can create duplicates and replicates an unverified assumption. It is a prescribing decision, not a clerical one.',then:'The combined list contains Medicine B twice. Nobody notices it until later.',fx:{clarity:-2,safety:-2,trust:-1},to:'b'}]},
 b:{fw:'2',title:'A dose may fall due',
  scene:'It is 09:35. A dose of one of these medicines may be due at 10:00 and the pharmacist is still unavailable. The prescriber is in theatre. You are not able to decide whether to give or withhold it.',
  q:'What do you do?',hint:'You cannot decide, but you can make sure someone with the authority does, in time.',
  opts:[
  {t:'Escalate through the approved route now: tell the prescriber or the nurse in charge that a dose may fall due, say what is unclear and ask for a decision before 10:00.',q:'best',why:'You are not deciding the prescribing question; you are making sure it is decided by the right person before the time pressure arrives.',then:'The nurse in charge phones the on-call prescriber, who clarifies the plan before 10:00. You document who decided and when.',fx:{clarity:2,safety:2,trust:1},to:'c'},
  {t:'Ask the patient and relative what they take and record it, then still seek verification.',q:'ok',why:'What the person reports is useful information and shows them respect, but it is not a substitute for verification. Combine it with a check with the prescriber.',then:'The relative recalls a different brand name. It helps, but you still need the prescriber to confirm.',fx:{clarity:1,safety:0,trust:1},to:'c'},
  {t:'Withhold the medicine “to be safe” until the pharmacist is back.',q:'risk',why:'Withholding is also a prescribing decision. Doing nothing is not neutral and may cause harm of its own.',then:'The dose is missed. The pharmacist later says the omission mattered for this person.',fx:{clarity:-1,safety:-2,trust:-1},to:'c'}]},
 c:{fw:'2',title:'The duplicate',
  scene:'You return to Medicine B. It appears twice under a brand name and a generic name. The two entries have different times.',
  q:'How do you handle it?',hint:'Same medicine twice, or two different medicines?',
  opts:[
  {t:'Ask pharmacy to confirm whether the two names are the same medicine, flag the possible duplicate to the prescriber, and do not remove either entry yourself.',q:'best',why:'You do not know whether this is a duplicate. Asking the pharmacist uses the right expertise. Removing an entry is a prescribing decision.',then:'Pharmacy confirms the two names are the same product. The prescriber corrects the chart. The duplicate entry never reaches the patient.',fx:{clarity:2,safety:2,trust:1},to:'d'},
  {t:'Assume it is a duplicate and strike one entry through.',q:'risk',why:'Without checking, you may remove a correct entry or leave the wrong one. You also change a prescription without authority.',then:'The wrong entry is struck out. The error is caught at the next medicines round.',fx:{clarity:-2,safety:-2,trust:-1},to:'d'},
  {t:'Leave both entries as they are and mention it at handover.',q:'ok',why:'Mentioning it at handover is useful, but the gap persists in the meantime. A duplicate that could cause a repeated dose should be flagged now.',then:'The issue is noted at handover. By then two doses have been given from the chart.',fx:{clarity:0,safety:-1,trust:0},to:'d'}]},
 d:{fw:'3',title:'Making it stick',
  scene:'The prescriber and pharmacist have resolved the three differences. Now the patient, the record and the next team need to know what was agreed.',
  q:'What supports a safer transition?',hint:'Who needs to hear the answer: the record, the next team, the person?',
  opts:[
  {t:'Update the approved record, communicate the agreed plan to the next team, and check the patient’s understanding within your role.',q:'best',why:'A resolution should reach the record, the next team and the patient through the approved workflow, so the same discrepancy does not recur.',then:'At the next handover the receiving nurse says, “The reasons for the changes are all on the chart. That saved a lot of phone calls.”',fx:{clarity:2,safety:2,trust:2},to:'end'},
  {t:'Keep the clarification in your head.',q:'risk',why:'Information that lives in one memory is lost at the end of the shift.',then:'At the next handover nobody knows why Medicine A was stopped. The question starts again.',fx:{clarity:-2,safety:-2,trust:-1},to:'end'},
  {t:'Leave both lists unchanged because the matter is resolved.',q:'risk',why:'An unchanged record keeps the discrepancy alive for the next reader.',then:'Next shift sees two lists that disagree and starts again from the beginning.',fx:{clarity:-2,safety:-1,trust:-1},to:'end'}]}
 },
 endings:{strong:'The discrepancies were resolved by the people with authority before the dose was due, and the answer reached the record, the team and the patient.',mixed:'Most discrepancies were resolved, with some delays or avoidable risk along the way.',weak:'The discrepancies were resolved by assumption or left open, and the next team inherited the problem.'},
 takeaways:['A discrepancy is a question to route to the person with the authority, not a puzzle to solve yourself.','When time pressure appears, escalate early with a clear question and a deadline.','A resolution is complete when the record, the next team and the patient all have it.'],
 reflect:'Who is the person in your setting who owns the answer to a medicines question, and how would you reach them quickly?'},

'px-quiet':{
 setting:'Fictional care ward · 14:20 · early afternoon',role:'You are a healthcare support worker, helping Mr Dev Patel with a drink. Your colleagues are busy elsewhere.',
 intro:'Mr Patel is usually chatty. This afternoon he is quiet and says, “Just tired.” Something in the room feels different.',
 fw:{name:'Notice, report, re-escalate',steps:[['N','Notice'],['R','Report clearly'],['E','Re-escalate if needed'],['D','Document']]},
 meters:[['clarity','Clear message'],['safety','Safety net'],['trust','Team trust']],start:'a',
 nodes:{
 a:{fw:'N',title:'“Just tired”',
  scene:'Mr Patel looks paler than he did this morning, his skin feels cool and damp, and his breathing seems quicker. He says, “Just tired, love.” The nurse in charge is on the medicines round at the far end of the ward. Other staff are with other people.',
  exhibit:{type:'note',title:'What you have noticed (your own words)',lines:['Quieter than usual since lunch','Looks pale; skin feels cool and damp','Breathing looks quicker than this morning','Says he is “just tired”']},
  q:'What do you do first?',hint:'You do not need to know the cause to know it has changed.',
  opts:[
  {t:'Stay with him and tell the nurse in charge in person, straight away, what you have seen.',q:'best',why:'You noticed a change; the nurse in charge has the training to assess it. Tell them now, in person, rather than waiting for a quieter moment.',then:'The nurse in charge looks up, sees your face and asks you to say it again. She puts down the medicines tray.',fx:{clarity:2,safety:2,trust:1},to:'b'},
  {t:'Write your observations in the daily notes to mention at handover.',q:'ok',why:'Recording is part of the task but it comes after telling someone, not instead of it. A note is not an alert.',then:'You write it down. Nobody reads the notes until the evening. A colleague later asks why you did not tell someone.',fx:{clarity:0,safety:-1,trust:0},to:'w'},
  {t:'Let him rest. He said he is just tired, and you do not want to cause a fuss.',q:'risk',why:'His reassurance does not remove what you have seen. Many people say they are “fine”; the change is the information.',then:'You settle him back and move on. Forty minutes later a colleague finds him very drowsy and hard to wake.',fx:{clarity:-2,safety:-2,trust:-1},to:'w'}]},
 w:{fw:'E',title:'Later than it should be',
  scene:'Your colleague stays with Mr Patel and turns to you. “How long has he looked like this?” You realise you have noticed these changes and not said anything. The nurse in charge is already on her way.',
  q:'What do you say?',hint:'Honesty is part of how the team learns. What matters for him now?',
  opts:[
  {t:'Say exactly what you noticed and when: “From about 14:20 he was quieter, paler and breathing faster. I should have told someone straight away.”',q:'best',why:'Clear times and observations help the team, and owning the delay lets the learning focus on what to change.',then:'The nurse thanks you for the times. Afterwards she says: “Next time, tell me the moment you notice it. I would always rather be told.”',fx:{clarity:2,safety:1,trust:2},to:'end'},
  {t:'Say you are not sure how long, you did not want to bother anyone.',q:'ok',why:'Honest, but it gives the team little to work with and the pattern, not wanting to bother anyone, remains.',then:'The team makes a best estimate. Later the nurse in charge talks with you about speaking up early.',fx:{clarity:-1,safety:0,trust:0},to:'end'},
  {t:'Say you only just noticed.',q:'risk',why:'It is not true and it removes information the team needs. It also teaches nothing about speaking up sooner.',then:'The timing is recorded as 14:55. Later a colleague mentions you were with him at 14:20.',fx:{clarity:-2,safety:-1,trust:-2},to:'end'}]},
 b:{fw:'R',title:'What do you say?',
  scene:'The nurse in charge is looking at you. You have about ten seconds to say what you have seen.',
  q:'Which message is most useful?',hint:'Observation, concern, request. Not a diagnosis.',
  opts:[
  {t:'“Mr Patel in bed 6 looks different since this morning: quieter, pale and clammy, breathing faster. I’m worried. Can you come and see him now?”',q:'best',why:'Who, what has changed, how you feel about it and a specific request with a time. You do not need to know what it means.',then:'She follows you straight to his bed. “Thank you for telling me now.”',fx:{clarity:2,safety:2,trust:1},to:'c'},
  {t:'“Mr Patel isn’t himself. Can you check on him later?”',q:'ok',why:'It points to a person and a problem, but “isn’t himself” and “later” leave out the observations and the urgency.',then:'She says she will come when the round is finished. You are not sure how long that will be.',fx:{clarity:-1,safety:-1,trust:0},to:'c'},
  {t:'“It’s probably nothing, but… I just thought I’d mention that Mr Patel seems a bit tired.”',q:'risk',why:'“Probably nothing” and “a bit tired” minimise what you saw. The listener hears what you said, not what you meant.',then:'“Thanks, I’ll look in a bit.” She does not look up from the medicines.',fx:{clarity:-2,safety:-2,trust:-1},to:'c'}]},
 c:{fw:'E',title:'The answer is “wait”',
  scene:'The nurse in charge says, “Give me ten minutes. I’m in the middle of the round and I can’t leave it.” You can see Mr Patel is no better.',
  q:'What now?',hint:'Persisting is not rude. What makes the request specific and who else can help?',
  opts:[
  {t:'Say it again: “I’m worried about him now. Please come as soon as you can. If you can’t, who else should I ask? I’ll stay with him.” Use the urgent route if he gets worse.',q:'best',why:'You hold your position, restate the concern, offer to stay and ask for a named alternative. This is persistence, not insubordination.',then:'She hands the round to a colleague and comes. “Thank you for pushing back.”',fx:{clarity:1,safety:2,trust:1},to:'d'},
  {t:'Wait the ten minutes, checking him every few minutes and telling her if anything changes.',q:'ok',why:'Staying and checking is helpful, but you have accepted a delay without agreeing what would trigger an earlier response.',then:'He is no better after ten minutes. You tell her again and she comes.',fx:{clarity:0,safety:0,trust:0},to:'d'},
  {t:'Go back to the tasks you were doing. She knows now.',q:'risk',why:'Telling someone once is not the same as the concern being acted on. “She knows” can become “nobody is watching him”.',then:'Nobody is with him for the next twenty minutes. When the nurse comes, his breathing has worsened.',fx:{clarity:-1,safety:-2,trust:-1},to:'d'}]},
 d:{fw:'D',title:'Afterwards',
  scene:'Mr Patel has been seen and the team is acting on a plan. The immediate crisis has passed.',
  q:'What do you do now?',hint:'What does the next person on shift need from you?',
  opts:[
  {t:'Write down what you saw, with times, in the approved record, and tell your supervisor what helped and what would have helped sooner.',q:'best',why:'Times and facts help the team and the record. Telling your supervisor what would have helped turns one experience into learning.',then:'At the team huddle the nurse in charge says: “I’d rather be told too early than too late. That was good practice.”',fx:{clarity:2,safety:1,trust:2},to:'end'},
  {t:'Write a short note and say nothing more.',q:'ok',why:'A note is useful, but without a conversation the team misses the chance to learn what would help you speak up sooner.',then:'The record is complete. The pattern of waiting remains.',fx:{clarity:0,safety:0,trust:0},to:'end'},
  {t:'Leave it to others to write up. You were only helping.',q:'risk',why:'Your observations and their timing are unique. A record without them is incomplete.',then:'The record starts at 14:55. The earlier changes are lost.',fx:{clarity:-2,safety:-1,trust:-1},to:'end'}]}
 },
 endings:{strong:'Mr Patel was seen promptly because you said what you saw, said it clearly and persisted. The team now has your times.',mixed:'Mr Patel was seen, but there were delays because the message was soft or the answer was accepted.',weak:'The change was reported late. The team lost time and information they needed.'},
 takeaways:['You do not need a diagnosis to report a change. Say what you saw, how it differs from before and that you are worried.','Report in person, not in the notes, when something looks different.','If the answer is “wait”, say it again, offer a specific alternative and stay with the person.'],
 reflect:'What is one change you might notice and delay mentioning, and what would help you say it sooner?'},

'px-relative':{
 setting:'Fictional hospital corridor · 17:30 · visiting time',role:'You are a member of ward staff. You are not looking after Mr Hall; you are walking past.',
 intro:'A woman stops you, tearful and angry: “Nobody will tell me anything about my dad.”',
 fw:{name:'Acknowledge, boundaries, connect',steps:[['A','Acknowledge'],['B','Boundaries'],['C','Connect'],['K','Keep your promise']]},
 meters:[['clarity','Her understanding'],['safety','Safe information handling'],['trust','Her trust']],start:'a',
 nodes:{
 a:{fw:'A',title:'In the corridor',
  scene:'“I’ve been here three hours. Nobody’s told me anything. Is he going to be all right?” You do not know Mr Hall’s condition and it is not your place to say. She is crying.',
  exhibit:{type:'say',title:'What she says',lines:[['Daughter','Nobody tells me anything.'],['Daughter','Is he going to be all right?'],['Daughter','I just want someone to talk to me.']]},
  q:'What is your best first response?',hint:'Feeling first, facts second. What can you honestly offer?',
  opts:[
  {t:'“I can see how worried you are. I’m not the person who can talk through his care, but I’ll find the nurse looking after him and ask them to speak with you. Could I take your name and who you’re here to see?”',q:'best',why:'You acknowledge her feelings without false reassurance, are honest about your limits and offer something concrete: finding the right person.',then:'She takes a breath. “Thank you. I’m Priya. Dad is Mr Hall in bed 12.” Her shoulders drop a little.',fx:{clarity:1,safety:1,trust:2},to:'b'},
  {t:'“I’m sure he’s fine, try not to worry.”',q:'risk',why:'You cannot know that he is fine, and false reassurance can break trust if the news is different. It also tells her not to feel what she feels.',then:'“You don’t know that,” she says. Her voice rises. A relative nearby looks over.',fx:{clarity:-1,safety:-1,trust:-2},to:'b'},
  {t:'“You’ll need to ask at the nurses’ station.”',q:'ok',why:'Accurate, but it leaves her alone with her fear and sends her away from you, with no one expecting her.',then:'She walks away and stands at the desk. Nobody there knows who she is.',fx:{clarity:0,safety:0,trust:-1},to:'b'}]},
 b:{fw:'C',title:'The busy desk',
  scene:'The nurse in charge is on the phone and holds up a hand. The daughter is watching. She says, “I’m not leaving until someone talks to me.”',
  q:'How do you handle the wait?',hint:'Don’t make promises you cannot keep. What can you do for her right now?',
  opts:[
  {t:'Stay briefly, offer her a quiet seat, tell her honestly how long you think the wait might be, and give the nurse in charge a one-line handover of what she needs.',q:'best',why:'You make the wait more bearable and keep the promise you made. Passing on a clear request lets the nurse in charge act when free.',then:'The nurse finishes her call and nods. “Give me five minutes. I’ll come to her.” She does.',fx:{clarity:1,safety:1,trust:2},to:'c'},
  {t:'Leave her with some water and say you will be back, then carry on.',q:'ok',why:'It is kind, but nobody else knows she is waiting and you may not be back. A promise is only useful if someone is holding it.',then:'You are called away. She waits forty minutes. Nobody comes.',fx:{clarity:-1,safety:0,trust:-1},to:'c'},
  {t:'Tell her he is comfortable and in good hands.',q:'risk',why:'It might not be true and it is not yours to say. “Comfortable” is a clinical judgement about a person you are not caring for.',then:'She repeats it to her brother on the phone. Later she discovers something different.',fx:{clarity:-2,safety:-1,trust:-2},to:'c'}]},
 c:{fw:'B',title:'What can be shared?',
  scene:'The nurse in charge tells you quietly: Mr Hall has not said whether he is happy for his family to be given details. She asks you to explain that to Priya while she checks with him.',
  q:'What do you say?',hint:'You can listen even when you cannot tell. What can you offer?',
  opts:[
  {t:'“I can’t share details without your father’s permission, but we’re asking him now whether he’s happy for us to talk with you. Is there anything you know about him that would help us care for him?”',q:'best',why:'You explain the limit honestly and kindly, say what is happening and invite her to share what she knows.',then:'She nods. “He’s on blood pressure tablets. And he gets confused at night.” You pass this to the nurse, who is grateful for it.',fx:{clarity:1,safety:2,trust:2},to:'d'},
  {t:'“I’m afraid I can’t tell you anything.”',q:'ok',why:'It is correct but it closes the conversation. A limit with no explanation or next step feels like a wall.',then:'She says nothing. Her hands are shaking.',fx:{clarity:0,safety:1,trust:-1},to:'d'},
  {t:'“He’s stable, from what I heard.”',q:'risk',why:'You have shared information without the person’s permission and without knowing the facts. It breaches his confidence.',then:'Later, Mr Hall tells the team he did not want his daughter told anything yet.',fx:{clarity:-1,safety:-2,trust:-2},to:'d'}]},
 d:{fw:'K',title:'Keeping faith',
  scene:'Mr Hall has agreed to share some information. The nurse is going to speak with Priya. You are about to go back to your own tasks.',
  q:'What do you do?',hint:'Close what you opened.',
  opts:[
  {t:'Check that the nurse is with her, tell Priya who will be speaking with her, then note anything useful in the approved way and look after yourself after a hard conversation.',q:'best',why:'You keep the promise you made, hand over clearly and notice the effect on you. Hard conversations cost something.',then:'Priya thanks you on her way out. A colleague asks how you are. “Fine,” you say, then, “Actually that was hard.”',fx:{clarity:1,safety:1,trust:2},to:'end'},
  {t:'Go back to your tasks. The nurse has it now.',q:'ok',why:'The nurse has it, but you made a promise to Priya and have not closed it with her.',then:'Priya waits another ten minutes before the nurse comes. She asks the desk if anyone told them.',fx:{clarity:0,safety:0,trust:-1},to:'end'},
  {t:'Tell her you will phone her tonight with an update.',q:'risk',why:'You have no authority to phone with updates, and you may not be on shift. Promises you cannot keep damage trust.',then:'You are not on duty. She waits by the phone.',fx:{clarity:-2,safety:-1,trust:-2},to:'end'}]}
 },
 endings:{strong:'Priya felt heard, the right person spoke with her and Mr Hall’s wishes were respected.',mixed:'Priya was eventually helped, but the wait or the boundaries left her uncertain.',weak:'Priya was left without support or was given information that was not yours to share.'},
 takeaways:['Acknowledge the feeling before the facts. You can do this even when you cannot say anything about the person’s care.','Be honest about your limits and then offer something real, such as connecting the person to the right colleague.','Do not make promises you cannot keep. Close the loop on the ones you do make.'],
 reflect:'What is one sentence you could use to say “I can’t tell you that, but here is what I can do”?'},

'px-dismissed':{
 setting:'Fictional medical unit · 10:20 · busy morning',role:'You are a newly qualified clinician, in your own role, preparing to give a medicine a senior colleague has asked for.',
 intro:'Something in the record does not match the plan. The senior colleague is experienced, confident and short of time.',
 fw:{name:'CUS and the two-challenge rule',steps:[['C','Concerned'],['U','Uncomfortable'],['S','Safety issue'],['E','Escalate / second voice'],['L','Learn & repair']]},
 meters:[['clarity','Clear message'],['safety','Safety net'],['trust','Team trust']],start:'a',
 nodes:{
 a:{fw:'C',title:'The first challenge',
  scene:'The record shows a documented allergy to a class of medicine. The plan your senior colleague has just asked you to give is from that class. You say nothing yet. They are already moving on to the next person.',
  exhibit:{type:'note',title:'What the record shows (fictional)',lines:['Allergy: documented reaction to a class of medicine','Plan: a medicine from that class requested','No note explaining a decision to proceed']},
  q:'What do you do?',hint:'Specific, calm and early. What do you see and what do you want?',
  opts:[
  {t:'Stop them: “I’m concerned. The record shows an allergy to that class of medicine. Can we check it before I give this?”',q:'best',why:'You say what you see, name your concern and ask for a specific action. CUS begins with “I am Concerned”, said clearly and early.',then:'They glance up, irritated. “I’ve used this a hundred times.” They are busy and clearly do not want a conversation.',fx:{clarity:2,safety:1,trust:0},to:'b'},
  {t:'Ask softly: “Are you sure about that one?”',q:'ok',why:'It opens a door, but a vague question lets them answer “yes” without checking anything. A question is easy to wave away.',then:'“Yes,” they say, already walking. Nothing has been checked.',fx:{clarity:-1,safety:-1,trust:0},to:'b'},
  {t:'Assume they have checked and prepare the medicine.',q:'risk',why:'Seniority does not guarantee that a check has been made. Assuming it has been is how hazards reach people.',then:'You prepare the dose. Part of you is still uneasy as you go to the bed.',fx:{clarity:-2,safety:-2,trust:0},to:'b'}]},
 b:{fw:'U',title:'The dismissal',
  scene:'“Look, I’m busy,” your senior colleague says. “It’ll be fine. Just give it.” Another member of staff is nearby, half-listening.',
  q:'What do you do now?',hint:'Concerned has been said. What is next, and who else can help?',
  opts:[
  {t:'Move to the next level of CUS: “I’m uncomfortable giving this. It’s a safety issue. I’m going to ask pharmacy to confirm right now.” Ask the colleague nearby to witness and help.',q:'best',why:'You escalate from concern to a clear safety statement, say what you will do and bring in a second voice (the two-challenge rule).',then:'The nearby colleague says, “I’d check too.” Together you phone pharmacy. The senior colleague is annoyed but waits.',fx:{clarity:2,safety:2,trust:0},to:'c'},
  {t:'Ask the pharmacist quietly but give it if the senior colleague insists.',q:'ok',why:'Asking pharmacy is good but you have already decided to proceed if overruled. You are using the check as cover, not as a stop.',then:'The pharmacist is not available. Under pressure, you hesitate and the senior colleague takes the medicine from you.',fx:{clarity:0,safety:-1,trust:-1},to:'c'},
  {t:'Say “OK” and give it.',q:'risk',why:'Compliance in the face of a recorded safety concern means the person bears the risk. A hierarchy that cannot be challenged is a system risk.',then:'You give it. Within minutes the person reports itching and flushing. The team responds, and you are shaken.',fx:{clarity:-2,safety:-2,trust:-1},to:'c'}]},
 c:{fw:'E',title:'The outcome',
  scene:'Pharmacy confirms the entry was a recorded intolerance rather than an allergy, and the prescriber now documents the reasoning for the plan. The senior colleague says, “Told you.” The room is tense.',
  q:'How do you respond?',hint:'Raising a concern is not wrong because it turned out fine. What do you want people to remember?',
  opts:[
  {t:'Thank everyone for pausing: “Thanks for letting me check. The record wasn’t clear to me and I’d rather ask. I’ll make sure the allergy entry is updated so it’s clearer next time.”',q:'best',why:'You affirm the behaviour you want to keep (checking), keep the tone non-blaming and fix the system issue: an unclear record.',then:'The senior colleague softens a little: “Fair enough. It should have been clearer.” The entry is updated.',fx:{clarity:2,safety:1,trust:2},to:'d'},
  {t:'Apologise for “wasting everyone’s time” and say you will not do it again.',q:'risk',why:'It teaches the team that checking is wasteful, which is the opposite of a safe culture. The problem was the record, not you.',then:'The senior colleague nods. The next junior colleague hears the same message by implication.',fx:{clarity:-1,safety:-1,trust:-1},to:'d'},
  {t:'Say nothing and move on.',q:'ok',why:'It avoids tension, but the unclear record remains and nobody has said that checking was reasonable.',then:'The entry stays unclear. The next time the same question arises, the same debate will happen.',fx:{clarity:0,safety:0,trust:0},to:'d'}]},
 d:{fw:'L',title:'Later that day',
  scene:'The senior colleague was brusque with you. You want to repair the relationship and make sure learning happens.',
  q:'What is the most constructive next step?',hint:'Private, specific, forward-looking. Where does the learning go?',
  opts:[
  {t:'Ask for a short private conversation. Describe the situation and what you did, say how it felt and what you would like in future. Report it through the learning route if local policy suggests.',q:'best',why:'Describing, expressing and suggesting (DESC) keeps the conversation specific and non-accusatory. The learning route shares the lesson beyond you two.',then:'The senior colleague listens and says, “I was short with you. I’d want you to say it again.” You both talk to the team lead about the record.',fx:{clarity:2,safety:1,trust:2},to:'end'},
  {t:'Avoid them for the rest of the day.',q:'ok',why:'It avoids conflict but leaves the tension, and the next time you need to speak up it will be harder.',then:'The relationship stays cool. Nothing changes.',fx:{clarity:0,safety:0,trust:-1},to:'end'},
  {t:'Tell colleagues in the staffroom how rude they were.',q:'risk',why:'Venting spreads the story without solving anything and can damage your own credibility.',then:'The story spreads. The senior colleague hears of it second-hand. Trust drops on both sides.',fx:{clarity:-1,safety:-1,trust:-2},to:'end'}]}
 },
 endings:{strong:'The concern was checked before harm could occur and the record was clarified. The relationship was repaired and the team learned something.',mixed:'The outcome was acceptable, but the concern was softer or later than it needed to be.',weak:'The concern was not acted on in time. In real life this pattern would trigger a system review, not an individual blame.'},
 takeaways:['Challenge early and specifically. CUS gives you the words: “I am Concerned, I am Uncomfortable, this is a Safety issue.”','Use a second voice. The two-challenge rule means more than one person can stop the line.','When a concern turns out to be unnecessary, affirm the checking, and fix the system cause.'],
 reflect:'What are the exact words you would use to say “this is a safety issue” to someone more senior than you?'},

'px-nearmiss':{
 setting:'Fictional medicines room · 11:40 · mid-morning',role:'You are a member of the clinical team, in your own role. You almost made a mistake.',
 intro:'You reach for a product. A colleague catches your arm: “That’s not the one.” Nothing reached the patient.',
 fw:{name:'Just Culture and the learning loop',steps:[['M','Make safe'],['R','Report'],['L','Learn from the system'],['F','Respond fairly']]},
 meters:[['clarity','Learning'],['safety','Safety net'],['trust','Psychological safety']],start:'a',
 nodes:{
 a:{fw:'M',title:'“That’s not the one”',
  scene:'Two products with near-identical packaging sit side by side on a shelf. You reached for the wrong one, and your colleague stopped you. They say, “No harm done, don’t worry about it.” Your heart is still racing.',
  exhibit:{type:'note',title:'What happened (fictional)',lines:['Two look-alike products stored next to each other','You picked up the wrong one','A colleague stopped you before use','No harm reached the patient']},
  q:'What do you do now?',hint:'Make safe first. Then who needs to know?',
  opts:[
  {t:'Thank your colleague, put the product back safely, pause and tell the team lead what happened. Report it through the incident system.',q:'best',why:'A near miss is free information about how the system can fail. Thanking the colleague and reporting both protect the next person.',then:'The team lead says, “Thank you for telling me. Can you write down what you saw on the shelf?”',fx:{clarity:2,safety:2,trust:1},to:'b'},
  {t:'Make a mental note to be more careful in future.',q:'ok',why:'Personal vigilance is useful, but it will not stop the next person making the same mistake with the same shelf.',then:'You are careful for a week. A newer colleague nearly makes the same mistake a month later.',fx:{clarity:-1,safety:-1,trust:0},to:'b'},
  {t:'Say nothing. No harm was done and you do not want to be blamed.',q:'risk',why:'Silence protects you in the short term, but removes the information the system needs. Near misses are warnings.',then:'Nobody else knows. Three weeks later, a colleague makes the same selection and it reaches a patient.',fx:{clarity:-2,safety:-2,trust:-1},to:'b'}]},
 b:{fw:'R',title:'The colleague',
  scene:'Your colleague says, “Honestly, don’t report it. It just makes trouble for everyone, and you’ll end up in meetings.”',
  q:'How do you respond?',hint:'Respect the kindness, and keep your purpose clear.',
  opts:[
  {t:'Thank them and explain: “I’d rather report it. Someone else could meet the same trap. Would you help me describe what we both saw on the shelf?”',q:'best',why:'You respect their intention, explain your reason and invite them to help. It frames reporting as protecting the next person.',then:'Your colleague hesitates, then agrees. “I’ve nearly done it myself.” Two perspectives go into the report.',fx:{clarity:2,safety:1,trust:2},to:'c'},
  {t:'Report it quietly without telling your colleague.',q:'ok',why:'The report is made, but the opportunity to share the learning, and perhaps shift the norm, is lost.',then:'Your colleague later finds out. They feel excluded and wonder what was written about them.',fx:{clarity:1,safety:1,trust:-1},to:'c'},
  {t:'Agree and drop it.',q:'risk',why:'Agreeing to silence reinforces a culture in which near misses go unreported.',then:'Neither of you reports it. The shelf stays as it is.',fx:{clarity:-2,safety:-2,trust:-1},to:'c'}]},
 c:{fw:'L',title:'Whose fault?',
  scene:'The manager reviews the report. “I need to understand how this happened,” she says. “Whose fault was it?”',
  q:'What do you say?',hint:'Individual action sits inside a system. What helped the error happen?',
  opts:[
  {t:'Describe what happened openly, including contributing factors: the look-alike packaging, the shelf position, the interruption. Ask what system changes could help.',q:'best',why:'Focusing on what made the error likely moves the conversation from blame to learning. You are accountable for telling the truth.',then:'The manager nods and writes. “Let’s look at how those two are stored.”',fx:{clarity:2,safety:2,trust:2},to:'d'},
  {t:'Accept the blame so the review can close quickly.',q:'ok',why:'Taking personal blame may feel noble but it hides the system factors and teaches nothing to the next person.',then:'The review closes with “staff reminded to check labels”. The shelf stays unchanged.',fx:{clarity:-1,safety:-1,trust:0},to:'d'},
  {t:'Point to your colleague: they were busy and did not label it clearly.',q:'risk',why:'Shifting blame damages trust and still misses the system causes.',then:'The review focuses on your colleague. The shelf stays unchanged. Trust in the team drops.',fx:{clarity:-1,safety:-1,trust:-2},to:'d'}]},
 d:{fw:'F',title:'A fair response',
  scene:'The review identifies several contributing factors. Now the team has to decide how to respond fairly to the people involved.',
  q:'What does a fair response look like?',hint:'Human error, at-risk behaviour and reckless behaviour call for different responses.',
  opts:[
  {t:'Console the person making an honest error, coach where there are at-risk shortcuts, and fix the system so the trap is harder to fall into.',q:'best',why:'Just Culture separates human error (console, redesign), at-risk behaviour (coach) and reckless behaviour (sanction). Most near misses sit in the first two.',then:'The shelves are reorganised, the packaging flagged to the supplier and the team talks about interruptions.',fx:{clarity:2,safety:2,trust:2},to:'end'},
  {t:'Remind staff to check labels more carefully.',q:'ok',why:'A reminder is cheap and visible, but it relies on vigilance and leaves the trap in place.',then:'A poster goes up. Nothing else changes.',fx:{clarity:0,safety:0,trust:0},to:'end'},
  {t:'Discipline the person who reached for the wrong product.',q:'risk',why:'Punishing honest error makes people hide mistakes, and removes the learning that prevents the next one.',then:'Reports from the unit drop. A month later a colleague hides a similar mistake.',fx:{clarity:-2,safety:-2,trust:-2},to:'end'}]}
 },
 endings:{strong:'The near miss became learning: a clearer shelf, a team that talks about it and a colleague who knows that reporting is safe.',mixed:'Some learning happened, but the system was only partly changed or someone was left uncomfortable.',weak:'The near miss was lost or blamed on a person. The trap remained and the next person was more likely to hide a mistake.'},
 takeaways:['A near miss is free information. Reporting it protects the next person.','Look for what made the error likely: packaging, storage, interruption. Personal vigilance is not a system fix.','A fair response separates human error, at-risk behaviour and reckless behaviour.'],
 reflect:'What would make it easier for you and your colleagues to report a near miss without worrying about blame?'},

'px-discharge':{
 setting:'Fictional ward · Friday 15:50 · bed pressure',role:'You are the colleague discharging Mr Tran, in your own role and local procedures.',
 intro:'Transport is booked for 16:30. The community team closes at 17:00. Mr Tran’s son is translating, and you are not sure how much Mr Tran understands.',
 fw:{name:'Access, teach-back and handover',steps:[['I','Interpreter / access'],['T','Teach-back'],['H','Handover (SBAR)'],['D','Document']]},
 meters:[['clarity','Mr Tran’s understanding'],['safety','Safe discharge'],['trust','Trust and dignity']],start:'a',
 nodes:{
 a:{fw:'I',title:'The son is translating',
  scene:'Mr Tran speaks Vietnamese and limited English. His son, Minh, has been translating, but he keeps shortening your sentences and answers questions for his father. Mr Tran has nodded throughout. You have a new dressing plan and two medicine changes to explain.',
  exhibit:{type:'say',title:'The conversation so far',lines:[['You','Mr Tran, do you understand the dressing?'],['Minh','Yes yes, he understands.'],['You','Can he show me how he will do it?'],['Minh','He doesn’t need to, I will do it.']]},
  q:'What is the most appropriate step?',hint:'Whose voice is missing? Which route does your service offer for interpretation?',
  opts:[
  {t:'Explain to Minh that you would like a professional interpreter so that his father can ask his own questions, and book a telephone or video interpreter through the service.',q:'best',why:'Family members can unintentionally filter, shorten or answer for the person. A qualified interpreter protects accuracy, privacy and Mr Tran’s own voice.',then:'Minh is relieved: “I wasn’t sure I was getting the medical words right.” The interpreter connects in a few minutes.',fx:{clarity:2,safety:1,trust:2},to:'b'},
  {t:'Continue with Minh translating, just this once, since the clock is short.',q:'ok',why:'It saves minutes, but accuracy, privacy and the person’s own questions are lost. “Just this once” is how a barrier becomes routine.',then:'The conversation finishes quickly. You are not sure what Mr Tran understood or whether he agreed.',fx:{clarity:-1,safety:-1,trust:-1},to:'b'},
  {t:'Skip the explanation and give written instructions in English.',q:'risk',why:'Written English instructions do not address the access barrier and assume literacy in a second language.',then:'The instructions are handed over. Neither Mr Tran nor his son can read all of them.',fx:{clarity:-2,safety:-2,trust:-1},to:'b'}]},
 b:{fw:'T',title:'Teach-back with an interpreter',
  scene:'The interpreter is on the line. Time is tight: 16:05. You have a dressing plan, two medicine changes and a follow-up. Too much to cover at once.',
  q:'How do you structure the next ten minutes?',hint:'Chunk, check, repair. Speak to Mr Tran, not about him.',
  opts:[
  {t:'Speak to Mr Tran directly through the interpreter, explain the safety-critical points first in short chunks, and ask him to explain each back in his own words.',q:'best',why:'You address the person, chunk the content and check your explanation. The interpreter makes the check meaningful.',then:'Mr Tran says something and the interpreter smiles. “He says the white tablet is the new one, and he wants to know if he can still use the garden.” His own question surfaces.',fx:{clarity:2,safety:2,trust:2},to:'c'},
  {t:'Explain everything quickly and ask if he has questions.',q:'risk',why:'A long explanation with no check leaves no way to know what has landed. “Any questions?” invites “no”.',then:'He says “no” through the interpreter. You are unsure what he heard.',fx:{clarity:-1,safety:-1,trust:-1},to:'c'},
  {t:'Ask Minh to explain it to his father afterwards at home.',q:'ok',why:'Family involvement helps at home, but it should supplement, not replace, a direct, checked explanation.',then:'Minh is willing, but he was not given the details himself and relies on his memory.',fx:{clarity:-1,safety:-1,trust:0},to:'c'}]},
 c:{fw:'T',title:'The hidden gap',
  scene:'After the call, Minh takes you aside: “He nods a lot, but I don’t think he understands about the dressing. He’s embarrassed to say.” It is 16:15 and the transport is due in fifteen minutes.',
  q:'What do you do?',hint:'A gap has appeared. What is safest within your role and the time?',
  opts:[
  {t:'Thank Minh. Tell the nurse in charge you need ten minutes, then use the interpreter and a demonstration with real materials so Mr Tran can show you what he will do.',q:'best',why:'You take the concern seriously, use your team and replace “do you understand?” with “show me”.',then:'He demonstrates, makes one error and corrects it with encouragement. The transport waits ten minutes.',fx:{clarity:2,safety:2,trust:2},to:'d'},
  {t:'Let the transport go on time and tell Minh to watch the dressing carefully.',q:'risk',why:'It puts the burden on a family member without training, and you now know there is a gap.',then:'Minh does his best. A week later the dressing has slipped and nobody noticed.',fx:{clarity:-1,safety:-2,trust:-1},to:'d'},
  {t:'Ask Minh to go through it again with his father in Vietnamese.',q:'ok',why:'Language-concordant explanation helps, but you cannot be sure what Minh will say and nobody checks the result.',then:'They talk for five minutes. Mr Tran nods again. You still cannot tell if he understood.',fx:{clarity:0,safety:-1,trust:0},to:'d'}]},
 d:{fw:'H',title:'Beating the clock',
  scene:'It is 16:40. The community team closes at 17:00. They need to know about the dressing, the medicine changes and that Mr Tran needs an interpreter.',
  q:'How do you hand over?',hint:'Short, specific, with the access need up front.',
  opts:[
  {t:'Phone the community team now. In SBAR order: who he is, what changed, that he needs a Vietnamese interpreter and has limited English, what you taught and what you would like them to check, and when. Document the call and the language need.',q:'best',why:'A phone call with a clear, structured request, and an access need stated up front, gives the next team the chance to act. The record backs it up.',then:'The community nurse says, “Thanks. I’ll book an interpreter for the Monday visit.” The handover took three minutes.',fx:{clarity:2,safety:2,trust:2},to:'end'},
  {t:'Leave a voicemail and rely on the discharge summary.',q:'ok',why:'It gets something to them, but they cannot ask questions and the access need is easy to miss.',then:'The team picks up the voicemail on Monday. The first visit is without an interpreter.',fx:{clarity:0,safety:-1,trust:-1},to:'end'},
  {t:'Assume the discharge summary covers everything.',q:'risk',why:'Summaries often omit the practical details and language needs. Assumption is not a handover.',then:'The summary does not mention the language. Monday’s visit is awkward and Mr Tran says little.',fx:{clarity:-2,safety:-2,trust:-1},to:'end'}]}
 },
 endings:{strong:'Mr Tran left with a plan he had shown he could follow, and the community team knew what he needed.',mixed:'Mr Tran left with part of the plan clear, and the next team picked up the rest.',weak:'Mr Tran left under time pressure with the plan only partly understood, and the next team started without the information they needed.'},
 takeaways:['Use a qualified interpreter. Family members translating can filter, shorten and answer for the person.','Under time pressure, chunk the message, prioritise safety-critical points and replace “do you understand?” with “show me”.','State the access need in the handover. A concise SBAR phone call beats an assumption.'],
 reflect:'How would you describe, to a colleague, why a professional interpreter protects both the patient and their family?'}
};

/* ---------- Interactive component data (all fictional) ---------- */
/* SBAR builder. cat: S B A R = where the fact belongs; n = noise (leave out). weak = a vague request. */
const PX_SBAR=[
 {id:'f',level:'foundation',title:'Mrs Lindqvist, bed 9',intro:'You are on the ward. Mrs Lindqvist has changed since the 08:00 round. You are about to phone the covering doctor. Build the message from these notes (fictional).',
  chips:[
  {id:'s1',t:'Mrs Lindqvist, bed 9, ward 7. Her breathing is faster and she is more confused than at 08:00.',cat:'S',why:'Who, where and what has changed, in one sentence. This is what the listener needs first.'},
  {id:'b1',t:'Admitted yesterday with a chest infection.',cat:'B',why:'Brief background that helps the listener place the problem.'},
  {id:'b2',t:'She is usually alert and chatty and walks with a frame.',cat:'B',why:'Her usual state is the baseline that makes the change meaningful.'},
  {id:'a1',t:'Breathing rate 26 (18 at 08:00), pulse 112 (88 at 08:00), temperature 38.4.',cat:'A',why:'Numbers with the earlier values show the direction of change. Fictional values, not thresholds.'},
  {id:'a2',t:'I am worried she is getting worse.',cat:'A',why:'Say your concern plainly. It tells the listener how seriously you take it.'},
  {id:'r1',t:'Please come and review her within the next 15 minutes. What should I do until you arrive?',cat:'R',why:'A specific request with a timeframe, and a question that keeps you acting safely in the meantime.'},
  {id:'r2',t:'Could someone have a look when they get a chance?',cat:'R',weak:true,why:'Vague. No who, no time. A vague request invites a vague reply.'},
  {id:'x1',t:'Her daughter rang to ask about parking.',cat:'n',why:'True, but not relevant to this call. Noise dilutes the message.'},
  {id:'x2',t:'She ate half of her porridge at breakfast.',cat:'n',why:'Not the point of this call. Leave it for the notes.'}],
  opener:'Do you have a moment? I have an urgent concern.'},
 {id:'c',level:'core',title:'Mr Osei, bed 3',intro:'Day 2 after an operation. Some notes are older, some are new, some are not for this call. Build a message that gets heard in fifteen seconds (fictional).',
  chips:[
  {id:'s1',t:'Mr Osei, bed 3, ward 7. Since 10:00 he has become drowsy and his urine output has dropped.',cat:'S',why:'Who, where, what has changed and since when.'},
  {id:'s2',t:'I am calling about a patient on the ward.',cat:'n',weak:true,why:'Does not say who, where or what. It wastes the opening seconds.'},
  {id:'b1',t:'Day 2 after bowel surgery; has a drain and a urinary catheter.',cat:'B',why:'The context a reviewer needs to judge what the change might mean.'},
  {id:'b2',t:'He has been on regular pain relief; no new medicines today.',cat:'B',why:'Relevant to drowsiness, so it belongs in the background.'},
  {id:'b3',t:'He was admitted on Monday after a long wait in the emergency department.',cat:'n',why:'Accurate, not relevant to this call.'},
  {id:'a1',t:'Last observations 11:30: pulse 106 (was 84 at 06:00), blood pressure 98/58 (was 124/76), temperature 37.8.',cat:'A',why:'The most recent numbers with the earlier values show direction. Fictional values, not thresholds.'},
  {id:'a2',t:'Urine output 20 ml in the last two hours.',cat:'A',why:'A concrete observation that supports your concern.'},
  {id:'a3',t:'I think he may be dehydrated.',cat:'n',weak:true,why:'A guess about cause. State the observations and your concern, and leave the diagnosis to the reviewer.'},
  {id:'a4',t:'I am worried; this is different from this morning.',cat:'A',why:'Your concern and the comparison, stated plainly.'},
  {id:'r1',t:'Please review him within 15 minutes. If you cannot come, who else should I call?',cat:'R',why:'A specific request with a timeframe and a fallback.'},
  {id:'r2',t:'Please review him.',cat:'R',weak:true,why:'Better than vague, but no time. “Within 15 minutes” turns it into a plan.'},
  {id:'x1',t:'The catheter bag was changed at 07:30.',cat:'n',why:'Low relevance to this call. Keep it for the record.'}],
  opener:'This is an urgent call about a patient whose observations have changed.'},
 {id:'a',level:'advanced',title:'Mr Haddad, bed 12 (with an interruption)',intro:'Twelve facts, two of them out of date, one contradicting another, and a relative who has just phoned. Choose what the reviewer needs to hear (fictional).',
  chips:[
  {id:'s1',t:'Mr Haddad, bed 12, ward 7: new confusion since about 13:00 and he has pulled out his cannula.',cat:'S',why:'Who, where, what has changed and what has happened.'},
  {id:'s2',t:'His son phoned to say Dad “sounded odd” on the phone.',cat:'A',alt:['B'],why:'Collateral history: family often notice change first. It belongs in the assessment as a supporting observation.'},
  {id:'b1',t:'Day 3 after a hip operation; history of a mild stroke two years ago.',cat:'B',why:'Past history that could change how the reviewer interprets confusion.'},
  {id:'b2',t:'Usual state: fully orientated, lives alone and independent.',cat:'B',why:'The baseline.'},
  {id:'b3',t:'Blood tests were taken yesterday; results not yet seen by me.',cat:'B',why:'Honesty about what you do not know. Better than guessing.'},
  {id:'a1',t:'Observations 13:20: pulse 98 (was 80), breathing rate 22 (was 16), temperature 38.1, blood pressure 118/70 (was 130/80).',cat:'A',why:'Most recent observations with earlier values. Fictional, not thresholds.'},
  {id:'a2',t:'Observations at 08:00 were normal.',cat:'n',weak:true,why:'Out of date. Use it as a baseline value in brackets, not as a separate statement.'},
  {id:'a3',t:'He is not a fall risk, as assessed on admission.',cat:'n',weak:true,why:'Out of date: new confusion changes the picture. Stating it could mislead.'},
  {id:'a4',t:'I am concerned: this is a change from his baseline and I do not know the cause.',cat:'A',why:'A clear concern with honest uncertainty. CUS in one sentence.'},
  {id:'r1',t:'Please review within 15 minutes. Is there anything you want me to do or not do until you arrive?',cat:'R',why:'Time-bound, specific and invites instruction.'},
  {id:'r2',t:'Can you let me know what you want to do?',cat:'R',weak:true,why:'Open and vague. It does not say when or what you need.'},
  {id:'x1',t:'The ward is short of a nurse today.',cat:'n',why:'True, but it is not the reviewer’s problem in this call and can sound like an excuse.'}],
  opener:'I need an urgent review for a patient with new confusion.'}
];
/* Escalation ladder. rungs are fixed; each case names the ideal rung(s) and the acceptable ones. */
const PX_RUNGS=[
 {id:1,t:'Speak to the person directly',d:'A colleague, in the moment, using CUS or DESC.'},
 {id:2,t:'Nurse or shift lead in charge',d:'The person responsible for the area or the shift.'},
 {id:3,t:'Senior clinician, on-call or duty manager',d:'Someone with authority to act or decide.'},
 {id:4,t:'Emergency or rapid-response call',d:'Immediate risk, or your local criteria are met.'},
 {id:5,t:'Formal route: incident report or speak-up guardian',d:'After the immediate risk, or for a system problem.'}
];
const PX_LADDER=[
 {id:'wristband',title:'The wristband that does not match',urgency:'immediate',scene:'A colleague is about to give an injection. You glance at the wristband and see a different surname from the one on the chart. They are already holding the syringe.',
  ideal:[1],ok:[],why:'This is happening now and the person who can stop it is next to you. Speak to them directly and clearly, and stop the task. Reporting can follow, but the first move is to stop.',skip:'Going up the ladder would be too slow: the first, fastest rung is the person holding the syringe.',
  say:[{t:'“Stop. I am concerned: the name on the wristband does not match the chart. Let us check the patient’s identity together before you go on.”',q:'best',why:'Short, specific and uses “stop”. It names what you see and proposes a joint check.'},{t:'“Hmm, are you sure that is the right patient?”',q:'ok',why:'A question can be answered with “yes”. It does not tell them what you have seen.'},{t:'“I will tell the nurse in charge afterwards.”',q:'risk',why:'It leaves the injection to go ahead and puts the concern in a report after the harm.'}]},
 {id:'collapse',title:'A person collapses in the corridor',urgency:'immediate',scene:'A visitor collapses in front of you. They are not responding when you call their name. Colleagues are in the next room.',
  ideal:[4],ok:[],why:'There is an immediate risk to life. Call the emergency number or rapid-response route, state your location and the problem, and stay until help arrives. You do not need to climb the ladder first.',skip:'Skipping to the emergency call is the right move when the risk is immediate. Rungs 1–3 can be informed at the same time by whoever is nearby.',
  say:[{t:'“Emergency in the main corridor by the lifts: an adult who has collapsed and is not responding. I am staying with them.”',q:'best',why:'Where, who, what and what you are doing, in one sentence.'},{t:'“Can someone come to the corridor, please? Somebody has fallen.”',q:'ok',why:'It brings help, but “fallen” understates a collapse and it does not trigger the emergency route.'},{t:'“I will find the nurse in charge.”',q:'risk',why:'It leaves the person alone and delays the emergency response.'}]},
 {id:'no-reply',title:'The review that did not come',urgency:'soon',scene:'Thirty minutes ago you asked the on-call doctor to review a patient whose observations are worsening. They said, “I will come when I can.” Nobody has arrived and the patient is no better.',
  ideal:[3,4],ok:[2],why:'You have already escalated once, and it has not worked. Go again, to someone with authority to act (rung 3), and if the patient meets your local emergency criteria use rung 4. Tell the nurse in charge as well.',skip:'You do not need to repeat rung 1. The patient’s condition and the delay justify moving up.',
  say:[{t:'“I called at 10:10 about Mr Reed: his breathing and heart rate have risen further since then and he is more drowsy. He needs urgent review now. If that is not possible I will use the emergency call.”',q:'best',why:'It gives the time of the first call, what has changed and what you will do next.'},{t:'“Just checking in again about Mr Reed. Any idea when someone might come?”',q:'ok',why:'It chases the delay but gives no new information and no urgency.'},{t:'“I will leave it with you and keep checking him.”',q:'risk',why:'It accepts the delay without a plan for what happens if it gets worse.'}]},
 {id:'senior',title:'The senior who will not listen',urgency:'soon',scene:'You have raised a concern twice with a senior colleague about a plan that you think misses something in the record. They said, “I have done this for twenty years.” You are still uncomfortable and the task is not yet under way.',
  ideal:[2,3],ok:[5],why:'You have used rung 1 twice. Bring in a second voice: the nurse or shift lead (rung 2), or a more senior person (rung 3). This is the two-challenge rule in action.',skip:'Rung 4 is not needed unless the risk becomes immediate. Rung 5 can follow.',
  say:[{t:'“I am still uncomfortable. This is a safety issue. I would like to check it with the nurse in charge before we go ahead.”',q:'best',why:'It states the concern at its third level and names the next step.'},{t:'“Sorry to keep going on about it. Maybe I am wrong.”',q:'ok',why:'Apologising undermines the concern. You may be right, and checking costs little.'},{t:'“Fine, I will do it your way.”',q:'risk',why:'It abandons the concern without it being resolved.'}]},
 {id:'pump',title:'The equipment that keeps failing',urgency:'routine',scene:'The same infusion pump alarms and stops for no clear reason, three times this month. Staff work around it. Nobody has reported it formally.',
  ideal:[5],ok:[2],why:'This is a system problem rather than an urgent one. Tell the person in charge so the pump is taken out of use, and make a formal report so the pattern is visible. Rung 1 would not change anything.',skip:'Nothing is urgent right now, so rungs 3 and 4 are not needed. The formal route (rung 5) is how patterns get fixed.',
  say:[{t:'“This pump has failed three times this month. I am reporting it formally and asking that it is taken out of use until it has been checked.”',q:'best',why:'It gives the pattern, the action and the request.'},{t:'“Does anyone else find this pump annoying?”',q:'ok',why:'It starts a conversation but does not change anything on its own.'},{t:'“I will just keep using the other pump.”',q:'risk',why:'A workaround hides the problem from the people who could fix it.'}]}
];
/* Prioritising. rank = suggested order (1 = first). alt = ranks that are also reasonable. key = must be first. */
const PX_PRIORITY=[
 {id:'r1',level:'foundation',title:'Round 1: early shift as a healthcare support worker',scene:'It is 07:55. You are the only support worker in your bay for the next fifteen minutes. Five things need you. Rank them (fictional).',
  tasks:[
  {id:'t1',t:'Mrs Kaur presses her call bell. She says she feels dizzy and wants to get up.',rank:1,key:true,why:'There is a possible risk now (a fall or becoming unwell). Stay with her, ask her to stay seated, and call the nurse through your local route.'},
  {id:'t2',t:'Mr Patel asked for help to the toilet ten minutes ago.',rank:2,why:'Time-sensitive for his comfort and dignity, and a fall risk if he tries alone. Ask a colleague to cover if you are with Mrs Kaur.'},
  {id:'t3',t:'Breakfast trays are going cold in bay 2.',rank:3,why:'People are waiting and hot food matters, but nobody is at immediate risk. Ask a colleague or the housekeeper to help.'},
  {id:'t4',t:'Restock gloves and aprons in bay 3.',rank:4,alt:[3,4],why:'A dependency: you need them before the next care task. It can wait a few minutes.'},
  {id:'t5',t:'Update the whiteboard with today’s therapy visits.',rank:5,why:'Useful but no time pressure.'}]},
 {id:'r2',level:'core',title:'Round 2: early shift as a registered clinician',scene:'It is 08:30. You are covering bays 1 and 2 with a colleague on a break. Five things arrive within a few minutes (fictional).',
  tasks:[
  {id:'t1',t:'A patient tells you that a new chest discomfort started a few minutes ago.',rank:1,key:true,why:'Possible immediate risk. Stay with them, call for help through your local emergency route and state what you know.'},
  {id:'t2',t:'A time-critical medicine is due at 09:00 for another patient.',rank:2,why:'Time-critical by definition, with a fixed window. Plan it, and ask for cover if the first problem takes you away.'},
  {id:'t3',t:'A colleague asks you to second-check an infusion setup in bay 1.',rank:3,why:'A short task that blocks a colleague’s work and is a safety check. It can fit in a minute or two once the immediate risk is handled.'},
  {id:'t4',t:'The doctor wants the discharge summary for a patient leaving at 11:00.',rank:4,alt:[4,5],why:'Important, with a deadline later in the morning. Plan when to do it.'},
  {id:'t5',t:'A relative phoned asking for an update.',rank:5,alt:[4,5],why:'Matters, but nobody is at risk. Ask another colleague to call back, or arrange a time.'}]},
 {id:'r3',level:'advanced',title:'Round 3: team leader at the 14:10 pinch point',scene:'You are the nurse in charge. Staffing is tight and five demands arrive together. Several of the middle ranks are genuinely arguable (fictional).',
  tasks:[
  {id:'t1',t:'A new admission is waiting in the corridor, short of breath, with no bed yet.',rank:1,key:true,why:'Possible immediate risk with no place to assess. Get them seen, use the emergency route if needed, and clear a space.'},
  {id:'t2',t:'A colleague in their first week tells you they are overwhelmed and close to tears.',rank:2,alt:[2,3],why:'A person and the team’s safety. A two-minute acknowledgement, a task taken off them and a time to talk later is often enough for now.'},
  {id:'t3',t:'An equipment alarm in bay 2 keeps sounding. It is probably a low battery.',rank:3,alt:[2,3,4],why:'“Probably” is not “certainly”. A quick check (or a delegated one) rules out a problem and stops the noise distracting everybody.'},
  {id:'t4',t:'The bed manager needs a decision on which patient could go home within the hour.',rank:4,alt:[3,4],why:'Important for flow and for the person in the corridor, but it is a decision you can make with a short review.'},
  {id:'t5',t:'Your own break was due 90 minutes ago.',rank:5,alt:[5],why:'Last for now, but not never. Tell someone when you will take it. Fatigue is a safety factor too.'}]}
];
/* Hazard scene. x,y in an 800x480 viewBox. cat: category. */
const PX_HAZARD_CATS={slip:'Slips, trips and falls',ipc:'Infection prevention',info:'Privacy and information',med:'Medicines security',sharp:'Sharps and equipment',exit:'Escape routes',call:'Call and communication'};
const PX_HAZARDS=[
 {id:'h-spill',label:'Spill on the floor',x:455,y:432,r:48,cat:'slip',hazard:true,why:'A wet patch with no warning sign is a slip hazard, especially for people who walk with frames. Mop it, put a sign out and tell someone if you cannot.'},
 {id:'h-bell',label:'Call bell on the floor',x:292,y:418,r:48,cat:'call',hazard:true,why:'A call bell out of reach means the person cannot ask for help. Put it back within reach and check it works.'},
 {id:'h-cable',label:'Power cable across the walkway',x:595,y:398,r:48,cat:'slip',hazard:true,why:'A trailing cable across a walking route is a trip hazard. Reposition or cover it, or move the equipment.'},
 {id:'h-exit',label:'Boxes stacked at the exit',x:738,y:362,r:48,cat:'exit',hazard:true,why:'Stored items blocking an exit route slow everyone down in an emergency. Move them to storage.'},
 {id:'h-rub',label:'Empty hand-rub dispenser',x:662,y:182,r:48,cat:'ipc',hazard:true,why:'An empty dispenser at the point of care removes the easiest route to hand hygiene. Refill it or report it.'},
 {id:'h-sharps',label:'Overfull sharps box',x:498,y:165,r:48,cat:'sharp',hazard:true,why:'Sharps above the fill line can cause needle-stick injuries. Seal and replace the box.'},
 {id:'h-screen',label:'Unlocked screen with a patient list',x:92,y:290,r:48,cat:'info',hazard:true,why:'A screen left unlocked and unattended shows other people’s information. Lock it each time you step away.'},
 {id:'h-trolley',label:'Medicines trolley open, key left in',x:610,y:285,r:48,cat:'med',hazard:true,why:'An unlocked, unattended trolley with the key in place is a medicines security risk. Lock it whenever you leave it.'},
 {id:'d-rub',label:'Full hand-rub dispenser by the bed',x:215,y:205,r:44,cat:'ipc',hazard:false,why:'This one is full and in the right place, at the bedside. It is not a hazard.'},
 {id:'d-bin',label:'Closed waste bin',x:376,y:380,r:44,cat:'slip',hazard:false,why:'A closed bin placed against the bed, out of the walkway. Not a hazard.'},
 {id:'d-jug',label:'Water jug and cup within reach',x:180,y:252,r:44,cat:'call',hazard:false,why:'Drinks within reach of the person are good practice. Not a hazard.'}
];
/* Incident replay. */
const PX_INCIDENT={
 title:'A delayed escalation (fictional)',
 intro:'Mr Okoye, 68, was admitted for an operation. Over one morning a series of small gaps lined up. Step through the timeline and look for where it could have been caught. Nobody in this story is a villain.',
 events:[
  {id:'e1',time:'06:45',t:'The early observations are recorded and are within Mr Okoye’s usual range.',layer:null,note:'No gap here. This is the baseline.'},
  {id:'e2',time:'08:30',t:'The 08:30 observations fall due as the nurse is called to another bay for an urgent task. The check is deferred and nothing flags it as outstanding.',layer:'Interruptions',note:'The system has no way to show that a check is overdue, or to hand it to a colleague.'},
  {id:'e3',time:'09:10',t:'A healthcare assistant thinks Mr Okoye is “a bit quiet” and mentions it to a colleague passing in the corridor, not to the nurse.',layer:'Speaking up',note:'There is no easy, expected route for a quick “this looks different” message.'},
  {id:'e4',time:'10:00',t:'At handover the outgoing nurse says he is “stable”. The overdue 08:30 check is not mentioned.',layer:'Handover',note:'The handover has no prompt for outstanding checks.'},
  {id:'e5',time:'10:40',t:'The 10:30 observations are recorded but not added up. One value is higher than before. It is not escalated because “we usually repeat it first”.',layer:'Escalation prompts',note:'A habit of repeating before escalating has become normal, and nothing prompts a review.'},
  {id:'e6',time:'11:20',t:'Mr Okoye becomes acutely unwell. The emergency team is called and responds quickly.',layer:null,note:'The outcome. The response was good. The gaps were earlier.'},
  {id:'e7',time:'11:45',t:'The team begins a debrief and agrees to ask what made these gaps possible, not who to blame.',layer:null,note:'A fair review looks at the system as well as the people.'}],
 flagCorrect:['e2','e3','e4','e5'],
 behaviours:[
  {id:'b1',event:'e2',t:'The nurse deferred the 08:30 check to deal with an urgent task in another bay.',best:'error',why:'A reasonable trade-off in the moment, with no way of flagging the deferred check. Console and fix the system, for example a visible “overdue” marker.'},
  {id:'b2',event:'e3',t:'The healthcare assistant mentioned the change informally, rather than telling the nurse.',best:'risk',why:'A drift into an informal habit, with no route making the right way easy. Coach, and make the right route easy and expected.'},
  {id:'b3',event:'e5',t:'A colleague did not escalate a raised value because the usual habit was to repeat it first.',best:'risk',why:'A normalised shortcut. Coach, and add a prompt so the habit is not the default.'},
  {id:'b4',event:null,t:'Contrast example, not part of this incident: a staff member records a set of observations they never took.',best:'reckless',why:'A knowing disregard of an obvious risk and of the records’ purpose. Your organisation’s formal process applies. This is very different from the three behaviours above.'}],
 responses:{error:['Human error','Console and look at the system'],risk:['At-risk behaviour','Coach and make the right way easy'],reckless:['Reckless behaviour','Formal process']},
 layers:['Observations','Interruptions','Speaking up','Handover','Escalation prompts']
};
