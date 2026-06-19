// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as Highcharts from 'highcharts';
// import Exporting from 'highcharts/modules/exporting';
// import OfflineExporting from 'highcharts/modules/offline-exporting';
// import ExportData from 'highcharts/modules/export-data';

// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { DownloadFormat } from '../../shared/models/download-format.model';
// import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';

// Exporting(Highcharts);
// OfflineExporting(Highcharts);
// ExportData(Highcharts);

// type YoYSeries = { name: string; data: Array<number | null> };

// type YoYBundleData = {
//   kind?: 'YEAR_OVER_YEAR_LINE';
//   axis?: { categories?: string[] };
//   series?: YoYSeries[];
//   context?: any;
// };

// export class YearOverYearLineHighchartsVisualizer
//   extends BaseVisualizer
//   implements Visualizer
// {
//   private _chart!: Highcharts.Chart;

//   draw() {
//     const el = document.getElementById(this._id);
//     if (!el) return;

//     // Your pipeline passes (await _getData())?._data
//     // So "this._data" here should be the final object itself.
//     const bundle = (this._data ?? {}) as YoYBundleData;

//     const categories = bundle?.axis?.categories ?? [];
//     const series = bundle?.series ?? [];

//     if (!categories.length || !series.length) {
//       this.renderEmpty(el, 'No data available', 'Missing categories or series.');
//       return;
//     }

//     // Build title/subtitle from config like DHIS2
//     const fav: any = this._config?.config ?? this._config ?? {};
//     const title = fav.hideTitle ? '' : (fav.displayName || fav.name || '');
//     const subtitle = fav.hideSubtitle
//       ? ''
//       : (fav.displayDescription || fav.description || '');

//     const showLegend = !fav.hideLegend;
//     const showData = !!fav.showData;

//     const digitGroupSeparator = (fav.digitGroupSeparator ??
//       'SPACE') as 'SPACE' | 'COMMA' | 'NONE';

//     const skipRounding = !!fav.skipRounding;

//     const hcSeries: Highcharts.SeriesLineOptions[] = series.map((s) => ({
//       type: 'line',
//       name: s.name,
//       data: s.data.map((v) => (v == null ? null : v)),
//       marker: { enabled: false },
//       dataLabels: {
//         enabled: showData,
//         // show zeros too (DHIS2-style)
//         formatter: function () {
//           const y = (this as any).y;
//           if (y == null) return '';
//           return formatNumber(y, digitGroupSeparator, skipRounding);
//         },
//       },
//     }));

//     const options: Highcharts.Options = {
//       chart: {
//         renderTo: el as any,
//         type: 'line',
//         animation: false,
//         spacingBottom: showLegend ? 30 : 15,
//       },
//       title: { text: title || undefined },
//       subtitle: { text: subtitle || undefined },
//       credits: { enabled: false },
//       exporting: { enabled: true },
//       legend: { enabled: showLegend },
//       xAxis: {
//         categories,
//         tickInterval: 1,
//         labels: {
//           // DHIS2 shows all weeks; keep small font
//           style: { fontSize: '10px' } as any,
//         },
//       },
//       yAxis: {
//         title: { text: undefined },
//         min: 0,
//         allowDecimals: true,
//         labels: {
//           formatter: function () {
//             const v = (this as any).value;
//             return formatNumber(v, digitGroupSeparator, skipRounding);
//           },
//         },
//       },
//       tooltip: {
//         shared: true,
//         formatter: function () {
//           const pts = (this as any).points || [];
//           const x = (this as any).x;
//           const rows = pts
//             .map(
//               (p: any) =>
//                 `<span style="color:${p.color}">\u25CF</span> ${p.series.name}: <b>${formatNumber(
//                   p.y,
//                   digitGroupSeparator,
//                   skipRounding
//                 )}</b>`
//             )
//             .join('<br/>');
//           return `<b>${x}</b><br/>${rows}`;
//         },
//       },
//       plotOptions: {
//         series: {
//           animation: false,
//           connectNulls: false,
//         },
//       },
//       series: hcSeries as any,
//     };

