import { gunzipSync, strFromU8 } from 'fflate';
const loaded = new Set();
const registry = new Map();
export const loadedCollections = () => [...loaded];
/** Stable array identity; decode the original records on the first actual read. */
export function lazyCollection(name, payload) {
  const target = [];
  let ready = false;
  function ensure() {
    if (ready) return;
    const [schemas, dictionary, rows] = JSON.parse(strFromU8(gunzipSync(Uint8Array.from(atob(payload), c=>c.charCodeAt(0)))));
    const decode = value => Array.isArray(value) ? value.map(decode) : value && typeof value === 'object' ? Object.keys(value).length === 1 && '$o' in value ? Object.fromEntries(schemas[value.$o[0]].map((key,i)=>[key,decode(value.$o[i+1])])) : Object.keys(value).length === 1 && '$term' in value ? registry.get('TERMS').find(t=>t.id===value.$term) : Object.keys(value).length === 1 && '$' in value ? dictionary[value.$] : Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v)])) : value;
    target.push(...rows.map(row => row[0] === -1 ? decode(row[1]) : Object.fromEntries(schemas[row[0]].map((key,i)=>[key,decode(row[i+1])]))));
    ready = true;
    loaded.add(name);
  }
  const proxy = new Proxy(target, {
    get(t,k,r) { ensure(); return Reflect.get(t,k,r); },
    set(t,k,v,r) { ensure(); return Reflect.set(t,k,v,r); },
    has(t,k) { ensure(); return Reflect.has(t,k); },
    ownKeys(t) { ensure(); return Reflect.ownKeys(t); },
    getOwnPropertyDescriptor(t,k) { ensure(); return Reflect.getOwnPropertyDescriptor(t,k); }
  });
  registry.set(name,proxy);
  return proxy;
}
