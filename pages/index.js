// pages/index.js
import Link from "next/link";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>William O’Connell | AWS TPM | Life Sciences Cloud</title>
        <meta
          name="description"
          content="Technical Program Manager (AWS SSA) focused on regulated Life Sciences cloud delivery. GxP / 21 CFR Part 11 background. 14 years Roche / Genentech. AWS Certified Solutions Architect."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        {/* Background */}
        <div className="heroBg" aria-hidden="true" />

        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="brand">
              <div className="brandName">William O’Connell</div>
              <div className="brandSub">
                Seattle, WA | (206) 551-5524 | WilliamOConnellPMP@gmail.com |{" "}
                <a
                  href="https://www.linkedin.com/in/williamoconnell/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inlineLink"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="hero">
            <div className="container">
              <h1 className="h1">
                <span className="h1Line1">Technical Program Manager (AWS SSA)</span>
                <span className="h1Line2">
                  Life Sciences Cloud Transformations
                </span>
              </h1>

              <p className="lead">
                I lead regulated, cross-functional programs that move complex
                platforms to the cloud — safely, predictably, and with evidence.
              </p>

              <p className="lead2">
                GxP / 21 CFR Part 11 delivery background, 14 years with Roche /
                Genentech, now AWS Certified Solutions Architect
              </p>
            </div>
          </section>

          {/* Four Boxes */}
          <section
            className="cardsSection"
            aria-label="Primary proof and links"
          >
            <div className="cardsContainer">
              <div className="cardsGrid">
                {/* 1 — VDC Demo (FIXED) */}
                <Link href="/vdc" passHref legacyBehavior>
                  <a className="card">
                    <div className="cardTitle">VDC Demo</div>
                    <div className="cardText">
                      Validated Document Control
                      <br />
                      (AWS &amp; GxP workflow)
                    </div>
                    <div className="cardHint">Open demo →</div>
                  </a>
                </Link>

                {/* 2 — Regulated Delivery */}
                <Link href="/life-sciences/evidence/" passHref legacyBehavior>
                  <a className="card">
                    <div className="cardTitle">Regulated Delivery</div>
                    <div className="cardText">GxP • 21 CFR Part 11 • CSV</div>
                    <div className="cardHint">Open evidence →</div>
                  </a>
                </Link>

                {/* 3 — Empathy Filter */}
                <a
                  href="https://empathy.williamoconnellpmp.com/about"
                  className="card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="cardTitle">Empathy Filter</div>
                  <div className="cardText">AI POC (Applied AI)</div>
                  <div className="cardHint">Open demo →</div>
                </a>

                {/* 4 — Links only */}
                <div
                  className="card cardLinks"
                  role="group"
                  aria-label="Resume and external links"
                >
                  <Link href="/resume/" passHref legacyBehavior>
                    <a className="linkItem">Resume →</a>
                  </Link>

                  <a
                    href="https://www.credly.com/badges/ced60bdc-c683-4a9a-b9e6-60bcb086fa70/linked_in_profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkItem"
                  >
                    AWS Certification →
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #061428;
            color: #fff;
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

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 22px;
            position: relative;
            z-index: 2;
          }

          .header {
            position: relative;
            z-index: 3;
            padding: 14px 0;
          }

          .brandName {
            font-weight: 750;
            color: #fff;
          }

          .brandSub {
            margin-top: 4px;
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.72);
          }

          .inlineLink {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.35);
            padding-bottom: 1px;
          }

          .inlineLink:hover {
            border-bottom-color: rgba(255, 255, 255, 0.7);
          }

          .hero {
            position: relative;
            z-index: 2;
            padding: 36px 0 0;
          }

          .h1 {
            margin: 0 0 12px;
            font-weight: 850;
            letter-spacing: -0.03em;
            color: #fff;
          }

          .h1Line1 {
            display: block;
            white-space: nowrap;
            font-size: clamp(2.15rem, 3.1vw, 3rem);
            color: #fff;
          }

          .h1Line2 {
            display: block;
            white-space: nowrap;
            font-size: clamp(1.8rem, 2.4vw, 2.35rem);
            margin-top: 2px;
            color: #fff;
          }

          .lead,
          .lead2 {
            font-size: 1.05rem;
            line-height: 1.6;
            max-width: 95ch;
            color: rgba(255, 255, 255, 0.86);
          }

          .lead {
            margin-bottom: 10px;
          }

          .cardsSection {
            position: relative;
            z-index: 2;
            margin-top: 56px;
            padding-bottom: 44px;
          }

          .cardsContainer {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 22px;
          }

          .cardsGrid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
            align-items: stretch;
          }

          .card {
            background: rgba(7, 14, 24, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 16px;
            padding: 22px;
            min-height: 150px;
            text-decoration: none;
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
            box-sizing: border-box;
          }

          .card:hover {
            background: rgba(7, 14, 24, 0.8);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .cardTitle {
            font-weight: 800;
            margin-bottom: 8px;
            text-align: center;
            color: #fff;
          }

          .cardText {
            text-align: center;
            color: rgba(255, 255, 255, 0.78);
            line-height: 1.45;
          }

          .cardHint {
            margin-top: 10px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 700;
            text-align: center;
          }

          .cardLinks {
            gap: 10px;
          }

          .linkItem {
            font-weight: 800;
            color: #fff;
            text-decoration: none;
            text-align: center;
            width: 100%;
          }

          .linkItem:hover {
            text-decoration: underline;
          }

          @media (max-width: 980px) {
            .cardsGrid {
              grid-template-columns: repeat(2, 1fr);
            }
            .h1Line1,
            .h1Line2 {
              white-space: normal;
            }
          }

          @media (max-width: 560px) {
            .cardsGrid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}