//     // Render like ChartVisualizer
//     setTimeout(() => {
//       this.dispose();
//       this._chart = Highcharts.chart(options);
//     }, 20);
//   }

//   override dispose() {
//     if (this._chart) this._chart.destroy();
//   }

//   override download(downloadFormat: DownloadFormat) {
//     const fav: any = this._config?.config ?? this._config ?? {};
//     const filename = fav.title || fav.displayName || fav.name || 'yoy-line';

//     switch (downloadFormat) {
//       case 'PNG':
//         this._chart.exportChart({ filename, type: 'image/png' }, {});
//         break;
//       case 'CSV':
//         new VisualizationDownloader()
//           .setFilename(filename)
//           .setCSV(this._chart.getCSV())
//           .download();
//         break;
//     }
//   }

//   private renderEmpty(el: HTMLElement, title: string, subtitle?: string) {
//     el.innerHTML = `
//       <div style="padding:12px;color:#757575;font-size:12px">
//         <div style="font-weight:600;margin-bottom:6px">${title}</div>
//         <div style="font-size:11px;color:#9e9e9e">${subtitle ?? ''}</div>
//       </div>
//     `;
//   }
// }

// function formatNumber(
//   v: number,
//   sep: 'SPACE' | 'COMMA' | 'NONE',
//   skipRounding: boolean
// ): string {
//   const value =
//     skipRounding ? v : Math.abs(v) >= 1 ? Math.round(v * 100) / 100 : v;

//   if (sep === 'NONE') return String(value);
//   if (sep === 'COMMA') return new Intl.NumberFormat('en-US').format(value);
//   // SPACE (DHIS2 style)
//   return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as Highcharts from 'highcharts';
// import Exporting from 'highcharts/modules/exporting';
// import OfflineExporting from 'highcharts/modules/offline-exporting';
// import ExportData from 'highcharts/modules/export-data';

// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { DownloadFormat } from '../../shared/models/download-format.model';
// import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';

// Exporting(Highcharts);
// OfflineExporting(Highcharts);
// ExportData(Highcharts);

// type YoYSeries = { name: string; data: Array<number | null> };

// type YoYBundleData = {
//   kind?: 'YEAR_OVER_YEAR_LINE';
//   axis?: { categories?: string[] };
//   series?: YoYSeries[];
//   context?: any;
// };

// export class YearOverYearLineHighchartsVisualizer
//   extends BaseVisualizer
//   implements Visualizer
// {
//   private _chart!: Highcharts.Chart;

//   draw() {
//     const el = document.getElementById(this._id);
//     if (!el) return;

//     const bundle = (this._data ?? {}) as YoYBundleData;

//     const categories = bundle?.axis?.categories ?? [];
//     const series = bundle?.series ?? [];

//     if (!categories.length || !series.length) {
//       this.renderEmpty(
//         el,
//         'No data available',
//         'Missing categories or series.'
//       );
//       return;
//     }

//     // DHIS2-like config extraction
//     const fav: any = this._config?.config ?? this._config ?? {};

//     const title = fav.hideTitle ? '' : (fav.displayName || fav.name || '');
//     const subtitle = fav.hideSubtitle
//       ? ''
//       : (fav.displayDescription || fav.description || '');

//     const showLegend = !fav.hideLegend;
//     const showData = !!fav.showData;

//     const digitGroupSeparator = (fav.digitGroupSeparator ??
//       'SPACE') as 'SPACE' | 'COMMA' | 'NONE';

//     const skipRounding = !!fav.skipRounding;

//     // -----------------------------
//     // ✅ Presentation improvements
//     // -----------------------------

