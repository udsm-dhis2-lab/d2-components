// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FileListItem } from '@dhis2/ui';
import { FileInputField } from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import { isUndefined } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FormFieldExtension } from '../interfaces';
import { set } from 'date-fns';

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
  onRemoveFile?: () => void;
  extension?: FormFieldExtension;
  value?: string;
  metaType?: string;
  dataId?: string;
  program?: string;
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
    onRemoveFile,
    extension,
    value,
    metaType,
    dataId,
    program,
  } = props;
  const d2 = (window as unknown as D2Window)?.d2Web;
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

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

  useEffect(() => {
    if (value && !file) {
      (async () => {
        try {
          const res = await d2.httpInstance.get(`/fileResources/${value}`);
          setExistingFileName((res?.data?.['name'] as string) || null);
        } catch {
          setExistingFileName(null);
        }
      })();
    } else {
      setExistingFileName(null);
    }
  }, [value, file]);

  const fileUrl = useMemo(() => {
    if (!id || !dataId) return '#';
    if (metaType?.toLowerCase() === 'attribute') {
      return `/api/tracker/trackedEntities/${dataId}/attributes/${id}/file${
        program ? `?program=${program}` : ''
      }`;
    }
    return `/api/tracker/events/${dataId}/dataValues/${id}/file`;
  }, []);

  return (
    <>
      <FileInputField
        accept={extension?.accept?.join(',')}
        buttonLabel="Upload a file"
        label={label}
        name={id}
        required={required}
        error={!!validationError}
        validationText={validationError || validationText}
        disabled={!!existingFileName}
        onChange={(event: any) => {
          const fileItem = (event?.files || [])[0];
          setValidationError(null);

          if (extension?.sizeLimit && fileItem.size > extension?.sizeLimit) {
            setValidationError(
              `File size must not exceed ${
                extension.sizeLimit / (1024 * 1024)
              }MB`
            );
            setFile(null);
            return;
          }
          setFile(fileItem);

          if (performUpload) {
            uploadFile(fileItem);
          } else {
            onChange!(file);
          }
        }}
      >
        {(file || (value && existingFileName)) && (
          <FileListItem
            label={
              file ? (
                file.name
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: '#1976d2' }}
                >
                  {existingFileName}
                </a>
              )
            }
            loading={uploading}
            removeText="Remove"
            onRemove={() => {
              setFile(null);
              setExistingFileName(null);
              onRemoveFile?.();
            }}
          />
        )}
      </FileInputField>
    </>
  );
};
