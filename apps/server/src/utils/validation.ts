import { z } from "zod";

export const productRowSchema = z.object({
  product_id: z.coerce.number().int().positive(),
  created_at: z.string().min(1),
  product_name: z.string().min(1),
});

export const orderRowSchema = z.object({
  order_id: z.coerce.number().int().positive(),
  created_at: z.string().min(1),
  website_session_id: z.coerce.number().int().positive(),
  user_id: z.coerce.number().int().positive(),
  primary_product_id: z.coerce.number().int().positive(),
});

export const orderItemRowSchema = z.object({
  order_item_id: z.coerce.number().int().positive(),
  order_id: z.coerce.number().int().positive(),
  product_id: z.coerce.number().int().positive(),
});

export const refundRowSchema = z.object({
  order_item_refund_id: z.coerce.number().int().positive(),
  order_item_id: z.coerce.number().int().positive(),
  order_id: z.coerce.number().int().positive(),
  refund_amount_usd: z.coerce.number().nonnegative(),
});

export const sessionRowSchema = z.object({
  website_session_id: z.coerce.number().int().positive(),
  created_at: z.string().min(1),
  user_id: z.coerce.number().int().positive(),
});

export const pageviewRowSchema = z.object({
  website_pageview_id: z.coerce.number().int().positive(),
  website_session_id: z.coerce.number().int().positive(),
  pageview_url: z.string().min(1),
});
