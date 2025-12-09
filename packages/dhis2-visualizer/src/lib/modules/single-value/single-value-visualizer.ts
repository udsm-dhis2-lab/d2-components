// import { find } from 'lodash';
// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { VisualizerUtil } from '../../shared/utilities/visualizer.utilities';

// export class SingleValueVisualizer
//   extends BaseVisualizer
//   implements Visualizer
// {
//   draw() {
//     const valueIndex = this._data.headers.indexOf(
//       find(this._data.headers, ['name', 'value'])
//     );

//     const filterLabel = VisualizerUtil.getDimensionNames(
//       ['pe', 'ou'],
//       this._data.metaData
//     ).join(' - ');

//     const dataLabel =
//       this._data?.metaData?.names && this._data.metaData?.dx
//         ? this._data?.metaData?.names[this._data.metaData?.dx[0]] ?? ''
//         : '';

//     const value: number = (this._data?.rows || []).reduce(
//       (valueSum: number, row: string[]) => {
//         return valueSum + parseFloat(row[valueIndex] ?? '0');
//       },
//       0
//     );

//     const renderingElement = document.getElementById(this._id);

//     if (renderingElement) {
//       renderingElement.replaceChildren();

//       const svgNamespace = 'http://www.w3.org/2000/svg';
//       const svg = document.createElementNS(svgNamespace, 'svg');
//       svg.setAttribute('width', '100%');
//       svg.setAttribute('height', '100%');
//       svg.setAttribute('viewBox', '0 0 200 100');

//       const rootFontSize =
//         parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
//       const rem = (px: number) => `${(px / rootFontSize).toFixed(2)}rem`;

//       const titleFontSizePx = 12;
//       const filterFontSizePx = 8;
//       const valueFontSizePx = 32;

//       const titleFontSize = rem(titleFontSizePx);
//       const filterFontSize = rem(filterFontSizePx);
//       const valueFontSize = rem(valueFontSizePx);

//       const renderingWidth =
//         renderingElement.getBoundingClientRect().width - 12;
//       const charWidth = 12 * 0.6;
//       const maxCharsPerLine = Math.floor(renderingWidth / charWidth);

//       const textGroup = document.createElementNS(svgNamespace, 'g');

//       // Centering the text
//       textGroup.setAttribute('transform', 'translate(100, 50)');

//       // Data Label
//       const titleText = document.createElementNS(svgNamespace, 'text');
//       titleText.setAttribute('y', '-20');
//       titleText.setAttribute('text-anchor', 'middle');
//       titleText.setAttribute('font-size', `${titleFontSize}`);
//       titleText.setAttribute('fill', '#666');

//       const wrappedTitle = this.wrapText(dataLabel, maxCharsPerLine);
//       wrappedTitle.forEach((line, index) => {
//         const tspan = document.createElementNS(svgNamespace, 'tspan');
//         tspan.setAttribute('x', '0');
//         tspan.setAttribute('dy', index === 0 ? '0' : '1.2em');
//         tspan.textContent = line;
//         titleText.appendChild(tspan);
//       });

//       const titleHeight = wrappedTitle.length * titleFontSizePx;

//       // Filter Label
//       const filterText = document.createElementNS(svgNamespace, 'text');
//       filterText.setAttribute('y', `${titleHeight - 16}`);
//       filterText.setAttribute('text-anchor', 'middle');
//       filterText.setAttribute('font-size', `${filterFontSize}`);
//       filterText.setAttribute('fill', '#666');

//       const wrappedFilter = this.wrapText(filterLabel, maxCharsPerLine);
//       wrappedFilter.forEach((line, index) => {
//         const tspan = document.createElementNS(svgNamespace, 'tspan');
//         tspan.setAttribute('x', '0');
//         tspan.setAttribute('dy', index === 0 ? '0' : '1.2em');
//         tspan.textContent = line;
//         filterText.appendChild(tspan);
//       });

//       const filterHeight = wrappedFilter.length * filterFontSizePx;
//       // Value Text
//       const valueText = document.createElementNS(svgNamespace, 'text');
//       valueText.setAttribute('y', `${titleHeight + filterHeight + 10}`);
//       valueText.setAttribute('text-anchor', 'middle');
//       valueText.setAttribute('font-size', valueFontSize);
//       valueText.setAttribute('font-weight', '300');
//       valueText.textContent = VisualizerUtil.toSpaceSeparated(value);

