"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE = 'button:not([disabled]), select, a[href], input, [tabindex]:not([tabindex="-1"])';

/** Shared behaviour of the product dialog and the cart drawer: slide-in, Escape, focus trap, focus restore. */
export function useDialog(onClose: () => void, exitMs = 320) {
  const [show, setShow] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    const id = requestAnimationFrame(() => setShow(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prevOverflow;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const id = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => clearTimeout(id);
  }, [show]);

  const close = useCallback(() => {
    setShow(false);
    window.setTimeout(onClose, exitMs);
  }, [onClose, exitMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return { show, close, panelRef, closeRef };
}
