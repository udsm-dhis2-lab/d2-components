import { MetadataRenderer } from '../models/metadata-renderer.model';
import {
  renderTitle,
  renderSectionTitle,
  renderIntroductionTitle,
  renderIntroductionDetails,
  renderTable,
} from './helpers';

export class DatasetRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    // Introduction
    container.appendChild(renderSectionTitle(details.name));
    container.appendChild(
      renderIntroductionDetails(
        `Data set ${details.name} of the ${
          details.formType || 'CUSTOM'
        } form created on ${
          details.created ? new Date(details.created).toLocaleDateString() : '-'
        } by ${
          details.createdBy?.displayName || details.createdBy?.name || '-'
        }.`
      )
    );
    container.appendChild(
      renderIntroductionDetails(`Identifed by: ${details.id}`)
    );

    // Dataset facts
    container.appendChild(renderSectionTitle('Dataset facts'));
    container.appendChild(
      renderIntroductionDetails(
        `The dataset has ${
          details.dataSetElements?.length || 0
        } data elements summarized below:`
      )
    );

    // Data Elements Table
    const deColumns = [
      { header: 'Data Element', field: 'name' },
      { header: 'Aggregation', field: 'aggregationType' },
      { header: 'Value Type', field: 'valueType' },
      {
        header: 'Zero Significance',
        field: 'zeroIsSignificant',
        render: (row: { zeroIsSignificant: any }) =>
          row.zeroIsSignificant ? 'Yes' : 'No',
      },
      {
        header: 'Categories',
        field: 'categories',
        render: (row: { categoryCombo: { categoryOptionCombos: any[] } }) => {
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
        header: 'Datasets/ Programs',
        field: 'dataSets',
        render: (row: {
          dataSetElements: { dataSet: { name: string } }[];
          programs: { name: string }[];
        }) => {
          const nameSet = new Set<string>();
          row.dataSetElements?.forEach(
            (dataSetElement: { dataSet: { name: string } }) => {
              if (dataSetElement.dataSet?.name) {
                nameSet.add(dataSetElement.dataSet.name);
              }
            }
          );
          row.programs?.forEach((program: { name: string }) => {
            if (program.name) {
              nameSet.add(program.name);
            }
          });
          const ul = document.createElement('ul');
          Array.from(nameSet).forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            ul.appendChild(li);
          });
          return ul;
        },
      },
      {
        header: 'Groups',
        field: 'groups',
        render: (row: {
          dataElementGroups: { name: string; dataElements: number }[];
        }) => {
          const ul = document.createElement('ul');
          row.dataElementGroups?.forEach(
            (group: { name: string; dataElements: number }) => {
              const li = document.createElement('li');
              li.textContent = group.name;
              ul.appendChild(li);
            }
          );
          return ul;
        },
      },
    ];

    const dataElements =
      details.dataSetElements?.map((dse: any) => ({
        ...dse.dataElement,
        dataSetElements: details.dataSetElements,
      })) || [];

    container.appendChild(renderTable(deColumns, dataElements));

    // Other details
    container.appendChild(
      renderSectionTitle('Other details are described below:')
    );
    const otherDetailsColumns = [
      { header: 'Form type', field: 'formType' },
      { header: 'Reporting period type', field: 'periodType' },
      { header: 'Timely days', field: 'timelyDays' },
      { header: 'Valid complete only', field: 'validCompleteOnly' },
      {
        header: 'Compulsory fields complete only',
        field: 'compulsoryFieldsCompleteOnly',
      },
      {
        header: 'Compulsory data element operands',
        field: 'compulsoryDataElementOperands',
        render: (row: { compulsoryDataElementOperands: any }) => {
          const operands = row.compulsoryDataElementOperands;
          if (Array.isArray(operands) && operands.length > 0) {
            const ul = document.createElement('ul');
            operands.forEach((op: any) => {
              const li = document.createElement('li');
              li.textContent = op.displayName || op.name || op.id;
              ul.appendChild(li);
            });
            return ul;
          }
          return '-';
        },
      },
    ];

    const otherDetailsRow = {
      formType: details.formType || 'CUSTOM',
      periodType: details.periodType || '-',
      timelyDays: details.timelyDays ?? '-',
      validCompleteOnly: details.validCompleteOnly ? 'true' : 'false',
      compulsoryFieldsCompleteOnly: details.compulsoryFieldsCompleteOnly
        ? 'true'
        : 'false',
      compulsoryDataElementOperands:
        details.compulsoryDataElementOperands ?? [],
    };

    container.appendChild(renderTable(otherDetailsColumns, [otherDetailsRow]));

    // Accessibility & Sharing settings
    container.appendChild(
      renderSectionTitle('Accessibility & Sharing settings')
    );
    container.appendChild(
      renderIntroductionDetails(
        `This indicator was first created on ${
          details.created ? new Date(details.created).toLocaleDateString() : '-'
        } by ${
          details.createdBy?.displayName || details.createdBy?.name || '-'
        } and last updated on ${
          details.lastUpdated
            ? new Date(details.lastUpdated).toLocaleDateString()
            : '-'
        } by ${
          details.lastUpdatedBy?.displayName ||
          details.lastUpdatedBy?.name ||
          '-'
        }`
      )
    );
  }
}
