
"use client";

import Link from "next/link";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Concerts", href: "/concerts" },
  { name: "Experience", href: "/experience" },
  { name: "News", href: "/news" },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Partnership", href: "/contact#contact-form" },
];

const helpLinks = [
  { name: "Help Center", href: "/contact" },
  { name: "Frequently Asked Questions", href: "/contact" },
  { name: "Ticket Information", href: "/concerts" },
];

export default function Footer() {
  return (
    <footer className="encore-global-footer">

      <style>{`
        .encore-global-footer {
          position: relative;
          width: 100%;
          background: #090714;
          color: #ffffff;
          overflow: hidden;
          font-family: inherit;
        }

        .encore-global-footer * {
          box-sizing: border-box;
        }

        .encore-global-footer .encore-footer-accent {
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #8b5cf6,
            #c4b5fd,
            #8b5cf6,
            transparent
          );
          opacity: 0.7;
        }

        .encore-global-footer .encore-footer-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 38px 6% 17px;
        }

        .encore-global-footer .encore-footer-grid {
          display: grid;
          grid-template-columns: 1.7fr 0.8fr 0.8fr 1.1fr;
          gap: 45px;
          padding-bottom: 30px;
        }

        .encore-global-footer .encore-footer-brand {
          max-width: 300px;
        }

        .encore-global-footer .encore-footer-logo {
          display: inline-block;
          color: #ffffff;
          text-decoration: none;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .encore-global-footer .encore-footer-logo span:first-child {
          color: #a78bfa;
        }

        .encore-global-footer .encore-footer-logo-dot {
          color: #ffffff;
        }

        .encore-global-footer .encore-footer-brand h3 {
          margin: 14px 0 9px;
          font-size: 17px;
          line-height: 1.5;
          font-weight: 750;
        }

        .encore-global-footer .encore-footer-brand p {
          margin: 0;
          max-width: 280px;
          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.8;
        }

        .encore-global-footer .encore-footer-social {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 17px;
        }

        .encore-global-footer .encore-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border: 1px solid #403454;
          border-radius: 50%;
          color: #c4b5fd;
          background: transparent;
          text-decoration: none;
          font-size: 16px;
          transition: 0.25s ease;
        }

        .encore-global-footer .encore-social-icon:hover {
          color: #ffffff;
          background: #8b5cf6;
          border-color: #8b5cf6;
          transform: translateY(-2px);
        }

        .encore-global-footer .encore-footer-column h4 {
          margin: 5px 0 17px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 750;
        }

        .encore-global-footer .encore-footer-column nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .encore-global-footer .encore-footer-column nav a {
          width: fit-content;
          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.5;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .encore-global-footer .encore-footer-column nav a:hover {
          color: #b69aff;
          transform: translateX(3px);
        }

        .encore-global-footer .encore-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding-top: 15px;
          border-top: 1px solid #302747;
        }

        .encore-global-footer .encore-footer-bottom p,
        .encore-global-footer .encore-footer-bottom span {
          margin: 0;
          color: #817991;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .encore-global-footer .encore-footer-grid {
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 30px;
          }

          .encore-global-footer .encore-footer-brand {
            grid-column: 1 / -1;
            max-width: 450px;
          }
        }

        @media (max-width: 600px) {
          .encore-global-footer .encore-footer-container {
            padding: 30px 6% 15px;
          }

          .encore-global-footer .encore-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px 18px;
            padding-bottom: 25px;
          }

          .encore-global-footer .encore-footer-brand {
            grid-column: 1 / -1;
          }

          .encore-global-footer .encore-footer-brand h3 {
            font-size: 16px;
          }

          .encore-global-footer .encore-footer-column h4 {
            margin-bottom: 13px;
          }

          .encore-global-footer .encore-footer-column nav {
            gap: 10px;
          }

          .encore-global-footer .encore-footer-column nav a {
            font-size: 11px;
          }

          .encore-global-footer .encore-footer-bottom {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>

      <div className="encore-footer-accent" />

      <div className="encore-footer-container">

        <div className="encore-footer-grid">

          {/* BRAND */}
          <div className="encore-footer-brand">

            <Link
              href="/"
              className="encore-footer-logo"
              aria-label="ENCORE Home"
            >
              EN<span>CORE</span>
              <span className="encore-footer-logo-dot">.</span>
            </Link>

            <h3>
              Every Concert Starts
              <br />
              with ENCORE.
            </h3>

            <p>
              Discover concerts, explore live music,
              and create unforgettable memories.
            </p>

            <div className="encore-footer-social">

              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="encore-social-icon"
              >
                ◎
              </a>

              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="encore-social-icon"
              >
                ♪
              </a>

              <Link
                href="/contact"
                aria-label="Email"
                className="encore-social-icon"
              >
                ✉
              </Link>

            </div>
          </div>

          {/* EXPLORE */}
          <div className="encore-footer-column">

            <h4>Explore</h4>

            <nav aria-label="Explore Navigation">
              {exploreLinks.map((item) => (
                <Link href={item.href} key={item.name}>
                  {item.name}
                </Link>
              ))}
            </nav>

          </div>

          {/* COMPANY */}
          <div className="encore-footer-column">

            <h4>Company</h4>

            <nav aria-label="Company Navigation">
              {companyLinks.map((item) => (
                <Link href={item.href} key={item.name}>
                  {item.name}
                </Link>
              ))}
            </nav>

          </div>

          {/* HELP & SUPPORT */}
          <div className="encore-footer-column">

            <h4>Help &amp; Support</h4>

            <nav aria-label="Help and Support Navigation">
              {helpLinks.map((item) => (
                <Link href={item.href} key={item.name}>
                  {item.name}
                </Link>
              ))}
            </nav>

          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="encore-footer-bottom">

          <p>
            © 2026 ENCORE. All rights reserved.
          </p>

          <span>
            Made for the love of live music ♡
          </span>

        </div>

      </div>

    </footer>
  );
}
