/**
 * TELEGRAM NOTIFICATION — Stage 17, Phase 0.
 *
 * No bot framework at launch. A new lead is one HTTP call to sendMessage;
 * wrapping that in grammY would be a service to maintain for no gain. The
 * framework arrives in Phase 1, when inline "Взяв у роботу" buttons start to
 * matter (roughly 10+ leads a week).
 */

import type { Lead, Order } from "./types";

const API = "https://api.telegram.org";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function send(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const GOAL_LABEL: Record<Lead["goal"], string> = {
  start: "Почати з нуля",
  plateau: "Зрушити з плато",
  nutrition: "Харчування",
  other: "Інше",
};

const FORMAT_LABEL: Record<Lead["format"], string> = {
  personal: "Персональні",
  group: "Групові",
  online: "Онлайн",
  unsure: "Ще не знаю",
};

export function notifyLead(lead: Lead): Promise<boolean> {
  const lines = [
    "<b>Нова заявка</b>",
    `Ім'я: <b>${escapeHtml(lead.name)}</b>`,
    `Контакт: <b>${escapeHtml(lead.contact)}</b>`,
    `Мета: ${GOAL_LABEL[lead.goal]}`,
    `Формат: ${FORMAT_LABEL[lead.format]}`,
    `Звідки: ${lead.sourceSection}`,
  ];
  if (lead.note) lines.push(`Коментар: ${escapeHtml(lead.note)}`);
  if (lead.utmSource) lines.push(`UTM: ${escapeHtml(lead.utmSource)}`);
  return send(lines.join("\n"));
}

export function notifyOrder(order: Order): Promise<boolean> {
  const lines = [
    "<b>Заявка на програму</b>",
    `Ім'я: <b>${escapeHtml(order.buyerName)}</b>`,
    `Email: <b>${escapeHtml(order.buyerEmail)}</b>`,
    `Контакт: <b>${escapeHtml(order.buyerContact)}</b>`,
    order.amount === null
      ? "Ціна: не вказана на сайті, домовитись у переписці"
      : `Ціна: ${(order.amount / 100).toFixed(2)} ${order.currency}`,
    "Оплата і видача — напряму, вручну",
  ];
  return send(lines.join("\n"));
}
