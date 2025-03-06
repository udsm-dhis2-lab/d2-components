import {
  Button,
  colors,
  FlyoutMenu,
  IconMore24,
  Layer,
  MenuItem,
  Popper,
} from "@dhis2/ui";
import React, { useRef, useState } from "react";
import { dropdownStyles } from "./dropdown-menu.styles";
import { useDynamicStyles } from "../../hooks";

export interface DropdownMenuOption {
  id?: string;
  label: string;
  description?: string;
  icon?: any;
  destructive?: boolean;
  onClick?: Function;
}

const useCurrentModal = () => {
  const [CurrentModal, setCurrentModal] = useState();

  return [
    CurrentModal,
    (Modal: any) => {
      // As setState supports functional updates, we can't pass functional
      // components directly
      setCurrentModal(() => Modal);
    },
  ] as any;
};

export const ContextMenu = (params: {
  dropDownOptions: DropdownMenuOption[];
  anchorRef: any;
  onClose: Function;
  onMenuClick: (dropdownOption: DropdownMenuOption) => void;
}) => {
  const { onClose, onMenuClick, anchorRef, dropDownOptions } = params;
  const [CurrentModal, setCurrentModal] = useCurrentModal();

  const styles = useDynamicStyles(dropdownStyles);

  return (
    <>
      {/* <Layer onBackdropClick={onClose} className={styles.layer}> */}
      <Layer onBackdropClick={(event: any, data: any) => onClose(event, data)} className={styles.layer}>
        <Popper reference={anchorRef} placement="bottom-start">
          <FlyoutMenu>
            {dropDownOptions.map((dropDownOption, index) => (
              <MenuItem
                key={index}
                destructive={dropDownOption.destructive}
                label={dropDownOption.label}
                icon={dropDownOption.icon}
                onClick={() => {
                 onMenuClick(dropDownOption);
                  onClose();
                }}
                dense
              />
            ))}
          </FlyoutMenu>
        </Popper>
      </Layer>
      {CurrentModal && (
        <CurrentModal
          onClose={() => {
            onClose();
            setCurrentModal!(null);
          }}
        />
      )}
    </>
  );
};

export const DropdownMenu = (props: {
  dropdownOptions: DropdownMenuOption[];
  onClick: (dropdownOption: DropdownMenuOption) => void;
}) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const { dropdownOptions, onClick } = props;
  return (
    <div ref={ref as any} style={{ display: "inline-block" }}>
      <Button
        small
        secondary
        icon={<IconMore24 color={colors.grey600} />}
        onClick={() => setVisible(true)}
      ></Button>
      {visible && (
        <ContextMenu
          dropDownOptions={dropdownOptions}
          anchorRef={ref}
          onClose={() => setVisible(false)}
          onMenuClick={(dropDownOption) => {
            onClick(dropDownOption);
          }}
        />
      )}
    </div>
  );
};
