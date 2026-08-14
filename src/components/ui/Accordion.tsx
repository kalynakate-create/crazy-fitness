"use client";

/**
 * ACCORDION — Stage 6 / Stage 14 / Stage 22.
 *
 * One panel open at a time, identical on mobile and desktop. It is a native
 * mobile pattern and the traffic is 80-90% mobile, so the desktop follows the
 * phone here rather than the other way round.
 *
 * A real <button> with aria-expanded and a linked region, never a div with an
 * onClick, which Stage 22 rules out by name. The whole row is the target, not
 * just the arrow.
 */

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  /** Rendered inside the trigger button. */
  summary: ReactNode;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Fires when a panel opens, for faq_item_open. Stage 23. */
  onOpen?: (id: string) => void;
  className?: string;
};

export function Accordion({ items, onOpen, className = "" }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className={`border-t border-steel ${className}`}>
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id} className="border-b border-steel">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                  const next = open ? null : item.id;
                  setOpenId(next);
                  if (next) onOpen?.(item.id);
                }}
                className="group flex w-full items-center gap-6 py-7 text-left transition-colors hover:bg-graphite/50 md:px-2"
              >
                <span className="flex-1">{item.summary}</span>
                <span
                  aria-hidden="true"
                  className="relative size-4 shrink-0 text-orange transition-transform duration-300 group-hover:translate-x-1"
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ${
                      open ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="pb-8 md:px-2"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
