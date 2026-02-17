"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { giftItems } from "../lib/gifts";

export default function HomePage() {
  const [selectionById, setSelectionById] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSelections() {
      try {
        const response = await fetch("/api/selections", { cache: "no-store" });
        const data = await response.json();
        setSelectionById(data.selectionById ?? {});
      } catch {
        setSelectionById({});
      } finally {
        setIsLoading(false);
      }
    }

    loadSelections();
  }, []);

  const modalText = useMemo(() => {
    if (!pendingAction) return "";

    if (pendingAction.action === "increment") {
      return `Deseja adicionar 1 unidade de "${pendingAction.itemName}" à lista de presentes selecionados?`;
    }

    return `Deseja remover 1 unidade de "${pendingAction.itemName}" da lista de presentes selecionados?`;
  }, [pendingAction]);

  const handleAskConfirmation = (item, action) => {
    setPendingAction({
      itemId: item.id,
      itemName: item.name,
      action,
    });
  };

  const handleConfirm = async () => {
    if (!pendingAction || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/selections", {
        method: pendingAction.action === "increment" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: pendingAction.itemId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Erro ao atualizar seleção.");
      }

      setSelectionById(data.selectionById ?? {});
      setPendingAction(null);
    } catch (error) {
      alert(error.message || "Não foi possível concluir a ação.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="wallpaper fixed inset-0 -z-10" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-slate-300/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chá de bebê</p>
            <h1 className="title-font text-2xl leading-none text-slate-700 sm:text-3xl">Felipe e Sara</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#presentes"
              className="rounded-full border border-slate-400/60 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Ver presentes
            </a>
            <a
              href="/selecionados"
              className="rounded-full border border-slate-400/60 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-200"
            >
              Itens selecionados
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6">
        <section className="rounded-3xl border border-white/90 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="title-font text-3xl text-slate-700 sm:text-4xl">Sejam bem-vindos ao nosso chá de bebê</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
            Ficamos muito felizes em compartilhar esse momento com vocês. Nesta página,
            colocamos uma lista com sugestões de presentes para os gêmeos, com links de
            loja quando aplicável.
          </p>
        </section>

        <section id="presentes" className="mt-8">
          <h3 className="title-font mb-4 text-2xl text-slate-700 sm:text-3xl">Sugestões de presentes</h3>

          {isLoading ? (
            <p className="rounded-2xl border border-slate-300 bg-white/80 p-4 text-slate-600">Carregando status dos itens...</p>
          ) : (
            <div className="space-y-4">
              {giftItems.map((item) => {
                const selection = selectionById[item.id] ?? {
                  quantity: 0,
                  maxQuantity: item.maxQuantity,
                  selectionType: item.selectionType,
                  isAtLimit: false,
                };

                const quantity = selection.quantity ?? 0;
                const canIncrement = !selection.isAtLimit;
                const canDecrement = quantity > 0;

                return (
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
                        {item.selectionType === "limited" && typeof item.maxQuantity === "number"
                          ? `Selecionados até agora: ${quantity} de ${item.maxQuantity}`
                          : `Selecionados até agora: ${quantity}`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <a
                        href={item.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-400/70 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver na loja
                      </a>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAskConfirmation(item, "increment")}
                          disabled={!canIncrement}
                          className="inline-flex items-center justify-center rounded-full border border-slate-500/70 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reservar 1 unidade
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAskConfirmation(item, "decrement")}
                          disabled={!canDecrement}
                          className="inline-flex items-center justify-center rounded-full border border-slate-500/70 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remover 1 unidade
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar confirmação"
            className="absolute inset-0 bg-slate-900/35"
            onClick={() => (isSaving ? null : setPendingAction(null))}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-500/60 bg-white p-5 shadow-lg">
            <h4 className="title-font text-2xl text-slate-700">Confirmar ação</h4>
            <p className="mt-2 text-sm text-slate-600">{modalText}</p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isSaving}
                className="rounded-full border border-slate-400/70 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="rounded-full border border-slate-700 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
