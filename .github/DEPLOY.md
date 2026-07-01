# CI/CD Deploy

Avtomatik deploy GitHub Actions orqali (`.github/workflows/deploy.yml`).

> **Trigger:** deploy FAQAT `dev`/`main`ga **PR merge** bo'lganda ishlaydi.
> To'g'ridan-to'g'ri push deploy QILMAYDI. Qo'lda: Actions → **Run workflow**
> (kerakli branchni tanlab). Shu sababli workflow fayli `dev` va `main`da bo'lishi shart.

| Branch | Server | Build (mode) | Runner | Env manbai | Publish |
|--------|--------|--------------|--------|-----------|---------|
| `main` | PROD | `npm run build` (`--mode production`) | `ubuntu-latest` | Secret `PROD_ENV_FILE` | API upload (`/v1/admin/deploy/upload`) |
| `dev`  | DEV  | `npm run build:dev` (`--mode development`) | **self-hosted** (dev server) | serverdagi `/var/www/hrm_front/.env` | `dist/` → web-root (`rsync`) |

## ENV konventsiyasi

Barcha `.env*` fayllar `.gitignore`da. Vite mode bo'yicha yuklaydi:

| Fayl | Kim uchun | Mode |
|------|-----------|------|
| `.env.local` | LOCAL developer (`npm run local`) | local |
| `.env.development` | DEV server (`npm run build:dev`) | development |
| `.env.production` | PROD server (`npm run build`) | production |

`isModeDev` (menyularni permission'siz ochish) `import.meta.env.MODE` bo'yicha:
production → yopiq, development/local → ochiq (`src/main.js`).

---

## DEV (`dev`) — self-hosted runner (serverda build)

Build ham, publish ham dev serverning O'ZIDA. Env GitHub'dan emas —
serverdagi mavjud `/var/www/hrm_front/.env` faylidan o'qiladi (commit/secret kerak emas).

### 1. Self-hosted runner o'rnatish (bir marta)
Server terminalida (`deploy` user):

```bash
cd ~ && mkdir -p actions-runner && cd actions-runner
RUNNER_VER=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
curl -o runner.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VER}/actions-runner-linux-x64-${RUNNER_VER}.tar.gz
tar xzf runner.tar.gz && rm runner.tar.gz

# --labels dev SHART (workflow: runs-on: [self-hosted, dev])
# token: GitHub → Settings → Actions → Runners → New self-hosted runner
./config.sh --url https://github.com/JamshidDev/HRM_PRO --token <TOKEN> --labels dev --name hrm-dev --unattended

sudo ./svc.sh install deploy && sudo ./svc.sh start
```

### 2. GitHub'da hech narsa qo'shilmaydi
Deploy target ham env ichida — server `/var/www/hrm_front/.env` fayliga qo'shing:
```
DEPLOY_PATH=/var/www/hrm_front/dist
```
(Variable ham, Secret ham kerak emas — hammasi shu `.env`da.)

### 3. Serverdagi talablar
- `/var/www/hrm_front/.env` mavjud: `VITE_*` (build) + `DEPLOY_PATH` (rsync target).
- `deploy` user `DEPLOY_PATH`ga yozadi (owns) — sudo kerak emas.
- `rsync` o'rnatilgan (bor).
- Nginx `DEV_DEPLOY_PATH`ni root qiladi, SPA: `try_files $uri $uri/ /index.html`.

> Dev config'ni o'zgartirish: serverdagi `/var/www/hrm_front/.env` ni tahrirlab,
> `dev` branchga qayta push qiling (yoki Actions'da qayta ishga tushiring).

---

## PROD (`main`) — GitHub runner + API upload

Prod `ubuntu-latest`da build bo'ladi, shuning uchun env Secret'dan.

**Secrets:**
| Secret | Qiymat |
|--------|--------|
| `PROD_DEPLOY_API_URL`  | `https://hrm-api.railway.uz/api` |
| `PROD_DEPLOY_LOGIN`    | login (phone), masalan `995016004` |
| `PROD_DEPLOY_PASSWORD` | parol |
| `PROD_ENV_FILE`        | `.env.production` faylining TO'LIQ mazmuni |

---

> Eski qo'lda `buildAndDeploy.js` (`npm run server`) olib tashlandi — deploy to'liq CI/CD orqali.
