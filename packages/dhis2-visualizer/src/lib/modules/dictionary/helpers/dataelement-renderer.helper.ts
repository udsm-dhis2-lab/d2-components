import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';

export class DataElementRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    // Title
    const title = document.createElement('h4');
    title.textContent = details.name;
    container.appendChild(title);

    // Introduction
    const intro = document.createElement('p');
    intro.textContent = `${details.name} can be described as ${details.description || 'No description provided.'}`;
    container.appendChild(intro);

    // Short name, code, form name
    const shortInfo = document.createElement('p');
    shortInfo.textContent = `It’s labelled in short as ${details.shortName || '-'} and has a code of ${details.code || '-'}.
      In data entry form, it’s named “${details.formName || '-'}”`;
    container.appendChild(shortInfo);

    // UID
    const uid = document.createElement('p');
    uid.textContent = `Identified by: ${details.id}`;
    container.appendChild(uid);

    // Data sources (Datasets/Programs)
    const sources = document.createElement('p');
    sources.textContent = 'Data element is captured from:';
    container.appendChild(sources);

    // Datasets
    if (details.dataSetElements?.length) {
      details.dataSetElements.forEach((ds: any) => {
        const dsInfo = document.createElement('p');
        dsInfo.textContent = `${ds.dataSet.name} submitting ${ds.dataSet.periodType} after every ${ds.dataSet.timelyDays || '-'} days`;
        container.appendChild(dsInfo);
      });
    }

    // Programs (if available)
    if (details.programs?.length) {
      details.programs.forEach((program: any) => {
        const progInfo = document.createElement('p');
        progInfo.textContent = `${program.name} submitting records on every event (case or individual)`;
        container.appendChild(progInfo);
      });
    }

    // Data element Facts
    const facts = document.createElement('h4');
    facts.textContent = 'Data element Facts';
    container.appendChild(facts);

    const factsList = document.createElement('ul');
    factsList.innerHTML = `
      <li>Accepts only ${details.valueType} to enforce validation</li>
      <li>Has ${details.validationRulesMatchCount || 0} related validation rules</li>
      <li>Part of numerators of ${details.dataElementInNumeratorLength || "-"} indicators</li>
      <li>Part of denominators of ${details.dataElementInDenominatorLength || "-"} indicators</li>
    `;
    container.appendChild(factsList);

    // Analytics Details
    const analytics = document.createElement('h4');
    analytics.textContent = 'Analytics Details';
    container.appendChild(analytics);

    const analyticsList = document.createElement('ul');
    analyticsList.innerHTML = `
      <li>${details.aggregationType} through period and hierarchy</li>
      <li>${details.domainType} data sources</li>
      <li>${details.zeroIsSignificant ? 'Stores zero data values' : 'Does not store zero data values'}</li>
      <li>${details.categoryCombo?.name || '-'} cross-tabulation between categories</li>
    `;
    container.appendChild(analyticsList);

    // Accessibility & Sharing settings
    const createdDate = details.created ? moment(details.created).format('MMMM DD, YYYY') : '-';
    const lastUpdated = details.lastUpdated ? moment(details.lastUpdated).format('MMMM DD, YYYY') : '-';
    const createdBy = details.createdBy?.name || '-';
    const lastUpdatedBy = details.lastUpdatedBy?.name || '-';

    const access = document.createElement('p');
    access.textContent = `This data element was first created on ${createdDate} by ${createdBy} and last updated on ${lastUpdated} by ${lastUpdatedBy}.`;
    container.appendChild(access);
  }
}