import * as Highcharts from 'highcharts';
import {
  BaseVisualizer,
  downloadCsv,
  DownloadFormat,
  Visualizer,
} from './core';
import {
  ChartInstance,
  DefaultHighchartsAdapter,
  HighchartsAdapter,
} from './highcharts-adapter';

type YoYSeries = { name: string; data: Array<number | null> };

type YoYBundleData = {
  kind?: 'YEAR_OVER_YEAR_LINE';
  axis?: { categories?: string[] };
  series?: YoYSeries[];
  context?: any;

  labels?: {
    dxName?: string;
    ouName?: string;
  };
};

export class YearOverYearLineHighchartsVisualizer
  extends BaseVisualizer
  implements Visualizer
{
  #chart?: ChartInstance;
  #drawTimer?: ReturnType<typeof setTimeout>;
  #loaderEl?: HTMLElement;
  readonly #highcharts: HighchartsAdapter;

  constructor(highcharts: HighchartsAdapter = new DefaultHighchartsAdapter()) {
    super();
    this.#highcharts = highcharts;
  }

  draw() {
    const el = document.getElementById(this._id);
    if (!el) return;

    this.showLoader(el, 'Loading year-over-year analysis…');

    const bundle = (this._data ?? {}) as YoYBundleData;

    const categories = bundle?.axis?.categories ?? [];
    const series = (bundle?.series ?? [])
      .slice()
      .sort((a, b) => Number(a.name) - Number(b.name));

    if (!categories.length || !series.length) {
      this.hideLoader();
      this.renderEmpty(
        el,
        'No data available',
        'Missing categories or series.'
      );
      return;
    }

    const fav: any = this._config?.config ?? this._config ?? {};

    const showLegend = !fav.hideLegend;
    const showData = !!fav.showData;

    const digitGroupSeparator = (fav.digitGroupSeparator ?? 'SPACE') as
      | 'SPACE'
      | 'COMMA'
      | 'NONE';
    const skipRounding = !!fav.skipRounding;

    // ----------------------------
    // ✅ DHIS2-like title/subtitle
    // ----------------------------
    const titleText = fav.hideTitle
      ? ''
      : (fav.displayName || fav.name || '').toString();

    const dxFromConfig = this.pickDxNameFromFavorite(fav);
    const ouFromConfig = this.pickOuNameFromFavorite(fav);

    const ouName =
      bundle?.labels?.ouName || ouFromConfig || 'Organisation unit';
    const dxName = bundle?.labels?.dxName || dxFromConfig || 'Data';

    const subtitleText = fav.hideSubtitle ? '' : `${ouName} - ${dxName}`;

    // ----------------------------
    // ✅ Categories formatting
    // ----------------------------
    const normalizedCategories = categories.map((c) => this.normalizeWeek(c));

    // ----------------------------
    // ✅ Colors
    // ----------------------------
    const palette = [
      '#8BC34A',
      '#1976D2',
      '#EF6C00',
      '#7E57C2',
      '#00897B',
      '#C2185B',
      '#455A64',
    ];

    const thisYear = new Date().getFullYear();
    const sortedSeries = series.slice().sort((a, b) => {
      if (String(a.name) === String(thisYear)) return -1;
      if (String(b.name) === String(thisYear)) return 1;
      return Number(b.name) - Number(a.name);
    });

    const hcSeries: any[] = sortedSeries.map((s, idx) => {
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
      };
    });

    const tickStep = this.getTickStepForDHIS2Like(normalizedCategories.length);

    // Determine if header exists
    const hasTitle = !!titleText;
    const hasSubtitle = !!subtitleText;

    // More generous vertical spacing
    const spacingTop = hasTitle || hasSubtitle ? 22 : 10;

    // Better vertical positioning
    const titleY = 5;
    const subtitleY = hasSubtitle ? 28 : 48;

    const options: Highcharts.Options = {
      colors: palette,

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
          load: () => this.hideLoader(),
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
        categories: normalizedCategories,
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

      series: hcSeries as any,

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

    this.#drawTimer = setTimeout(() => {
      this.#drawTimer = undefined;
      this.dispose();
      this.#chart = this.#highcharts.create(options);
      // chart load event hides loader
    }, 20);
  }

  override dispose() {
    if (this.#drawTimer) {
      clearTimeout(this.#drawTimer);
      this.#drawTimer = undefined;
    }
    const chart = this.#chart;
    this.#chart = undefined;
    chart?.destroy();
    this.hideLoader();
  }

  override download(downloadFormat: DownloadFormat) {
    const fav: any = this._config?.config ?? this._config ?? {};
    const filename = fav.title || fav.displayName || fav.name || 'yoy-line';

    switch (downloadFormat) {
      case 'PNG':
        this.#chart?.exportChart({ filename, type: 'image/png' }, {});
        break;
      case 'CSV':
        if (!this.#chart) return;
        downloadCsv(filename, this.#chart.getCSV());
        break;
    }
  }

  private renderEmpty(el: HTMLElement, title: string, subtitle?: string) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding:12px;color:#6B7280;font-size:12px';
    const heading = document.createElement('div');
    heading.style.cssText =
      'font-weight:600;margin-bottom:6px;color:#111827';
    heading.textContent = title;
    const detail = document.createElement('div');
    detail.style.cssText = 'font-size:11px;color:#9CA3AF';
    detail.textContent = subtitle ?? '';
    wrapper.append(heading, detail);
    el.replaceChildren(wrapper);
  }

  // ---------------- Loader ----------------

  private showLoader(el: HTMLElement, message = 'Loading…') {
    this.hideLoader();

    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255,255,255,0.92);
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 10px rgba(17,24,39,0.06);
      color: #374151;
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 12px;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #E5E7EB;
      border-top-color: #1976D2;
      animation: yoySpin 0.8s linear infinite;
    `;

    card.appendChild(spinner);
    wrap.appendChild(card);

    if (!document.getElementById('yoy-loader-style')) {
      const style = document.createElement('style');
      style.id = 'yoy-loader-style';
      style.textContent = `
        @keyframes yoySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }

    el.appendChild(wrap);
    this.#loaderEl = wrap;
  }

  private hideLoader() {
    if (this.#loaderEl?.parentElement) {
      this.#loaderEl.parentElement.removeChild(this.#loaderEl);
    }
    this.#loaderEl = undefined;
  }

  // ---------------- Helpers ----------------

  private pickDxNameFromFavorite(fav: any): string {
    const dx = (fav?.filters || []).find((f: any) => f?.dimension === 'dx')
      ?.items?.[0];
    return (
      dx?.displayName ||
      dx?.name ||
      (typeof dx?.id === 'string' ? dx.id : '') ||
      ''
    );
  }

  private pickOuNameFromFavorite(fav: any): string {
    const ou = (fav?.filters || []).find((f: any) => f?.dimension === 'ou')
      ?.items?.[0];
    if (ou?.id === 'USER_ORGUNIT') return 'Zanzibar';
    return (
      ou?.displayName ||
      ou?.name ||
      (typeof ou?.id === 'string' ? ou.id : '') ||
      ''
    );
  }

  private normalizeWeek(label: string): string {
    if (!label) return label;

    const m1 = /^W(\d{1,2})$/i.exec(label.trim());
    if (m1) return `W${Number(m1[1])}`;

    const m2 = /^W(\d{1,2})\s+\d{4}$/i.exec(label.trim());
    if (m2) return `W${Number(m2[1])}`;

    const m3 = /^\d{4}W(\d{1,2})$/i.exec(label.trim());
    if (m3) return `W${Number(m3[1])}`;

    return label;
  }

  private getTickStepForDHIS2Like(categoryCount: number): number {
    if (categoryCount <= 52) return 1;
    return 2;
  }
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
