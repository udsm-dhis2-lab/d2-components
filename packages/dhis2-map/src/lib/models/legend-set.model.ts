export interface Legend {
  id: string;
  name: string;
  color: string;
  startValue: number;
  endValue: number;
  itemCount?: number;
  [property: string]: unknown;
}

export interface LegendSet {
  id: string;
  name: string;
  legends: Legend[];
  [property: string]: unknown;
}
