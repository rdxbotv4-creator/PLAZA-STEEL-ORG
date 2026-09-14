import { useSyncExternalStore } from "react";

export type BillLine = {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
  qty: number;
};

const KEY = "plaza-estimate-v1";
let lines: BillLine[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) lines = JSON.parse(raw) as BillLine[];
  } catch {
    lines = [];
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): BillLine[] {
  load();
  return lines;
}

const emptySnapshot: BillLine[] = [];

export function useBill(): BillLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}

export const bill = {
  add(item: { id: string; code: string; name: string; rate: number }, qty = 1) {
    load();
    const existing = lines.find((line) => line.id === item.id);
    if (existing) {
      lines = lines.map((line) =>
        line.id === item.id ? { ...line, qty: line.qty + qty } : line,
      );
    } else {
      lines = [
        ...lines,
        { id: item.id, code: item.code, name: item.name, unitPrice: item.rate, qty },
      ];
    }
    emit();
  },
  update(id: string, patch: Partial<Pick<BillLine, "qty" | "unitPrice">>) {
    load();
    lines = lines.map((line) => (line.id === id ? { ...line, ...patch } : line));
    emit();
  },
  remove(id: string) {
    load();
    lines = lines.filter((line) => line.id !== id);
    emit();
  },
  clear() {
    lines = [];
    emit();
  },
};
