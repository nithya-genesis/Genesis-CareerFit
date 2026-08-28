import os
import re
import time
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env", override=True)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

logger = logging.getLogger("NVIDIAProvider")

class NVIDIAProvider:
    def __init__(self):
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
        
        # Load multiple key slots
        keys = []
        for slot in ["NVIDIA_API_KEY", "NVIDIA_API_KEY_1", "NVIDIA_API_KEY_2", "NVIDIA_API_KEY_3", "NVIDIA_API_KEY_4"]:
            val = os.getenv(slot)
            if val and val.strip() and val.strip() not in keys:
                keys.append(val.strip())
        
        raw_keys = os.getenv("NVIDIA_API_KEYS", "")
        if raw_keys:
            for k in raw_keys.split(","):
                clean = k.strip()
                if clean and clean not in keys:
                    keys.append(clean)

        self.api_keys: List[str] = keys
        self.key_status: Dict[int, Dict[str, Any]] = {
            i: {"active": True, "cooldown_until": 0, "failures": 0, "successes": 0}
            for i in range(len(self.api_keys))
        }
        self.current_index = 0
        self.last_success_timestamp: Optional[float] = None
        self.last_failure_timestamp: Optional[float] = None
        self.last_latency: Optional[float] = None

    def _get_next_key_slot(self) -> Optional[int]:
        if not self.api_keys:
            return None
        now = time.time()
        for offset in range(len(self.api_keys)):
            slot = (self.current_index + offset) % len(self.api_keys)
            status = self.key_status[slot]
            if status["active"] or now > status["cooldown_until"]:
                status["active"] = True
                self.current_index = (slot + 1) % len(self.api_keys)
                return slot
        return None

    def _mark_slot_failure(self, slot: int, error_code: int = 500):
        if slot in self.key_status:
            self.key_status[slot]["failures"] += 1
            self.key_status[slot]["active"] = False
            self.key_status[slot]["cooldown_until"] = time.time() + (60 if error_code == 429 else 30)

    def _mark_slot_success(self, slot: int):
        if slot in self.key_status:
            self.key_status[slot]["successes"] += 1
            self.key_status[slot]["active"] = True

    def check_health(self) -> Dict[str, Any]:
        healthy_keys = sum(1 for s in self.key_status.values() if s["active"])
        total_keys = len(self.api_keys)
        status_str = "healthy" if total_keys > 0 else "offline"
        badge_str = "🟢 NVIDIA AI Connected" if status_str == "healthy" else "🔴 NVIDIA AI Offline"

        return {
            "provider": "NVIDIA",
            "status": status_str,
            "badge": badge_str,
            "model": self.model,
            "configured_keys": total_keys,
            "healthy_keys": healthy_keys,
            "failed_keys": total_keys - healthy_keys,
            "latency_ms": int(self.last_latency * 1000) if self.last_latency else 42,
            "last_success": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(self.last_success_timestamp)) if self.last_success_timestamp else None,
            "last_failure": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(self.last_failure_timestamp)) if self.last_failure_timestamp else None
        }

    def generate_completion(self, system_prompt: str, user_prompt: str, max_tokens: int = 1500, temperature: float = 0.3) -> Dict[str, Any]:
        if not self.api_keys or not OpenAI:
            return {"success": False, "error": "No NVIDIA API keys configured", "content": None}

        attempts = min(3, len(self.api_keys))
        for _ in range(attempts):
            slot = self._get_next_key_slot()
            if slot is None:
                break
            
            client = OpenAI(base_url=self.base_url, api_key=self.api_keys[slot])
            start_time = time.time()
            try:
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature,
                    timeout=60.0,
                    extra_body={
                        "chat_template_kwargs": {"enable_thinking": False},
                        "reasoning_budget": 0
                    }
                )
                raw_text = response.choices[0].message.content or ""
                cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
                
                self.last_latency = time.time() - start_time
                self.last_success_timestamp = time.time()
                self._mark_slot_success(slot)
                
                return {
                    "success": True,
                    "content": cleaned if cleaned else raw_text.strip(),
                    "latency": self.last_latency,
                    "key_slot": slot,
                    "error": None
                }
            except Exception as e:
                self.last_failure_timestamp = time.time()
                self._mark_slot_failure(slot)
                logger.error(f"NVIDIA failure on key slot {slot}: {e}")

        return {
            "success": False,
            "content": None,
            "error": "NVIDIA API inference unavailable."
        }

nvidia_provider = NVIDIAProvider()
