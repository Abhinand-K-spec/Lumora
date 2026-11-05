
import type { CreateQuotationDTO } from "../dto/createQuotationDto";

export interface CalculatedQuotation {
  items: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];

  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  advanceAmount: number;
  remainingAmount: number;
}

const toPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

const toRupees = (amount: number): number => {
  return amount / 100;
};

export const calculateQuotation = (
  data: CreateQuotationDTO,
): CalculatedQuotation => {
  const itemsInPaise = data.items.map((item) => ({
    name: item.name,
    ...(item.description !== undefined && {
        description: item.description,
      }),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: Math.round(
      item.quantity * toPaise(item.unitPrice),
    ),
  }));

  const subtotalInPaise = itemsInPaise.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const discountInPaise = toPaise(data.discount ?? 0);
  const taxInPaise = toPaise(data.tax ?? 0);

  const totalInPaise =
    subtotalInPaise - discountInPaise + taxInPaise;

  const advanceAmountInPaise = toPaise(data.advanceAmount);

  const remainingAmountInPaise =
    totalInPaise - advanceAmountInPaise;

  return {
    items: itemsInPaise.map((item) => ({
      ...item,
      unitPrice: toRupees(toPaise(item.unitPrice)),
      total: toRupees(item.total),
    })),

    subtotal: toRupees(subtotalInPaise),
    discount: toRupees(discountInPaise),
    tax: toRupees(taxInPaise),
    total: toRupees(totalInPaise),
    advanceAmount: toRupees(advanceAmountInPaise),
    remainingAmount: toRupees(remainingAmountInPaise),
  };
};