//       // Append texts to the group
//       textGroup.appendChild(titleText);
//       textGroup.appendChild(filterText);
//       textGroup.appendChild(valueText);

//       // Append the group to the SVG
//       svg.appendChild(textGroup);

//       // Append the SVG to the rendering element
//       renderingElement.appendChild(svg);
//     }
//   }

//   wrapText(text: string, maxChars: number): string[] {
//     const words = text.split(' ');
//     const lines: string[] = [];
//     let currentLine = '';

//     words.forEach((word) => {
//       if ((currentLine + word).length <= maxChars) {
//         currentLine += `${word} `;
//       } else {
//         lines.push(currentLine.trim());
//         currentLine = `${word} `;
//       }
//     });

//     if (currentLine) {
//       lines.push(currentLine.trim());
//     }

//     return lines;
//   }
// }

// import { find, isFinite as isFiniteNumber } from 'lodash';
// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { VisualizerUtil } from '../../shared/utilities/visualizer.utilities';

// export class SingleValueVisualizer
//   extends BaseVisualizer
//   implements Visualizer
// {
//   draw() {
//     const renderingElement = document.getElementById(this._id);

//     if (!renderingElement || !this._data) {
//       return;
//     }

//     const valueIndex = this.getValueIndex();

//     if (valueIndex === -1) {
//       this.renderMessage(
//         renderingElement,
//         'Value column not found',
//         'Please verify that the response contains a header named "value".'
//       );
//       return;
//     }

//     const rawFilterLabel = VisualizerUtil.getDimensionNames(
//       ['pe', 'ou'],
//       this._data.metaData
//     ).join(' - ');

//     const rawDataLabel =
//       this._data?.metaData?.names && this._data.metaData?.dx
//         ? this._data?.metaData?.names[this._data.metaData?.dx[0]] ?? ''
//         : '';

//     // Small prettification: replace underscores with spaces
//     const dataLabel = rawDataLabel ? rawDataLabel.replace(/_/g, ' ') : '';
//     const filterLabel = rawFilterLabel;

//     const totalValue = this.getTotalValue(valueIndex);

//     if (!Number.isFinite(totalValue)) {
//       this.renderMessage(
//         renderingElement,
//         dataLabel || 'No data available',
//         filterLabel || 'No matching data for the selected filters.'
//       );
//       return;
//     }

//     // Clear container
//     renderingElement.replaceChildren();

//     const svgNamespace = 'http://www.w3.org/2000/svg';
//     const svg = document.createElementNS(svgNamespace, 'svg');

//     const viewBoxWidth = 220;
//     const viewBoxHeight = 120;

//     // Inner padding (in viewBox units)
//     const horizontalPadding = 36;
//     const paddingTop = 28; // ⬅️ strong top padding
//     const paddingBottom = 20; // ⬅️ bottom padding

//     svg.setAttribute('width', '100%');
//     svg.setAttribute('height', '100%');
//     svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

//     // Accessibility
//     const ariaLabelParts = [
//       dataLabel || 'Single value indicator',
//       `Value: ${VisualizerUtil.toSpaceSeparated(totalValue)}`,
//       filterLabel ? `Filters: ${filterLabel}` : '',
//     ].filter(Boolean);
//     const ariaLabel = ariaLabelParts.join('. ');

//     svg.setAttribute('role', 'img');
//     svg.setAttribute('aria-label', ariaLabel);

//     const titleNode = document.createElementNS(svgNamespace, 'title');
//     titleNode.textContent = dataLabel || 'Single value indicator';
//     svg.appendChild(titleNode);

//     const descNode = document.createElementNS(svgNamespace, 'desc');
//     descNode.textContent = ariaLabel;
//     svg.appendChild(descNode);

//     // Text group: we only center horizontally; y is absolute from top
//     const centerX = viewBoxWidth / 2;
//     const textGroup = document.createElementNS(svgNamespace, 'g');
//     textGroup.setAttribute('transform', `translate(${centerX}, 0)`);

//     // Typography (SVG units)
//     const titleFontSize = 11;
//     const filterFontSize = 8;
//     const valueFontSize = 34;
//     const lineHeightMultiplier = 1.25;

