
const url = "https://jzylycxvjmxzyfpyhngx.supabase.co/functions/v1/create-checkout";
const headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eWx5Y3h2am14enlmcHlobmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTExMjksImV4cCI6MjA4Mjg2NzEyOX0.3gjVuMMX0YgfP3KhR5DxLAWe9iwzKiZ4BhJdgh8vb6o",
    "Content-Type": "application/json"
};

async function test() {
    try {
        console.log(`Testing URL: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({})
        });

        console.log(`Status Code: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

test();