//     // Color-blind friendly palette (Okabe–Ito inspired)
//     const palette = [
//       '#0072B2', // blue
//       '#009E73', // green
//       '#D55E00', // vermillion
//       '#CC79A7', // purple
//       '#E69F00', // orange
//       '#56B4E9', // sky blue
//       '#000000', // black
//     ];

//     // Prefer showing all weeks, but keep legible in small containers.
//     const tickStep = this.getTickStep(categories.length, el);

//     // Emphasize THIS_YEAR (optional but DHIS2-feel)
//     const thisYear = new Date().getFullYear();

//     const hcSeries: any[] = series
//       .slice()
//       .sort((a, b) => Number(a.name) - Number(b.name))
//       .map((s) => {
//         const isThisYear = String(s.name) === String(thisYear);

//         return {
//           type: 'line',
//           name: s.name,
//           data: s.data.map((v) => (v == null ? null : v)),
//           marker: { enabled: false },
//           lineWidth: isThisYear ? 3 : 2,
//           zIndex: isThisYear ? 10 : 1,
//           states: { hover: { lineWidthPlus: 1 } },

//           // Show data labels in a DHIS2-friendly way:
//           // - if showData=false => off
//           // - if showData=true  => only show non-zero values to reduce noise
//           dataLabels: {
//             enabled: showData,
//             allowOverlap: false,
//             crop: true,
//             overflow: 'none',
//             style: {
//               fontSize: '10px',
//               fontWeight: '500',
//               textOutline: 'none',
//             } as any,
//             formatter: function () {
//               const y = (this as any).y as number | null;
//               if (y == null) return '';
//               if (y === 0) return ''; // ✅ reduce clutter (more readable than labeling 0 everywhere)
//               return formatNumber(y, digitGroupSeparator, skipRounding);
//             },
//           },
//         };
//       });

//     const options: Highcharts.Options = {
//       colors: palette,

//       chart: {
//         renderTo: el as any,
//         type: 'line',
//         animation: false,
//         backgroundColor: '#ffffff',
//         spacingTop: title || subtitle ? 12 : 8,
//         spacingRight: 16,
//         spacingBottom: showLegend ? 32 : 14,
//         spacingLeft: 12,
//         style: {
//           fontFamily:
//             'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
//         },
//       },

//       title: {
//         text: title || undefined,
//         align: 'center',
//         margin: 10,
//         style: {
//           fontSize: '14px',
//           fontWeight: '600',
//           color: '#212121',
//         },
//       },

//       subtitle: {
//         text: subtitle || undefined,
//         align: 'center',
//         style: {
//           fontSize: '11px',
//           color: '#616161',
//         },
//       },

//       credits: { enabled: false },
//       exporting: { enabled: true },

//       legend: {
//         enabled: showLegend,
//         align: 'center',
//         verticalAlign: 'bottom',
//         layout: 'horizontal',
//         itemStyle: {
//           fontSize: '11px',
//           fontWeight: '500',
//           color: '#424242',
//         },
//         itemMarginTop: 4,
//         itemMarginBottom: 4,
//         symbolHeight: 10,
//         symbolWidth: 16,
//       },

//       xAxis: {
//         categories,
//         tickmarkPlacement: 'on',
//         lineColor: '#e0e0e0',
//         tickColor: '#e0e0e0',
//         crosshair: { color: '#bdbdbd', width: 1 },

//         labels: {
//           // ✅ make x labels readable (DHIS2-like)
//           style: { fontSize: '10px', color: '#424242' } as any,
//           step: tickStep,
//           rotation: 0,
//           // Use -45 only on narrow screens
//           // rotation: tickStep > 2 ? -45 : 0,
//         },

//         // Keep interaction smooth
//         startOnTick: true,
//         endOnTick: true,
//       },

//       yAxis: {
//         title: { text: undefined },
//         min: 0,
//         tickAmount: 5,
//         gridLineColor: '#f2f2f2',
//         lineColor: '#e0e0e0',

