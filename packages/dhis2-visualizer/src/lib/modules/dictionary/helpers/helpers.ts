import { TableColumn } from '../models/table.model';

export function renderSectionTitle(title: string): HTMLElement {
  const h3 = document.createElement('h3');
  h3.textContent = title;
  h3.style.margin = '24px 0 8px 0';
  h3.style.fontSize = '1.1em';
  h3.style.color = '#1976d2';
  return h3;
}

export function renderTitle(title: string): HTMLElement {
  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.style.color = '#1976d2';
  h2.style.marginBottom = '8px';
  return h2;
}

export function renderIntroductionTitle(title: string): HTMLElement {
  const h3 = document.createElement('h3');
  h3.textContent = title;
  h3.style.fontSize = '1.1em';
  h3.style.marginBottom = '4px';
  return h3;
}

export function renderIntroductionDetails(details: string): HTMLElement {
  const p = document.createElement('p');
  p.textContent = details;
  p.style.margin = '0 0 8px 0';
  return p;
}

export function renderTable(
  columns: TableColumn[],
  data: any[]
): HTMLTableElement {
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
