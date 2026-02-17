import { NextResponse } from "next/server";
import { giftItems, giftItemsById } from "../../../lib/gifts";
import {
  decrementItemSelection,
  incrementItemSelection,
  readSelections,
} from "../../../lib/selections-store";

export const runtime = "nodejs";

function buildResponse(selections) {
  const selectionById = {};
  const selectedItems = [];

  for (const item of giftItems) {
    const quantity = selections[item.id]?.quantity ?? 0;

    selectionById[item.id] = {
      quantity,
      maxQuantity: item.maxQuantity,
      selectionType: item.selectionType,
      isAtLimit:
        item.selectionType === "limited" &&
        typeof item.maxQuantity === "number" &&
        quantity >= item.maxQuantity,
    };

    if (quantity > 0) {
      selectedItems.push({
        ...item,
        quantity,
        updatedAt: selections[item.id]?.updatedAt ?? null,
      });
    }
  }

  selectedItems.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return {
    selectionById,
    selectedItems,
    totalSelectedUnits: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalSelectedTypes: selectedItems.length,
    totalItems: giftItems.length,
  };
}

export async function GET() {
  const selections = await readSelections();
  return NextResponse.json(buildResponse(selections));
}

export async function POST(request) {
  const body = await request.json();
  const itemId = body?.itemId;

  if (!itemId || !giftItemsById[itemId]) {
    return NextResponse.json({ message: "Item inválido." }, { status: 400 });
  }

  const item = giftItemsById[itemId];
  const currentSelections = await readSelections();
  const currentQuantity = currentSelections[itemId]?.quantity ?? 0;

  if (
    item.selectionType === "limited" &&
    typeof item.maxQuantity === "number" &&
    currentQuantity >= item.maxQuantity
  ) {
    return NextResponse.json(
      {
        message: `Este item já atingiu o limite máximo de ${item.maxQuantity} unidade(s).`,
      },
      { status: 409 },
    );
  }

  const selections = await incrementItemSelection(itemId);
  return NextResponse.json(buildResponse(selections));
}

export async function DELETE(request) {
  const body = await request.json();
  const itemId = body?.itemId;

  if (!itemId || !giftItemsById[itemId]) {
    return NextResponse.json({ message: "Item inválido." }, { status: 400 });
  }

  const currentSelections = await readSelections();
  const currentQuantity = currentSelections[itemId]?.quantity ?? 0;

  if (currentQuantity <= 0) {
    return NextResponse.json(
      {
        message: "Este item ainda não possui unidades selecionadas.",
      },
      { status: 409 },
    );
  }

  const selections = await decrementItemSelection(itemId);
  return NextResponse.json(buildResponse(selections));
}
