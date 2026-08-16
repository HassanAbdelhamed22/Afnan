import "@testing-library/jest-dom";

// Keep test imports deterministic without reading developer or production secrets.
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/afnan-test";
process.env.MONGODB_DB_NAME ??= "afnan-test";
process.env.BETTER_AUTH_SECRET ??= "test-only-secret-that-is-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://127.0.0.1:3000";
process.env.NEXT_PUBLIC_APP_URL ??= "http://127.0.0.1:3000";
process.env.RESEND_API_KEY ??= "re_test_placeholder";
process.env.EMAIL_PROVIDER ??= "resend";
process.env.AUTH_EMAIL_FROM ??= "Afnan Test <test@afnan.invalid>";
process.env.ADMIN_EMAIL ??= "admin@afnan.invalid";
