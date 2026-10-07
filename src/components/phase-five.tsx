"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitGiftMessage, type GiftMessageState } from "../app/actions";

const audioSource = new URL("../assets/audio/example.mp3", import.meta.url).href;
const initialState: GiftMessageState = { ok: false, configured: false };
const draftKey = "lini-gift-map-draft";
type PhaseFiveProps = { onNox: () => void };

export function PhaseFive({ onNox }: PhaseFiveProps) {
  const [mapOpen, setMapOpen] = useState(false); const [holding, setHolding] = useState(false); const [draft, setDraft] = useState(() => typeof window === "undefined" ? "" : window.localStorage.getItem(draftKey) ?? ""); const [nox, setNox] = useState(false); const holdTimer = useRef<number | null>(null);
  const [state, action, pending] = useActionState(submitGiftMessage, initialState);
  useEffect(() => { window.localStorage.setItem(draftKey, draft); }, [draft]);
  useEffect(() => () => { if (holdTimer.current) window.clearTimeout(holdTimer.current); }, []);
  function startHold() { setHolding(true); holdTimer.current = window.setTimeout(() => { setMapOpen(true); setHolding(false); }, 1200); }
  function stopHold() { if (holdTimer.current) window.clearTimeout(holdTimer.current); setHolding(false); }
  function endExperience() { if (nox) return; setNox(true); const sound = new Audio(audioSource); void sound.play().catch(() => undefined); window.setTimeout(onNox, 850); }
  if (!mapOpen) return <section className="phase-five map-intro"><div className="folded-map"><span>✦</span><p>The Marauder&apos;s Map</p></div><p className="scene-kicker">A final secret waits on the parchment.</p><button className={`hold-spell ${holding ? "hold-spell--active" : ""}`} onPointerCancel={stopHold} onPointerDown={startHold} onPointerLeave={stopHold} onPointerUp={stopHold} type="button">Touch and hold <small>for the spell to take hold</small></button></section>;
  return <section className={`phase-five map-open ${nox ? "map-open--nox" : ""}`}><div className="map-ink" aria-hidden="true"><i /><i /><i /></div><p className="map-title">I solemnly swear that I am up to no good.</p><div className="footprints" aria-hidden="true">✦ &nbsp; · &nbsp; ✦ &nbsp; · &nbsp; ✦</div><form action={action} className="map-form"><label htmlFor="gift-message">How do you feel about your gift, Lini?</label><textarea id="gift-message" maxLength={1200} name="message" onChange={(event) => setDraft(event.target.value)} placeholder="Leave your thoughts in ink…" value={draft} />{state.error && <p className="form-error">{state.error}</p>}{state.ok ? <p className="form-success">{state.configured ? "Your message has been sealed for its configured destination." : "Your message has been sealed safely for now."}</p> : <button className="ink-submit" disabled={pending} type="submit">{pending ? "Sealing your note…" : "Seal this message"}</button>}</form>{state.ok && <button className="nox-button" onClick={endExperience} type="button">Nox</button>}</section>;
}
