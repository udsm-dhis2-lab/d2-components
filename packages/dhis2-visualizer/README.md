# D2-visualizer _(Visualization Library)_

## Library Info

[d2-visualizer](https://www.npmjs.com/package/@iapps/d2-visualizer) is [Typescript](https://www.npmjs.com/package/@iapps/d2-visualizer) library built on top of [Highcharts](https://www.highcharts.com) to extend various number of visualization that are currently supported by [Highcharts](https://www.highcharts.com) and some of them which are not supported by [Highcharts](https://www.highcharts.com) for [DHIS2](https://dhis2.org/) extended development with various number of technologies including [Angular](https://angular.io/).
Development Team from [UDSM](https://dhis2.udsm.ac.tz) develop and maintain this library to ensure visual, usability and consistency in all areas where it will be installed and used for various purpose.

## Installation & Usage

To install the [d2-visualizer](https://www.npmjs.com/package/@iapps/d2-visualizer) run the following npm command [@npm i @iapps/visualization](https://www.npmjs.com/package/@iapps/visualization)

### Install

`npm i @iapps/d2-visualizer`

After installation in your [Angular](https://angular.io/) Project, the use the following import statement to start using [d2-visualizer](https://www.npmjs.com/package/@iapps/d2-visualizer) with your project

### Import

> `import { D2Visualizer } from '@iapps/d2-visualizer'; `

### Use

```ts
Initializing d2-visualizer Library

const d2visualizer = new D2Visualizer()
        .setConfig(this.chartConfigurations)
        .setData(chartVisualizationAnalytics)
        .setId('visualization-container')
        .setType('CHART')
        .setChartType(chartConfig.id)
        .draw()
```

- **setConfig()**: Receive `json` configuration. _(See example below)_

  ```json
  {
    "renderId": "visualization-container",
    "type": "column",
    "title": "PMTCT: Percentage of ANC HIV Testing and Treatment",
    "subtitle": "",
    "hideTitle": false,
    "hideSubtitle": false,
    "showData": true,
    "hideEmptyRows": true,
    "hideLegend": false,
    "cumulativeValues": false,
    "targetLineLabel": "",
    "baseLineLabel": "",
    "legendAlign": "bottom",
    "reverseLegend": false,
    "showLabels": true,
    "axes": [],
    "sortOrder": 0,
    "percentStackedValues": false,
    "multiAxisTypes": [],
    "xAxisType": ["ou"],
    "yAxisType": "dx",
    "zAxisType": ["pe"],
    "touched": true
  }
  ```

- **setData()**: Receive `json` configuration which is DHIS2 Analytics. _(See example below)_

  ```json
  {
    "headers": [
      {
        "name": "dx",
        "column": "Data",
        "valueType": "TEXT",
        "type": "java.lang.String",
        "hidden": false,
        "meta": true
      },
      {
        "name": "ou",
        "column": "Organisation unit",
        "valueType": "TEXT",
        "type": "java.lang.String",
        "hidden": false,
        "meta": true
      },
      {
        "name": "value",
        "column": "Value",
        "valueType": "NUMBER",
        "type": "java.lang.Double",
        "hidden": false,
        "meta": false
      }
    ],
    "metaData": {
      "names": {
        "RD96nI1JXVV": "Kigoma Region",
        "LGTVRhKSn1V": "Singida Region",
        "EO3Ps3ny0Nr": "Shinyanga Region",
        "MAL4cfZoFhJ": "Geita Region",
        "A3b5mw8DJYC": "Mbeya Region",
        "DWSo42hunXH": "Katavi Region",
        "hAFRrgDK0fy": "Mwanza Region",
        "2021Q4": "Oct to Dec 2021",
        "Rg0jCRi9297": "Songwe Region",
        "dx": "Data",
        "vAtZ8a924Lx": "Rukwa Region",
        "Cpd5l15XxwA": "Dodoma Region",
        "sWOWPBvwNY2": "Iringa Region",
        "vYT08q7Wo33": "Mara Region",
        "Crkg9BoUo5w": "Kagera Region",
        "yyW17iCz9As": "Pwani Region",
        "acZHYslyJLt": "Dar Es Salaam Region",
        "qg5ySBw9X5l": "Manyara Region",
        "LAST_QUARTER": "Last quarter",
        "ou": "Organisation unit",
        "bN5q5k5DgLA": "Mtwara Region",
        "lnOyHhoLzre": "Kilimanjaro Region",
        "kZ6RlMnt2bp": "Tabora Region",
        "qarQhOt2OEh": "Njombe Region",
        "vU0Qt1A5IDz": "Tanga Region",
        "YtVMnut7Foe": "Arusha Region",
        "VMgrQWSVIYn": "Lindi Region",
        "pWuwjnfCiQz": "Proportion of women counseled and tested for HIV",
        "Sj50oz9EHvD": "Morogoro Region",
        "pe": "Period",
        "IgTAEKMqKRe": "Simiyu Region",
        "m0frOspS7JY": "MOH - Tanzania",
        "YYsFjeAAY2G": "+ve women initiated ARV to prevent vertical Trans.",
        "ZYYX8Q9SGoV": "Ruvuma Region"
      },
      "items": {
        "RD96nI1JXVV": {
          "uid": "RD96nI1JXVV",
          "code": "TZ.WT.KM",
          "name": "Kigoma Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "LGTVRhKSn1V": {
          "uid": "LGTVRhKSn1V",
          "code": "TZ.CL.SD",
          "name": "Singida Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "EO3Ps3ny0Nr": {
          "uid": "EO3Ps3ny0Nr",
          "code": "TZ.WT.SY",
          "name": "Shinyanga Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "MAL4cfZoFhJ": {
          "uid": "MAL4cfZoFhJ",
          "code": "TZ.LK.GE",
          "name": "Geita Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "A3b5mw8DJYC": {
          "uid": "A3b5mw8DJYC",
          "code": "TZ.SH.MB",
          "name": "Mbeya Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "DWSo42hunXH": {
          "uid": "DWSo42hunXH",
          "code": "TZ.SH.KA",
          "name": "Katavi Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "hAFRrgDK0fy": {
          "uid": "hAFRrgDK0fy",
          "code": "TZ.LK.MZ",
          "name": "Mwanza Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "2021Q4": {
          "uid": "2021Q4",
          "code": "2021Q4",
          "name": "Oct to Dec 2021",
          "dimensionItemType": "PERIOD",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM",
          "startDate": "2021-10-01T00:00:00.000",
          "endDate": "2021-12-31T00:00:00.000"
        },
        "Rg0jCRi9297": {
          "uid": "Rg0jCRi9297",
          "code": "TZ.SH.SO",
          "name": "Songwe Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "dx": {
          "uid": "dx",
          "name": "Data",
          "dimensionType": "DATA_X"
        },
        "vAtZ8a924Lx": {
          "uid": "vAtZ8a924Lx",
          "code": "TZ.SH.RU",
          "name": "Rukwa Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "Cpd5l15XxwA": {
          "uid": "Cpd5l15XxwA",
          "code": "TZ.CL.DO",
          "name": "Dodoma Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "sWOWPBvwNY2": {
          "uid": "sWOWPBvwNY2",
          "code": "TZ.SH.IG",
          "name": "Iringa Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "vYT08q7Wo33": {
          "uid": "vYT08q7Wo33",
          "code": "TZ.LK.MA",
          "name": "Mara Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "Crkg9BoUo5w": {
          "uid": "Crkg9BoUo5w",
          "code": "TZ.LK.KR",
          "name": "Kagera Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "yyW17iCz9As": {
          "uid": "yyW17iCz9As",
          "code": "TZ.ET.PW",
          "name": "Pwani Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "acZHYslyJLt": {
          "uid": "acZHYslyJLt",
          "code": "TZ.ET.DS",
          "name": "Dar Es Salaam Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "qg5ySBw9X5l": {
          "uid": "qg5ySBw9X5l",
          "code": "TZ.NT.MY",
          "name": "Manyara Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "LAST_QUARTER": {
          "name": "Last quarter"
        },
        "ou": {
          "uid": "ou",
          "name": "Organisation unit",
          "dimensionType": "ORGANISATION_UNIT"
        },
        "bN5q5k5DgLA": {
          "uid": "bN5q5k5DgLA",
          "code": "TZ.ST.MT",
          "name": "Mtwara Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "lnOyHhoLzre": {
          "uid": "lnOyHhoLzre",
          "code": "TZ.NT.KL",
          "name": "Kilimanjaro Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "kZ6RlMnt2bp": {
          "uid": "kZ6RlMnt2bp",
          "code": "TZ.WT.TB",
          "name": "Tabora Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "qarQhOt2OEh": {
          "uid": "qarQhOt2OEh",
          "code": "TZ.SH.NJ",
          "name": "Njombe Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "vU0Qt1A5IDz": {
          "uid": "vU0Qt1A5IDz",
          "code": "TZ.NT.TN",
          "name": "Tanga Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "YtVMnut7Foe": {
          "uid": "YtVMnut7Foe",
          "code": "TZ.NT.AS",
          "name": "Arusha Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "VMgrQWSVIYn": {
          "uid": "VMgrQWSVIYn",
          "code": "TZ.ST.LI",
          "name": "Lindi Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "pWuwjnfCiQz": {
          "uid": "pWuwjnfCiQz",
          "name": "Proportion of women counseled and tested for HIV",
          "dimensionItemType": "INDICATOR",
          "valueType": "NUMBER",
          "totalAggregationType": "AVERAGE"
        },
        "Sj50oz9EHvD": {
          "uid": "Sj50oz9EHvD",
          "code": "TZ.ET.MO",
          "name": "Morogoro Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "pe": {
          "uid": "pe",
          "name": "Period",
          "dimensionType": "PERIOD"
        },
        "IgTAEKMqKRe": {
          "uid": "IgTAEKMqKRe",
          "code": "TZ.WT.SI",
          "name": "Simiyu Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "m0frOspS7JY": {
          "uid": "m0frOspS7JY",
          "name": "MOH - Tanzania",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        },
        "YYsFjeAAY2G": {
          "uid": "YYsFjeAAY2G",
          "name": "+ve women initiated ARV to prevent vertical Trans.",
          "description": "1. Proportion of pregnant women initiated on ARV to prevent vertical HIV infection transmission.",
          "dimensionItemType": "INDICATOR",
          "valueType": "NUMBER",
          "totalAggregationType": "AVERAGE"
        },
        "ZYYX8Q9SGoV": {
          "uid": "ZYYX8Q9SGoV",
          "code": "TZ.ST.RV",
          "name": "Ruvuma Region",
          "dimensionItemType": "ORGANISATION_UNIT",
          "valueType": "NUMBER",
          "totalAggregationType": "SUM"
        }
      },
      "dx": ["pWuwjnfCiQz", "YYsFjeAAY2G"],
      "pe": ["2021Q4"],
      "ou": ["m0frOspS7JY", "YtVMnut7Foe", "acZHYslyJLt", "Cpd5l15XxwA", "MAL4cfZoFhJ", "sWOWPBvwNY2", "Crkg9BoUo5w", "DWSo42hunXH", "RD96nI1JXVV", "lnOyHhoLzre", "VMgrQWSVIYn", "qg5ySBw9X5l", "vYT08q7Wo33", "A3b5mw8DJYC", "Sj50oz9EHvD", "bN5q5k5DgLA", "hAFRrgDK0fy", "qarQhOt2OEh", "yyW17iCz9As", "vAtZ8a924Lx", "ZYYX8Q9SGoV", "EO3Ps3ny0Nr", "IgTAEKMqKRe", "LGTVRhKSn1V", "Rg0jCRi9297", "kZ6RlMnt2bp", "vU0Qt1A5IDz"],
      "co": []
    },
    "rows": [
      ["pWuwjnfCiQz", "m0frOspS7JY", "98.4"],
      ["pWuwjnfCiQz", "YtVMnut7Foe", "98.6"],
      ["pWuwjnfCiQz", "acZHYslyJLt", "98.8"],
      ["pWuwjnfCiQz", "Cpd5l15XxwA", "98.9"],
      ["pWuwjnfCiQz", "MAL4cfZoFhJ", "99.0"],
      ["pWuwjnfCiQz", "sWOWPBvwNY2", "97.1"],
      ["pWuwjnfCiQz", "Crkg9BoUo5w", "99.8"],
      ["pWuwjnfCiQz", "DWSo42hunXH", "100.6"],
      ["pWuwjnfCiQz", "RD96nI1JXVV", "98.3"],
      ["pWuwjnfCiQz", "lnOyHhoLzre", "99.9"],
      ["pWuwjnfCiQz", "VMgrQWSVIYn", "97.6"],
      ["pWuwjnfCiQz", "qg5ySBw9X5l", "99.1"],
      ["pWuwjnfCiQz", "vYT08q7Wo33", "98.2"],
      ["pWuwjnfCiQz", "A3b5mw8DJYC", "98.4"],
      ["pWuwjnfCiQz", "Sj50oz9EHvD", "98.3"],
      ["pWuwjnfCiQz", "bN5q5k5DgLA", "98.7"],
      ["pWuwjnfCiQz", "hAFRrgDK0fy", "96.5"],
      ["pWuwjnfCiQz", "qarQhOt2OEh", "95.7"],
      ["pWuwjnfCiQz", "yyW17iCz9As", "97.3"],
      ["pWuwjnfCiQz", "vAtZ8a924Lx", "98.7"],
      ["pWuwjnfCiQz", "ZYYX8Q9SGoV", "98.9"],
      ["pWuwjnfCiQz", "EO3Ps3ny0Nr", "98.4"],
      ["pWuwjnfCiQz", "IgTAEKMqKRe", "98.3"],
      ["pWuwjnfCiQz", "LGTVRhKSn1V", "99.3"],
      ["pWuwjnfCiQz", "Rg0jCRi9297", "98.1"],
      ["pWuwjnfCiQz", "kZ6RlMnt2bp", "98.8"],
      ["pWuwjnfCiQz", "vU0Qt1A5IDz", "96.7"],
      ["YYsFjeAAY2G", "m0frOspS7JY", "84"],
      ["YYsFjeAAY2G", "YtVMnut7Foe", "91"],
      ["YYsFjeAAY2G", "acZHYslyJLt", "89"],
      ["YYsFjeAAY2G", "Cpd5l15XxwA", "64"],
      ["YYsFjeAAY2G", "MAL4cfZoFhJ", "95"],
      ["YYsFjeAAY2G", "sWOWPBvwNY2", "80"],
      ["YYsFjeAAY2G", "Crkg9BoUo5w", "99"],
      ["YYsFjeAAY2G", "DWSo42hunXH", "97"],
      ["YYsFjeAAY2G", "RD96nI1JXVV", "95"],
      ["YYsFjeAAY2G", "lnOyHhoLzre", "95"],
      ["YYsFjeAAY2G", "VMgrQWSVIYn", "51"],
      ["YYsFjeAAY2G", "qg5ySBw9X5l", "75"],
      ["YYsFjeAAY2G", "vYT08q7Wo33", "81"],
      ["YYsFjeAAY2G", "A3b5mw8DJYC", "100"],
      ["YYsFjeAAY2G", "Sj50oz9EHvD", "77"],
      ["YYsFjeAAY2G", "bN5q5k5DgLA", "66"],
      ["YYsFjeAAY2G", "hAFRrgDK0fy", "88"],
      ["YYsFjeAAY2G", "qarQhOt2OEh", "70"],
      ["YYsFjeAAY2G", "yyW17iCz9As", "85"],
      ["YYsFjeAAY2G", "vAtZ8a924Lx", "98"],
      ["YYsFjeAAY2G", "ZYYX8Q9SGoV", "65"],
      ["YYsFjeAAY2G", "EO3Ps3ny0Nr", "75"],
      ["YYsFjeAAY2G", "IgTAEKMqKRe", "93"],
      ["YYsFjeAAY2G", "LGTVRhKSn1V", "50"],
      ["YYsFjeAAY2G", "Rg0jCRi9297", "103"],
      ["YYsFjeAAY2G", "kZ6RlMnt2bp", "92"],
      ["YYsFjeAAY2G", "vU0Qt1A5IDz", "75"]
    ]
  }
  ```

- **setId()**: Receive DOM element ID. _(See example below)_

  ```html
  <div id="visualization-container"></div>
  ```

- **setType()**: Receive a `string` configuration which define type of visualization to be presented . _(See example below)_ - **CHART**: For CHART Visualization - **MAP**: For MAP Visualization - **TABLE**: For Table Visualization
  <br />

- **setChartType()**: If Visualization type is **CHART** then here you may supply `string` configuration for chart type you expect to draw. _(See example below)_ - **line** - **column** - **bar**
  <br />

- **draw()**: Receive no configuration. It initiate process for drawing visualization as per configuration supplied.
