import os
from typing import Generator, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI, APIError

load_dotenv()

class NemotronService:
    def __init__(self, model_name: str = "nvidia/nemotron-3.5-lightning-30b-a3b"):
        api_key = os.getenv("NVIDIA_API_KEY")
        if not api_key:
            raise ValueError("NVIDIA_API_KEY environment variable is missing.")
            
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key
        )
        self.model_name = model_name

    def generate_stream(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful AI assistant.",
        temperature: float = 0.7,
        top_p: float = 0.95,
        max_tokens: int = 4096,
        reasoning_budget: int = 2048,
        enable_thinking: bool = True
    ) -> Generator[Dict[str, str], None, None]:
        """
        Yields chunks containing either 'reasoning' (CoT) or final 'content'.
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        extra_body: Dict[str, Any] = {}
        if enable_thinking:
            extra_body = {
                "chat_template_kwargs": {"enable_thinking": True},
                "reasoning_budget": reasoning_budget
            }

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                extra_body=extra_body if extra_body else None,
                stream=True
            )

            for chunk in response:
                if not chunk.choices:
                    continue
                
                delta = chunk.choices[0].delta
                
                # Check for chain-of-thought/reasoning tokens
                reasoning = getattr(delta, "reasoning_content", None)
                if reasoning:
                    yield {"type": "reasoning", "chunk": reasoning}

                # Check for final content tokens
                if delta.content is not None:
                    yield {"type": "content", "chunk": delta.content}

        except APIError as e:
            yield {"type": "error", "chunk": f"API Error: {str(e)}"}
        except Exception as e:
            yield {"type": "error", "chunk": f"Unexpected error: {str(e)}"}
