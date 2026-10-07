"use server";

import nodemailer from "nodemailer";

export type GiftMessageState = { ok: boolean; configured: boolean; error?: string };

const initialState: GiftMessageState = { ok: false, configured: false };

export async function submitGiftMessage(_: GiftMessageState, formData: FormData): Promise<GiftMessageState> {
  const message = formData.get("message");
  if (typeof message !== "string" || message.trim().length < 1) return { ...initialState, error: "Write a little note before sealing it." };
  if (message.length > 1200) return { ...initialState, error: "Please keep the note under 1,200 characters." };

  const user = process.env.GMAIL_SMTP_USER;
  const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD;
  const to = process.env.GIFT_MESSAGE_TO;
  const from = process.env.GIFT_MESSAGE_FROM ?? user;

  if (!user || !appPassword || !to || !from) {
    return { ...initialState, error: "Message delivery has not been configured yet." };
  }

  const safeMessage = message.trim()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br />");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: appPassword },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "A message from Lini's Birthday Gift",
      html: `<main><h1>A note from Lini</h1><p>${safeMessage}</p></main>`,
    });
    return { ok: true, configured: true };
  } catch {
    return { ...initialState, configured: true, error: "The message could not be delivered just yet." };
  }
}
