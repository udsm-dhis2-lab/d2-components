import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="D2 Components"
      description="Documentation for UDSM DHIS2 Lab component packages"
    >
      <main>
        <section className="hero hero--primary">
          <div className="container">
            <h1 className="hero__title">D2 Components</h1>
            <p className="hero__subtitle">
              Documentation home for the DHIS2 Angular and TypeScript packages
              developed and maintained at UDSM DHIS2 Lab.
            </p>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Get Started
            </Link>
          </div>
        </section>
        <section className="container margin-vert--xl"></section>
      </main>
    </Layout>
  );
}
