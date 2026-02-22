import requests
from openai import OpenAI
import time
import os
import json
import psycopg2
from datetime import datetime, timedelta, timezone

# ────────────────────────────────────────────────
# Database Setup
# ────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")

def init_db():
    if not DATABASE_URL:
        print("DATABASE_URL not set. Skipping DB storage.")
        return
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS api_test_results (
                id SERIAL PRIMARY KEY,
                api_name TEXT,
                model TEXT,
                status TEXT,
                response TEXT,
                tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Init FAILED: {e}")

def save_result(api_name, model, status, response_text):
    if not DATABASE_URL: return
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO api_test_results (api_name, model, status, response) VALUES (%s, %s, %s, %s)",
            (api_name, model, status, response_text)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Save result FAILED: {e}")

def get_saved_results():
    if not DATABASE_URL: return []
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT api_name, model, status, response, tested_at FROM api_test_results ORDER BY status DESC, tested_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        print(f"Get results FAILED: {e}")
        return []

# ────────────────────────────────────────────────
# Helper to test models for OpenAI-compatible clients
# ────────────────────────────────────────────────
def test_models(client, models, api_name, key_short):
    results = {}
    for model in models:
        print(f"Testing {api_name} model '{model}' with key {key_short}...")
        status = "FAILED"
        resp_text = ""
        try:
            # Special handling for Portkey
            if api_name == "Portkey":
                # client.default_headers is a dict in recent OpenAI versions
                client.default_headers = {"x-portkey-provider": "openai"}
            
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": f"Say 'Test OK for {model}'"}],
                max_tokens=20
            )
            status = "WORKS"
            resp_text = response.choices[0].message.content.strip()
            print(f"SUCCESS: {model} works! Response: {resp_text}")
        except Exception as e:
            status = f"FAILED: {str(e)}"
            resp_text = str(e)
            print(status)
        
        results[model] = status
        save_result(api_name, model, status, resp_text)
    return results

# ────────────────────────────────────────────────
# OpenRouter usage check
# ────────────────────────────────────────────────
def check_openrouter_usage(key, key_short):
    print(f"\n=== Checking OpenRouter usage for key {key_short} ===")
    headers = {"Authorization": f"Bearer {key}"}
    try:
        resp = requests.get("https://openrouter.ai/api/v1/key", headers=headers)
        resp.raise_for_status()
        data = resp.json()["data"]
        print(f"Remaining credits: {data.get('limit_remaining', 'Unlimited')}")
        print(f"Daily usage: {data['usage_daily']}")
    except Exception as e:
        print(f"Usage check FAILED: {str(e)}")

# ────────────────────────────────────────────────
# Test Functions
# ────────────────────────────────────────────────
def test_portkey(key):
    print("\n=== Testing Portkey ===")
    client = OpenAI(api_key=key, base_url="https://api.portkey.ai/v1")
    models = ["gpt-4o-mini", "gpt-3.5-turbo"]
    return test_models(client, models, "Portkey", key[:10] + "...")

def test_openrouter(key):
    print("\n=== Testing OpenRouter ===")
    check_openrouter_usage(key, key[:10] + "...")
    client = OpenAI(api_key=key, base_url="https://openrouter.ai/api/v1")
    models = [
        "deepseek/deepseek-r1:free",
        "google/gemini-flash-1.5",
        "meta-llama/llama-3.2-3b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "qwen/qwen-2-7b-instruct:free"
    ]
    # Test half of them
    test_count = max(1, len(models) // 2)
    return test_models(client, models[:test_count], "OpenRouter", key[:10] + "...")

def test_poyo(key):
    print("\n=== Testing Poyo ===")
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    models = ["flux-pro", "kling-v1"]
    for model in models:
        print(f"Testing Poyo model '{model}'...")
        status = "FAILED"
        resp_text = ""
        try:
            # Poyo often uses standard generation endpoints
            payload = {"model": model, "prompt": "Test circle"}
            resp = requests.post("https://api.poyo.ai/v1/images/generations", headers=headers, json=payload, timeout=15)
            if resp.status_code == 200:
                status = "WORKS"
                resp_text = "Success"
            else:
                status = f"FAILED: {resp.status_code}"
                resp_text = resp.text
        except Exception as e:
            status = f"FAILED: {str(e)}"
            resp_text = str(e)
        save_result("Poyo", model, status, resp_text)
        print(f"{model}: {status}")

# ────────────────────────────────────────────────
# Keys
# ────────────────────────────────────────────────
PORTKEY_KEY = "ST4fIU5r6s6JvLGE/ad2F+8CCCrU"
POYO_KEY = "sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79"
OPENROUTER_KEY = "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"

if __name__ == "__main__":
    init_db()
    print("Starting DEEP API TEST...")
    
    print("\n[PREVIOUS RESULTS]")
    saved = get_saved_results()
    for row in saved:
        print(f"[{row[4]}] {row[0]} - {row[1]}: {row[2]}")
    
    test_portkey(PORTKEY_KEY)
    test_poyo(POYO_KEY)
    test_openrouter(OPENROUTER_KEY)
    
    print("\n[FINAL WORKABLE MODELS]")
    all_results = get_saved_results()
    for row in all_results:
        if "WORKS" in row[2]:
            print(f"✅ {row[0]} | {row[1]} | {row[2]}")
    
    print("\nDone.")
