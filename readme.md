This project has a fun architecture now because it’s no longer just a quiz UI, it’s a full retrieval-backed learning system with a graceful offline fallback.

Big Picture
The app has three moving parts that work together:

Frontend quiz experience in React/Vite
Files:
App.jsx
useQuiz.js
data.js
Backend API in FastAPI
Files:
main.py
RAG data pipeline and retrieval layer
Files:
ingest.py
retriever.py
embeddings.py
dataset.json
At runtime, the frontend shows the quiz, the backend serves questions and explanations, and ChromaDB stores the indexed knowledge used for retrieval.

Frontend Flow
When the app opens, no domain is preselected. The user must choose a domain first, which is intentional because domain selection is the primary control surface.

The domain cards come from data.js. Those cards only contain UI metadata now:

domain id
label
icon
description
styling accents
The actual quiz questions do not come from the frontend anymore. Once a user selects a domain, useQuiz.js calls:

GET /api/questions?genre=...
That endpoint returns all questions for that domain from dataset.json, and the hook shuffles them before starting the quiz. That is why the quiz is now dynamic and no longer stuck at 3 mock questions.

Inside the quiz flow:

the selected domain controls which question bank is loaded
questions are randomized
user selects an option
clicking “Analyze Answer” triggers the explanation flow
the insight panel shows grounded explanation, confidence score, citations, and the follow-up AI box
The UI is mostly orchestrated in App.jsx, while useQuiz.js owns the state transitions.

Backend API Flow
The FastAPI app in main.py exposes the main endpoints:

GET /health
Basic health check.

GET /api/questions?genre=...
Reads dataset.json directly and returns frontend-ready question objects.

POST /api/explain
Accepts:

{
  "question_id": "str",
  "question_text": "str",
  "user_answer": "str",
  "genre": "str"
}
This route calls get_quiz_explanation(...) in retriever.py.

POST /api/followup
Accepts a user’s follow-up query from the Insight panel and generates a Gemini-powered clarification answer using the original explanation plus retrieved context.
So the backend has two roles:

serve quiz content
run retrieval + explanation/generation
How the RAG Part Works
RAG means Retrieval-Augmented Generation. In this project that works like this:

Your raw quiz data lives in dataset.json
The ingestion pipeline reads that file
Each question is converted into an embedding text:
question
correct answer
explanation context
That text is embedded into a vector
The vectors are stored in ChromaDB, grouped by genre
Later, when the user asks for an explanation, the backend retrieves the most relevant records from Chroma
Those retrieved chunks are passed into Gemini, which generates a grounded answer
That means the model is not answering from pure memory. It first gets relevant supporting context from your own dataset.

Why Ingestion Exists
This is the part that usually feels weird at first.

dataset.json is just raw structured data. ChromaDB cannot do semantic retrieval over plain JSON unless those records are first converted into vectors.

That’s what ingestion does:

load dataset
validate schema
convert records into searchable semantic form
store them in persistent Chroma collections
Without ingestion:

the quiz UI can still load questions from dataset.json
but /api/explain would not have indexed vector data to retrieve from
so you would lose the real RAG behavior
So:

dataset.json = source of truth
chroma_db = searchable memory built from that source
Ingestion Pipeline
The script is ingest.py.

It does these steps:

Load .env
Read dataset.json
Validate required fields
Group questions by genre
Build a Document for each row
Create or refresh Chroma collections for each genre
Write vectors into persistent storage
Collections end up like:

ai_systems
world_history
indian_literature
space_cosmology
general_science
geography
So when retrieval happens, the system searches only inside the selected domain’s collection.

Embeddings and Fallback Modes
The embedding strategy lives in embeddings.py.

This was added because Google’s embedding API was intermittently unavailable in your environment.

You now have three embedding modes:

EMBEDDING_PROVIDER=google
Force Google embeddings.

EMBEDDING_PROVIDER=local
Force local deterministic hash embeddings.

EMBEDDING_PROVIDER=auto
Try Google first, then fall back to local if Google fails.

That makes ingestion robust. Even if Gemini/Google embedding endpoints are down, you can still build the Chroma database locally.

Explanation Flow
The explanation logic lives in retriever.py.

