# Trung Thu Moon Climb — MVP Spec

## 1. Mục tiêu

Làm một web mini-game Trung Thu Việt Nam.

Người tạo game có thể:

- Chọn số bậc thang.
- Đặt quà ở một số bậc.
- Viết lời nhắn cho từng quà.
- Viết lời chúc cuối.

Sau đó web sẽ tạo một **URL chứa toàn bộ cấu hình game**.

Người tạo chỉ cần copy URL và gửi cho người khác.

Không cần:

- Backend.
- Database.
- Login.
- Account.
- Supabase.
- Firebase.

---

# 2. Ý tưởng gameplay

Nhân vật chính là **Chú Cuội dạng mascot tròn mềm giống cục kẹo bông gòn**.

Người chơi phải tap/click liên tục để Cuội leo thang lên Cung Trăng.

Gameplay:

```text
Tap nhanh
→ Cuội leo lên

Không tap
→ KAMA giảm
→ Cuội chậm lại
→ KAMA = 0
→ Cuội trượt xuống
```

Trên đường đi sẽ có các hộp quà.

Khi chạm quà:

```text
🎁 mở quà
↓
hiện lời nhắn
↓
tiếp tục leo
```

Khi lên tới bậc cuối:

```text
🌕 Cung Trăng
↓
hiện lời chúc cuối
```

---

# 3. Tech Stack

Dùng:

```text
Next.js
React
TypeScript
Tailwind CSS
Phaser 3
```

Nếu muốn prototype nhanh hơn thì có thể bắt đầu bằng:

```text
HTML
CSS
JavaScript
```

sau đó mới chuyển sang Next.js.

---

# 4. Không dùng backend

Toàn bộ game config được lưu trong URL.

Ví dụ config:

```json
{
  "steps": 80,
  "gifts": [
    {
      "step": 20,
      "message": "Cố lên nha 🌕"
    },
    {
      "step": 50,
      "message": "Sắp tới nơi rồi 🥮"
    }
  ],
  "finalMessage": "Chúc bạn Trung Thu vui vẻ ❤️"
}
```

Sau đó encode config thành URL.

Ví dụ:

```text
https://domain.com/play?data=ENCODED_DATA
```

Người nhận mở link:

```text
/play?data=...
```

Web decode dữ liệu và chạy game.

---

# 5. Cách lưu config vào URL

Có thể dùng:

```text
JSON
↓
encodeURIComponent
↓
Base64
↓
URL
```

Ví dụ:

```ts
const config = {
  steps: 80,
  gifts: [
    {
      step: 20,
      message: "Cố lên nha 🌕",
    },
  ],
  finalMessage: "Trung Thu vui vẻ ❤️",
};

const json = JSON.stringify(config);

const encoded = btoa(unescape(encodeURIComponent(json)));

const url = `${location.origin}/play?data=${encoded}`;
```

Decode:

```ts
const params = new URLSearchParams(location.search);

const data = params.get("data");

const json = decodeURIComponent(escape(atob(data)));

const config = JSON.parse(json);
```

---

# 6. Nên dùng cách encode tốt hơn

Nếu config dài, URL có thể dài.

Recommended:

```text
JSON
↓
compress
↓
Base64 URL-safe
↓
URL
```

Có thể dùng thư viện:

```text
lz-string
```

Ví dụ:

```ts
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
```

Encode:

```ts
const encoded = compressToEncodedURIComponent(JSON.stringify(config));
```

URL:

```ts
const url = `${location.origin}/play?data=${encoded}`;
```

Decode:

```ts
const config = JSON.parse(decompressFromEncodedURIComponent(data));
```

Recommended dùng cách này.

---

# 7. Game Creator

Route:

```text
/create
```

UI:

```text
Số bậc thang

[ 80 ]

Quà 1

Bậc:
[ 20 ]

Lời nhắn:
[ Cố lên nha 🌕 ]

----------------

Quà 2

Bậc:
[ 50 ]

Lời nhắn:
[ Sắp tới rồi 🥮 ]

----------------

Lời chúc cuối:

[ Chúc bạn Trung Thu vui vẻ ❤️ ]

[ + Thêm quà ]

[ Tạo link ]
```

---

# 8. Sau khi bấm "Tạo link"

Frontend:

```text
form data
↓
game config
↓
JSON
↓
compress
↓
URL
```

Sau đó hiện:

```text
Game đã sẵn sàng 🌕

https://domain.com/play?data=xxxx

[ Copy Link ]

[ Chơi thử ]
```

---

# 9. Route chơi game

```text
/play
```

Đọc:

```text
?data=
```

Flow:

```text
URL
↓
decode data
↓
validate config
↓
load game
```

Nếu data lỗi:

```text
Không thể đọc game này.

[Tạo game mới]
```

---

# 10. Game Config Type

```ts
type Gift = {
  step: number;
  message: string;
};

type GameConfig = {
  steps: number;
  gifts: Gift[];
  finalMessage: string;
};
```

Có thể mở rộng sau:

```ts
type GameConfig = {
  steps: number;
  gifts: Gift[];
  finalMessage: string;

  receiverName?: string;
  creatorName?: string;

  difficulty?: "easy" | "normal" | "hard";
};
```

---

# 11. Gameplay

State chính:

```ts
position;
velocity;
kama;
gameState;
```

Ví dụ:

```ts
kama = 100;

velocity += tapPower;

velocity -= gravity * deltaTime;

kama -= kamaDrain * deltaTime;

position += velocity * deltaTime;
```

---

# 12. KAMA

Ví dụ:

```text
KAMA
████████░░ 80%
```

Tap:

```ts
kama += kamaPerTap;
velocity += tapPower;
```

Không tap:

```ts
kama -= kamaDrain;
velocity -= gravity;
```

KAMA = 0:

