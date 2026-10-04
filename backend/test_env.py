from dotenv import load_dotenv
import os

load_dotenv()

base_url = os.getenv("HINDSIGHT_BASE_URL")
api_key = os.getenv("HINDSIGHT_API_KEY")

print("Hindsight URL:", base_url)
print("API key loaded:", bool(api_key))