//     // Wrapping: compute available pixel width inside outer card
//     const renderingRect = renderingElement.getBoundingClientRect();
//     const innerPixelWidth = Math.max(
//       0,
//       renderingRect.width - horizontalPadding * 2
//     );
//     const approxCharWidthPx = 7;
//     const maxCharsPerLine =
//       innerPixelWidth > 0
//         ? Math.max(10, Math.floor(innerPixelWidth / approxCharWidthPx))
//         : 30;

//     let currentY = paddingTop;

//     // --- TITLE (bold, dark) ---
//     const wrappedTitle = this.wrapText(dataLabel || '', maxCharsPerLine);
//     const titleText = this.createTextElement(svgNamespace, {
//       y: currentY,
//       fontSize: titleFontSize,
//       fill: '#424242',
//       anchor: 'middle',
//       fontWeight: '600',
//     });

//     this.appendWrappedText(
//       svgNamespace,
//       titleText,
//       wrappedTitle,
//       lineHeightMultiplier
//     );

//     const titleHeight =
//       wrappedTitle.length * titleFontSize * lineHeightMultiplier;
//     currentY += titleHeight + 6; // spacing after title

//     // --- FILTER (smaller, lighter) ---
//     const wrappedFilter = this.wrapText(filterLabel || '', maxCharsPerLine);
//     const filterText = this.createTextElement(svgNamespace, {
//       y: currentY,
//       fontSize: filterFontSize,
//       fill: '#9e9e9e',
//       anchor: 'middle',
//     });

//     this.appendWrappedText(
//       svgNamespace,
//       filterText,
//       wrappedFilter,
//       lineHeightMultiplier
//     );

//     const filterHeight =
//       wrappedFilter.length * filterFontSize * lineHeightMultiplier;
//     currentY += filterHeight + 14; // spacing before value

//     // --- VALUE (primary blue, bold, clamped from bottom) ---
//     const maxValueTop = viewBoxHeight - paddingBottom - valueFontSize; // avoid bottom edge
//     const valueY = Math.min(currentY, maxValueTop);

//     const valueText = this.createTextElement(svgNamespace, {
//       y: valueY,
//       fontSize: valueFontSize,
//       fill: '#1976d2',
//       anchor: 'middle',
//       fontWeight: '700',
//     });

//     valueText.textContent = this.formatValue(totalValue);

//     // Append
//     textGroup.appendChild(titleText);
//     if (filterLabel) {
//       textGroup.appendChild(filterText);
//     }
//     textGroup.appendChild(valueText);

//     svg.appendChild(textGroup);
//     renderingElement.appendChild(svg);
//   }

//   /**
//    * Safely resolve the index of the "value" column.
//    */
//   private getValueIndex(): number {
//     const headers = this._data?.headers || [];
//     const header = find(headers, ['name', 'value']);
//     return header ? headers.indexOf(header) : -1;
//   }

//   /**
//    * Sum all numeric values from the specified valueIndex.
//    */
//   private getTotalValue(valueIndex: number): number {
//     if (!this._data?.rows || valueIndex < 0) {
//       return NaN;
//     }

//     return this._data.rows.reduce((sum: number, row: string[]) => {
//       const raw = row[valueIndex];
//       const parsed = raw != null ? parseFloat(raw) : NaN;
//       return isFiniteNumber(parsed) ? sum + parsed : sum;
//     }, 0);
//   }

//   /**
//    * Render a simple message when we cannot show a numeric value.
//    */
//   private renderMessage(
//     renderingElement: HTMLElement,
//     title: string,
//     subtitle?: string
//   ) {
//     renderingElement.replaceChildren();

//     const svgNamespace = 'http://www.w3.org/2000/svg';
//     const svg = document.createElementNS(svgNamespace, 'svg');
//     svg.setAttribute('width', '100%');
//     svg.setAttribute('height', '100%');
//     svg.setAttribute('viewBox', '0 0 220 120');

//     const centerX = 110;
//     const centerY = 60;

//     const titleText = document.createElementNS(svgNamespace, 'text');
//     titleText.setAttribute('x', String(centerX));
//     titleText.setAttribute('y', String(centerY - 4));
//     titleText.setAttribute('text-anchor', 'middle');
//     titleText.setAttribute('font-size', '12');
//     titleText.setAttribute('fill', '#757575');
//     titleText.textContent = title;

