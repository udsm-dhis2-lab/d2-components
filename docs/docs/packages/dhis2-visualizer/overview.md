---
title: d2-visualizer
---

# @iapps/d2-visualizer

TypeScript visualization library built on top of Highcharts for DHIS2 analytics data.

## Install

```bash
npm install @iapps/d2-visualizer
```

## Basic usage

```ts
import { D2Visualizer } from '@iapps/d2-visualizer';

new D2Visualizer()
  .setConfig(chartConfigurations)
  .setData(chartVisualizationAnalytics)
  .setId('visualization-container')
  .setType('CHART')
  .setChartType('column')
  .draw();
```

## Build from source

```bash
npm run build:dhis2-visualizer
```

## What to document next

- Supported visualization types
- Chart configuration schema
- DHIS2 analytics response format
- Map and table examples
