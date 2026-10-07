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
  const [wandRevealed, setWandRevealed] = useState(false);
  const [wandCollected, setWandCollected] = useState(false);
  const [familiar, setFamiliar] = useState(false);
  const [toothlessCollected, setToothlessCollected] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const [dialogue, setDialogue] = useState([
    "Curious, very curious…",
    "It is not the wand that chooses lightly.",
    "A little fire, a little loyalty, and an abundance of wonder.",
  ]);
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
  }, []);

  useEffect(() => {
    if (monologueAudio.current) monologueAudio.current.muted = muted;
  }, [muted]);

  useEffect(
    () => () => {
      monologueAudio.current?.pause();
      onMonologueActive(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // No text: the monologue just plays while the wand appears
  function beginMonologue() {
    setWandRevealed(true);
    onMonologueActive(true);

    const audio = new Audio(monologueAudioSource);
    audio.muted = muted;
    monologueAudio.current = audio;
    audio.addEventListener("ended", () => onMonologueActive(false), {
      once: true,
    });
    void audio.play().catch(() => onMonologueActive(false));
  }

  function stopMonologue() {
    monologueAudio.current?.pause();
    onMonologueActive(false);
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

  function swingSign() {
    setSwinging(true);
    window.setTimeout(() => setSwinging(false), 1200);
  }

  if (familiar) {
    return (
      <section className="phase-three phase-three--familiar">
        <p className="scene-kicker">A small, faithful presence in the shadows</p>

        <div className="familiar-frame">
          <span className="sconce sconce--left" aria-hidden="true">
            <b className="flame" />
          </span>
          <span className="sconce sconce--right" aria-hidden="true">
            <b className="flame" style={{ animationDelay: "-.7s" }} />
          </span>

          <div className="familiar-window">
            <button
              aria-label="Greet Toothless"
              className={`toothless ${jumping ? "toothless--jump" : ""}`}
              onClick={greetFamiliar}
              type="button"
            >
              <Image alt="Toothless, your familiar" src={toothlessImage} />
            </button>
          </div>
        </div>

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
            className="wand wand--revealed h-64"
            onClick={chooseWand}
            type="button"
          >
            <Image alt="Your new wand" src={wandImage} />
          </button>
        )}
        {!wandRevealed && (
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
        )}
        {wandRevealed && (
          <button
            className="story-button phase-three-next"
            onClick={() => {
              stopMonologue();
              setFamiliar(true);
            }}
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
      <div className="sign-rig">
        {/* iron rod with brass knobs on both ends */}
        <div className="sign-rod" aria-hidden="true" />

        <div className={`sign-swing ${swinging ? "sign-swing--swing" : ""}`}>
          <span className="sign-chain sign-chain--left" aria-hidden="true" />
          <span className="sign-chain sign-chain--right" aria-hidden="true" />
          <button
            aria-label="Make the Ollivanders sign sway"
            className="ollivander-sign"
            onClick={swingSign}
            type="button"
          >
            Ollivanders <small>Makers of Fine Wands</small>
          </button>
        </div>
      </div>

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