import type { Config } from '@docusaurus/types';
import type { Preset } from '@docusaurus/preset-classic';

const config: Config = {
  title: 'D2 Components',
  tagline: 'Documentation for DHIS2 Angular and TypeScript packages',
  favicon: 'img/favicon.ico',

  url: 'https://udsm-dhis2-lab.github.io',
  baseUrl: '/d2-components/',

  organizationName: 'udsm-dhis2-lab',
  projectName: 'd2-components',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/udsm-dhis2-lab/d2-components/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/d2-components-social-card.jpg',
    navbar: {
      title: 'D2 Components',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'packagesSidebar',
          position: 'left',
          label: 'Packages',
        },
        {
          href: 'https://github.com/udsm-dhis2-lab/d2-components',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Package index',
              to: '/docs/packages',
            },
            {
              label: 'Contributing to docs',
              to: '/docs/contributing/documentation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'UDSM DHIS2 Lab',
              href: 'https://dhis2.udsm.ac.tz',
            },
            {
              label: 'DHIS2',
              href: 'https://dhis2.org',
            },
          ],
        },
        {
          title: 'Repository',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/udsm-dhis2-lab/d2-components',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} UDSM DHIS2 Lab.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
