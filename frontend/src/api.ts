/*
# API calls
# - Fetch list and create donation
*/
import { Donation } from "./types";

export async function getDonations(): Promise<Donation[]> {
  const r = await fetch("/donations");
  if (!r.ok) throw new Error("Failed to fetch donations");
  return r.json();
}

export async function createDonation(input: Omit<Donation, "id">) {
  const r = await fetch("/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to create donation");
  }
  return r.json();
}
