import Image from "next/image";
import Link from "next/link";
import { giftItems } from "../../lib/gifts";
import { readSelections } from "../../lib/selections-store";

export const dynamic = "force-dynamic";

export default async function SelecionadosPage() {
  const selections = await readSelections();

  const selectedItems = giftItems
    .map((item) => {
      const quantity = selections[item.id]?.quantity ?? 0;
      if (quantity <= 0) return null;

      return {
        ...item,
        quantity,
        updatedAt: selections[item.id]?.updatedAt ?? null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <>
      <div className="wallpaper fixed inset-0 -z-10" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-slate-300/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chá de bebê</p>
            <h1 className="title-font text-2xl leading-none text-slate-700 sm:text-3xl">Itens selecionados</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-400/60 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Voltar para lista
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6">
        <section className="rounded-3xl border border-white/90 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="title-font text-3xl text-slate-700 sm:text-4xl">Presentes já escolhidos</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
            Esta página mostra as quantidades que já foram marcadas para presentear, ajudando a evitar duplicidade.
          </p>
        </section>

        <section className="mt-8">
          {selectedItems.length === 0 ? (
            <p className="rounded-2xl border border-slate-300 bg-white/80 p-4 text-slate-600">
              Ainda não há itens selecionados.
            </p>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-600/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:p-5"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={220}
                    height={140}
                    className="h-28 w-full rounded-xl border border-slate-300 object-cover sm:h-24 sm:w-36"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="title-font text-xl leading-tight text-slate-700 sm:text-2xl">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Quantidade selecionada: {item.quantity}
                      {item.selectionType === "limited" && typeof item.maxQuantity === "number"
                        ? ` de ${item.maxQuantity}`
                        : ""}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <a
                    href={item.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-slate-400/70 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver na loja
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
