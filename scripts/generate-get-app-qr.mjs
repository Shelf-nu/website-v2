#!/usr/bin/env node
/**
 * Writes the "scan to install" QR code for Shelf Companion.
 *
 * The code points at /get-app, a page that sends iPhones to the App Store
 * and Android phones to Google Play, so one code works for both. Run this
 * again only if that URL changes:
 *
 *   node scripts/generate-get-app-qr.mjs
 */
import { writeFileSync } from "node:fs";
import QRCode from "qrcode";

const url = "https://www.shelf.nu/get-app";
const svg = await QRCode.toString(url, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#171717", light: "#ffffff" },
});
const out = "public/images/mobile-app/get-app-qr.svg";
writeFileSync(out, svg.replace("<svg ", '<svg role="img" aria-label="QR code: install Shelf Companion" '));
console.log(`wrote ${out} for ${url} (${svg.length} bytes)`);
