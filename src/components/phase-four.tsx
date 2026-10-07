"use client";

import Image from "next/image";
import JSZip from "jszip";
import { useState } from "react";
import cakeLit from "../assets/images/cake-lit.png";
import cakeUnlit from "../assets/images/cake-unlit.png";
import liniPortrait from "../assets/images/lini-portrait.png";
import toothlessImage from "../assets/images/toothless.png";
import wandImage from "../assets/images/wand.png";

const letterSource = new URL("../assets/text/letter.txt", import.meta.url).href;

const archCandles = Array.from({ length: 9 }, (_, i) => {
  const t = (Math.PI * i) / 8;
  return {
    left: `${50 - 46 * Math.cos(t)}%`,
    top: `${90 - 76 * Math.sin(t)}%`,
    "--d": `${(i * 0.37) % 1.6}s`,
    "--o": `${i * 0.08}s`,
  } as React.CSSProperties;
});

type GiftKey = "letter" | "portrait" | "wand" | "toothless" | "cake";
type PhaseFourProps = {
  collected: Record<GiftKey, boolean>;
  initialUnlocked: boolean;
  onGiftUnlock: () => void;
  onMapScene: () => void;
};

const gifts: Array<{ key: GiftKey; label: string; detail: string }> = [
  {
    key: "letter",
    label: "Acceptance Letter",
    detail: "The parchment that began this little adventure.",
  },
  {
    key: "toothless",
    label: "Your Familiar",
    detail: "A small shadow with a very large heart.",
  },
  {
    key: "portrait",
    label: "Lini Portrait",
    detail: "A portrait that quietly glows on the gallery wall.",
  },
  {
    key: "wand",
    label: "Your New Wand",
    detail: "Chosen in the old wandmaker's shop.",
  },
  {
    key: "cake",
    label: "Birthday Cake",
    detail: "The wish that unlocked the box.",
  },
];

const giftImages: Record<Exclude<GiftKey, "letter">, typeof cakeLit> = {
  portrait: liniPortrait,
  wand: wandImage,
  toothless: toothlessImage,
  cake: cakeLit,
};

