
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzylycxvjmxzyfpyhngx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eWx5Y3h2am14enlmcHlobmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTExMjksImV4cCI6MjA4Mjg2NzEyOX0.3gjVuMMX0YgfP3KhR5DxLAWe9iwzKiZ4BhJdgh8vb6o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    const email = `test_node_${Date.now()}@example.com`;
    const password = 'password123';

    console.log('Tentando cadastrar:', email);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                company_name: 'Minha Empresa Teste'
                // whatsapp: '11999999999' - Testing if removal fixes 500 error
            }
        }
    });

    if (error) {
        console.error('ERRO NO CADASTRO:', error);
        console.error('Mensagem:', error.message);
        console.error('Status:', error.status);
    } else {
        console.log('CADASTRO SUCESSO:', data);
    }
}

testSignup();
