import { MetadataRenderer } from '../models/metadata-renderer.model';

export class ProgramIndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    const title = document.createElement('h4');
    title.textContent = `${details.name}`;
    title.style.color = 'blue';
    container.appendChild(title);

    const introduction = document.createElement('h4');
    introduction.textContent = 'Introduction';
    container.appendChild(introduction);

    const introductionDescroption = document.createElement('p');
    introductionDescroption.textContent = `
  ${details.name} is a ${details.aggregationType} program indicator, 
    ${details.description ? `described as ${details.description}. ` : ''}
    
  It’s labelled in short as ${details.shortName}
  ${details.code ? `and has a code of ${details.code}. ` : ''}
  In analytics,
  ${details.decimals ? ` it displays up to ${details.decimals} decimals. ` : ''}
  ${
    details.displayInForm ? `It’s set to display ${details.displayInForm}.` : ''
  }
`;
    container.appendChild(introductionDescroption);

    // Add additional program-specific details.
    const factsList = document.createElement('ul');
    const uidItem = document.createElement('li');
    uidItem.textContent = `Identified by: ${details.id}`;
    factsList.appendChild(uidItem);

    container.appendChild(factsList);

    const indicatorFactsTitle = document.createElement('h4');
    indicatorFactsTitle.textContent = 'Program Indicator Facts';
    container.appendChild(indicatorFactsTitle);

    const indicatorFactsSubTitle = document.createElement('p');
    indicatorFactsSubTitle.textContent = 'Belongs to the following program groups of indicators';
    container.appendChild(indicatorFactsSubTitle);

    
  }
}
