import{fsrs,createEmptyCard,State}from'ts-fsrs';
const scheduler=fsrs({enable_fuzz:false,maximum_interval:180});
/** Convert only when rated; changing the setting never changes existing due dates. */
export function fsrsSchedule(old={},rating,now=Date.now()){
 const source=old.fsrs,card=source?{...source,due:new Date(source.due),...(source.last_review?{last_review:new Date(source.last_review)}:{})}:createEmptyCard(new Date(old.due||now));
 if(!source&&old.reps){Object.assign(card,{state:State.Review,reps:old.reps,lapses:old.lapses||0,stability:Math.max(.1,old.interval||1),difficulty:5,elapsed_days:Math.max(0,Math.floor((now-(old.last||now))/86400000)),scheduled_days:old.interval||1,last_review:new Date(old.last||now-(old.interval||1)*86400000)});}
 const next=scheduler.next(card,new Date(now),rating).card;
 return{...old,reps:next.reps,lapses:next.lapses,interval:(next.due.getTime()-now)/86400000,last:now,due:next.due.getTime(),ease:old.ease||2.5,fsrs:{...next,due:next.due.toISOString(),...(next.last_review?{last_review:next.last_review.toISOString()}:{})}};
}
