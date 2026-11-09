
"use client";

import { useState, useEffect } from "react";
import "./experience.css";

const gallery = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `galeri ${index + 1}`,
}));

const extensions = ["jpg", "jpeg", "png", "webp"];

function GalleryImage({ name, alt, loading = "lazy" }) {
  const [extensionIndex, setExtensionIndex] = useState(0);

  return (
    <img
      src={`/images/${name}.${extensions[extensionIndex]}`}
      alt={alt}
      loading={loading}
      onError={() => {
        if (extensionIndex < extensions.length - 1) {
          setExtensionIndex((previous) => previous + 1);
        }
      }}
    />
  );
}

export default function ExperiencePage() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const closePhoto = () => setSelectedPhoto(null);

  const nextPhoto = () => {
    setSelectedPhoto(
      (previous) => (previous + 1) % gallery.length
    );
  };

  const previousPhoto = () => {
    setSelectedPhoto(
      (previous) =>
        (previous - 1 + gallery.length) % gallery.length
    );
  };

  useEffect(() => {
    if (selectedPhoto === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedPhoto(
          (previous) => (previous + 1) % gallery.length
        );
      }

      if (event.key === "ArrowLeft") {
        setSelectedPhoto(
          (previous) =>
            (previous - 1 + gallery.length) % gallery.length
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
    <main className="encore-experience-page">

      <section
        className="ex-gallery-section"
        aria-label="ENCORE Experience Gallery"
      >
        <div className="ex-gallery-grid">
          {gallery.map((photo, index) => (
            <button
              type="button"
              key={photo.id}
              className={`ex-gallery-card ${
                index === 0 || index === 5
                  ? "ex-gallery-wide"
                  : ""
              }`}
              onClick={() => setSelectedPhoto(index)}
              aria-label={`Buka foto galeri ${photo.id}`}
            >
              <GalleryImage
                name={photo.name}
                alt={`Foto konser ${photo.id}`}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>
      </section>

      {selectedPhoto !== null && (
        <div
          className="ex-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="ENCORE photo viewer"
          onClick={closePhoto}
        >
          <button
            type="button"
            className="ex-lightbox-close"
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
            className="ex-lightbox-arrow ex-lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              previousPhoto();
            }}
            aria-label="Foto sebelumnya"
          >
            ‹
          </button>

          <div
            className="ex-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <GalleryImage
              key={selectedPhoto}
              name={gallery[selectedPhoto].name}
              alt={`Foto konser ${selectedPhoto + 1}`}
              loading="eager"
            />
          </div>

          <button
            type="button"
            className="ex-lightbox-arrow ex-lightbox-next"
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
