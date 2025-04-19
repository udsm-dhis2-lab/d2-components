// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { BreadcrumbItem } from '../models';
import React from 'react';
import { colors } from '@dhis2/ui';
import { useDynamicStyles } from '../../../shared';

const styles = {
  button: {
    // Reset button styles
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',

    // Custom button styles
    fontSize: '14px',
    padding: '6px 4px',
    color: colors.grey800,
    borderRadius: '3px',

    '&:hover': {
      textDecoration: 'underline',
      color: 'black',
    },
    '&.selected': {
      color: 'black',
    },
  },
};

export const BreadcrumbItemComponent = (props: {
  breadcrumb: BreadcrumbItem;
  onClick: () => void;
}) => {
  const { breadcrumb, onClick } = props;
  const classes = useDynamicStyles(styles);

  return (
    <button
      type="button"
      title={breadcrumb.label}
      className={[
        classes.button,
        breadcrumb.selected ? classes.button + '.selected' : null,
      ]
        .filter((cssClass) => cssClass !== null)
        .join(' ')}
      onClick={onClick}
    >
      {breadcrumb.label}
    </button>
  );
};
