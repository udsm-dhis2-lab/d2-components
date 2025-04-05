// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ActionOptionOrientation } from '../../models';
import { DropdownMenu, DropdownMenuOption } from '../dropdown-menu';
import React from 'react';
import { ButtonStrip, Button, colors } from '@dhis2/ui';

export const DataTableActions = (props: {
  actionOptions: DropdownMenuOption[];
  actionOptionOrientation: ActionOptionOrientation;
  onClick: (dropdownOption: DropdownMenuOption) => void;
}) => {
  const { actionOptions, actionOptionOrientation, onClick } = props;

  switch (actionOptionOrientation) {
    case 'BUTTON':
      return (
        <ButtonStrip>
          {actionOptions.map((option) => (
            <Button
              key={option.label}
              onClick={() => onClick(option)}
              icon={option.icon ? <option.icon /> : <></>}
              small
              destructive={option.destructive}
            >
              {!option.iconOnly ? option.label : ''}
            </Button>
          ))}
        </ButtonStrip>
      );

    case 'DROPDOWN':
      return (
        <DropdownMenu
          dropdownOptions={actionOptions}
          onClick={(option) => {
            onClick(option);
          }}
        />
      );

    case 'LINK':
      return (
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {actionOptions.map((option) => (
            <a
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: option.destructive ? colors.red700 : colors.grey900,
              }}
              key={option.label}
              onClick={(event: any) => {
                event.stopPropagation();
                onClick(option);
              }}
            >
              {option.icon ? <option.icon /> : <></>}
              {!option.iconOnly ? <span>{option.label}</span> : <></>}
            </a>
          ))}
        </div>
      );

    default:
      return <></>;
  }
};
