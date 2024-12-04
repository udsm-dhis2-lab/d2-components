import { find } from 'lodash';
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
    const valueIndex = this._data.headers.indexOf(
      find(this._data.headers, ['name', 'value'])
    );

    const filterLabel = VisualizerUtil.getDimensionNames(
      ['pe', 'ou'],
      this._data.metaData
    ).join(' - ');

    const dataLabel =
      this._data?.metaData?.names && this._data.metaData?.dx
        ? this._data?.metaData?.names[this._data.metaData?.dx[0]] ?? ''
        : '';

    const value: number = (this._data?.rows || []).reduce(
      (valueSum: number, row: string[]) => {
        return valueSum + parseFloat(row[valueIndex] ?? '0');
      },
      0
    );

    const renderingElement = document.getElementById(this._id);

    if (renderingElement) {
      renderingElement.replaceChildren();

      const svgNamespace = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNamespace, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 200 100');

      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const rem = (px: number) => `${(px / rootFontSize).toFixed(2)}rem`;

      const titleFontSizePx = 12;
      const filterFontSizePx = 8;
      const valueFontSizePx = 32;

      const titleFontSize = rem(titleFontSizePx);
      const filterFontSize = rem(filterFontSizePx);
      const valueFontSize = rem(valueFontSizePx);

      const renderingWidth =
        renderingElement.getBoundingClientRect().width - 12;
      const charWidth = 12 * 0.6;
      const maxCharsPerLine = Math.floor(renderingWidth / charWidth);

      const textGroup = document.createElementNS(svgNamespace, 'g');

      // Centering the text
      textGroup.setAttribute('transform', 'translate(100, 50)');

      // Data Label
      const titleText = document.createElementNS(svgNamespace, 'text');
      titleText.setAttribute('y', '-20');
      titleText.setAttribute('text-anchor', 'middle');
      titleText.setAttribute('font-size', `${titleFontSize}`);
      titleText.setAttribute('fill', '#666');

      const wrappedTitle = this.wrapText(dataLabel, maxCharsPerLine);
      wrappedTitle.forEach((line, index) => {
        const tspan = document.createElementNS(svgNamespace, 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', index === 0 ? '0' : '1.2em');
        tspan.textContent = line;
        titleText.appendChild(tspan);
      });

      const titleHeight = wrappedTitle.length * titleFontSizePx;

      // Filter Label
      const filterText = document.createElementNS(svgNamespace, 'text');
      filterText.setAttribute('y', `${titleHeight - 16}`);
      filterText.setAttribute('text-anchor', 'middle');
      filterText.setAttribute('font-size', `${filterFontSize}`);
      filterText.setAttribute('fill', '#666');

      const wrappedFilter = this.wrapText(filterLabel, maxCharsPerLine);
      wrappedFilter.forEach((line, index) => {
        const tspan = document.createElementNS(svgNamespace, 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', index === 0 ? '0' : '1.2em');
        tspan.textContent = line;
        filterText.appendChild(tspan);
      });

      const filterHeight = wrappedFilter.length * filterFontSizePx;
      // Value Text
      const valueText = document.createElementNS(svgNamespace, 'text');
      valueText.setAttribute('y', `${titleHeight + filterHeight + 10}`);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', valueFontSize);
      valueText.setAttribute('font-weight', '300');
      valueText.textContent = VisualizerUtil.toSpaceSeparated(value);

      // Append texts to the group
      textGroup.appendChild(titleText);
      textGroup.appendChild(filterText);
      textGroup.appendChild(valueText);

      // Append the group to the SVG
      svg.appendChild(textGroup);

      // Append the SVG to the rendering element
      renderingElement.appendChild(svg);
    }
  }

  wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + word).length <= maxChars) {
        currentLine += `${word} `;
      } else {
        lines.push(currentLine.trim());
        currentLine = `${word} `;
      }
    });

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}
