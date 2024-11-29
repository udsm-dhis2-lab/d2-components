import { MetadataRenderer } from '../models/metadata-renderer.model';

export class IndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();
    const title = document.createElement('h4');
    title.textContent = `${details.name}`;
    container.appendChild(title);

    const intro = document.createElement('p');
    intro.textContent = `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`;
    container.appendChild(intro);

    const uid = document.createElement('p');
    uid.textContent = `Identified by: ${details.id}`;
    container.appendChild(uid);

    if (details.description) {
      const description = document.createElement('p');
      description.textContent = `Description: ${details.description}`;
      container.appendChild(description);
    }

    const factsTitle = document.createElement('h4');
    factsTitle.textContent = 'Indicator Facts';
    container.appendChild(factsTitle);

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

    container.appendChild(factsList);

    const subtitle = document.createElement('p');
    subtitle.textContent =
      'Below are expressions computing numerator and denominator, and related sources.';
    container.appendChild(subtitle);

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
        value: details.numeratorDescription || '',
        sources: details.numeratorSources || '',
      },
      {
        label: 'Denominator',
        value: details.denominatorDescription || '',
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

    container.appendChild(table);
  }
}
