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
    title: <>Build for Edge</>,
    imageUrl: 'img/landing-img-edge.png',
    description: (
      <>
        Lightweight and does not need to replace any basic components of the Kubernetes cluster. After Octopus deployed, the cluster can have the ability to manage edge devices as custom k8s resources.
      </>
    ),
  },
  {
    title: <>Simple yet Flexible</>,
    imageUrl: 'img/landing-img-adaptors.png',
    description: (
      <>
        Octopus has build-in device adaptor like BLE, Modbus, OPC-UA, and MQTT, and it supports custom device adaptor plugins. Go
        ahead and <a href="https://github.com/cnrancher/docs-octopus/blob/master/docs/en/develop.md" target="_blank">build your own adaptor</a>.
      </>
    ),
  },
  {
    title: <>Powered by Kubernetes & k3s</>,
    imageUrl: 'img/landing-img-arch.png',
    description: (
      <>
        Both ARM64 and ARMv7 are supported with multi-arch images. Works great with both valina Kubernetes and <a href="https://k3s.io/" target="_blank">k3s</a>.
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
          <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={classnames('start-button', styles.buttons)}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/en/about')}>
              Get Started
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
