

    /* ==========================================================================
       SNLE MASTER JAVASCRIPT LAYER
       ========================================================================== */

    // 1. Live Modal Watcher (Hides Topbar when any modal/dialog is open)
    (function _initModalWatcher() {
      const MODAL_SELECTORS = [
        '.standalone-modal-overlay',
        '.standalone-modal',
        '.poster-toolbar',
        '.tool-dialog-header',
        '.guide-domain-overlay',
        '.guide-domain-modal',
        '.dossier-overlay',
        '.dossier-dialog',
        '.glossary-info-overlay',
        '.glossary-info-modal',
        '.course-info-overlay',
        '.committee-modal',
        '.journey-modal',
        '.course-library-modal',
        '.reset-timing-overlay',
        '.reset-timing-modal',
        '.tool-dialog',
        '.tool-dialog-backdrop',
        '.modal-backdrop',
        '.modal-stage',
        'dialog[open]',
        '[role="dialog"]'
      ].join(', ');

      function checkModals() {
        const hasModal = !!document.querySelector(MODAL_SELECTORS);
        document.body.classList.toggle('modal-is-open', hasModal);
        document.body.classList.toggle('tool-open', hasModal);
      }
      const obs = new MutationObserver(checkModals);
      obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
      window.checkSnleModals = checkModals;
      checkModals();
    })();

    // 2. Universal Sound Mute Controller
    let _agyAudioMuted = window.SNLEStorage.getItem('snle_audio_muted') === 'true';
    let _agyAudioCtx = null;
    function _getAudioCtx() {
      if (!_agyAudioCtx && (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined')) {
        try { _agyAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
      }
      return _agyAudioCtx;
    }

    function _agyPlayTone(freq, type = 'sine', duration = 0.08, gainVal = 0.12) {
      if (_agyAudioMuted) return;
      const ctx = _getAudioCtx();
      if (!ctx) return;
      try {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch(e){}
    }

    function playClickSound() { _agyPlayTone(620, 'sine', 0.04, 0.08); }

    function toggleGlobalAudio() {
      _agyAudioMuted = !_agyAudioMuted;
      window.SNLEStorage.setItem('snle_audio_muted', _agyAudioMuted);
      const topBtns = document.querySelectorAll('.sound-toggle-btn');
      topBtns.forEach(b => {
        b.classList.toggle('is-muted', _agyAudioMuted);
        b.innerHTML = _agyAudioMuted ? '<span>🔇</span><b>Muted</b>' : '<span>🔊</span><b>Sound</b>';
      });
      const dockSound = document.getElementById('snle-sound-btn');
      if (dockSound) dockSound.textContent = _agyAudioMuted ? '🔇' : '🔊';
      if (!_agyAudioMuted) _agyPlayTone(600, 'sine', 0.06, 0.1);
    }

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;
      if (e.key === 'm' || e.key === 'M') toggleGlobalAudio();
    });

    // 3. Drawing Engine removed by user request
