# CMS setup: edit the website without code

The admin panel lives at **`https://your-domain/admin/`**. The owner signs in with GitHub, edits kits and content in
simple forms, and presses **Publish**. Publishing saves the change to your GitHub repository, which rebuilds the site
automatically (about 1 to 2 minutes).

```
Owner ──> /admin (Decap CMS) ──sign in──> Cloudflare Worker ──> GitHub
              │ Publish                                          │
              └───────────── commit to repo (main) ──────────────┘
                                │
                     GitHub Actions: check + build
                                │
                      GitHub Pages (live site, your domain)
```
Why a worker? GitHub Pages is static, so it cannot complete GitHub's sign-in step by itself. The worker in `cms-auth-worker/` does only that, for free.

---

## 0. Try it on your computer first (no accounts needed)
```bash
npm install
npm run dev:cms
```
Open `http://localhost:3000/admin/`. Edits are written straight into `content/`. This is the safest way to learn the panel.

## 1. Accounts you need (all free)
GitHub (you and the owner), Cloudflare (for the login worker), Node.js 22, Git, and access to your domain's DNS.

## 2. Put the project on GitHub
1. Create a **Public** repository (free GitHub Pages needs public). Do not add a README or licence.
2. In the project folder:
   ```bash
   git init && git add . && git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

## 3. Turn on GitHub Pages
Repository → **Settings → Pages** → Source: **GitHub Actions**. Then **Settings → Secrets and variables → Actions → Variables**:
add `SITE_URL` = `https://your-domain.com`. Under Pages, set your **Custom domain** and tick **Enforce HTTPS**.
At your domain registrar, point the domain to GitHub Pages (GitHub shows the exact A / CNAME records).

## 4. Deploy the login worker
```bash
cd cms-auth-worker
npm install -g wrangler        # once
wrangler login
```
Edit `wrangler.toml` → `ALLOWED_ORIGINS` = your domain (with and without `www`). Then:
```bash
wrangler deploy
```
Note the address it prints, like `https://shraddha-cms-auth.YOUR-NAME.workers.dev`.

## 5. Create the GitHub OAuth app
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
- Homepage URL: `https://your-domain.com`
- Authorization callback URL: `https://shraddha-cms-auth.YOUR-NAME.workers.dev/callback`

Copy the **Client ID**, generate a **Client secret**, and give both to the worker:
```bash
cd cms-auth-worker
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## 6. Tell the CMS where to look
Open `public/admin/config.yml` and set the two lines at the top:
```yaml
backend:
  repo: YOUR-USERNAME/YOUR-REPO
  base_url: https://shraddha-cms-auth.YOUR-NAME.workers.dev
```
Commit and push. Wait for the green tick under the repository's **Actions** tab.

## 7. Give the owner access
Repository → **Settings → Collaborators → Add people** (Write access). The owner accepts the e-mail invitation, then opens
`https://your-domain.com/admin/` and signs in with GitHub.

---

## What the owner can edit
| CMS section | What it controls |
|---|---|
| Puja Kits | Every kit: names, photo, Basic/Standard/Premium prices, what's inside, description (English and Hindi), show/hide, position |
| Website Content → Site details | WhatsApp number, UPI ID, e-mail, YouTube, notice hours, advance %, delivery pincodes |
| Website Content → Add-ons | Optional extras on kits |
| Website Content → Videos | The Videos page |
| Website Content → Reviews | Customer words on the home page |
| Website Content → Daily mantras | The mantra shown each day, in turn |
| Website Content → Festival countdown | The "Next festival" card (past dates are skipped automatically) |
| Website Content → Gallery photos | The palace-frame photo gallery on the home page |

## Adding a new category (developer)
A category is a small list in two places that must match: `src/lib/categories.json` (id + Hindi name) and the `category` options in
`public/admin/config.yml` (also the festival "Related kit category"). `npm run check` fails if they differ.

## If something goes wrong
| Symptom | Fix |
|---|---|
| Build stops with "The content has problems" | Read the lines listed. They name the file and the field. Fix in the CMS and publish again. |
| Login popup says unauthorised | The worker's `ALLOWED_ORIGINS` must contain your exact domain, and the OAuth callback URL must end in `/callback`. |
| Publish works but the site doesn't change | Open the repository's **Actions** tab. A red cross shows which step failed. |
| Photo not showing | Photos must be uploaded through the CMS (stored in `public/uploads/`). Keep each under 800 KB. |
