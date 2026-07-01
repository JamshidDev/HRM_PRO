# CI/CD Deploy

Avtomatik deploy GitHub Actions orqali (`.github/workflows/deploy.yml`).

> **Trigger:** deploy FAQAT `dev`/`main`ga **PR merge** bo'lganda ishlaydi.
> To'g'ridan-to'g'ri push deploy QILMAYDI. Qo'lda: Actions → **Run workflow**.
> Shu sababli workflow fayli `dev` va `main`da bo'lishi shart.

| Branch | Server | Runner | Build (mode) | Env + deploy config | Publish |
|--------|--------|--------|--------------|---------------------|---------|
| `dev`  | DEV server  | self-hosted `[dev]`  | `npm run build:dev` | server `.env` | `rsync` → web-root |
| `main` | PROD server | self-hosted `[prod]` | `npm run build`     | server `.env` | `rsync` → web-root |

Dev ham, prod ham **bir xil naqsh**: har biri o'z serverida self-hosted runnerda
build bo'ladi va o'sha serverdagi `.env` faylini o'qiydi. GitHub'da secret/variable KERAK EMAS.

## ENV konventsiyasi

Barcha `.env*` fayllar `.gitignore`da. Vite mode bo'yicha yuklaydi:

| Fayl | Kim uchun | Mode |
|------|-----------|------|
| `.env.local` | LOCAL developer (`npm run local`) | local |
| `.env.development` | DEV server (`npm run build:dev`) | development |
| `.env.production` | PROD server (`npm run build`) | production |

`isModeDev` (menyularni permission'siz ochish) `import.meta.env.MODE` bo'yicha:
production → yopiq, development/local → ochiq (`src/main.js`).

Har bir serverdagi `.env` ichida `VITE_*` (build) + `DEPLOY_PATH` (rsync target) bo'ladi.

---

## Har bir serverda (DEV va PROD) bir marta

### 1. Self-hosted runner o'rnatish
Server terminalida (`deploy` user). **Label** dev serverда `dev`, prod serverда `prod`:

```bash
cd ~ && mkdir -p actions-runner && cd actions-runner
RUNNER_VER=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
curl -o runner.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VER}/actions-runner-linux-x64-${RUNNER_VER}.tar.gz
tar xzf runner.tar.gz && rm runner.tar.gz

# token: GitHub → Settings → Actions → Runners → New self-hosted runner
# DEV serverда:  --labels dev   --name hrm-dev
# PROD serverда: --labels prod  --name hrm-prod
./config.sh --url https://github.com/JamshidDev/HRM_PRO --token <TOKEN> --labels <dev|prod> --name <hrm-dev|hrm-prod> --unattended

sudo ./svc.sh install deploy && sudo ./svc.sh start
```

### 2. Server `.env` (frontend papkasida)
Serverdagi frontend papkasidagi `.env` ichida `VITE_*` + `DEPLOY_PATH`:

```
# ... VITE_* build o'zgaruvchilari ...
DEPLOY_PATH=/var/www/hrm_front/dist   # rsync target (nginx root); prod'da o'z yo'li
```

Workflow `SERVER_ENV` yo'li: hozir `/var/www/hrm_front/.env` (prod boshqa bo'lsa —
`deploy.yml` dagi `SERVER_ENV`ni prod job uchun to'g'rilang).

### 3. Serverdagi talablar
- `deploy` user `DEPLOY_PATH`ga yozadi (owns) — sudo kerak emas.
- `rsync` o'rnatilgan.
- Nginx `DEPLOY_PATH`ni root qiladi, SPA: `try_files $uri $uri/ /index.html`.

---

> Eski `buildAndDeploy.js` va API-upload (`deploy-ci.js`) olib tashlandi — deploy
> to'liq self-hosted runner + `rsync` orqali (dev va prod bir xil).

<!-- prod deploy: self-hosted runner faollashtirildi -->