//     svg.appendChild(titleText);

//     if (subtitle) {
//       const subText = document.createElementNS(svgNamespace, 'text');
//       subText.setAttribute('x', String(centerX));
//       subText.setAttribute('y', String(centerY + 14));
//       subText.setAttribute('text-anchor', 'middle');
//       subText.setAttribute('font-size', '9');
//       subText.setAttribute('fill', '#bdbdbd');
//       subText.textContent = subtitle;
//       svg.appendChild(subText);
//     }

//     renderingElement.appendChild(svg);
//   }

//   // /**
//   //  * Utility for consistent text element creation.
//   //  */
//   // private createTextElement(
//   //   svgNamespace: string,
//   //   options: {
//   //     y: number;
//   //     fontSize: number;
//   //     fill: string;
//   //     anchor?: 'start' | 'middle' | 'end';
//   //     fontWeight?: string;
//   //   }
//   // ): SVGTextElement {
//   //   const text = document.createElementNS(svgNamespace, 'text');
//   //   text.setAttribute('x', '0');
//   //   text.setAttribute('y', String(options.y));
//   //   text.setAttribute('text-anchor', options.anchor ?? 'start');
//   //   text.setAttribute('font-size', String(options.fontSize));
//   //   text.setAttribute('fill', options.fill);

//   //   if (options.fontWeight) {
//   //     text.setAttribute('font-weight', options.fontWeight);
//   //   }

//   //   return text;
//   // }

//   private createTextElement(
//     svgNamespace: string,
//     options: {
//       y: number;
//       fontSize: number;
//       fill: string;
//       anchor?: 'start' | 'middle' | 'end';
//       fontWeight?: string;
//     }
//   ): SVGTextElement {
//     const text = document.createElementNS(
//       svgNamespace,
//       'text'
//     ) as SVGTextElement;

//     text.setAttribute('x', '0');
//     text.setAttribute('y', String(options.y));
//     text.setAttribute('text-anchor', options.anchor ?? 'start');
//     text.setAttribute('font-size', String(options.fontSize));
//     text.setAttribute('fill', options.fill);
//     text.setAttribute('dominant-baseline', 'hanging'); // y = top of the text box

//     if (options.fontWeight) {
//       text.setAttribute('font-weight', options.fontWeight);
//     }

//     return text;
//   }

//   /**
//    * Append multiple lines of text as tspans.
//    */
//   private appendWrappedText(
//     svgNamespace: string,
//     textNode: SVGTextElement,
//     lines: string[],
//     lineHeightMultiplier: number
//   ) {
//     lines.forEach((line, index) => {
//       const tspan = document.createElementNS(svgNamespace, 'tspan');
//       tspan.setAttribute('x', '0');
//       tspan.setAttribute('dy', index === 0 ? '0' : `${lineHeightMultiplier}em`);
//       tspan.textContent = line;
//       textNode.appendChild(tspan);
//     });
//   }

//   /**
//    * Simple number formatting: space-separated groups and no insane decimals.
//    */
//   private formatValue(value: number): string {
//     // You can plug in locale or a more advanced formatter here if needed
//     const rounded =
//       Math.abs(value) >= 1
//         ? Math.round(value * 100) / 100 // 2 decimal places max
//         : value;

//     return VisualizerUtil.toSpaceSeparated(rounded);
//   }

//   wrapText(text: string, maxChars: number): string[] {
//     if (!text || maxChars <= 0) {
//       return text ? [text] : [];
//     }

//     const words = text.split(/\s+/);
//     const lines: string[] = [];
//     let currentLine = '';

//     words.forEach((word) => {
//       const candidate = currentLine ? `${currentLine} ${word}` : word;
//       if (candidate.length <= maxChars) {
//         currentLine = candidate;
//       } else {
//         if (currentLine) {
//           lines.push(currentLine);
//         }
//         currentLine = word;
//       }
//     });

//     if (currentLine) {
//       lines.push(currentLine);
//     }

//     return lines;
//   }
// }

import { find, isFinite as isFiniteNumber } from 'lodash';
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { VisualizerUtil } from '../../shared/utilities/visualizer.utilities';

