export interface PeriodInterface {
  id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

const period: PeriodInterface = {
  id: '2024', name: '2024', startDate: '2024-01-01', endDate: '2024-12-31',
};

export class Period {
  setType() { return this; }
  setPreferences() { return this; }
  get() { return this; }
  list() { return [period]; }
  getById(id: string) { return { ...period, id }; }
}
