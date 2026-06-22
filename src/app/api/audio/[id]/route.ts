import { type NextRequest } from "next/server";

/**
 * Streaming proxy for Google Drive audio.
 *
 * Drive's direct-download links are unreliable for long lectures:
 *  - files over ~25 MB return an HTML "can't scan for viruses" page
 *    instead of the audio,
 *  - the legacy uc?export=download endpoint handles HTTP Range poorly.
 *
 * This route hits the modern `drive.usercontent.google.com` endpoint with
 * `confirm=t` (which bypasses the scan page), forwards the browser's Range
 * header so seeking works in hour-long files, and streams the body back
 * without buffering it in memory.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DRIVE_DOWNLOAD = "https://drive.usercontent.google.com/download";
const DRIVE_ID = /^[a-zA-Z0-9_-]{10,}$/;

function driveUrl(id: string): string {
  const params = new URLSearchParams({
    id,
    export: "download",
    confirm: "t",
  });
  return `${DRIVE_DOWNLOAD}?${params.toString()}`;
}

async function streamFromDrive(id: string, range: string | null, isHead: boolean) {
  if (!DRIVE_ID.test(id)) {
    return new Response("Invalid file id", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(driveUrl(id), {
      headers: range ? { Range: range } : undefined,
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return new Response("Failed to reach audio host", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Audio host returned an error", {
      status: upstream.status === 404 ? 404 : 502,
    });
  }

  // An HTML body means a quota/scan/permission page, not the audio file.
  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    return new Response(
      "This file can't be streamed. Check that it is shared as 'Anyone with the link' and within its download quota.",
      { status: 409 }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType || "audio/mpeg");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

  for (const header of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  if (isHead) {
    upstream.body?.cancel();
    return new Response(null, { status: upstream.status, headers });
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return streamFromDrive(id, request.headers.get("range"), false);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return streamFromDrive(id, request.headers.get("range"), true);
}
