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

const columnTitle =
  "mt-[5px] mb-[17px] text-[13px] font-bold text-white max-[600px]:mb-[13px]";
const columnNav =
  "flex flex-col gap-3 max-[600px]:gap-2.5";
const navLink =
  "w-fit text-xs leading-normal text-[#aaa2bd] transition duration-200 hover:translate-x-[3px] hover:text-[#b69aff] max-[600px]:text-[11px]";
const socialIcon =
  "flex size-[31px] items-center justify-center rounded-full border border-[#403454] text-base text-[#c4b5fd] transition duration-[250ms] hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white";

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
    <footer className="relative w-full overflow-hidden bg-[#090714] text-white">
      <div className="h-0.5 w-full bg-[linear-gradient(90deg,transparent,#8b5cf6,#c4b5fd,#8b5cf6,transparent)] opacity-70" />

      <div className="mx-auto w-full max-w-[1250px] px-[6%] pt-[38px] pb-[17px] max-[600px]:pt-[30px] max-[600px]:pb-[15px]">
        <div className="grid grid-cols-[1.7fr_0.8fr_0.8fr_1.1fr] gap-[45px] pb-[30px] max-[900px]:grid-cols-[1.4fr_1fr_1fr] max-[900px]:gap-[30px] max-[600px]:grid-cols-2 max-[600px]:gap-x-[18px] max-[600px]:gap-y-7 max-[600px]:pb-[25px]">
          {/* BRAND */}
          <div className="max-w-[300px] max-[900px]:col-span-full max-[900px]:max-w-[450px]">
            <Link
              href="/"
              aria-label="ENCORE Home"
              className="inline-block text-[27px] font-black tracking-[2px] text-white"
            >
              EN<span className="text-[#a78bfa]">CORE</span>
              <span className="text-white">.</span>
            </Link>

            <h3 className="mt-3.5 mb-[9px] text-[17px] leading-normal font-bold max-[600px]:text-base">
              Every Concert Starts
              <br />
              with ENCORE.
            </h3>

            <p className="max-w-[280px] text-xs leading-[1.8] text-[#aaa2bd]">
              Discover concerts, explore live music, and create
              unforgettable memories.
            </p>

            <div className="mt-[17px] flex items-center gap-[11px]">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialIcon}
              >
                ◎
              </a>
              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className={socialIcon}
              >
                ♪
              </a>
              <Link href="/contact" aria-label="Email" className={socialIcon}>
                ✉
              </Link>
            </div>
          </div>

          <FooterColumn
            title="Explore"
            label="Explore Navigation"
            links={exploreLinks}
          />
          <FooterColumn
            title="Company"
            label="Company Navigation"
            links={companyLinks}
          />
          <FooterColumn
            title="Help & Support"
            label="Help and Support Navigation"
            links={helpLinks}
          />
        </div>

        {/* BOTTOM */}
        <div className="flex items-center justify-between gap-[15px] border-t border-[#302747] pt-[15px] max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1.5">
          <p className="text-[10px] leading-[1.6] text-[#817991]">
            © 2026 ENCORE. All rights reserved.
          </p>
          <span className="text-[10px] leading-[1.6] text-[#817991]">
            Made for the love of live music ♡
          </span>
        </div>
      </div>
    </footer>
  );
}