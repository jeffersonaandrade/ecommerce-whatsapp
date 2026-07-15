-- =============================================================================
-- Conceder role admin a usuário já cadastrado no Supabase Auth
-- =============================================================================
--
-- Uso: Supabase Dashboard → SQL Editor (projeto da loja alvo).
--      NÃO usar migration versionada — operação por implantação/cliente.
--
-- O app e o RLS (`is_store_admin()`) leem:
--   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
--
-- IMPORTANTE:
--   • Gravar em raw_app_meta_data (app_metadata), NUNCA em user_metadata.
--   • O usuário precisa existir em Authentication antes de rodar o UPDATE.
--   • Após o UPDATE, o usuário deve fazer logout/login (ou aguardar refresh
--     do JWT) para a sessão passar a incluir role=admin.
--   • Rodar no projeto Supabase correto (UnitSports ≠ Essenza).
--
-- Referência: docs/DATABASE_PLAN.md § Provisionamento admin
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Verificar se o usuário existe (não altera nada)
-- -----------------------------------------------------------------------------
SELECT
  id,
  email,
  raw_app_meta_data AS app_metadata_atual,
  created_at
FROM auth.users
WHERE lower(email) = lower('jefferson.a.andrade@hotmail.com');

-- Se retornar 0 linhas: cadastre o usuário em Authentication → Users primeiro.

-- -----------------------------------------------------------------------------
-- 2) Conceder admin (merge — preserva outras chaves em app_metadata)
-- -----------------------------------------------------------------------------
UPDATE auth.users
SET
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
  updated_at = now()
WHERE lower(email) = lower('jefferson.a.andrade@hotmail.com');

-- -----------------------------------------------------------------------------
-- 3) Validar
-- -----------------------------------------------------------------------------
SELECT
  id,
  email,
  raw_app_meta_data ->> 'role' AS role,
  raw_app_meta_data AS app_metadata
FROM auth.users
WHERE lower(email) = lower('jefferson.a.andrade@hotmail.com');

-- Esperado: role = admin

-- -----------------------------------------------------------------------------
-- (Opcional) Revogar admin — manter registro, remover apenas a role
-- -----------------------------------------------------------------------------
-- UPDATE auth.users
-- SET
--   raw_app_meta_data = raw_app_meta_data - 'role',
--   updated_at = now()
-- WHERE lower(email) = lower('SEU_EMAIL@exemplo.com');
