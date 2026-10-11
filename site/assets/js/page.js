/* Shared bits for secondary pages (privacy notice): fill in config values. */
(() => {
  'use strict';
  const cfg = Object.assign({ contactEmail: 'themicrolaunchequation@gmail.com' }, window.HCA_CONFIG || {});
  document.querySelectorAll('[data-contact-email]').forEach((a) => {
    a.href = 'mailto:' + cfg.contactEmail;
    a.textContent = cfg.contactEmail;
  });
  if (cfg.registeredOffice) {
    document.querySelectorAll('[data-registered-office]').forEach((el) => {
      el.textContent = 'Registered office: ' + cfg.registeredOffice + '.';
    });
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
