import { vi } from "vitest";

export const prisma = {
  admin: {
    findUnique: vi.fn(),
  },
  order: {
    create:     vi.fn(),
    findFirst:  vi.fn(),
    findMany:   vi.fn(),
    update:     vi.fn(),
    updateMany: vi.fn(),
    delete:     vi.fn(),
    count:      vi.fn(),
    aggregate:  vi.fn(),
  },
  partnerApplication: {
    create:   vi.fn(),
    findMany: vi.fn(),
    update:   vi.fn(),
  },
  otpCode: {
    create:     vi.fn(),
    deleteMany: vi.fn(),
    findFirst:  vi.fn(),
  },
};
