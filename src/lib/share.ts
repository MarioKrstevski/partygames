import "server-only";

import QRCode from "qrcode";
import { headers } from "next/headers";

/**
 * Absolute URL for a deck's share link.
 *
 * Derived from the request host rather than a fixed env var, so the link is
 * correct on localhost, on a preview deployment and in production without
 * anything to configure.
 */
export async function shareUrlFor(token: string): Promise<string> {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol =
    list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/d/${token}`;
}

/** QR rendered on the server, so no QR library is shipped to the browser. */
export async function qrSvgFor(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1523", light: "#ffffff" },
  });
}