When the frontend posts to /api/explain, this happens:

Selected genre is normalized into a Chroma collection name
The question text is embedded
Chroma performs similarity search and returns top matching documents
The system builds context + citations from those documents
Gemini is prompted to explain whether the answer is correct using only retrieved context
The backend returns:
{
  "is_correct": true,
  "explanation": "...",
  "confidence_score": 0.84,
  "citations": [
    { "source": "...", "page": "...", "snippet": "..." }
  ]
}
That exact shape is what the frontend insight drawer expects.

Offline Explanation Fallback
There is also an important resilience feature.

If live Gemini generation fails, retriever.py falls back to a retrieval-only explanation. In that case:

Chroma retrieval still works
the backend compares the user answer to the retrieved correct answer
a simpler explanation is returned from the retrieved metadata
confidence is set lower
So even without live generation, the app remains usable.

Follow-up AI Box
The follow-up box inside the Grounded Explanation card is now another backend-driven feature.

Flow:

User asks a follow-up in the Insight panel
Frontend posts to /api/followup
Backend retrieves relevant context from Chroma again
Gemini answers the follow-up using:
original question
grounded explanation
retrieved context
Response is shown inside the same card with internal scrolling
This gives the project a more tutor-like feel rather than just “correct/incorrect” feedback.

Current Data Setup
Your main knowledge source is dataset.json.

That file now contains:

initial hand-authored seed questions
additional web-backed records
merged bulk questions from quiz-datasets
So the user-facing quiz is now backed by the same dataset that powers retrieval, which is the right architecture for consistency.

How It Runs End-to-End
Typical runtime looks like this:

Backend starts
uvicorn server.main:app --reload --port 8000
Frontend starts
npm.cmd run dev
User journey
open app
select domain
frontend fetches questions from /api/questions
user answers
frontend calls /api/explain
backend retrieves from Chroma
Gemini or fallback returns grounded explanation
user can ask follow-ups through /api/followup
What’s Working vs What’s Fallback
Right now the project is in a strong “hybrid” state:

Working:

frontend UI
dynamic domain-based question loading
ingestion into Chroma
retrieval from Chroma
offline-safe explanations
follow-up text box
live FastAPI endpoints
Conditional:

Google embeddings and Gemini generation depend on external API connectivity and key validity
So the system is not fragile anymore. If cloud services are available, it behaves like full RAG with generation. If they are not, it degrades into retrieval-backed local mode instead of breaking.

One Important Distinction
This app now has two data paths:

Questions shown in the quiz come from dataset.json via /api/questions
Explanations come from Chroma retrieval via /api/explain
That split is intentional:

question serving is simple and deterministic
explanation generation is semantic and retrieval-aware
It keeps quiz rendering fast while preserving real RAG behavior for reasoning.

If you want, the next useful thing I can do is either:

trace one complete request from click to answer with exact file references, or
draw the whole architecture as a simple text diagram for your report or viva.


workflow:
Great question for this stage, because your app now has a clean RAG loop that’s easy to reason about end-to-end.

RAG Workflow

Knowledge source

Raw questions/explanations live in dataset.json.
Ingestion step

data_pipeline/ingest.py reads each record and builds embedding text from:
question
correct_answer
explanation_context
It stores vectors in Chroma collections by genre (ai_systems, world_history, etc.) under local chroma_db/.
Embedding provider selection

data_pipeline/embeddings.py chooses embedding mode:
google (Gemini embeddings)
local (deterministic local hash embeddings)
auto (try Google, fallback local)
Question serving (frontend data feed)

Frontend asks GET /api/questions?genre=... from server/main.py.
This endpoint serves quiz questions from dataset.json so users can start instantly.
Retrieval + explanation

On answer submit, frontend calls POST /api/explain.
data_pipeline/retriever.py:
embeds user question
retrieves top relevant chunks from Chroma
builds citations/snippets
prompts gemini-2.5-flash with retrieved context to produce grounded explanation
Fallback behavior

If Gemini generation is unavailable, retriever returns a retrieval-based fallback response (still grounded in indexed context), with lower confidence.
Follow-up QA

