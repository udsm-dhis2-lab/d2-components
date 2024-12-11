// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { MetadataService } from '../dictionary/dictionary-visualizer.service';
import { IndicatorRenderer } from './helpers/indicator-renderer.helper';
import { ProgramIndicatorRenderer } from './helpers/program-indicator-renderer.helper';
import { MetadataRenderer } from './models/metadata-renderer.model';

export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
  private metadataService: MetadataService;

  constructor() {
    super();
    this.metadataService = new MetadataService();
  }

  private getRenderer(metadataType: string): MetadataRenderer {
    switch (metadataType) {
      case 'Indicator':
        return new IndicatorRenderer();
      case 'ProgramIndicator':
        return new ProgramIndicatorRenderer();
      default:
        throw new Error(`Unsupported metadata type: ${metadataType}`);
    }
  }

  async draw(): Promise<void> {
    const renderingElement = document.getElementById(this._id);
    if (!renderingElement) return;

    renderingElement.replaceChildren();

    // Tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.style.display = 'flex';
    tabsContainer.style.marginBottom = '0px';
    tabsContainer.style.cursor = 'pointer';
    renderingElement.appendChild(tabsContainer);

    // Content container for the selected tab
    const contentContainer = document.createElement('div');
    contentContainer.style.maxHeight = '75vh';
    contentContainer.style.overflowY = 'auto';
    contentContainer.style.padding = '0 10px 10px';
    renderingElement.appendChild(contentContainer);

    const dxArray = this._data?.metaData?.dx || [];
    const namesMap = this._data?.metaData?.names || {};

    let selectedTab: string | null = null;

    dxArray.forEach((id: string) => {
      const tabText = document.createElement('span');
      tabText.textContent = namesMap[id] || id;
      tabText.style.padding = '5px 10px';
      tabText.style.fontSize = '16px';
      tabText.style.transition = 'border-bottom 0.3s';
      tabText.style.borderBottom =
        selectedTab === id ? '2px solid #007bff' : 'none';

      // Hover effects
      tabText.onmouseenter = () => (tabText.style.color = '#007bff');
      tabText.onmouseleave = () => (tabText.style.color = '');

      // Click behavior
      tabText.onclick = async () => {
        // Update selected tab styling
        if (selectedTab !== id) {
          selectedTab = id;
          Array.from(tabsContainer.children).forEach((child: Element) => {
            (child as HTMLElement).style.borderBottom = 'none';
          });
          tabText.style.borderBottom = '2px solid #007bff';
        }

        // Show loading indicator
        contentContainer.innerHTML = `<p style="font-size: 14px; color: #555;">Loading...</p>`;

        try {
          const details = await this.metadataService.fetchMetadataById(id);

          // Clear loading message and display fetched data
          contentContainer.replaceChildren();
          const metadataType =
            details.dimensionItemType === 'INDICATOR'
              ? 'Indicator'
              : 'ProgramIndicator';
          const renderer = this.getRenderer(metadataType);

          renderer.draw(details, contentContainer);
        } catch (error) {
          // Handle errors gracefully
          contentContainer.innerHTML = `<p style="color: red;">Error fetching data. Please try again.</p>`;
          console.error('Error fetching metadata:', error);
        }
      };

      tabsContainer.appendChild(tabText);
    });

    // Optionally pre-select the first tab
    if (dxArray.length > 0) {
      tabsContainer.firstChild?.dispatchEvent(new Event('click'));
    }
  }
}
