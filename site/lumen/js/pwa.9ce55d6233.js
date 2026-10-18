if('serviceWorker'in navigator&&location.protocol==='https:'&&location.pathname==='/')addEventListener('load',()=>navigator.serviceWorker.register('/lumen/sw.js',{scope:'/'}).catch(()=>{}));
