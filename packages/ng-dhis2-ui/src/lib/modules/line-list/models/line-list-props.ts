export interface LineListProps {
    onApprovalClick?: (teiEnrollmentList: { teiId: string; enrollmentId: string }[]) => void;
  }