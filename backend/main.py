from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client
from pathlib import Path
import os
import json

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ─── RAG Knowledge Base ────────────────────────────────────────────────────────
# These are your automation playbooks stored in memory for the MVP.
# In production these would live in Pinecone and be retrieved via embeddings.
PLAYBOOKS = [
    {
        "id": "gmail-filters",
        "tool": "Gmail",
        "title": "Auto-sort and respond to emails with Gmail filters",
        "tags": ["email", "gmail", "communication", "responses"],
        "guide": """Step-by-step: Auto-sort and respond to emails with Gmail filters

WHAT YOU'LL AUTOMATE
Emails that always get the same response or need to land in specific folders will be handled automatically — no manual sorting or typing required.

STEP 1 — Open Gmail Settings
Click the gear icon (top right) → See all settings → Filters and Blocked Addresses tab.

STEP 2 — Create your first filter
Click "Create a new filter". In the "From" field, add the email address or domain you want to filter (e.g. newsletters@company.com or *@linkedin.com).

STEP 3 — Choose what happens
Click "Create filter". Check:
• "Skip the Inbox" — removes it from clutter
• "Apply the label" — creates folders automatically
• "Send template" — auto-replies with a saved response (enable Templates in Advanced settings first)

STEP 4 — Create a canned response (template)
Go to Settings → Advanced → Enable Templates. Compose a reply you send often. Click the three dots in compose → Templates → Save draft as template.

STEP 5 — Test it
Send yourself a test email from the filtered address and confirm it lands in the right place.

TIME TO SET UP: ~20 minutes
ESTIMATED WEEKLY SAVINGS: 1–3 hours"""
    },
    {
        "id": "sheets-automation",
        "tool": "Google Sheets",
        "title": "Auto-generate reports with Google Sheets formulas and macros",
        "tags": ["reports", "data", "spreadsheet", "google sheets", "weekly report"],
        "guide": """Step-by-step: Auto-generate weekly reports in Google Sheets

WHAT YOU'LL AUTOMATE
Your weekly data copy-paste and report formatting will run itself — the sheet pulls live data and formats it automatically.

STEP 1 — Set up your data source tab
Create a tab called "Raw Data". Paste your data source here (or connect via Zapier later). This is your single source of truth.

STEP 2 — Build your report tab with formulas
Create a "Report" tab. Use these formulas:
• =IMPORTRANGE("spreadsheet_url", "Sheet1!A1:D100") — pulls data from another sheet automatically
• =SUMIF(range, criteria, sum_range) — totals by category without manual counting
• =QUERY(data, "SELECT A, SUM(B) GROUP BY A") — builds pivot-style summaries instantly

STEP 3 — Add conditional formatting
Select your data range → Format → Conditional formatting. Set rules like "if value < 100, highlight red" so problems are visible at a glance.

STEP 4 — Schedule automatic emails with Apps Script
Go to Extensions → Apps Script. Paste this:
function sendReport() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var pdf = DriveApp.getFileById(sheet.getId());
  GmailApp.sendEmail("boss@company.com", "Weekly Report", "See attached", {attachments: [pdf.getAs("application/pdf")]});
}
Then set a trigger: clock icon → Add trigger → weekly on Monday 9am.

TIME TO SET UP: ~45 minutes
ESTIMATED WEEKLY SAVINGS: 2–4 hours"""
    },
    {
        "id": "zapier-workflow",
        "tool": "Zapier",
        "title": "Connect apps automatically with Zapier — no code required",
        "tags": ["zapier", "integration", "workflow", "copy data", "sync", "notifications"],
        "guide": """Step-by-step: Connect your apps with Zapier

WHAT YOU'LL AUTOMATE
Any time something happens in one app (a new email, a form submission, a Slack message), Zapier automatically does something in another app — with zero manual work.

STEP 1 — Create a free Zapier account
Go to zapier.com → sign up free. Free plan supports 5 automations (called "Zaps").

STEP 2 — Create your first Zap
Click "Create Zap". Choose your TRIGGER — the app and event that starts everything.
Example trigger: "New email in Gmail matching filter"

STEP 3 — Add your ACTION
Choose what should happen automatically.
Example action: "Create row in Google Sheets" or "Send Slack message"

STEP 4 — Map the fields
Zapier shows you the data from your trigger. Drag fields into the action fields.
Example: map email subject → spreadsheet column A, email sender → column B.

STEP 5 — Test and turn on
Click "Test step" to confirm it works. Then click "Publish Zap". Done — it runs forever automatically.

POPULAR ZAP COMBOS FOR YOUR ROLE:
• New Gmail → Log to Google Sheets (track all inbound requests)
• Slack message with keyword → Create Notion task (capture action items)
• Form submission → Send welcome email (onboarding automation)
• New spreadsheet row → Send Slack notification (alert the team)

TIME TO SET UP: ~30 minutes
ESTIMATED WEEKLY SAVINGS: 2–5 hours"""
    },
    {
        "id": "slack-automation",
        "tool": "Slack",
        "title": "Automate Slack notifications and status updates",
        "tags": ["slack", "notifications", "status", "messages", "team updates"],
        "guide": """Step-by-step: Automate Slack with workflows and integrations

WHAT YOU'LL AUTOMATE
Stop manually posting status updates, reminders, and notifications in Slack. Set them up once and they run automatically.

STEP 1 — Open Slack Workflow Builder
In Slack, click your workspace name → Tools → Workflow Builder. Click "New Workflow".

STEP 2 — Choose a trigger
Options include:
• Scheduled time (e.g. every Monday 9am)
• Someone joins a channel
• A shortcut is clicked
• A webhook from another app

STEP 3 — Build your workflow steps
Add steps like:
• "Send a message" — auto-post your weekly standup prompt
• "Collect information" — create a form that saves responses
• "Send a message to person" — DM someone automatically

STEP 4 — Connect to other apps
Go to the Slack App Directory and add:
• Google Calendar — posts reminders when meetings start
• GitHub — posts when PRs are merged
• Zapier — connects Slack to anything else

STEP 5 — Set it live
Click Publish. Test by triggering it manually first.

TIME TO SET UP: ~25 minutes
ESTIMATED WEEKLY SAVINGS: 1–2 hours"""
    },
    {
        "id": "notion-database",
        "tool": "Notion",
        "title": "Automate task tracking and project management in Notion",
        "tags": ["notion", "tasks", "project management", "tracking", "database"],
        "guide": """Step-by-step: Automate your work tracking with Notion

WHAT YOU'LL AUTOMATE
Stop manually updating task statuses, copying meeting notes, and tracking project progress. Notion databases + automations handle it.

STEP 1 — Build a proper Notion database
Create a new page → Choose "Table" view. Add these properties:
• Status (Select: Not started / In progress / Done)
• Assignee (Person)
• Due date (Date)
• Priority (Select: High / Medium / Low)

STEP 2 — Set up Notion Automations (built-in)
Click the lightning bolt icon at the top of your database. Create rules like:
• When Status changes to "Done" → Set completion date to today
• When Due date is today → Send reminder to assignee
• When new row added → Set Status to "Not started" automatically

STEP 3 — Connect Notion to your other tools via Zapier
• New Slack message → Create Notion task
• Notion task marked Done → Post to Slack
• New email → Create Notion note

STEP 4 — Create a template for recurring tasks
Open any page → click ••• → "Turn into template". Now every new task starts pre-formatted.

STEP 5 — Build a weekly review view
Add a filtered view: Status ≠ Done AND Due date = this week. Bookmark it — your weekly review is automated.

TIME TO SET UP: ~40 minutes
ESTIMATED WEEKLY SAVINGS: 2–3 hours"""
    },
]

