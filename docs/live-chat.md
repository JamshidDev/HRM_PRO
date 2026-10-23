# Live chat (Xabar va e'lonlar → Live chat)

One-to-one employee chat, Telegram-style. Route `/chat/live-chat` (`router/modules/chatRoute.js`),
permission `chat-live-chat`. Last updated: 2026-10-22.

> Keep this file current: when chat behaviour, files or decisions change, update the matching section.

## Files

| File | Role |
|---|---|
| `src/pages/chat/live-chat/page.vue` | Layout: chat list + chat window in **one panel**; mobile = list first, chat as full-screen overlay (Teleport to body) with phone-back support (`history.pushState`); fullscreen mode (in-place `position: fixed` + grow/shrink animation via WAAPI). |
| `ui/useLiveChat.js` | Page adapter over the store: UI-only state (reply target, profile panel, `fullscreen`), `closeChat`, send helpers. |
| `ui/ChatSidebar.vue` | Title row: "Chatlar" + 🔍 (inline search of own chats, swaps with title; ✕/Esc closes) + ✏️ (NewChatModal = global employee search). One flat list (pinned first, no section headings). |
| `ui/ChatUserItem.vue` | List row: full-width, square; hover 6% / selected 12% primary tint; ✓/✓✓ (grey → primary when read); typing dots; pin icon on the right of the 2nd line (unread badge replaces it). |
| `ui/ChatWindow.vue` | Wallpaper (`.chat-stream`), floating 48px header pill, messages in a centred column (max **728px**), day chips (sticky, `top-2`), typing bubble, scroll-down button, stick-to-bottom scrolling, chat-switch animation, fullscreen button. Hosts ProfileModal / ForwardModal / delete confirm. |
| `ui/MessageBubble.vue` | One message: text / image / file / voice; reply quote (click = jump + flash); big emoji (1–3, no bubble); reactions; edit; delete animation; context menu. |
| `ui/MessageMeta.vue` | Time + status: spinner (sending) → ✓ drawn (sent) → ✓✓ (read, colour shift) / ⚠ shake (failed). Rendered twice in text bubbles (visible corner + invisible spacer). Props `onBubble`, `overlay`. |
| `ui/MessageTicks.vue` | SVG ✓/✓✓ with stroke "draw" animation. |
| `ui/MessageInput.vue` | Floating pill (📎 · textarea · 😊) + separate round 48px button (🎤 / send). Reply card, staged files, drafts per chat (module-level `Map`), emoji picker, voice recording + preview. |
| `ui/ChatImage.vue` | Image with tap-to-download: placeholder (blurred `thumb` or translucent grey) + ⬇ → ✕ with progress ring → fade-in. Real shape from `width/height` (max 280×320). `tile` mode for the profile grid. |
| `ui/imageCache.js` | Shared download state (reactive): `loadedImages`, `imageProgress`, `downloadImage` (fetch + progress, CORS fallback to plain `<img>`), `cancelImage`, `imageSrcFor`. |
| `ui/ProfileModal.vue` | **Side panel** (not a modal): 340px, pushes the chat on desktop, covers it on mobile. Avatar 120, info rows (phone copy, expandable long position), tabs Photos / Voice / Files, "nothing shared yet". |
| `ui/NewChatModal.vue` | Global employee search (≥2 letters), ↑/↓ + Enter keyboard navigation. |
| `ui/ForwardModal.vue`, `ui/ChatItemActionsMenu.vue`, `ui/MessageActionsMenu.vue`, `ui/EmptyState.vue` | Forward picker, chat context menu, message context menu (reactions + reply/edit/copy/forward/delete), empty state. |
| `ui/format.js` | Formatters, avatar colours, waveform helpers, `bigEmojiCount`, `makeImageThumb` (20px JPEG + size on send). |
| `src/store/modules/chat/liveChatStore.js` | All data: conversations, messages, unread, typing, presence, read receipts, socket events, optimistic sending (`clientId`), retry. |
| `api/index.js` | `VITE_LIVE_CHAT_MOCK=true` → `mockChatApi.js` (in-memory fake server), else `realChatApi.js` (REST + socket). |
| `api/mapper.js` | Backend snake_case → UI camelCase (`toMessage`, `toConversation`, `toUser`). |
| Service | `src/service/v1/chat/liveChatService.js`, base `/v1/chat/live` (Swagger: `/api/docs/chat`). |

