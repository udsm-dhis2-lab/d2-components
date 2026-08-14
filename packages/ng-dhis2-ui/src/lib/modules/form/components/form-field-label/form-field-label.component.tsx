import { FieldConfig } from '../../models';
import { IFormField } from '../../interfaces';
import { useRef, useState } from 'react';
import { Legend, colors, IconInfo16 } from '@dhis2/ui';
import React from 'react';
import { Popover } from '@dhis2/ui';

export const FormFieldLabel = (props: {
  field: IFormField<string>;
  fieldConfig?: FieldConfig;
}) => {
  const { field, fieldConfig } = props;

  if (fieldConfig?.hideLabel) {
    return null;
  }

  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignContent: 'center',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <Legend required={field.required}>{field.label}</Legend>
        {field.description && (
          <div
            ref={buttonRef}
            style={{
              cursor: 'pointer',
              backgroundColor,
              display: 'flex',
              alignItems: 'center',
              padding: 1,
              borderRadius: 2,
            }}
            onMouseEnter={() => setBackgroundColor(colors.grey200)}
            onMouseLeave={() => setBackgroundColor('transparent')}
            onClick={() => setOpen(!open)}
          >
            <IconInfo16 />
          </div>
        )}
      </div>
      {open && (
        <Popover
          arrow
          reference={buttonRef}
          elevation="0px 0px 1px rgba(33,41,52,0.1), 0px 4px 6px -1px rgba(33,41,52,0.1), 0px 2px 4px -1px rgba(33,41,52,0.06)"
          maxWidth={400}
          placement="top"
          onClickOutside={() => setOpen(false)}
        >
          <div
            style={{
              padding: 8,
            }}
          >
            <div
              style={{
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {fieldConfig?.fieldDescriptionLabel ?? 'Description'}
            </div>
            <small
              style={{
                color: colors.grey700,
              }}
            >
              {field.description}
            </small>
          </div>
        </Popover>
      )}
    </div>
  );
};
