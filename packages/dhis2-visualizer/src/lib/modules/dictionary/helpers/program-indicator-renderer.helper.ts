import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';

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

    const dataSourcesTitle = document.createElement('h4');
    dataSourcesTitle.textContent = `Data sources (Datasets/Programs)`;
    container.appendChild(dataSourcesTitle);

    const dataSourcesSubtitle = document.createElement('p');
    //TODO: check on the issue of checking whether the event is case or individual( {{eventBased_i.e._case_or_individual(if-applicable)}} )
    dataSourcesSubtitle.textContent = `Indicator is captured from event based data collection with following program`;
    container.appendChild(dataSourcesSubtitle);

   const dataSourcesDescription = document.createElement('ul');
   const programItem = document.createElement('li');
   programItem.textContent = `${details.program.name} submitting records on every event(case or individual)`;
   dataSourcesDescription.appendChild(programItem);
   container.appendChild(dataSourcesDescription);

    const indicatorFactsTitle = document.createElement('h4');
    indicatorFactsTitle.textContent = 'Program Indicator Facts';
    container.appendChild(indicatorFactsTitle);

    const indicatorFactsSubTitle = document.createElement('p');
    indicatorFactsSubTitle.textContent = 'Belongs to the following program groups of indicators';
    container.appendChild(indicatorFactsSubTitle);

    const createdformattedDate = moment(details.created).format("MMMM DD, YYYY");
    const lastUpdatedFormattedDate = moment(details.lastUpdated).format("MMMM DD, YYYY");
    const accessibilitySharingSettingsTitle = document.createElement('h4');
    accessibilitySharingSettingsTitle.textContent = 'Accessibility & Sharing settings';
    container.appendChild(accessibilitySharingSettingsTitle);

    const accessibilitySharingSettingsDescription = document.createElement('p');
    accessibilitySharingSettingsDescription.textContent = `This program indicator was first created on ${createdformattedDate} by ${details.createdBy.name} and last updated on ${lastUpdatedFormattedDate} by ${details.lastUpdatedBy.name}`;
    container.appendChild(accessibilitySharingSettingsDescription);
  }
}
