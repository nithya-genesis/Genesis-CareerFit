import os
import time
import logging
from typing import List, Dict, Optional, Any

try:
    from groq import Groq
except ImportError:
    Groq = None

logger = logging.getLogger("Genesis_GroqGateway")

class GroqGateway:
    """
    Enterprise Multi-Key Round-Robin Groq Gateway.
    Rotates API keys safely, handles 429/quota limits with cooldown backoff,
    and performs live connectivity health checks without leaking keys.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GroqGateway, cls).__new__(cls)
            cls._instance._init_pool()
        return cls._instance

    def _init_pool(self):
        self.keys: List[str] = []
        self.key_status: Dict[int, float] = {}
        self.current_idx: int = 0
        
        # Active production models on Groq
        self.fallback_models = [
            "llama-3.1-8b-instant",
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]
        self.model: str = os.getenv("GROQ_MODEL", self.fallback_models[0])
        
        # Telemetry stats
        self.total_requests: int = 0
        self.successful_calls: int = 0
        self.failed_calls: int = 0
        self.rate_limited_calls: int = 0
        self.last_success_time: Optional[str] = None
        self.last_failure_time: Optional[str] = None
        self.last_error_msg: Optional[str] = None

        primary = os.getenv("GROQ_API_KEY", "").strip()
        if primary and len(primary) > 10 and not primary.startswith("your_"):
            self.keys.append(primary)

        for i in range(1, 20):
            k = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
            if k and len(k) > 10 and not k.startswith("your_") and k not in self.keys:
                self.keys.append(k)

        multi_str = os.getenv("GROQ_API_KEYS", "").strip()
        if multi_str:
            for k in multi_str.split(","):
                clean_k = k.strip()
                if clean_k and len(clean_k) > 10 and not clean_k.startswith("your_") and clean_k not in self.keys:
                    self.keys.append(clean_k)

        self.clients: Dict[str, Any] = {}
        if Groq:
            for k in self.keys:
                try:
                    self.clients[k] = Groq(api_key=k)
                except Exception as e:
                    logger.warning(f"Failed to initialize Groq client for key: {e}")

    def get_pool_status(self) -> Dict[str, Any]:
        now = time.time()
        healthy_count = len([k for i, k in enumerate(self.keys) if self.key_status.get(i, 0) <= now])
        return {
            "total_keys": len(self.keys),
            "active_keys": healthy_count,
            "failed_keys": len(self.keys) - healthy_count
        }

    def get_usage_metrics(self) -> Dict[str, Any]:
        return {
            "total_requests": self.total_requests,
            "successful_calls": self.successful_calls,
            "failed_calls": self.failed_calls,
            "rate_limited_429_calls": self.rate_limited_calls,
            "configured_keys_count": len(self.keys),
            "active_model": self.model,
            "last_successful_call": self.last_success_time or "No calls executed yet",
            "last_failed_call": self.last_failure_time or "None",
            "last_error": self.last_error_msg or "None"
        }

    def check_live_health(self) -> Dict[str, Any]:
        if not self.keys or not Groq:
            return {
                "provider": "Groq",
                "status": "OFFLINE",
                "badge": "🔴 Groq Offline",
                "model": self.model,
                "configured_keys": 0,
                "healthy_keys": 0,
                "failed_keys": 0,
                "latency_ms": 0,
                "message": "No Groq API keys configured in environment."
            }

        start_t = time.time()
        test_client = None
        key_idx = -1

        for idx, k in enumerate(self.keys):
            if self.key_status.get(idx, 0) <= time.time():
                test_client = self.clients.get(k)
                key_idx = idx
                break

        if not test_client:
            return {
                "provider": "Groq",
                "status": "DEGRADED",
                "badge": "🟡 Groq Degraded",
                "model": self.model,
                "configured_keys": len(self.keys),
                "healthy_keys": 0,
                "failed_keys": len(self.keys),
                "latency_ms": 0,
                "message": "All configured Groq keys are currently in cooldown."
            }

        for target_model in [self.model] + [m for m in self.fallback_models if m != self.model]:
            try:
                res = test_client.chat.completions.create(
                    model=target_model,
                    messages=[{"role": "user", "content": "ping"}],
                    max_tokens=2,
                    temperature=0.0
                )
                self.model = target_model
                latency = int((time.time() - start_t) * 1000)
                self.last_success_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                
                pool_stat = self.get_pool_status()
                return {
                    "provider": "Groq",
                    "status": "ONLINE",
                    "badge": "🟢 Groq Connected",
                    "model": self.model,
                    "configured_keys": pool_stat["total_keys"],
                    "healthy_keys": pool_stat["active_keys"],
                    "failed_keys": pool_stat["failed_keys"],
                    "latency_ms": latency,
                    "message": f"Successfully verified inference connection in {latency}ms ({self.model})."
                }
            except Exception as e:
                err_str = str(e).lower()
                if "model_not_found" in err_str or "does not exist" in err_str or "model_decommissioned" in err_str or "decommissioned" in err_str:
                    continue
                else:
                    self.key_status[key_idx] = time.time() + 60.0
                    self.last_failure_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                    self.last_error_msg = str(e)
                    break

        pool_stat = self.get_pool_status()
        status_label = "DEGRADED" if pool_stat["active_keys"] > 0 else "OFFLINE"
        badge_label = "🟡 Groq Degraded" if pool_stat["active_keys"] > 0 else "🔴 Groq Offline"
        
        return {
            "provider": "Groq",
            "status": status_label,
            "badge": badge_label,
            "model": self.model,
            "configured_keys": pool_stat["total_keys"],
            "healthy_keys": pool_stat["active_keys"],
            "failed_keys": pool_stat["failed_keys"],
            "latency_ms": 0,
            "message": f"API verification failed: {self.last_error_msg or 'Selected model unavailable'}"
        }

    def _get_next_client(self) -> Optional[tuple]:
        if not self.keys or not Groq:
            return None

        total = len(self.keys)
        now = time.time()

        for _ in range(total):
            idx = self.current_idx % total
            self.current_idx += 1

            cooldown = self.key_status.get(idx, 0)
            if cooldown <= now:
                key = self.keys[idx]
                client = self.clients.get(key)
                if client:
                    return idx, client

        return None

    def generate_interpretation(self, prompt: str, system_prompt: str = "") -> str:
        self.total_requests += 1
        if not self.keys:
            self.failed_calls += 1
            return "AI Interpretation Not Available: No Groq API keys configured."

        retries = len(self.keys) + 1

        for _ in range(retries):
            selected = self._get_next_client()
            if not selected:
                break

            idx, client = selected
            for target_model in [self.model] + [m for m in self.fallback_models if m != self.model]:
                try:
                    messages = []
                    if system_prompt:
                        messages.append({"role": "system", "content": system_prompt})
                    messages.append({"role": "user", "content": prompt})

                    response = client.chat.completions.create(
                        model=target_model,
                        messages=messages,
                        temperature=0.3,
                        max_tokens=1000
                    )
                    self.model = target_model
                    self.successful_calls += 1
                    self.last_success_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                    return response.choices[0].message.content.strip()

                except Exception as e:
                    err_str = str(e).lower()
                    if "model_not_found" in err_str or "does not exist" in err_str or "model_decommissioned" in err_str or "decommissioned" in err_str:
                        continue
                    
                    self.last_failure_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                    self.last_error_msg = str(e)
                    
                    if "429" in err_str or "rate_limit" in err_str or "quota" in err_str:
                        self.rate_limited_calls += 1
                        self.key_status[idx] = time.time() + 60.0
                    else:
                        self.key_status[idx] = time.time() + 15.0
                    break

        self.failed_calls += 1
        return "AI Interpretation Unavailable: Groq API gateway limit reached. All deterministic metrics remain verified."
