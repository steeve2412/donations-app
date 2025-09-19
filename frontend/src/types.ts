/*
# Types
# - Donation shape used across the app
*/
export type Donation = {
  id?: number;
  donorName: string;
  amount: number;
  date: string; // ISO
};
