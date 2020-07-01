module.exports = {
  title: 'Octopus',
  tagline: 'Lightweight edge device management system based on Kubernetes',
  url: 'https://rancheredge.github.io',
  baseUrl: '/docs-octopus/',
  favicon: 'img/favicon.ico',
  organizationName: 'rancheredge', // Usually your GitHub org/user name.
  projectName: 'docs-octopus', // Usually your repo name.
  themeConfig: {
    announcementBar: {
      id: 'support_us', // Any value that will identify this message
      content:
          '<div class="rancher-header">' +
          '<a href="https://rancher.cn/" target="_blank"><img src="/docs-octopus/img/rancher-logo-horiz-white.svg" width="136" height="20"/></a>' +
          '<div>' +
          '<a href="https://rancher.cn/" target="_blank">See what else Rancher is up to.</a> ' +
          '</div>' +
          '</div>',
      backgroundColor: '#2D2B33', // Defaults to `#fff`
      textColor: '#fff', // Defaults to `#000`
    },
    navbar: {
      title: 'Octopus',
      logo: {
        alt: 'Octopus Logo',
        src: 'img/logo.png',
      },
      links: [
        {
          to: 'docs/en/about',
          activeBasePath: 'docs/en',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'docs/cn/about',
          activeBasePath: 'docs/cn',
          label: '中文文档',
          position: 'left'
        },
        {
          href: 'https://github.com/cnrancher/octopus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'About Octopus',
              to: 'docs/en/about',
            },
            {
              label: 'Quick-Start Guide',
              to: 'docs/en/quick-start',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Rancher Website',
              href: 'https://www.rancher.cn',
            },
            {
              label: 'Slack',
              href: 'https://slack.rancher.io',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/cnrancher/octopus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://www.rancher.cn/">Rancher Labs, Inc.</a> Built with love.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/rancheredge/docs-octopus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [''],
};
