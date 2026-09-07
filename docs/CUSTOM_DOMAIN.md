# Custom domain setup — Pratik Tamgadge portfolio

Site repo: `Stallion8/portfolio`  
GitHub Pages URL: **https://stallion8.github.io/portfolio/**  
GitHub Pages target for DNS: **`stallion8.github.io`** (no `/portfolio`)

---

## Domain name options (Pratik-related)

Pick one style, then check availability on [Namecheap](https://www.namecheap.com), [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/), or [Google Domains / Squarespace](https://domains.google).

### Recommended (UX portfolio)

| Domain | Why it works |
|--------|----------------|
| **pratikux.com** | Short, professional, matches your UX focus. You tried this before — good choice. |
| **pratikux.design** | Very on-brand for a design portfolio. |
| **pratiktamgadge.com** | Full name — great for recruiters and LinkedIn. |
| **pratikux.dev** | Clean, tech-forward. |

### Brand-aligned (PRATIK.OS)

| Domain | Why it works |
|--------|----------------|
| **pratik-os.com** | Mirrors your site brand `PRATIK.OS`. |
| **pratikos.com** | Shorter play on the same brand. |

### India / personal

| Domain | Why it works |
|--------|----------------|
| **pratikux.in** | Local TLD, Pune-based. |
| **pratiktamgadge.in** | Full name + India. |

**Best overall pick:** `pratikux.com` or `www.pratikux.com` — memorable, professional, easy to say.

---

## Why you were getting DNS errors

From your repo history, these were tried:

| Attempt | Problem |
|---------|---------|
| `stallion8.portfolio` | Not a real domain — invalid TLD. |
| CNAME deleted | GitHub Pages loses the domain mapping. |
| Wrong CNAME target | Must point to **`stallion8.github.io`**, not `stallion8.github.io/portfolio`. |
| Apex without A records | `pratikux.com` (@) needs **A records**, not CNAME. |

---

## Step-by-step (after you buy a domain)

Example uses **`pratikux.com`**. Replace with your chosen domain.

### 1. Buy the domain

Register at any registrar (Namecheap, Cloudflare, GoDaddy, etc.).

### 2. Add DNS records at your registrar

#### Option A — Apex + www (recommended)

**For `pratikux.com` (root / apex):** add **4 A records**

| Type | Host / Name | Value |
|------|-------------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

**For `www.pratikux.com`:** add **1 CNAME record**

| Type | Host / Name | Value |
|------|-------------|-------|
| CNAME | `www` | `stallion8.github.io` |

#### Option B — www only (simplest)

Skip apex A records. Only buy/use **`www.pratikux.com`**:

| Type | Host / Name | Value |
|------|-------------|-------|
| CNAME | `www` | `stallion8.github.io` |

Then set custom domain in GitHub to `www.pratikux.com`.

#### Option C — Subdomain only

Example: **`portfolio.pratikux.com`**

| Type | Host / Name | Value |
|------|-------------|-------|
| CNAME | `portfolio` | `stallion8.github.io` |

---

### 3. Configure GitHub Pages

1. Open https://github.com/Stallion8/portfolio/settings/pages  
2. Under **Custom domain**, enter your domain (e.g. `www.pratikux.com` or `pratikux.com`)  
3. Click **Save**  
4. Wait for DNS check (can take 10 minutes – 24 hours)  
5. When available, enable **Enforce HTTPS**

GitHub will add a `CNAME` file to the repo automatically, or you can commit one manually:

```
www.pratikux.com
```

(Use your exact domain — one line, no `https://`, no path.)

---

### 4. Verify DNS (Windows PowerShell)

```powershell
# For www subdomain
Resolve-DnsName www.pratikux.com -Type CNAME

# For apex domain
Resolve-DnsName pratikux.com -Type A
```

**Expected:**
- CNAME for `www` → `stallion8.github.io`
- A records for apex → GitHub IPs listed above

---

## Checklist

- [ ] Domain purchased
- [ ] DNS records added (A for apex, CNAME for www)
- [ ] CNAME target is `stallion8.github.io` (not `/portfolio`)
- [ ] Custom domain saved in GitHub → Settings → Pages
- [ ] `CNAME` file exists in repo root
- [ ] DNS propagated (wait up to 24h)
- [ ] **Enforce HTTPS** enabled in GitHub Pages settings

---

## After it works

Your site will load at your custom domain instead of `stallion8.github.io/portfolio/`.

Optional: add the custom URL to your GitHub profile bio and portfolio contact section.

---

## Need help?

Reply with:
1. Which domain you bought (e.g. `pratikux.com`)
2. Your registrar (Namecheap, Cloudflare, etc.)
3. A screenshot of your current DNS records

Then we can fix the exact misconfiguration.
