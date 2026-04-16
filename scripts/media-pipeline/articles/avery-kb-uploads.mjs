#!/usr/bin/env node

/**
 * One-shot helper: uploads the 2 user-provided screenshots for the
 * Avery KB article. The actual downloaded QR (PNG) and the panel
 * screenshot (JPG). Convert PNG → WebP; keep the panel as JPG.
 */

import { cp, mkdtemp, rm } from "node:fs/promises";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "knowledgebase";

const files = [
    {
        source: "/Users/macwhale/Downloads/nikon-d3200-medium-shelf-qr-code-clxegnjcm005b11tn2cszkw6c-2.png",
        bucketName: "avery-qr-downloaded-label.webp",
        convertToWebP: true,
    },
    {
        source: "/Users/macwhale/Desktop/Screenshot 2026-04-16 at 09.49.56.jpg",
        bucketName: "avery-qr-panel-ui.jpg",
        convertToWebP: false,
    },
    {
        source: "/Users/macwhale/Downloads/custom.png",
        bucketName: "avery-custom-label-designs.webp",
        convertToWebP: true,
    },
    {
        source: "/Users/macwhale/Downloads/saveqrfromassetpage.jpg",
        bucketName: "avery-bulk-download-qr.jpg",
        convertToWebP: false,
    },
];

async function main() {
    const tmpDir = await mkdtemp(join(tmpdir(), "avery-kb-"));
    console.log(`Working in: ${tmpDir}`);
    try {
        for (const f of files) {
            const local = join(tmpDir, basename(f.source));
            await cp(f.source, local);
            let uploadPath = local;
            if (f.convertToWebP) uploadPath = toWebP(local);
            const url = await upload(uploadPath, `${BUCKET_PREFIX}/${f.bucketName}`);
            console.log(`  ✅ ${f.bucketName}: ${url}`);
        }
    } finally {
        await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
