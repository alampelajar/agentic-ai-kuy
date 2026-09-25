-- ============================================================
-- Agentic AI - Repair custom model -> Agent relations
-- ============================================================
-- Jalankan SELECT terlebih dahulu.
-- Jangan jalankan DELETE sebelum memastikan Agent tujuan benar.

-- 1. Lihat semua relasi model -> agent.
SELECT
    am.ai_model_id,
    m.name AS model_name,
    m.is_system,
    am.agent_id,
    a.name AS agent_name
FROM agent_models am
JOIN ai_models m ON m.id = am.ai_model_id
JOIN agents a ON a.id = am.agent_id
ORDER BY am.ai_model_id, am.agent_id;

-- 2. Tampilkan CUSTOM model yang saat ini terhubung ke lebih dari satu Agent.
SELECT
    m.id AS model_id,
    m.name AS model_name,
    m.model_id AS provider_model_id,
    COUNT(am.agent_id) AS agent_count,
    STRING_AGG(a.name, ', ' ORDER BY a.id) AS agents
FROM ai_models m
JOIN agent_models am ON am.ai_model_id = m.id
JOIN agents a ON a.id = am.agent_id
WHERE m.is_system = FALSE
GROUP BY m.id, m.name, m.model_id
HAVING COUNT(am.agent_id) > 1
ORDER BY m.id;

-- ============================================================
-- OPSIONAL: RESET SEMUA RELASI CUSTOM MODEL
-- ============================================================
-- Gunakan hanya jika relasi custom model lama memang sudah salah
-- dan kamu siap menambahkan kembali setiap custom model ke Agent
-- yang benar melalui UI.
--
-- BEGIN;
-- DELETE FROM agent_models
-- WHERE ai_model_id IN (
--     SELECT id FROM ai_models WHERE is_system = FALSE
-- );
-- COMMIT;
--
-- Model custom TIDAK dihapus. Hanya relasinya yang dihapus.

-- 3. Verifikasi bahwa setiap kombinasi Agent + Model unik.
SELECT
    agent_id,
    ai_model_id,
    COUNT(*) AS duplicate_count
FROM agent_models
GROUP BY agent_id, ai_model_id
HAVING COUNT(*) > 1;
