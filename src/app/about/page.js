
"use client";

import Link from "next/link";

function AboutIcon({ type }) {
  const common = {
    width: 46,
    height: 46,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "innovative") {
    return (
      <svg {...common}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14a6 6 0 1 0-6.18 0c.7.5 1.09 1.2 1.09 2v2h4v-2c0-.8.39-1.5 1.09-2Z" />
        <path d="M12 2V1" />
        <path d="m4.93 4.93-.7-.7" />
        <path d="M19.07 4.93l.7-.7" />
      </svg>
    );
  }

  if (type === "quality") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.8 12-1.5 9L12 18l4.7 3-1.5-9" />
        <path d="m10.3 8 1.2 1.2 2.3-2.4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page">

      <section
        className="eh-about"
        aria-labelledby="eh-about-title"
      >

        {/* BACKGROUND */}
        <div className="eh-about-background" />
        <div className="eh-about-overlay" />

        <div className="eh-about-content">

          {/* HEADING */}
          <div className="eh-about-heading">
            <h2 id="eh-about-title">ABOUT US</h2>
            <div className="eh-about-line" />
          </div>

          {/* SLOGAN */}
          <div className="eh-about-slogan">
            <h3>
              Every Concert
              <br />
              Starts with <em>ENCORE.</em>
            </h3>

            <span className="eh-about-tagline">
              Where Music Meets Memories.
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="eh-about-description">
            <p>
              ENCORE adalah platform eksplorasi konser dan
              festival musik yang membantu kamu menemukan
              pengalaman live music favorit dengan lebih
              mudah. Mulai dari konser musisi lokal hingga
              artis internasional yang tampil di Indonesia,
              ENCORE hadir untuk menghubungkan pencinta musik
              dengan berbagai pilihan konser dan festival
              dalam satu tempat.
            </p>
          </div>

          {/* THREE VALUES */}
          <div className="eh-about-values">

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="innovative" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Innovative</h4>

              <p>
                Menghadirkan ide-ide segar dan kreatif
                untuk menciptakan pengalaman eksplorasi
                konser yang menarik dan mudah diakses.
              </p>
            </div>

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="quality" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Quality</h4>

              <p>
                Mengutamakan kualitas informasi dan layanan
                dengan memperhatikan setiap detail untuk
                memberikan pengalaman terbaik bagi pengguna.
              </p>
            </div>

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="reliable" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Reliable</h4>

              <p>
                Berkomitmen menghadirkan informasi yang jelas
                serta layanan yang dapat diandalkan untuk
                memenuhi kebutuhan pencinta musik.
              </p>
            </div>

          </div>

        </div>
      </section>

      <style jsx global>{`

        .about-page {
          position: relative;
          min-height: 100vh;
          background: #090714;
          color: #ffffff;
        }

        .about-page .eh-about {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          overflow: hidden;
          padding: 65px 24px 75px;
        }

        /* BACKGROUND */
        .about-page .eh-about-background {
          position: absolute;
          z-index: -2;
          inset: 0;
          background-image: url("/images/bg%20about.jpg");
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .about-page .eh-about-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(9, 7, 20, 0.76) 0%,
            rgba(9, 7, 20, 0.70) 50%,
            rgba(9, 7, 20, 0.88) 100%
          );
        }

        /* CONTENT */
        .about-page .eh-about-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        /* HEADING */
        .about-page .eh-about-heading h2 {
          margin: 0;
          font-size: 36px;
          font-weight: 800;
          color: #ffffff;
        }

        .about-page .eh-about-line {
          width: 52px;
          height: 3px;
          margin: 17px auto 27px;
          background: #a477ff;
          border-radius: 10px;
        }

        /* SLOGAN */
        .about-page .eh-about-slogan h3 {
          margin: 0;
          font-size: clamp(36px, 4.2vw, 50px);
          font-weight: 800;
          line-height: 1.17;
          letter-spacing: -1.5px;
          color: #ffffff;
        }

        .about-page .eh-about-slogan h3 em {
          color: #a77aff;
          font-style: normal;
        }

        .about-page .eh-about-tagline {
          display: block;
          margin-top: 17px;
          color: #d9c8ff;
          font-size: 15px;
        }

        /* DESCRIPTION */
        .about-page .eh-about-description {
          max-width: 850px;
          margin: 26px auto 62px;
        }

        .about-page .eh-about-description p {
          margin: 0;
          color: rgba(255, 255, 255, 0.88);
          font-size: 13px;
          line-height: 2.1;
        }

        /* VALUES */
        .about-page .eh-about-values {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 45px;
          max-width: 1050px;
          margin: 0 auto;
        }

        .about-page .eh-about-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .about-page .eh-about-value-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 55px;
          margin-bottom: 15px;
          color: #b99aff;
        }

        .about-page .eh-about-value-line {
          width: 35px;
          height: 2px;
          margin-bottom: 17px;
          background: #9c6bff;
        }

        .about-page .eh-about-value h4 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 18px;
          font-weight: 750;
        }

        .about-page .eh-about-value p {
          max-width: 310px;
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
          line-height: 1.8;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {

          .about-page .eh-about {
            padding: 55px 22px 60px;
          }

          .about-page .eh-about-heading h2 {
            font-size: 29px;
          }

          .about-page .eh-about-slogan h3 {
            font-size: 35px;
          }

          .about-page .eh-about-description {
            margin: 25px auto 40px;
          }

          .about-page .eh-about-description p {
            font-size: 12px;
            line-height: 1.9;
          }

          .about-page .eh-about-values {
            grid-template-columns: 1fr;
            gap: 35px;
          }

        }

      `}</style>

    </main>
  );
}
