import {
  IconVisualizationColumn16,
  IconVisualizationLine16,
  IconVisualizationScatter16,
  IconVisualizationBar16,
  IconVisualizationArea16,
  IconVisualizationPie16,
  IconVisualizationColumnStacked16,
  IconVisualizationBarStacked16,
  IconVisualizationGauge16,
  IconVisualizationRadar16,
} from '@dhis2/ui';

export const CHART_TYPES = [
  {
    type: 'column',
    description: 'Column',
    icon: IconVisualizationColumn16,
  },
  {
    type: 'stacked_column',
    description: 'Stacked Column',
    icon: IconVisualizationColumnStacked16,
  },
  {
    type: 'bar',
    description: 'Bar',
    icon: IconVisualizationBar16,
  },
  {
    type: 'stacked_bar',
    description: 'Stacked Bar',
    icon: IconVisualizationBarStacked16,
  },
  {
    type: 'line',
    description: 'Line',
    icon: IconVisualizationLine16,
  },
  {
    type: 'dotted',
    description: 'Dotted',
    icon: IconVisualizationScatter16,
  },
  {
    type: 'area',
    description: 'Area',
    icon: IconVisualizationArea16,
  },
  {
    type: 'pie',
    description: 'Pie',
    icon: IconVisualizationPie16,
  },
  {
    type: 'solidgauge',
    description: 'Gauge',
    icon: IconVisualizationGauge16,
  },
  {
    type: 'radar',
    description: 'Radar',
    icon: IconVisualizationRadar16,
  },
];
