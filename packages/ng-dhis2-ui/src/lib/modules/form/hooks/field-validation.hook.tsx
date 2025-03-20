// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FormGroup } from '@angular/forms';
import { FormField } from '../models';
import { useMemo } from 'react';
import { IFormField } from '../interfaces';

export const useFieldValidation = (props: {
  form: FormGroup;
  field: IFormField<string>;
  touched: boolean;
  value: string;
}) => {
  const { form, touched, field, value } = props;
  const hasError = useMemo(() => {
    return touched && (form.get(field.id) || form.get(field.key))?.invalid;
  }, [value, touched]);

  const validationError = useMemo(() => {
    if (!touched) {
      return undefined;
    }

    const error = (form.get(field.id) || form.get(field.key))?.errors;

    if (!error) {
      return undefined;
    }

    if (error['min']) {
      return `${field.label || 'Value'} should not be less than ${
        error['min'].min
      }!`;
    } else if (error['max']) {
      return `${field.label || 'Value'} should not be greater than ${
        error['max'].max
      }!`;
    } else if (error['pattern']) {
      if (field.type === 'email') {
        return `The email address provided is not valid`;
      } else if (field.type === 'tel') {
        return 'Phone number provided is not valid';
      } else {
        return `${field.label || 'Value'} should have appropriate format`;
      }
    }

    return error['required']
      ? `${field.label || 'Value'} is required`
      : undefined;
  }, [hasError]);

  return { hasError, validationError };
};
