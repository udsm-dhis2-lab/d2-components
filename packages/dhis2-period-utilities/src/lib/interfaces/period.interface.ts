export interface PeriodInterface {
  id: string;
  startDate?: string;
  endDate?: string;
  iso?: any;
  name: string;
  type?: string;
  lastPeriod?: PeriodInterface;
  daily?: any[];
  weekly?: any[];
  monthly?: any[];
  quarterly?: any[];
}
