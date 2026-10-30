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
    this._container.className = 'maplibregl-ctrl';

    if (this._legends?.length > 0) {
      const style = document.createElement('style');
      style.textContent = `
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

      `;
      const legendContainer = document.createElement('div');
      legendContainer.className = 'legend-ctrl';
      legendContainer.setAttribute('role', 'group');
      legendContainer.setAttribute('aria-label', this.legendTitle || 'Map legend');
      const title = document.createElement('div');
      title.className = 'legend-ctrl-title';
      title.textContent = this.legendTitle;
      legendContainer.appendChild(title);

      for (const legend of this._legends) {
        const item = document.createElement('div');
        item.className = 'legend-ctrl-items';
        if (legend.useBackgroundColor) {
          const icon = document.createElement('div');
          icon.className = 'legend-ctrl-icon';
          icon.style.backgroundColor = legend.backgroundColor || 'gray';
          item.appendChild(icon);
        } else {
          const icon = document.createElement('img');
          icon.alt = '';
          icon.src = String(legend.symbol ?? '');
          item.appendChild(icon);
        }
        const label = document.createElement('div');
        label.className = 'legend-ctrl-label';
        label.textContent = String(legend.label ?? '');
        item.appendChild(label);
        legendContainer.appendChild(item);
      }
      this._container.append(style, legendContainer);
    }
    return this._container;
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}
