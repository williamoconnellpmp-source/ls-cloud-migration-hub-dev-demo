import Head from "next/head";
import Link from "next/link";

export default function EvidencePage() {
  return (
    <>
      <Head>
        <title>Regulated Documentation & Cloud Evidence - William O'Connell</title>
        <meta name="description" content="Audit-driven validation, compliance resources, and enterprise cloud transformations"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true"/>
        
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O'Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <a href="mailto:WilliamOConnellPMP@gmail.com" className="headerLink">WilliamOConnellPMP@gmail.com</a>
              <span className="headerSep">|</span>
              <a href="https://www.linkedin.com/in/williamoconnell/" target="_blank" rel="noopener noreferrer" className="headerLink">LinkedIn</a>
            </div>
          </div>
        </header>
        
        <main className="mainContent">
          <div className="container">
            <section className="hero">
              <h1 className="h1">Regulated Documentation & Cloud Evidence</h1>
              <p className="subtitle">
                Audit-driven validation, compliance resources, and enterprise cloud transformations.
              </p>
              
              <div className="badges">
                <span className="badge">GxP</span>
                <span className="badge">21 CFR Part 11</span>
                <span className="badge">CSV</span>
                <span className="badge">IQ / OQ / PQ</span>
              </div>
            </section>

            <section className="cardsGrid">
              <div className="card">
                <h2 className="cardTitle">VDC Documentation & Evidence</h2>
                <p className="cardDesc">
                  Audit-ready artifacts aligned to GxP and 21 CFR Part 11.
                </p>
                <div className="cardLinks">
                  <Link href="/life-sciences/docs/urs" className="cardLink">URS (User Requirements) →</Link>
                  <Link href="/life-sciences/docs/functional-spec" className="cardLink">Functional Specification →</Link>
                  <Link href="/life-sciences/docs/traceability-matrix" className="cardLink">Traceability Matrix →</Link>
                  <Link href="/life-sciences/docs/iq-oq-pq" className="cardLink">IQ / OQ / PQ Results →</Link>
                  <Link href="/life-sciences/docs/vdc-non-gxp-evidence" className="cardLink">Non-GxP Verification & Test Evidence (Demo) →</Link>
                </div>
              </div>

              <div className="card">
                <h2 className="cardTitle">Staying Compliant with the FDA</h2>
                <p className="cardDesc">
                  Practical interpretation + controls that map to regulated cloud delivery.
                </p>
                <div className="cardLinks">
                  <Link href="/life-sciences/docs/21-cfr-practice" className="cardLink">21 CFR Part 11 in Practice →</Link>
                  <Link href="/life-sciences/docs/gxp-csv-aws" className="cardLink">GxP & CSV in AWS →</Link>
                  <Link href="/life-sciences/docs/risk-validation" className="cardLink">Risk-Based Validation →</Link>
                  <Link href="/life-sciences/docs/inspection-qa" className="cardLink">Inspection Readiness Q&A →</Link>
                </div>
              </div>

              <div className="card">
                <h2 className="cardTitle">Who's Made the Move</h2>
                <p className="cardDesc">
                  Case studies + lessons learned from enterprise Life Sciences cloud adoption.
                </p>
                <div className="cardLinks">
                  <Link href="/life-sciences/docs/case-studies" className="cardLink">Big Pharma Case Studies →</Link>
                  <Link href="/life-sciences/docs/aws-whitepapers" className="cardLink">AWS Life Sciences Whitepapers →</Link>
                  <Link href="/life-sciences/docs/validation-scale" className="cardLink">Validation at Scale →</Link>
                  <Link href="/life-sciences/docs/lessons-learned" className="cardLink">Lessons Learned →</Link>
                </div>
              </div>

              <div className="card">
                <h2 className="cardTitle">Cloud Transformation Experience</h2>
                <p className="cardDesc">
                  Enterprise delivery in regulated environments — scope, governance, outcomes.
                </p>
                <div className="cardLinks">
                  <Link href="/life-sciences/docs/program-leadership" className="cardLink">Program & Platform Leadership →</Link>
                  <Link href="/life-sciences/docs/system-delivery" className="cardLink">Regulated System Delivery →</Link>
                  <Link href="/life-sciences/docs/aws-transformation" className="cardLink">AWS-Native Transformation →</Link>
                  <Link href="/life-sciences/docs/background" className="cardLink">Life Sciences Background →</Link>
                </div>
              </div>
            </section>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #0a0f1e;
            color: rgba(255,255,255,0.92);
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
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            font-weight: 600;
          }
          .homeLink:hover {
            color: rgba(139,92,246,0.9);
          }
          .headerDivider {
            color: rgba(255,255,255,0.3);
          }
          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: rgba(255,255,255,0.75);
          }
          .headerName {
            font-weight: 600;
            color: rgba(255,255,255,0.9);
          }
          .headerSep {
            color: rgba(255,255,255,0.3);
          }
          .headerLink {
            color: rgba(255,255,255,0.75);
            text-decoration: none;
          }
          .headerLink:hover {
            color: rgba(139,92,246,0.9);
          }
          .mainContent {
            position: relative;
            z-index: 2;
            padding: 50px 0 80px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }
          .hero {
            text-align: center;
            margin-bottom: 40px;
          }
          .h1 {
            font-size: clamp(1.9rem, 3.5vw, 2.6rem);
            font-weight: 800;
            line-height: 1.15;
            margin-bottom: 16px;
            color: #fff;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 1.05rem;
            line-height: 1.5;
            color: rgba(255,255,255,0.75);
            margin-bottom: 24px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
          }
          .badges {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .badge {
            padding: 10px 20px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 999px;
            font-size: 0.87rem;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
          }
          .cardsGrid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .card {
            background: rgba(10,15,30,0.6);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s;
          }
          .card:hover {
            background: rgba(10,15,30,0.8);
            border-color: rgba(59,130,246,0.3);
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
          .cardTitle {
            font-size: 1.05rem;
            font-weight: 700;
            margin-bottom: 12px;
            color: #fff;
          }
          .cardDesc {
            font-size: 0.88rem;
            line-height: 1.5;
            color: rgba(255,255,255,0.7);
            margin-bottom: 16px;
          }
          .cardLinks {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .cardLink {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-size: 0.87rem;
            padding: 9px 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            transition: all 0.2s;
          }
          .cardLink:hover {
            background: rgba(59,130,246,0.15);
            color: rgba(139,92,246,0.9);
          }
          @media (max-width: 968px) {
            .cardsGrid {
              grid-template-columns: 1fr;
            }
            .headerInfo {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}







