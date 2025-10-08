import { z } from "zod";

// Client data from Google Sheets "WebBase" sheet
export const clientSchema = z.object({
  chatId: z.string(),
  name: z.string(),
  phone: z.string(),
  carNumber: z.string(),
  orderQr: z.string(),
  pricePerMonth: z.string(),
  tireCount: z.string(),
  hasRims: z.string(),
  startDate: z.string(),
  duration: z.string(),
  reminder: z.string(),
  endDate: z.string(),
  storageLocation: z.string(),
  cell: z.string(),
  totalAmount: z.string(),
  debt: z.string(),
  contract: z.string(),
  clientAddress: z.string(),
  dealStatus: z.string(),
  trafficSource: z.string(),
  dotCode: z.string(),
});

export type Client = z.infer<typeof clientSchema>;

// Archive order from "Archive" sheet
export const archiveOrderSchema = z.object({
  chatId: z.string(),
  name: z.string(),
  phone: z.string(),
  carNumber: z.string(),
  orderQr: z.string(),
  pricePerMonth: z.string(),
  tireCount: z.string(),
  hasRims: z.string(),
  startDate: z.string(),
  duration: z.string(),
  reminder: z.string(),
  endDate: z.string(),
  storageLocation: z.string(),
  cell: z.string(),
  totalAmount: z.string(),
  debt: z.string(),
  contract: z.string(),
  clientAddress: z.string(),
  dealStatus: z.string(),
  trafficSource: z.string(),
  dotCode: z.string(),
});

export type ArchiveOrder = z.infer<typeof archiveOrderSchema>;

// Field visibility settings
export const fieldVisibilitySchema = z.object({
  name: z.boolean(),
  phone: z.boolean(),
  carNumber: z.boolean(),
  orderQr: z.boolean(),
  pricePerMonth: z.boolean(),
  tireCount: z.boolean(),
  hasRims: z.boolean(),
  startDate: z.boolean(),
  duration: z.boolean(),
  reminder: z.boolean(),
  endDate: z.boolean(),
  storageLocation: z.boolean(),
  cell: z.boolean(),
  totalAmount: z.boolean(),
  debt: z.boolean(),
  contract: z.boolean(),
  clientAddress: z.boolean(),
  dealStatus: z.boolean(),
  trafficSource: z.boolean(),
  dotCode: z.boolean(),
});

export type FieldVisibility = z.infer<typeof fieldVisibilitySchema>;

// Default field visibility (fields visible by default)
export const defaultFieldVisibility: FieldVisibility = {
  name: true,
  phone: true,
  carNumber: true,
  orderQr: true,
  pricePerMonth: true,
  tireCount: true,
  hasRims: true,
  startDate: true,
  duration: true,
  reminder: true,
  endDate: true,
  storageLocation: true,
  cell: true,
  totalAmount: true,
  debt: false, // Sensitive
  contract: true,
  clientAddress: false, // Sensitive
  dealStatus: true,
  trafficSource: false, // Admin only
  dotCode: true,
};

// Field labels in Russian
export const fieldLabels: Record<keyof FieldVisibility, string> = {
  name: "Имя клиента",
  phone: "Телефон",
  carNumber: "Номер авто",
  orderQr: "Заказ - QR",
  pricePerMonth: "Цена за месяц",
  tireCount: "Кол-во шин",
  hasRims: "Наличие дисков",
  startDate: "Начало",
  duration: "Срок",
  reminder: "Напомнить",
  endDate: "Окончание",
  storageLocation: "Склад хранения",
  cell: "Ячейка",
  totalAmount: "Общая сумма",
  debt: "Долг",
  contract: "Договор",
  clientAddress: "Адрес клиента",
  dealStatus: "Статус сделки",
  trafficSource: "Источник трафика",
  dotCode: "DOT CODE",
};
