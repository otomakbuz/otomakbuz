import { NextResponse, type NextRequest } from "next/server";
import { exchangeOpenRouterCode } from "@/lib/actions/ocr-settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${origin}/ayarlar?tab=ocr&or_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/ayarlar?tab=ocr&or_error=${encodeURIComponent("missing_code")}`
    );
  }

  const result = await exchangeOpenRouterCode(code);

  if (result.ok) {
    return NextResponse.redirect(`${origin}/ayarlar?tab=ocr&or_connected=1`);
  }

  return NextResponse.redirect(
    `${origin}/ayarlar?tab=ocr&or_error=${encodeURIComponent(result.message)}`
  );
}