//         labels: {
//           style: { fontSize: '10px', color: '#424242' } as any,
//           formatter: function () {
//             const v = (this as any).value as number;
//             return formatNumber(v, digitGroupSeparator, skipRounding);
//           },
//         },
//       },

//       tooltip: {
//         shared: true,
//         useHTML: true,
//         backgroundColor: 'rgba(255,255,255,0.96)',
//         borderColor: '#e0e0e0',
//         borderRadius: 6,
//         shadow: true,
//         padding: 10,

//         formatter: function () {
//           const x = (this as any).x;
//           const pts = ((this as any).points || []) as any[];

//           const sorted = pts.slice().sort((a, b) => {
//             const ay = Number(a.series.name);
//             const by = Number(b.series.name);
//             if (Number.isFinite(ay) && Number.isFinite(by)) return ay - by;
//             return String(a.series.name).localeCompare(String(b.series.name));
//           });

//           const rows = sorted
//             .map((p) => {
//               const val = formatNumber(
//                 p.y,
//                 digitGroupSeparator,
//                 skipRounding
//               );
//               return `
//                 <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
//                   <span style="color:${p.color};font-size:14px;">●</span>
//                   <span style="min-width:44px;color:#424242;">${p.series.name}</span>
//                   <b style="color:#212121;">${val}</b>
//                 </div>
//               `;
//             })
//             .join('');

//           return `
//             <div style="font-size:12px;">
//               <div style="margin-bottom:6px;color:#212121;"><b>${x}</b></div>
//               ${rows}
//             </div>
//           `;
//         },
//       },

//       plotOptions: {
//         series: {
//           animation: false,
//           connectNulls: false,
//           marker: { enabled: false },
//           lineWidth: 2,
//           states: {
//             hover: { lineWidth: 3 },
//           },
//         },
//       },

//       series: hcSeries as any,

//       // ✅ Responsive label density + legend size
//       responsive: {
//         rules: [
//           {
//             condition: { maxWidth: 720 },
//             chartOptions: {
//               xAxis: {
//                 labels: {
//                   step: Math.max(2, tickStep),
//                   rotation: 0,
//                 },
//               },
//               legend: {
//                 itemStyle: { fontSize: '10px' } as any,
//               },
//             },
//           },
//           {
//             condition: { maxWidth: 480 },
//             chartOptions: {
//               xAxis: {
//                 labels: {
//                   step: Math.max(3, tickStep),
//                   rotation: -45,
//                 },
//               },
//             },
//           },
//         ],
//       },
//     };

//     // Render like ChartVisualizer
//     setTimeout(() => {
//       this.dispose();
//       this._chart = Highcharts.chart(options);
//     }, 20);
//   }

//   override dispose() {
//     if (this._chart) this._chart.destroy();
//   }

//   override download(downloadFormat: DownloadFormat) {
//     const fav: any = this._config?.config ?? this._config ?? {};
//     const filename = fav.title || fav.displayName || fav.name || 'yoy-line';

//     switch (downloadFormat) {
//       case 'PNG':
//         this._chart.exportChart({ filename, type: 'image/png' }, {});
//         break;
//       case 'CSV':
//         new VisualizationDownloader()
//           .setFilename(filename)
//           .setCSV(this._chart.getCSV())
//           .download();
//         break;
//     }
//   }

//   private renderEmpty(el: HTMLElement, title: string, subtitle?: string) {
//     el.innerHTML = `
//       <div style="padding:12px;color:#757575;font-size:12px">
//         <div style="font-weight:600;margin-bottom:6px">${title}</div>
//         <div style="font-size:11px;color:#9e9e9e">${subtitle ?? ''}</div>
//       </div>
//     `;
//   }

//   /**
//    * Decide how many labels to show on X axis without losing DHIS2 meaning.
//    * - If container is wide, keep step=1 (show all weeks)
//    * - If narrow, step up progressively
//    */
//   private getTickStep(categoryCount: number, el: HTMLElement): number {
//     const w = el.clientWidth || 900;

