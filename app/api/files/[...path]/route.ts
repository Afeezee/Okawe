import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, ctx: RouteContext<"/api/files/[...path]">) {
  const { path } = await ctx.params;
  const bucket = path[0] === "covers" ? "covers" : "documents";
  const filename = path.slice(1).join("/");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
  return NextResponse.redirect(url);
}
