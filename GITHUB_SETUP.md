# GitHub Repository Setup

**Quick guide for Wilson to create the public repo**

## Option 1: GitHub Web UI (Easiest)

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `atlas-intelligence`
   - **Description**: `Decentralized multi-agent research coordination on Solana | Colosseum Agent Hackathon`
   - **Public** ← Important!
   - **Do NOT** initialize with README (we already have one)
3. Click "Create repository"
4. Copy the remote URL (should be `https://github.com/[YOUR_USERNAME]/atlas-intelligence.git`)

## Option 2: GitHub CLI (Faster)

```bash
# Install gh if not already installed
# brew install gh  (macOS)
# Or download from https://cli.github.com

# Login
gh auth login

# Create repo
cd /data/.openclaw/workspace/atlas-intelligence
gh repo create atlas-intelligence --public --source=. --remote=origin --push

# Done! Repo is live
```

## After Creating Repo

Once you have the repo URL, I'll push the code:

```bash
cd /data/.openclaw/workspace/atlas-intelligence

# Add remote (replace [YOUR_USERNAME] with actual GitHub username)
git remote add origin https://github.com/[YOUR_USERNAME]/atlas-intelligence.git

# Push code
git branch -M main
git push -u origin main
```

## What Gets Pushed

**Public (safe to share)**:
- All source code (`src/`)
- Documentation (`README.md`, `ARCHITECTURE.md`, etc.)
- Demos (the 3 intelligence briefs)
- Solana program design
- LICENSE, .gitignore

**Private (NOT pushed, .gitignore blocks it)**:
- AgentWallet credentials (`~/.agentwallet/`)
- Colosseum API key (stored in workspace but not in git)
- Any `.env` files
- `node_modules/`

The `.gitignore` is configured to prevent credential leaks.

## Verification

After pushing, check:

1. **Repo is public**: Can view without login
2. **README renders**: Should see the formatted README on repo homepage
3. **Demos are there**: `demos/` folder with all 3 briefs
4. **No secrets**: Search repo for "apiKey", "token", etc. Should find nothing sensitive

## Then Update Forum

Once repo is live:

```bash
# Update forum post with repo link
curl -X PATCH https://agents.colosseum.com/api/forum/posts/4068 \
  -H "Authorization: Bearer 4cf014e01b93b1b8dea87b1c13897a29a5b2f4797debd703c1431be8fd804a44" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "[EXISTING_BODY]\n\n**UPDATE:** Code is live! Check it out: https://github.com/[YOUR_USERNAME]/atlas-intelligence"
  }'
```

## Need Help?

If you hit any issues, just send me:
- Your GitHub username
- Any error messages

I'll provide exact commands to run.

---

**Ready when you are! Just need the GitHub username or repo URL.** 🚀