def rag_retrieve(task_name: str, tool: str, repeated_tasks: str) -> str:
    """
    RAG retrieval: find the most relevant playbook for a given task.
    In production this would use vector embeddings + Pinecone similarity search.
    For MVP we use keyword matching against the knowledge base.
    """
    query = f"{task_name} {tool} {repeated_tasks}".lower()
    
    best_match = None
    best_score = 0
    
    for playbook in PLAYBOOKS:
        score = 0
        # Score by tool match
        if playbook["tool"].lower() in query:
            score += 10
        # Score by tag matches
        for tag in playbook["tags"]:
            if tag in query:
                score += 3
        # Score by title word matches
        for word in playbook["title"].lower().split():
            if len(word) > 4 and word in query:
                score += 1
        
        if score > best_score:
            best_score = score
            best_match = playbook
    
    # Return the matched playbook guide, or a generic one
    if best_match and best_score > 2:
        return best_match["guide"]
    return None


# ─── Models ────────────────────────────────────────────────────────────────────

class InterviewInput(BaseModel):
    job_title: str
    industry: str
    tools_used: str
    repeated_tasks: str
    tech_comfort: int
    hours_wasted: int

class GuideRequest(BaseModel):
    user_id: str
    task_index: int
    tasks: list


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "AutomateMe API is running"}


