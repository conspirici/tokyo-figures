/** Shared by the client form (components/InquiryForm.tsx) and the Pages Function (functions/api/inquiry.ts). */
import { z } from "zod";

export const INQUIRY_TYPES = [
  { value: "order", label: "Place an order" },
  { value: "wholesale", label: "Wholesale / bulk order" },
  { value: "product", label: "Product question" },
  { value: "notify", label: "Availability / notify me" },
  { value: "shipping", label: "Shipping & duties" },
  { value: "other", label: "Other" },
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];
export const INQUIRY_TYPE_VALUES = INQUIRY_TYPES.map((t) => t.value) as [InquiryType, ...InquiryType[]];

export const MESSAGE_MAX = 2000;

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120, "That name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  company: z.string().trim().max(160).default(""),
  type: z.enum(INQUIRY_TYPE_VALUES, { message: "Choose an inquiry type" }),
  products: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(15).default([]),
  quantity: z.string().trim().max(60).default(""),
  country: z.string().trim().max(80).default(""),
  region: z.string().trim().max(80).default(""),
  message: z
    .string()
    .trim()
    .min(1, "Please write a short message")
    .max(MESSAGE_MAX, `Please keep it under ${MESSAGE_MAX} characters`),
  consent: z.literal(true, { message: "Please tick the box so we can reply" }),
  /** Honeypot. Real people never see or fill this. */
  website: z.string().default(""),
  turnstileToken: z.string().default(""),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;

export function typeLabel(t: string) {
  return INQUIRY_TYPES.find((x) => x.value === t)?.label ?? t;
}
