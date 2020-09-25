import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import GitHubButton from 'react-github-btn';

const features = [
  {
    title: <>为边缘而生</>,
    imageUrl: 'img/landing-img-edge.png',
    description: (
      <>
         轻量且不需要替换Kubernetes集群的任何组件。 部署Octopus后，
         集群可以将任何边缘设备作为k8s资源进行管理。
      </>
    ),
  },
  {
    title: <>简单而灵活</>,
    imageUrl: 'img/landing-img-adaptors.png',
    description: (
      <>
        Octopus具有内置的设备协议适配器，如BLE，Modbus，OPC-UA和MQTT，并且支持自定义设备适配器插件。
        点击<a href="https://github.com/cnrancher/docs-octopus/blob/master/docs/cn/develop.md" target="_blank">开始构建</a>自定义适配器。
      </>
    ),
  },
  {
    title: <>支持原生Kubernetes和k3s</>,
    imageUrl: 'img/landing-img-arch.png',
    description: (
      <>
        Octopus镜像同时支持ARM64和ARMv7。 适用于原生 Kubernetes和<a href="https://k3s.io/" target="_blank"> k3s </a>。
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
        <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Lightweight edge device management system based on Kubernetes, powered by Rancher">
      <header className={classnames('hero hero--primary hero-custom', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">基于Kubernetes/k3s的轻量级边缘设备管理系统</p>
            <div className={classnames('start-button', styles.buttons)}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('/docs/cn/about')}>
              开始使用
            </Link>
          </div>
          <GitHubButton href="https://github.com/cnrancher/octopus" data-icon="octicon-star" data-show-count="true" aria-label="Star ntkme/github-buttons on GitHub">Star</GitHubButton>
          <GitHubButton href="https://github.com/cnrancher/octopus/fork" data-icon="octicon-repo-forked" data-show-count="true" aria-label="Fork ntkme/github-buttons on GitHub">Fork</GitHubButton>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