//     // Target ~40px per label at most (weeks are short labels, but 52 labels need space)
//     const approxMaxLabels = Math.max(8, Math.floor(w / 40));

//     if (categoryCount <= approxMaxLabels) return 1;

//     // Step so that labels <= approxMaxLabels
//     return Math.ceil(categoryCount / approxMaxLabels);
//   }
// }

// function formatNumber(
//   v: number,
//   sep: 'SPACE' | 'COMMA' | 'NONE',
//   skipRounding: boolean
// ): string {
//   const value =
//     skipRounding ? v : Math.abs(v) >= 1 ? Math.round(v * 100) / 100 : v;

//   if (sep === 'NONE') return String(value);
//   if (sep === 'COMMA') return new Intl.NumberFormat('en-US').format(value);
//   // SPACE (DHIS2 style)
//   return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// }

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as Highcharts from 'highcharts';
// import Exporting from 'highcharts/modules/exporting';
// import OfflineExporting from 'highcharts/modules/offline-exporting';
// import ExportData from 'highcharts/modules/export-data';

// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { DownloadFormat } from '../../shared/models/download-format.model';
// import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';

// Exporting(Highcharts);
// OfflineExporting(Highcharts);
// ExportData(Highcharts);

// type YoYSeries = { name: string; data: Array<number | null> };

// type YoYBundleData = {
//   kind?: 'YEAR_OVER_YEAR_LINE';
//   axis?: { categories?: string[] };
//   series?: YoYSeries[];
//   context?: any;

//   // optional: if you pass these later, we’ll use them
//   labels?: {
//     dxName?: string; // indicator / data name
//     ouName?: string; // org unit name
//   };
// };

// export class YearOverYearLineHighchartsVisualizer
//   extends BaseVisualizer
//   implements Visualizer
// {
//   private _chart!: Highcharts.Chart;

//   draw() {
//     const el = document.getElementById(this._id);
//     if (!el) return;

//     const bundle = (this._data ?? {}) as YoYBundleData;

//     const categories = bundle?.axis?.categories ?? [];
//     const series = (bundle?.series ?? [])
//       .slice()
//       .sort((a, b) => Number(a.name) - Number(b.name)); // DHIS2 order

//     if (!categories.length || !series.length) {
//       this.renderEmpty(el, 'No data available', 'Missing categories or series.');
//       return;
//     }

//     const fav: any = this._config?.config ?? this._config ?? {};

//     const showLegend = !fav.hideLegend;
//     const showData = !!fav.showData;

//     const digitGroupSeparator = (fav.digitGroupSeparator ??
//       'SPACE') as 'SPACE' | 'COMMA' | 'NONE';
//     const skipRounding = !!fav.skipRounding;

//     // ----------------------------
//     // ✅ DHIS2-like title/subtitle
//     // ----------------------------

//     // Title: ONLY visualization name (not ou/dx)
//     const titleText = fav.hideTitle
//       ? ''
//       : (fav.displayName || fav.name || '').toString();

//     // Subtitle: "OU - DX" (DHIS2 Year-over-year line behavior)
//     // Prefer passed labels, else fall back to config text
//     const dxFromConfig = this.pickDxNameFromFavorite(fav);
//     const ouFromConfig = this.pickOuNameFromFavorite(fav);

//     const ouName =
//       bundle?.labels?.ouName || ouFromConfig || 'Organisation unit';
//     const dxName =
//       bundle?.labels?.dxName || dxFromConfig || 'Data';

//     const subtitleText = fav.hideSubtitle ? '' : `${ouName} - ${dxName}`;

//     // ----------------------------
//     // ✅ Categories formatting
//     // ----------------------------
//     // Your categories are like ["W8","W9",...,"W52","W1"...]
//     // Ensure consistent "W##" formatting for readability
//     const normalizedCategories = categories.map((c) => this.normalizeWeek(c));

