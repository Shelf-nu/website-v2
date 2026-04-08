import { execSync } from "node:child_process";
import { basename, dirname, join } from "node:path";

/**
 * Convert PNG screenshot to WebP.
 * @param {string} pngPath
 * @returns {string} Path to the WebP file
 */
export function toWebP(pngPath) {
  const dir = dirname(pngPath);
  const name = basename(pngPath, ".png");
  const webpPath = join(dir, `${name}.webp`);
  execSync(`cwebp -q 85 "${pngPath}" -o "${webpPath}"`, {
    stdio: "pipe",
  });
  return webpPath;
}

/**
 * Convert Playwright's .webm recording to optimized MP4 and WebM.
 * Audio is stripped since these are UI demos.
 * @param {string} webmPath - Input .webm from Playwright
 * @returns {{ mp4: string, webm: string }}
 */
export function toVideoFormats(webmPath) {
  const dir = dirname(webmPath);
  const name = basename(webmPath, ".webm");
  const mp4Path = join(dir, `${name}.mp4`);
  const optimizedWebm = join(dir, `${name}-opt.webm`);

  // MP4 (H.264) — broad compatibility
  execSync(
    `ffmpeg -i "${webmPath}" -c:v libx264 -preset slow -crf 23 -an -pix_fmt yuv420p -movflags +faststart "${mp4Path}" -y`,
    { stdio: "pipe" }
  );

  // WebM (VP9) — smaller file for modern browsers
  execSync(
    `ffmpeg -i "${webmPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -an "${optimizedWebm}" -y`,
    { stdio: "pipe" }
  );

  return { mp4: mp4Path, webm: optimizedWebm };
}
