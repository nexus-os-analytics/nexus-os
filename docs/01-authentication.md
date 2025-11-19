# 🧑‍💻 Copilot Instructions – Authentication & Authorization (Prisma + Postgres + NextAuth)

### 🔑 Authentication

* Implement user accounts in **Postgres** using **Prisma** with the following fields: `id`, `email`, `hashedPassword`, `role`, `createdAt`, `updatedAt`.
* Store passwords with a **secure hashing algorithm** (`bcrypt` or `argon2`). Never store plain text.
* Enforce a **minimum password length of 8 characters**, allow special characters (no silly restrictions).
* Implement **rate limiting** or temporary lockout after failed login attempts.
* Configure **NextAuth** with **JWT sessions** and set expiration (`idle timeout` + `absolute timeout`).
* Add **2FA/MFA** support for all users (e.g., TOTP with `next-auth` custom provider).
* Make **2FA mandatory for admin accounts**.
* Implement a **logout all sessions** feature (invalidate refresh tokens in DB).
* Ensure **all login and registration requests use HTTPS**.

---

### 🛂 Authorization

* Define **role-based access control (RBAC)** using `UserRoles` enum in Prisma schema (`ADMIN`, `USER`, `GUEST`).
* Implement **granular permissions** (read/write per resource) as a static object (like `PERMISSIONS` map).
* Always enforce **least privilege**: users should only access their own data (multi-tenant isolation).
* Distinguish **admin** vs **super-admin** roles.
* Add a **review mechanism** to validate user roles and permissions periodically.
* Log every access to sensitive data (write `AuditLog` model in Prisma).

---

### 📜 Data Protection (LGPD / GDPR compliance)

* Provide a **privacy policy** page (static route in Next.js).
* Implement a **consent mechanism** on signup (boolean field `acceptedTerms` in Prisma).
* Add API routes to allow users to **download/export their data** (portability).
* Add API routes to **delete user accounts** (right to be forgotten).
* Only collect **minimum required fields** in the `User` model.
* Add a **data retention policy** field in the database (`deletedAt` or `retentionUntil`).
* Ensure **Postgres encryption at rest** (RDS or managed Postgres setting) and **HTTPS in transit**.
* Implement an **incident reporting process** (log table `SecurityIncidents`).
* Keep a **registry of data storage locations** (documented in codebase or DB table `DataRegistry`).

---

### 🔒 Additional Best Practices

* Support **SSO providers** in NextAuth (OAuth2, OIDC, SAML).
* Implement **API keys with scopes and expiration** (`ApiKey` model in Prisma).
* Add **key rotation** logic for JWT secrets and API keys.
* Detect **suspicious logins** (log IP, device, geolocation in `LoginActivity` table).
* Keep environments isolated (`dev`, `staging`, `prod`) with separate databases.
* Ensure **encrypted backups** and test restore procedures regularly.

---

👉 This way, Copilot will have explicit instructions tied to:

* **NextAuth** for sessions & providers
* **Prisma** for schema & persistence
* **Postgres** as the underlying DB
