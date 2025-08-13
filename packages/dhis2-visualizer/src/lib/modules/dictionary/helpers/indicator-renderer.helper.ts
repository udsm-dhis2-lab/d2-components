import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';

type TableColumn = {
  header: string;
  field: string;
  render?: (row: any, col: string, rowIndex: number) => HTMLElement | string;
};

export class IndicatorRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    // Main wrapper
    const wrapper = document.createElement('div');
    wrapper.style.fontFamily = 'Segoe UI, Arial, sans-serif';

    // Title
    const title = document.createElement('h2');
    title.textContent = details.name;
    title.style.color = '#1976d2';
    title.style.marginBottom = '8px';
    wrapper.appendChild(title);

    // Introduction
    const introSection = document.createElement('section');
    introSection.style.marginBottom = '20px';

    const introductionTitle = document.createElement('h3');
    introductionTitle.textContent = 'Introduction';
    introductionTitle.style.fontSize = '1.1em';
    introductionTitle.style.marginBottom = '4px';
    introSection.appendChild(introductionTitle);

    const intro = document.createElement('p');
    intro.textContent = `${details.name} is a ${details.indicatorType.name} indicator measured by ${details.numeratorDescription} to ${details.denominatorDescription}.`;
    intro.style.margin = '0 0 8px 0';
    introSection.appendChild(intro);

    // ID with tooltip
    const idRow = document.createElement('div');
    idRow.style.marginBottom = '8px';
    idRow.innerHTML = `<span>Identified by: </span>
      <a href="#${details.id}" title="Copy ID" style="color:#1976d2;text-decoration:underline;cursor:pointer;" aria-label="Indicator ID">${details.id}</a>`;
    introSection.appendChild(idRow);

    // Description
    if (details.description) {
      const description = document.createElement('p');
      description.textContent = `Description: ${details.description}`;
      description.style.margin = '0 0 8px 0';
      introSection.appendChild(description);
    }
    wrapper.appendChild(introSection);

    // Indicator Facts
    wrapper.appendChild(this.renderSectionTitle('Indicator Facts'));
    wrapper.appendChild(
      this.renderTable(
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
            render: (row) => row.code || 'None',
          },
          {
            header: 'Indicators',
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
    wrapper.appendChild(this.renderSectionTitle('Data elements in indicator'));
    const dataElementsSubtitle = document.createElement('p');
    dataElementsSubtitle.textContent =
      'The following is the summary of the data elements used in the calculations';
    dataElementsSubtitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(dataElementsSubtitle);
    wrapper.appendChild(this.renderDataElementsTable(details));

    // Program Indicators Table
    wrapper.appendChild(
      this.renderSectionTitle('Program Indicators in indicator')
    );
    const programIndicatorsSubtitle = document.createElement('p');
    programIndicatorsSubtitle.textContent =
      'The following is the summary of the program indicators used in calculations:';
    programIndicatorsSubtitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(programIndicatorsSubtitle);
    wrapper.appendChild(this.renderProgramIndicatorsTable(details));

    // Datasets Table
    wrapper.appendChild(
      this.renderSectionTitle('Datasets (Reporting rates) in indicator')
    );
    const dataSetsSubTitle = document.createElement('p');
    dataSetsSubTitle.textContent =
      'The following is the summary of the datasets (reporting rates) used in calculations:';
    dataSetsSubTitle.style.margin = '0 0 8px 0';
    wrapper.appendChild(dataSetsSubTitle);
    wrapper.appendChild(this.renderDataSetsTable(details));

    // Accessibility & Sharing
    wrapper.appendChild(
      this.renderSectionTitle('Accessibility & Sharing settings')
    );
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

    // Append everything to the container
    container.appendChild(wrapper);
  }

  private renderSectionTitle(title: string): HTMLElement {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    h3.style.margin = '24px 0 8px 0';
    h3.style.fontSize = '1.1em';
    h3.style.color = '#1976d2';
    return h3;
  }

  private renderTable(columns: TableColumn[], data: any[]): HTMLTableElement {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '10px 0';
    table.style.fontSize = '0.98em';
    table.style.background = '#fafbfc';
    table.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
    table.style.borderRadius = '4px';
    table.style.overflow = 'hidden';

    // Header
    const headerRow = document.createElement('tr');
    columns.forEach((col) => {
      const th = document.createElement('th');
      th.textContent = col.header;
      th.style.border = '1px solid #e0e0e0';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f4f4f4';
      th.style.textAlign = 'left';
      th.style.fontWeight = 'bold';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Rows
    if (!data || data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = 'No data available';
      td.colSpan = columns.length;
      td.style.textAlign = 'center';
      td.style.color = 'grey';
      td.style.border = '1px solid #e0e0e0';
      td.style.padding = '8px';
      tr.appendChild(td);
      table.appendChild(tr);
      return table;
    }

    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      columns.forEach((col, colIndex) => {
        const td = document.createElement('td');
        td.style.border = '1px solid #e0e0e0';
        td.style.padding = '8px';
        let value: any;
        if (col.render) {
          const rendered = col.render(row, col.field, rowIndex);
          if (typeof rendered === 'string') {
            td.textContent = rendered;
          } else if (rendered instanceof HTMLElement) {
            td.appendChild(rendered);
          }
        } else if (col.field === '#') {
          td.textContent = (rowIndex + 1).toString();
        } else {
          value = row[col.field];
          td.textContent = value !== undefined && value !== null ? value : '';
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    return table;
  }

  private renderExpressionsTable(details: any): HTMLElement {
    // Custom rendering for toggle button
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
    const rows = [
      {
        label: 'Numerator',
        value: details.numeratorExpressionMeaning || '',
        sources: '',
      },
      {
        label: 'Denominator',
        value: details.denominatorExpressionMeaning || '',
        sources: '',
      },
    ];
    return this.renderTable(columns, rows);
  }

  private renderDataElementsTable(details: any): HTMLElement {
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
        render: (row, _col, _i) =>
          details.dataElementsFromNumerator.includes(row.id)
            ? 'Numerator'
            : details.dataElementsFromDenominator.includes(row.id)
            ? 'Denominator'
            : '',
      },
      { header: 'Aggregation', field: 'aggregationType' },
      { header: 'Value Type', field: 'valueType' },
      { header: 'Zero Significance', field: 'zeroIsSignificant' },
      {
        header: 'Categories',
        field: 'categories',
        render: (row) => {
          const ul = document.createElement('ul');
          row.categoryCombo.categoryOptionCombos?.[0]?.categoryOptions?.[0]?.categories?.forEach(
            (category: { name: string }) => {
              const li = document.createElement('li');
              li.textContent = category.name;
              ul.appendChild(li);
            }
          );
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
    return this.renderTable(columns, details.dataElementsList || []);
  }

  private renderProgramIndicatorsTable(details: any): HTMLElement {
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
    return this.renderTable(
      columns,
      details.programIndicatorsInIndicator || []
    );
  }

  private renderDataSetsTable(details: any): HTMLElement {
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
    return this.renderTable(columns, details.dataSetsInIndicator || []);
  }
}
