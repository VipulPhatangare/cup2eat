export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const inr2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pad = (n) => String(n).padStart(2, '0');

// small helper for flavour colours used by chips, cards and cups
export const FLAVOUR_DOT = {
  Chocolate: '#7a4a2a',
  Vanilla: '#ebcb8b',
  Elaichi: '#b9c57a',
};
