import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';

export class ProgramIndicatorRenderer implements MetadataRenderer {
  formatString(str: string) {
    return str
      .replace(/_/g, ' ') // Replace underscores with spaces
      .toLowerCase() // Convert the entire string to lowercase first
      .replace(/\b\w/, (char) => char.toUpperCase()); // Capitalize only the first letter
  }

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

    const factsList = document.createElement('ul');

    // List item for the text
    const uidItem = document.createElement('li');

    // Normal text part
    const textBeforeLink = document.createElement('span');
    textBeforeLink.textContent = 'Identified by: ';
    uidItem.appendChild(textBeforeLink);

    const uidLink = document.createElement('a');
    uidLink.textContent = `${details.id}`;
    uidLink.href = `#${details.id}`;
    uidLink.style.textDecoration = 'underline';
    uidItem.appendChild(uidLink);
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

    // const indicatorFactsTitle = document.createElement('h4');
    // indicatorFactsTitle.textContent = 'Program Indicator Facts';
    // container.appendChild(indicatorFactsTitle);

    // const indicatorFactsSubTitle = document.createElement('p');
    // indicatorFactsSubTitle.textContent =
    //   'Belongs to the following program groups of indicators';
    // container.appendChild(indicatorFactsSubTitle);

    //Program Indicator Facts section
    const ProgramfactsTitle = document.createElement('h4');
    ProgramfactsTitle.textContent = 'Program Indicator Facts';
    container.appendChild(ProgramfactsTitle);

    const ProgramIndicatorFactsSubTitle = document.createElement('p');
    ProgramIndicatorFactsSubTitle.textContent =
      'Belongs to the following program groups of indicators';
    container.appendChild(ProgramIndicatorFactsSubTitle);

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

    const indicatorFactsrows = details.programIndicatorGroups;

