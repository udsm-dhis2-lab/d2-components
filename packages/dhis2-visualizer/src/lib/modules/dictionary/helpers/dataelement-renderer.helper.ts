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

    // Programs (if available)
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

    // Analytics Details
    // container.appendChild(renderSectionTitle('Analytics Details'));
    // const analyticsRows = [
    //   {
    //     detail: `${details.aggregationType} through period and hierarchy`,
    //   },
    //   {
    //     detail: `${details.domainType} data sources`,
    //   },
    //   {
    //     detail: details.zeroIsSignificant
    //       ? 'Stores zero data values'
    //       : 'Does not store zero data values',
    //   },
    //   {
    //     detail: `${
    //       details.categoryCombo?.name || '-'
    //     } cross-tabulation between categories`,
    //   },
    // ];
    // const analyticsColumns: TableColumn[] = [
    //   { header: 'Detail', field: 'detail' },
    // ];
    // container.appendChild(renderTable(analyticsColumns, analyticsRows));

    // // Categories and options
    // if (details.categoryCombo?.categories?.length) {
    //   container.appendChild(renderSectionTitle('Categories & Options'));
    //   const catRows = details.categoryCombo.categories.map((cat: any) => ({
    //     category: cat.name,
    //     options:
    //       (cat.categoryOptions || []).map((opt: any) => opt.name).join(', ') ||
    //       '-',
    //   }));
    //   const catColumns: TableColumn[] = [
    //     { header: 'Category', field: 'category' },
    //     { header: 'Options', field: 'options' },
    //   ];
    //   container.appendChild(renderTable(catColumns, catRows));
    // }
    // Analytics Details
    container.appendChild(renderSectionTitle('Analytics Details'));

    const aggP = document.createElement('div');
    aggP.textContent = `${details.aggregationType} through period and hierarchy`;
    container.appendChild(aggP);

    const domainP = document.createElement('div');
    domainP.textContent = `${details.domainType} data sources`;
    container.appendChild(domainP);

    const zeroP = document.createElement('div');
    zeroP.textContent = details.zeroIsSignificant
      ? 'Stores zero data values'
      : 'Does not store zero data values';
    container.appendChild(zeroP);

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

    const categoriesString = uniqueCategories.length
      ? uniqueCategories
          .map((cat, idx) => `Category ${idx + 1}: ${cat}`)
          .join(', ')
      : '-';
    const catComboDiv = document.createElement('div');
    catComboDiv.innerHTML = `<b>${
      details.categoryCombo?.name || '-'
    }</b> cross-tabulation between ${uniqueCategories} with following details`;
    container.appendChild(catComboDiv);

    if (details.categoryCombo?.categories?.length) {
      const catUl = document.createElement('ul');
      catUl.style.margin = '8px 0 0 24px';
      details.categoryCombo.categories.forEach((cat: any) => {
        const catLi = document.createElement('li');
        catLi.innerHTML = `<b>${cat.name}</b> has ${
          (cat.categoryOptions || []).map((opt: any) => opt.name).join(', ') ||
          '-'
        }`;
        catUl.appendChild(catLi);
      });
      container.appendChild(catUl);
    }

    if (details.categoryCombo?.categoryOptionCombos?.length) {
      const combosTitle = document.createElement('div');
      combosTitle.style.marginTop = '12px';
      combosTitle.textContent = '';
      container.appendChild(combosTitle);

      const comboUl = document.createElement('ul');
      comboUl.style.margin = '8px 0 0 24px';
      details.categoryCombo.categoryOptionCombos.forEach((combo: any) => {
        const comboLi = document.createElement('li');
        let optionsHtml = '';
        if (combo.categoryOptions?.length) {
          optionsHtml =
            '<ul style="margin: 4px 0 0 18px;">' +
            combo.categoryOptions
              .map(
                (opt: any) =>
                  `<li><b>${opt.name}</b> (${(opt.categories || [])
                    .map((cat: any) => cat.name)
                    .join(', ')})</li>`
              )
              .join('') +
            '</ul>';
        }
        comboLi.innerHTML = `<b>${combo.name}</b>${optionsHtml}`;
        comboUl.appendChild(comboLi);
      });
      container.appendChild(comboUl);
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

// import { MetadataRenderer } from '../models/metadata-renderer.model';
// import moment from 'moment';
// import { renderTitle } from './helpers';

// export class DataElementRenderer implements MetadataRenderer {
//   draw(details: any, container: HTMLElement): void {
//     container.replaceChildren();

//     // Title
//     container.appendChild(renderTitle(details.name));

//     // Introduction
//     const intro = document.createElement('p');
//     intro.textContent = `${details.name} can be described as ${details.description || 'No description provided.'}`;
//     container.appendChild(intro);

//     // Short name, code, form name
//     const shortInfo = document.createElement('p');
//     shortInfo.textContent = `It’s labelled in short as ${details.shortName || '-'} and has a code of ${details.code || '-'}.
//       In data entry form, it’s named “${details.formName || '-'}”`;
//     container.appendChild(shortInfo);

//     // UID
//     const uid = document.createElement('p');
//     uid.textContent = `Identified by: ${details.id}`;
//     container.appendChild(uid);

//     // Data sources (Datasets/Programs)
//     const sources = document.createElement('p');
//     sources.textContent = 'Data element is captured from:';
//     container.appendChild(sources);

//     // Datasets
//     if (details.dataSetElements?.length) {
//       details.dataSetElements.forEach((ds: any) => {
//         const dsInfo = document.createElement('p');
//         dsInfo.textContent = `${ds.dataSet.name} submitting ${ds.dataSet.periodType} after every ${ds.dataSet.timelyDays || '-'} days`;
//         container.appendChild(dsInfo);
//       });
//     }

//     // Programs (if available)
//     if (details.programs?.length) {
//       details.programs.forEach((program: any) => {
//         const progInfo = document.createElement('p');
//         progInfo.textContent = `${program.name} submitting records on every event (case or individual)`;
//         container.appendChild(progInfo);
//       });
//     }

//     // Data element Facts
//     const facts = document.createElement('h4');
//     facts.textContent = 'Data element Facts';
//     container.appendChild(facts);

//     const factsList = document.createElement('ul');
//     factsList.innerHTML = `
//       <li>Accepts only ${details.valueType} to enforce validation</li>
//       <li>Has ${details.validationRulesMatchCount || 0} related validation rules</li>
//       <li>Part of numerators of ${details.dataElementInNumeratorLength || "-"} indicators</li>
//       <li>Part of denominators of ${details.dataElementInDenominatorLength || "-"} indicators</li>
//     `;
//     container.appendChild(factsList);

//     // Analytics Details
//     const analytics = document.createElement('h4');
//     analytics.textContent = 'Analytics Details';
//     container.appendChild(analytics);

//     const analyticsList = document.createElement('ul');
//     analyticsList.innerHTML = `
//       <li>${details.aggregationType} through period and hierarchy</li>
//       <li>${details.domainType} data sources</li>
//       <li>${details.zeroIsSignificant ? 'Stores zero data values' : 'Does not store zero data values'}</li>
//       <li>${details.categoryCombo?.name || '-'} cross-tabulation between categories</li>
//     `;
//     container.appendChild(analyticsList);

//     // Accessibility & Sharing settings
//     const createdDate = details.created ? moment(details.created).format('MMMM DD, YYYY') : '-';
//     const lastUpdated = details.lastUpdated ? moment(details.lastUpdated).format('MMMM DD, YYYY') : '-';
//     const createdBy = details.createdBy?.name || '-';
//     const lastUpdatedBy = details.lastUpdatedBy?.name || '-';

//     const access = document.createElement('p');
//     access.textContent = `This data element was first created on ${createdDate} by ${createdBy} and last updated on ${lastUpdated} by ${lastUpdatedBy}.`;
//     container.appendChild(access);
//   }
// }
