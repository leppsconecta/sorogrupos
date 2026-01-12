-- ALERTA: Execute este script no Editor SQL do Supabase para aplicar a correção solicitada.

DO $$
BEGIN
    -- 1. Tornar a coluna 'job_id' anulável (se ainda não for)
    -- Isso permite que o registro de envio exista mesmo sem um job associado.
    ALTER TABLE marketing_schedules ALTER COLUMN job_id DROP NOT NULL;

    -- 2. Remover a constraint de chave estrangeira existente
    -- O nome padrão geralmente é 'marketing_schedules_job_id_fkey'.
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_schedules_job_id_fkey') THEN
        ALTER TABLE marketing_schedules DROP CONSTRAINT marketing_schedules_job_id_fkey;
    END IF;

    -- 3. Adicionar a nova constraint com ON DELETE SET NULL
    -- Isso garante que ao deletar um Job, o campo job_id no schedule vire NULL, mas a linha não seja apagada.
    ALTER TABLE marketing_schedules 
    ADD CONSTRAINT marketing_schedules_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
END $$;
