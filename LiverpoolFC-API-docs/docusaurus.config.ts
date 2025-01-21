import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Liverpool FC API',
  tagline: 'REST API Documentation for Liverpool FC Data',
  favicon: 'img/Liverpool_Logo_2024.png',

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',

  projectName: 'LiverpoolFC-API-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/api-social-card.jpg',
    navbar: {
      title: 'Liverpool FC API',
      logo: {
        alt: 'Liverpool FC API Logo',
        src: 'img/Liverpool_Logo_2024.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'Documentation',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          items: [
            {
              href: 'https://github.com/MKawcz/LiverpoolFC-API',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Liverpool FC API Documentation. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;