// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FileListItem } from '@dhis2/ui';
import { FileInputField } from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import { isUndefined } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

export const FileUploadField = (props: {
  label?: string;
  id: string;
  fileId?: string;
  performUpload?: boolean;
  hasError?: boolean;
  uploadUrl?: string;
  required?: boolean;
  validationText?: string;
  onChange?: (files: any[]) => void;
  onUploadSuccess?: (fileId: string) => void;
}) => {
  const {
    label,
    id,
    uploadUrl,
    performUpload,
    validationText,
    required,
    hasError,
    onChange,
    onUploadSuccess,
  } = props;
  const d2 = (window as unknown as D2Window)?.d2Web;
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>();

  const valid = useMemo(() => {
    if (isUndefined(hasError)) {
      return undefined;
    }

    return !hasError;
  }, [hasError]);

  const uploadFile = async (fileItem: any) => {
    if (fileItem) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', fileItem);
      try {
        const fileUploadResponse = await d2.httpInstance.post(
          uploadUrl as string,
          formData as any
        );

        setUploading(false);
        const fileId = (fileUploadResponse?.data as any)?.response?.fileResource
          ?.id;

        if (fileId) {
          onUploadSuccess!(fileId);
        }
      } catch (error) {
        setUploading(false);
      }
    }
  };

  return (
    <FileInputField
      accept="*"
      buttonLabel="Upload a file"
      label={label}
      name={id}
      valid={valid}
      required={required}
      validationText={validationText}
      onChange={(event: any) => {
        const fileItem = (event?.files || [])[0];
        setFile(fileItem);

        if (performUpload) {
          uploadFile(fileItem);
        } else {
          onChange!(file);
        }

        // this.ngZone.run(() => {
        //   this.form().get(this.field().id) ||
        //     this.form()
        //       .get(this.field().key)
        //       ?.setValue((event?.files || [])[0]);
        //   this.update.emit({
        //     form: this.form(),
        //     value: (event?.files || [])[0],
        //   });
        // });
        // setValue((event?.files || [])[0]);
        // setTouched(true);
      }}
    >
      {file && (
        <FileListItem
          cancelText="Cancel"
          label={file.name}
          loading={uploading}
          onRemove={() => {
            setFile(null);
          }}
          removeText="Remove"
        />
      )}
    </FileInputField>
  );
};
