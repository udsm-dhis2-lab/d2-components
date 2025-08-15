import { MetadataRenderer } from '../models/metadata-renderer.model';
import moment from 'moment';
import { TableColumn } from '../models/table.model';
import {
  renderTitle,
  renderSectionTitle,
  renderIntroductionTitle,
  renderIntroductionDetails,
  renderTable,
} from './helpers';

export class DataElementRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();

    // Title
    container.appendChild(renderTitle('Data element Name'));

    // Introduction
    const introSection = document.createElement('section');
    introSection.style.marginBottom = '20px';
    introSection.appendChild(renderIntroductionTitle('Introduction'));
    introSection.appendChild(
      renderIntroductionDetails(
        `${details.name} can be described as ${
          details.description || 'No description provided.'
        }`
      )
    );
    introSection.appendChild(
      renderIntroductionDetails(
        `It’s labelled in short as ${
          details.shortName || '-'
        } and has a code of ${
          details.code || '-'
        }. In data entry form, it’s named “${details.formName || '-'}”`
      )
    );
    introSection.appendChild(
      renderIntroductionDetails(`Identified by: ${details.id}`)
    );
    container.appendChild(introSection);

    // Data sources (Datasets/Programs)
    container.appendChild(
      renderSectionTitle('Data sources (Datasets/Programs)')
    );
    container.appendChild(
      renderIntroductionDetails(
        'Data element is captured from routine and/or event-based sources with the following sources:'
      )
    );

    // Datasets
    if (details.dataSetElements?.length) {
      details.dataSetElements.forEach((ds: any) => {
        container.appendChild(
          renderIntroductionDetails(
            `${ds.dataSet.name} submitting ${
              ds.dataSet.periodType
            } after every ${ds.dataSet.timelyDays || '-'} days`
          )
        );
      });
    }

    // Programs 
    if (details.programs?.length) {
      details.programs.forEach((program: any) => {
        container.appendChild(
          renderIntroductionDetails(
            `${program.name} submitting records on every event (case or individual)`
          )
        );
      });
    }

    // // Other Details
    // container.appendChild(renderSectionTitle('Other Details'));
    // const otherDetailsRows = [
    //   { label: 'Color', value: details.style?.color || '-' },
    //   { label: 'Icon', value: details.style?.icon || '-' },
    //   { label: 'Optionset', value: details.optionSet?.name || '-' },
    //   {
    //     label: 'Optionset for Comments',
    //     value: details.commentOptionSet?.name || '-',
    //   },
    //   { label: 'Legends', value: details.legendSet?.name || '-' },
    //   {
    //     label: 'Aggregation Levels',
    //     value: (details.aggregationLevels || []).join(', ') || '-',
    //   },
    //   { label: 'Details', value: details.details || '-' },
    // ];
    // const otherDetailsColumns: TableColumn[] = [
    //   { header: 'Property', field: 'label' },
    //   { header: 'Value', field: 'value' },
    // ];
    // container.appendChild(renderTable(otherDetailsColumns, otherDetailsRows));

    // Data element Facts
    container.appendChild(renderSectionTitle('Data element Facts'));
    const factsRows = [
      {
        fact: `Accepts only ${details.valueType} to enforce validation`,
      },
      {
        fact: `Has ${
          details.dataElementInValidationRuleLength || '-'
        } related validation rules`,
      },
      {
        fact: `Part of numerators of ${
          details.dataElementInNumeratorLength || '-'
        } indicators`,
      },
      {
        fact: `Part of denominators of ${
          details.dataElementInDenominatorLength || '-'
        } indicators`,
      },
    ];
    const factsColumns: TableColumn[] = [{ header: 'Fact', field: 'fact' }];
    container.appendChild(renderTable(factsColumns, factsRows));

    //  Analytics Details
    container.appendChild(renderSectionTitle('Analytics Details'));
    const aggP = `${details.aggregationType} through period and hierarchy`;
    container.appendChild(renderIntroductionDetails(aggP));

    const domainP = `${details.domainType} data sources`;
    container.appendChild(renderIntroductionDetails(domainP));

    const zeroP = details.zeroIsSignificant
      ? 'Stores zero data values'
      : 'Does not store zero data values';
    container.appendChild(renderIntroductionDetails(zeroP));

    let uniqueCategories: string[] = [];
    if (details.categoryCombo?.categoryOptionCombos?.length) {
      const categorySet = new Set<string>();
      details.categoryCombo.categoryOptionCombos.forEach((combo: any) => {
        (combo.categoryOptions || []).forEach((opt: any) => {
          (opt.categories || []).forEach((cat: any) => {
            if (!categorySet.has(cat.name)) {
              categorySet.add(cat.name);
              uniqueCategories.push(cat.name);
            }
          });
        });
      });
    }

    if (details.categoryCombo?.categoryOptionCombos?.length) {
      const combosTitle = document.createElement('div');
      combosTitle.style.marginTop = '12px';
      combosTitle.textContent = `${details.categoryCombo.name} cross-tabulation between categories:`;
      container.appendChild(combosTitle);

      // categories -> set of options
      const categoriesMap: Record<
        string,
        { name: string; options: Set<string> }
      > = {};

      details.categoryCombo.categoryOptionCombos.forEach((combo: any) => {
        combo.categoryOptions?.forEach((opt: any) => {
          opt.categories?.forEach((cat: any) => {
            if (!categoriesMap[cat.id]) {
              categoriesMap[cat.id] = { name: cat.name, options: new Set() };
            }
            categoriesMap[cat.id].options.add(opt.name);
          });
        });
      });

      // table data
      const tableRows = Object.values(categoriesMap).map((cat) => ({
        category: cat.name,
        options: Array.from(cat.options).join(', ') || '-',
      }));

      // columns
      const tableColumns: TableColumn[] = [
        { header: 'Category', field: 'category' },
        { header: 'Options', field: 'options' },
      ];

      container.appendChild(renderTable(tableColumns, tableRows));
    }

    // Related Indicators
    container.appendChild(renderSectionTitle('Related Indicators'));
    const indicatorColumns: TableColumn[] = [
      { header: 'Name', field: 'name' },
      { header: 'Numerator', field: 'numerator' },
      { header: 'Denominator', field: 'denominator' },
      {
        header: 'Type',
        field: 'indicatorType',
        render: (row) => row.indicatorType?.name,
      },
      { header: 'Description', field: 'description' },
    ];
    container.appendChild(renderTable(indicatorColumns, details.indicators));

    // Accessibility & Sharing settings
    container.appendChild(
      renderSectionTitle('Accessibility & Sharing settings')
    );
    const createdDate = details.created
      ? moment(details.created).format('MMMM DD, YYYY')
      : '-';
    const lastUpdated = details.lastUpdated
      ? moment(details.lastUpdated).format('MMMM DD, YYYY')
      : '-';
    const createdBy = details.createdBy?.name || '-';
    const lastUpdatedBy = details.lastUpdatedBy?.name || '-';

    container.appendChild(
      renderIntroductionDetails(
        `This data element was first created on ${createdDate} by ${createdBy} and last updated on ${lastUpdated} by ${lastUpdatedBy}.`
      )
    );

    // User Access
    if (details.userAccesses?.length) {
      container.appendChild(renderSectionTitle('User Access'));
      const userAccessColumns: TableColumn[] = [
        { header: 'User', field: 'displayName' },
        { header: 'Access', field: 'access' },
      ];
      container.appendChild(
        renderTable(userAccessColumns, details.userAccesses)
      );
    }

    // User Group Access
    if (details.userGroupAccesses?.length) {
      container.appendChild(renderSectionTitle('User Group Access'));
      const groupAccessColumns: TableColumn[] = [
        { header: 'User Group', field: 'displayName' },
        { header: 'Access', field: 'access' },
      ];
      container.appendChild(
        renderTable(groupAccessColumns, details.userGroupAccesses)
      );
    }
  }
}
