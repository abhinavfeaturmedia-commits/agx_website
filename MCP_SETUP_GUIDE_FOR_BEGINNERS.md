# 🔌 The Complete Non-Technical Guide to MCP (Model Context Protocol)
> *A friendly, zero-jargon setup guide designed so anyone can connect AI assistants to real-world tools, files, and databases.*

---

## 🌟 1. What is MCP? (In Simple Everyday Words)

Imagine your AI assistant (like **Claude**, **Antigravity**, or **ChatGPT**) is like a **brilliant personal assistant sitting inside a glass office**. 
- They are super smart, can write poetry, solve math, and plan projects.
- **The Problem:** They cannot reach outside the glass room. They cannot open your spreadsheets, check your database, or update your CRM.

### The Solution: MCP is the "Universal USB Cable"
**MCP (Model Context Protocol)** is simply a **standard USB cable** that connects your AI assistant to the outside world.

```
┌─────────────────┐         🔌 MCP Cable         ┌────────────────────────┐
│  AI Assistant   │ ◀══════════════════════════▶ │    Your Tools & Data   │
│ (Brain in Room) │  (Claude / Antigravity /     │ (Database, Files, CRM, │
│                 │       Cursor / GPT)          │    Calendar, Finances) │
└─────────────────┘                              └────────────────────────┘
```

When you plug in an MCP server, your AI suddenly gets **hands**. It can now:
- 📊 Check your real sales leads and client records.
- 📝 Create tasks and update project statuses.
- 💰 Review invoices and calculate revenue.
- 🔍 Search your files or the live internet.

---

## 🧩 2. The 3 Pieces of Every MCP Setup

Every MCP setup in the world consists of only **3 simple things**:

| Piece | What it is | Everyday Analogy |
| :--- | :--- | :--- |
| **1. The Client** | The AI program you chat with. | The Smartphone or Computer. |
| **2. The Server** | A small helper program that knows how to fetch your data. | The App (like WhatsApp or Uber). |
| **3. The Config File** | A tiny text note that tells the AI where the helper program lives. | The Phone Contact Card / Address Book. |

That’s all! Setting up MCP just means **pasting the helper's address into your AI's settings file**.

---

## ⚡ 3. Prerequisite: The 5-Second Check

Most local MCP servers run on **Node.js** (a standard tool that runs JavaScript on your computer).

### How to check if you have Node.js installed:
1. Press the `Win` key on your keyboard, type **cmd** or **Terminal**, and press `Enter`.
2. Type this command and press `Enter`:
   ```bash
   node -v
   ```
3. **If you see a version number** (like `v18.16.0` or `v20.10.0`):  
   🎉 **You are ready!** Close the window.
