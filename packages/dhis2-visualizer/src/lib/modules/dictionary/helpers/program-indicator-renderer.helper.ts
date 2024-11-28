import { MetadataRenderer } from '../models/metadata-renderer.model';

export class ProgramIndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    const title = document.createElement('h4');
    title.textContent = `${details.name}`;
    container.appendChild(title);

    const description = document.createElement('p');
    description.textContent = `Description: ${details.description}`;
    container.appendChild(description);

    // Add additional program-specific details.
    const factsList = document.createElement('ul');
    const uidItem = document.createElement('li');
    uidItem.textContent = `UID: ${details.id}`;
    factsList.appendChild(uidItem);

    container.appendChild(factsList);
  }
}
