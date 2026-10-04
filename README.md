# 🧠 DevBridge — Engineering Knowledge That Learns

> An AI engineering knowledge assistant that learns from senior developers and makes team experience available to junior developers.

## 🚀 Problem

Engineering teams often depend on senior developers for architecture decisions,
code-review knowledge, debugging experience, and team-specific practices.

When that knowledge is not documented, junior developers repeatedly ask the
same questions and senior developers repeatedly explain the same things.

DevBridge solves this by creating a persistent engineering memory for the team.

## 💡 Solution

DevBridge captures engineering knowledge from senior developers and stores it
using Hindsight.

When a junior developer asks a question, DevBridge:

1. Recalls relevant team knowledge from Hindsight
2. Provides that knowledge as context to the AI
3. Generates an answer using Groq
4. Returns the answer together with the memories used

Over time, the assistant becomes more aligned with the team's engineering
decisions and practices.

## 🧠 Why Hindsight?

Hindsight is the memory layer of DevBridge.

Instead of treating every conversation as a new conversation, DevBridge can
retain and recall engineering knowledge such as:

- Architecture decisions
- Senior developer explanations
- Code-review lessons
- Engineering practices
- Previous solutions
- Team-specific decisions

This allows the AI to answer based on the team's accumulated experience.

## 🏗️ Architecture

Frontend
→ Next.js
→ FastAPI
→ Hindsight Memory
→ Groq LLM
→ Response

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- Uvicorn

### AI & Memory
- Hindsight
- Groq
- OpenAI GPT-OSS 120B

### Development
- Git
- GitHub
- VS Code

## ✨ Features

### Ask DevBridge
Junior developers can ask engineering questions and receive answers based on
team memory.

### Team Memory
DevBridge retrieves relevant engineering knowledge using Hindsight.

### Senior Knowledge Capture
Engineering decisions and explanations can become persistent team knowledge.

### Explain Engineering Decisions
Instead of only giving an answer, DevBridge can explain the reasoning behind
team-specific decisions.

## 🎯 Example

A senior engineer teaches DevBridge:

> We use Redis for session storage because sessions are temporary and require
> fast reads.

Later, a junior developer asks:

> Why does our team use Redis for session storage?

DevBridge recalls the previous engineering knowledge and provides a
team-specific answer.

## 🔄 Learning Loop

Senior Developer
↓
Engineering Knowledge
↓
Hindsight
↓
DevBridge
↓
Junior Developer
↓
Questions & Feedback
↓
Hindsight
↓
Improved Team Knowledge

## 📂 Project Structure

devbridge/

├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── seed.py
│   ├── test_hindsight.py
│   ├── test_groq.py
│   └── test_env.py
│
└── .gitignore

## ⚙️ Local Setup

### 1. Clone the repository

git clone https://github.com/mohammedzahoorhussain/DevBridge.git

cd DevBridge

### 2. Backend

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

Create a `.env` file:

HINDSIGHT_BASE_URL=your_hindsight_url
HINDSIGHT_API_KEY=your_hindsight_key
GROQ_API_KEY=your_groq_key

Start the backend:

uvicorn main:app --reload

### 3. Frontend

Open another terminal:

cd frontend

npm install

npm run dev

Open:

http://localhost:3000

## 🔐 Security

API keys are stored in environment variables and are excluded from Git using
`.gitignore`.

Never commit `.env` files or API keys to GitHub.

## 🏆 Hackathon

DevBridge was built around the theme:

**AI Agents That Learn Using Hindsight**

The project focuses on making engineering knowledge persistent,
retrievable, and useful across developer interactions.

## 👨‍💻 Author

Mohammed Zahoor Hussain

GitHub:
https://github.com/mohammedzahoorhussain
