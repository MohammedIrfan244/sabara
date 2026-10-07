"use client";

import { useEffect, useRef, useState } from "react";
import liniPortrait from "../assets/images/lini-portrait.png";
import photoOne from "../assets/images/photo-1.jpg";
import photoTwo from "../assets/images/photo-2.jpg";
import photoThree from "../assets/images/photo-3.jpg";
import { OwlLetterSequence } from "./owl-letter-sequence";
import { GryffindorGallery } from "./gryffindor-gallery";
import { PhaseThree } from "./phase-three";
import { PhaseFour } from "./phase-four";
import { PhaseFive } from "./phase-five";

const lumosSource = new URL("../assets/audio/lumos.mp3", import.meta.url).href;
const ambientSource = new URL("../assets/audio/ambient.mp3", import.meta.url)
  .href;
const jokesSource = new URL("../assets/text/inside-jokes.txt", import.meta.url)
  .href;

type MagicPhase =
  | "dark"
  | "awakening"
  | "owl-letter"
  | "gallery"
  | "ollivander"
  | "cake"
  | "map"
  | "nox";

const petals = Array.from({ length: 17 }, (_, index) => ({
  animationDelay: `${(index * .61) % 6}s`,
  left: `${4 + ((index * 37) % 92)}%`,
  animationDuration: `${8 + (index % 5) * 1.7}s`,
  gold: index === 3 || index === 11 || index === 15,
}));

const candles = Array.from({ length: 6 }, (_, index) => ({
  animationDelay: `${index * 1.17}s`,
  left: `${9 + index * 16}%`,
  top: `${10 + ((index * 23) % 36)}%`,
}));

const galleryImages = [liniPortrait, photoOne, photoTwo, photoThree];

export function BirthdayExperience() {
  const [phase, setPhase] = useState<MagicPhase>("dark");
  const [muted, setMuted] = useState(false);
  const [joke, setJoke] = useState<string | null>(null);
  const [letterRead, setLetterRead] = useState(false);
  const [portraitCollected, setPortraitCollected] = useState(false);
  const [wandCollected, setWandCollected] = useState(false);
  const [toothlessCollected, setToothlessCollected] = useState(false);
  const [noxCompleted, setNoxCompleted] = useState(false);
  const [giftBoxUnlocked, setGiftBoxUnlocked] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      ambientRef.current?.pause();
      ambientRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (ambientRef.current) ambientRef.current.muted = muted;
  }, [muted]);

  function illuminate() {
    if (phase !== "dark") return;
    setPhase("awakening");

    const spell = new Audio(lumosSource);
    spell.muted = muted;
    spell.volume = .62;
    void spell.play().catch(() => undefined);

    const ambient = new Audio(ambientSource);
    ambient.loop = true;
    ambient.volume = .18;
    ambient.muted = muted;
    ambientRef.current = ambient;

    window.setTimeout(() => {
      void ambient.play().catch(() => undefined);
      setPhase("owl-letter");
    }, 780);
  }

  async function revealJoke() {
    const content = await fetch(jokesSource)
      .then((response) => response.text())
      .catch(() => "");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    setJoke(
      lines.length
        ? lines[Math.floor(Math.random() * lines.length)]
        : "A little magic is waiting here.",
    );
    window.setTimeout(() => setJoke(null), 3300);
  }

  function finishWithNox() {
    const ambient = ambientRef.current;
    if (ambient) {
      const fade = window.setInterval(() => {
        ambient.volume = Math.max(0, ambient.volume - .03);
        if (ambient.volume === 0) {
          window.clearInterval(fade);
          ambient.pause();
        }
      }, 60);
    }
    setNoxCompleted(true);
    window.setTimeout(() => setPhase("nox"), 900);
  }

  function setImportantAudio(active: boolean) {
    if (ambientRef.current) ambientRef.current.volume = active ? .055 : .18;
  }

  return (
    <main
      className={`experience experience--${phase}`}
    >
      <div className="experience__grain" />
      <div className="experience__light" />
      <div className="experience__vignette" />

      {phase === "dark" && (
        <button className="lumos" type="button" onClick={illuminate}>
          <span>✦</span> Lumos <span>✦</span>
        </button>
      )}

      {phase !== "dark" && phase !== "nox" && (
        <>
          <div className="atmosphere">
            {candles.map((candle, index) => (
              <i
                aria-hidden="true"
                key={index}
                className="candle"
                style={candle}
              />
            ))}
            {petals.map((petal, index) => (
              <button
                aria-label={
                  petal.gold ? "Reveal a hidden thought" : "Drifting rose petal"
                }
                className={`petal ${petal.gold ? "petal--gold" : ""}`}
                key={index}
                onClick={petal.gold ? revealJoke : undefined}
                style={petal}
                tabIndex={petal.gold ? 0 : -1}
                type="button"
              />
            ))}
          </div>

          {phase === "owl-letter" && (
            <OwlLetterSequence
              onComplete={() => {
                setLetterRead(true);
                setPhase("gallery");
              }}
            />
          )}

          {phase === "gallery" && (
            <GryffindorGallery
              images={galleryImages}
              onContinue={() => setPhase("ollivander")}
              onPortraitCollected={() => setPortraitCollected(true)}
            />
          )}

          {phase === "ollivander" && (
            <PhaseThree
              muted={muted}
              onCakeScene={() => setPhase("cake")}
              onMonologueActive={setImportantAudio}
              onToothlessCollected={() => setToothlessCollected(true)}
              onWandCollected={() => setWandCollected(true)}
            />
          )}

          {phase === "cake" && (
            <PhaseFour
              collected={{
                letter: letterRead,
                portrait: portraitCollected,
                wand: wandCollected,
                toothless: toothlessCollected,
                cake: true,
              }}
              initialUnlocked={giftBoxUnlocked}
              onGiftUnlock={() => setGiftBoxUnlocked(true)}
              onMapScene={() => setPhase("map")}
            />
          )}

          {phase === "map" && <PhaseFive onNox={finishWithNox} />}

          {joke && <p className="secret-thought">{joke}</p>}

          <div className="utility-bar">
            <button
              aria-label={muted ? "Turn sound on" : "Mute all sound"}
              className="sound-toggle"
              onClick={() => setMuted((value) => !value)}
              type="button"
            >
              {muted ? "◌" : "◖"}
              <span>{muted ? "Sound asleep" : "Ambient sound"}</span>
            </button>
            <button
              className="gift-box gift-box--locked"
              disabled={!giftBoxUnlocked}
              onClick={() => setPhase("cake")}
              type="button"
            >
              <span aria-hidden="true">▣</span> Gift Box{" "}
              <small>{giftBoxUnlocked ? "unlocked" : "locked"}</small>
            </button>
          </div>
        </>
      )}

      {phase === "nox" && (
        <section className="nox-ending">
          <p>{noxCompleted ? "The story sleeps in the dark." : ""}</p>
          {giftBoxUnlocked && (
            <button onClick={() => setPhase("cake")} type="button">
              Open the Gift Box
            </button>
          )}
        </section>
      )}
    </main>
  );
}