```text
Cuội trượt xuống
```

Sau khi trượt một đoạn:

```text
KAMA hồi lại khoảng 30%
```

để người chơi không bị kẹt.

---

# 13. Gift Checkpoint

Khi:

```ts
currentStep >= gift.step;
```

và quà chưa mở:

```text
pause game
↓
open gift
↓
show message
```

Ví dụ:

```text
🎁

"Cố lên nha 🌕"

[Tiếp tục]
```

Sau khi tiếp tục:

```text
+ một ít KAMA
```

---

# 14. Background

Background thay đổi theo độ cao.

Ví dụ:

```text
Stage 1
Làng Trung Thu Việt Nam

↓

Stage 2
Mái nhà + đèn lồng

↓

Stage 3
Mây

↓

Stage 4
Bầu trời sao

↓

Stage 5
Cung Trăng
```

---

# 15. Art Style

Phong cách:

```text
2D
Cute
Vietnamese Mid-Autumn Festival
Warm
Soft
Simple
```

Chú Cuội:

```text
đầu tròn
thân mềm
giống cục kẹo bông
tay chân nhỏ
dễ animate
```

---

# 16. Screens

Chỉ cần 4 màn chính.

## 1. Landing

```text
🌕 Trung Thu Moon Climb

Tạo một chuyến leo lên Cung Trăng
cho người bạn của bạn.

[Tạo game]

[Chơi thử]
```

---

## 2. Create

```text
/configure game
```

Người dùng:

```text
set số bậc
set quà
set lời nhắn
```

---

## 3. Play

```text
/play?data=...
```

Gameplay chính.

---

## 4. Victory

```text
🌕 Bạn đã tới Cung Trăng!

"Chúc bạn Trung Thu vui vẻ ❤️"

[Tạo game cho người khác]
```

---

# 17. Folder Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   │
│   └── play/
│       └── page.tsx
│
├── components/
│   ├── GameCreator.tsx
│   ├── KamaBar.tsx
│   ├── GiftModal.tsx
│   └── VictoryModal.tsx
│
├── game/
│   ├── GameScene.ts
│   ├── Cuoi.ts
│   └── config.ts
│
├── lib/
│   └── gameUrl.ts
│
└── types/
    └── game.ts
```

---

# 18. gameUrl.ts

Nên gom toàn bộ encode/decode vào một file.

```ts
export function encodeGameConfig(config: GameConfig) {
  // compress config
}

export function decodeGameConfig(data: string) {
  // decompress config
}
```

Không để logic encode nằm rải rác trong UI.

---

# 19. Validation

Config lấy từ URL không được tin tưởng hoàn toàn.

Cần check:

```text
steps >= 20
steps <= 200

gift.step > 0
gift.step < steps

message length <= 300

gifts <= 10
```

Nếu config lỗi:

```text
fallback về config mặc định
```

hoặc báo lỗi.

---

# 20. URL Length

Không nên cho user nhập quá nhiều text.

Recommended:

```text
max 10 gifts

mỗi message:
<= 150 ký tự

finalMessage:
<= 300 ký tự
```

Như vậy URL vẫn đủ ngắn để share.

---

# 21. MVP

MVP chỉ cần:

- [ ] Landing page
- [ ] Create page
- [ ] Set số bậc
- [ ] Add gift
- [ ] Set gift step
- [ ] Set gift message
- [ ] Set final message
- [ ] Encode config vào URL
- [ ] Copy share URL
- [ ] Decode URL
- [ ] Tap để leo
- [ ] KAMA
- [ ] Slide down
- [ ] Gift checkpoint
- [ ] Moon victory
- [ ] Mobile responsive

---

# 22. Không làm trong MVP

Không cần:

```text
Backend
Database
Login
Account
Analytics
Leaderboard
Multiplayer
Admin
Cloud storage
```

---

# 23. Development Order

## Step 1

Dựng gameplay bằng placeholder.

```text
Cuội
+
thang
+
tap
+
KAMA
```

---

## Step 2

Thêm gift checkpoint.

---

## Step 3

Làm `/create`.

---

## Step 4

Encode config vào URL.

---

## Step 5

Làm `/play?data=...`.

---

## Step 6

Thêm art Trung Thu.

---

## Step 7

Thêm animation + sound.

---

# 24. Core Idea

Điểm quan trọng nhất:

> Game phải hoạt động hoàn toàn bằng frontend và có thể share chỉ bằng URL.

Flow:

```text
Người A
↓
tạo game
↓
settings lưu vào URL
↓
copy link
↓
gửi cho Người B
↓
Người B mở link
↓
game tự load config
↓
chơi
```

Không backend.

Không database.

Không account.

---

# 25. Prompt cho Coding Agent

```text
Build a frontend-only Vietnamese Mid-Autumn web game.

Tech stack:
- Next.js
- React
- TypeScript
- Tailwind
- Phaser 3

Do not use:
- backend
- database
- authentication
- Supabase
- Firebase

All game settings must be stored inside a shareable URL.

The creator page allows users to configure:

- total ladder steps
- gift checkpoints
- gift messages
- final message

Serialize the game config into the URL.

Recommended:
use lz-string with compressToEncodedURIComponent.

Example:

/play?data=ENCODED_CONFIG

The play page must decode and validate this config.

Gameplay:

- cute round Chú Cuội mascot
- tap/click repeatedly to climb
- KAMA energy drains over time
- tapping restores KAMA and creates upward force
- if KAMA reaches zero, the character slides down
- gifts appear at configured steps
- reaching a gift pauses the game and shows its message
- reaching the final step displays the final message at the Moon

Build the simplest playable MVP first.

Prioritize:
1. gameplay feel
2. URL config
3. mobile experience
4. clean code

Do not add unnecessary infrastructure.
```
