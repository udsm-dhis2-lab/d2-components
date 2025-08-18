import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { D2Visualizer, MapLayerConfiguration } from '@iapps/d2-visualizer';

const legendSet = {
  name: 'ANC Coverage',
  legends: [
    {
      name: 'High Plus',
      startValue: 80,
      endValue: 90,
      color: '#FED976',
      id: 'LHzMx7m1mo7',
    },
    {
      name: 'Great',
      startValue: 90,
      endValue: 120,
      color: '#FFFFB2',
      id: 'nFM35aXnjG4',
    },
    {
      name: 'Medium Pl.',
      startValue: 50,
      endValue: 70,
      color: '#FD8D3C',
      id: 'R09fMgqwz7l',
    },
    {
      name: 'Medium',
      startValue: 30,
      endValue: 50,
      color: '#F03B20',
      id: 'fyn331OKcrc',
    },
    {
      name: 'Invalid',
      startValue: 120,
      endValue: 990,
      color: '#CCCCCC',
      id: 'uLeRgauKbmk',
    },
    {
      name: 'Low',
      startValue: 0,
      endValue: 30,
      color: '#BD0026',
      id: 'YCSOboULcBM',
    },
    {
      name: 'High',
      startValue: 70,
      endValue: 80,
      color: '#FEB24C',
      id: 'XMzyLoC0hdi',
    },
  ],
  id: 'fqs276KXCXi',
};

