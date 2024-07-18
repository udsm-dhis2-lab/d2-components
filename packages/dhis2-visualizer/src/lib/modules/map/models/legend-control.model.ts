export class LegendControl {
  private _map: any;
  private _container!: HTMLDivElement;
  private _legends: any[];
  constructor(legends: any[], public legendTitle: string) {
    this._legends = legends;
  }
  onAdd(map: any) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl';

    if (this._legends?.length > 1) {
      this._container.innerHTML = `
      <style>
     .legend-ctrl {
          background: white;
          border-radius: 5px;
          padding: 5px 10px;
          box-shadow: 0 0 0 2px rbg(0 0 0 / 10%);
          max-width: 200px;
        }

        .legend-ctrl-items {
          display: flex;
          align-items: center;
        }
        .legend-ctrl-items img {
          height: 24px;
        }

        .legend-ctrl-icon {
          height: 12px;
          width: 12px;
          border-radius: 50%;
        }

        .legend-ctrl-label {
          margin-left: 8px
        }

        .legend-ctrl-title {
          margin-bottom: 8px;
          font-weight: bold;
          font-size: 12px;
        }

      </style>
      <div class="legend-ctrl">
      <div class="legend-ctrl-title">${this.legendTitle}</div>
      ${this._legends
        .map(
          (legend) => `<div class="legend-ctrl-items">
      ${
        legend.useBackgroundColor
          ? `<div class="legend-ctrl-icon" style="background-color: ${
              legend.backgroundColor || 'gray'
            }"></div>`
          : `<img src="${legend.symbol}" />`
      }
      <div class="legend-ctrl-label">${legend.label}</div>
     </div>`
        )
        .join('')}
      </div>`;
    }
    return this._container;
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}