export class SingleValueVisualizer
  extends BaseVisualizer
  implements Visualizer
{
  draw() {
    const renderingElement = document.getElementById(this._id);

    if (!renderingElement || !this._data) {
      return;
    }

    const valueIndex = this.getValueIndex();

    if (valueIndex === -1) {
      this.renderMessage(
        renderingElement,
        'Value column not found',
        'Please verify that the response contains a header named "value".'
      );
      return;
    }

    const rawFilterLabel = VisualizerUtil.getDimensionNames(
      ['pe', 'ou'],
      this._data.metaData
    ).join(' - ');

    const rawDataLabel =
      this._data?.metaData?.names && this._data.metaData?.dx
        ? this._data?.metaData?.names[this._data.metaData?.dx[0]] ?? ''
        : '';

    const dataLabel = rawDataLabel ? rawDataLabel.replace(/_/g, ' ') : '';
    const filterLabel = rawFilterLabel;

    const totalValue = this.getTotalValue(valueIndex);

    if (!Number.isFinite(totalValue)) {
      this.renderMessage(
        renderingElement,
        dataLabel || 'No data available',
        filterLabel || 'No matching data for the selected filters.'
      );
      return;
    }

    renderingElement.replaceChildren();

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');

    const viewBoxWidth = 220;
    const viewBoxHeight = 120;

    const horizontalPadding = 32;
    const paddingTop = 16;
    const paddingBottom = 16;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    const ariaLabelParts = [
      dataLabel || 'Single value indicator',
      `Value: ${VisualizerUtil.toSpaceSeparated(totalValue)}`,
      filterLabel ? `Filters: ${filterLabel}` : '',
    ].filter(Boolean);
    const ariaLabel = ariaLabelParts.join('. ');

    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', ariaLabel);

    const titleNode = document.createElementNS(svgNamespace, 'title');
    titleNode.textContent = dataLabel || 'Single value indicator';
    svg.appendChild(titleNode);

    const descNode = document.createElementNS(svgNamespace, 'desc');
    descNode.textContent = ariaLabel;
    svg.appendChild(descNode);

    const centerX = viewBoxWidth / 2;
    const textGroup = document.createElementNS(svgNamespace, 'g');

    const titleFontSize = 11;
    const filterFontSize = 8;
    const valueFontSize = 30;
    const lineHeightMultiplier = 1.3;

    const innerWidth = viewBoxWidth - horizontalPadding * 2;
    const approxCharWidth = 5;
    const maxCharsPerLine = Math.max(
      10,
      Math.floor(innerWidth / approxCharWidth)
    );

    const wrappedTitle = this.wrapText(dataLabel || '', maxCharsPerLine, 2);
    const wrappedFilter = this.wrapText(filterLabel || '', maxCharsPerLine, 2);

    const titleLineCount = wrappedTitle.length || 1;
    const filterLineCount = wrappedFilter.length || 0;

    const titleHeight = titleLineCount * titleFontSize * lineHeightMultiplier;
    const filterHeight =
      filterLineCount * filterFontSize * lineHeightMultiplier;

    const spacingTitleToFilter = filterLineCount > 0 ? 4 : 0;
    const spacingFilterToValue = 8;

    const totalContentHeight =
      titleHeight +
      spacingTitleToFilter +
      filterHeight +
      spacingFilterToValue +
      valueFontSize;

    let startY = (viewBoxHeight - totalContentHeight) / 2;

    if (startY < paddingTop) {
      startY = paddingTop;
    }
    if (startY + totalContentHeight > viewBoxHeight - paddingBottom) {
      startY = viewBoxHeight - paddingBottom - totalContentHeight;
    }

    textGroup.setAttribute('transform', `translate(${centerX}, ${startY})`);

    let currentY = 0;

    const titleText = this.createTextElement(svgNamespace, {
      y: currentY,
      fontSize: titleFontSize,
      fill: '#424242',
      anchor: 'middle',
      fontWeight: '600',
    });

    titleText.setAttribute('fill-opacity', '0.85');

    this.appendWrappedText(
      svgNamespace,
      titleText,
      wrappedTitle,
      lineHeightMultiplier
    );

    currentY += titleHeight + spacingTitleToFilter;

    let filterText: SVGTextElement | undefined;
    if (filterLineCount > 0) {
      filterText = this.createTextElement(svgNamespace, {
        y: currentY,
        fontSize: filterFontSize,
        fill: '#9e9e9e',
        anchor: 'middle',
        fontWeight: '500',
      });

      this.appendWrappedText(
        svgNamespace,
        filterText,
        wrappedFilter,
        lineHeightMultiplier
      );

      currentY += filterHeight + spacingFilterToValue;
    } else {
      currentY += spacingFilterToValue;
    }

    const valueText = this.createTextElement(svgNamespace, {
      y: currentY,
      fontSize: valueFontSize,
      fill: '#1976d2',
      anchor: 'middle',
      fontWeight: '700',
    });

    valueText.textContent = this.formatValue(totalValue);

    textGroup.appendChild(titleText);
    if (filterText) {
      textGroup.appendChild(filterText);
    }
    textGroup.appendChild(valueText);

    svg.appendChild(textGroup);
    renderingElement.appendChild(svg);
  }

  private getValueIndex(): number {
    const headers = this._data?.headers || [];
    const header = find(headers, ['name', 'value']);
    return header ? headers.indexOf(header) : -1;
  }

  private getTotalValue(valueIndex: number): number {
    if (!this._data?.rows || valueIndex < 0) {
      return NaN;
    }

    return this._data.rows.reduce((sum: number, row: string[]) => {
      const raw = row[valueIndex];
      const parsed = raw != null ? parseFloat(raw) : NaN;
      return isFiniteNumber(parsed) ? sum + parsed : sum;
    }, 0);
  }

  private renderMessage(
    renderingElement: HTMLElement,
    title: string,
    subtitle?: string
  ) {
    renderingElement.replaceChildren();

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 220 120');

    const centerX = 110;
    const centerY = 60;

    const titleText = document.createElementNS(svgNamespace, 'text');
    titleText.setAttribute('x', String(centerX));
    titleText.setAttribute('y', String(centerY - 4));
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '12');
    titleText.setAttribute('fill', '#757575');
    titleText.textContent = title;

    svg.appendChild(titleText);

    if (subtitle) {
      const subText = document.createElementNS(svgNamespace, 'text');
      subText.setAttribute('x', String(centerX));
      subText.setAttribute('y', String(centerY + 14));
      subText.setAttribute('text-anchor', 'middle');
      subText.setAttribute('font-size', '9');
      subText.setAttribute('fill', '#bdbdbd');
      subText.textContent = subtitle;
      svg.appendChild(subText);
    }

    renderingElement.appendChild(svg);
  }

  private createTextElement(
    svgNamespace: string,
    options: {
      y: number;
      fontSize: number;
      fill: string;
      anchor?: 'start' | 'middle' | 'end';
      fontWeight?: string;
    }
  ): SVGTextElement {
    const text = document.createElementNS(
      svgNamespace,
      'text'
    ) as SVGTextElement;

    text.setAttribute('x', '0');
    text.setAttribute('y', String(options.y));
    text.setAttribute('text-anchor', options.anchor ?? 'start');
    text.setAttribute('font-size', String(options.fontSize));
    text.setAttribute('fill', options.fill);
    text.setAttribute('dominant-baseline', 'hanging'); // y = top of the text box

    if (options.fontWeight) {
      text.setAttribute('font-weight', options.fontWeight);
    }

    return text;
  }

  private appendWrappedText(
    svgNamespace: string,
    textNode: SVGTextElement,
    lines: string[],
    lineHeightMultiplier: number
  ) {
    lines.forEach((line, index) => {
      const tspan = document.createElementNS(
        svgNamespace,
        'tspan'
      ) as SVGTSpanElement;
      tspan.setAttribute('x', '0');
      tspan.setAttribute('dy', index === 0 ? '0' : `${lineHeightMultiplier}em`);
      tspan.textContent = line;
      textNode.appendChild(tspan);
    });
  }

  private formatValue(value: number): string {
    const rounded =
      Math.abs(value) >= 1 ? Math.round(value * 100) / 100 : value;

    return VisualizerUtil.toSpaceSeparated(rounded);
  }

  wrapText(text: string, maxChars: number, maxLines = 2): string[] {
    if (!text || maxChars <= 0) {
      return text ? [text] : [];
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length <= maxChars) {
        currentLine = candidate;
      } else {
        if (lines.length < maxLines - 1) {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        } else {
          // We've reached the last allowed line; stop adding.
          // (No ellipsis; we just drop excess words.)
          break;
        }
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    return lines;
  }
}
