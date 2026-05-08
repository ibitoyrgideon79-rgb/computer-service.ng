import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { verifyAdminToken } from "@/lib/auth";

const SECRET  = "test-secret-key";
const PAYLOAD = { id: "admin-1", email: "admin@computerservice.ng" };

function makeToken(payload = PAYLOAD, secret = SECRET) {
  return jwt.sign(payload, Buffer.from(secret));
}

describe("verifyAdminToken", () => {
  it("throws when header is null", () => {
    expect(() => verifyAdminToken(null)).toThrow("Unauthorized");
  });

  it("throws when header has no Bearer prefix", () => {
    expect(() => verifyAdminToken(makeToken())).toThrow("Unauthorized");
  });

  it("throws when token is signed with wrong secret", () => {
    const badToken = makeToken(PAYLOAD, "wrong-secret");
    expect(() => verifyAdminToken(`Bearer ${badToken}`)).toThrow();
  });

  it("throws when token is expired", () => {
    const expired = jwt.sign(PAYLOAD, Buffer.from(SECRET), { expiresIn: -1 });
    expect(() => verifyAdminToken(`Bearer ${expired}`)).toThrow();
  });

  it("returns decoded payload on valid token", () => {
    const token   = makeToken();
    const decoded = verifyAdminToken(`Bearer ${token}`);
    expect(decoded.id).toBe(PAYLOAD.id);
    expect(decoded.email).toBe(PAYLOAD.email);
  });
});
