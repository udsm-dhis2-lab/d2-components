// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { MetadataService } from '../dictionary/dictionary-visualizer.service';
import { DataElementRenderer } from './helpers/dataelement-renderer.helper';
import { IndicatorRenderer } from './helpers/indicator-renderer.helper';
import { ProgramIndicatorRenderer } from './helpers/program-indicator-renderer.helper';
import { MetadataRenderer } from './models/metadata-renderer.model';
import { FunctionRenderer } from './helpers/function-renderer.helper';
export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
  private metadataService: MetadataService;
  private isFunction: boolean | null = null;

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
      case 'DataElement':
        return new DataElementRenderer();
      case 'Function':
        return new FunctionRenderer();
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

    const metaDataArray = [...this._identifiers];

    // Show loader while fetching names
    contentContainer.innerHTML = `<p style="font-size: 14px; color: #555;">Loading...</p>`;

    // Fetch names for all IDs in parallel
    const namesMap: Record<string, string> = {};
    await Promise.all(
      metaDataArray.map(async (id: string) => {
        const functionRule = this.metadataService.extractFunctionAndRule(id);
        this.isFunction = !!functionRule;
        if (functionRule) {
          try {
            const functionDetails = await this.metadataService.fetchFunction(
              functionRule.function
            );

            namesMap[id] = functionDetails.data?.name || id;
          } catch {
            namesMap[id] = id;
          }
        } else {
          try {
            const details = await this.metadataService.fetchIdentifiableObject(
              id
            );
            namesMap[id] = details.data.name || id;
          } catch {
            namesMap[id] = id;
          }
        }
      })
    );

    // Removes loader after fetching
    contentContainer.innerHTML = '';

    let selectedTab: string | null = null;

    metaDataArray.forEach((id: string) => {
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

      tabText.onclick = async () => {
        if (selectedTab !== id) {
          selectedTab = id;
          Array.from(tabsContainer.children).forEach((child: Element) => {
            (child as HTMLElement).style.borderBottom = 'none';
          });
          tabText.style.borderBottom = '2px solid #007bff';
        }

        contentContainer.innerHTML = `<p style="font-size: 14px; color: #555;">Loading...</p>`;
        if (this.isFunction) {
          const functionID = await this.metadataService.extractFunctionAndRule(
            id
          )?.function;
          const ruleID = await this.metadataService.extractFunctionAndRule(id)
            ?.rule;
          const details = await this.metadataService.fetchFunctionWithRule(
            functionID as string,
            ruleID as string
          );
          const renderer = this.getRenderer('Function');
          renderer.draw(details, contentContainer);
        } else {
          try {
            const details = await this.metadataService.fetchMetadataById(id);
            // Clear loading message and display fetched data
            contentContainer.replaceChildren();
            let metadataType: string;
            switch (details.dimensionItemType) {
              case 'INDICATOR':
                metadataType = 'Indicator';
                break;
              case 'PROGRAM_INDICATOR':
                metadataType = 'ProgramIndicator';
                break;
              case 'DATA_ELEMENT':
                metadataType = 'DataElement';
                break;
              default:
                throw new Error('Unsupported metadata type');
            }
            const renderer = this.getRenderer(metadataType);

            renderer.draw(details, contentContainer);
          } catch (error) {
            contentContainer.innerHTML = `<p style="color: red;">Error fetching data. Please try again.</p>`;
            console.error('Error fetching metadata:', error);
          }
        }
      };

      tabsContainer.appendChild(tabText);
    });

    if (metaDataArray.length > 0) {
      tabsContainer.firstChild?.dispatchEvent(new Event('click'));
    }
  }
}
