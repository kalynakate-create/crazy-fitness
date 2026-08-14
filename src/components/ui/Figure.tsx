"use client";

/**
 * IMAGE WITH REAL STATES — Stage 20.
 *
 * A photo-led site needs an answer for "the photo is not here". There are three
 * distinct cases and they are not the same thing:
 *
 *   missing  the shoot has not happened yet. Renders a composed plate carrying
 *            the scale motif, so an unfinished site still looks deliberate
 *            instead of broken. This is the state the whole site is in today.
 *   loading  a real file is on its way. Skeleton in graphite at the exact
 *            aspect ratio, so nothing reflows when it lands.
 *   error    the file failed. A neutral plate, never the browser's torn-image
 *            icon, which reads as neglect.
 */

import Image from "next/image";
import { useState } from "react";
import { asset } from "@/lib/asset";

type FigureProps = {
  src: string | null;
  alt: string;
  /**
   * CSS aspect-ratio value, e.g. "3 / 4", reserved in every state.
   * "fill" instead stretches to the positioned parent, for full-bleed use.
   */
  ratio?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Shown on the placeholder plate so the gap is legible in review. */
  placeholderNote?: string;
};

function Plate({
  ratio,
  note,
  className,
}: {
  ratio: string;
  note?: string;
  className?: string;
}) {
  const fill = ratio === "fill";
  return (
    <div
      className={`overflow-hidden bg-graphite ${
        fill ? "absolute inset-0" : "relative"
      } ${className ?? ""}`}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      <div className="absolute inset-x-6 bottom-6 top-auto">
        <div className="scale-rule opacity-40" />
      </div>
      {note && (
        <span className="t-eyebrow absolute left-6 top-6 max-w-[80%] text-muted">
          {note}
        </span>
      )}
    </div>
  );
}

export function Figure({
  src,
  alt,
  ratio = "3 / 4",
  className = "",
  sizes = "100vw",
  priority = false,
  placeholderNote,
}: FigureProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Plate
        ratio={ratio}
        className={className}
        note={failed ? "Зображення недоступне" : placeholderNote}
      />
    );
  }

  const fill = ratio === "fill";
  return (
    <div
      className={`overflow-hidden bg-graphite ${
        fill ? "absolute inset-0" : "relative"
      } ${className}`}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {/*
        No JS-driven fade-in.

        The obvious version gates opacity on an onLoad handler, and it is a trap:
        a cached image can finish decoding before React attaches the listener, so
        the event never fires and the photo sits at opacity 0 permanently. It
        looks right on the first visit and breaks on the second — verified
        happening here before this was removed.

        The graphite plate behind already covers the loading gap, so the fade was
        buying almost nothing and risking an invisible page. Correctness wins.
      */}
      <Image
        src={asset(src)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </div>
  );
}