## Data flow

- **Sending:** store creates a local message (`id = clientId`, status `sending`) → `pushLocal` →
  `deliver` (REST) → server message replaces the local one by `clientId` (`addMessage`), keeping local
  `width/height/thumb` if the server omits them. Failure → status `failed` → retry button.
- **Socket events:** `chat:message`, `chat:message:updated`, `chat:message:deleted`, `chat:read`,
  `chat:conversation`, `chat:conversation:removed`, `chat:typing`, `chat:presence`; reconnect → `resync`.
- **Read receipts:** `peerLastRead` per conversation; own messages with `id <= peerLastRead` → `read`.
- Page size 50 (`before_id` for older, `after_id` on resync). Typing: shown 4s, sent max every 2.5s.

## Behaviour details

- **Scrolling:** auto-down on own message or when within 150px of bottom; otherwise counter badge on the
  scroll-down button. `ResizeObserver` keeps the list pinned to bottom when content/size changes
  (image load, fullscreen); a final exact jump 450ms after smooth scroll. Older messages load at < 80px
  from top, keeping position.
- **Voice:** hold 🎤 = record; release inside the field = send, outside = cancel; drag up 60px = lock.
  Tap (< 300ms) or keyboard = hands-free (🗑 / ⏹ → listen-first preview / send). Min **5s**, max
  **120s** (max → preview). Voice-level halo via `AnalyserNode`. Timer `00:00.0`.
- **Images:** received images are **not** auto-downloaded. Own images show immediately. Sending also sends
  `width`, `height`, `thumb` (backend stores/returns them since 2026-10-21, see
  `docs/live-chat-image-preview.md`). Old messages without them → grey placeholder 240×180.
- **Files:** ≤ 10 MB each.
- **Big emoji:** text that is only 1–3 emoji → 56/44/36px, no bubble, time on a chip.
- **Bubbles:** 15px radius, 5px on the sender side inside a group, tail on the last one; 16/21 text;
  2px gap inside a group, 6px between groups; max width `min(480px, 85%)`; no avatars (1:1 chat).
- **Colours:** `--chat-bubble-own-bg/-text/-muted/-accent/-tint`, `--chat-bubble-in-bg` in
  `variables.scss` (light: soft blue own `#d9eafd` + white incoming; dark: navy).
- **Fullscreen:** header button, Esc exits (unless a modal/menu is open), always exits on unmount.
- **Mobile (< 768px):** list only; chat opens as overlay; phone back closes the chat.
- **Touch devices (`pointer: coarse`):** Enter = new line (send with the button); no input autofocus.
- **Search highlight elsewhere:** the shared `src/components/ui/UIHighlight.vue` (used in Xodimlar) is not used in chat yet.

## Decisions made with Shahriyor (don't undo without asking)

- No "Barchasi / O'qilmagan" filter tabs; no section headings; no active-row left bar.
- No avatars next to messages; no separate ⓘ header button (header click opens profile).
- Typing indicator bubble keeps the **original** bounce animation (he asked to restore it).
- Profile: no Mute/Call/More buttons; media in tabs; long position expands on click.
- Stopping a recording must **not** auto-send (preview first) — except release-after-hold, Telegram-style.
- Tap-to-download for received images (chat and profile Photos tab).

## Not done / ideas

- Separate "delivered" status needs backend support (only sent/read exist).
- Swagger lacks response schemas — verify response fields live (DevTools → Network).