//     // ----------------------------
//     // ✅ Colors: close to DHIS2 vibe
//     // (not perfect, but calm + readable)
//     // ----------------------------
//     const palette = [
//       '#8BC34A', // current year green-ish
//       '#1976D2', // blue
//       '#EF6C00', // orange
//       '#7E57C2', // purple
//       '#00897B', // teal
//       '#C2185B', // pink
//       '#455A64', // blue-grey
//     ];

//     // Make THIS_YEAR appear first and prominent (DHIS2 tends to make it obvious)
//     const thisYear = new Date().getFullYear();
//     const sortedSeries = series.slice().sort((a, b) => {
//       if (String(a.name) === String(thisYear)) return -1;
//       if (String(b.name) === String(thisYear)) return 1;
//       return Number(b.name) - Number(a.name); // then descending like legend often appears
//     });

//     const hcSeries: any[] = sortedSeries.map(
//       (s, idx) => {
//         const isThisYear = String(s.name) === String(thisYear);

//         return {
//           type: 'line',
//           name: s.name,
//           data: s.data.map((v) => (v == null ? null : v)),
//           color: palette[idx % palette.length],

//           marker: { enabled: false },
//           lineWidth: isThisYear ? 2.5 : 1.7,
//           zIndex: isThisYear ? 10 : 1,

//           // Only show non-zero labels (reduces clutter, matches DHIS2 feel)
//           dataLabels: {
//             enabled: showData,
//             allowOverlap: false,
//             crop: true,
//             overflow: 'none',
//             style: {
//               fontSize: '10px',
//               fontWeight: '600',
//               color: '#212121',
//               textOutline: 'none',
//             } as any,
//             formatter: function () {
//               const y = (this as any).y as number | null;
//               if (y == null || y === 0) return '';
//               return formatNumber(y, digitGroupSeparator, skipRounding);
//             },
//           },
//         };
//       }
//     );

//     // Tick step: show more ticks like DHIS2, but keep readable
//     // In your screenshot, DHIS2 shows almost all labels, rotated ~45°
//     const tickStep = this.getTickStepForDHIS2Like(normalizedCategories.length);

//     const options: Highcharts.Options = {
//       colors: palette,

//       chart: {
//         renderTo: el as any,
//         type: 'line',
//         animation: false,
//         backgroundColor: '#ffffff',

//         // DHIS2 card-like spacing
//         spacingTop: 8,
//         spacingRight: 10,
//         spacingLeft: 10,
//         spacingBottom: showLegend ? 18 : 10,

//         style: {
//           fontFamily:
//             'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
//         },
//       },

//       title: {
//         text: titleText || undefined,
//         align: 'left', // ✅ DHIS2 card title is left-aligned
//         margin: 6,
//         style: {
//           fontSize: '12px',
//           fontWeight: '600',
//           color: '#263238',
//         },
//       },

//       subtitle: {
//         text: subtitleText || undefined,
//         align: 'center', // ✅ subtitle centered like DHIS2
//         y: 28,
//         style: {
//           fontSize: '11px',
//           fontWeight: '500',
//           color: '#37474F',
//         },
//       },

//       credits: { enabled: false },
//       exporting: { enabled: true },

//       legend: {
//         enabled: showLegend,
//         align: 'center',
//         verticalAlign: 'bottom',
//         layout: 'horizontal',
//         itemStyle: {
//           fontSize: '10px',
//           fontWeight: '500',
//           color: '#455A64',
//         },
//         itemMarginTop: 2,
//         itemMarginBottom: 2,
//         symbolHeight: 10,
//         symbolWidth: 18,
//       },

//       xAxis: {
//         categories: normalizedCategories,
//         tickmarkPlacement: 'on',
//         lineColor: '#E0E0E0',
//         tickColor: '#E0E0E0',

//         labels: {
//           step: tickStep,
//           rotation: -45, // ✅ DHIS2-like
//           style: {
//             fontSize: '9px',
//             color: '#546E7A',
//           } as any,
//         },

