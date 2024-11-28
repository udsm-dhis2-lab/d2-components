// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


import { BaseVisualizer, Visualizer } from '../../shared/models/base-visualizer.model';
import { MetadataService } from '../dictionary/dictionary-visualizer.service'; // Adjust the path as necessary

export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
  private metadataService: MetadataService;

  constructor() {
    super();
    this.metadataService = new MetadataService(); 
  }

  onFetchMetaDataDetails!: (id: string) => Promise<any>;

  draw(): void {
    const renderingElement = document.getElementById(this._id);
    if (renderingElement) {
      renderingElement.replaceChildren();

      const tabsContainer = document.createElement('div');
      tabsContainer.style.display = 'flex';
      tabsContainer.style.marginBottom = '20px';
      tabsContainer.style.cursor = 'pointer';

      const dxArray = this._data?.metaData?.dx || [];
      const namesMap = this._data?.metaData?.names || {};

      let selectedTab: string | null = null;

      dxArray.forEach((id: string) => {
        const tabText = document.createElement('span');
        tabText.textContent = namesMap[id] || id;
        tabText.style.padding = '5px 10px';
        tabText.style.fontSize = '16px';
        tabText.style.transition = 'border-bottom 0.3s';

        tabText.onmouseenter = () => (tabText.style.color = '#007bff');
        tabText.onmouseleave = () => (tabText.style.color = '');

        tabText.onclick = async () => {
          if (selectedTab === id) return;

          if (selectedTab !== null) {
            const previousTab = tabsContainer.querySelector(`#${selectedTab}`);
            if (previousTab && previousTab instanceof HTMLElement) {
              previousTab.style.borderBottom = 'none';
            }
          }

          tabText.style.borderBottom = '2px solid #007bff';
          tabText.style.color = '#007bff';
          selectedTab = id;

          try {
            const details = await this.metadataService.fetchMetadataById(id); // Use the manually instantiated service
            console.log('Details fetched:', details);
            this.displayDetails(details);
          } catch (error) {
            console.error('Error fetching details:', error);
          }
        };

        tabText.id = id;
        tabsContainer.appendChild(tabText);
      });

      renderingElement.appendChild(tabsContainer);

      const visualizerContent = document.createElement('div');
      visualizerContent.id = 'visualizer-content';
      visualizerContent.textContent = 'Select metadata to get started.';
      visualizerContent.style.border = '1px solid #ccc';
      visualizerContent.style.padding = '20px';
      visualizerContent.style.borderRadius = '4px';
      renderingElement.appendChild(visualizerContent);
    }
  }

  private displayDetails(details: any): void {
    const visualizerContent = document.getElementById('visualizer-content');
    if (visualizerContent) {
      visualizerContent.replaceChildren();

      if (details.indicatorType) {
        const title = document.createElement('h4');
        title.textContent = `${details.name}`;
        visualizerContent.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`;
        visualizerContent.appendChild(intro);

        const uid = document.createElement('p');
        uid.textContent = `Identified by: ${details.id}`;
        visualizerContent.appendChild(uid);

        if (details.description) {
          const description = document.createElement('p');
          description.textContent = `Description: ${details.description}`;
          visualizerContent.appendChild(description);
        }

        const factsTitle = document.createElement('h4');
        factsTitle.textContent = 'Indicator Facts';
        visualizerContent.appendChild(factsTitle);

        const factsList = document.createElement('ul');
        const uidItem = document.createElement('li');
        uidItem.textContent = `UID: ${details.id}`;
        factsList.appendChild(uidItem);

        if (details.numeratorDescription) {
          const numeratorItem = document.createElement('li');
          numeratorItem.textContent = `Numerator: ${details.numeratorDescription}`;
          factsList.appendChild(numeratorItem);
        }

        if (details.denominatorDescription) {
          const denominatorItem = document.createElement('li');
          denominatorItem.textContent = `Denominator: ${details.denominatorDescription}`;
          factsList.appendChild(denominatorItem);
        }

        visualizerContent.appendChild(factsList);

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Below are expressions computing numerator and denominator, and related sources.';
        visualizerContent.appendChild(subtitle);

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.margin = '10px 0';

        const headerRow = document.createElement('tr');
        const headers = ['Expression', 'Formula', 'Sources'];
        headers.forEach((headerText) => {
          const th = document.createElement('th');
          th.textContent = headerText;
          th.style.border = '1px solid #ddd';
          th.style.padding = '8px';
          th.style.backgroundColor = '#f4f4f4';
          th.style.textAlign = 'left';
          headerRow.appendChild(th);
        });

        table.appendChild(headerRow);

        const rows = [
          {
            label: 'Numerator',
            value: details.numerator || '',
            sources: details.numeratorSources || '',
          },
          {
            label: 'Denominator',
            value: details.denominator || '',
            sources: details.denominatorSources || '',
          },
        ];

        rows.forEach((row) => {
          const tr = document.createElement('tr');

          const tdLabel = document.createElement('td');
          tdLabel.textContent = row.label;
          tdLabel.style.border = '1px solid #ddd';
          tdLabel.style.padding = '8px';
          tr.appendChild(tdLabel);

          const tdValue = document.createElement('td');
          tdValue.textContent = row.value;
          tdValue.style.border = '1px solid #ddd';
          tdValue.style.padding = '8px';
          tr.appendChild(tdValue);

          const tdSources = document.createElement('td');
          tdSources.textContent = row.sources;
          tdSources.style.border = '1px solid #ddd';
          tdSources.style.padding = '8px';
          tr.appendChild(tdSources);

          table.appendChild(tr);
        });

        visualizerContent.appendChild(table);

        if (details.dataSets || details.programs) {
          const dataSourcesTitle = document.createElement('h4');
          dataSourcesTitle.textContent = 'Data Sources';
          visualizerContent.appendChild(dataSourcesTitle);

          const dataSourcesList = document.createElement('ul');

          if (details.dataSets) {
            const dataSetItem = document.createElement('li');
            dataSetItem.textContent = `Data Sets: ${details.dataSets
              .map((ds: any) => ds.name)
              .join(', ')}`;
            dataSourcesList.appendChild(dataSetItem);
          }

          if (details.programs) {
            const programItem = document.createElement('li');
            programItem.textContent = `Programs: ${details.programs
              .map((p: any) => p.name)
              .join(', ')}`;
            dataSourcesList.appendChild(programItem);
          }

          visualizerContent.appendChild(dataSourcesList);
        }
      } else {
        const defaultDisplay = document.createElement('p');
        defaultDisplay.textContent = `Unsupported metadata type or insufficient details: ${JSON.stringify(
          details,
          null,
          2
        )}`;
        visualizerContent.appendChild(defaultDisplay);
      }
    }
  }
}


// import { Inject } from '@angular/core';
// import {
//   BaseVisualizer,
//   Visualizer,
// } from '../../shared/models/base-visualizer.model';
// import { MetadataService } from '../dictionary/dictionary-visualizer.service'; // Adjust the import path as necessary
// import { firstValueFrom } from 'rxjs';

// export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
//   constructor(private metadataService: MetadataService) {
//     super();
//   }

//   // Callback for fetching details of a selected metadata
//   onFetchMetaDataDetails!: (id: string) => Promise<any>;

//   draw(): void {
//     const renderingElement = document.getElementById(this._id);
//     if (renderingElement) {
//       // Clear existing content
//       renderingElement.replaceChildren();

//       // Create a container for the tabs
//       const tabsContainer = document.createElement('div');
//       tabsContainer.style.display = 'flex';
//       tabsContainer.style.marginBottom = '20px';
//       tabsContainer.style.cursor = 'pointer';

//       // Get `dx` and `names` from the metadata
//       const dxArray = this._data?.metaData?.dx || [];
//       const namesMap = this._data?.metaData?.names || {};

//       // Track the selected tab
//       let selectedTab: string | null = null;

//       // Create tabs for each `dx` entry
//       dxArray.forEach((id: string) => {
//         const tabText = document.createElement('span');
//         tabText.textContent = namesMap[id] || id; // Use the name if available, fallback to the ID
//         tabText.style.padding = '5px 10px';
//         tabText.style.fontSize = '16px';
//         tabText.style.transition = 'border-bottom 0.3s';

//         // Hover effect
//         tabText.onmouseenter = () => (tabText.style.color = '#007bff');
//         tabText.onmouseleave = () => (tabText.style.color = ''); // Reset color when hover ends

//         // Handle click to fetch details and set active tab
//         tabText.onclick = async () => {
//           // If tab is already selected, don't do anything
//           if (selectedTab === id) return;

//           // Reset the underline style for the previous tab
//           if (selectedTab !== null) {
//             const previousTab = tabsContainer.querySelector(`#${selectedTab}`);
//             if (previousTab && previousTab instanceof HTMLElement) {
//               previousTab.style.borderBottom = 'none'; // Remove the underline from the previous tab
//             }
//           }

//           // Set current tab as selected
//           tabText.style.borderBottom = '2px solid #007bff'; // Add underline to the selected tab
//           tabText.style.color = '#007bff'; // Change text color for the selected tab
//           selectedTab = id;

//           // Fetch details using the MetadataService
//           try {
//             const details = await firstValueFrom(
//               this.metadataService.fetchMetadataById(id)
//             );
//             console.log('Details fetched:', details);
//             this.displayDetails(details); // Method to display details in the UI
//           } catch (error) {
//             console.error('Error fetching details:', error);
//           }
//         };

//         // Set unique ID for each tab text
//         tabText.id = id;

//         // Append the tab text to the tabs container
//         tabsContainer.appendChild(tabText);
//       });

//       // Append the tabs container to the rendering element
//       renderingElement.appendChild(tabsContainer);

//       // Add a placeholder for the visualizer content
//       const visualizerContent = document.createElement('div');
//       visualizerContent.id = 'visualizer-content';
//       visualizerContent.textContent = 'Select metadata to get started.';
//       visualizerContent.style.border = '1px solid #ccc';
//       visualizerContent.style.padding = '20px';
//       visualizerContent.style.borderRadius = '4px';
//       renderingElement.appendChild(visualizerContent);
//     }
//   }

//   /**
//    * Display fetched details in the visualizer content area in a structured way.
//    * @param details The metadata details to display.
//    */
//   private displayDetails(details: any): void {
//     const visualizerContent = document.getElementById('visualizer-content');
//     if (visualizerContent) {
//       // Clear existing content
//       visualizerContent.replaceChildren();

//       // Example structured display for indicator details
//       if (details.indicatorType) {
//         // Title
//         const title = document.createElement('h4');
//         title.textContent = `${details.name}`;
//         visualizerContent.appendChild(title);

//         // Introduction
//         const intro = document.createElement('p');
//         intro.textContent = `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`;
//         visualizerContent.appendChild(intro);

//         // UID
//         const uid = document.createElement('p');
//         uid.textContent = `Identified by : ${details.id}`;
//         visualizerContent.appendChild(uid);

//         // Description
//         if (details.description) {
//           const description = document.createElement('p');
//           description.textContent = `Description: ${details.description}`;
//           visualizerContent.appendChild(description);
//         }

//         // Indicator Facts
//         const factsTitle = document.createElement('h4');
//         factsTitle.textContent = 'Indicator Facts';
//         visualizerContent.appendChild(factsTitle);

//         const factsList = document.createElement('ul');
//         const uidItem = document.createElement('li');
//         uidItem.textContent = `UID: ${details.id}`;
//         factsList.appendChild(uidItem);

//         if (details.numeratorDescription) {
//           const numeratorItem = document.createElement('li');
//           numeratorItem.textContent = `Numerator: ${details.numeratorDescription}`;
//           factsList.appendChild(numeratorItem);
//         }

//         if (details.denominatorDescription) {
//           const denominatorItem = document.createElement('li');
//           denominatorItem.textContent = `Denominator: ${details.denominatorDescription}`;
//           factsList.appendChild(denominatorItem);
//         }

//         visualizerContent.appendChild(factsList);

//         // Title
//         // const tableTitle = document.createElement('h4');
//         // title.textContent = `Calculation Details`;
//         // visualizerContent.appendChild(tableTitle);

//         // Subtitle
//         const subtitle = document.createElement('p');
//         subtitle.textContent =
//           'Below are expressions computing numerator and denominator, and related sources.';
//         visualizerContent.appendChild(subtitle);

//         // Create the calculation table
//         const table = document.createElement('table');
//         table.style.borderCollapse = 'collapse';
//         table.style.width = '100%';
//         table.style.margin = '10px 0';

//         // Create the table header
//         const headerRow = document.createElement('tr');

//         const headers = ['Expression', 'Formula', 'Sources'];
//         headers.forEach((headerText) => {
//           const th = document.createElement('th');
//           th.textContent = headerText;
//           th.style.border = '1px solid #ddd';
//           th.style.padding = '8px';
//           th.style.backgroundColor = '#f4f4f4';
//           th.style.textAlign = 'left';
//           headerRow.appendChild(th);
//         });

//         table.appendChild(headerRow);

//         // Add rows for numerator and denominator
//         const rows = [
//           {
//             label: 'Numerator',
//             value: details.numerator || '',
//             sources: details.numeratorSources || '',
//           },
//           {
//             label: 'Denominator',
//             value: details.denominator || '',
//             sources: details.denominatorSources || '',
//           },
//         ];

//         rows.forEach((row) => {
//           const tr = document.createElement('tr');

//           const tdLabel = document.createElement('td');
//           tdLabel.textContent = row.label;
//           tdLabel.style.border = '1px solid #ddd';
//           tdLabel.style.padding = '8px';
//           tr.appendChild(tdLabel);

//           const tdValue = document.createElement('td');
//           tdValue.textContent = row.value;
//           tdValue.style.border = '1px solid #ddd';
//           tdValue.style.padding = '8px';
//           tr.appendChild(tdValue);

//           const tdSources = document.createElement('td');
//           tdSources.textContent = row.sources;
//           tdSources.style.border = '1px solid #ddd';
//           tdSources.style.padding = '8px';
//           tr.appendChild(tdSources);

//           table.appendChild(tr);
//         });

//         // Append the table to the content
//         visualizerContent.appendChild(table);

//         // Data Sources
//         if (details.dataSets || details.programs) {
//           const dataSourcesTitle = document.createElement('h4');
//           dataSourcesTitle.textContent = 'Data Sources';
//           visualizerContent.appendChild(dataSourcesTitle);

//           const dataSourcesList = document.createElement('ul');

//           if (details.dataSets) {
//             const dataSetItem = document.createElement('li');
//             dataSetItem.textContent = `Data Sets: ${details.dataSets
//               .map((ds: any) => ds.name)
//               .join(', ')}`;
//             dataSourcesList.appendChild(dataSetItem);
//           }

//           if (details.programs) {
//             const programItem = document.createElement('li');
//             programItem.textContent = `Programs: ${details.programs
//               .map((p: any) => p.name)
//               .join(', ')}`;
//             dataSourcesList.appendChild(programItem);
//           }

//           visualizerContent.appendChild(dataSourcesList);
//         }

//         // Add other sections as needed
//       } else {
//         // Default display for unsupported metadata types
//         const defaultDisplay = document.createElement('p');
//         defaultDisplay.textContent = `Unsupported metadata type or insufficient details: ${JSON.stringify(
//           details,
//           null,
//           2
//         )}`;
//         visualizerContent.appendChild(defaultDisplay);
//       }
//     }
//   }
// }
