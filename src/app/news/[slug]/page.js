
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsArticles } from "../newsData";

export function generateStaticParams() {
  return newsArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  const article = newsArticles.find(
    (item) => item.slug === slug
  );

  if (!article) {
    notFound();
  }

  const relatedArticles = newsArticles
    .filter(
      (item) =>
        item.slug !== article.slug &&
        item.category === article.category
    )
    .slice(0, 3);

  return (
    <main className="encore-news-detail">

      {/* BACKGROUND */}

      <div className="detail-background" />
      <div className="detail-overlay" />

      <div className="detail-container">

        {/* BACK BUTTON */}

        <Link href="/news" className="detail-back">
          <span>‹</span> Back to News
        </Link>

        {/* ARTICLE HEADER */}

        <header className="detail-header">

          <span className="detail-category">
            {article.category}
          </span>

          <h1>{article.title}</h1>

          <p className="detail-excerpt">
            {article.excerpt}
          </p>

          <div className="detail-meta">
            <span>{article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>

        </header>

        {/* ARTICLE IMAGE */}

        <div className="detail-image">
          <img
            src={article.image}
            alt={article.title}
          />
        </div>

        {/* ARTICLE BODY */}

        <article className="detail-content">

          <p className="detail-introduction">
            {article.excerpt}
          </p>

          {article.content.map((section, index) => (
            <section
              className="detail-paragraph"
              key={index}
            >

              <h2>{section.heading}</h2>

              <p>{section.text}</p>

            </section>
          ))}

          <div className="detail-ending">

            <span>ENCORE</span>

            <p>
              Discover more stories, explore music,
              and make every concert moment count.
            </p>

          </div>

        </article>

        {/* RELATED ARTICLES */}

        {relatedArticles.length > 0 && (

          <section className="detail-related">

            <div className="detail-related-heading">
              <span>KEEP EXPLORING</span>
              <h2>Related Stories</h2>
            </div>

            <div className="detail-related-grid">

              {relatedArticles.map((item) => (

                <Link
                  href={`/news/${item.slug}`}
                  className="detail-related-card"
                  key={item.id}
                >

                  <div className="detail-related-image">

                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />

                  </div>

                  <div className="detail-related-info">

                    <span>{item.category}</span>

                    <h3>{item.title}</h3>

                    <small>
                      Read More <b>›</b>
                    </small>

                  </div>

                </Link>

              ))}

            </div>

          </section>

        )}

        {/* BOTTOM CTA */}

        <section className="detail-cta">

          <h2>Find Your Next Live Experience</h2>

          <p>
            Explore upcoming concerts and discover
            your next favorite music experience.
          </p>

          <Link
            href="/concerts"
            className="detail-cta-button"
          >
            Explore Concerts <span>›</span>
          </Link>

        </section>

      </div>

      {/* DETAIL CSS */}

      <style>{`

        .encore-news-detail {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #090714;
          color: #ffffff;
          font-family: inherit;
        }

        .encore-news-detail * {
          box-sizing: border-box;
        }

        /* BACKGROUND */

        .detail-background {
          position: absolute;
          z-index: -2;
          inset: 0;
          background-image: url("/images/bg%20news.jpg");
          background-position: center top;
          background-size: cover;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .detail-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(9,7,20,0.65),
            rgba(9,7,20,0.90) 40%,
            #090714 100%
          );
          pointer-events: none;
        }

        /* CONTAINER */

        .detail-container {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
          padding: 45px 6% 80px;
        }

        /* BACK */

        .detail-back {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 40px;
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: 0.2s;
        }

        .detail-back:hover {
          color: #ffffff;
          transform: translateX(-3px);
        }

        .detail-back span {
          font-size: 25px;
          line-height: 1;
        }

        /* HEADER */

        .detail-header {
          max-width: 850px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .detail-category {
          display: inline-block;
          padding: 8px 13px;
          border-radius: 5px;
          background: rgba(139,92,246,0.16);
          color: #c4b5fd;
          font-size: 10px;
          font-weight: 700;
        }

        .detail-header h1 {
          margin: 20px 0 14px;
          font-size: clamp(29px,4.5vw,45px);
          line-height: 1.25;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .detail-excerpt {
          max-width: 700px;
          margin: 0 auto;
          color: #b9b0c9;
          font-size: 13px;
          line-height: 1.9;
        }

        .detail-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 23px;
          color: #92899f;
          font-size: 10px;
        }

        /* IMAGE */

        .detail-image {
          width: 100%;
          aspect-ratio: 16 / 8;
          overflow: hidden;
          border: 1px solid rgba(196,181,253,0.15);
          border-radius: 13px;
          background: #151126;
        }

        .detail-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ARTICLE CONTENT */

        .detail-content {
          max-width: 800px;
          margin: 45px auto 65px;
        }

        .detail-introduction {
          margin: 0 0 35px;
          padding-left: 18px;
          border-left: 3px solid #8b5cf6;
          color: #e4ddf0;
          font-size: 16px;
          font-weight: 550;
          line-height: 1.9;
        }

        .detail-paragraph {
          margin-bottom: 30px;
        }

        .detail-paragraph h2 {
          margin: 0 0 12px;
          color: #c4b5fd;
          font-size: 19px;
          font-weight: 750;
        }

        .detail-paragraph p {
          margin: 0;
          color: #c0b8d0;
          font-size: 13px;
          line-height: 2;
        }

        .detail-ending {
          margin-top: 45px;
          padding: 23px;
          border: 1px solid rgba(167,139,250,0.20);
          border-radius: 9px;
          background: rgba(21,17,38,0.80);
        }

        .detail-ending span {
          color: #b69aff;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .detail-ending p {
          margin: 9px 0 0;
          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.8;
        }

        /* RELATED */

        .detail-related {
          margin-bottom: 65px;
        }

        .detail-related-heading {
          margin-bottom: 23px;
        }

        .detail-related-heading > span {
          color: #a78bfa;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 2px;
        }

        .detail-related-heading h2 {
          margin: 9px 0 0;
          font-size: 26px;
          font-weight: 800;
        }

        .detail-related-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 20px;
        }

        .detail-related-card {
          overflow: hidden;
          border: 1px solid rgba(196,181,253,0.13);
          border-radius: 10px;
          background: rgba(15,11,29,0.94);
          color: white;
          text-decoration: none;
          transition: 0.25s;
        }

        .detail-related-card:hover {
          transform: translateY(-4px);
          border-color: #8b5cf6;
        }

        .detail-related-image {
          aspect-ratio: 16 / 10;
          overflow: hidden;
        }

        .detail-related-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.3s;
        }

        .detail-related-card:hover img {
          transform: scale(1.05);
        }

        .detail-related-info {
          padding: 16px;
        }

        .detail-related-info > span {
          color: #b69aff;
          font-size: 10px;
        }

        .detail-related-info h3 {
          min-height: 48px;
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .detail-related-info small {
          color: #b69aff;
          font-size: 10px;
          font-weight: 700;
        }

        .detail-related-info small b {
          font-size: 17px;
        }

        /* CTA */

        .detail-cta {
          padding: 42px 20px;
          border: 1px solid rgba(167,139,250,0.20);
          border-radius: 12px;
          background: rgba(21,17,38,0.90);
          text-align: center;
        }

        .detail-cta h2 {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
        }

        .detail-cta p {
          margin: 12px auto 22px;
          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.8;
        }

        .detail-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 7px;
          background: #8b5cf6;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.25s;
        }

        .detail-cta-button:hover {
          background: #7042d4;
        }

        .detail-cta-button span {
          font-size: 19px;
        }

        /* TABLET */

        @media (max-width: 800px) {

          .detail-related-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

        }

        /* MOBILE */

        @media (max-width: 600px) {

          .detail-container {
            padding: 30px 5% 55px;
          }

          .detail-back {
            margin-bottom: 28px;
          }

          .detail-header h1 {
            font-size: 29px;
          }

          .detail-excerpt {
            font-size: 12px;
          }

          .detail-image {
            aspect-ratio: 4 / 3;
          }

          .detail-content {
            margin-top: 32px;
          }

          .detail-introduction {
            font-size: 14px;
          }

          .detail-paragraph h2 {
            font-size: 17px;
          }

          .detail-paragraph p {
            font-size: 12px;
          }

          .detail-related-grid {
            grid-template-columns: 1fr;
          }

          .detail-cta h2 {
            font-size: 21px;
          }

        }

      `}</style>

    </main>
  );
}
