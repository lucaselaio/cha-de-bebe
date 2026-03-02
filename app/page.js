"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { giftItems } from "../lib/gifts";

export default function HomePage() {
  const [selectionById, setSelectionById] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
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

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3200);
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
      if (pendingAction.action === "increment") {
        showNotice("Obrigada(o)! Sua reserva foi registrada com sucesso.", "success");
      }
      setPendingAction(null);
    } catch (error) {
      showNotice(error.message || "Não foi possível concluir a ação.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="wallpaper fixed inset-0 -z-10" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-100/85 backdrop-blur">
        <div className="navbar mx-auto w-full max-w-5xl px-2 sm:px-4">
          <div className="navbar-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chá de bebê</p>
              <h1 className="title-font text-2xl leading-none text-slate-700 sm:text-3xl">Felipe e Sara</h1>
            </div>
          </div>
          <div className="navbar-end gap-2">
            <a href="#presentes" className="btn btn-sm rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Ver presentes
            </a>
            <a href="/selecionados" className="btn btn-sm rounded-full border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200">
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
            <div className="alert border border-base-300 bg-base-100/90 text-base-content">
              <span>Carregando status dos itens...</span>
            </div>
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
                          {item.selectionType === "limited" && typeof item.maxQuantity === "number"
                            ? `Selecionados até agora: ${quantity} de ${item.maxQuantity}`
                            : `Selecionados até agora: ${quantity}`}
                        </p>
                      </div>

                      <div className="card-actions justify-end gap-2">
                        <a
                          href={item.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          Ver na loja
                        </a>

                        <button
                          type="button"
                          onClick={() => handleAskConfirmation(item, "increment")}
                          disabled={!canIncrement}
                          className="btn btn-sm rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reservar 1 unidade
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAskConfirmation(item, "decrement")}
                          disabled={!canDecrement}
                          className="btn btn-sm rounded-full border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
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
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box border border-slate-300 bg-white/95">
            <h4 className="title-font text-2xl text-slate-700">Confirmar ação</h4>
            <p className="mt-2 text-sm text-slate-600">{modalText}</p>

            <div className="modal-action mt-4">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isSaving}
                className="btn rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="btn rounded-full border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-70"
              >
                {isSaving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar confirmação"
            className="modal-backdrop"
            onClick={() => (isSaving ? null : setPendingAction(null))}
          >
            fechar
          </button>
        </div>
      ) : null}

      {notice ? (
        <div className="toast toast-top toast-end z-[80]">
          <div className={`alert ${notice.type === "error" ? "alert-error" : "alert-success"}`}>
            <span>{notice.message}</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
