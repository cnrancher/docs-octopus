module.exports = {
  title: 'Octopus',
  tagline: 'Lightweight edge device management system based on Kubernetes',
  url: 'https://octopus.rancher.cn',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'RancherLabs', // Usually your GitHub org/user name.
  projectName: 'doc-octopus', // Usually your repo name.
  themeConfig: {
    announcementBar: {
      id: 'support_us', // Any value that will identify this message
      content:
          '<div class="rancher-header">' +
          '<a href="https://rancher.cn/" target="_blank"><img src="/img/rancher-logo-horiz-white.svg" height="20" width="136"/></a>' +
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
          to: 'docs/architecture',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        // {to: 'blog', label: 'Blog', position: 'left'},
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
              label: 'Architecture',
              to: 'docs/architecture',
            },
            {
              label: 'Quick-Start Guide',
              to: 'docs/quick-start',
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