4. **If it says "command not found":**  
   Visit [nodejs.org](https://nodejs.org/) and click the big green **LTS** download button, install it (just click Next, Next, Finish), then restart your computer.

---

## 🚀 4. Step-by-Step Setup Guides

Choose your AI application below to follow the exact, click-by-click instructions.

---

### Guide A: Setting Up in Claude Desktop (Windows & Mac)

Claude Desktop is one of the most popular apps for MCP. It features a little **Hammer icon 🔨** in the chat window where all your tools appear.

#### Step 1: Find the secret configuration file
Anthropic stores the configuration file in a hidden folder. Here is the easiest way to open it:

- **On Windows:**
  1. Press `Win + R` on your keyboard (the Run dialog will pop up).
  2. Copy and paste this exact text into the box:
     ```text
     %APPDATA%\Claude
     ```
  3. Press `Enter`. A folder will open.
  4. Look for a file called `claude_desktop_config.json`. If it doesn't exist, create a new text file and rename it to `claude_desktop_config.json`.
  5. Right-click the file and open it with **Notepad**.

- **On Mac:**
  1. Open **Finder**.
  2. Press `Cmd + Shift + G` (Go to Folder).
  3. Paste this: `~/Library/Application Support/Claude` and press `Enter`.
  4. Open `claude_desktop_config.json` with **TextEdit**.

#### Step 2: Paste the Configuration
Paste the following configuration into your file:

```json
{
  "mcpServers": {
    "agx-crm": {
      "command": "node",
      "args": [
        "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://lgvqkumqjmeyycqvgycv.supabase.co",
        "SUPABASE_KEY": "YOUR_SUPABASE_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

> [!TIP]
> **Windows Path Rule**: Always use forward slashes `/` (e.g., `c:/Users/...`) instead of backslashes `\`. Backslashes can confuse configuration files!

#### Step 3: Restart Claude Desktop
1. Completely close Claude Desktop (make sure it isn't still running in your system tray by your clock).
2. Re-open Claude Desktop.
3. Look at the bottom right corner of the chat input box: you will see a 🔨 **Hammer icon**!
4. Click the hammer icon to see all **18 active tools** (Leads, Tasks, Projects, Invoices).

---

### Guide B: Setting Up in Google Antigravity IDE

If you are using Google Antigravity IDE, MCP is built directly into your environment!

#### Option 1: Via the Settings UI (Easiest)
1. Click the **Settings (Gear Icon ⚙️)** or navigate to **Additional Options (...) > MCP Servers** in the top/side bar.
2. Click **Add New MCP Server**.
3. Choose **Stdio (Local Command)**:
   - **Server Name**: `agx-crm`
   - **Command**: `node`
   - **Arguments**: `c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js`
4. Click **Save**. Antigravity will connect immediately!

#### Option 2: Via the Global Configuration File
Antigravity automatically reads MCP configurations from your user directory:
- **Location**: `C:\Users\Abhinav\.gemini\config\mcp_config.json`

Add this entry inside `"mcpServers"`:
```json
{
  "mcpServers": {
    "agx-crm": {
      "command": "node",
      "args": [
        "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"
      ]
    }
  }
}
```

---

### Guide C: Setting Up in Cursor IDE

Cursor is an AI-powered code editor with native MCP support.

1. Open **Cursor**.
2. Click the gear icon in the top right to open **Cursor Settings**.
3. In the left sidebar, click **Features**, then scroll down to **MCP Servers**.
4. Click the **+ Add New MCP Server** button.
5. Fill in the fields:
   - **Name**: `agx-crm`
   - **Type**: `command`
   - **Command**: `node "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"`
6. Click **Add**.
7. You will see a green status light indicating the server is **Connected**!

*Alternatively, create a file named `.cursor/mcp.json` inside your project root and paste:*
```json
{
  "mcpServers": {
    "agx-crm": {
      "command": "node",
      "args": [
        "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"
      ]
    }
  }
}
```

---

### Guide D: Setting Up in ChatGPT (Mobile App & Web)

Because your website is already hosted 24/7 on **Netlify**, you can connect ChatGPT so you can talk to your CRM from your **iPhone or Android** phone while on the go!

#### Step 1: Open ChatGPT Custom GPT Builder
1. Go to [chatgpt.com/gpts/editor](https://chatgpt.com/gpts/editor) (Requires ChatGPT Plus or Team).
2. Name your assistant: **AGX CRM Assistant**.
3. In **Instructions**, write:
   > *"You are the executive assistant for AGX CRM. Help manage leads, tasks, clients, and financial summaries by calling the available actions."*

#### Step 2: Add the Actions (Tools)
1. Click **Create new action** at the bottom.
2. Click **Import from URL**.
3. Paste your public Netlify schema URL:
   ```text
   https://agxperience.netlify.app/openapi.json
   ```
4. Click **Import**. ChatGPT will immediately import all 18 tools!
5. Under **Authentication**:
   - **Option A (Recommended - Zero Friction)**: Select **None**. The API is pre-configured to allow your Custom GPT to connect seamlessly without entering tokens!
   - **Option B (Secured with API Key)**: If you prefer strict token authentication, select **API Key** -> Auth Type: **Bearer** -> Paste `agx_secret_token_12345`.
6. Click **Save** in the top right.

🎉 **Now you can use voice dictation on your phone**:  
*"Hey Siri / ChatGPT, add a lead for Rohit from Apex, budget ₹1,50,000 for AI Automation!"*

---

## 🛠️ 5. What Can You Say to Your AI Once Connected?

Once your MCP server is connected, you can chat in completely normal, plain English. You do not need to memorize any special code!

Here are real examples:

### Managing Leads & Sales
- 💬 *"Show me all leads currently in the Negotiation stage."*
- 💬 *"Add a new lead: Rajesh from Alpha Retail, phone 9876543210, estimated deal value ₹2,00,000, high priority."*
- 💬 *"Move Rajesh's lead to Proposal Sent and set follow-up for this Friday at 3 PM."*
- 💬 *"Log a meeting note for Rajesh: Client loved the live demo, asked for a 5% discount."*

### Tasks & Team Operations
- 💬 *"What are my urgent tasks due today?"*
- 💬 *"Create a task: Prepare invoice draft for Alpha Retail, assign to me, due tomorrow."*
- 💬 *"Mark the invoice draft task as Completed."*

### Finances & Invoices
- 💬 *"Give me a financial summary: how much revenue have we collected this month, and what is our pending balance?"*
- 💬 *"Record a payment of ₹50,000 against Invoice #102."*

### Calendar & Meetings
- 💬 *"What client meetings do I have scheduled for the next 7 days?"*
- 💬 *"Schedule a project kickoff meeting with Dr. Sameer on Monday at 11 AM."*

---

## 🛑 6. The 5 Golden Rules of MCP JSON (Avoid Common Mistakes!)

If an MCP configuration isn't working, 99% of the time it is due to one of these simple formatting mistakes.

```
❌ WRONG (Windows Backslashes):
"args": ["c:\Users\Abhinav\mcp-server\dist\index.js"]

✅ RIGHT (Forward Slashes):
"args": ["c:/Users/Abhinav/mcp-server/dist/index.js"]
```

```
❌ WRONG (Trailing comma after last item):
{
  "command": "node",
  "args": ["path/to/file"],  <-- THIS COMMA BREAKS IT!
}

✅ RIGHT (No comma after the final item):
{
  "command": "node",
  "args": ["path/to/file"]
}
```

```
❌ WRONG (Missing double quotes):
{
  command: node  <-- Needs quotes!
}

✅ RIGHT:
{
  "command": "node"
}
```

---

## 🩺 7. The 60-Second Troubleshooting Checklist

| What happened? | Why it happened | Easy 5-second fix |
| :--- | :--- | :--- |
| **No hammer icon in Claude Desktop** | Claude hasn't reloaded the config file. | Completely quit Claude (`File > Quit` or close via taskbar tray) and reopen it. |
| **Claude shows an error on launch: "Invalid JSON"** | A missing comma, extra comma, or unclosed curly bracket `{}`. | Copy the exact snippet from this guide again or test your text in [jsonlint.com](https://jsonlint.com). |
| **"Cannot find module ... dist/index.js"** | The MCP server hasn't been built yet. | Open terminal in `mcp-server` folder and run `npm run build`. |
| **"Unauthorized" or database query fails** | Supabase Key is missing or expired. | Check that your `SUPABASE_KEY` in `.env` matches your Supabase project API key. |

---

## 🎁 8. Summary Checklist

- [x] Node.js is verified on your system (`node -v`).
- [x] You chose your platform (**Claude Desktop**, **Antigravity**, **Cursor**, or **ChatGPT**).
- [x] You pasted the forward-slash file path into the config file.
- [x] You restarted your AI app.
- [x] You see the tools appear and tested with a friendly prompt!
