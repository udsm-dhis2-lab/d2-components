// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


import { BaseVisualizer, Visualizer } from '../../shared/models/base-visualizer.model';

export class DictionaryVisualizer extends BaseVisualizer implements Visualizer {
  draw(): void {
    // Access the rendering container
    const renderingElement = document.getElementById(this._id);

    if (renderingElement) {
      // Clear the container
      renderingElement.replaceChildren();

      // Create the main container
      const mainContainer = document.createElement('div');
      mainContainer.style.display = 'flex';
      mainContainer.style.flexDirection = 'column';

      // Create the list container
      const listContainer = document.createElement('div');
      listContainer.style.marginBottom = '1rem';
      listContainer.id = 'list-container'; // Assign an ID for easy reference

      // Create a title for the list
      const listTitle = document.createElement('h4');
      listTitle.textContent = 'Items List';
      listContainer.appendChild(listTitle);

      // Create a list to display items
      const itemList = document.createElement('ul');
      itemList.style.listStyleType = 'none';
      itemList.style.padding = '0';

      // Process dictionary entries
      const dictionaryEntries = this._data.dictionary || {};

      for (const [key, value] of Object.entries(dictionaryEntries)) {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '0.5rem';
        listItem.style.padding = '0.5rem';
        listItem.style.border = '1px solid #ccc';
        listItem.style.cursor = 'pointer';
        listItem.style.borderRadius = '4px';
        listItem.style.transition = 'background-color 0.3s';
        listItem.textContent = key;

        // Hover effect
        listItem.onmouseenter = () => (listItem.style.backgroundColor = '#f0f0f0');
        listItem.onmouseleave = () => (listItem.style.backgroundColor = 'white');

        // Add click event to show item details
        listItem.onclick = () => this.showItemDetails(key, value);

        itemList.appendChild(listItem);
      }

      // Append the list to the list container
      listContainer.appendChild(itemList);

      // Create the details container
      const detailsContainer = document.createElement('div');
      detailsContainer.id = 'details-container';
      detailsContainer.style.padding = '1rem';
      detailsContainer.style.border = '1px solid #ccc';
      detailsContainer.style.borderRadius = '4px';
      detailsContainer.style.display = 'none'; // Initially hidden

      // Add placeholder text for details
      const placeholder = document.createElement('p');
      placeholder.textContent = 'Select an item to view details.';
      placeholder.style.textAlign = 'center';
      placeholder.style.color = '#666';
      detailsContainer.appendChild(placeholder);

      // Append both containers to the main container
      mainContainer.appendChild(listContainer);
      mainContainer.appendChild(detailsContainer);

      // Append the main container to the rendering element
      renderingElement.appendChild(mainContainer);
    }
  }

  /**
   * Show details for a selected item
   * @param key The item key
   * @param details The item details
   */
  showItemDetails(key: string, details: any): void {
    // Access the details container and the list container
    const detailsContainer = document.getElementById('details-container');
    const listContainer = document.getElementById('list-container');

    if (detailsContainer && listContainer) {
      // Hide the list container
      listContainer.style.display = 'none';

      // Show the details container
      detailsContainer.style.display = 'block';

      // Clear the details container (remove any previous content)
      detailsContainer.innerHTML = '';

      // Create a "Back to List" button
      const backButton = document.createElement('button');
      backButton.textContent = 'Back to List';
      backButton.style.marginBottom = '1rem';
      backButton.style.padding = '0.5rem 1rem';
      backButton.style.backgroundColor = '#007BFF';
      backButton.style.color = 'white';
      backButton.style.border = 'none';
      backButton.style.borderRadius = '4px';
      backButton.style.cursor = 'pointer';

      // Back button click handler to go back to the list
      backButton.onclick = () => this.showList();

      // Add the back button to the details container
      detailsContainer.appendChild(backButton);

      // Create a title for the details
      const detailsTitle = document.createElement('h4');
      detailsTitle.textContent = `Details for "${key}"`;
      detailsContainer.appendChild(detailsTitle);

      // Display the details as a list
      const detailsList = document.createElement('ul');
      detailsList.style.listStyleType = 'none';
      detailsList.style.padding = '0';

      // Loop through the details and display each key-value pair
      for (const [detailKey, detailValue] of Object.entries(details)) {
        const detailItem = document.createElement('li');
        detailItem.style.marginBottom = '0.5rem';
        detailItem.style.padding = '0.5rem';
        detailItem.style.borderBottom = '1px solid #eaeaea';

        // Render key-value pairs
        detailItem.innerHTML = `<strong>${detailKey}:</strong> ${detailValue}`;
        detailsList.appendChild(detailItem);
      }

      // Append the details list to the container
      detailsContainer.appendChild(detailsList);
    }
  }

  /**
   * Show the list again
   */
  showList(): void {
    // Access the details container and the list container
    const detailsContainer = document.getElementById('details-container');
    const listContainer = document.getElementById('list-container');

    if (detailsContainer && listContainer) {
      // Hide the details container
      detailsContainer.style.display = 'none';

      // Show the list container
      listContainer.style.display = 'block';
    }
  }
}
