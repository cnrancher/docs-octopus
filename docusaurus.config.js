module.exports = {
  title: 'Octopus',
  tagline: 'Lightweight edge device management system based on Kubernetes/k3s',
  url: 'https://cnrancher.github.io',
  baseUrl: '/docs-octopus/',
  favicon: 'img/favicon.ico',
  organizationName: 'cnrancher', // Usually your GitHub org/user name.
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
          to: 'docs/cn/about',
          activeBasePath: 'docs/cn',
          label: '中文文档',
          position: 'left'
        },
        {
          to: 'docs/en/about',
          activeBasePath: 'docs/en',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://cnrancher.github.io/docs-octopus/eng/',
          label: 'English',
          position: 'right',
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
              label: '关于 Octopus',
              to: 'docs/cn/about',
            },
            {
              label: '快速入门指南',
              to: 'docs/cn/quick-start',
            },
            {
              label: '开发适配器',
              to: 'docs/cn/adaptors/develop',
            },
          ],
        },
        {
          title: '社区相关',
          items: [
            {
              label: 'Rancher 官网',
              href: 'https://www.rancher.cn',
            },
            {
              label: 'Slack',
              href: 'https://slack.rancher.io',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/cnrancher/octopus',
            },
            {
              label: 'Helm Chart',
              href: 'https://github.com/cnrancher/octopus-chart',
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
            'https://github.com/cnrancher/docs-octopus/tree/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [''],
};
