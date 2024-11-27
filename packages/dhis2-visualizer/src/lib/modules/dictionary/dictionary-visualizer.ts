// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';

export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
  // Callback for fetching details of a selected metadata
  onFetchDetails!: (id: string) => Promise<any>;


  draw(): void {
    const renderingElement = document.getElementById(this._id);
    if (renderingElement) {
      // Clear existing content
      renderingElement.replaceChildren();
  
      // Create a container for the tabs
      const tabsContainer = document.createElement('div');
      tabsContainer.style.display = 'flex';
      tabsContainer.style.marginBottom = '20px';
      tabsContainer.style.cursor = 'pointer';
  
      // Get `dx` and `names` from the metadata
      const dxArray = this._data?.metaData?.dx || [];
      const namesMap = this._data?.metaData?.names || {};
  
      // Track the selected tab
      let selectedTab: string | null = null;
  
      // Create tabs for each `dx` entry
      dxArray.forEach((id: string) => {
        const tabText = document.createElement('span');
        tabText.textContent = namesMap[id] || id; // Use the name if available, fallback to the ID
        tabText.style.padding = '5px 10px';
        tabText.style.fontSize = '16px';
        tabText.style.transition = 'border-bottom 0.3s';
  
        // Hover effect
        tabText.onmouseenter = () => (tabText.style.color = '#007bff');
        tabText.onmouseleave = () => (tabText.style.color = ''); // Reset color when hover ends
  
        // Handle click to fetch details and set active tab
        tabText.onclick = async () => {
          // If tab is already selected, don't do anything
          if (selectedTab === id) return;
  
          // Reset the underline style for the previous tab
          if (selectedTab !== null) {
            const previousTab = tabsContainer.querySelector(`#${selectedTab}`);
            if (previousTab && previousTab instanceof HTMLElement) {
              previousTab.style.borderBottom = 'none'; // Remove the underline from the previous tab
            }
          }
  
          // Set current tab as selected
          tabText.style.borderBottom = '2px solid #007bff'; // Add underline to the selected tab
          tabText.style.color = '#007bff'; // Change text color for the selected tab
          selectedTab = id;
  
          // Call the fetch details method
          if (this.onFetchDetails) {
            console.log(`Fetching details for: ${id}`);
            try {
              const details = await this.onFetchDetails(id);
              console.log('Details fetched:', details);
              // You can implement a method to display the details here if needed
            } catch (error) {
              console.error('Error fetching details:', error);
            }
          }
        };
  
    
    }
  }
  
  
  // draw(): void {
  //   console.log('The draw method is running.');
  //   const renderingElement = document.getElementById(this._id);
  //   console.log(this._id);
  //   console.log(this._data?.metaData);
  
  
  //   if (renderingElement) {
  //     // Clear existing content
  //     renderingElement.replaceChildren();

  //     // Create a paragraph element
  //     const paragraph = document.createElement('p');
  //     paragraph.textContent = 'I am working';
  //     paragraph.style.fontSize = '16px'; // Optional: Adjust text size
  //     paragraph.style.color = 'green'; // Optional: Add color

  //     // Append the paragraph to the rendering element
  //     renderingElement.appendChild(paragraph);

  //     // // Create main container
  //     // const mainContainer = document.createElement('div');
  //     // mainContainer.style.display = 'flex';
  //     // mainContainer.style.flexDirection = 'column';

  //     // // Create list container and title
  //     // const listContainer = document.createElement('div');
  //     // listContainer.style.marginBottom = '1rem';
  //     // listContainer.id = 'list-container';

  //     // const listTitle = document.createElement('h4');
  //     // listTitle.textContent = 'Metadata List';
  //     // listContainer.appendChild(listTitle);

  //     // // Create the list for metadata
  //     // const itemList = document.createElement('ul');
  //     // itemList.style.listStyleType = 'none';
  //     // itemList.style.padding = '0';

  //     // // Loop through dictionary and create list items
  //     // for (const [key, value] of Object.entries(this._data.dictionary)) {
  //     //   const listItem = document.createElement('li');
  //     //   listItem.style.marginBottom = '0.5rem';
  //     //   listItem.style.padding = '0.5rem';
  //     //   listItem.style.border = '1px solid #ccc';
  //     //   listItem.style.cursor = 'pointer';
  //     //   listItem.style.borderRadius = '4px';
  //     //   listItem.style.transition = 'background-color 0.3s';
  //     //   listItem.textContent = value as string;

  //     //   // Hover effects for list item
  //     //   listItem.onmouseenter = () =>
  //     //     (listItem.style.backgroundColor = '#f0f0f0');
  //     //   listItem.onmouseleave = () =>
  //     //     (listItem.style.backgroundColor = 'white');

  //     //   // On click, fetch details for the selected metadata
  //     //   listItem.onclick = async () => {
  //     //     try {
  //     //       console.log('List item clicked');
  //     //       if (this.onFetchDetails) {
  //     //         console.log('Fetching details for:', key);
  //     //         const details = await this.onFetchDetails(key); // Fetch details
  //     //         this.showItemDetails(value as string, details); // Show details
  //     //       }
  //     //     } catch (error) {
  //     //       console.error('Error fetching details:', error);
  //     //     }
  //     //   };

  //     //   itemList.appendChild(listItem);
  //     // }

  //     // listContainer.appendChild(itemList);

  //     // // Create the container for displaying item details (hidden initially)
  //     // const detailsContainer = document.createElement('div');
  //     // detailsContainer.id = 'details-container';
  //     // detailsContainer.style.padding = '1rem';
  //     // detailsContainer.style.border = '1px solid #ccc';
  //     // detailsContainer.style.borderRadius = '4px';
  //     // detailsContainer.style.display = 'none';

  //     // // Placeholder text for details container
  //     // const placeholder = document.createElement('p');
  //     // placeholder.textContent = 'Select an indicator to view details.';
  //     // placeholder.style.textAlign = 'center';
  //     // placeholder.style.color = '#666';
  //     // detailsContainer.appendChild(placeholder);

  //     // // Append both containers to the main container
  //     // mainContainer.appendChild(listContainer);
  //     // mainContainer.appendChild(detailsContainer);

  //     // // Append the main container to the rendering element
  //     // renderingElement.appendChild(mainContainer);
  //   }
  // }

  // // Show details for a selected item
  // showItemDetails(name: string, details: any): void {
  //   const detailsContainer = document.getElementById('details-container');
  //   const listContainer = document.getElementById('list-container');

  //   if (detailsContainer && listContainer) {
  //     listContainer.style.display = 'none'; // Hide list
  //     detailsContainer.style.display = 'block'; // Show details
  //     detailsContainer.innerHTML = ''; // Clear any existing content

  //     // Create a back button to return to the list
  //     const backButton = document.createElement('button');
  //     backButton.textContent = 'Back to List';
  //     backButton.onclick = () => this.showList(); // Return to list view
  //     detailsContainer.appendChild(backButton);

  //     // Title for details
  //     const detailsTitle = document.createElement('h2');
  //     detailsTitle.textContent = `${name}`;
  //     detailsTitle.style.color = 'blue';
  //     detailsContainer.appendChild(detailsTitle);

  //     // Introduction Section
  //     const introduction = document.createElement('p');
  //     introduction.innerHTML = `${name} is a <strong>${details.indicatorType}</strong> indicator, described as <strong>${details.indicatorDescription}</strong>, measured by <strong>${details.numeratorDescription}</strong> to <strong>${details.denominatorDescription}</strong>.`;
  //     detailsContainer.appendChild(introduction);

  //     // Create a list for the details
  //     const detailsList = document.createElement('ul');
  //     detailsList.style.listStyleType = 'none';
  //     detailsList.style.padding = '0';

  //     // Display each detail item
  //     for (const [key, value] of Object.entries(details)) {
  //       const detailItem = document.createElement('li');
  //       detailItem.innerHTML = `<strong>${key}:</strong> ${value}`;
  //       detailsList.appendChild(detailItem);
  //     }

  //     detailsContainer.appendChild(detailsList);
  //   }
  // }

  // // Show the list view again
  // showList(): void {
  //   const detailsContainer = document.getElementById('details-container');
  //   const listContainer = document.getElementById('list-container');

  //   if (detailsContainer && listContainer) {
  //     detailsContainer.style.display = 'none'; // Hide details
  //     listContainer.style.display = 'block'; // Show list
  //   }
  // }
}