    if(indicatorFactsrows.length !== 0) {
      indicatorFactsrows.forEach(
        (row: { name: string; programIndicators: any[] }, index: number) => {
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
          if (
            Array.isArray(row.programIndicators) &&
            row.programIndicators.length > 0
          ) {
            const ul = document.createElement('ul'); // Create a <ul> element
            row.programIndicators.forEach((indicator) => {
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
    } else {
      const indicatorFactsTr = document.createElement('tr');
      const indicatorFactsTdNoData = document.createElement('td');
      indicatorFactsTdNoData.textContent = 'No data available';
      indicatorFactsTdNoData.style.border = '1px solid #ddd';
      indicatorFactsTdNoData.style.padding = '8px';
      indicatorFactsTdNoData.style.textAlign = 'center'; 
      indicatorFactsTdNoData.style.color = 'grey'; 
      indicatorFactsTdNoData.colSpan = 100; 
      indicatorFactsTr.appendChild(indicatorFactsTdNoData);
      indicatorFactsTable.appendChild(indicatorFactsTr);
      container.appendChild(indicatorFactsTable);
    }

    //Related Indicators section
    const relatedIndicatorsTitle = document.createElement('h4');
    relatedIndicatorsTitle.textContent = 'Related Indicators';
    container.appendChild(relatedIndicatorsTitle);

    const relatedIndicatorsSubTitle = document.createElement('p');
    relatedIndicatorsSubTitle.textContent =
      'Below are set of indicators using program indicator as numerator or denominator in their calculations.';
    container.appendChild(relatedIndicatorsSubTitle);

    const relatedIndicatorsTable = document.createElement('table');
    relatedIndicatorsTable.style.borderCollapse = 'collapse';
    relatedIndicatorsTable.style.width = '100%';
    relatedIndicatorsTable.style.margin = '10px 0';

    const relatedIndicatorsTableHeaderRow = document.createElement('tr');
    const relatedIndicatorsTableHeaders = [
      '#',
      'Name',
      'Numerator',
      'Denominator',
      'Type',
      'Description',
    ];
    relatedIndicatorsTableHeaders.forEach((header) => {
      const relatedIndicatorsTableth = document.createElement('th');
      relatedIndicatorsTableth.textContent = header;
      relatedIndicatorsTableth.style.border = '1px solid #ddd';
      relatedIndicatorsTableth.style.padding = '8px';
      relatedIndicatorsTableth.style.backgroundColor = '#f4f4f4';
      relatedIndicatorsTableth.style.textAlign = 'left';
      relatedIndicatorsTableHeaderRow.appendChild(relatedIndicatorsTableth);
    });
    relatedIndicatorsTable.appendChild(relatedIndicatorsTableHeaderRow);

    const relatedIndicatorsTableRows = details.indicatorsWithProgramIndicators;

    if(relatedIndicatorsTableRows.length !== 0) {
      relatedIndicatorsTableRows.forEach(
        (
          row: {
            name: string;
            numerator: string;
            denominator: string;
            indicatorType: { name: string };
            description: string;
          },
          index: number
        ) => {
          const relatedIndicatorsTableRow = document.createElement('tr');
          const relatedIndicatorsTableIndex = document.createElement('td');
          relatedIndicatorsTableIndex.textContent = `${index + 1}`;
          relatedIndicatorsTableIndex.style.border = '1px solid #ddd';
          relatedIndicatorsTableIndex.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(relatedIndicatorsTableIndex);
  
          const relatedIndicatorsTableName = document.createElement('td');
          relatedIndicatorsTableName.textContent = row.name;
          relatedIndicatorsTableName.style.border = '1px solid #ddd';
          relatedIndicatorsTableName.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(relatedIndicatorsTableName);
  
          const relatedIndicatorsTableNumerator = document.createElement('td');
          relatedIndicatorsTableNumerator.textContent = row.numerator;
          relatedIndicatorsTableNumerator.style.border = '1px solid #ddd';
          relatedIndicatorsTableNumerator.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(relatedIndicatorsTableNumerator);
  
          const relatedIndicatorsTableDenominator = document.createElement('td');
          relatedIndicatorsTableDenominator.textContent = row.denominator;
          relatedIndicatorsTableDenominator.style.border = '1px solid #ddd';
          relatedIndicatorsTableDenominator.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(
            relatedIndicatorsTableDenominator
          );
  
          const relatedIndicatorsTableType = document.createElement('td');
          relatedIndicatorsTableType.textContent = row.indicatorType.name;
          relatedIndicatorsTableType.style.border = '1px solid #ddd';
          relatedIndicatorsTableType.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(relatedIndicatorsTableType);
  
          const relatedIndicatorsDescription = document.createElement('td');
          relatedIndicatorsDescription.textContent = row.description;
          relatedIndicatorsDescription.style.border = '1px solid #ddd';
          relatedIndicatorsDescription.style.padding = '8px';
          relatedIndicatorsTableRow.appendChild(relatedIndicatorsDescription);
          relatedIndicatorsTable.appendChild(relatedIndicatorsTableRow);
        }
      );
  
      container.appendChild(relatedIndicatorsTable);
    } else {
      const relatedIndicatorsTr = document.createElement('tr');
      const relatedIndicatorsTdNoData = document.createElement('td');
      relatedIndicatorsTdNoData.textContent = 'No data available';
      relatedIndicatorsTdNoData.style.border = '1px solid #ddd';
      relatedIndicatorsTdNoData.style.padding = '8px';
      relatedIndicatorsTdNoData.style.textAlign = 'center'; 
      relatedIndicatorsTdNoData.style.color = 'grey'; 
      relatedIndicatorsTdNoData.colSpan = 100; 
      relatedIndicatorsTr.appendChild(relatedIndicatorsTdNoData);
      relatedIndicatorsTable.appendChild(relatedIndicatorsTr);
      container.appendChild(relatedIndicatorsTable);
    }
    

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

    // const tdExpression = document.createElement('td');
    // tdExpression.textContent = `${details.programIndicatorExpression}`;
    // tdExpression.style.border = '1px solid #ddd';
    // tdExpression.style.padding = '8px';
    // tr.appendChild(tdExpression);

    const tdExpression = document.createElement('td');
    const expressionToggleButton = document.createElement('button');
    let isExpressionVisible = true; // Start with `programIndicatorExpression`

    const updateExpressionContent = () => {
      tdExpression.textContent = isExpressionVisible
        ? details.programIndicatorExpression
        : details.expression;

      expressionToggleButton.style.marginLeft = '10px';
      expressionToggleButton.textContent = isExpressionVisible
        ? 'Show Expression'
        : 'Show Description';

      tdExpression.appendChild(expressionToggleButton);
    };

    expressionToggleButton.onclick = () => {
      isExpressionVisible = !isExpressionVisible; // Toggle the visibility flag
      updateExpressionContent();
    };

    // Initialize content and attach button
    updateExpressionContent();

    tdExpression.style.border = '1px solid #ddd';
    tdExpression.style.padding = '8px';
    tr.appendChild(tdExpression);

    // const tdFilter = document.createElement('td');
    // tdFilter.textContent = details.filter ? `${details.filterDescription}` : '';
    // tdFilter.style.border = '1px solid #ddd';
    // tdFilter.style.padding = '8px';
    // tr.appendChild(tdFilter);

    const tdFilter = document.createElement('td');
    const filterToggleButton = document.createElement('button');
    let isFilterVisible = true; // Start with `filterDescription`

    const updateFilterContent = () => {
      // Update the text content based on visibility flag
      tdFilter.textContent = isFilterVisible
        ? details.filterDescription
        : details.filter;

      // Check if details.filter exists, and only show the button if it does
      if (details.filter) {
        filterToggleButton.style.marginLeft = '10px';
        filterToggleButton.textContent = isFilterVisible
          ? 'Show Filter'
          : 'Show Filter Description';

        // Append the button only if details.filter exists
        if (!tdFilter.contains(filterToggleButton)) {
          tdFilter.appendChild(filterToggleButton);
        }
      } else {
        // Remove the button if it exists, as details.filter is not present
        if (tdFilter.contains(filterToggleButton)) {
          tdFilter.removeChild(filterToggleButton);
        }
      }
    };

    filterToggleButton.onclick = () => {
      isFilterVisible = !isFilterVisible; // Toggle the visibility flag
      updateFilterContent();
    };

    // Initialize content and attach button
    updateFilterContent();

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

    const periodBoundariesTablesubtitle = document.createElement('p');
    periodBoundariesTablesubtitle.textContent =
      'Below are period boundaries that determines which events or enrollments will be included in calculations of the program indicators, where for event analytics, event date will be used and for enrollment analytics, enrollment analytics will be used.';
    container.appendChild(periodBoundariesTablesubtitle);

    const periodBoundariesTable = document.createElement('table');
    periodBoundariesTable.style.borderCollapse = 'collapse';
    periodBoundariesTable.style.width = '100%';
    periodBoundariesTable.style.margin = '10px 0';

    const periodBoundaryheaderRow = document.createElement('tr');
    const periodBoundaryheaders = [
      'Boundary target',
      'Analytics period boundary type',
      'Offset period by amount',
      'Period type',
    ];
    periodBoundaryheaders.forEach((headerText) => {
      const periodBoundaryth = document.createElement('th');
      periodBoundaryth.textContent = headerText;
      periodBoundaryth.style.border = '1px solid #ddd';
      periodBoundaryth.style.padding = '8px';
      periodBoundaryth.style.backgroundColor = '#f4f4f4';
      periodBoundaryth.style.textAlign = 'left';
      periodBoundaryheaderRow.appendChild(periodBoundaryth);
    });

    periodBoundariesTable.appendChild(periodBoundaryheaderRow);

    const rows = details.analyticsPeriodBoundaries;

    rows.forEach(
      (row: {
        boundaryTarget: string;
        analyticsPeriodBoundaryType: string;
        offsetPeriodType?: string;
        offsetPeriods?: string;
      }) => {
        const periodBoundarytr = document.createElement('tr');

        const tdBoundaryTarget = document.createElement('td');
        tdBoundaryTarget.textContent = this.formatString(row.boundaryTarget);
        tdBoundaryTarget.style.border = '1px solid #ddd';
        tdBoundaryTarget.style.padding = '8px';
        periodBoundarytr.appendChild(tdBoundaryTarget);

        const tdAnalyticsPeriodBoundaryType = document.createElement('td');
        tdAnalyticsPeriodBoundaryType.textContent = this.formatString(
          row.analyticsPeriodBoundaryType
        );
        tdAnalyticsPeriodBoundaryType.style.border = '1px solid #ddd';
        tdAnalyticsPeriodBoundaryType.style.padding = '8px';
        periodBoundarytr.appendChild(tdAnalyticsPeriodBoundaryType);

        const tdOffsetPeriodByAmount = document.createElement('td');
        tdOffsetPeriodByAmount.textContent = row.offsetPeriodType
          ? row.offsetPeriodType
          : '';
        tdOffsetPeriodByAmount.style.border = '1px solid #ddd';
        tdOffsetPeriodByAmount.style.padding = '8px';
        periodBoundarytr.appendChild(tdOffsetPeriodByAmount);

        const tdPeriodType = document.createElement('td');
        tdPeriodType.textContent = row.offsetPeriods ? row.offsetPeriods : '';
        tdPeriodType.style.border = '1px solid #ddd';
        tdPeriodType.style.padding = '8px';
        periodBoundarytr.appendChild(tdPeriodType);
        periodBoundariesTable.appendChild(periodBoundarytr);
      }
    );
    container.appendChild(periodBoundariesTable);

    // data elements in indicator section
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

    const dataElementrows = details.dataElementsInPogramIndicator;
    if (dataElementrows.length !== 0) {
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

        //TODO: More clarification on this
        // if (details.dataElementsFromNumerator.includes(row.id)) {
        //   tdDataElementExpression.textContent = 'Numerator';
        // } else if (details.dataElementsFromDenominator.includes(row.id)) {
        //   tdDataElementExpression.textContent = 'Denominator';
        // } else {
        //   tdDataElementExpression.textContent = ''; // Empty if not found in either
        // }
        tdDataElementExpression.textContent = '';
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
    } else {
      const dataElementTr = document.createElement('tr');
      const dataElementTdNoData = document.createElement('td');
      dataElementTdNoData.textContent = 'No data available';
      dataElementTdNoData.style.border = '1px solid #ddd';
      dataElementTdNoData.style.padding = '8px';
      dataElementTdNoData.style.textAlign = 'center'; 
      dataElementTdNoData.style.color = 'grey'; 
      dataElementTdNoData.colSpan = 100; 
      dataElementTr.appendChild(dataElementTdNoData);
      dataElementsTable.appendChild(dataElementTr);
      container.appendChild(dataElementsTable);
    }

    //Accessibility & Sharing settings section
    const accessibilitySharingSettingsTitle = document.createElement('h4');
    accessibilitySharingSettingsTitle.textContent =
      'Accessibility & Sharing settings';
    container.appendChild(accessibilitySharingSettingsTitle);

    const accessibilitySharingSettingsDescription = document.createElement('p');
    accessibilitySharingSettingsDescription.textContent = `This program indicator was first created on ${createdformattedDate} by ${details.createdBy.name} and last updated on ${lastUpdatedFormattedDate} by ${details.lastUpdatedBy.name}`;
    container.appendChild(accessibilitySharingSettingsDescription);
  }
}
