import moment from 'moment';
import { MetadataRenderer } from '../models/metadata-renderer.model';
import { TableColumn } from '../models/table.model';
import {
  renderTitle,
  renderSectionTitle,
  renderIntroductionTitle,
  renderIntroductionDetails,
  renderTable,
} from './helpers';

export class FunctionRenderer implements MetadataRenderer {
  draw(details: any, container: HTMLElement): void {
    container.replaceChildren();
    console.log('function', details, details.ruleID);
    // Title
    container.appendChild(renderTitle('Function'));

    // Introduction
    const introSection = document.createElement('section');
    introSection.style.marginBottom = '20px';
    introSection.appendChild(renderIntroductionTitle('Introduction'));
    introSection.appendChild(
      renderIntroductionDetails(
        `${details.name} can be best described as: ${
          details.description || 'No description provided.'
        }`
      )
    );
    introSection.appendChild(
      renderIntroductionDetails(`Identified by: ${details.id}`)
    );
    container.appendChild(introSection);

    if (details.ruleID && Array.isArray(details.rules)) {
      const rule = details.rules.find((r: any) => r.id === details.ruleID);
      if (rule) {
        container.appendChild(renderSectionTitle('Function Rule'));
        const ruleInfoTable = renderTable(
          [
            { header: 'Id', field: 'id' },
            { header: 'Name', field: 'name' },
            { header: 'Description', field: 'description' },
            {
              header: 'Default Rule',
              field: 'isDefault',
              render: (row) => (row.isDefault ? 'Yes' : 'No'),
            },
            {
              header: 'JSON',
              field: 'json',
              render: (row) => {
                const pre = document.createElement('pre');
                pre.textContent = JSON.stringify(row.json, null, 2);
                pre.style.maxWidth = '400px';
                pre.style.overflowX = 'auto';
                pre.style.fontSize = '0.95em';
                return pre;
              },
            },
          ],
          [rule]
        );
        container.appendChild(ruleInfoTable);
      }
    }

    // Data sources
    container.appendChild(renderSectionTitle('Data sources'));
    container.appendChild(
      renderIntroductionDetails(
        'Function has rules calculating from multiple data sources. Here are a few data sources observed:'
      )
    );

    // Parse expressions on rules JSON for 11-char UIDs in object keys and values
    const dataSourceUids = new Set<string>();
    if (Array.isArray(details.rules)) {
      details.rules.forEach((rule: any) => {
        // Search for 11-char UIDs in rule.json and rule.json.data
        if (rule.json) {
          Object.values(rule.json).forEach((val: any) => {
            if (typeof val === 'string') {
              const matches = val.match(/[A-Za-z0-9]{11}/g);
              if (matches) matches.forEach((uid) => dataSourceUids.add(uid));
            }
          });
        }
      });
    }

    const dataSources = details.referencedDetails || [];
    const dataSourceColumns: TableColumn[] = [
      { header: 'Id', field: 'id' },
      { header: 'Name', field: 'name' },
      { header: 'Description', field: 'description' },
      { header: 'Code', field: 'code' },
      { header: 'Type', field: 'type' },
      //   { header: 'More details', field: 'moreDetails' },
      { header: 'Last updated', field: 'lastUpdated' },
    ];
    container.appendChild(renderTable(dataSourceColumns, dataSources));

    // Function Rules
    container.appendChild(renderSectionTitle('Other Function Rules'));
    container.appendChild(
      renderIntroductionDetails(
        'The following are available rules used for data analytics:'
      )
    );
    const rulesColumns: TableColumn[] = [
      { header: 'Id', field: 'id' },
      { header: 'Name', field: 'name' },
      { header: 'Description', field: 'description' },
      {
        header: 'Default Rule',
        field: 'isDefault',
        render: (row) => (row.isDefault ? 'Yes' : 'No'),
      },
      {
        header: 'JSON',
        field: 'json',
        render: (row) => {
          const pre = document.createElement('pre');
          pre.textContent = JSON.stringify(row.json, null, 2);
          pre.style.maxWidth = '400px';
          pre.style.overflowX = 'auto';
          pre.style.fontSize = '0.95em';
          return pre;
        },
      },
    ];
    container.appendChild(renderTable(rulesColumns, details.rules || []));

    // Function Facts
    container.appendChild(renderSectionTitle('Function Facts'));
    const functionString = details.function || '';
    const byteLength = new TextEncoder().encode(functionString).length;
    const kbLength = (byteLength / 1024).toFixed(2);
    const factsList = [
      `It is approximately ${byteLength} bytes (${kbLength} KB) in size`,
      `It has ${
        Array.isArray(details.rules) ? details.rules.length : 0
      } associated rules`,
      functionString.includes('Fn.')
        ? 'It’s using function analytics library'
        : null,
      functionString.includes('$.') ? 'It’s using jquery api library' : null,
      functionString.includes('$.ajax') ? 'Performs ajax promises' : null,
      functionString.includes('../../../api/')
        ? 'Fetches from DHIS2 API without function analytics'
        : null,
      details.dhis2Version
        ? `Running on API version: ${details.dhis2Version}`
        : null,
    ].filter(Boolean);

    const factsUl = document.createElement('ul');
    factsList.forEach((fact) => {
      const li = document.createElement('li');
      li.textContent = fact as string;
      factsUl.appendChild(li);
    });
    container.appendChild(factsUl);

    // API Endpoints used as the data source
    container.appendChild(
      renderSectionTitle('API Endpoints used as the data source')
    );
    container.appendChild(
      renderIntroductionDetails(
        'The following are observed DHIS2 API end-points used in the function:'
      )
    );
    // Parse endpoints from function string
    const endpointRegex = /\/api\/[a-zA-Z0-9/]+/g;
    const endpoints = (functionString.match(endpointRegex) || []).map(
      (ep: string) => ep.replace('../../../', '')
    );
    const endpointCounts: Record<string, number> = {};
    endpoints.forEach((ep: string | number) => {
      endpointCounts[ep] = (endpointCounts[ep] || 0) + 1;
    });
    const endpointRows = Object.entries(endpointCounts).map(
      ([endpoint, count]) => ({
        endpoint,
        appearances: count,
        suggestingFactor: endpoint.includes('analytics') ? 'Analytics' : '',
        documentation:
          'https://docs.dhis2.org/master/en/developer/html/dhis2_developer_manual.html',
        fnAnalytics: functionString.includes('Fn.') ? 'Yes' : 'No',
        rawAnalytics: endpoint.includes('analytics') ? 'Yes' : 'No',
      })
    );
    const endpointColumns: TableColumn[] = [
      { header: 'Endpoint', field: 'endpoint' },
      { header: 'Appearances', field: 'appearances' },
      { header: 'Suggesting Factor', field: 'suggestingFactor' },
      { header: 'Documentation', field: 'documentation' },
      { header: 'Contains “Fn.Analytics”', field: 'fnAnalytics' },
      { header: 'Contains “/api/analytics”', field: 'rawAnalytics' },
    ];
    container.appendChild(renderTable(endpointColumns, endpointRows));

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
    const createdBy = details.userCreated || details.createdBy?.name || '-';
    const lastUpdatedBy =
      details.userUpadted || details.lastUpdatedBy?.name || '-';

    container.appendChild(
      renderIntroductionDetails(
        `This function was first created on ${createdDate} by ${createdBy} and last updated on ${lastUpdated} by ${lastUpdatedBy}.`
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
  }
}
