import { YearOverYearChartModel } from './chart-model';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';
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

    const model: YearOverYearChartModel = {
      kind: 'YEAR_OVER_YEAR_CHART_MODEL',
      categories: normalizedCategories,
      series: sortedSeries,
      palette,
      title: titleText,
      subtitle: subtitleText,
      showLegend,
      showData,
      digitGroupSeparator,
      skipRounding,
      tickStep: this.getTickStepForDHIS2Like(normalizedCategories.length),
      currentYear: thisYear,
      requiredModules: ['exporting', 'offline-exporting', 'export-data'],
    };
    const options = new HighchartsOptionsAdapter().toYearOverYearOptions(
      model,
      el,
      () => this.hideLoader()
    );

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
    heading.style.cssText = 'font-weight:600;margin-bottom:6px;color:#111827';
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
