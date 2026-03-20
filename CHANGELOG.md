# Журнал изменений

## [1.2.0] — 2025-03-20

### ✨ Новое

- feat(api): add cursor-based pagination for user directory endpoint (27c28a7)
- feat(ui): add compact density preset to data tables (2f1c7a1)

### 🐛 Исправления

- fix(auth): clear stale refresh token after password reset (03e14cc)
- fix(notifications): dedupe push payload when batching retries (3eeb7cf)

### ♻️ Рефакторинг

- refactor(core): extract date range helpers for reporting queries (4dffad7)
- refactor(db): narrow indexes for audit log lookups (c26190c)

### 🔧 Служебное

- chore(ci): cache pnpm store by lockfile checksum (a321755)
- chore(deps): bump runtime patch versions for security advisories (9769325)

### 📚 Документация

- docs(readme): clarify local setup and env file precedence (2bfdadc)
- docs(api): document rate-limit headers with examples (3a7110b)
