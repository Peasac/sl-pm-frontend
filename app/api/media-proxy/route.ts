import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return new Response("Failed to fetch media", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=120",
      },
    });
  } catch {
    return new Response("Failed to fetch media", { status: 502 });
  }
}
