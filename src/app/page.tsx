"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import placeholderImage from "../assets/images/example.png";
import placeholderTexture from "../assets/images/example.jpg";
import { PhaseThree } from "../components/phase-three";
import { PhaseFour } from "../components/phase-four";
import { PhaseFive } from "../components/phase-five";

const audioSource = new URL("../assets/audio/example.mp3", import.meta.url).href;
const letterSource = new URL("../assets/text/example.txt", import.meta.url).href;
type MagicPhase = "dark" | "awakening" | "owl" | "seal" | "envelope" | "letter" | "confirm" | "gallery" | "ollivander" | "cake" | "map" | "nox";
const petals = Array.from({ length: 17 }, (_, index) => ({ animationDelay: `${(index * .61) % 6}s`, left: `${4 + ((index * 37) % 92)}%`, animationDuration: `${8 + (index % 5) * 1.7}s`, gold: index === 3 || index === 11 || index === 15 }));
const candles = Array.from({ length: 6 }, (_, index) => ({ animationDelay: `${index * 1.17}s`, left: `${9 + index * 16}%`, top: `${10 + ((index * 23) % 36)}%` }));

export default function Home() {
  const [phase, setPhase] = useState<MagicPhase>("dark");
  const [muted, setMuted] = useState(false);
  const [joke, setJoke] = useState<string | null>(null);
  const [letter, setLetter] = useState<string[]>([]);
  const [letterRead, setLetterRead] = useState(false);
  const [portraitCollected, setPortraitCollected] = useState(false);
  const [wandCollected, setWandCollected] = useState(false);
  const [toothlessCollected, setToothlessCollected] = useState(false);
  const [noxCompleted, setNoxCompleted] = useState(false);
  const [giftBoxUnlocked, setGiftBoxUnlocked] = useState(false);
  const [artworkOpen, setArtworkOpen] = useState<number | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { const ambient = new Audio(audioSource); ambient.loop = true; ambient.volume = .18; ambientRef.current = ambient; return () => { ambient.pause(); ambientRef.current = null; }; }, []);
  useEffect(() => { if (ambientRef.current) ambientRef.current.muted = muted; }, [muted]);
  function illuminate() { if (phase !== "dark") return; setPhase("awakening"); const spell = new Audio(audioSource); spell.muted = muted; spell.volume = .62; void spell.play().catch(() => undefined); window.setTimeout(() => { setPhase("owl"); void ambientRef.current?.play().catch(() => undefined); }, 780); }
  function revealPlaceholderThought() { setJoke("A little placeholder magic is waiting here."); window.setTimeout(() => setJoke(null), 3300); }
  async function openLetter() { const response = await fetch(letterSource); const content = await response.text(); setLetter(content.split(/\r?\n\s*\r?\n/).filter(Boolean)); setPhase("letter"); }
  function finishWithNox() { const ambient = ambientRef.current; if (ambient) { const fade = window.setInterval(() => { ambient.volume = Math.max(0, ambient.volume - .03); if (ambient.volume === 0) { window.clearInterval(fade); ambient.pause(); } }, 60); } setNoxCompleted(true); window.setTimeout(() => setPhase("nox"), 900); }
  return <main className={`experience experience--${phase}`} style={{ "--parchment-texture": `url(${placeholderTexture.src})` } as React.CSSProperties}>
    <div className="experience__grain" /><div className="experience__light" /><div className="experience__vignette" />
    {phase === "dark" && <button className="lumos" type="button" onClick={illuminate}><span>✦</span> Lumos <span>✦</span></button>}
    {phase !== "dark" && phase !== "nox" && <><div className="atmosphere">{candles.map((candle, index) => <i aria-hidden="true" key={index} className="candle" style={candle} />)}{petals.map((petal, index) => <button aria-label={petal.gold ? "Reveal a hidden thought" : "Drifting rose petal"} className={`petal ${petal.gold ? "petal--gold" : ""}`} key={index} onClick={petal.gold ? revealPlaceholderThought : undefined} style={petal} tabIndex={petal.gold ? 0 : -1} type="button" />)}</div>
      {phase === "owl" && <button className="owl-post" onClick={() => setPhase("seal")} type="button"><Image alt="A mysterious owl delivering an envelope" src={placeholderImage} /><span>Owl Post</span><small>Tap the letter</small></button>}
      {phase === "seal" && <section className="envelope-scene"><p className="scene-kicker">An invitation has arrived</p><button className="wax-seal" onClick={() => setPhase("envelope")} type="button">S<span>break the seal</span></button><div className="envelope-envelope"><span>L</span></div></section>}
      {phase === "envelope" && <section className="envelope-scene"><p className="scene-kicker">The seal has given way</p><button aria-label="Open the Hogwarts letter" className="open-envelope" onClick={openLetter} type="button"><span>For Lini</span><small>Tap to open</small></button></section>}
      {phase === "letter" && <section className="letter-scene"><article className="letter"><p className="letter-mark">✦ Hogwarts ✦</p>{letter.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p className="letter-signoff">With warmest wishes,</p></article><button className="story-button" onClick={() => { setLetterRead(true); setPhase("confirm"); }} type="button">I have read the letter</button></section>}
      {phase === "confirm" && <section className="confirm-scene"><p className="scene-kicker">The parchment remembers</p><button className="signing-seal" onClick={() => setPhase("gallery")} type="button"><span>✦</span> Press your seal <small>The letter is safely kept</small></button></section>}
      {phase === "gallery" && <section className="gallery-scene"><p className="scene-kicker">A quiet Gryffindor gallery</p><div className="gallery-wall">{[0, 1, 2, 3].map((frame) => <button className={`art-frame art-frame--${frame} ${frame === 0 ? "art-frame--portrait" : ""}`} key={frame} onClick={() => { if (frame === 0) setPortraitCollected(true); setArtworkOpen(frame); }} type="button"><Image alt={frame === 0 ? "Lini portrait" : "A treasured photograph"} src={frame === 0 ? placeholderImage : placeholderTexture} /></button>)}</div>{portraitCollected && <><p className="collection-note">Lini&apos;s portrait has joined the Gift Box.</p><button className="story-button" onClick={() => setPhase("ollivander")} type="button">Follow the wandlight</button></>}</section>}
      {phase === "ollivander" && <PhaseThree onCakeScene={() => setPhase("cake")} onToothlessCollected={() => setToothlessCollected(true)} onWandCollected={() => setWandCollected(true)} />}
      {phase === "cake" && <PhaseFour collected={{ letter: letterRead, portrait: portraitCollected, wand: wandCollected, toothless: toothlessCollected, cake: true }} initialUnlocked={giftBoxUnlocked} onGiftUnlock={() => setGiftBoxUnlocked(true)} onMapScene={() => setPhase("map")} />}
      {phase === "map" && <PhaseFive onNox={finishWithNox} />}
      {artworkOpen !== null && <div className="artwork-modal" role="dialog" aria-label="Artwork view"><button aria-label="Close artwork" className="modal-close" onClick={() => setArtworkOpen(null)} type="button">×</button><Image alt={artworkOpen === 0 ? "Lini portrait enlarged" : "Photograph enlarged"} src={artworkOpen === 0 ? placeholderImage : placeholderTexture} /></div>}
      {joke && <p className="secret-thought">{joke}</p>}<div className="utility-bar"><button aria-label={muted ? "Turn sound on" : "Mute all sound"} className="sound-toggle" onClick={() => setMuted(value => !value)} type="button">{muted ? "◌" : "◖"}<span>{muted ? "Sound asleep" : "Ambient sound"}</span></button><button className="gift-box gift-box--locked" disabled={!giftBoxUnlocked} onClick={() => setPhase("cake")} type="button"><span aria-hidden="true">▣</span> Gift Box <small>{giftBoxUnlocked ? "unlocked" : "locked"}</small></button></div></>}
    {phase === "nox" && <section className="nox-ending"><p>{noxCompleted ? "The story sleeps in the dark." : ""}</p>{giftBoxUnlocked && <button onClick={() => setPhase("cake")} type="button">Open the Gift Box</button>}</section>}
  </main>;
}
