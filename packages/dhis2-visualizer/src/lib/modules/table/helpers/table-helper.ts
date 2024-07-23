import { each, findIndex, map, uniq } from 'lodash';

export function tableCreate(id: string, analytics: any, configs: any) {
  //   var body = document.getElementsByTagName('body')[0];

  var body = document.getElementById(id);
  var tbl = document.createElement('table');
  tbl.style.width = '100%';
  tbl.classList.add('table');
  tbl.setAttribute('border', '1');
  tbl.style.borderCollapse = 'collapse';
  var tbdy = document.createElement('tbody');

  var filterTableRow = document.createElement('tr');
  var filterTableData = document.createElement('td');
  filterTableData.setAttribute(
    'colSpan',
    (configs?.config?.useAsScoreCard ? 2 : 1) +
      configs?.config?.visualization?.periods?.length
  );
  filterTableData.appendChild(document.createTextNode(findOuName(analytics)));

  filterTableData.style.textAlign = 'center';
  filterTableData.style.fontWeight = '500';
  filterTableData.style.backgroundColor = '#afc9e3';

  filterTableRow.appendChild(filterTableData);

  tbdy.appendChild(filterTableRow);

  var colsTableRow = document.createElement('tr');
  var colsFillerTableData = document.createElement('td');
  colsFillerTableData.style.backgroundColor = '#afc9e3';

  colsTableRow.appendChild(colsFillerTableData);
  each(configs?.config?.visualization?.periods, (peItem) => {
    var colTitleTD = document.createElement('td');
    colTitleTD.appendChild(
      document.createTextNode(analytics?.metaData?.items[peItem?.id]['name'])
    );

    colTitleTD.style.textAlign = 'center';
    colTitleTD.style.fontWeight = '500';
    colTitleTD.style.backgroundColor = '#afc9e3';

    colsTableRow.appendChild(colTitleTD);
  });

  if (configs?.config?.useAsScoreCard) {
    var colTitleTD = document.createElement('td');
    colTitleTD.appendChild(document.createTextNode('Difference'));

    colTitleTD.style.textAlign = 'center';
    colTitleTD.style.fontWeight = '500';
    colTitleTD.style.backgroundColor = '#afc9e3';

    colsTableRow.appendChild(colTitleTD);
  }

  tbdy.appendChild(colsTableRow);

  var dataObject: any = {};

  let valueIndex = findIndex(analytics.headers, (headerObject: any) => {
    return headerObject['name'] == 'value';
  });
  let peIndex = findIndex(analytics.headers, (headerObject: any) => {
    return headerObject['name'] == 'pe';
  });

  let dxIndex = findIndex(analytics.headers, (headerObject: any) => {
    return headerObject['name'] == 'dx';
  });

  each(analytics?.rows, (rowArray) => {
    var rawDataObjectItem: any = {};
    rawDataObjectItem[rowArray[peIndex]] = rowArray[valueIndex];

    dataObject[rowArray[dxIndex]] = dataObject[rowArray[dxIndex]]
      ? { ...dataObject[rowArray[dxIndex]], ...rawDataObjectItem }
      : rawDataObjectItem;
  });

  each(analytics?.metaData?.dimensions?.dx, (dx) => {
    var dxTableRow = document.createElement('tr');

    var dxNameTableData = document.createElement('td');
    dxNameTableData.appendChild(
      document.createTextNode(
        analytics?.metaData?.names
          ? analytics?.metaData?.names[dx]
          : analytics?.metaData?.items[dx]['name']
      )
    );
    dxNameTableData.style.backgroundColor = '#afc9e3';

    dxTableRow.appendChild(dxNameTableData);

    configs?.config?.visualization?.periods.forEach(
      (peItem: any, index: number) => {
        console.log(dataObject, peItem, dx, index);

        var dataForTheYear = document.createElement('td');
        dataForTheYear.appendChild(
          document.createTextNode(
            dataObject[dx] && dataObject[dx][peItem['id']]
              ? dataObject[dx][peItem['id']]
              : ''
          )
        );

        dxTableRow.appendChild(dataForTheYear);

        if (
          index == configs?.config?.visualization?.periods?.length - 1 &&
          configs?.config?.visualization?.periods?.length >= 2 &&
          configs?.config?.useAsScoreCard
        ) {
          var currentData =
            dataObject[dx] && dataObject[dx][peItem['id']]
              ? dataObject[dx][peItem['id']]
              : null;
          var previosPeriodData =
            dataObject[dx] &&
            dataObject[dx][
              configs?.config?.visualization?.periods[
                configs?.config?.visualization?.periods?.length - 2
              ]['id']
            ]
              ? dataObject[dx][
                  configs?.config?.visualization?.periods[
                    configs?.config?.visualization?.periods?.length - 2
                  ]['id']
                ]
              : null;

          // console.log('data diffs');
          // console.log(previosPeriodData);
          // console.log(currentData);
          // console.log(currentData - previosPeriodData);

          var difference = document.createElement('td');
          difference.appendChild(
            document.createTextNode(
              currentData == null || previosPeriodData == null
                ? '-'
                : (currentData - previosPeriodData).toString()
            )
          );

          difference.style.backgroundColor =
            currentData == null || previosPeriodData == null
              ? ''
              : currentData - previosPeriodData < 0
              ? 'pink'
              : currentData - previosPeriodData >= 0
              ? '#b4edbe'
              : 'white';

          dxTableRow.appendChild(difference);
        }
      }
    );

    tbdy.appendChild(dxTableRow);
  });

  // for (var i = 0; i < 3; i++) {
  //   var tr = document.createElement('tr');
  //   for (var j = 0; j < 2; j++) {
  //     if (i == 2 && j == 1) {
  //       break;
  //     } else {
  //       var td = document.createElement('td');
  //       td.appendChild(document.createTextNode('\u0020'));
  //       i == 1 && j == 1 ? td.setAttribute('rowSpan', '2') : null;
  //       tr.appendChild(td);
  //     }
  //   }
  //   tbdy.appendChild(tr);
  // }

  tbl.appendChild(tbdy);
  if (body != null) {
    body.appendChild(tbl);
  }
}

function findOuName(analytics: any): string {
  let ouIndex = findIndex(analytics.headers, (headerObject: any) => {
    return headerObject['name'] == 'ou';
  });

  let ousArray = uniq(
    map(analytics?.rows, (analyticsRow) => {
      return analytics?.metaData?.names
        ? analytics?.metaData?.names[analyticsRow[ouIndex]]
        : analytics?.metaData?.items[analyticsRow[ouIndex]]['name'];
    })
  );

  return ousArray?.join(',');
}
