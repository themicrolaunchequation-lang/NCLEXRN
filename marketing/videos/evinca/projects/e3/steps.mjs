export default async ({p,go,top,shot,T})=>{
await go('/en/learn'); await shot('learn',{h1:p.locator('h1'),c1:T('Academy courses'),c2:T('Career Studio'),c3:T('Gifts Studio')});
await top(T('What each level includes'),80); await shot('learn2',{tbl:p.locator('table').first(),r1:p.locator('tr').nth(1),r2:p.locator('tr').nth(2),r3:p.locator('tr').nth(3),fine:T('Course certificates are issued')});
await go('/en/spotlight'); await shot('spot',{h1:p.locator('h1')});
await top(T('Spotlight Story'),60); await shot('spot2',{free:T('A private story page').locator('xpath=ancestor::*[self::article or self::li or self::div][1]')});
await go('/en/magazine'); await shot('mag',{h1:p.locator('h1')});
await go('/en/guides'); await shot('guides',{h1:p.locator('h1')}); await top(T('How to write a healthcare award nomination'),120); await shot('guides2',{g1:T('How to write a healthcare award nomination'),g2:T('Is this healthcare award legitimate'),g3:T('How to add a healthcare award to LinkedIn')});
await go('/en/institutions'); await shot('inst',{h1:p.locator('h1')}); await top(T('WHY IT MATTERS'),80); await shot('inst2',{});
};
