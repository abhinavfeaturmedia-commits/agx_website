# AGX CRM Model Context Protocol (MCP) Server

Connect **Claude Desktop**, **ChatGPT**, **Gemini**, and **Cursor** directly to your **AGX CRM** database. Manage leads, clients, projects, tasks, invoices, and calendar events simply by chatting in natural language.

---

## 🚀 Quick Start: Running the Server

### Option A: Local Stdio Mode (For Claude Desktop, Cursor, Antigravity)
This mode connects directly to desktop AI applications running on your machine:
```bash
cd mcp-server
npm install
npm run build
npm start
```

### Option B: HTTP / Remote Mode (For ChatGPT Mobile/Web & Remote APIs)
This mode starts a local HTTP server with an OpenAPI spec for ChatGPT Custom GPT Actions or mobile clients:
```bash
cd mcp-server
npm run start:http
```
*Server runs on `http://localhost:3001` (or your configured `PORT`).*

---

## 🤖 1. Connecting to Claude Desktop

1. Open your Claude Desktop configuration file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the `agx-crm` server entry:
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
        "SUPABASE_KEY": "YOUR_SUPABASE_KEY"
      }
    }
  }
}
```

3. Restart Claude Desktop. You will see a 🔨 **hammer icon** appear with all AGX CRM tools ready!

---

## 💻 2. Connecting to Cursor / Antigravity

In your Cursor or Antigravity MCP settings (`mcp_config.json` or `.cursor/mcp.json`):
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

## 🌐 3. Connecting to ChatGPT (Web & Mobile App)

To use this from the **ChatGPT iOS / Android mobile app** or chatgpt.com:

1. **Expose your server to the internet**:
   Run `npm run start:http` in one terminal, and in another terminal run:
   ```bash
   npx ngrok http 3001
   ```
   Copy your public URL (e.g. `https://your-name.ngrok-free.app`).

2. **Update the server URL**:
   In `mcp-server/openapi.json`, update the `servers[0].url` to your public URL.

3. **Create a Custom GPT**:
   - Go to [ChatGPT -> Explore GPTs -> Create](https://chatgpt.com/gpts/editor).
   - Name it **AGX CRM Assistant**.
   - Under **Instructions**, write:  
     `You are the executive assistant for AGX CRM. Help manage leads, tasks, clients, and financial summaries by calling the available actions.`
   - Click **Create new action**.
   - Click **Import from URL** or paste the raw content of `mcp-server/openapi.json`.
   - Under **Authentication**, choose **Bearer** and enter your secret token from `.env` (`agx_secret_token_12345`).

Now you can chat or voice-dictate from your phone:  
*"Hey, add a new lead for John from Apex, budget ₹1,00,000 for AI Automation"* and ChatGPT will update your AGX CRM!

---

## 🛠️ Complete Tool Catalog

| Tool Name | What It Does | Example Chat Command |
| :--- | :--- | :--- |
| `search_leads` | Search leads by query, status, or assignee | *"Show me all leads in Negotiation stage."* |
| `create_lead` | Add a new prospect with contact & deal size | *"Add lead: Rohit from Alpha Retail, ₹2L budget."* |
| `update_lead` | Move status across pipeline or change value | *"Move Rohit's lead to Proposal Sent."* |
| `log_lead_activity` | Log calls, WhatsApp notes, meeting notes | *"Log note for Rohit: Discussed demo, asked for 5% off."* |
| `search_clients` | Search active client accounts | *"Find client details for Apex Corp."* |
| `create_client` | Create new client or convert a won lead | *"Convert Rohit to an active client."* |
| `list_projects` | Filter projects by status or manager | *"What projects are currently in progress?"* |
| `create_project` | Start new client project | *"Create project 'Alpha AI Bot' for ₹2,00,000."* |
| `update_project` | Update progress % (0-100) or status | *"Set 'Alpha AI Bot' progress to 65%."* |
| `get_tasks` | Get tasks due today or urgent tasks | *"What are my urgent tasks for today?"* |
| `create_task` | Create a task linked to project/lead | *"Create a task: Prepare invoice draft for Alpha."* |
| `update_task` | Mark task completed or change status | *"Mark invoice draft task as Completed."* |
| `get_financial_summary` | Revenue, cash collected & overdue invoices | *"What is our total revenue and pending balance?"* |
| `record_payment` | Record payment against an invoice | *"Record ₹50,000 payment for Invoice #102."* |
| `get_upcoming_events` | View meetings & deadlines for next 7 days | *"What meetings do I have scheduled this week?"* |
| `schedule_event` | Schedule meeting or reminder | *"Schedule client review with Alpha on Friday 3 PM."* |

---

## 🧪 Testing the Tools

You can verify that database operations work directly from the CLI without launching Claude:
```bash
npm run test:tools
```
