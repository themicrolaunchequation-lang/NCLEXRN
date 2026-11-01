/* Draws the 3D crown on a background thread, onto a canvas handed over by the page (crown-3d.js).
   Preparing the graphics can take a few seconds on some computers; here it never freezes the page. */
import { buildScene } from './crown-scene.js';
let scene = null;
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      scene = buildScene(data.canvas, data.opts);
      scene.resize(data.W, data.H);
      await scene.warm();
      scene.render(data.state);
      self.postMessage({ type: 'ready' });
    } catch (e) { self.postMessage({ type: 'fail', message: String(e && e.message || e) }); }
  } else if (!scene) {
    // not ready yet: tell the page this frame was skipped
    if (data.type === 'frame') self.postMessage({ type: 'tags', tags: null });
  } else if (data.type === 'resize') scene.resize(data.W, data.H);
  else if (data.type === 'frame') self.postMessage({ type: 'tags', tags: scene.render(data.state) });
};
