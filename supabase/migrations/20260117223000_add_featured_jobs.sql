/* 
  Migration to add 'is_featured' column to jobs table and insert 10 mock jobs.
  3 of these jobs will be featured.
  Validates against actual schema: uses 'activities', valid enums.
*/

-- 1. Add is_featured column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. Insert Mock Data
DO $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
BEGIN
    SELECT user_id, id INTO v_user_id, v_company_id
    FROM folder_companies
    WHERE name ILIKE '%Temperos d Casa%'
    LIMIT 1;

    IF v_company_id IS NULL THEN
        SELECT user_id, id INTO v_user_id, v_company_id
        FROM folder_companies
        LIMIT 1;
    END IF;

    IF v_company_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        
        INSERT INTO jobs (
            user_id, folder_company_id, code, job_type, title, function, 
            company_name, employment_type, city, region, status, 
            activities, requirements, benefits, salary, is_featured
        ) VALUES (
            v_user_id, v_company_id, 'MOCK01', 'text', 'Gerente de Vendas', 'Gerente', 
            'Empresa Modelo', 'CLT', 'Sorocaba', 'Centro', 'active',
            'Liderar equipe de vendas. Gestão de metas e indicadores.', 'Experiência comprovada em liderança.', 'Vale Refeição, Plano de Saúde.', 'R$ 5.000,00', true
        ),
        (
            v_user_id, v_company_id, 'MOCK02', 'text', 'Desenvolvedor Full Stack', 'Desenvolvedor', 
            'Tech Solutions', 'PJ', 'Sorocaba', 'Campolim', 'active',
            'Desenvolvimento web moderno com React e Node.js.', 'Experiência com JS/TS, React, API REST.', 'Flexibilidade de horário.', 'R$ 8.000,00', true
        ),
        (
            v_user_id, v_company_id, 'MOCK03', 'text', 'Analista de Marketing', 'Analista', 
            'Marketing Pro', 'CLT', 'Votorantim', 'Centro', 'active',
            'Gestão de campanhas digitais e análise de métricas.', 'Conhecimento em Google Ads e Meta Ads.', 'Vale Transporte, VR.', 'R$ 3.500,00', true
        ),
        (
            v_user_id, v_company_id, 'MOCK04', 'text', 'Auxiliar Administrativo', 'Auxiliar', 
            'Escritório Central', 'CLT', 'Sorocaba', 'Zona Norte', 'active',
            'Rotinas administrativas, arquivamento e atendimento.', 'Ensino Médio Completo. Pacote Office.', 'Cesta Básica, VT.', 'R$ 1.800,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK05', 'text', 'Vendedor Interno', 'Vendedor', 
            'Loja Varejo', 'CLT', 'Sorocaba', 'Shopping', 'active',
            'Vendas no balcão e atendimento ao cliente.', 'Boa comunicação, experiência em vendas.', 'Comissão, VT.', 'R$ 2.000,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK06', 'text', 'Recepcionista', 'Recepcionista', 
            'Clínica Saúde', 'CLT', 'Sorocaba', 'Vergueiro', 'active',
            'Recepção de pacientes, agendamento de consultas.', 'Simpatia, organização, ensino médio.', 'Vale Alimentação.', 'R$ 1.600,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK07', 'text', 'Estagiário de Direito', 'Estagiário', 
            'Advocacia Silva', 'Temporário', 'Sorocaba', 'Mangal', 'active',
            'Apoio jurídico, pesquisa e redação de peças.', 'Cursando Direito (a partir do 3º ano).', 'Bolsa auxílio, Seguro de Vida.', 'R$ 1.200,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK08', 'text', 'Motorista Entregador', 'Motorista', 
            'Logística Rápida', 'CLT', 'Sorocaba', 'Zona Industrial', 'active',
            'Entregas na região de Sorocaba e Votorantim.', 'CNH B definitiva, experiência com entregas.', 'Seguro de Vida, Cesta.', 'R$ 2.200,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK09', 'text', 'Cozinheiro', 'Cozinheiro', 
            'Restaurante Sabor', 'CLT', 'Sorocaba', 'Centro', 'active',
            'Preparo de pratos à la carte e self-service.', 'Experiência comprovada em cozinha industrial.', 'Refeição no local.', 'R$ 2.500,00', false
        ),
        (
            v_user_id, v_company_id, 'MOCK10', 'text', 'Designer Gráfico', 'Designer', 
            'Agência Criativa', 'PJ', 'Sorocaba', 'Home Office', 'active',
            'Criação de artes para redes sociais e impressos.', 'Dominio Adobe (Ps, Ai). Criatividade.', 'Horário flexível.', 'A combinar', false
        )
        ON CONFLICT (code) DO UPDATE SET
            is_featured = EXCLUDED.is_featured,
            title = EXCLUDED.title,
            status = EXCLUDED.status,
            activities = EXCLUDED.activities;

    ELSE
        RAISE NOTICE 'No folder_company found to attach jobs to. Please create a company first.';
    END IF;
END $$;
