import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  requireAuthOrRedirect,
  getCurrentUser,
} from "@/lib/life_sciences_app_lib/auth";

export default function OverviewPage() {
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    requireAuthOrRedirect(router, "/life-sciences/app");
  }, [router]);

  if (!user) return null;

  return (
    <>
      <Head>
        <title>VDC Demo – Overview</title>
      </Head>

      <div className="page">
        <div className="heroBg" />

        <main className="container">
          <h1>Overview</h1>

          <p className="subtitle">
            Validated Document Control demo workspace. All timestamps are
            recorded in UTC.
          </p>

          <div className="card">
            <strong>Signed in as:</strong> {user.displayName} ({user.role})
          </div>

          <div className="grid">
            <NavCard title="Upload Document" href="/life-sciences/app/upload" />
            <NavCard title="Your Submissions" href="/life-sciences/app/submissions" />
            <NavCard title="Document Register" href="/life-sciences/app/documents" />
            <NavCard
              title="Pending Approvals"
              href="/life-sciences/app/approval/approvals"
              disabled={user.role !== "Approver"}
            />
          </div>
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #061428;
          color: #fff;
          position: relative;
        }

        .heroBg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(5, 12, 22, 0.96),
            rgba(5, 12, 22, 0.75)
          );
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 22px;
          position: relative;
          z-index: 2;
        }

        h1 {
          margin-bottom: 6px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 28px;
        }

        .card {
          background: rgba(10, 18, 35, 0.7);
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 28px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
      `}</style>
    </>
  );
}

function NavCard({ title, href, disabled }) {
  if (disabled) {
    return (
      <div className="navcard disabled">
        {title}
        <style jsx>{`
          .navcard {
            padding: 22px;
            border-radius: 14px;
            background: rgba(20, 30, 55, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <Link href={href} className="navcard">
      {title}
      <style jsx>{`
        .navcard {
          padding: 22px;
          border-radius: 14px;
          background: rgba(20, 30, 55, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }

        .navcard:hover {
          background: rgba(30, 45, 80, 0.8);
        }
      `}</style>
    </Link>
  );
}
