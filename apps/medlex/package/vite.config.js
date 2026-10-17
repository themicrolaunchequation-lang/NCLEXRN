import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig(({mode})=>({
 resolve:{alias:{'#test-entry': new URL(mode === 'test' ? './src/test-bridge.js' : './src/test-empty.js', import.meta.url).pathname}},
 plugins:[viteSingleFile({removeViteModuleLoader:false})],
 build:{outDir: mode === 'test' ? 'dist-test' : 'dist', emptyOutDir:false, target:'es2020', minify:mode === 'test' ? false : 'terser', rollupOptions:{output:{format:'iife'}}}
}));
