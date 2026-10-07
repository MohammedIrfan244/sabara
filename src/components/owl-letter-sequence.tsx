"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import owlImage from "../assets/images/owl.png";
import parchmentEnvelope from "../assets/images/parchment.jpg";
import waxSealImage from "../assets/images/wax-seal.png";

const letterSource = new URL("../assets/text/letter.txt", import.meta.url).href;

type LetterStage = "owl" | "sealed" | "envelope" | "letter" | "confirm";
type OwlLetterSequenceProps = { onComplete: () => void };

function paragraphClass(text: string) {
  const start = text.trimStart().toLowerCase();
  if (start.startsWith("to:")) return "letter-to";
  if (start.startsWith("dear")) return "letter-dear";
  return undefined;
}

export function OwlLetterSequence({ onComplete }: OwlLetterSequenceProps) {
  const [stage, setStage] = useState<LetterStage>("owl");
  const [leaving, setLeaving] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [letter, setLetter] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    void fetch(letterSource)
      .then((response) => response.text())
      .then((content) =>
        setLetter(content.split(/\r?\n\s*\r?\n/).filter(Boolean)),
      )
      .catch(() => undefined);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function advance(next: LetterStage) {
    setLeaving(true);
    timerRef.current = window.setTimeout(() => {
      setStage(next);
      setLeaving(false);
    }, 480);
  }

  function pressSeal() {
    if (pressing) return;
    setPressing(true);
    timerRef.current = window.setTimeout(() => {
      setLeaving(true);
      timerRef.current = window.setTimeout(onComplete, 480);
    }, 1200);
  }

  return (
    <section className="owl-letter" aria-live="polite">
      <div
        className={`owl-letter__scene owl-letter__scene--${stage} ${leaving ? "is-leaving" : ""}`}
        key={stage}
      >
        {stage === "owl" && (
          <button
            aria-label="Read the letter carried by the owl"
            className="owl-figure"
            onClick={() => advance("sealed")}
            type="button"
          >
            <span className="owl-figure__moon" aria-hidden="true" />
            <Image alt="An owl carrying a letter" priority src={owlImage} />
            <small>Tap to read</small>
          </button>
        )}
        {stage === "sealed" && (
          <div className="envelope-stage">
            <p className="scene-kicker">A letter has found you.</p>
            <div className="envelope-art">
              <Image
                alt="A sealed parchment envelope"
                priority
                src={parchmentEnvelope}
              />
              <button
                aria-label="Break the wax seal"
                className="envelope-art__seal"
                onClick={() => advance("envelope")}
                type="button"
              >
                <Image alt="Wax seal" src={waxSealImage} />
              </button>
            </div>
            <p className="envelope-stage__hint">Break the seal</p>
          </div>
        )}
        {stage === "envelope" && (
          <div className="envelope-stage">
            <p className="scene-kicker">The seal has yielded.</p>
            <button
              aria-label="Open your letter"
              className="envelope-art envelope-art--open"
              onClick={() => advance("letter")}
              type="button"
            >
              <Image
                alt="An opened parchment envelope"
                priority
                src={parchmentEnvelope}
              />
              <span>Tap the envelope to read</span>
            </button>
          </div>
        )}
        {stage === "letter" && (
          <div className="letter-scene owl-letter__letter">
            <article className="hogwarts-letter">
              <svg
                className="hogwarts-letter__crest"
                viewBox="0 0 120 140"
                aria-hidden="true"
              >
                <path
                  className="hogwarts-letter__banner"
                  d="M8 22 Q60 2 112 22 L108 40 Q60 22 12 40 Z"
                />
                <text
                  className="hogwarts-letter__banner-text"
                  x="60"
                  y="27"
                  textAnchor="middle"
                >
                  HOGWARTS
                </text>

                <path
                  className="hogwarts-letter__shield"
                  d="M24 50h72v40c0 22-16 38-36 46-20-8-36-24-36-46z"
                />

                <text
                  className="hogwarts-letter__h"
                  x="60"
                  y="100"
                  textAnchor="middle"
                >
                  H
                </text>
              </svg>

              <header className="hogwarts-letter__header">
                <h1>Hogwarts School</h1>
                <h2>of Witchcraft and Wizardry</h2>
              </header>

              <div className="hogwarts-letter__rule" />

              <div className="hogwarts-letter__body">
                {letter.map((paragraph, index) => (
                  <p className={paragraphClass(paragraph)} key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="hogwarts-letter__signoff">
                <span>Yours sincerely,</span>
                <strong>Minerva McGonagall</strong>
              </div>

              <footer className="hogwarts-letter__footer">
                <strong>Hogwarts School of Witchcraft &amp; Wizardry</strong>
                <span>
                  Headmaster: Albus Dumbledore, D.Wiz, X.J.(sorc.), S.of Mag.Q.
                </span>
              </footer>
            </article>

            <button
              className="story-button"
              onClick={() => advance("confirm")}
              type="button"
            >
              I have read the letter
            </button>
          </div>
        )}
        {stage === "confirm" && (
          <div className="confirm-scene owl-letter__confirm">
            <p className="scene-kicker">The parchment remembers.</p>
            <button
              className={`signing-seal ${pressing ? "signing-seal--pressed" : ""}`}
              onClick={pressSeal}
              type="button"
            >
              <span>✦</span>
              {pressing ? "Sealed" : "Press your seal"}
              <small>
                {pressing
                  ? "Your name is written in wax"
                  : "The letter is safely kept"}
              </small>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
