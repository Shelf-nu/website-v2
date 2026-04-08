import { execSync } from "node:child_process";

function fromKeychain(service) {
  return execSync(`security find-generic-password -s "${service}" -w`, {
    encoding: "utf-8",
  }).trim();
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
