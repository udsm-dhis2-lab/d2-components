import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  packagesSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Packages',
      link: {
        type: 'doc',
        id: 'packages/index',
      },
      items: [
        {
          type: 'category',
          label: 'd2-web-sdk',
          link: {
            type: 'doc',
            id: 'packages/dhis2-web-sdk/overview',
          },
          items: [
            {
              type: 'category',
              label: 'Getting started',
              items: [
                'packages/dhis2-web-sdk/getting-started/installation',
                'packages/dhis2-web-sdk/getting-started/angular-integration',
                'packages/dhis2-web-sdk/getting-started/react-integration',
              ],
            },
            {
              type: 'category',
              label: 'Core concepts',
              items: [
                'packages/dhis2-web-sdk/concepts/architecture-and-runtime',
                'packages/dhis2-web-sdk/concepts/metadata-query-builder',
                'packages/dhis2-web-sdk/concepts/tracker-and-event-models',
                'packages/dhis2-web-sdk/concepts/decorators-and-typed-models',
              ],
            },
            {
              type: 'category',
              label: 'Guides',
              items: [
                'packages/dhis2-web-sdk/guides/program-metadata',
                'packages/dhis2-web-sdk/guides/tracked-entities',
                'packages/dhis2-web-sdk/guides/events',
                'packages/dhis2-web-sdk/guides/create-update-save',
                'packages/dhis2-web-sdk/guides/program-rule-engine',
                'packages/dhis2-web-sdk/guides/http-client-and-indexeddb',
                'packages/dhis2-web-sdk/guides/extensions-and-reusable-abstractions',
              ],
            },
            {
              type: 'category',
              label: 'API reference',
              items: [
                'packages/dhis2-web-sdk/reference/runtime',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'packages/dhis2-web-sdk/reference/modules/app-manifest-module',
                    'packages/dhis2-web-sdk/reference/modules/user-module',
                    'packages/dhis2-web-sdk/reference/modules/system-module',
                    'packages/dhis2-web-sdk/reference/modules/program-module',
                    'packages/dhis2-web-sdk/reference/modules/data-element-module',
                    'packages/dhis2-web-sdk/reference/modules/option-set-module',
                    'packages/dhis2-web-sdk/reference/modules/tracker-module',
                    'packages/dhis2-web-sdk/reference/modules/event-module',
                    'packages/dhis2-web-sdk/reference/modules/engine-module',
                  ],
                },
                {
                  type: 'category',
                  label: 'Models',
                  items: [
                    'packages/dhis2-web-sdk/reference/models/program-model',
                    'packages/dhis2-web-sdk/reference/models/tracked-entity-instance',
                    'packages/dhis2-web-sdk/reference/models/enrollment',
                    'packages/dhis2-web-sdk/reference/models/event-model',
                    'packages/dhis2-web-sdk/reference/models/user-system-manifest',
                  ],
                },
                {
                  type: 'category',
                  label: 'Decorators',
                  items: [
                    'packages/dhis2-web-sdk/reference/decorators/tracker-decorators',
                    'packages/dhis2-web-sdk/reference/decorators/event-decorators',
                    'packages/dhis2-web-sdk/reference/decorators/shared-decorators',
                  ],
                },
                'packages/dhis2-web-sdk/reference/shared-primitives',
                'packages/dhis2-web-sdk/reference/http-and-response-models',
                'packages/dhis2-web-sdk/reference/exports-map',
              ],
            },
            {
              type: 'category',
              label: 'Implementation notes',
              items: [
                'packages/dhis2-web-sdk/notes/current-behavior-and-limitations',
              ],
            },
          ],
        },
        'packages/ng-dhis2-ui/overview',
        'packages/ng-dhis2-http-client/overview',
        'packages/ng-dhis2-shell/overview',
        'packages/ng-dhis2-dashboard/overview',
        'packages/ng-dhis2-dictionary/overview',
        'packages/dhis2-visualizer/overview',
        'packages/dhis2-period-utilities/overview',
        'packages/dhis2-analytics/overview',
      ],
    },
    {
      type: 'category',
      label: 'Maintainers',
      items: ['contributing/documentation'],
    },
  ],
};

export default sidebars;
