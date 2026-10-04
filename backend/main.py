import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from hindsight_client import Hindsight
from pydantic import BaseModel

load_dotenv()

BANK_ID = "devbridge-engineering"
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

app = FastAPI(title="DevBridge")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

hindsight = Hindsight(
    base_url=os.getenv("HINDSIGHT_BASE_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY"),
)
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

SENIOR_PROMPT = (
    "You are DevBridge, a senior engineer mentoring a junior engineer. "
    "Answer the way a staff engineer would in a code review: start with the "
    "direct answer, then explain WHY this approach was chosen, then name the "
    "alternative the junior is thinking of and why it was rejected, then say "
    "what to do next. Use short paragraphs and plain text (no markdown "
    "headers). Use ONLY the team knowledge provided for team-specific "
    "decisions, and mention where it came from (incident, post-mortem, "
    "convention). Never invent team decisions. If the team knowledge does not "
    "cover the question, say so, then give general best practice clearly "
    "labelled as general advice. If the junior asked something similar "
    "before, point that out."
)

GENERIC_PROMPT = (
    "You are a helpful coding assistant. You have NO access to this team's "
    "history, decisions or conventions. Answer with general best practice "
    "only, in plain text."
)


class AskRequest(BaseModel):
    question: str
    code: str = ""
    use_memory: bool = True


class RememberRequest(BaseModel):
    text: str
    context: str = "team-knowledge"


@app.get("/")
def home():
    return {"message": "DevBridge backend is running!"}


@app.post("/ask")
def ask(req: AskRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Question is empty.")

    memories: list[str] = []
    if req.use_memory:
        try:
            result = hindsight.recall(bank_id=BANK_ID, query=question)
            memories = [m.text for m in result.results][:6]
        except Exception as e:
            raise HTTPException(502, f"Hindsight recall failed: {e}")

    user_msg = ""
    if req.code:
        user_msg += f"Code the junior is looking at:\n{req.code}\n\n"
    if req.use_memory:
        ctx = "\n".join(f"- {m}" for m in memories) or "(no relevant memories)"
        user_msg += f"Team knowledge:\n{ctx}\n\n"
    user_msg += f"Junior engineer's question:\n{question}"

    try:
        resp = groq.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SENIOR_PROMPT if req.use_memory else GENERIC_PROMPT,
                },
                {"role": "user", "content": user_msg},
            ],
        )
        answer = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(502, f"Groq request failed: {e}")

    # Learn from the interaction: remember what the junior asked about.
    # (We store the question, not the AI answer, so hallucinations don't
    # pollute team memory.)
    if req.use_memory:
        try:
            hindsight.retain(
                bank_id=BANK_ID,
                content=f"Arjun (junior engineer) asked: {question}",
                context="junior-question",
            )
        except Exception as e:
            print("retain failed:", e)

    return {"answer": answer, "memories_used": memories, "memory_on": req.use_memory}


@app.post("/remember")
def remember(req: RememberRequest):
    if not req.text.strip():
        raise HTTPException(400, "Memory text is empty.")
    try:
        hindsight.retain(bank_id=BANK_ID, content=req.text.strip(), context=req.context)
    except Exception as e:
        raise HTTPException(502, f"Hindsight retain failed: {e}")
    return {"ok": True}