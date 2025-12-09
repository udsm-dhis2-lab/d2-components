// countries.ts
export type CountryMeta = {
  isoCode: string;   // "TZ"
  dialCode: string;  // "+255"
  name: string;      // "Tanzania"
  flag: string;      // "🇹🇿"
};

export const ALL_COUNTRIES: CountryMeta[] = [
  // East Africa first (for convenience)
  { isoCode: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { isoCode: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
  { isoCode: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬' },
  { isoCode: 'RW', dialCode: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { isoCode: 'BI', dialCode: '+257', name: 'Burundi', flag: '🇧🇮' },
  { isoCode: 'SS', dialCode: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { isoCode: 'ET', dialCode: '+251', name: 'Ethiopia', flag: '🇪🇹' },

  // A few examples from other regions:
  { isoCode: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { isoCode: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { isoCode: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { isoCode: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { isoCode: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { isoCode: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { isoCode: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },

  // 👉 Here you add the rest of the world.
  // You can load a standard JSON of all countries (isoCode, dialCode, name, flag)
  // and generate this array at build time if you prefer.
];
