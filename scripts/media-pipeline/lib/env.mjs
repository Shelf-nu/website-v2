// macOS-only: reads secrets from the macOS Keychain via the `security` CLI.
// On other platforms, set equivalent environment variables instead.

import { execSync } from "node:child_process";

function fromKeychain(service) {
  try {
    return execSync(`security find-generic-password -s "${service}" -w`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    throw new Error(
      `Missing Keychain entry "${service}". Add it with:\n` +
      `  security add-generic-password -s "${service}" -a "$USER" -w "YOUR_VALUE"`
    );
  }
}

export function getSupabaseConfig() {
  return {
    url: fromKeychain("supabase-url"),
    serviceKey: fromKeychain("supabase-service-key"),
    bucket: "website-images",
  };
}

export function getShelfCredentials() {
  return {
    email: fromKeychain("shelf-demo-email"),
    password: fromKeychain("shelf-demo-password"),
  };
}
