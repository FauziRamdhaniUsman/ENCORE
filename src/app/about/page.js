"use client";

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

const values = [
  {
    type: "innovative",
    title: "Innovative",
    description:
      "Menghadirkan ide-ide segar dan kreatif untuk menciptakan pengalaman eksplorasi konser yang menarik dan mudah diakses.",
  },
  {
    type: "quality",
    title: "Quality",
    description:
      "Mengutamakan kualitas informasi dan layanan dengan memperhatikan setiap detail untuk memberikan pengalaman terbaik bagi pengguna.",
  },
  {
    type: "reliable",
    title: "Reliable",
    description:
      "Berkomitmen menghadirkan informasi yang jelas serta layanan yang dapat diandalkan untuk memenuhi kebutuhan pencinta musik.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-background text-white">
      <section
        className="relative isolate min-h-screen overflow-hidden px-6 pt-[65px] pb-[75px] max-[768px]:px-[22px] max-[768px]:pt-[55px] max-[768px]:pb-[60px]"
        aria-labelledby="eh-about-title"
      >
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/bg%20about.jpg")' }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,20,0.76)_0%,rgba(9,7,20,0.70)_50%,rgba(9,7,20,0.88)_100%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center">
          {/* HEADING */}
          <div>
            <h2
              id="eh-about-title"
              className="m-0 font-heading text-[36px] font-extrabold text-white max-[768px]:text-[29px]"
            >
              ABOUT US
            </h2>
            <div className="mx-auto mt-[17px] mb-[27px] h-[3px] w-[52px] rounded-[10px] bg-[#a477ff]" />
          </div>

          {/* SLOGAN */}
          <div>
            <h3 className="m-0 font-heading text-[clamp(36px,4.2vw,50px)] leading-[1.17] font-extrabold tracking-[-1.5px] text-white max-[768px]:text-[35px]">
              Every Concert
              <br />
              Starts with <em className="not-italic text-[#a77aff]">ENCORE.</em>
            </h3>

            <span className="mt-[17px] block text-[15px] text-[#d9c8ff]">
              Where Music Meets Memories.
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="mx-auto mt-[26px] mb-[62px] max-w-[850px] max-[768px]:mt-[25px] max-[768px]:mb-[40px]">
            <p className="m-0 text-[13px] leading-[2.1] text-white/88 max-[768px]:text-[12px] max-[768px]:leading-[1.9]">
              ENCORE adalah platform eksplorasi konser dan festival musik yang
              membantu kamu menemukan pengalaman live music favorit dengan lebih
              mudah. Mulai dari konser musisi lokal hingga artis internasional
              yang tampil di Indonesia, ENCORE hadir untuk menghubungkan
              pencinta musik dengan berbagai pilihan konser dan festival dalam
              satu tempat.
            </p>
          </div>

          {/* THREE VALUES */}
          <div className="mx-auto grid max-w-[1050px] grid-cols-3 gap-[45px] max-[768px]:grid-cols-1 max-[768px]:gap-[35px]">
            {values.map((item) => (
              <div
                key={item.type}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-[15px] flex h-[55px] items-center justify-center text-[#b99aff]">
                  <AboutIcon type={item.type} />
                </div>

                <div className="mb-[17px] h-[2px] w-[35px] bg-[#9c6bff]" />

                <h4 className="m-0 mb-3 font-heading text-[18px] font-bold text-white">
                  {item.title}
                </h4>

                <p className="m-0 max-w-[310px] text-[12px] leading-[1.8] text-white/78">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}