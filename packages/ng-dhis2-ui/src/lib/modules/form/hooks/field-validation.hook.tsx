// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FormGroup } from '@angular/forms';
import { useMemo } from 'react';
import { IFormField } from '../interfaces';

export const useFieldValidation = (props: {
  form: FormGroup;
  field: IFormField<string>;
  touched: boolean;
  value: string;
  initialError?: string;
  recordExistError?: string;
}) => {
  const { form, touched, field, value, initialError, recordExistError } = props;

  const hasError = useMemo(() => {
    if (recordExistError) {
      return true;
    }

    if (initialError && value) {
      return true;
    }

    return touched && (form.get(field.id) || form.get(field.key))?.invalid;
  }, [value, touched, initialError, recordExistError]);

  const validationError = useMemo(() => {
    if (recordExistError) {
      return recordExistError;
    }

    if (initialError && value) {
      return initialError;
    }

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
    }

    if (error['max']) {
      return `${field.label || 'Value'} should not be greater than ${
        error['max'].max
      }!`;
    }

    if (error['pattern']) {
      if (field.type === 'email') {
        return `The email address provided is not valid`;
      }

      if (field.type === 'tel') {
        return 'Phone number provided is not valid';
      }

      return `${field.label || 'Value'} should have appropriate format`;
    }

    if (error['customError']) {
      return error['customError'];
    }

    return error['required']
      ? `${field.label || 'Value'} is required`
      : undefined;
  }, [touched, value, initialError, recordExistError]);

  return { validationError, hasError };
};
