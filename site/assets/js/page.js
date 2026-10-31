/* Shared bits for secondary pages (privacy notice): fill in config values. */
(() => {
  'use strict';
  const cfg = Object.assign({ contactEmail: 'hello@healthcarecrownacademy.co.uk' }, window.HCA_CONFIG || {});
  document.querySelectorAll('[data-contact-email]').forEach((a) => {
    a.href = 'mailto:' + cfg.contactEmail;
    a.textContent = cfg.contactEmail;
  });
  if (cfg.registeredOffice) {
    document.querySelectorAll('[data-registered-office]').forEach((el) => {
      el.textContent = 'Registered office: ' + cfg.registeredOffice + '.';
    });
  }

  // ICO registration badges
  if (/^Z[A-Z0-9]{5,9}$/.test(cfg.icoNumber || '')) {
    document.querySelectorAll('[data-ico-number]').forEach((el) => { el.textContent = cfg.icoNumber; });
    document.querySelectorAll('[data-ico-link]').forEach((a) => { a.href = 'https://ico.org.uk/ESDWebPages/Entry/' + cfg.icoNumber; });
    document.querySelectorAll('[data-ico-line]').forEach((el) => { el.textContent = 'Registered with the Information Commissioner\'s Office (ICO) for data protection, registration no. ' + cfg.icoNumber + '.'; });
    document.querySelectorAll('[data-ico]').forEach((el) => { el.hidden = false; });
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
