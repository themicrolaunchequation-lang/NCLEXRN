/**
 * @typedef {'Doctor'|'Trainee'|'Nurse'|'Allied health'|'Clinical coder'|'Educator'|'Other'} LearningRole
 * @typedef {{name:string,role:LearningRole,dailyGoalMin:number,theme:'light'|'dark'|'system',reducedMotion:boolean|null,textScale:number,highContrast:boolean,ttsRate:number,ttsVoice:string,ttsVoiceURI?:string,ttsAccent?:string,assistingLanguage:string}} Profile
 * @typedef {{due:number,reps:number,interval?:number,ease?:number}} Review
 * @typedef {{schemaVersion:3,profile:Profile,terms:Record<string,object>,sessions:object[],lessons:number[],activity:Record<string,{minutes:number,items:number}>,course:object,search:{recent:string[]},achievements:Record<string,string>,expansion?:object}} SavedRecord
 * @typedef {{state:object,v3:SavedRecord,course:object,route:string,params:URLSearchParams,activeWorksheet:object|null,quiz:object|null,flash:object|null,[key:string]:any}} AppState
 */
export {};
