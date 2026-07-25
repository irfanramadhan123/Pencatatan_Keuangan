export const currencyOptions = {
  IDR: { locale: "id-ID", rate: 1, maximumFractionDigits: 0 },
  USD: { locale: "en-US", rate: 1 / 17909, maximumFractionDigits: 2 },
  MYR: { locale: "ms-MY", rate: 1 / 4389.18, maximumFractionDigits: 2 },
};

export function getCurrencyPreference() {
  const saved = localStorage.getItem("currency") || "IDR";
  return currencyOptions[saved] ? saved : "IDR";
}

export function setCurrencyPreference(currency) {
  const nextCurrency = currencyOptions[currency] ? currency : "IDR";
  localStorage.setItem("currency", nextCurrency);
  window.dispatchEvent(new Event("currencychange"));
  return nextCurrency;
}

export function convertFromIdr(value, currency = getCurrencyPreference()) {
  const settings = currencyOptions[currency] || currencyOptions.IDR;
  return Number(value || 0) * settings.rate;
}

export function formatCurrency(value, currency = getCurrencyPreference()) {
  const selectedCurrency = currencyOptions[currency] ? currency : "IDR";
  const settings = currencyOptions[selectedCurrency];
  return new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: selectedCurrency,
    maximumFractionDigits: settings.maximumFractionDigits,
  }).format(convertFromIdr(value, selectedCurrency));
}

export function formatShort(value) {
  const converted = convertFromIdr(value);
  const currency = getCurrencyPreference();
  if (currency === "IDR" && converted >= 1000000) return `${(converted / 1000000).toFixed(1)}jt`;
  if (currency === "IDR" && converted >= 1000) return `${(converted / 1000).toFixed(0)}rb`;
  return formatCurrency(value, currency);
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
