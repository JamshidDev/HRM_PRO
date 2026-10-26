# Turniket → Smenalar (shift types & groups)

Route: turnstile `ShiftType` (`src/pages/turnstile/shiftType/page.vue`). Store: `src/store/modules/turnstile/shiftTypeStore.js`.
Cycle helpers: `src/pages/turnstile/scheduleWorker/ui/navbat.js`. Last updated: 2026-10-22.

> Keep this file current when shift flows, files or decisions change.

## Shift type ids (`type.id`)

| id | Kind | "Guruh yaratish" flow |
|---|---|---|
| 1 | Rotating (smena) | GenerateModal → **RotatingScheduleModal** (drawer, slots) |
| 2 | Daily (har kunlik) | GenerateModal → RotatingScheduleModal (daily mode); group row action "Biriktirish" → **DailyScheduleModal** |
| 3 | Part-time | GenerateModal (group count) → `_generateSchedule` → **ScheduleModal** (old grid, one dropdown per row) |
| 4 | Weekly (1 haftalik) | like rotating (pattern + same number of rest days) |
| 5 | Custom (maxsus) | no groups — "Navbatchilik grafigini ochish" button goes to the Schedule page |

## Files

| File | Role |
|---|---|
| `page.vue` | Left: `ShiftTypeList`; right: header + group filter/table (`scheduleGroup/ui/Filter.vue`, `Table.vue`); hosts all modals. |
| `ui/GenerateModal.vue` | Create: pick year/month (current … +3 months), workers count (rotating/daily, max 100, multiple of crew) or group count (part-time). Edit = **"Guruhni yakunlash"**: group name + start date shown, end date can't be before start. |
| `ui/RotatingScheduleModal.vue` | Full-screen drawer: slots × days grid (virtualised), crews, coverage row; assign via `AssignWorkerModal`. Moving workers from other shifts asks first. **Closing with assigned workers asks to confirm** (Cancel / ✕ / Esc). |
| `ui/AssignWorkerModal.vue` | Pick a worker for one slot: search, "only free", shows other shifts, infinite scroll. |
| `ui/ScheduleModal.vue` | Part-time grid. Saves **only rows with a worker**; blocks duplicates; needs ≥ 1 worker. |
| `ui/DailyScheduleModal.vue` + `DailyScheduleFilter.vue` | "Xodim biriktirish — <group>": paginated checklist; filters reset on every open (`_resetAttachFilters`); workers with another shift show an amber chip and saving asks to confirm the move (`busyWorkerIds`). |
| `scheduleWorker/ui/ReplaceModal.vue` | Day edit ("Shu kun qanday bo'lsin?": Dam / shift times / custom) + one-day substitution. If the picked state equals the current one (and there is no substitution), it shows "already like this" and Save is disabled. If the day has a substitution, an orange card on top explains it ("X works instead of Y at 09:00–18:00", both people with Dam oladi / Ishlaydi) and that saving cancels it. **Lunch:** preset shifts send their lunch; "Boshqa vaqt" has a "Tanaffus (ovqatlanish uchun)" — tick "Tanaffus bor" + break fields, ⓘ hint "mainly for eating" (unticked by default, times pre-filled from the type; untick = no lunch, e.g. a 4-hour day; validated inside the hours, overnight-safe); Now → After shows hours (− lunch) and lunch. Sends `break_start_time` / `break_end_time` — **backend support pending**, see `docs/api/turnstile-day-break.md`. |
| `scheduleGroup/ui/Table.vue` | Group actions: Biriktirish (daily only, one month: selected month ∩ group period, not before current month), View, Delete (UITable confirm), Yakunlash (edit). |

## Notes

- Backend `schedule-types` ignores `search` → list loads all (per_page 200) and filters in the browser.
- After group create/edit/delete → `_refreshAfterGroupChange()` (reloads types counts + groups, respecting read permissions).
- Possible next step (not done): move part-time (type 3) from the old `ScheduleModal` grid to the drawer + `AssignWorkerModal` flow — needs a backend payload check.
