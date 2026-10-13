/* Site settings. Edit these values; no build step is needed.
   Every value here is public by design (it ships to the browser). */
window.HCA_CONFIG = {
  contactEmail: 'themicrolaunchequation@gmail.com',

  // Legally required on a UK company website (Companies Act 2006 /
  // Trading Disclosures Regulations 2015). Copy it exactly from the
  // Companies House record, e.g. '1 Example Street, London, AB1 2CD'.
  // ICO data protection registration number (starts with ZB). Empty = badges hidden.
  icoNumber: '',

  registeredOffice: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ',

  // Evinca backend (Supabase project "evinca", London region).
  // The join form writes to public.inquiries and calls public.subscribe().
  // This is the publishable key, which is safe in the browser; row-level
  // security on those tables decides what it may do.
  supabaseUrl: 'https://ujeofxfbwivjmgrxqdcl.supabase.co',
  supabaseKey: 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL',

  // Public address of the Evinca app (no trailing slash). Every button marked
  // data-evinca="/en/..." links to this base. Switch to
  // 'https://evinca.healthcarecrownacademy.co.uk' once that subdomain is live.
  evincaUrl: 'https://evinca.healthcarecrownacademy.co.uk'
};
