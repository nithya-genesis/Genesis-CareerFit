import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_API_KEY_1 = os.getenv("GROQ_API_KEY_1", "")
    GROQ_API_KEY_2 = os.getenv("GROQ_API_KEY_2", "")
    GROQ_API_KEY_3 = os.getenv("GROQ_API_KEY_3", "")
    OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")
