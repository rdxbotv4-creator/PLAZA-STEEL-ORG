import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { bill, useBill } from "@/lib/estimate-store";
import { getPublicCatalogue } from "@/lib/stock.functions";
import { SHOP_WHATSAPP_DIGITS, formatPKR, waLink } from "@/lib/stock-types";

const catalogueQuery = queryOptions({
  queryKey: ["catalogue"],
  queryFn: () => getPublicCatalogue(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/estimate")({
  head: () => ({
    meta: [
      { title: "Estimate Bill Maker — Plaza Steel & Crockery" },
      {
        name: "description",
        content:
          "Build an estimate bill from the Plaza Steel & Crockery rate list, adjust prices, apply discount and send or print it.",
      },
      { property: "og:title", content: "Estimate Bill Maker — Plaza Steel & Crockery" },
      {
        property: "og:description",
        content: "Add items, edit prices, apply a discount and print or WhatsApp the estimate.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogueQuery),
  component: EstimatePage,
});

function EstimatePage() {
  const { data } = useSuspenseQuery(catalogueQuery);
  const lines = useBill();
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [discountMode, setDiscountMode] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("");

  const suggestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) return [];
    return data.items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [data.items, search]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const discountNumber = Number(discountValue.replace(/[^0-9.]/g, "")) || 0;
  const discount =
    discountMode === "percent"
      ? Math.min(subtotal, (subtotal * Math.min(discountNumber, 100)) / 100)
      : Math.min(subtotal, discountNumber);
  const total = subtotal - discount;

  const billText = [
    "*PLAZA STEEL & CROCKERY — ESTIMATE*",
    customer ? `Customer: ${customer}` : null,
    "",
    ...lines.map(
      (line, index) =>
        `${index + 1}. ${line.name}${line.code ? ` (${line.code})` : ""} — ${line.qty} x Rs ${formatPKR(
          line.unitPrice,
        )} = Rs ${formatPKR(line.unitPrice * line.qty)}`,
    ),
    "",
    `Subtotal: Rs ${formatPKR(subtotal)}`,
    discount > 0
      ? `Discount${discountMode === "percent" ? ` (${discountNumber}%)` : ""}: -Rs ${formatPKR(discount)}`
      : null,
    `*Total: Rs ${formatPKR(total)}*`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <section className="surface-panel no-print p-5">
        <h1 className="font-display text-2xl tracking-wide sm:text-3xl">
          <span className="text-brand-gradient">ESTIMATE</span>{" "}
          <span className="text-chrome">BILL MAKER</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add items, change quantity or price, apply a discount, then print or send on WhatsApp.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="relative block">
            <span className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Add item
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item or code"
              maxLength={60}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
            {suggestions.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-popover shadow-xl">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        bill.add(item);
                        setSearch("");
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
                    >
                      <span>
                        {item.name}
                        {item.code ? (
                          <span className="ml-1 text-muted-foreground">({item.code})</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-semibold text-gold">
                        Rs {formatPKR(item.rate)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Customer name (optional)
            </span>
            <input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              maxLength={60}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
        </div>
      </section>

      <section className="surface-panel mt-6 p-5">
        <div className="mb-4 hidden items-center gap-3 print:flex">
          <img src="/logo-plaza.png" alt="" className="h-12 w-12 object-contain" />
          <p className="font-display text-xl">PLAZA STEEL &amp; CROCKERY — ESTIMATE</p>
        </div>

        {lines.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No item added yet. Search above, or tap “+ Bill” on any item in the rate list.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 w-20">Qty</th>
                  <th className="pb-2 w-28">Price</th>
                  <th className="pb-2 w-28 text-right">Amount</th>
                  <th className="no-print pb-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t border-border/60">
                    <td className="py-2 pr-2">
                      {line.name}
                      {line.code ? (
                        <span className="ml-1 text-xs text-muted-foreground">({line.code})</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={line.qty}
                        onChange={(event) =>
                          bill.update(line.id, {
                            qty: Math.max(1, Number(event.target.value.replace(/[^0-9]/g, "")) || 1),
                          })
                        }
                        inputMode="numeric"
                        className="w-16 rounded-md border border-border bg-input px-2 py-1 text-sm outline-none focus:border-ring"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={line.unitPrice}
                        onChange={(event) =>
                          bill.update(line.id, {
                            unitPrice: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0,
                          })
                        }
                        inputMode="decimal"
                        className="w-24 rounded-md border border-border bg-input px-2 py-1 text-sm outline-none focus:border-ring"
                      />
                    </td>
                    <td className="py-2 text-right font-semibold">
                      Rs {formatPKR(line.unitPrice * line.qty)}
                    </td>
                    <td className="no-print py-2 pl-2 text-right">
                      <button
                        onClick={() => bill.remove(line.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lines.length > 0 ? (
          <>
            <div className="chrome-divider my-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="no-print">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
                  Discount
                </span>
                <div className="flex gap-2">
                  <select
                    value={discountMode}
                    onChange={(event) =>
                      setDiscountMode(event.target.value === "amount" ? "amount" : "percent")
                    }
                    className="rounded-lg border border-border bg-input px-2 py-2 text-sm outline-none focus:border-ring"
                  >
                    <option value="percent">Percent %</option>
                    <option value="amount">Amount Rs</option>
                  </select>
                  <input
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value.replace(/[^0-9.]/g, ""))}
                    inputMode="decimal"
                    placeholder={discountMode === "percent" ? "10" : "500"}
                    className="w-28 rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <dl className="space-y-1 text-sm sm:text-right">
                <div className="flex justify-between gap-4 sm:justify-end">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="w-32 sm:text-right">Rs {formatPKR(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:justify-end">
                  <dt className="text-muted-foreground">
                    Discount{discountMode === "percent" && discountNumber ? ` (${discountNumber}%)` : ""}
                  </dt>
                  <dd className="w-32 text-destructive sm:text-right">- Rs {formatPKR(discount)}</dd>
                </div>
                <div className="flex justify-between gap-4 pt-1 font-display text-xl sm:justify-end">
                  <dt>Total</dt>
                  <dd className="w-32 text-brand-gradient sm:text-right">Rs {formatPKR(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="no-print mt-5 flex flex-wrap gap-2">
              <a
                href={waLink(SHOP_WHATSAPP_DIGITS, billText)}
                target="_blank"
                rel="noreferrer"
                className="btn-hero rounded-full px-5 py-2.5 font-display text-sm tracking-wide"
              >
                Send on WhatsApp
              </a>
              <button
                onClick={() => window.print()}
                className="rounded-full border border-border px-5 py-2.5 font-display text-sm tracking-wide text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => bill.clear()}
                className="rounded-full border border-border px-5 py-2.5 font-display text-sm tracking-wide text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                Clear bill
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
