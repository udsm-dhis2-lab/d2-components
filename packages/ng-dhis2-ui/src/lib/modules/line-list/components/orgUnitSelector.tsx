import React from "react";
import { OrgUnitFormField } from '../components/org-unit-form-field.component';
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
  } from '@dhis2/ui';
export const OrgUnitSelector = ({
    hide,
    setHide,
    selectedOrgUnit,
    setSelectedOrgUnit,
    setOrgUnitState,
    setTempOrgUnitState,
    tempOrgUnitState
  }: any) => (
    <Modal hide={hide} position="middle">
      <ModalTitle>Select organization unit</ModalTitle>
      <ModalContent>
        <OrgUnitFormField
          key={selectedOrgUnit}
          onSelectOrgUnit={(selectedOrgUnit: any) => {
            setSelectedOrgUnit(selectedOrgUnit.displayName);
            setTempOrgUnitState(selectedOrgUnit.id);
            setHide(true);
          }}
        />
      </ModalContent>
      <ModalActions>
        <ButtonStrip end>
          <Button onClick={() => setHide(true)} secondary>
            Close
          </Button>
        </ButtonStrip>
      </ModalActions>
    </Modal>
  );
  