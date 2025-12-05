/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import { ALL_COUNTRIES, CountryMeta } from './countries';

const DEFAULT_COUNTRY_ISO = 'TZ';

type SingleSelectFieldWithFilterProps = React.ComponentProps<
  typeof SingleSelectField
> & {
  onFilterChange?: (args: { value: string }) => void;
};

const FilterableSingleSelectField =
  SingleSelectField as React.ComponentType<SingleSelectFieldWithFilterProps>;

export interface InternationalPhoneFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  validationText?: string;
  inputWidth?: string | number;
  defaultCountryIsoCode?: string;
  onChange: (localNumber: string) => void;
  onBlur?: () => void;
}

function normalizeTanzaniaLocal(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('255')) {
    let sub = digits.slice(3);
    if (sub.startsWith('0')) sub = sub.slice(1);
    return ('0' + sub).slice(0, 10);
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10);
  }

  if (/^[67]\d{7,9}$/.test(digits)) {
    return ('0' + digits).slice(0, 10);
  }

  if (digits.length >= 9 && !digits.startsWith('0')) {
    return ('0' + digits.slice(0, 9)).slice(0, 10);
  }

  return digits.slice(0, 10);
}

export const InternationalPhoneField: React.FC<
  InternationalPhoneFieldProps
> = ({
  name,
  label,
  placeholder,
  value,
  required,
  disabled,
  error,
  validationText,
  inputWidth,
  defaultCountryIsoCode = DEFAULT_COUNTRY_ISO,
  onChange,
  onBlur,
}) => {
  const [selectedIsoCode, setSelectedIsoCode] = React.useState<string>(
    defaultCountryIsoCode
  );
  const [filterText, setFilterText] = React.useState('');
  const [leadingZeroWarning, setLeadingZeroWarning] = React.useState<
    string | null
  >(null);

  const selectedCountry: CountryMeta =
    ALL_COUNTRIES.find((c) => c.isoCode === selectedIsoCode) ??
    ALL_COUNTRIES.find((c) => c.isoCode === DEFAULT_COUNTRY_ISO)!;

  const [localNumber, setLocalNumber] = React.useState<string>('');

  React.useEffect(() => {
    const raw = value ?? '';

    if (selectedCountry.isoCode === 'TZ') {
      const normalizedStored = normalizeTanzaniaLocal(raw);
      if (!normalizedStored) {
        setLocalNumber('');
        return;
      }
      const digits = normalizedStored.replace(/\D/g, '');
      const ui = digits.startsWith('0') ? digits.slice(1) : digits;
      setLocalNumber(ui);
    } else {
      const digits = raw.replace(/\D/g, '').slice(0, 15);
      setLocalNumber(digits);
    }
    setLeadingZeroWarning(null);
  }, [value, selectedCountry.isoCode]);

  const filteredCountries = React.useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return ALL_COUNTRIES;

    return ALL_COUNTRIES.filter((c) => {
      const haystack = `${c.name} ${c.dialCode} ${c.isoCode}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [filterText]);

  const handleCountryChange = ({ selected }: { selected: string }) => {
    setSelectedIsoCode(selected);
  };

  const handleLocalChange = ({ value }: { value: string }) => {
    const digitsOnly = (value || '').replace(/\D/g, '');

    if (selectedCountry.isoCode === 'TZ') {
      let ui = digitsOnly;

      if (ui.startsWith('0')) {
        setLeadingZeroWarning(
          'For Tanzania, do not start the number with 0. Enter it without the leading 0 (e.g. 767000000).'
        );
        ui = ui.slice(1);
      } else {
        setLeadingZeroWarning(null);
      }

      ui = ui.slice(0, 9);

      const stored = ui ? '0' + ui : '';

      setLocalNumber(ui);
      onChange(stored);
    } else {
      const ui = digitsOnly.slice(0, 15);
      setLocalNumber(ui);
      onChange(ui);
      setLeadingZeroWarning(null);
    }
  };

  const effectiveValidationText =
    leadingZeroWarning ??
    validationText ??
    'Enter the phone number without the leading 0 (e.g. 767000000). The country code is already applied, and the system will store it as 0767000000 for Tanzania.';

  const hasError = Boolean(error || leadingZeroWarning);

  const wrapperStyle: React.CSSProperties = {
    maxWidth: typeof inputWidth === 'number' ? inputWidth : inputWidth || 480,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  return (
    <div style={wrapperStyle}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#1f2933',
          }}
        >
          {label}
          {required ? (
            <span style={{ color: '#e53935', marginLeft: 4 }}>*</span>
          ) : null}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          width: '100%',
          gap: '0.75rem',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: '0 0 auto',
            width: 260,
          }}
        >
          {/* <SingleSelectField
            selected={selectedIsoCode}
            onChange={handleCountryChange}
            disabled={disabled}
            dense
            filterable
            onFilterChange={({ value }: { value: string }) =>
              setFilterText(value)
            }
            noMatchText="No matching country"
          >
            {filteredCountries.map((country) => (
              <SingleSelectOption
                key={country.isoCode}
                value={country.isoCode}
                label={`${country.flag} ${country.name} (${country.dialCode})`}
              />
            ))}
          </SingleSelectField> */}
          <FilterableSingleSelectField
            selected={selectedIsoCode}
            onChange={handleCountryChange}
            disabled={disabled}
            dense
            filterable
            onFilterChange={({ value }: { value: string }) =>
              setFilterText(value)
            }
            noMatchText="No matching country"
          >
            {filteredCountries.map((country) => (
              <SingleSelectOption
                key={country.isoCode}
                value={country.isoCode}
                label={`${country.flag} ${country.name} (${country.dialCode})`}
              />
            ))}
          </FilterableSingleSelectField>
        </div>

        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <InputField
            type="tel"
            name={name}
            placeholder={placeholder ?? '767000000'}
            value={localNumber}
            required={required}
            disabled={disabled}
            error={hasError}
            validationText={effectiveValidationText}
            autoComplete="tel"
            max={selectedCountry.isoCode === 'TZ' ? '9' : '15'}
            onChange={handleLocalChange}
            onBlur={() => {
              if (selectedCountry.isoCode === 'TZ') {
                const digits = (localNumber || '')
                  .replace(/\D/g, '')
                  .slice(0, 9);
                const stored = digits ? '0' + digits : '';
                if (digits !== localNumber) {
                  setLocalNumber(digits);
                  onChange(stored);
                }
              }
              onBlur?.();
            }}
          />
        </div>
      </div>
    </div>
  );
};
