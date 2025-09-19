/*
# App
# - Form to add a donation
# - Table to list donations
*/
import React, { useEffect, useState } from "react";
import { createDonation, getDonations } from "./api";
import { Donation } from "./types";

export default function App() {
  // form state
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm

  // data state
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load donations
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setDonations(await getDonations());
      } catch (e: any) {
        setError(e.message || "Failed to load donations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const amt = Number(amount);
    if (!donorName.trim()) {
      setError("Donor name is required");
      setSubmitting(false);
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be a positive number");
      setSubmitting(false);
      return;
    }

    try {
      const iso = new Date(date).toISOString();
      await createDonation({ donorName: donorName.trim(), amount: amt, date: iso });
      setDonorName("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 16));
      setDonations(await getDonations());
    } catch (e: any) {
      setError(e.message || "Failed to submit donation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Donations</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 500, marginBottom: "2rem" }}>
        <label>
          <div>Donor Name</div>
          <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Jane Doe"
                 style={{ width: "100%", padding: "0.5rem" }} required />
        </label>

        <label>
          <div>Amount</div>
          <input type="number" min="0" step="0.01" value={amount}
                 onChange={(e) => setAmount(e.target.value)} placeholder="50.00"
                 style={{ width: "100%", padding: "0.5rem" }} required />
        </label>

        <label>
          <div>Date & Time</div>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
                 style={{ width: "100%", padding: "0.5rem" }} />
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button disabled={submitting} style={{ padding: "0.6rem 1rem" }}>
          {submitting ? "Submitting..." : "Add Donation"}
        </button>
      </form>

      <section>
        <h2>All Donations</h2>
        {loading ? (
          <p>Loading...</p>
        ) : donations.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>ID</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Donor</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Amount</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{d.id}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{d.donorName}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                      {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(d.amount)}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                      {new Date(d.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
