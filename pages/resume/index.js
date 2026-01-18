// pages/resume/index.js
import Head from "next/head";
import Link from "next/link";

export default function ResumePage() {
  return (
    <>
      <Head>
        <title>Resume - William O&apos;Connell | AWS TPM</title>
        <meta
          name="description"
          content="William O'Connell - Technical Program Manager specializing in Life Sciences cloud transformations"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">
              Home
            </Link>
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
            <div className="heroSection">
              {/* LEFT */}
              <div className="leftColumn">
                <h1 className="h1">
                  Where Regulated Life Sciences Delivery Meets Hands-On AWS
                </h1>

                <p className="subtitle">
                  Technical Program Manager (AWS SSA) specializing in regulated,
                  cross-functional cloud migration programs with audit-ready
                  evidence and GxP compliance.
                </p>

                {/* ✅ NEW: stats + buttons grouped so they move together */}
                <div className="belowCopy">
                  <div className="stats">
                    <div className="stat">
                      <div className="statValue">$100M+</div>
                      <div className="statLabel">Program Value</div>
                    </div>

                    <div className="statDivider" aria-hidden="true" />

                    <div className="stat">
                      <div className="statValue">100K+</div>
                      <div className="statLabel">Users Migrated</div>
                    </div>

                    <div className="statDivider" aria-hidden="true" />

                    <div className="stat">
                      <div className="statValue">$20M+</div>
                      <div className="statLabel">Savings</div>
                    </div>

                    <div className="statDivider" aria-hidden="true" />

                    <div className="stat">
                      <div className="statValue">100+</div>
                      <div className="statLabel">Team Members</div>
                    </div>
                  </div>

                  <div className="buttonsRow">
                    <Link href="/vdc" legacyBehavior>
                      <a className="btn">Open VDC Demo</a>
                    </Link>

                    <a
                      href="https://empathy.williamoconnellpmp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                    >
                      Open AI Demo
                    </a>

                    <a
                      href="/resume/william-oconnell-resume.pdf"
                      download
                      className="btn btnPrimary"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="rightColumn">
                <div className="phoneStage" aria-label="Contact preview">
                  <div className="phoneGlow" aria-hidden="true" />

                  <div className="phoneDevice">
                    <div className="phoneRim" aria-hidden="true" />
                    <div className="phoneGlass" aria-hidden="true" />

                    <div className="phoneNotch" aria-hidden="true">
                      <span className="notchCam" />
                      <span className="notchSpeaker" />
                    </div>

                    <div className="phoneScreen">
                      <div className="phoneHeader">
                        <div className="phoneBack">← Back</div>
                        <div className="phoneTitle">William O&apos;Connell</div>
                      </div>

                      <div className="phoneBody">
                        <div className="phoneCard">
                          <div className="phoneCardTitle">Contact</div>

                          <div className="phoneItem">
                            <span className="ico">📍</span>
                            <span>Seattle, WA</span>
                          </div>

                          <div className="phoneItem">
                            <span className="ico">✉️</span>
                            <span>WilliamOConnellPMP@gmail.com</span>
                          </div>

                          <div className="phoneItem">
                            <span className="ico">📞</span>
                            <span>+1 (206) 551-5524</span>
                          </div>

                          <div className="phoneItem">
                            <span className="ico">🌐</span>
                            <span>WilliamOConnellPMP.com</span>
                          </div>

                          <div className="phoneDivider" />

                          <div className="phoneItem">
                            <span className="ico">🔗</span>
                            <span>LinkedIn</span>
                          </div>

                          <div className="phoneItem">
                            <span className="ico">✅</span>
                            <span>VDC Demo</span>
                          </div>

                          <div className="phoneItem">
                            <span className="ico">🤖</span>
                            <span>AI Demo</span>
                          </div>
                        </div>
                      </div>

                      <div className="phoneFooter">
                        © 2026 William O&apos;Connell
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            background: #061428;
            color: #fff;
            overflow: hidden;
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
            padding: 14px 0;
            background: rgba(7, 14, 24, 0.35);
            border-bottom: 1px solid rgba(255, 255, 255, 0.14);
            backdrop-filter: blur(10px);
          }

          .headerContainer {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.92rem;
          }

          .homeLink {
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            font-weight: 800;
          }

          .homeLink:hover {
            text-decoration: underline;
          }

          .headerDivider {
            color: rgba(255, 255, 255, 0.25);
          }

          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: rgba(255, 255, 255, 0.72);
          }

          .headerName {
            font-weight: 800;
            color: rgba(255, 255, 255, 0.92);
          }

          .headerSep {
            color: rgba(255, 255, 255, 0.25);
          }

          .headerLink {
            color: rgba(255, 255, 255, 0.78);
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.22);
            padding-bottom: 1px;
          }

          .headerLink:hover {
            color: rgba(255, 255, 255, 0.92);
            border-bottom-color: rgba(255, 255, 255, 0.55);
          }

          .mainContent {
            position: relative;
            z-index: 2;
            padding: 40px 0 90px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            position: relative;
            z-index: 2;
          }

          .heroSection {
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 44px;
            align-items: flex-start;
          }

          .leftColumn {
            max-width: 740px;
          }

          .h1 {
            font-size: clamp(1.85rem, 2.6vw, 2.55rem);
            font-weight: 900;
            line-height: 1.08;
            margin: 0 0 12px;
            letter-spacing: -0.03em;
            color: #fff;
          }

          /* ✅ MOVE SUBTITLE DOWN (yellow arrow) */
          .subtitle {
            font-size: 1.02rem;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.82);
            margin: 0 0 0;
            max-width: 80ch;
            margin-top: 52px; /* <-- pushes subtitle down */
          }

          /* ✅ MOVE STATS + BUTTONS DOWN TOGETHER (red arrow) */
          .belowCopy {
            margin-top: 130px; /* <-- push the whole block down */
          }

          .stats {
            display: grid;
            grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
            align-items: center;
            gap: 18px;
            margin: 0 0 22px;
            padding: 18px 18px;
            background: rgba(7, 14, 24, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 18px;
            backdrop-filter: blur(10px);
            box-shadow: 0 18px 52px rgba(0, 0, 0, 0.22);
          }

          .stat {
            text-align: center;
          }

          .statValue {
            font-size: 2.15rem;
            font-weight: 950;
            letter-spacing: -0.02em;
            color: rgba(255, 255, 255, 0.96);
            margin-bottom: 6px;
          }

          .statLabel {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.68);
            font-weight: 750;
          }

          .statDivider {
            width: 1px;
            height: 44px;
            background: rgba(255, 255, 255, 0.16);
          }

          .buttonsRow {
            display: flex;
            flex-wrap: wrap;
            gap: 40px;
            align-items: center;
          }

          .btn {
            padding: 12px 22px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 0.98rem;
            text-decoration: none;
            transition: transform 0.15s ease, box-shadow 0.15s ease,
              background 0.15s ease, border-color 0.15s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
            min-width: 170px;
            cursor: pointer;
          }

          .btn:hover {
            transform: translateY(-1px);
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.26);
            box-shadow: 0 22px 50px rgba(0, 0, 0, 0.28);
          }

          .btn:active {
            transform: translateY(0px);
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
          }

          .btnPrimary {
            color: #ffffff;
            border: 1px solid rgba(99, 102, 241, 0.55);
            background: linear-gradient(
              90deg,
              rgba(99, 102, 241, 0.95),
              rgba(139, 92, 246, 0.95)
            );
          }

          .btnPrimary:hover {
            border-color: rgba(79, 70, 229, 0.85);
            box-shadow: 0 22px 60px rgba(99, 102, 241, 0.26);
          }

          /* PHONE (unchanged) */
          .rightColumn {
            display: flex;
            justify-content: center;
          }

          .phoneStage {
            position: relative;
            width: 380px;
            height: 720px;
            transform: perspective(1200px) rotateY(-14deg) rotateX(3deg)
              rotateZ(4deg);
          }

          .phoneGlow {
            position: absolute;
            inset: 70px 40px 70px 40px;
            border-radius: 70px;
            filter: blur(26px);
            background: radial-gradient(
                circle at 30% 30%,
                rgba(99, 102, 241, 0.28),
                transparent 60%
              ),
              radial-gradient(
                circle at 70% 70%,
                rgba(139, 92, 246, 0.22),
                transparent 62%
              );
            opacity: 0.9;
            z-index: 0;
          }

          .phoneDevice {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 58px;
            padding: 14px;
            background: linear-gradient(180deg, #0b1220, #060b14);
            box-shadow: 0 42px 110px rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.12);
            z-index: 1;
          }

          .phoneRim {
            position: absolute;
            inset: 6px;
            border-radius: 52px;
            pointer-events: none;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.18),
              rgba(255, 255, 255, 0.04) 26%,
              rgba(255, 255, 255, 0.02) 60%,
              rgba(255, 255, 255, 0.14)
            );
            opacity: 0.35;
          }

          .phoneGlass {
            position: absolute;
            inset: 14px;
            border-radius: 46px;
            pointer-events: none;
            background: linear-gradient(
              115deg,
              rgba(255, 255, 255, 0.18),
              transparent 38%,
              rgba(255, 255, 255, 0.06) 62%,
              transparent
            );
            opacity: 0.35;
            mix-blend-mode: screen;
          }

          .phoneNotch {
            position: absolute;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            width: 150px;
            height: 34px;
            border-radius: 18px;
            background: rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.06);
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .notchCam {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: radial-gradient(
              circle at 30% 30%,
              rgba(120, 180, 255, 0.9),
              rgba(0, 0, 0, 0.65) 70%
            );
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.04);
            opacity: 0.9;
          }

          .notchSpeaker {
            width: 54px;
            height: 6px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
            opacity: 0.65;
          }

          .phoneScreen {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 46px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: linear-gradient(
              180deg,
              rgba(2, 6, 23, 0.94),
              rgba(15, 23, 42, 0.92)
            );
            border: 1px solid rgba(255, 255, 255, 0.10);
          }

          .phoneHeader {
            padding: 20px 18px 16px;
            background: rgba(255, 255, 255, 0.04);
            border-bottom: 1px solid rgba(255, 255, 255, 0.10);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .phoneBack {
            color: rgba(255, 255, 255, 0.78);
            font-size: 0.95rem;
            font-weight: 750;
          }

          .phoneTitle {
            font-weight: 850;
            font-size: 1.02rem;
            color: #fff;
          }

          .phoneBody {
            flex: 1;
            padding: 30px 16px;
          }

          .phoneCard {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
          }

          .phoneCardTitle {
            font-weight: 900;
            font-size: 1.02rem;
            color: #fff;
            margin-bottom: 12px;
            letter-spacing: -0.01em;
          }

          .phoneItem {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.92rem;
            color: rgba(255, 255, 255, 0.88);
            padding: 10px 10px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            margin-bottom: 10px;
          }

          .ico {
            width: 18px;
            display: inline-flex;
            justify-content: center;
            opacity: 0.95;
          }

          .phoneDivider {
            height: 1px;
            background: rgba(255, 255, 255, 0.10);
            margin: 10px 0 12px;
          }

          .phoneFooter {
            padding: 12px 18px;
            text-align: center;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.60);
            border-top: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.02);
          }

          @media (max-width: 980px) {
            .heroSection {
              grid-template-columns: 1fr;
              gap: 44px;
            }

            .rightColumn {
              order: -1;
            }

            .phoneStage {
              transform: perspective(1200px) rotateY(0deg) rotateX(0deg)
                rotateZ(0deg);
              width: 330px;
              height: 640px;
            }

            .stats {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .statDivider {
              display: none;
            }

            .stat {
              padding: 8px 0;
            }
          }
        `}</style>
      </div>
    </>
  );
}
