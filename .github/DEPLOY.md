# CI/CD Deploy

Avtomatik deploy GitHub Actions orqali (`.github/workflows/deploy.yml`).

| Branch | Server | Build (mode) | Runner | Publish |
|--------|--------|--------------|--------|---------|
| `main` | PROD   | `npm run build` (`--mode production` → `.env.production`) | `ubuntu-latest` | API upload (`/v1/admin/deploy/upload`) |
| `dev`  | DEV    | `npm run build:dev` (`--mode development` → `.env.development`) | build: `ubuntu-latest` → publish: **self-hosted** (dev server) | `dist/` → web-root (`rsync`) |

## ENV konventsiyasi

Barcha `.env*` fayllar `.gitignore`da. Vite mode bo'yicha yuklaydi:

| Fayl | Kim uchun | Ishlatilishi |
|------|-----------|-------------|
| `.env.local` | LOCAL developer | `npm run dev` (faqat mahalliy, git'da yo'q) |
| `.env.development` | DEV server | `npm run build:dev` → `dev` branch → `DEV_ENV_FILE` secret |
| `.env.production` | PROD server | `npm run build` → `main` branch → `PROD_ENV_FILE` secret |

CI build vaqtida `.env.*` faylini mos Secret'dan yaratadi.

---

## DEV (`dev`) — 2 bosqichli

Dev server diski band bo'lgani uchun **build GitHub runnerda**, publish esa dev serverdagi
self-hosted runner orqali (faqat `rsync`, serverda build yo'q, sudo kerak emas).

### 1. Serverda self-hosted runner o'rnatish
Server terminalida (`deploy` user):

```bash
cd ~ && mkdir -p actions-runner && cd actions-runner
RUNNER_VER=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
curl -o runner.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VER}/actions-runner-linux-x64-${RUNNER_VER}.tar.gz
tar xzf runner.tar.gz && rm runner.tar.gz

# --labels dev SHART (workflow: runs-on: [self-hosted, dev])
# token: GitHub → Settings → Actions → Runners → New self-hosted runner
./config.sh --url https://github.com/JamshidDev/HRM_PRO --token <TOKEN> --labels dev --name hrm-dev --unattended

sudo ./svc.sh install deploy
sudo ./svc.sh start
```

### 2. Repo Variables va Secrets
`Settings → Secrets and variables → Actions`

**Variables:**
| Variable | Qiymat |
|----------|--------|
| `DEV_DEPLOY_PATH` | `/var/www/hrm_front/dist` (nginx root) |

**Secrets:**
| Secret | Qiymat |
|--------|--------|
| `DEV_ENV_FILE` | `.env.development` faylining TO'LIQ mazmuni |

### 3. Serverdagi talablar
- `deploy` user `DEV_DEPLOY_PATH`ga yozadi (owns qiladi) — sudo kerak emas.
- `rsync` o'rnatilgan (bor).
- Nginx `DEV_DEPLOY_PATH`ni root qilib xizmat qiladi, SPA uchun `try_files $uri $uri/ /index.html`.

---

## PROD (`main`) — GitHub runner + API upload

**Secrets:**
| Secret | Qiymat |
|--------|--------|
| `PROD_DEPLOY_API_URL`  | `https://hrm-api.railway.uz/api` |
| `PROD_DEPLOY_LOGIN`    | login (phone), masalan `995016004` |
| `PROD_DEPLOY_PASSWORD` | parol |
| `PROD_ENV_FILE`        | `.env.production` faylining TO'LIQ mazmuni |

---

> Eski qo'lda `buildAndDeploy.js` (`npm run server`) olib tashlandi — deploy to'liq CI/CD orqali.
