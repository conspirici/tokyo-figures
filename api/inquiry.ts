/** POST /api/inquiry on Vercel (Node.js function). Logic lives in lib/inquiry-handler.ts (shared with Cloudflare). */
import { handleInquiry, type InquiryEnv } from "../lib/inquiry-handler";

const env = () => process.env as InquiryEnv;

export async function POST(request: Request): Promise<Response> {
  return handleInquiry(request, env());
}

export async function GET(request: Request): Promise<Response> {
  return handleInquiry(request, env());
}