//         // DHIS2 has very light grid or none on x
//         gridLineWidth: 0,
//       },

//       yAxis: {
//         title: { text: undefined },
//         min: 0,
//         tickAmount: 6,
//         gridLineColor: '#F3F5F7',
//         lineColor: '#E0E0E0',
//         labels: {
//           style: {
//             fontSize: '9px',
//             color: '#546E7A',
//           } as any,
//           formatter: function () {
//             const v = (this as any).value as number;
//             return formatNumber(v, digitGroupSeparator, skipRounding);
//           },
//         },
//       },

//       tooltip: {
//         shared: true,
//         useHTML: true,
//         backgroundColor: 'rgba(255,255,255,0.98)',
//         borderColor: '#E0E0E0',
//         borderRadius: 4,
//         shadow: true,
//         padding: 8,

//         formatter: function () {
//           const x = (this as any).x;
//           const pts = ((this as any).points || []) as any[];

//           const rows = pts
//             .slice()
//             .sort((a, b) => Number(b.series.name) - Number(a.series.name))
//             .map((p) => {
//               const val = formatNumber(
//                 p.y,
//                 digitGroupSeparator,
//                 skipRounding
//               );
//               return `
//                 <div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
//                   <span style="color:${p.color};font-size:14px;line-height:0;">●</span>
//                   <span style="min-width:40px;color:#37474F;">${p.series.name}</span>
//                   <b style="color:#111827;">${val}</b>
//                 </div>
//               `;
//             })
//             .join('');

//           return `
//             <div style="font-size:12px;">
//               <div style="margin-bottom:6px;color:#111827;"><b>${x}</b></div>
//               ${rows}
//             </div>
//           `;
//         },
//       },

//       plotOptions: {
//         series: {
//           animation: false,
//           connectNulls: false,
//           marker: { enabled: false },
//           states: { hover: { lineWidth: 2.8 } },
//         },
//       },

//       series: hcSeries as any,

//       responsive: {
//         rules: [
//           {
//             condition: { maxWidth: 520 },
//             chartOptions: {
//               xAxis: {
//                 labels: {
//                   step: Math.max(2, tickStep),
//                   rotation: -60,
//                   style: { fontSize: '8px' } as any,
//                 },
//               },
//               legend: {
//                 itemStyle: { fontSize: '9px' } as any,
//               },
//             },
//           },
//         ],
//       },
//     };

//     setTimeout(() => {
//       this.dispose();
//       this._chart = Highcharts.chart(options);
//     }, 20);
//   }

//   override dispose() {
//     if (this._chart) this._chart.destroy();
//   }

//   override download(downloadFormat: DownloadFormat) {
//     const fav: any = this._config?.config ?? this._config ?? {};
//     const filename = fav.title || fav.displayName || fav.name || 'yoy-line';

//     switch (downloadFormat) {
//       case 'PNG':
//         this._chart.exportChart({ filename, type: 'image/png' }, {});
//         break;
//       case 'CSV':
//         new VisualizationDownloader()
//           .setFilename(filename)
//           .setCSV(this._chart.getCSV())
//           .download();
//         break;
//     }
//   }

//   private renderEmpty(el: HTMLElement, title: string, subtitle?: string) {
//     el.innerHTML = `
//       <div style="padding:12px;color:#757575;font-size:12px">
//         <div style="font-weight:600;margin-bottom:6px">${title}</div>
//         <div style="font-size:11px;color:#9e9e9e">${subtitle ?? ''}</div>
//       </div>
//     `;
//   }

//   // ----------------------------------
//   // Helpers: label extraction + weeks
//   // ----------------------------------

//   private pickDxNameFromFavorite(fav: any): string {
//     const dx = (fav?.filters || []).find((f: any) => f?.dimension === 'dx')
//       ?.items?.[0];
//     return (
//       dx?.displayName ||
//       dx?.name ||
//       (typeof dx?.id === 'string' ? dx.id : '') ||
//       ''
//     );
//   }

