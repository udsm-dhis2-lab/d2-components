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
    indicatorFactsSubTitle.textContent =
      'Belongs to the following program groups of indicators';
    container.appendChild(indicatorFactsSubTitle);

    const calculationDetailsTitle = document.createElement('h4');
    calculationDetailsTitle.textContent = 'Calculation details';
    container.appendChild(calculationDetailsTitle);

    const calculationDetailsSubtitle = document.createElement('p');
    calculationDetailsSubtitle.innerHTML = `
    Calculation of the values will be ${details.aggregationType} of values across orgunit and period.<br>
    Program indicator calculation will be based on ${details.analyticsType}, for distinction purposes:
    `;
    container.appendChild(calculationDetailsSubtitle);

    const calculationDetailsDescription = document.createElement('ul');
    const calculationDetailsFirstItem = document.createElement('li');
    const calculationDetailsSecondtItem = document.createElement('li');
    calculationDetailsFirstItem.textContent =
      'Events implies, each event from data source is considered as independent row to be counted, and properties and details of the event are used to filter events.';
    calculationDetailsSecondtItem.textContent =
      'Enrollment implies, each enrollment from data source is considered as independent row to be counted, and events from any stage and other properties and details of enrollment are used to filter enrollments.';
    calculationDetailsDescription.appendChild(calculationDetailsFirstItem);
    calculationDetailsDescription.appendChild(calculationDetailsSecondtItem);
    container.appendChild(calculationDetailsDescription);

    const calculationDetailsExpressionTableTitle = document.createElement('p');
    calculationDetailsExpressionTableTitle.textContent =
      'Below are expression details on computing program indicator and it’s related data source';
    container.appendChild(calculationDetailsExpressionTableTitle);

    const calculationDetailsExpressionTable = document.createElement('table');
    calculationDetailsExpressionTable.style.borderCollapse = 'collapse';
    calculationDetailsExpressionTable.style.width = '100%';
    calculationDetailsExpressionTable.style.margin = '10px 0';

    const headerRow = document.createElement('tr');
    const headers = ['', 'Expression', 'Filter'];
    headers.forEach((headerText) => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.border = '1px solid #ddd';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f4f4f4';
      th.style.textAlign = 'left';
      headerRow.appendChild(th);
    });

    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = 'Details';
    tdLabel.style.border = '1px solid #ddd';
    tdLabel.style.padding = '8px';
    tr.appendChild(tdLabel);

    const tdExpression = document.createElement('td');
    tdExpression.textContent = `${details.expression}`;
    tdExpression.style.border = '1px solid #ddd';
    tdExpression.style.padding = '8px';
    tr.appendChild(tdExpression);

    const tdFilter = document.createElement('td');
    tdFilter.textContent = details.filter ? `${details.filter}` : '';
    tdFilter.style.border = '1px solid #ddd';
    tdFilter.style.padding = '8px';
    tr.appendChild(tdFilter);

    calculationDetailsExpressionTable.appendChild(headerRow);
    calculationDetailsExpressionTable.appendChild(tr);
    container.appendChild(calculationDetailsExpressionTable);

    const createdformattedDate = moment(details.created).format(
      'MMMM DD, YYYY'
    );
    const lastUpdatedFormattedDate = moment(details.lastUpdated).format(
      'MMMM DD, YYYY'
    );
    const accessibilitySharingSettingsTitle = document.createElement('h4');
    accessibilitySharingSettingsTitle.textContent =
      'Accessibility & Sharing settings';
    container.appendChild(accessibilitySharingSettingsTitle);

    const accessibilitySharingSettingsDescription = document.createElement('p');
    accessibilitySharingSettingsDescription.textContent = `This program indicator was first created on ${createdformattedDate} by ${details.createdBy.name} and last updated on ${lastUpdatedFormattedDate} by ${details.lastUpdatedBy.name}`;
    container.appendChild(accessibilitySharingSettingsDescription);
  
    const periodBoundariesTablesubtitle = document.createElement('p');
    periodBoundariesTablesubtitle.textContent = 'Below are period boundaries that determines which events or enrollments will be included in calculations of the program indicators, where for event analytics, event date will be used and for enrollment analytics, enrollment analytics will be used.';
    container.appendChild(periodBoundariesTablesubtitle);

    const periodBoundariesTable = document.createElement('table');
    periodBoundariesTable.style.borderCollapse = 'collapse';
    periodBoundariesTable.style.width = '100%';
    periodBoundariesTable.style.margin = '10px 0';

    const periodBoundaryheaderRow = document.createElement('tr');
    const periodBoundaryheaders = ['Boundary target', 'Analytics period boundary type', 'Offset period by amount', 'Period type'];
    periodBoundaryheaders.forEach((headerText) => {
      const periodBoundaryth = document.createElement('th');
      periodBoundaryth.textContent = headerText;
      periodBoundaryth.style.border = '1px solid #ddd';
      periodBoundaryth.style.padding = '8px';
      periodBoundaryth.style.backgroundColor = '#f4f4f4';
      periodBoundaryth.style.textAlign = 'left';
      periodBoundaryheaderRow.appendChild(periodBoundaryth);
    });

    periodBoundariesTable.appendChild(periodBoundaryheaderRow );

    const rows = details.analyticsPeriodBoundaries;

    rows.forEach( (row: { boundaryTarget: string; analyticsPeriodBoundaryType: string; }) => {
      const periodBoundarytr = document.createElement('tr');

      const tdBoundaryTarget = document.createElement('td');
      tdBoundaryTarget.textContent = row.boundaryTarget;
      tdBoundaryTarget.style.border = '1px solid #ddd';
      tdBoundaryTarget.style.padding = '8px';
      periodBoundarytr.appendChild(tdBoundaryTarget);

      const tdAnalyticsPeriodBoundaryType = document.createElement('td');
      tdAnalyticsPeriodBoundaryType.textContent = row.analyticsPeriodBoundaryType;
      tdAnalyticsPeriodBoundaryType.style.border = '1px solid #ddd';
      tdAnalyticsPeriodBoundaryType.style.padding = '8px';
      periodBoundarytr.appendChild(tdAnalyticsPeriodBoundaryType);
      
      const tdOffsetPeriodByAmount = document.createElement('td');
      tdOffsetPeriodByAmount.textContent = '';
      tdOffsetPeriodByAmount.style.border = '1px solid #ddd';
      tdOffsetPeriodByAmount.style.padding = '8px';
      periodBoundarytr.appendChild(tdOffsetPeriodByAmount);

      const tdPeriodType = document.createElement('td');
      tdPeriodType.textContent = '';
      tdPeriodType.style.border = '1px solid #ddd';
      tdPeriodType.style.padding = '8px';
      periodBoundarytr.appendChild(tdPeriodType);
      periodBoundariesTable.appendChild(periodBoundarytr);
    }
    );
    container.appendChild(periodBoundariesTable);


  }
}
