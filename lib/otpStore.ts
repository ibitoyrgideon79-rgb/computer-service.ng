// Shared OTP storage across API routes
// In production, this should be in a database like Supabase or MongoDB
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export default otpStore;
