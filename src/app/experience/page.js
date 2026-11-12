"use client";

import { useState, useEffect } from "react";

const gallery = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `galeri ${index + 1}`,
}));

const extensions = ["jpg", "jpeg", "png", "webp"];

function GalleryImage({ name, alt, loading = "lazy", className = "" }) {
  const [extensionIndex, setExtensionIndex] = useState(0);

  return (
    <img
      src={`/images/${name}.${extensions[extensionIndex]}`}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (extensionIndex < extensions.length - 1) {
          setExtensionIndex((previous) => previous + 1);
        }
      }}
    />
  );
}

const lightboxArrowBtn =
  "fixed top-1/2 flex size-[45px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/33 bg-[#211735] p-0 text-[34px] leading-none text-white transition-colors duration-200 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c4b5fd] max-[600px]:size-8 max-[600px]:text-[26px]";

export default function ExperiencePage() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const closePhoto = () => setSelectedPhoto(null);

  const nextPhoto = () => {
    setSelectedPhoto((previous) => (previous + 1) % gallery.length);
  };

  const previousPhoto = () => {
    setSelectedPhoto(
      (previous) => (previous - 1 + gallery.length) % gallery.length
    );
  };

  useEffect(() => {
    if (selectedPhoto === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedPhoto((previous) => (previous + 1) % gallery.length);
      }

      if (event.key === "ArrowLeft") {
        setSelectedPhoto(
          (previous) => (previous - 1 + gallery.length) % gallery.length
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-background text-white">
      {/* BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/bg galeri.jpg")' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,20,0.92)_0%,rgba(9,7,20,0.78)_45%,rgba(9,7,20,0.94)_100%)]" />

      <section
        className="relative z-[1] mx-auto w-full max-w-[1500px] px-[7%] pt-[65px] pb-[85px] max-[900px]:px-[5%] max-[900px]:pt-[50px] max-[900px]:pb-[70px] max-[600px]:px-[4%] max-[600px]:pt-[25px] max-[600px]:pb-[45px]"
        aria-label="ENCORE Experience Gallery"
      >
        <div className="grid grid-flow-row-dense auto-rows-[260px] grid-cols-3 gap-[17px] max-[900px]:auto-rows-[240px] max-[900px]:grid-cols-2 max-[900px]:gap-3.5 max-[600px]:auto-rows-[165px] max-[600px]:gap-2.5">
          {gallery.map((photo, index) => {
            const isWide = index === 0 || index === 5;

            return (
              <button
                type="button"
                key={photo.id}
                className={`group relative m-0 block size-full min-w-0 cursor-pointer overflow-hidden rounded-[14px] border border-[#49316d] bg-[#211735] p-0 transition-[border-color,box-shadow] duration-250 hover:border-primary-light hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd] max-[600px]:rounded-[10px] ${
                  isWide ? "col-span-2" : ""
                }`}
                onClick={() => setSelectedPhoto(index)}
                aria-label={`Buka foto galeri ${photo.id}`}
              >
                <GalleryImage
                  name={photo.name}
                  alt={`Foto konser ${photo.id}`}
                  loading={index < 3 ? "eager" : "lazy"}
                  className="block size-full object-cover object-center transition-transform duration-450 group-hover:scale-105 motion-reduce:transition-none"
                />
              </button>
            );
          })}
        </div>
      </section>

      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05030cf5] backdrop-blur-[14px]"
          role="dialog"
          aria-modal="true"
          aria-label="ENCORE photo viewer"
          onClick={closePhoto}
        >
          <button
            type="button"
            className="absolute top-[22px] right-7 flex size-[45px] cursor-pointer items-center justify-center rounded-full border border-white/33 bg-[#211735] p-0 text-[30px] leading-none text-white transition-colors duration-200 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c4b5fd] max-[600px]:top-[15px] max-[600px]:right-[15px] max-[600px]:size-[38px]"
            onClick={(event) => {
              event.stopPropagation();
              closePhoto();
            }}
            aria-label="Tutup foto"
          >
            ×
          </button>

          <button
            type="button"
            className={`${lightboxArrowBtn} left-[25px] max-[600px]:left-[5px]`}
            onClick={(event) => {
              event.stopPropagation();
              previousPhoto();
            }}
            aria-label="Foto sebelumnya"
          >
            ‹
          </button>

          <div
            className="flex max-h-[85vh] w-[min(85vw,1100px)] items-center justify-center max-[600px]:w-[82vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <GalleryImage
              key={selectedPhoto}
              name={gallery[selectedPhoto].name}
              alt={`Foto konser ${selectedPhoto + 1}`}
              loading="eager"
              className="block h-auto max-h-[85vh] w-auto max-w-full rounded-[7px] object-contain max-[600px]:max-h-[75vh]"
            />
          </div>

          <button
            type="button"
            className={`${lightboxArrowBtn} right-[25px] max-[600px]:right-[5px]`}
            onClick={(event) => {
              event.stopPropagation();
              nextPhoto();
            }}
            aria-label="Foto berikutnya"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}