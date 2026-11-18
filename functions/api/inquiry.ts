/** POST /api/inquiry on Cloudflare Pages. Logic lives in lib/inquiry-handler.ts (shared with Vercel). */
import { handleInquiry, type InquiryEnv } from "../../lib/inquiry-handler";

export const onRequest: PagesFunction<InquiryEnv> = ({ request, env }) => handleInquiry(request, env);
