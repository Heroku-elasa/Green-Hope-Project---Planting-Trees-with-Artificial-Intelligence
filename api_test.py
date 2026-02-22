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
                latency INTEGER,
                tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Init FAILED: {e}")

def save_result(api_name, model, status, response_text, latency=None):
    if not DATABASE_URL: return
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO api_test_results (api_name, model, status, response, latency) VALUES (%s, %s, %s, %s, %s)",
            (api_name, model, status, response_text, latency)
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
        cur.execute("SELECT api_name, model, status, response, latency, tested_at FROM api_test_results ORDER BY tested_at DESC")
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
        latency = None
        start_time = time.time()
        try:
            # Create a separate client instance for Portkey to avoid modifying global state
            test_client = client
            if api_name == "Portkey":
                test_client = OpenAI(
                    api_key=client.api_key,
                    base_url=client.base_url,
                    default_headers={"x-portkey-provider": "openai"}
                )
            
            response = test_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": f"Say 'Test OK for {model}'"}],
                max_tokens=20
            )
            latency = int((time.time() - start_time) * 1000)
            status = "WORKS"
            resp_text = response.choices[0].message.content.strip()
            print(f"SUCCESS: {model} works! Response: {resp_text} ({latency}ms)")
        except Exception as e:
            status = f"FAILED: {str(e)}"
            resp_text = str(e)
            print(status)
        
        results[model] = status
        save_result(api_name, model, status, resp_text, latency)
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
        "deepseek/deepseek-chat",
        "google/gemini-flash-1.5",
        "meta-llama/llama-3.1-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "qwen/qwen-2-7b-instruct:free",
        "deepseek/deepseek-r1:free"
    ]
    return test_models(client, models, "OpenRouter", key[:10] + "...")

def test_poyo(key):
    print("\n=== Testing Poyo ===")
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    models = ["flux-pro", "kling-v1"]
    for model in models:
        print(f"Testing Poyo model '{model}'...")
        status = "FAILED"
        resp_text = ""
        start_time = time.time()
        latency = None
        try:
            payload = {"model": model, "prompt": "Test circle"}
            resp = requests.post("https://api.poyo.ai/v1/images/generations", headers=headers, json=payload, timeout=15)
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                status = "WORKS"
                resp_text = "Success"
            else:
                status = f"FAILED: {resp.status_code}"
                resp_text = resp.text
        except Exception as e:
            status = f"FAILED: {str(e)}"
            resp_text = str(e)
        save_result("Poyo", model, status, resp_text, latency)
        print(f"{model}: {status} ({latency if latency else 'N/A'}ms)")

# ────────────────────────────────────────────────
# Keys (Feb 22, 2026)
# ────────────────────────────────────────────────
PORTKEY_KEY = os.environ.get("PORTKEY_API_KEY", "ST4fIU5r6s6JvLGE/ad2F+8CCCrU")
POYO_KEY = os.environ.get("POYO_API_KEY", "sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79")
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "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")
# Fallback keys if environment variables are missing
if not PORTKEY_KEY: PORTKEY_KEY = "ST4fIU5r6s6JvLGE/ad2F+8CCCrU"
if not POYO_KEY: POYO_KEY = "sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79"
if not OPENROUTER_KEY: OPENROUTER_KEY = "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"

if __name__ == "__main__":
    init_db()
    print("Starting DEEP API TEST (Feb 22, 2026)...")
    
    print("\n[PREVIOUS RESULTS]")
    saved = get_saved_results()
    for row in saved:
        print(f"[{row[5]}] {row[0]} - {row[1]}: {row[2]} ({row[4]}ms)")
    
    test_portkey(PORTKEY_KEY)
    test_poyo(POYO_KEY)
    test_openrouter(OPENROUTER_KEY)
    
    print("\n[WORKABLE MODELS SORTED BY LATENCY]")
    all_results = get_saved_results()
    workable = [r for r in all_results if r[2] == "WORKS" and r[4] is not None]
    workable.sort(key=lambda x: x[4])
    for row in workable:
        print(f"✅ {row[0]} | {row[1]} | {row[4]}ms")
    
    print("\nDone.")
