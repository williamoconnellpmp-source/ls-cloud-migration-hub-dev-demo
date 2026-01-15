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

        <main className="mainContent">
          <div className="container">
            <nav className="breadcrumb">
              <Link href="/" className="breadcrumbLink">Home</Link>
              <span className="sep">|</span>
              <Link href="/life-sciences/evidence" className="breadcrumbLink">Architecture &amp; GxP Evidence</Link>
              <span className="sep">|</span>
              <Link href="/life-sciences/resources" className="breadcrumbLink">Supporting Documentation</Link>
            </nav>

            <section className="hero">
              <h1 className="h1">Why a Validated Document Control Demo?</h1>
              <p className="subtitle">
                A production-style AWS environment showing how regulated document workflows can be designed with audit-ready evidence using serverless infrastructure.
              </p>

              <div className="infoBox">
                <p>
                  In regulated Life Sciences environments, teams must be able to show who performed an action, when it occurred, under which role, and what controls enforced it.
                </p>
                <p>
                  This VDC demo is a working example using native AWS services. It demonstrates role-based access, controlled document access, immutable audit trails, and electronic signature intent.
                </p>

                <div className="credentials">
                  <p>
                    <strong>Demo auth uses localStorage (Submitter/Approver/Admin).</strong> Please enter <strong>ANY</strong> user name and select the user you wish to perform the action as.
                  </p>
                  <p className="smallNote">(This is intentionally a demo-only login. No Hosted UI / PKCE / Cognito required.)</p>
                </div>

                <p className="techStack">
                  Built on AWS using API Gateway, Lambda, DynamoDB, S3, IAM, and CloudFormation.
                </p>
              </div>
            </section>

            <section className="ctaSection">
              <div className="ctaContent">
                <h2 className="ctaTitle">Want to see it in action?</h2>
                <p className="ctaText">
                  Open the demo, choose a role (Submitter/Approver/Admin), run the workflow, and log out before switching roles.
                </p>
              </div>
              <a href={VDC_LOGIN_URL} className="ctaButton">
                Go to the Demo
              </a>
            </section>

            <footer className="footer">
              <Link href="/" className="footerLink">← Back to home</Link>
            </footer>
          </div>
        </main>

        <style jsx>{`
          .page { min-height: 100vh; position: relative; background: #061428; color: rgba(255,255,255,0.92); }
          .heroBg { position: absolute; inset: 0; background-image: linear-gradient(180deg, rgba(5,12,22,0.96) 0%, rgba(5,12,22,0.88) 30%, rgba(5,12,22,0.7) 55%, rgba(5,12,22,0.45) 75%, rgba(5,12,22,0.3) 100%), url("/images/heroes/landing-gxp.png"); background-size: cover; background-position: 70% center; }
          .mainContent { position: relative; z-index: 2; padding: 40px 0 60px; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 22px; }
          .breadcrumb { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
          .breadcrumbLink { color: rgba(255,255,255,0.85); text-decoration: underline; }
          .breadcrumbLink:hover { color: rgba(139,92,246,0.9); }
          .sep { color: rgba(255,255,255,0.35); }
          .hero { margin-bottom: 40px; }
          .h1 { font-size: clamp(1.9rem, 3.5vw, 2.8rem); font-weight: 750; margin-bottom: 16px; color: #fff; }
          .subtitle { font-size: 1.05rem; line-height: 1.6; color: rgba(255,255,255,0.75); margin-bottom: 20px; }
          .infoBox { background: rgba(7,14,24,0.7); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 24px; }
          .infoBox p { margin-bottom: 16px; line-height: 1.65; color: rgba(255,255,255,0.85); }
          .credentials { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 18px; margin: 20px 0; }
          .credentials p { margin-bottom: 10px; line-height: 1.7; }
          .smallNote { margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.7); }
          .techStack { font-size: 0.88rem; color: rgba(255,255,255,0.6); font-style: italic; margin: 0; }
          .ctaSection { background: rgba(7,14,24,0.65); border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 40px; }
          .ctaContent { flex: 1; }
          .ctaTitle { font-size: 1.15rem; font-weight: 600; margin-bottom: 10px; color: #fff; }
          .ctaText { font-size: 0.95rem; color: rgba(255,255,255,0.75); margin: 0; }
          .ctaButton { display: inline-flex; padding: 10px 22px; border-radius: 999px; background: rgb(99,102,241); color: #fff; font-weight: 600; text-decoration: none; }
          .ctaButton:hover { background: rgb(79,70,229); }
          .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); }
          .footerLink { color: rgba(255,255,255,0.7); text-decoration: underline; }
          @media (max-width: 768px) { .ctaSection { flex-direction: column; } }
        `}</style>
      </div>
    </>
  );
}
