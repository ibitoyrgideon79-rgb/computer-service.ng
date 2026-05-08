// Shared env for all tests
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.JWT_SECRET   = "test-secret-key";
process.env.PAYSTACK_SECRET_KEY = "sk_test_fake_key_for_tests";
