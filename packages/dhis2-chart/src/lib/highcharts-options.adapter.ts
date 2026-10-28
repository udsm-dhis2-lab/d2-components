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
  }
}

function axisOptions(axis: ChartAxisModel): Record<string, unknown> {
  return {
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
        ? { xAxis: axisOptions(model.categoryAxis) as Highcharts.XAxisOptions }
        : {}),
      series: model.series.map(seriesOptions),
      ...(model.drilldownSeries !== undefined
        ? { drilldown: { series: model.drilldownSeries.map(seriesOptions) } }
        : {}),
    };
    const serialized = _.cloneDeep(options);
    requirementsByOptions.set(serialized, [...model.requiredModules]);
    return serialized;
  }
}
