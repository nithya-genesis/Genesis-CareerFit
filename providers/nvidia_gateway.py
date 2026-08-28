import os
import re
import time
import logging
from typing import Dict, Any, Optional

try:
    from openai import OpenAI, APIError
except ImportError:
    OpenAI = None
    APIError = Exception

logger = logging.getLogger("Genesis_NvidiaGateway")

class NvidiaGateway:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NvidiaGateway, cls).__new__(cls)
            cls._instance._init_client()
        return cls._instance

    def _init_client(self):
        self.api_key = os.getenv("NVIDIA_API_KEY", "").strip()
        self.model = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
        self.base_url = "https://integrate.api.nvidia.com/v1"
        self.client = None

        if OpenAI and self.api_key:
            try:
                self.client = OpenAI(base_url=self.base_url, api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client for NVIDIA: {e}")

        # Telemetry
        self.total_requests = 0
        self.successful_calls = 0
        self.failed_calls = 0
        self.last_success_time = None
        self.last_failure_time = None
        self.last_error_msg = None

    def check_live_health(self) -> Dict[str, Any]:
        if not self.client:
            return {
                "provider": "NVIDIA NIM",
                "status": "OFFLINE",
                "badge": "🔴 AI Offline",
                "model": self.model,
                "latency_ms": 0,
                "message": "NVIDIA_API_KEY is not configured or OpenAI client missing."
            }

        start_t = time.time()
        try:
            res = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5,
                temperature=0.1
            )
            latency = int((time.time() - start_t) * 1000)
            self.last_success_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            return {
                "provider": "NVIDIA NIM",
                "status": "ONLINE",
                "badge": "🟢 AI Connected (Nemotron)",
                "model": self.model,
                "latency_ms": latency,
                "message": f"Successfully verified inference connection in {latency}ms."
            }
        except Exception as e:
            self.last_failure_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            self.last_error_msg = str(e)
            return {
                "provider": "NVIDIA NIM",
                "status": "OFFLINE",
                "badge": "🔴 AI Offline",
                "model": self.model,
                "latency_ms": 0,
                "message": f"API verification error: {str(e)}"
            }

    def generate_interpretation(self, prompt: str, system_prompt: str = "You are a professional placement intelligence and talent analytics expert.") -> str:
        self.total_requests += 1
        if not self.client:
            self.failed_calls += 1
            return "AI Interpretation Not Available: NVIDIA_API_KEY is not configured."

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                top_p=0.95,
                max_tokens=2048,
                extra_body={
                    "chat_template_kwargs": {"enable_thinking": False},
                    "reasoning_budget": 0
                }
            )

            raw_text = response.choices[0].message.content or ""
            # Strip reasoning tags if returned by model
            cleaned_text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()

            self.successful_calls += 1
            self.last_success_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            return cleaned_text if cleaned_text else raw_text.strip()

        except Exception as e:
            self.failed_calls += 1
            self.last_failure_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            self.last_error_msg = str(e)
            return f"AI Interpretation Unavailable: {str(e)}"
