/** Read-only derived values; callers supply records and clock. */
export const selectDueCount = (reviews, ids, now) => ids.reduce((n,id)=>n+Number(!!reviews[id]&&reviews[id].due<=now),0);
export const selectMastery = (familiarIds, wordIds) => wordIds.length ? Math.round(wordIds.filter(id=>familiarIds.includes(id)).length/wordIds.length*100) : 0;
export function selectStreak(activity, now, freezes=[]) {
 let count=0;const d=new Date(now);
 for(let i=0;i<366;i++){const a=activity[d.toLocaleDateString('en-CA')];if(a&&(a.items>=1||a.minutes>=2)||freezes.includes(d.toLocaleDateString('en-CA')))count++;else if(i!==0)break;d.setDate(d.getDate()-1);}
 return count;
}