export function PhaseFour({
  collected,
  initialUnlocked,
  onGiftUnlock,
  onMapScene,
}: PhaseFourProps) {
  const [wishMade, setWishMade] = useState(initialUnlocked);
  const [boxOpen, setBoxOpen] = useState(false);
  const [viewing, setViewing] = useState<GiftKey | null>(null);
  const [downloading, setDownloading] = useState(false);

    const [blowing, setBlowing] = useState(false);

  function blowOut() {
    if (blowing) return;
    setBlowing(true);
    window.setTimeout(() => {
      setWishMade(true);
      onGiftUnlock();
    }, 1600);
  }

  async function downloadGiftBox() {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const root = zip.folder("Lini-Birthday-Gift") ?? zip;
      const addFile = (
        folderName: string,
        fileName: string,
        content: Blob | string,
      ) => {
        const folder = root.folder(folderName);
        if (folder) folder.file(fileName, content);
      };
      const letter = await fetch(letterSource).then((response) =>
        response.text(),
      );
      const letterHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Lini's Acceptance Letter</title><style>body{max-width:620px;margin:40px auto;padding:40px;background:#e3c58c;color:#29180e;font:20px Georgia,serif;line-height:1.5}h1{text-align:center;font-size:26px}p{white-space:pre-wrap}</style></head><body><h1>Hogwarts</h1><p>${letter.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</p></body></html>`;
      addFile("acceptance-letter", "letter.html", letterHtml);
      const portrait = await fetch(liniPortrait.src).then((response) =>
        response.blob(),
      );
      const wand = await fetch(wandImage.src).then((response) =>
        response.blob(),
      );
      const toothless = await fetch(toothlessImage.src).then((response) =>
        response.blob(),
      );
      const litCake = await fetch(cakeLit.src).then((response) =>
        response.blob(),
      );
      const unlitCake = await fetch(cakeUnlit.src).then((response) =>
        response.blob(),
      );
      addFile("lini-portrait", "lini-portrait.png", portrait);
      addFile("wand", "wand.png", wand);
      addFile("toothless", "toothless.png", toothless);
      addFile("cake", "cake-lit.png", litCake);
      addFile("cake", "cake-unlit.png", unlitCake);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Lini-Birthday-Gift.zip";
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const currentGift = gifts.find((gift) => gift.key === viewing);

  if (!wishMade) {
    return (
      <section className="phase-four cake-scene">
        <p className="scene-kicker">
          One last little spell before the box opens
        </p>
        <div className={`wish-arch ${blowing ? "wish-arch--out" : ""}`}>
          <button
            aria-label="Blow out the candles and make a wish"
            className="wish-arch__candles"
            disabled={blowing}
            onClick={blowOut}
            type="button"
          >
            {archCandles.map((style, i) => (
              <span className="arch-candle" key={i} style={style} aria-hidden="true">
                <b className="flame" />
                <em className="smoke" />
              </span>
            ))}
          </button>
          <button
            aria-label="Make a birthday wish"
            className="cake cake--lit"
            disabled={blowing}
            onClick={blowOut}
            type="button"
          >
            <Image alt="A lit birthday cake" src={cakeLit} priority />
          </button>
          <h2>Make a wish</h2>
          <p className="cake-hint">Tap the candles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="phase-four gift-scene">
      <div className="wish-petals" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <i
            key={index}
            style={{
              animationDelay: `${index * 0.09}s`,
              left: `${(index * 23) % 100}%`,
            }}
          />
        ))}
      </div>
      <p className="scene-kicker">The candles soften. The magic remains.</p>
      <div className="cake cake--unlit">
        <Image alt="A birthday cake after the wish" src={cakeUnlit} />
      </div>
      <h2>Your Gift Box is unlocked</h2>
      <button
        className="gift-box-open"
        onClick={() => setBoxOpen(true)}
        type="button"
      >
        Open the Gift Box <span>✦</span>
      </button>
      <button className="map-path" onClick={onMapScene} type="button">
        Unfold the final map
      </button>
      {boxOpen && (
        <div
          className="gift-box-modal"
          role="dialog"
          aria-label="Lini's Gift Box"
        >
          <button
            aria-label="Close Gift Box"
            className="modal-close"
            onClick={() => setBoxOpen(false)}
            type="button"
          >
            ×
          </button>
          <h3>Lini&apos;s Gift Box</h3>
          <p className="gift-intro">Five discoveries, kept close.</p>
          <div className="gift-grid">
            {gifts.map((gift) => (
              <button
                className={`gift-item gift-item--${gift.key}`}
                key={gift.key}
                onClick={() => setViewing(gift.key)}
                type="button"
              >
                {gift.key === "letter" ? (
                  <span className="letter-gift">✦</span>
                ) : (
                  <Image alt="" src={giftImages[gift.key]} />
                )}
                <span>{gift.label}</span>
                {!collected[gift.key] && <small>awaiting</small>}
              </button>
            ))}
          </div>
          <button
            className="download-box"
            disabled={downloading}
            onClick={downloadGiftBox}
            type="button"
          >
            {downloading ? "Preparing your keepsakes…" : "Download Gift Box"}
          </button>
        </div>
      )}
      {currentGift && (
        <div className={`gift-view gift-view--${currentGift.key}`} role="dialog" aria-label={currentGift.label}>
          <button
            aria-label="Close keepsake"
            className="modal-close"
            onClick={() => setViewing(null)}
            type="button"
          >
            ×
          </button>
          {currentGift.key === "letter" ? (
            <article className="gift-letter">
              <p>Hogwarts</p>
              <p>
                The acceptance letter is safely held in your downloadable Gift
                Box.
              </p>
            </article>
          ) : (
            <Image
              alt={currentGift.label}
              src={giftImages[currentGift.key]}
            />
          )}
          <h3>{currentGift.label}</h3>
          <p>{currentGift.detail}</p>
        </div>
      )}
    </section>
  );
}