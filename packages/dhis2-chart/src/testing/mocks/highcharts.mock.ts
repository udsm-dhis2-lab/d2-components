export const chartInstance = {
  destroy: jest.fn(),
  exportChart: jest.fn(),
  getCSV: jest.fn(() => 'name,value\nExample,1'),
};

export const chart = jest.fn(() => chartInstance);

export class SVGRenderer {}
