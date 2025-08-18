import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';
import { TableColumn } from '../models/table.model';
import {
  renderIntroductionDetails,
  renderIntroductionTitle,
  renderSectionTitle,
  renderTable,
  renderTitle,
} from './helpers';

export class IndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    // Main wrapper
    const wrapper = document.createElement('div');
    wrapper.style.fontFamily = 'Segoe UI, Arial, sans-serif';

    // Title
    wrapper.appendChild(renderTitle(details.name));

    // Introduction
    const introductionSection = document.createElement('section');
    introductionSection.style.marginBottom = '20px';

    introductionSection.appendChild(renderIntroductionTitle('Introduction'));

    const introDetails = renderIntroductionDetails(
      `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`
    );
    introductionSection.appendChild(introDetails);

    // ID with tooltip
    const idRow = document.createElement('div');
    idRow.style.marginBottom = '8px';
    idRow.innerHTML = `<span>Identified by: </span>
      <a href="#${details.id}" title="Copy ID" style="color:#1976d2;text-decoration:underline;cursor:pointer;" aria-label="Indicator ID">${details.id}</a>`;
    introductionSection.appendChild(idRow);

    // Description
    if (details.description) {
      const description = document.createElement('p');
      description.textContent = `Description: ${details.description}`;
      description.style.margin = '0 0 8px 0';
      introductionSection.appendChild(description);
    }
    wrapper.appendChild(introductionSection);

    // Indicator Facts
    wrapper.appendChild(renderSectionTitle('Indicator Facts'));
    const indicatorFactsDescription = document.createElement('p');
    indicatorFactsDescription.textContent =
      'Belongs to the following groups of indicators';
    indicatorFactsDescription.style.margin = '0 0 8px 0';
    wrapper.appendChild(indicatorFactsDescription);
    wrapper.appendChild(
      renderTable(
        [
          {
            header: '#',
            field: '#',
            render: (_row, _col, i) => (i + 1).toString(),
          },
          { header: 'Name', field: 'name' },
          {
            header: 'Code',
            field: 'code',
            render: (row) => row.code || '-',
          },
          {
            header: 'Indicators',
            field: 'indicators',
            render: (row) =>
              Array.isArray(row.indicators)
                ? row.indicators.length.toString()
                : '0',
          },
          {
            header: 'Indicator List',
            field: 'indicators',
            render: (row) => {
              if (Array.isArray(row.indicators) && row.indicators.length > 0) {
                const ul = document.createElement('ul');
                row.indicators.forEach((indicator: any) => {
                  const li = document.createElement('li');
                  li.textContent = indicator.name;
                  ul.appendChild(li);
                });
                return ul;
              }
              return 'None';
            },
          },
        ],
        details.indicatorGroups || []
      )
    );

    // Expressions Table
    const subtitle = document.createElement('p');
    subtitle.textContent =
      'Below are expressions computing numerator and denominator, and related sources.';
    subtitle.style.margin = '16px 0 8px 0';
    wrapper.appendChild(subtitle);

    wrapper.appendChild(this.renderExpressionsTable(details));

    // Data Elements Table
    wrapper.appendChild(renderSectionTitle('Data elements in indicator'));
    const dataElementsSubtitle = document.createElement('p');
    dataElementsSubtitle.textContent =
      'The following is the summary of the data elements used in the calculations';
    dataElementsSubtitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(dataElementsSubtitle);
    wrapper.appendChild(this.renderDataElementsTable(details));

    // Program Indicators Table
    wrapper.appendChild(renderSectionTitle('Program Indicators in indicator'));
    const programIndicatorsSubtitle = document.createElement('p');
    programIndicatorsSubtitle.textContent =
      'The following is the summary of the program indicators used in calculations:';
    programIndicatorsSubtitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(programIndicatorsSubtitle);
    wrapper.appendChild(this.renderProgramIndicatorsTable(details));

    // Datasets Table
    wrapper.appendChild(
      renderSectionTitle('Datasets (Reporting rates) in indicator')
    );
    const dataSetsSubTitle = document.createElement('p');
    dataSetsSubTitle.textContent =
      'The following is the summary of the datasets (reporting rates) used in calculations:';
    dataSetsSubTitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(dataSetsSubTitle);
    wrapper.appendChild(this.renderDataSetsTable(details));

    // Accessibility & Sharing
    wrapper.appendChild(renderSectionTitle('Accessibility & Sharing settings'));
    const createdformattedDate = moment(details.created).format(
      'MMMM DD, YYYY'
    );
    const lastUpdatedFormattedDate = moment(details.lastUpdated).format(
      'MMMM DD, YYYY'
    );
    const accessibilitySharingSettingsDescription = document.createElement('p');
    accessibilitySharingSettingsDescription.textContent = `This indicator was first created on ${createdformattedDate} by ${details.createdBy.name} and last updated on ${lastUpdatedFormattedDate} by ${details.lastUpdatedBy.name}`;
    accessibilitySharingSettingsDescription.style.margin = '0 0 8px 0';
    wrapper.appendChild(accessibilitySharingSettingsDescription);

    container.appendChild(wrapper);
  }

  renderExpressionsTable(details: any): HTMLElement {
    const columns: TableColumn[] = [
      { header: 'Expression', field: 'label' },
      {
        header: 'Formula',
        field: 'value',
        render: (row, _col, _i) => {
          const valueSpan = document.createElement('span');
          valueSpan.textContent = row.value;
          const toggleButton = document.createElement('button');
          toggleButton.textContent = 'Show Expression';
          toggleButton.style.marginLeft = '10px';
          toggleButton.style.cursor = 'pointer';
          toggleButton.style.background = '#f5f5f5';
          toggleButton.style.border = '1px solid #ccc';
          toggleButton.style.borderRadius = '4px';
          toggleButton.style.padding = '2px 8px';
          toggleButton.style.fontSize = '0.95em';
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
          const wrapper = document.createElement('span');
          wrapper.appendChild(valueSpan);
          wrapper.appendChild(toggleButton);
          return wrapper;
        },
      },
      { header: 'Sources', field: 'sources' },
    ];

    // Helper to extract dataset/program names from sources
    function getSources(
      dataElementSource: any[],
      programIndicatorSource: any[]
    ): string {
      const datasetNames = Array.isArray(dataElementSource)
        ? dataElementSource.flatMap((de: any) =>
            Array.isArray(de.dataSetElements)
              ? de.dataSetElements
                  .map((dse: any) => dse.dataSet?.name)
                  .filter(Boolean)
              : []
          )
        : [];
      const programNames = Array.isArray(programIndicatorSource)
        ? programIndicatorSource
            .map((pi: any) => pi.program?.name)
            .filter(Boolean)
        : [];

      const allSources = Array.from(
        new Set([...datasetNames, ...programNames])
      );
      return allSources.length > 0 ? allSources.join(', ') : '';
    }

    const rows = [
      {
        label: 'Numerator',
        value: details.numeratorExpressionMeaning || '',
        sources: getSources(
          details.dataElementNumeratorSource,
          details.programIndicatorNumeratorSource
        ),
      },
      {
        label: 'Denominator',
        value: details.denominatorExpressionMeaning || '',
        sources: getSources(
          details.dataElementDenominatorSource,
          details.programIndicatorDenominatorSource
        ),
      },
    ];
    return renderTable(columns, rows);
  }
  // renderExpressionsTable(details: any): HTMLElement {
  //   // Custom rendering for toggle button
  //   const columns: TableColumn[] = [
  //     { header: 'Expression', field: 'label' },
  //     {
  //       header: 'Formula',
  //       field: 'value',
  //       render: (row, _col, _i) => {
  //         const valueSpan = document.createElement('span');
  //         valueSpan.textContent = row.value;
  //         const toggleButton = document.createElement('button');
  //         toggleButton.textContent = 'Show Expression';
  //         toggleButton.style.marginLeft = '10px';
  //         toggleButton.style.cursor = 'pointer';
  //         toggleButton.style.background = '#f5f5f5';
  //         toggleButton.style.border = '1px solid #ccc';
  //         toggleButton.style.borderRadius = '4px';
  //         toggleButton.style.padding = '2px 8px';
  //         toggleButton.style.fontSize = '0.95em';
  //         toggleButton.addEventListener('click', () => {
  //           if (row.label === 'Numerator') {
  //             const currentValue = valueSpan.textContent;
  //             if (currentValue === details.numeratorExpressionMeaning) {
  //               valueSpan.textContent = details.numerator;
  //               toggleButton.textContent = 'Show description';
  //             } else {
  //               valueSpan.textContent = details.numeratorExpressionMeaning;
  //               toggleButton.textContent = 'Show Formula';
  //             }
  //           } else if (row.label === 'Denominator') {
  //             const currentValue = valueSpan.textContent;
  //             if (currentValue === details.denominatorExpressionMeaning) {
  //               valueSpan.textContent = details.denominator;
  //               toggleButton.textContent = 'Show description';
  //             } else {
  //               valueSpan.textContent = details.denominatorExpressionMeaning;
  //               toggleButton.textContent = 'Show Formula';
  //             }
  //           }
  //         });
  //         const wrapper = document.createElement('span');
  //         wrapper.appendChild(valueSpan);
  //         wrapper.appendChild(toggleButton);
  //         return wrapper;
  //       },
  //     },
  //     { header: 'Sources', field: 'sources' },
  //   ];
  //   const rows = [
  //     {
  //       label: 'Numerator',
  //       value: details.numeratorExpressionMeaning || '',
  //       sources: '',
  //     },
  //     {
  //       label: 'Denominator',
  //       value: details.denominatorExpressionMeaning || '',
  //       sources: '',
  //     },
  //   ];
  //   return renderTable(columns, rows);
  // }

  renderDataElementsTable(details: any): HTMLElement {
    const columns: TableColumn[] = [
      {
        header: '#',
        field: '#',
        render: (_row, _col, i) => (i + 1).toString(),
      },
      { header: 'Name', field: 'name' },
      {
        header: 'Expression part (Numerator/ Denominator)',
        field: 'expressionPart',
        render: (row) => {
          console.log('row', row.id);
          console.log('the numerator', details.numerator);
          console.log('the numerator', details.denominator);
          const inNumerator = details.numerator.includes(row.id);
          const inDenominator = details.denominator.includes(row.id);
          if (inNumerator && inDenominator) {
            return `Numerator: ${details.numerator}\nDenominator: ${details.denominator}`;
          }
          if (inNumerator) {
            return `Numerator: ${details.numerator}`;
          }
          if (inDenominator) {
            return `Denominator: ${details.denominator}`;
          }
          return '';
        },
      },
      { header: 'Aggregation', field: 'aggregationType' },
      { header: 'Value Type', field: 'valueType' },
      { header: 'Zero Significance', field: 'zeroIsSignificant' },
      {
        header: 'Categories',
        field: 'categories',
        render: (row) => {
          const categorySet = new Set<string>();
          row.categoryCombo?.categoryOptionCombos?.forEach((combo: any) => {
            combo.categoryOptions?.forEach((option: any) => {
              option.categories?.forEach((category: any) => {
                categorySet.add(category.name);
              });
            });
          });
          const ul = document.createElement('ul');
          Array.from(categorySet).forEach((catName) => {
            const li = document.createElement('li');
            li.textContent = catName;
            ul.appendChild(li);
          });
          return ul;
        },
      },
      {
        header: 'Data Sets/ Programs',
        field: 'dataSets',
        render: (row) => {
          const ul = document.createElement('ul');
          row.dataSetElements.forEach(
            (dataSetElement: { dataSet: { name: string } }) => {
              const li = document.createElement('li');
              li.textContent = dataSetElement.dataSet.name;
              ul.appendChild(li);
            }
          );
          return ul;
        },
      },
      {
        header: 'Groups',
        field: 'groups',
        render: (row) => {
          const ul = document.createElement('ul');
          row.dataElementGroups.forEach(
            (dataSetGroup: { name: string; dataElements: number }) => {
              const li = document.createElement('li');
              li.textContent = `${dataSetGroup.name}: with other ${(
                dataSetGroup.dataElements - 1
              ).toString()} data elements`;
              ul.appendChild(li);
            }
          );
          return ul;
        },
      },
    ];
    console.log('dataElementsList', details.dataElementsList);
    console.log('dataElementsFromNumerator', details.dataElementsFromNumerator);
    console.log(
      'dataElementsFromDenominator',
      details.dataElementsFromDenominator
    );
    return renderTable(columns, details.dataElementsList || []);
  }

  renderProgramIndicatorsTable(details: any): HTMLElement {
    const columns: TableColumn[] = [
      {
        header: '#',
        field: '#',
        render: (_row, _col, i) => (i + 1).toString(),
      },
      { header: 'Name', field: 'name' },
      { header: 'Expression part', field: 'expression' },
      { header: 'Filter', field: 'filter' },
      { header: 'Aggregation Type', field: 'aggregationType' },
      { header: 'Analytics Type', field: 'analyticsType' },
      {
        header: 'Period Boundaries',
        field: 'periodBoundaries',
        render: (row) => {
          const ul = document.createElement('ul');
          row.analyticsPeriodBoundaries.forEach(
            (analyticsPeriodBoundary: {
              analyticsPeriodBoundaryType: string;
            }) => {
              const li = document.createElement('li');
              li.textContent =
                analyticsPeriodBoundary.analyticsPeriodBoundaryType;
              ul.appendChild(li);
            }
          );
          return ul;
        },
      },
      { header: 'Legends', field: 'legends', render: () => 'none' },
      {
        header: 'Groups',
        field: 'groups',
        render: (row) => {
          const ul = document.createElement('ul');
          row.programIndicatorGroups.forEach((group: { name: string }) => {
            const li = document.createElement('li');
            li.textContent = group.name;
            ul.appendChild(li);
          });
          return ul;
        },
      },
    ];
    return renderTable(columns, details.programIndicatorsInIndicator || []);
  }

  renderDataSetsTable(details: any): HTMLElement {
    const columns: TableColumn[] = [
      {
        header: '#',
        field: '#',
        render: (_row, _col, i) => (i + 1).toString(),
      },
      { header: 'Name', field: 'name' },
      { header: 'Description', field: 'description' },
      { header: 'Timely Submission', field: 'timelyDays' },
      { header: 'Expiry days', field: 'expiryDays' },
      { header: 'Period type', field: 'periodType' },
      {
        header: 'Assigned orgunits',
        field: 'organisationUnits',
        render: (row) => {
          const ul = document.createElement('ul');
          row.organisationUnits.forEach((orgUnit: { name: string }) => {
            const li = document.createElement('li');
            li.textContent = orgUnit.name;
            ul.appendChild(li);
          });
          return ul;
        },
      },
      {
        header: 'Data elements',
        field: 'dataSetElements',
        render: (row) => {
          const ul = document.createElement('ul');
          row.dataSetElements.forEach(
            (dataSetElement: { dataElement: { name: string } }) => {
              const li = document.createElement('li');
              li.textContent = dataSetElement.dataElement.name;
              ul.appendChild(li);
            }
          );
          return ul;
        },
      },
      { header: 'Legends', field: 'legends', render: () => 'none' },
    ];
    return renderTable(columns, details.dataSetsInIndicator || []);
  }
}
