export interface LegendItem {
  useBackgroundColor: boolean;
  backgroundColor?: string;
  symbol?: string;
  label: string;
}

const LEGEND_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAy5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIEVsZW1lbnRzIDE0LjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0VDMTEyQzZDRTU4MTFFNTk1Q0ZGQzk2MTlGNkY2NjYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0VDMTEyQzdDRTU4MTFFNTk1Q0ZGQzk2MTlGNkY2NjYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QkJDODIwOUNFNTYxMUU1OTVDRkZDOTYxOUY2RjY2NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QkJDODIwQUNFNTYxMUU1OTVDRkZDOTYxOUY2RjY2NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjzimhsAAACgSURBVHjaYqxXZ/nPgAN8+A2WYgQRE+7+YaAFYGIYYMBCqgZGRsb/wyoEhl4U2FhbDawDjhw9xkhVB0Cz2sCFgAArI14fkepAmofAgCfCw0eODrNsmKX2D2ccPP/JBK8LRgui0bpgtC6gWV0AzWoDFwKS7P/w+ohUB9I8BEbrAqqHgK2PJc6S7ePnr6N1wWhdMFoX0L4ugGa1AQsBgAADAHQ1NZdoV4oTAAAAAElFTkSuQmCC';

export class LegendControl {
  private _container!: HTMLDivElement;
  private _panel?: HTMLDivElement;
  private readonly _sections: { legends: LegendItem[]; title: string }[];
  private _pinned = false;
  private _hovered = false;
  private _focused = false;
  private _suppressHover = false;

  constructor(legends: LegendItem[], public legendTitle: string) {
    this._sections = [{ legends, title: legendTitle }];
  }

  addSection(legends: LegendItem[], title: string): void {
    if (!legends.length) return;
    this._sections.push({ legends, title });
    if (this._panel) this._renderSection(this._panel, legends, title);
  }

  onAdd(_map: unknown): HTMLDivElement {
    this._pinned = this._hovered = this._focused = this._suppressHover = false;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl legend-control';
    this._container = container;
    const style = document.createElement('style');
    style.textContent = `
      .legend-control { position: relative; font: 12px sans-serif; }
      .legend-control-button { align-items: center; background: #fff; border: 0; border-radius: 4px; box-shadow: 0 0 0 2px rgb(0 0 0 / 10%); cursor: pointer; display: flex; height: 32px; justify-content: center; padding: 4px; width: 32px; }
      .legend-control-button img { display: block; height: 24px; width: 24px; }
      .legend-ctrl { background: #fff; border-radius: 4px; box-shadow: 0 0 0 2px rgb(0 0 0 / 10%); color: #404b5a; left: 0; max-height: min(60vh, 500px); max-width: 240px; min-width: 140px; overflow: auto; padding: 8px 10px; position: absolute; top: 38px; }
      .legend-ctrl[hidden] { display: none; }
      .legend-ctrl-section + .legend-ctrl-section { border-top: 1px solid #ddd; margin-top: 8px; padding-top: 8px; }
      .legend-ctrl-title { font-weight: bold; margin-bottom: 6px; }
      .legend-ctrl-items { align-items: center; display: flex; margin: 3px 0; }
      .legend-ctrl-items img { height: 24px; max-width: 24px; }
      .legend-ctrl-icon { border-radius: 50%; flex: 0 0 12px; height: 12px; width: 12px; }
      .legend-ctrl-label { margin-left: 8px; }
    `;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'legend-control-button';
    button.setAttribute('aria-label', 'Legend');
    button.title = 'Legend';
    const icon = document.createElement('img');
    icon.src = LEGEND_ICON;
    icon.alt = '';
    button.appendChild(icon);
    button.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'legend-ctrl';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', this.legendTitle || 'Map legend');
    panel.hidden = true;
    this._panel = panel;
    for (const section of this._sections) this._renderSection(panel, section.legends, section.title);
    const update = () => {
      const open = this._pinned || (!this._suppressHover && (this._hovered || this._focused));
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
    };
    container.addEventListener('mouseenter', () => { this._hovered = true; update(); });
    container.addEventListener('mouseleave', () => { this._hovered = false; this._suppressHover = false; update(); });
    container.addEventListener('focusin', () => { this._focused = true; update(); });
    container.addEventListener('focusout', (event) => {
      if (!container.contains(event.relatedTarget as Node)) { this._focused = false; update(); }
    });
    button.addEventListener('click', () => {
      if (this._pinned) { this._pinned = false; this._suppressHover = true; }
      else { this._pinned = true; this._suppressHover = false; }
      update();
    });
    container.append(style, button, panel);
    return container;
  }

  private _renderSection(panel: HTMLDivElement, legends: LegendItem[], title: string): void {
    if (!legends.length) return;
    const section = document.createElement('div');
    section.className = 'legend-ctrl-section';
    const heading = document.createElement('div');
    heading.className = 'legend-ctrl-title';
    heading.textContent = title;
    section.appendChild(heading);
    for (const legend of legends) {
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
      section.appendChild(item);
    }
    panel.appendChild(section);
  }

  onRemove(): void {
    this._container?.parentNode?.removeChild(this._container);
    this._panel = undefined;
  }
}
