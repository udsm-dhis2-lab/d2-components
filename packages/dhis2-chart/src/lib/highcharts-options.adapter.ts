import type * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import {
  ChartAxisModel,
  ChartModel,
  ChartPointModel,
  ChartSeriesModel,
  ChartModuleRequirement,
  YearOverYearChartModel,
} from './chart-model';

const requirementsByOptions = new WeakMap<
  object,
  readonly ChartModuleRequirement[]
>();

export function requiredModulesForOptions(
  options: Highcharts.Options
): readonly ChartModuleRequirement[] {
  return (
    requirementsByOptions.get(options) || [
      'exporting',
      'offline-exporting',
      'export-data',
    ]
  );
}

function formatNumber(
  v: number,
  sep: 'SPACE' | 'COMMA' | 'NONE',
  skipRounding: boolean
): string {
  const value = skipRounding
    ? v
    : Math.abs(v) >= 1
    ? Math.round(v * 100) / 100
    : v;

  if (sep === 'NONE') return String(value);
  if (sep === 'COMMA') return new Intl.NumberFormat('en-US').format(value);
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function pointOptions(point: ChartPointModel): Record<string, unknown> {
  return {
    ...(point.id !== undefined ? { id: point.id } : {}),
    ...(point.name !== undefined ? { name: point.name } : {}),
    y: point.value,
    ...(point.x !== undefined ? { x: point.x } : {}),
    ...(point.color !== undefined ? { color: point.color } : {}),
    ...(point.drilldown !== undefined ? { drilldown: point.drilldown } : {}),
    ...(point.label !== undefined ? { dataLabels: point.label } : {}),
  };
}

function seriesOptions(series: ChartSeriesModel): Highcharts.SeriesOptionsType {
  const common = {
    ...(series.id !== undefined ? { id: series.id } : {}),
    ...(series.name !== undefined ? { name: series.name } : {}),
    ...(series.index !== undefined ? { index: series.index } : {}),
    ...(series.turboThreshold !== undefined
      ? { turboThreshold: series.turboThreshold }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(series, 'pointPlacement')
      ? { pointPlacement: series.pointPlacement }
      : {}),
    ...(series.axisIndex !== undefined ? { yAxis: series.axisIndex } : {}),
    ...(series.lineWidth !== undefined ? { lineWidth: series.lineWidth } : {}),
    ...(series.states !== undefined ? { states: series.states } : {}),
    ...(series.colorByPoint !== undefined
      ? { colorByPoint: series.colorByPoint }
      : {}),
    data: series.points.map(pointOptions),
  };
  // Every emitted series has an explicit discriminant; casts are limited to
  // this engine boundary because legacy point labels use a broad option shape.
  switch (series.kind) {
    case 'line':
      return {
        ...common,
        type: 'line',
      } as unknown as Highcharts.SeriesLineOptions;
    case 'column':
      return {
        ...common,
        type: 'column',
      } as unknown as Highcharts.SeriesColumnOptions;
    case 'bar':
      return {
        ...common,
        type: 'bar',
      } as unknown as Highcharts.SeriesBarOptions;
    case 'area':
      return {
        ...common,
        type: 'area',
      } as unknown as Highcharts.SeriesAreaOptions;
    case 'pie':
      return {
        ...common,
        type: 'pie',
      } as unknown as Highcharts.SeriesPieOptions;
    case 'solidgauge':
      return {
        ...common,
        type: 'solidgauge',
      } as unknown as Highcharts.SeriesSolidgaugeOptions;
    case 'gauge':
      return {
        ...common,
        type: 'gauge',
      } as unknown as Highcharts.SeriesGaugeOptions;
    case 'scatter':
      return {
        ...common,
        type: 'scatter',
      } as unknown as Highcharts.SeriesScatterOptions;
  }
}

function axisOptions(axis: ChartAxisModel): Record<string, unknown> {
  return {
    ...(axis.opposite !== undefined ? { opposite: axis.opposite } : {}),
    ...(axis.offset !== undefined ? { offset: axis.offset } : {}),
    ...(axis.tickAmount !== undefined ? { tickAmount: axis.tickAmount } : {}),
    ...(axis.tickInterval !== undefined ? { tickInterval: axis.tickInterval } : {}),
    ...(axis.categories !== undefined ? { categories: axis.categories } : {}),
    ...(Object.prototype.hasOwnProperty.call(axis, 'minimum')
      ? { min: axis.minimum }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(axis, 'maximum')
      ? { max: axis.maximum }
      : {}),
    ...(axis.decimalsAllowed !== undefined
      ? { allowDecimals: axis.decimalsAllowed }
      : {}),
    ...(axis.labels !== undefined ? { labels: axis.labels } : {}),
    ...(axis.title !== undefined ? { title: axis.title } : {}),
    ...(axis.referenceLines !== undefined
      ? { plotLines: axis.referenceLines }
      : {}),
    ...(axis.stackTotals !== undefined
      ? { stackLabels: axis.stackTotals }
      : {}),
    ...(axis.reversedStacks !== undefined
      ? { reversedStacks: axis.reversedStacks }
      : {}),
    ...(axis.tickPlacement !== undefined
      ? { tickmarkPlacement: axis.tickPlacement }
      : {}),
    ...(axis.lineWidth !== undefined ? { lineWidth: axis.lineWidth } : {}),
    ...(axis.gridInterpolation !== undefined
      ? { gridLineInterpolation: axis.gridInterpolation }
      : {}),
  };
}

/** Two native, linked category axes: full names remain the data/export keys,
 * while the screen-facing tick labels show leaf and contiguous parent runs. */
function categoryAxisOptions(axis: ChartAxisModel): Highcharts.XAxisOptions | Highcharts.XAxisOptions[] {
  const primary = axisOptions(axis) as Highcharts.XAxisOptions;
  const primaryLabels = primary.labels as Highcharts.XAxisLabelsOptions | undefined;
  const styledPrimary: Highcharts.XAxisOptions = {
    ...primary,
    labels: {
      ...primaryLabels,
      style: { ...primaryLabels?.style, fontSize: '11px', color: '#404b5a' },
    },
  };
  const tuples = axis.categoryTuples;
  if (!tuples?.length || !tuples.some(tuple => tuple.parent)) return styledPrimary;
  const fullNames = tuples.map(tuple => tuple.parent ? `${tuple.parent} — ${tuple.leaf}` : tuple.leaf);
  const existingLabels = styledPrimary.labels as Record<string, unknown> | undefined;
  const leafLabels = existingLabels?.['labels'] && typeof existingLabels['labels'] === 'object'
    ? existingLabels['labels'] as Record<string, unknown> : existingLabels;
  const centers: number[] = [];
  const parents: string[] = [];
  const boundaries: number[] = [];
  for (let start = 0; start < tuples.length;) {
    const parent = tuples[start].parent ?? '';
    let end = start + 1;
    while (end < tuples.length && (tuples[end].parent ?? '') === parent) end++;
    if (parent) {
      centers.push((start + end - 1) / 2);
      parents.push(parent);
    }
    if (end < tuples.length) boundaries.push(end - 0.5);
    start = end;
  }
  return [
    {
      ...styledPrimary,
      categories: fullNames,
      plotLines: [
        ...(primary.plotLines ?? []),
        ...boundaries.map(value => ({ value, color: '#d9dfe5', width: 1, zIndex: 1 })),
      ],
      tickLength: 0,
      tickWidth: 0,
      labels: {
        ...leafLabels,
        style: { ...(leafLabels?.['style'] as Record<string, unknown> | undefined), fontSize: '11px', color: '#404b5a' },
        useHTML: false,
        formatter: function () { return tuples[this.pos]?.leaf ?? ''; },
      },
    },
    {
      linkedTo: 0,
      opposite: true,
      tickPositions: centers,
      tickLength: 0,
      tickWidth: 0,
      lineWidth: 0,
      gridLineWidth: 0,
      title: { text: undefined },
      labels: {
        useHTML: false,
        rotation: 0,
        autoRotation: [0],
        style: { fontSize: '11px', color: '#404b5a', whiteSpace: 'normal', textOverflow: 'none', width: 120 },
        formatter: function () { return parents[centers.indexOf(this.pos)] ?? ''; },
      },
    },
  ];
}

/** The single standard-chart serialization boundary for Highcharts.Options. */
export class HighchartsOptionsAdapter {
  assertModulesAvailable(
    model: ChartModel,
    available: readonly ChartModuleRequirement[]
  ): void {
    const missing = model.requiredModules.filter(
      (module) => !available.includes(module)
    );
    if (missing.length) {
      throw new Error(
        `Chart ${
          model.visualType
        } requires Highcharts module(s): ${missing.join(', ')}`
      );
    }
  }

  toYearOverYearOptions(
    model: YearOverYearChartModel,
    renderTarget: HTMLElement,
    onLoad: () => void
  ): Highcharts.Options {
    const {
      palette,
      title: titleText,
      subtitle: subtitleText,
      categories: normalizedCategories,
      showLegend,
      showData,
      digitGroupSeparator,
      skipRounding,
      tickStep,
      currentYear: thisYear,
      series: sortedSeries,
    } = model;
    const el = renderTarget;
    const hcSeries: Highcharts.SeriesOptionsType[] = sortedSeries.map((s, idx) => {
      const isThisYear = String(s.name) === String(thisYear);

      return {
        type: 'line',
        name: s.name,
        data: s.data.map((v) => (v == null ? null : v)),
        color: palette[idx % palette.length],

        marker: { enabled: false }, // ✅ default OFF (DHIS2)
        lineWidth: isThisYear ? 2.8 : 1.9,
        zIndex: isThisYear ? 10 : 1,

        // ✅ hover halo marker (ONLY on hover)
        states: {
          hover: {
            lineWidth: 3,
          },
        },

        dataLabels: {
          enabled: showData,
          allowOverlap: false,
          crop: true,
          overflow: 'none',
          style: {
            fontSize: '10px',
            fontWeight: '600',
            color: '#111827',
            textOutline: 'none',
          } as any,
          formatter: function () {
            const y = (this as any).y as number | null;
            if (y == null || y === 0) return '';
            return formatNumber(y, digitGroupSeparator, skipRounding);
          },
        },
      } as unknown as Highcharts.SeriesLineOptions;
    });

    // Determine if header exists
    const hasTitle = !!titleText;
    const hasSubtitle = !!subtitleText;

    // More generous vertical spacing
    const spacingTop = hasTitle || hasSubtitle ? 22 : 10;

    // Better vertical positioning
    const titleY = 5;
    const subtitleY = hasSubtitle ? 28 : 48;

    const options: Highcharts.Options = {
      colors: [...palette],

      chart: {
        renderTo: el as any,
        type: 'line',
        animation: false,
        backgroundColor: '#ffffff',

        // ✅ More impressive header space
        spacingTop,
        spacingRight: 14,
        spacingLeft: 14,
        spacingBottom: showLegend ? 24 : 16,

        style: {
          fontFamily:
            'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        },

        events: {
          load: () => onLoad(),
        } as any,
      },

      // -----------------------------
      // 🎯 VISUALLY IMPRESSIVE TITLE
      // -----------------------------
      title: {
        text: titleText || undefined,
        align: 'center',
        y: titleY,
        margin: 18, // more separation from subtitle
        style: {
          fontSize: '14px', // ⬆ bigger
          fontWeight: '600', // bold and strong
          letterSpacing: '0.3px',
          color: '#111827',
        },
      },

      // -----------------------------
      // 🎯 ELEGANT SUBTITLE
      // -----------------------------
      subtitle: {
        text: subtitleText || undefined,
        align: 'center',
        y: subtitleY,
        style: {
          fontSize: '13px',
          fontWeight: '500',
          color: '#475569',
        },
      },

      credits: { enabled: false },
      exporting: { enabled: true },

      legend: {
        enabled: showLegend,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {
          fontSize: '11px',
          fontWeight: '500',
          color: '#374151',
        },
        itemMarginTop: 3,
        itemMarginBottom: 3,
        symbolHeight: 10,
        symbolWidth: 18,
      },

      xAxis: {
        categories: [...normalizedCategories],
        tickmarkPlacement: 'on',
        lineColor: '#E5E7EB',
        tickColor: '#E5E7EB',
        gridLineWidth: 0,

        labels: {
          step: tickStep,
          rotation: -45,
          style: {
            fontSize: '10px',
            color: '#6B7280',
          } as any,
        },

        // ✅ vertical pointer line on hover
        crosshair: {
          width: 1,
          color: '#94A3B8',
          dashStyle: 'ShortDot',
          snap: true,
          zIndex: 8,
        },
      },

      yAxis: {
        title: { text: undefined },
        min: 0,
        tickAmount: 6,
        gridLineColor: '#F3F4F6',
        lineColor: '#E5E7EB',

        labels: {
          style: {
            fontSize: '10px',
            color: '#6B7280',
          } as any,
          formatter: function () {
            const v = (this as any).value as number;
            return formatNumber(v, digitGroupSeparator, skipRounding);
          },
        },

        // ✅ horizontal pointer line on hover
        crosshair: {
          width: 1,
          color: '#CBD5E1',
          dashStyle: 'ShortDot',
          zIndex: 8,
        },
      },

      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderColor: '#E5E7EB',
        borderRadius: 6,
        shadow: true,
        padding: 10,
        followPointer: false,

        formatter: function () {
          const x = (this as any).x;
          const pts = ((this as any).points || []) as any[];

          const rows = pts
            .slice()
            .sort((a, b) => Number(b.series.name) - Number(a.series.name))
            .map((p) => {
              const val = formatNumber(p.y, digitGroupSeparator, skipRounding);
              return `
                <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
                  <span style="color:${p.color};font-size:14px;line-height:0;">●</span>
                  <span style="min-width:40px;color:#374151;">${p.series.name}</span>
                  <b style="color:#111827;">${val}</b>
                </div>
              `;
            })
            .join('');

          return `
            <div style="font-size:12px;">
              <div style="margin-bottom:6px;color:#111827;"><b>${x}</b></div>
              ${rows}
            </div>
          `;
        },
      },

      plotOptions: {
        series: {
          animation: false,
          connectNulls: false,

          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true, // ✅ hover halo ON
                radius: 5,
                lineWidth: 2,
              },
            },
          },

          stickyTracking: true,
        },
      },

      series: hcSeries,

      responsive: {
        rules: [
          {
            condition: { maxWidth: 520 },
            chartOptions: {
              title: { style: { fontSize: '12px' } as any },
              subtitle: { style: { fontSize: '11px' } as any },
              xAxis: {
                labels: {
                  step: Math.max(2, tickStep),
                  rotation: -60,
                  style: { fontSize: '9px' } as any,
                },
              },
              yAxis: {
                labels: { style: { fontSize: '9px' } as any },
              },
              legend: {
                itemStyle: { fontSize: '10px' } as any,
              },
            },
          },
        ],
      },
    };

    requirementsByOptions.set(options, [...model.requiredModules]);
    return options;
  }

  toOptions(model: ChartModel): Highcharts.Options {
    if (model.kind !== 'CHART_MODEL') {
      throw new TypeError('Expected an engine-neutral CHART_MODEL');
    }
    const chart: Record<string, unknown> = {
      renderTo: model.renderTarget,
      zoomType: model.zoomMode,
      type: model.chartType,
      ...(model.animation !== undefined ? { animation: model.animation } : {}),
      ...(model.polar !== undefined ? { polar: model.polar } : {}),
      ...(model.backgroundColor !== undefined
        ? { plotBackgroundColor: model.backgroundColor }
        : {}),
      ...(model.borderWidth !== undefined
        ? { plotBorderWidth: model.borderWidth }
        : {}),
      ...(model.shadow !== undefined ? { plotShadow: model.shadow } : {}),
    };
    const options: Highcharts.Options = {
      chart: chart as Highcharts.ChartOptions,
      title: model.title as Highcharts.TitleOptions,
      subtitle: model.subtitle as unknown as Highcharts.SubtitleOptions,
      credits: model.credits as Highcharts.CreditsOptions,
      ...(model.accessibility !== undefined ? { accessibility: model.accessibility as Highcharts.AccessibilityOptions } : {}),
      colors: [...model.palette],
      plotOptions: model.seriesPresentation as Highcharts.PlotOptions,
      tooltip: model.tooltip as Highcharts.TooltipOptions,
      exporting: model.exporting as Highcharts.ExportingOptions,
      ...(model.legend !== undefined
        ? { legend: model.legend as Highcharts.LegendOptions }
        : {}),
      ...(model.pane !== undefined
        ? { pane: model.pane as Highcharts.PaneOptions }
        : {}),
      ...(model.valueAxes !== undefined
        ? {
            yAxis: model.valueAxes.map(
              axisOptions
            ) as Highcharts.YAxisOptions[],
          }
        : {}),
      ...(model.categoryAxis !== undefined
        ? { xAxis: categoryAxisOptions(model.categoryAxis) }
        : {}),
      series: [
        ...model.series.map(seriesOptions),
        ...(model.overlays ?? []).filter(overlay => overlay.kind !== 'extreme-line').map(overlay => overlay.kind === 'regression'
          ? { type: 'line' as const, name: overlay.name, data: overlay.points.map(point => ({ x: point.x, y: point.y })), marker: { enabled: false }, enableMouseTracking: false, showInLegend: false, dashStyle: 'ShortDash' as const }
          : { type: 'scatter' as const, name: overlay.name, data: overlay.points.map(point => ({ id: point.id, name: point.name, x: point.x, y: point.y })), color: '#c62828', marker: { radius: 6 }, showInLegend: false }),
      ],
      ...(model.drilldownSeries !== undefined
        ? { drilldown: { series: model.drilldownSeries.map(seriesOptions) } }
        : {}),
    };
    if (model.overlays?.length) {
      const lines = model.overlays.filter(overlay => overlay.kind === 'extreme-line');
      if (lines.length) {
        const xAxis = options.xAxis as Highcharts.XAxisOptions | undefined;
        const yAxes = options.yAxis as Highcharts.YAxisOptions[] | undefined;
        if (xAxis && !Array.isArray(xAxis)) xAxis.plotLines = [
          ...(xAxis.plotLines ?? []),
          ...lines.filter(line => line.axis === 'x').map(line => ({ value: line.value, width: 1, color: '#9e9e9e', dashStyle: 'Dash' as const })),
        ];
        if (yAxes?.[0]) yAxes[0].plotLines = [
          ...(yAxes[0].plotLines ?? []),
          ...lines.filter(line => line.axis === 'y').map(line => ({ value: line.value, width: 1, color: '#9e9e9e', dashStyle: 'Dash' as const })),
        ];
      }
    }
    const serialized = _.cloneDeep(options);
    requirementsByOptions.set(serialized, [...model.requiredModules]);
    return serialized;
  }
}
