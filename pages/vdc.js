import Head from "next/head";
import Link from "next/link";

// Always start at demo-login. After login we route by role.
const VDC_LOGIN_URL = "/life-sciences/app/demo-login?returnTo=%2Flife-sciences%2Fapp";

export default function VDCDemoPage() {
  return (
    <>
      <Head>
        <title>VDC Demo - Validated Document Control</title>
        <meta name="description" content="Validated Document Control demo on AWS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Evidence-style top header */}
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O&apos;Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <a
                href="mailto:WilliamOConnellPMP@gmail.com"
                className="headerLink"
              >
                WilliamOConnellPMP@gmail.com
              </a>
              <span className="headerSep">|</span>
              <a
                href="https://www.linkedin.com/in/williamoconnell/"
                target="_blank"
                rel="noopener noreferrer"
                className="headerLink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </header>

        <main className="mainContent">
          <div className="container">
            <section className="hero">
              <h1 className="h1">Why a Validated Document Control Demo?</h1>

              <p className="subtitle">
                A live, serverless AWS demo illustrating GxP-capable document workflows, with a full production 21 CFR Part 11 system coming soon.
              </p>

              {/* Combined explainer + demo auth (all above CTA) */}
              <div className="contextBox">
                <p className="whiteText">
                  In regulated Life Sciences environments, teams must be able to demonstrate who performed an action, when it occurred, under which role, and what controls enforced it.
                </p>

                <p className="whiteText">
                  This Validated Document Control (VDC) demo provides a working, non-GxP implementation designed to showcase GxP-capable architectural patterns using native AWS serverless services. The demo illustrates controlled document workflows, role-based actions, and immutable audit trail concepts in a simplified, accessible format.
                </p>

                <p className="whiteText">
                  <strong>Demo authentication (non-GxP)</strong>
                </p>

                <p className="whiteText" style={{ marginBottom: 0 }}>
                  This demo uses a simplified, demo-only login model. Select a role (Submitter or Approver) and enter any user name to explore the workflow. This approach is intentionally non-GxP and is used solely to demonstrate workflow behavior and audit concepts.
                </p>
              </div>

              {/* CTA */}
              <section className="ctaSectionTop">
                <div className="ctaTopLeft">
                  <h2 className="ctaTitle">Want to see it in action?</h2>
                  <p className="ctaText">
                    Open the demo, choose a role (Submitter or Approver),
                    run the workflow, and log out before switching roles.
                  </p>
                </div>

                <a href={VDC_LOGIN_URL} className="ctaButton">
                  Go to the Demo →
                </a>
              </section>

              {/* UPDATE under CTA */}
              <div className="updateBox">
                <p className="whiteText" style={{ margin: 0 }}>
                  <strong>UPDATE:</strong> A full production GxP implementation using AWS products only, including validated identity, role separation, and electronic signature controls is currently under construction and is coming soon.
                </p>
              </div>

              <p className="techStack">
                Built on AWS using API Gateway, Lambda, DynamoDB, S3, IAM, and CloudFormation.
              </p>
            </section>

            <footer className="footer">
              <Link href="/" className="footerLink">← Back to home</Link>
            </footer>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #0a0f1e;
            color: #ffffff;
          }

          .heroBg {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                180deg,
                rgba(5, 12, 22, 0.96) 0%,
                rgba(5, 12, 22, 0.88) 30%,
                rgba(5, 12, 22, 0.7) 55%,
                rgba(5, 12, 22, 0.45) 75%,
                rgba(5, 12, 22, 0.3) 100%
              ),
              url("/images/heroes/landing-gxp.png");
            background-size: cover;
            background-position: 70% center;
          }

          .topHeader {
            position: relative;
            z-index: 3;
            background: rgba(0,0,0,0.4);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 14px 0;
          }

          .headerContainer {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.87rem;
          }

          .homeLink {
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
          }

          .homeLink:hover {
            color: rgba(139,92,246,0.95);
          }

          .headerDivider {
            color: rgba(255,255,255,0.35);
          }

          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: #ffffff;
          }

          .headerName {
            font-weight: 700;
            color: #ffffff;
          }

          .headerSep {
            color: rgba(255,255,255,0.35);
          }

          .headerLink {
            color: #ffffff;
            text-decoration: underline;
          }

          .headerLink:hover {
            color: rgba(139,92,246,0.95);
          }

          .mainContent {
            position: relative;
            z-index: 2;
            padding: 34px 0 70px;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }

          .h1 {
            font-size: clamp(2.0rem, 3.8vw, 3.0rem);
            font-weight: 800;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: -0.02em;
          }

          .subtitle {
            font-size: 1.05rem;
            line-height: 1.6;
            margin-bottom: 18px;
            color: #ffffff;
          }

          .whiteText {
            color: #ffffff !important;
            opacity: 1 !important;
          }

          .contextBox {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 16px;
          }

          .contextBox p {
            margin: 0 0 14px;
            line-height: 1.7;
            color: #ffffff;
          }

          .ctaSectionTop {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 18px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            margin-bottom: 12px;
          }

          .ctaTitle {
            font-size: 1.05rem;
            font-weight: 800;
            margin: 0 0 6px;
            color: #ffffff;
          }

          .ctaText {
            margin: 0;
            color: #ffffff;
            line-height: 1.5;
          }

          .ctaButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            border-radius: 999px;
            background: rgb(99,102,241);
            color: #ffffff;
            font-weight: 700;
            text-decoration: none;
            white-space: nowrap;
          }

          .ctaButton:hover {
            background: rgb(79,70,229);
          }

          .updateBox {
            background: rgba(10,15,30,0.72);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 16px 18px;
            margin-bottom: 14px;
          }

          .techStack {
            margin-top: 8px;
            font-size: 0.92rem;
            color: #ffffff;
            opacity: 1;
            font-style: italic;
          }

          .footer {
            margin-top: 30px;
            padding-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.16);
          }

          .footerLink {
            color: #ffffff;
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .ctaSectionTop {
              flex-direction: column;
              align-items: flex-start;
            }
            .ctaButton {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