Insight panel follow-up sends POST /api/followup.
Backend retrieves context again and generates a follow-up answer with citations.
Why this is true RAG

Retrieval is from vector DB (Chroma), not plain keyword matching.
Generation is conditioned on retrieved context.
Responses include evidence/citations from retrieved chunks.

QUIZ/
├── .env
├── .gitignore
├── answer.svg
├── dataset.json
├── index.html
├── package.json
├── package-lock.json
├── requirements.txt
├── vite.config.js
├── chroma_db/                     # Generated local vector DB (not for git)
├── data_pipeline/
│   ├── embeddings.py              # Embedding provider selection (google/local/auto)
│   ├── ingest.py                  # JSON -> embeddings -> Chroma ingestion
│   └── retriever.py               # Retrieval + explain + follow-up generation
├── server/
│   └── main.py                    # FastAPI app and API routes
├── src/
│   ├── App.jsx                    # Main UI + insight/follow-up panel
│   ├── data.js                    # Domain card metadata (icons, labels, styles)
│   ├── main.jsx                   # React entrypoint
│   ├── styles.css                 # Global styles
│   └── useQuiz.js                 # Quiz state, backend question loading, flow logic
├── public/
│   └── favicon.svg
├── quiz-datasets/                 # Uploaded source datasets (csv/json)
└── dist/                          # Vite production build output (generated)


architecture:
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React/Vite)                          │
│  src/App.jsx + src/useQuiz.js + src/data.js                                 │
│                                                                              │
│  1) User selects Domain                                                      │
│  2) GET /api/questions?genre=...                                             │
│  3) User answers question                                                    │
│  4) POST /api/explain                                                        │
│  5) (Optional) POST /api/followup                                            │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ HTTP (JSON)
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER (FastAPI)                              │
│  server/main.py                                                              │
│                                                                              │
│  Routes:                                                                     │
│  - GET  /health                                                              │
│  - GET  /api/questions                                                       │
│  - POST /api/explain                                                         │
│  - POST /api/followup                                                        │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        RETRIEVAL / ORCHESTRATION                            │
│  data_pipeline/retriever.py                                                  │
│                                                                              │
│  Explain flow:                                                               │
│  - Embed incoming query                                                      │
│  - Similarity search (top-k) in Chroma by genre                              │
│  - Build grounded context + citations                                        │
│  - Send prompt to Gemini (if available)                                      │
│  - Return schema: is_correct, explanation, confidence_score, citations       │
│                                                                              │
│  Follow-up flow:                                                             │
│  - Use original question + grounded explanation + followup query             │
│  - Retrieve again from Chroma                                                │
│  - Generate follow-up response + citations                                   │
└───────────────────────┬───────────────────────────────┬──────────────────────┘
                        │                               │
                        │ vector retrieval              │ generation
                        ▼                               ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│   VECTOR STORE (ChromaDB)     │             │   LLM / EMBEDDINGS (Gemini)   │
│   local persistent: chroma_db │             │   - gemini-2.5-flash          │
│   collections per genre       │             │   - text-embedding-001         │
└───────────────┬───────────────┘             └───────────────┬───────────────┘
                │                                             │
                └───────────────┬─────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION PIPELINE                                │
│  data_pipeline/ingest.py + data_pipeline/embeddings.py                      │
│                                                                              │
│  Source: dataset.json                                                        │
│  Steps:                                                                      │
│  - Validate required fields                                                  │
│  - Build embedding text: question + correct_answer + explanation_context     │
│  - Embed (provider: google/local/auto)                                      │
│  - Store in Chroma collection by genre                                       │
└──────────────────────────────────────────────────────────────────────────────┘

Data Contracts (Report-Friendly)

GET /api/questions returns quiz items used by UI.
POST /api/explain returns:
is_correct: bool
explanation: str
confidence_score: float (0..1)
citations: [{source, page, snippet}]
POST /api/followup returns:
answer: str
citations: [{source, page, snippet}]
Operational Modes

EMBEDDING_PROVIDER=google|local|auto
GENERATION_PROVIDER=local|auto
This gives resilient behavior:

Full RAG when Google is reachable.
Retrieval-grounded fallback when cloud endpoints are unavailable.