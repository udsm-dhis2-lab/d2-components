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

      const titleFontSize = rem(12);
      const filterFontSize = rem(8);

      const textGroup = document.createElementNS(svgNamespace, 'g');

      // Centering the text
      textGroup.setAttribute('transform', 'translate(100, 50)');

      // Data Label
      const titleText = document.createElementNS(svgNamespace, 'text');
      titleText.setAttribute('y', '-20');
      titleText.setAttribute('text-anchor', 'middle');
      titleText.setAttribute('font-size', `${titleFontSize}`);
      titleText.setAttribute('fill', '#666');
      titleText.textContent = dataLabel;

      // Filter Label
      const filterText = document.createElementNS(svgNamespace, 'text');
      filterText.setAttribute('y', '-4');
      filterText.setAttribute('text-anchor', 'middle');
      filterText.setAttribute('font-size', `${filterFontSize}`);
      filterText.setAttribute('fill', '#666');
      filterText.textContent = filterLabel;

      // Value Text
      const valueText = document.createElementNS(svgNamespace, 'text');
      valueText.setAttribute('y', '36');
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '2.5em');
      valueText.setAttribute('font-weight', '300');
      valueText.textContent = VisualizerUtil.toCommaSeparated(value);

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
}
