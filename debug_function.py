import requests
import json

url = "https://jzylycxvjmxzyfpyhngx.supabase.co/functions/v1/create-checkout"
headers = {
    "Authorization": "Bearer REMOVED_FOR_SAFETY", 
    "Content-Type": "application/json"
}

try:
    print(f"Testing URL: {url}")
    response = requests.post(url, headers=headers, json={}, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
