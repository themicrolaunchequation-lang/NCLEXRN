/* Retain original storage keys. Blocked/full browser storage must not crash learning. */
window.SNLEStorage={
 getItem:function(k){try{return localStorage.getItem(k)}catch{return null}},
 setItem:function(k,v){try{localStorage.setItem(k,v);return true}catch{window.dispatchEvent(new Event('snle-storage-error'));return false}},
 removeItem:function(k){try{localStorage.removeItem(k)}catch{}}
};
