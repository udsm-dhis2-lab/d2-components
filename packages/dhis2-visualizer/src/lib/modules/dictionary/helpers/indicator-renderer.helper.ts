import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';

export class IndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();
    const title = document.createElement('h4');
    title.textContent = `${details.name}`;
    title.style.color = 'blue';
    container.appendChild(title);

    const introductionTitle = document.createElement('h4');
    introductionTitle.textContent = 'Introduction';
    container.appendChild(introductionTitle);

    const intro = document.createElement('p');
    intro.textContent = `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`;
    container.appendChild(intro);

    const uid = document.createElement('p');

    // Normal text part
    const textBeforeLink = document.createElement('span');
    textBeforeLink.textContent = 'Identified by: ';
    container.appendChild(textBeforeLink);

    // Link part for details.id
    const uidLink = document.createElement('a');
    uidLink.textContent = `${details.id}`;
    //TODO: replace with required route
    uidLink.href = `#${details.id}`;
    uidLink.style.textDecoration = 'underline';
    container.appendChild(uidLink);

    if (details.description) {
      const description = document.createElement('p');
      description.textContent = `Description: ${details.description}`;
      container.appendChild(description);
    }

    const factsTitle = document.createElement('h4');
    factsTitle.textContent = 'Indicator Facts';
    container.appendChild(factsTitle);

    const indicatorFactsTable = document.createElement('table');
    indicatorFactsTable.style.borderCollapse = 'collapse';
    indicatorFactsTable.style.width = '100%';
    indicatorFactsTable.style.margin = '10px 0';

    const indicatorFactsHeaderRow = document.createElement('tr');
    const indicatorFactsHeaders = ['#', 'Name', 'Code', 'Indicators'];
    indicatorFactsHeaders.forEach((headerText) => {
      const indicatorFactsth = document.createElement('th');
      indicatorFactsth.textContent = headerText;
      indicatorFactsth.style.border = '1px solid #ddd';
      indicatorFactsth.style.padding = '8px';
      indicatorFactsth.style.backgroundColor = '#f4f4f4';
      indicatorFactsth.style.textAlign = 'left';
      indicatorFactsHeaderRow.appendChild(indicatorFactsth);
    });

    indicatorFactsTable.appendChild(indicatorFactsHeaderRow);

    const indicatorFactsrows = details.indicatorGroups;

    indicatorFactsrows.forEach(
      (row: { name: string; indicators: any[] }, index: number) => {
        const indicatorFactstr = document.createElement('tr');
        const tdIndex = document.createElement('td');
        tdIndex.textContent = (index + 1).toString();
        tdIndex.style.border = '1px solid #ddd';
        tdIndex.style.padding = '8px';
        indicatorFactstr.appendChild(tdIndex);

        const tdName = document.createElement('td');
        tdName.textContent = row.name;
        tdName.style.border = '1px solid #ddd';
        tdName.style.padding = '8px';
        indicatorFactstr.appendChild(tdName);

        const tdCode = document.createElement('td');
        //TODO: find the right code to show
        tdCode.textContent = 'None';
        tdCode.style.border = '1px solid #ddd';
        tdCode.style.padding = '8px';
        indicatorFactstr.appendChild(tdCode);

        const tdIndicators = document.createElement('td');

        // Check if `indicators` is an array and has data
        if (Array.isArray(row.indicators) && row.indicators.length > 0) {
          const ul = document.createElement('ul'); // Create a <ul> element
          row.indicators.forEach((indicator) => {
            const li = document.createElement('li'); // Create a <li> for each indicator
            li.textContent = indicator.name; // Set the name as the content of the <li>
            ul.appendChild(li); // Append the <li> to the <ul>
          });
          tdIndicators.appendChild(ul); // Append the <ul> to the td
        } else {
          tdIndicators.textContent = 'None';
        }

        tdIndicators.style.border = '1px solid #ddd';
        tdIndicators.style.padding = '8px';
        indicatorFactstr.appendChild(tdIndicators);
        indicatorFactsTable.appendChild(indicatorFactstr);
      }
    );

    container.appendChild(indicatorFactsTable);

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
        //TODO: handle sources for different expressions eg R{} and #{} and for constants
        value: details.numeratorExpressionMeaning || '',
        sources: '',
      },
      {
        label: 'Denominator',
        value: details.denominatorExpressionMeaning || '',
        //TODO: handle sources for different expressions eg R{} and #{} and for constants
        sources: '',
      },
    ];

    rows.forEach((row, index) => {
      const tr = document.createElement('tr');

      // Label column
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tdLabel.style.border = '1px solid #ddd';
      tdLabel.style.padding = '8px';
      tr.appendChild(tdLabel);

      // Value column with toggle button
      const tdValue = document.createElement('td');
      tdValue.style.border = '1px solid #ddd';
      tdValue.style.padding = '8px';

      // Create a span to hold the value
      const valueSpan = document.createElement('span');
      valueSpan.textContent = row.value; // Initial value
      tdValue.appendChild(valueSpan);

      // Create a toggle button
      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Show Expression'; // Initial button text
      toggleButton.style.marginLeft = '10px'; // Add some spacing
      toggleButton.style.cursor = 'pointer';

      // Add event listener for the toggle button
      toggleButton.addEventListener('click', () => {
        if (row.label === 'Numerator') {
          const currentValue = valueSpan.textContent;
          if (currentValue === details.numeratorExpressionMeaning) {
            valueSpan.textContent = details.numerator;
            toggleButton.textContent = 'Show description';
          } else {
            valueSpan.textContent = details.numeratorExpressionMeaning;
            toggleButton.textContent = 'Show Formula';
          }
        } else if (row.label === 'Denominator') {
          const currentValue = valueSpan.textContent;
          if (currentValue === details.denominatorExpressionMeaning) {
            valueSpan.textContent = details.denominator;
            toggleButton.textContent = 'Show description';
          } else {
            valueSpan.textContent = details.denominatorExpressionMeaning;
            toggleButton.textContent = 'Show Formula';
          }
        }
      });

      tdValue.appendChild(toggleButton);
      tr.appendChild(tdValue);

      // Sources column
      const tdSources = document.createElement('td');
      tdSources.textContent = row.sources;
      tdSources.style.border = '1px solid #ddd';
      tdSources.style.padding = '8px';
      tr.appendChild(tdSources);

      table.appendChild(tr);
    });

    // rows.forEach((row) => {
    //   const tr = document.createElement('tr');

    //   const tdLabel = document.createElement('td');
    //   tdLabel.textContent = row.label;
    //   tdLabel.style.border = '1px solid #ddd';
    //   tdLabel.style.padding = '8px';
    //   tr.appendChild(tdLabel);

    //   const tdValue = document.createElement('td');
    //   tdValue.textContent = row.value;
    //   tdValue.style.border = '1px solid #ddd';
    //   tdValue.style.padding = '8px';
    //   tr.appendChild(tdValue);

    //   const tdSources = document.createElement('td');
    //   tdSources.textContent = row.sources;
    //   tdSources.style.border = '1px solid #ddd';
    //   tdSources.style.padding = '8px';
    //   tr.appendChild(tdSources);

    //   table.appendChild(tr);
    // });

    container.appendChild(table);

    const dataElementsTitle = document.createElement('h4');
    dataElementsTitle.textContent = 'Data elements in indicator';
    container.appendChild(dataElementsTitle);

    const dataElementsSubtitle = document.createElement('p');
    dataElementsSubtitle.textContent =
      'The following is the summary of the data elements used in the calculations';
    container.appendChild(dataElementsSubtitle);

    const dataElementsTable = document.createElement('table');
    dataElementsTable.style.borderCollapse = 'collapse';
    dataElementsTable.style.width = '100%';
    dataElementsTable.style.margin = '10px 0';

    const dataElementsHeaderRow = document.createElement('tr');
    const dataElementsTableHeaders = [
      '#',
      'Name',
      'Expression part (Numerator/ Denominator)',
      'Aggregation',
      'Value Type',
      'Zero Significance',
      'Categories',
      'Data Sets/ Programs',
      'Groups',
    ];
    dataElementsTableHeaders.forEach((headerText) => {
      const dataElementsTableth = document.createElement('th');
      dataElementsTableth.textContent = headerText;
      dataElementsTableth.style.border = '1px solid #ddd';
      dataElementsTableth.style.padding = '8px';
      dataElementsTableth.style.backgroundColor = '#f4f4f4';
      dataElementsTableth.style.textAlign = 'left';
      dataElementsHeaderRow.appendChild(dataElementsTableth);
    });

    dataElementsTable.appendChild(dataElementsHeaderRow);

    const dataElementrows = details.dataElementsList;

    dataElementrows.forEach((row: any, index: number) => {
      const dataElementTr = document.createElement('tr');
      const tdDataElementIndex = document.createElement('td');
      tdDataElementIndex.textContent = (index + 1).toString();
      tdDataElementIndex.style.border = '1px solid #ddd';
      tdDataElementIndex.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementIndex);

      const tdDataElementName = document.createElement('td');
      tdDataElementName.textContent = row.name;
      tdDataElementName.style.border = '1px solid #ddd';
      tdDataElementName.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementName);

      const tdDataElementExpression = document.createElement('td');
      //TODO: find the right code to show
      if (details.dataElementsFromNumerator.includes(row.id)) {
        tdDataElementExpression.textContent = 'Numerator';
      } else if (details.dataElementsFromDenominator.includes(row.id)) {
        tdDataElementExpression.textContent = 'Denominator';
      } else {
        tdDataElementExpression.textContent = ''; // Empty if not found in either
      }
      tdDataElementExpression.style.border = '1px solid #ddd';
      tdDataElementExpression.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementExpression);

      const tdDataElementAggregationType = document.createElement('td');
      tdDataElementAggregationType.textContent = row.aggregationType;
      tdDataElementAggregationType.style.border = '1px solid #ddd';
      tdDataElementAggregationType.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementAggregationType);

      const tdDataElementValueType = document.createElement('td');
      tdDataElementValueType.textContent = row.valueType;
      tdDataElementValueType.style.border = '1px solid #ddd';
      tdDataElementValueType.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementValueType);

      const tdDataElementZeroSignificance = document.createElement('td');
      tdDataElementZeroSignificance.textContent = row.zeroIsSignificant;
      tdDataElementZeroSignificance.style.border = '1px solid #ddd';
      tdDataElementZeroSignificance.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementZeroSignificance);

      const tdDataElementCategories = document.createElement('td');

      const ul = document.createElement('ul');
      row.categoryCombo.categoryOptionCombos?.[0]?.categoryOptions?.[0]?.categories?.forEach(
        (category: { name: string }) => {
          const li = document.createElement('li');
          li.textContent = category.name;
          ul.appendChild(li);
        }
      );
      // row.categoryCombo.categoryOptionCombos?.forEach((combo: { categoryOptions: { categories: { name: string; }[]; }[]; }) => {
      //   combo.categoryOptions?.forEach((option: { categories: { name: string; }[]; }) => {
      //     option.categories?.forEach((category: { name: string; }) => {
      //       const li = document.createElement('li'); // Create a <li> for each category
      //       li.textContent = category.name; // Set the category name as the list item's content
      //       ul.appendChild(li); // Append the <li> to the <ul>
      //     });
      //   });
      // });
      tdDataElementCategories.appendChild(ul);

      tdDataElementCategories.style.border = '1px solid #ddd';
      tdDataElementCategories.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementCategories);

      const tdDataElementsDataSets = document.createElement('td');

      const tdDataElementsDataSetsul = document.createElement('ul');
      row.dataSetElements.forEach(
        (dataSetElement: { dataSet: { name: string } }) => {
          const li = document.createElement('li');
          li.textContent = dataSetElement.dataSet.name;
          tdDataElementsDataSetsul.appendChild(li);
        }
      );
      tdDataElementsDataSets.appendChild(tdDataElementsDataSetsul);

      tdDataElementsDataSets.style.border = '1px solid #ddd';
      tdDataElementsDataSets.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementsDataSets);

      const tdDataElementsgroups = document.createElement('td');

      const tdDataElementsgroupsul = document.createElement('ul');
      row.dataElementGroups.forEach(
        (dataSetGroup: { name: string; dataElements: number }) => {
          const li = document.createElement('li');
          li.textContent = `${dataSetGroup.name}: with other ${(
            dataSetGroup.dataElements - 1
          ).toString()} data elements`; // Set the name as the content of the <li>
          tdDataElementsgroupsul.appendChild(li);
        }
      );
      tdDataElementsgroups.appendChild(tdDataElementsgroupsul);

      tdDataElementsgroups.style.border = '1px solid #ddd';
      tdDataElementsgroups.style.padding = '8px';
      dataElementTr.appendChild(tdDataElementsgroups);
      dataElementsTable.appendChild(dataElementTr);
    });

    // const tdDataElementsDataSets = document.createElement('td');

    //     // Check if `indicators` is an array and has data
    //    // if (Array.isArray(row.indicators) && row.indicators.length > 0) {
    //       const ul = document.createElement('ul'); // Create a <ul> element
    //       row.dataSetElements.forEach((dataSetElement) => {
    //         const li = document.createElement('li'); // Create a <li> for each indicator
    //         li.textContent = dataSetElement.dataSet.name; // Set the name as the content of the <li>
    //         ul.appendChild(li); // Append the <li> to the <ul>
    //       });
    //       tdDataElementsDataSets.appendChild(ul); // Append the <ul> to the td
    //    // } else {
    //     //  tdIndicators.textContent = 'None';
    //    // }

    //     tdDataElementsDataSets.style.border = '1px solid #ddd';
    //     tdDataElementsDataSets.style.padding = '8px';
    //     dataElementTr.appendChild(tdDataElementsDataSets);
    //   }
    // );

    // const tdDataElementsgroups = document.createElement('td');

    //     // Check if `indicators` is an array and has data
    //    // if (Array.isArray(row.indicators) && row.indicators.length > 0) {
    //       const ul = document.createElement('ul'); // Create a <ul> element
    //       row.dataSetElements.forEach((dataSetGroup) => {
    //         const li = document.createElement('li'); // Create a <li> for each indicator
    //         li.textContent = dataSetGroup.name; // Set the name as the content of the <li>
    //         ul.appendChild(li); // Append the <li> to the <ul>
    //       });
    //       tdDataElementsgroups.appendChild(ul); // Append the <ul> to the td
    //    // } else {
    //     //  tdIndicators.textContent = 'None';
    //    // }

    //     tdDataElementsgroups.style.border = '1px solid #ddd';
    //     tdDataElementsgroups.style.padding = '8px';
    //     dataElementTr.appendChild(tdDataElementsgroups);
    //   }
    // );

    container.appendChild(dataElementsTable);
    console.log('data element table', dataElementsTable);

    const createdformattedDate = moment(details.created).format(
      'MMMM DD, YYYY'
    );
    const lastUpdatedFormattedDate = moment(details.lastUpdated).format(
      'MMMM DD, YYYY'
    );

    const programIndicatorsTitle = document.createElement('h4');
    programIndicatorsTitle.textContent = 'Program Indicators in indicator';
    container.appendChild(programIndicatorsTitle);

    const programIndicatorsSubtitle = document.createElement('p');
    programIndicatorsSubtitle.textContent =
      'The following is the summary of the program indicators used in calculations:';
    container.appendChild(programIndicatorsSubtitle);

    const programIndicatorsTable = document.createElement('table');
    programIndicatorsTable.style.borderCollapse = 'collapse';
    programIndicatorsTable.style.width = '100%';
    programIndicatorsTable.style.margin = '10px 0';

    const programIndicatorsHeaderRow = document.createElement('tr');
    const programIndicatorsHeaders = [
      '#',
      'Name',
      'Expression part',
      'Filter',
      'Aggregation Type',
      'Analytics Type',
      'Period Boundaries',
      'Legends',
      'Groups',
    ];
    programIndicatorsHeaders.forEach((headerText) => {
      const programIndicatorsTableth = document.createElement('th');
      programIndicatorsTableth.textContent = headerText;
      programIndicatorsTableth.style.border = '1px solid #ddd';
      programIndicatorsTableth.style.padding = '8px';
      programIndicatorsTableth.style.backgroundColor = '#f4f4f4';
      programIndicatorsTableth.style.textAlign = 'left';
      programIndicatorsHeaderRow.appendChild(programIndicatorsTableth);
    });

    programIndicatorsTable.appendChild(programIndicatorsHeaderRow);

    const programIndicatorRows = details.programIndicatorsInIndicator;

    programIndicatorRows.forEach(
      (
        row: {
          name: string;
          expression: string;
          filter: string;
          aggregationType: string;
          analyticsType: string;
          analyticsPeriodBoundaries: { analyticsPeriodBoundaryType: string }[];
          programIndicatorGroups: { name: string }[];
        },
        index: number
      ) => {
        const programIndicatorTr = document.createElement('tr');
        const tdprogramIndicatorIndex = document.createElement('td');
        tdprogramIndicatorIndex.textContent = (index + 1).toString();
        tdprogramIndicatorIndex.style.border = '1px solid #ddd';
        tdprogramIndicatorIndex.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorIndex);

        const tdprogramIndicatorName = document.createElement('td');
        tdprogramIndicatorName.textContent = row.name;
        tdprogramIndicatorName.style.border = '1px solid #ddd';
        tdprogramIndicatorName.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorName);

        const tdprogramIndicatorExpression = document.createElement('td');
        tdprogramIndicatorExpression.textContent = row.expression;
        tdprogramIndicatorExpression.style.border = '1px solid #ddd';
        tdprogramIndicatorExpression.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorExpression);

        const tdprogramIndicatorFilter = document.createElement('td');
        tdprogramIndicatorFilter.textContent = row.filter;
        tdprogramIndicatorFilter.style.border = '1px solid #ddd';
        tdprogramIndicatorFilter.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorFilter);

        const tdprogramIndicatorAggregation = document.createElement('td');
        tdprogramIndicatorAggregation.textContent = row.aggregationType;
        tdprogramIndicatorAggregation.style.border = '1px solid #ddd';
        tdprogramIndicatorAggregation.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorAggregation);

        const tdprogramIndicatorAnalytics = document.createElement('td');
        tdprogramIndicatorAnalytics.textContent = row.analyticsType;
        tdprogramIndicatorAnalytics.style.border = '1px solid #ddd';
        tdprogramIndicatorAnalytics.style.padding = '8px';
        programIndicatorTr.appendChild(tdprogramIndicatorAnalytics);

        const tdProgramIndicatorPeriod = document.createElement('td');

        const tdProgramIndicatorPeriodul = document.createElement('ul');
        console.log('analytic periods', row.filter);
        row.analyticsPeriodBoundaries.forEach(
          (analyticsPeriodBoundary: {
            analyticsPeriodBoundaryType: string;
          }) => {
            const li = document.createElement('li');
            li.textContent =
              analyticsPeriodBoundary.analyticsPeriodBoundaryType;
            tdProgramIndicatorPeriodul.appendChild(li);
          }
        );
        tdProgramIndicatorPeriod.appendChild(tdProgramIndicatorPeriodul);

        tdProgramIndicatorPeriod.style.border = '1px solid #ddd';
        tdProgramIndicatorPeriod.style.padding = '8px';
        programIndicatorTr.appendChild(tdProgramIndicatorPeriod);

        // TODO: follow up on what to put on legends
        const tdProgramIndicatorLegends = document.createElement('td');
        tdProgramIndicatorLegends.textContent = 'none';
        tdProgramIndicatorLegends.style.border = '1px solid #ddd';
        tdProgramIndicatorLegends.style.padding = '8px';
        programIndicatorTr.appendChild(tdProgramIndicatorLegends);

        const tdProgramIndicatorGroups = document.createElement('td');
        const tdProgramIndicatorGroupsUl = document.createElement('ul');
        row.programIndicatorGroups.forEach((group: { name: string }) => {
          const li = document.createElement('li');
          li.textContent = group.name;
          tdProgramIndicatorGroupsUl.appendChild(li);
        });
        tdProgramIndicatorGroups.appendChild(tdProgramIndicatorGroupsUl);
        tdProgramIndicatorGroups.style.border = '1px solid #ddd';
        tdProgramIndicatorGroups.style.padding = '8px';
        programIndicatorTr.appendChild(tdProgramIndicatorGroups);
        programIndicatorsTable.appendChild(programIndicatorTr);
      }
    );
    container.appendChild(programIndicatorsTable);

    // datasets/reporting rates section
    const dataSetsTitle = document.createElement('h4');
    dataSetsTitle.textContent = 'Datasets (Reporting rates) in indicator';
    container.appendChild(dataSetsTitle);

    const dataSetsSubTitle = document.createElement('p');
    dataSetsSubTitle.textContent =
      'The following is the summary of the datasets (reporting rates) used in calculations:';
    container.appendChild(dataSetsSubTitle);

    const dataSetsTable = document.createElement('table');
    dataSetsTable.style.borderCollapse = 'collapse';
    dataSetsTable.style.width = '100%';
    dataSetsTable.style.margin = '10px 0';

    const dataSetsTableHeaderRow = document.createElement('tr');
    const dataSetsTableHeaders = [
      '#',
      'Name',
      'Description',
      'Timely Submission',
      'Expiry days',
      'Period type',
      'Assigned orgunits',
      'Data elements',
      'Legends',
    ];

    dataSetsTableHeaders.forEach((headerText) => {
      const dataSetsTableHeaderTh = document.createElement('th');
      dataSetsTableHeaderTh.textContent = headerText;
      dataSetsTableHeaderTh.style.border = '1px solid #ddd';
      dataSetsTableHeaderTh.style.padding = '8px';
      dataSetsTableHeaderTh.style.backgroundColor = '#f4f4f4';
      dataSetsTableHeaderTh.style.textAlign = 'left';
      dataSetsTableHeaderRow.appendChild(dataSetsTableHeaderTh);
    });

    dataSetsTable.appendChild(dataSetsTableHeaderRow);

    const dataSetsTableRows = details.dataSetsInIndicator;
    console.log('datasets', dataSetsTableRows );

    dataSetsTableRows.forEach((row: { name: string; description: string; timelyDays: string; expiryDays: string; periodType: string; organisationUnits: { name: string; }[]; dataSetElements: { dataElement: { name: string; }; }[]; }, index: number) => {
      const dataSetsTr = document.createElement('tr');
      const tddataSetsIndex = document.createElement('td');
      tddataSetsIndex.textContent = (index + 1).toString();
      tddataSetsIndex.style.border = '1px solid #ddd';
      tddataSetsIndex.style.padding = '8px';
      dataSetsTr.appendChild(tddataSetsIndex);

      const tdDataSetName = document.createElement('td');
      tdDataSetName.textContent = row.name;
      tdDataSetName.style.border = '1px solid #ddd';
      tdDataSetName.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetName);

      const tdDataSetDescription = document.createElement('td');
      tdDataSetDescription.textContent = row.description;
      tdDataSetDescription.style.border = '1px solid #ddd';
      tdDataSetDescription.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetDescription);

      const tdDataSetTimelySubmission = document.createElement('td');
      tdDataSetTimelySubmission.textContent = row.timelyDays;
      tdDataSetTimelySubmission.style.border = '1px solid #ddd';
      tdDataSetTimelySubmission.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetTimelySubmission);

      const tdDataSetExpiryDays = document.createElement('td');
      tdDataSetExpiryDays.textContent = row.expiryDays;
      tdDataSetExpiryDays.style.border = '1px solid #ddd';
      tdDataSetExpiryDays.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetExpiryDays);

      const tdDataSetPeriodType = document.createElement('td');
      tdDataSetPeriodType.textContent = row.periodType;
      tdDataSetPeriodType.style.border = '1px solid #ddd';
      tdDataSetPeriodType.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetPeriodType);

      const tdDataSetOrgUnits = document.createElement('td');
      const tdDataSetOrgUnitsUl = document.createElement('ul');
      row.organisationUnits.forEach((orgUnit: { name: string }) => {
        const li = document.createElement('li');
        li.textContent = orgUnit.name;
        tdDataSetOrgUnitsUl.appendChild(li);
      });
      tdDataSetOrgUnits.appendChild(tdDataSetOrgUnitsUl);
      tdDataSetOrgUnits.style.border = '1px solid #ddd';
      tdDataSetOrgUnits.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetOrgUnits);

      const tdDataSetDataElements = document.createElement('td');
      const tdDataSetDataElementsUl = document.createElement('ul');
      row.dataSetElements.forEach((dataSetElement: { dataElement: { name: string; }; }) => {
       const li = document.createElement('li');
       li.textContent = dataSetElement.dataElement.name;
       tdDataSetDataElementsUl.appendChild(li);
      });
      tdDataSetDataElements.appendChild(tdDataSetDataElementsUl);
      tdDataSetDataElements.style.border = '1px solid #ddd';
      tdDataSetDataElements.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetDataElements);

      const tdDataSetExpiryLegends = document.createElement('td');
      tdDataSetExpiryLegends.textContent = 'none';
      tdDataSetExpiryLegends.style.border = '1px solid #ddd';
      tdDataSetExpiryLegends.style.padding = '8px';
      dataSetsTr.appendChild(tdDataSetExpiryLegends);
      dataSetsTable.appendChild(dataSetsTr);
    });

    container.appendChild(dataSetsTable);

    const accessibilitySharingSettingsTitle = document.createElement('h4');
    accessibilitySharingSettingsTitle.textContent =
      'Accessibility & Sharing settings';
    container.appendChild(accessibilitySharingSettingsTitle);

    const accessibilitySharingSettingsDescription = document.createElement('p');
    accessibilitySharingSettingsDescription.textContent = `This indicator was first created on ${createdformattedDate} by ${details.createdBy.name} and last updated on ${lastUpdatedFormattedDate} by ${details.lastUpdatedBy.name}`;
    container.appendChild(accessibilitySharingSettingsDescription);
  }
}
