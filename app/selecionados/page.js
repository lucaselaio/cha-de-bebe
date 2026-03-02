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

      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-100/85 backdrop-blur">
        <div className="navbar mx-auto w-full max-w-5xl px-2 sm:px-4">
          <div className="navbar-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chá de bebê</p>
              <h1 className="title-font text-2xl leading-none text-slate-700 sm:text-3xl">Itens selecionados</h1>
            </div>
          </div>
          <div className="navbar-end">
            <Link href="/" className="btn btn-sm rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Voltar para lista
            </Link>
          </div>
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
            <div className="alert border border-base-300 bg-base-100/90 text-base-content">
              <span>Ainda não há itens selecionados.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <article key={item.id} className="card card-side border border-slate-600/70 bg-white/85 shadow-sm backdrop-blur-sm max-sm:flex-col">
                  <figure className="p-4 max-sm:pb-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={220}
                      height={140}
                      className="h-28 w-full rounded-xl border border-slate-300 object-cover sm:h-24 sm:w-36"
                    />
                  </figure>

                  <div className="card-body gap-3 p-4 sm:p-5">
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

                    <div className="card-actions justify-end">
                      <a
                        href={item.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        Ver na loja
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
