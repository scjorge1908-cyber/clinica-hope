-- ============================================================
-- SublocaFacil — Adicionar campos: razao_social e slug
-- Execute no Supabase → SQL Editor → Run
-- ============================================================

-- Adicionar colunas na tabela clinicas
ALTER TABLE clinicas 
  ADD COLUMN IF NOT EXISTS razao_social TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Criar índice no slug para buscas rápidas
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinicas_slug ON clinicas(slug);

-- Gerar slugs automáticos para clínicas já existentes (sem slug)
UPDATE clinicas 
SET slug = LOWER(REGEXP_REPLACE(nome, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Verificar resultado
SELECT id, nome, razao_social, slug FROM clinicas ORDER BY criado_em DESC LIMIT 10;
