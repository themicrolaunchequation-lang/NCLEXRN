/** @template T @param {T} initial */
export function createStore(initial) {
  let value = initial;
  const subscribers = new Set();
  return {
    get: () => value,
    /** @param {Partial<T>|((current:T)=>T)} update */
    set(update) {
      value = typeof update === 'function' ? update(value) : {...value, ...update};
      for (const listener of subscribers) listener(value);
      return value;
    },
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); }
  };
}
/** Shared session, persisted profile and compatibility projections. Storage stays v3. */
/** @type {ReturnType<typeof createStore<Partial<import('./types.js').AppState>>>} */
export const store = createStore({});
export const app = new Proxy({}, {
  get: (_, key) => store.get()[key],
  set: (_, key, value) => { store.set({[key]:value}); return true; },
  has: (_, key) => key in store.get(),
  ownKeys: () => Reflect.ownKeys(store.get()),
  getOwnPropertyDescriptor: (_, key) => ({enumerable:true, configurable:true, value:store.get()[key]})
});
