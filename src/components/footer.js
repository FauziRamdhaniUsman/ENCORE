
"use client";

import Link from "next/link";

const INSTAGRAM_URL = "";
const TIKTOK_URL = "";
const YOUTUBE_URL = "";

const legalLinks = [];

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Concerts", href: "/concerts" },
  { name: "Recommended Concerts", href: "/#featured-concerts" },
  { name: "About ENCORE", href: "/about" },
];

const helpLinks = [
  { name: "Contact Us", href: "/about#contact-form" },
  { name: "FAQ", href: "/#faq" },
  { name: "Masuk", href: "/login" },
  { name: "Daftar", href: "/register" },
];

const columnTitle =
  "mt-[5px] mb-[17px] text-[15px] font-bold text-white max-[600px]:mb-[13px] max-[600px]:text-sm";
const columnNav = "flex flex-col gap-3 max-[600px]:gap-2.5";
const navLink =
  "w-fit text-sm leading-normal font-medium text-[#cfc8df] transition duration-200 hover:translate-x-[3px] hover:text-[#b69aff] max-[600px]:text-[13px]";
const socialIcon =
  "flex size-[38px] items-center justify-center rounded-full border border-[#403454] text-[#c4b5fd] transition duration-[250ms]";
const socialLive =
  "hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white";

function SocialLogo({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.4 2.6 2.1 4.3 5 4.5" />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg {...common}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function SocialButton({ type, label, url }) {
  if (!url) {
    return (
      <span
        className={`${socialIcon} cursor-default`}
        role="img"
        aria-label={`${label} (segera hadir)`}
        title={`${label}: segera hadir`}
      >
        <SocialLogo type={type} />
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`${socialIcon} ${socialLive}`}
    >
      <SocialLogo type={type} />
    </a>
  );
}

function FooterColumn({ title, label, links }) {
  return (
    <div>
      <h4 className={columnTitle}>{title}</h4>
      <nav aria-label={label} className={columnNav}>
        {links.map((item) => (
          <Link href={item.href} key={item.name} className={navLink}>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#090714] text-white antialiased">
      <div className="h-0.5 w-full bg-[linear-gradient(90deg,transparent,#8b5cf6,#c4b5fd,#8b5cf6,transparent)] opacity-70" />

      <div className="mx-auto w-full max-w-[1250px] px-[6%] pt-[38px] pb-[17px] max-[600px]:pt-[30px] max-[600px]:pb-[15px]">
        <div className="grid grid-cols-[1.8fr_1fr_1fr] gap-[60px] pb-[30px] max-[900px]:grid-cols-2 max-[900px]:gap-[30px] max-[600px]:gap-x-[18px] max-[600px]:gap-y-7 max-[600px]:pb-[25px]">
          <div className="max-w-[340px] max-[900px]:col-span-full max-[900px]:max-w-[450px]">
            <Link
              href="/"
              aria-label="ENCORE Home"
              className="inline-block text-[29px] font-black tracking-[2px] text-white"
            >
              EN<span className="text-[#a78bfa]">CORE</span>
              <span className="text-white">.</span>
            </Link>

            <h3 className="mt-3.5 mb-[9px] text-[19px] leading-normal font-bold max-[600px]:text-[17px]">
              Every Concert Starts
              <br />
              with ENCORE.
            </h3>

            <p className="max-w-[300px] text-sm leading-[1.8] font-medium text-[#cfc8df]">
              Discover concerts, explore live music, and create
              unforgettable memories.
            </p>

            <div className="mt-[17px] flex items-center gap-[11px]">
              <SocialButton
                type="instagram"
                label="Instagram"
                url={INSTAGRAM_URL}
              />
              <SocialButton
                type="tiktok"
                label="TikTok"
                url={TIKTOK_URL}
              />
              <SocialButton
                type="youtube"
                label="YouTube"
                url={YOUTUBE_URL}
              />

              <Link
                href="/about#contact-form"
                aria-label="Kirim pesan ke ENCORE"
                className={`${socialIcon} ${socialLive}`}
              >
                <SocialLogo type="mail" />
              </Link>
            </div>
          </div>

          <FooterColumn
            title="Explore"
            label="Explore Navigation"
            links={exploreLinks}
          />
          <FooterColumn
            title="Help & Support"
            label="Help and Support Navigation"
            links={helpLinks}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-[15px] gap-y-2 border-t border-[#302747] pt-[15px] max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1.5">
          <p className="text-xs leading-[1.6] font-medium text-[#a89fbb]">
            © 2026 ENCORE. All rights reserved.
          </p>

          {legalLinks.length > 0 && (
            <nav
              aria-label="Legal"
              className="flex flex-wrap items-center gap-x-5 gap-y-1"
            >
              {legalLinks.map((item) => (
                <Link
                  href={item.href}
                  key={item.name}
                  className="text-xs leading-[1.6] font-medium text-[#a89fbb] transition-colors duration-200 hover:text-[#b69aff]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
