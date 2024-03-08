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
        return valueSum + parseFloat(row[valueIndex] ?? 0);
      },
      0
    );

    const renderingElement = document.getElementById(this._id);

    if (renderingElement) {
      renderingElement?.replaceChildren();
      renderingElement.innerHTML = `
      <style>
      #single-value-container-${this._id} {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      #single-value-title-${this._id} {
        font-size: 12px; 
        color: #666;
        line-height: 12px;
        margin-bottom: 8px;
      }

      #single-value-filter-${this._id} {
        font-size: 8px; 
        color: #666;
        line-height: 8px;
        margin-bottom: 8px;
      }

      #single-value-${this._id} {
        font-size: 2.5em;
        font-weight: 300;
        line-height: .8em;
      }
      </style>
      <div id="single-value-container-${this._id}">
        <div style="text-align: center">
            <div id="single-value-title-${this._id}">${dataLabel}</div>
            <div id="single-value-filter-${this._id}">${filterLabel}</div>
            <div id="single-value-${
              this._id
            }">${VisualizerUtil.toCommaSeparated(value)}</div>
        </div>
      </div>`;
    }
  }
}