@Component({
  selector: 'app-visualizations',
  templateUrl: './visualizations.component.html',
  imports: [CommonModule],
})
export class VisualizationsComponent {
  async ngOnInit() {
    const dictVisualizer = new D2Visualizer();
    await dictVisualizer
      .setType('DICTIONARY')
      .setId('dictionary')
      // .setIdentifiers(['DvG2vanrUfZ.jvjQnsfaSgm', 'G6OhZ1IVOid.GAHqt096F68'])
      .setIdentifiers(['AT4kgKyXxAS.MtpJ5fF1WPp'])
      .draw();

    // const visualizer = new D2Visualizer();
    // await visualizer
    //   .setType('MAP')
    //   .setId('IG1MfQm6YUu')
    //   .setMapLayerConfig(
    //     new MapLayerConfiguration({
    //       hideBasemap: true,
    //       hideLegendControl: true,
    //       hideNavigationControls: true,
    //       hideStyleSwitcher: true,
    //     })
    //   )
    //   .setConfig({
    //     href: 'http://localhost:8080/api/40/maps/IG1MfQm6YUu',
    //     created: '2025-03-14T15:42:01.738',
    //     lastUpdated: '2025-03-14T15:42:01.738',
    //     access: {
    //       manage: true,
    //       externalize: true,
    //       write: true,
    //       read: true,
    //       update: true,
    //       delete: true,
    //     },
    //     basemap: 'osmLight',
    //     mapViews: [
    //       {
    //         name: 'DCPYyV4MR1D',
    //         created: '2025-03-14T15:42:00.597',
    //         lastUpdated: '2025-03-14T15:42:01.738',
    //         translations: [],
    //         userAccesses: [],
    //         favorites: [],
    //         sharing: {
    //           external: false,
    //           users: {},
    //           userGroups: {},
    //         },
    //         dataDimensionItems: [],
    //         organisationUnits: [
    //           {
    //             path: '/ImspTQPwCqd',
    //             id: 'ImspTQPwCqd',
    //           },
    //         ],
    //         dataElementGroupSetDimensions: [],
    //         organisationUnitGroupSetDimensions: [],
    //         categoryDimensions: [],
    //         categoryOptionGroupSetDimensions: [],
    //         attributeDimensions: [],
    //         dataElementDimensions: [],
    //         programIndicatorDimensions: [],
    //         digitGroupSeparator: 'SPACE',
    //         completedOnly: false,
    //         skipRounding: false,
    //         hideTitle: false,
    //         hideSubtitle: false,
    //         interpretations: [],
    //         subscribers: [],
    //         columns: [],
    //         rows: [
    //           {
    //             items: [
    //               {
    //                 dimensionItemType: 'ORGANISATION_UNIT',
    //                 name: 'Sierra Leone',
    //                 id: 'ImspTQPwCqd',
    //               },
    //               {
    //                 id: 'LEVEL-2',
    //                 name: 'LEVEL-2',
    //               },
    //             ],
    //             dimension: 'ou',
    //           },
    //         ],
    //         filters: [],
    //         parentGraphMap: {
    //           ImspTQPwCqd: '',
    //         },
    //         layer: 'orgUnit',
    //         opacity: 1,
    //         eventClustering: false,
    //         eventPointRadius: 0,
    //         renderingStrategy: 'SINGLE',
    //         parentLevel: 0,
    //         displayName: 'DCPYyV4MR1D',
    //         favorite: false,
    //         subscribed: false,
    //         displayFormName: 'DCPYyV4MR1D',
    //         id: 'DCPYyV4MR1D',
    //         attributeValues: [],
    //       },
    //       {
    //         name: 'ANC 1 Coverage',
    //         created: '2025-03-14T15:42:00.752',
    //         lastUpdated: '2025-03-14T15:42:01.739',
    //         translations: [],
    //         userAccesses: [],
    //         favorites: [],
    //         sharing: {
    //           external: false,
    //           users: {},
    //           userGroups: {},
    //         },
    //         dataDimensionItems: [
    //           {
    //             indicator: {
    //               id: 'Uvn6LCg7dVU',
    //             },
    //             dataDimensionItemType: 'INDICATOR',
    //           },
    //         ],
    //         organisationUnits: [
    //           {
    //             path: '/ImspTQPwCqd',
    //             id: 'ImspTQPwCqd',
    //           },
    //         ],
    //         dataElementGroupSetDimensions: [],
    //         organisationUnitGroupSetDimensions: [],
    //         categoryDimensions: [],
    //         categoryOptionGroupSetDimensions: [],
    //         attributeDimensions: [],
    //         dataElementDimensions: [],
    //         programIndicatorDimensions: [],
    //         digitGroupSeparator: 'SPACE',
    //         completedOnly: false,
    //         skipRounding: false,
    //         hideTitle: false,
    //         hideSubtitle: false,
    //         interpretations: [],
    //         subscribers: [],
    //         columns: [
    //           {
    //             items: [
    //               {
    //                 dimensionItemType: 'INDICATOR',
    //                 name: 'ANC 1 Coverage',
    //                 id: 'Uvn6LCg7dVU',
    //               },
    //             ],
    //             dimension: 'dx',
    //           },
    //         ],
    //         rows: [
    //           {
    //             items: [
    //               {
    //                 dimensionItemType: 'ORGANISATION_UNIT',
    //                 name: 'Sierra Leone',
    //                 id: 'ImspTQPwCqd',
    //               },
    //               {
    //                 id: 'LEVEL-2',
    //                 name: 'LEVEL-2',
    //               },
    //             ],
    //             dimension: 'ou',
    //           },
    //         ],
    //         filters: [
    //           {
    //             items: [
    //               {
    //                 dimensionItemType: 'PERIOD',
    //                 id: 'LAST_10_YEARS',
    //                 name: 'LAST_10_YEARS',
    //               },
    //             ],
    //             dimension: 'pe',
    //           },
    //         ],
    //         parentGraphMap: {
    //           ImspTQPwCqd: '',
    //         },
    //         layer: 'thematic',
    //         method: 1,
    //         classes: 5,
    //         colorScale: '#fee5d9,#fcae91,#fb6a4a,#de2d26,#a50f15',
    //         opacity: 0.9,
    //         eventClustering: false,
    //         eventPointRadius: 0,
    //         renderingStrategy: 'SINGLE',
    //         parentLevel: 0,
    //         displayName: 'ANC 1 Coverage',
    //         favorite: false,
    //         subscribed: false,
    //         displayFormName: 'ANC 1 Coverage',
    //         id: 'g7GVJenGFuz',
    //         attributeValues: [],
    //       },
    //     ],
    //     user: {
    //       id: 'xE7jOejl9FI',
    //       code: null,
    //       name: 'John Traore',
    //       displayName: 'John Traore',
    //       username: 'admin',
    //     },
    //     id: 'IG1MfQm6YUu',
    //     name: 'ANC Test Map',
    //   })
    //   .draw();
  }
}
