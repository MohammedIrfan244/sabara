"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

type GryffindorGalleryProps = {
  images: StaticImageData[];
  onPortraitCollected: () => void;
  onContinue: () => void;
};

const candles = [
  { left: "17%", top: "5%", dur: "6.2s", delay: "-1s" },
  { left: "78%", top: "40%", dur: "7.4s", delay: "-3s" },
  { left: "44%", top: "84%", dur: "5.6s", delay: "-2s" },
];

export function GryffindorGallery({
  images,
  onPortraitCollected,
  onContinue,
}: GryffindorGalleryProps) {
  const [portraitCollected, setPortraitCollected] = useState(false);
  const [artworkOpen, setArtworkOpen] = useState<number | null>(null);
  const [stirred, setStirred] = useState<number | null>(null);

  useEffect(() => {
    let wait: number;
    let reset: number;
    const schedule = () => {
      wait = window.setTimeout(() => {
        setStirred(Math.floor(Math.random() * images.length));
        reset = window.setTimeout(() => setStirred(null), 1100);
        schedule();
      }, 1800 + Math.random() * 3200);
    };
    schedule();
    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(reset);
    };
  }, [images.length]);

  function openArtwork(index: number) {
    if (index === 0) {
      setPortraitCollected(true);
      onPortraitCollected();
    }
    setArtworkOpen(index);
  }

  return (
    <section className="gallery-scene">
      <p className="scene-kicker">A quiet Gryffindor gallery</p>

      <div className="gallery-wall">
        <div className="gallery-beam" aria-hidden="true" />

        <div className="torch torch--left" aria-hidden="true">
          <i className="torch__glow" />
          <i className="torch__flame" />
          <i className="torch__bracket" />
        </div>
        <div
          className="torch torch--right"
          aria-hidden="true"
          style={{ "--d": "-.5s" } as CSSProperties}
        >
          <i className="torch__glow" />
          <i className="torch__flame" />
          <i className="torch__bracket" />
        </div>

        {candles.map((candle, index) => (
          <i
            aria-hidden="true"
            className="gallery-candle"
            key={index}
            style={
              {
                left: candle.left,
                top: candle.top,
                "--dur": candle.dur,
                "--d": candle.delay,
              } as CSSProperties
            }
          />
        ))}

        {Array.from({ length: 14 }, (_, index) => (
          <i
            aria-hidden="true"
            className="gallery-mote"
            key={index}
            style={{
              left: `${(index * 37) % 100}%`,
              animationDelay: `${-index * 1.3}s`,
              animationDuration: `${7 + (index % 5) * 1.6}s`,
            }}
          />
        ))}

        <div className="gallery-ghost" aria-hidden="true" />

        {images.map((image, frame) => (
          <button
            className={`art-frame art-frame--${frame} ${frame === 0 ? "art-frame--portrait" : ""} ${stirred === frame ? "art-frame--stir" : ""}`}
            key={frame}
            onClick={() => openArtwork(frame)}
            style={
              {
                "--delay": `${-(frame * 1.9)}s`,
                "--dur": `${5.5 + ((frame * 1.7) % 3)}s`,
              } as CSSProperties
            }
            type="button"
          >
            <Image
              alt={frame === 0 ? "Lini portrait" : "A treasured photograph"}
              src={image}
            />
          </button>
        ))}
      </div>

      {portraitCollected && (
        <>
          <p className="collection-note">
            Lini&apos;s portrait has joined the Gift Box.
          </p>
          <button className="story-button" onClick={onContinue} type="button">
            Follow the wandlight
          </button>
        </>
      )}

      {artworkOpen !== null && (
        <div className="artwork-modal" role="dialog" aria-label="Artwork view">
          <button
            aria-label="Close artwork"
            className="modal-close"
            onClick={() => setArtworkOpen(null)}
            type="button"
          >
            ×
          </button>
          <Image
            alt={
              artworkOpen === 0 ? "Lini portrait enlarged" : "Photograph enlarged"
            }
            className={artworkOpen === 0 ? "artwork-alive" : undefined}
            src={images[artworkOpen]}
          />
        </div>
      )}
    </section>
  );
}