//   private pickOuNameFromFavorite(fav: any): string {
//     const ou = (fav?.filters || []).find((f: any) => f?.dimension === 'ou')
//       ?.items?.[0];
//     // USER_ORGUNIT should not appear in subtitle; DHIS2 resolves to actual name (e.g., Zanzibar)
//     if (ou?.id === 'USER_ORGUNIT') return 'Zanzibar'; // or leave empty and let caller pass bundle.labels.ouName
//     return (
//       ou?.displayName ||
//       ou?.name ||
//       (typeof ou?.id === 'string' ? ou.id : '') ||
//       ''
//     );
//   }

//   private normalizeWeek(label: string): string {
//     // Accept "W8", "W08", "W8 2023" -> "W8"
//     if (!label) return label;

//     const m1 = /^W(\d{1,2})$/i.exec(label.trim());
//     if (m1) return `W${Number(m1[1])}`;

//     const m2 = /^W(\d{1,2})\s+\d{4}$/i.exec(label.trim());
//     if (m2) return `W${Number(m2[1])}`;

//     const m3 = /^\d{4}W(\d{1,2})$/i.exec(label.trim());
//     if (m3) return `W${Number(m3[1])}`;

//     return label;
//   }

//   private getTickStepForDHIS2Like(categoryCount: number): number {
//     // DHIS2 shows a LOT of ticks; we only reduce if too dense.
//     if (categoryCount <= 30) return 1;
//     if (categoryCount <= 52) return 1; // still show all, but rotated small font
//     return 2;
//   }
// }

// function formatNumber(
//   v: number,
//   sep: 'SPACE' | 'COMMA' | 'NONE',
//   skipRounding: boolean
// ): string {
//   const value =
//     skipRounding ? v : Math.abs(v) >= 1 ? Math.round(v * 100) / 100 : v;

//   if (sep === 'NONE') return String(value);
//   if (sep === 'COMMA') return new Intl.NumberFormat('en-US').format(value);
//   return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// }

import * as Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import ExportData from 'highcharts/modules/export-data';

import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { DownloadFormat } from '../../shared/models/download-format.model';
import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';

Exporting(Highcharts);
OfflineExporting(Highcharts);
ExportData(Highcharts);

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
  private _chart!: Highcharts.Chart;
  private _loaderEl?: HTMLElement;

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

    setTimeout(() => {
      this.dispose();
      this._chart = Highcharts.chart(options);
      // chart load event hides loader
    }, 20);
  }

  override dispose() {
    if (this._chart) this._chart.destroy();
    this.hideLoader();
  }

  override download(downloadFormat: DownloadFormat) {
    const fav: any = this._config?.config ?? this._config ?? {};
    const filename = fav.title || fav.displayName || fav.name || 'yoy-line';

    switch (downloadFormat) {
      case 'PNG':
        this._chart.exportChart({ filename, type: 'image/png' }, {});
        break;
      case 'CSV':
        new VisualizationDownloader()
          .setFilename(filename)
          .setCSV(this._chart.getCSV())
          .download();
        break;
    }
  }

  private renderEmpty(el: HTMLElement, title: string, subtitle?: string) {
    el.innerHTML = `
      <div style="padding:12px;color:#6B7280;font-size:12px">
        <div style="font-weight:600;margin-bottom:6px;color:#111827">${title}</div>
        <div style="font-size:11px;color:#9CA3AF">${subtitle ?? ''}</div>
      </div>
    `;
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

    // const text = document.createElement('div');
    // text.textContent = message;

    card.appendChild(spinner);
    // card.appendChild(text);
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
    this._loaderEl = wrap;
  }

  private hideLoader() {
    if (this._loaderEl?.parentElement) {
      this._loaderEl.parentElement.removeChild(this._loaderEl);
    }
    this._loaderEl = undefined;
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
