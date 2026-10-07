"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ollivanderImage from "../assets/images/ollivander.png";
import toothlessImage from "../assets/images/toothless.png";
import wandImage from "../assets/images/wand.png";

const dialogueSources = [
  new URL("../assets/text/ollivander-dialogue1.txt", import.meta.url).href,
  new URL("../assets/text/ollivander-dialogue2.txt", import.meta.url).href,
  new URL("../assets/text/ollivander-dialogue3.txt", import.meta.url).href,
];
const monologueSource = new URL(
  "../assets/text/ollivander-monologue.txt",
  import.meta.url,
).href;
const monologueAudioSource = new URL(
  "../assets/audio/ollivander-monologue.mp3",
  import.meta.url,
).href;

type PhaseThreeProps = {
  onWandCollected: () => void;
  onToothlessCollected: () => void;
  onCakeScene: () => void;
  onMonologueActive: (active: boolean) => void;
  muted: boolean;
};

export function PhaseThree({
  onWandCollected,
  onToothlessCollected,
  onCakeScene,
  onMonologueActive,
  muted,
}: PhaseThreeProps) {
  const [talking, setTalking] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [monologue, setMonologue] = useState(false);
  const [wandRevealed, setWandRevealed] = useState(false);
  const [wandCollected, setWandCollected] = useState(false);
  const [familiar, setFamiliar] = useState(false);
  const [toothlessCollected, setToothlessCollected] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [dialogue, setDialogue] = useState([
    "Curious, very curious…",
    "It is not the wand that chooses lightly.",
    "A little fire, a little loyalty, and an abundance of wonder.",
  ]);
  const [words, setWords] = useState("The wand has been waiting for you.");
  const monologueAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void Promise.all(
      dialogueSources.map((source) =>
        fetch(source).then((response) => response.text()),
      ),
    )
      .then((texts) =>
        setDialogue((current) =>
          texts.map((text, index) => text.trim() || current[index]),
        ),
      )
      .catch(() => undefined);
    void fetch(monologueSource)
      .then((response) => response.text())
      .then((text) => setWords((current) => text.trim() || current))
      .catch(() => undefined);
  }, []);

  useEffect(() => () => monologueAudio.current?.pause(), []);

  function beginMonologue() {
    setMonologue(true);
    onMonologueActive(true);
    const audio = new Audio(monologueAudioSource);
    audio.muted = muted;
    monologueAudio.current = audio;
    const revealWand = () => {
      setMonologue(false);
      setWandRevealed(true);
      onMonologueActive(false);
    };
    audio.addEventListener("ended", revealWand, { once: true });
    void audio.play().catch(() => {
      window.setTimeout(revealWand, Math.max(3600, words.length * 42));
    });
  }

  function chooseWand() {
    if (!wandCollected) {
      setWandCollected(true);
      onWandCollected();
    }
  }

  function greetFamiliar() {
    setJumping(true);
    if (!toothlessCollected) {
      setToothlessCollected(true);
      onToothlessCollected();
    }
    window.setTimeout(() => setJumping(false), 800);
  }

  if (familiar) {
    return (
      <section className="phase-three phase-three--familiar">
        <p className="scene-kicker">A small, faithful presence in the shadows</p>
        <button
          aria-label="Greet Toothless"
          className={`toothless ${jumping ? "toothless--jump" : ""}`}
          onClick={greetFamiliar}
          type="button"
        >
          <Image alt="Toothless, your familiar" src={toothlessImage} />
          <i aria-hidden="true" />
        </button>
        <p className="familiar-label">Your Familiar</p>
        <p className="familiar-instruction">Tap him gently.</p>
        {toothlessCollected && (
          <>
            <p className="collection-note">
              Your familiar has joined the Gift Box.
            </p>
            <button
              className="story-button"
              onClick={onCakeScene}
              type="button"
            >
              Follow the candlelight
            </button>
          </>
        )}
      </section>
    );
  }

  if (talking) {
    return (
      <section className="ollivander-dialogue">
        <div className="dialogue-border" />
        {!wandRevealed && (
          <div className="clouds" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        {wandRevealed && (
          <button
            aria-label="Flick your new wand"
            className="wand wand--revealed"
            onClick={chooseWand}
            type="button"
          >
            <Image alt="Your new wand" src={wandImage} />
            <span>{wandCollected ? "Flick again" : "Tap to choose it"}</span>
          </button>
        )}
        {monologue ? (
          <article className="monologue">
            <p>{words}</p>
            <small>The wandmaker&apos;s voice fills the room…</small>
          </article>
        ) : (
          !wandRevealed && (
            <article className="dialogue-box">
              <div className="ollivander-avatar">
                <Image alt="Mr Ollivander" src={ollivanderImage} />
              </div>
              <p>{dialogue[dialogueStep]}</p>
              <button
                onClick={() =>
                  dialogueStep === 2
                    ? beginMonologue()
                    : setDialogueStep((step) => step + 1)
                }
                type="button"
              >
                {dialogueStep === 2 ? "Listen" : "Next"}
              </button>
            </article>
          )
        )}
        {wandRevealed && (
          <button
            className="story-button phase-three-next"
            onClick={() => setFamiliar(true)}
            type="button"
          >
            Meet your familiar
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="phase-three">
      <button
        aria-label="Make the Ollivanders sign sway"
        className="ollivander-sign"
        onClick={(event) =>
          event.currentTarget.classList.toggle("ollivander-sign--swing")
        }
        type="button"
      >
        Ollivanders <small>Makers of Fine Wands</small>
      </button>
      <p className="scene-kicker">A narrow shop, filled with old magic</p>
      <button
        className="talk-button"
        onClick={() => setTalking(true)}
        type="button"
      >
        Talk with Mr. Ollivander
      </button>
    </section>
  );
}