@app.post("/interview")
def submit_interview(data: InterviewInput):
    # Save user to Supabase
    user = supabase.table("users").insert({
        "job_title": data.job_title,
        "industry": data.industry,
        "tools_used": data.tools_used,
        "repeated_tasks": data.repeated_tasks,
        "tech_comfort": data.tech_comfort,
        "hours_wasted": data.hours_wasted
    }).execute()

    user_id = user.data[0]["id"]

    # Build prompt — ask for structured JSON output
    prompt = f"""You are an AI automation coach for non-technical professionals.

A user has described their job. Identify their top 3 most automatable tasks.

User profile:
- Job title: {data.job_title}
- Industry: {data.industry}  
- Tools they use: {data.tools_used}
- Repeated tasks: {data.repeated_tasks}
- Tech comfort (1-5): {data.tech_comfort}
- Hours wasted per week: {data.hours_wasted}

Respond ONLY with a valid JSON array. No other text. Format:
[
  {{
    "name": "Task name (short, clear)",
    "reason": "One sentence why this can be automated",
    "tool": "Best free tool to use",
    "hours_saved": 2,
    "difficulty": "Easy"
  }}
]

Rules:
- difficulty must be exactly "Easy", "Medium", or "Hard" — match to their tech_comfort level
- hours_saved must be a number (integer)
- tool must be one they already use or a free tool
- Keep names under 6 words
- Keep reasons under 20 words"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    
    # Clean and parse JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    tasks = json.loads(raw)

    return {
        "user_id": user_id,
        "tasks": tasks
    }


@app.post("/guide")
def get_guide(data: GuideRequest):
    task = data.tasks[data.task_index]
    task_name = task.get("name", "")
    tool = task.get("tool", "")
    
    # ── RAG: retrieve relevant playbook from knowledge base ──
    retrieved_context = rag_retrieve(task_name, tool, task_name)
    
    if retrieved_context:
        # We have a matching playbook — use it as context for the AI
        prompt = f"""You are an automation coach. Use the following playbook as your primary reference.

RETRIEVED PLAYBOOK FROM KNOWLEDGE BASE:
{retrieved_context}

Now personalize this guide for:
- Task: {task_name}
- Tool: {tool}
- Reason: {task.get("reason", "")}

Adapt the playbook steps to fit their exact task. Keep the same clear step-by-step format. Add any specific tips relevant to their situation. Keep it practical and jargon-free."""
    else:
        # No matching playbook — generate from scratch
        prompt = f"""You are an automation coach for non-technical professionals.

Write a clear, jargon-free step-by-step guide to automate this task:
- Task: {task_name}
- Tool to use: {tool}
- Why automate: {task.get("reason", "")}

Format:
- Start with "WHAT YOU'LL AUTOMATE" — one sentence
- Number each step clearly (STEP 1, STEP 2, etc.)
- Each step should be 1-3 sentences, plain English
- End with "TIME TO SET UP: X minutes" and "ESTIMATED WEEKLY SAVINGS: X hours"
- Maximum 8 steps
- No jargon, no code unless absolutely necessary"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    guide_text = response.choices[0].message.content.strip()
    
    # Save automation to Supabase
    supabase.table("automations").insert({
        "user_id": data.user_id,
        "task_name": task_name,
        "automation_guide": guide_text,
        "estimated_hours_saved": task.get("hours_saved", 0)
    }).execute()

    return {
        "guide": guide_text,
        "rag_used": retrieved_context is not None
    }
