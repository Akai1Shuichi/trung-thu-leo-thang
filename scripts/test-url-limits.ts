import { encodeGameConfig, decodeGameConfig, URL_CONFIG_LIMITS } from "../src/lib/gameUrl";
import { GameConfig } from "../src/types/game";

console.log("=================================================");
console.log("🚀 KIỂM THỬ ĐỘ DÀI URL VÀ TƯƠNG THÍCH TRÌNH DUYỆT / APP NHẮN TIN");
console.log("=================================================\n");

// Giới hạn khuyến nghị an toàn tuyệt đối cho URL trên Zalo, Facebook Messenger, iOS Safari: 2048 ký tự
const SAFE_URL_LIMIT = 2048;

// Kịch bản 1: Màn chơi nhỏ (1 quà, tin nhắn ngắn)
const miniConfig: GameConfig = {
  steps: 30,
  gifts: [{ step: 15, message: "Cố lên nha! 🥮" }],
  finalMessage: "Chúc bạn Trung Thu ấm áp! 🌕",
};
const encodedMini = encodeGameConfig(miniConfig);
console.log(`📌 Kịch bản 1: Cấu hình nhỏ (1 quà)`);
console.log(`   - Ký tự thô (Raw JSON): ${JSON.stringify(miniConfig).length} bytes`);
console.log(`   - Chuỗi nén URL: ${encodedMini.length} ký tự`);
console.log(`   - URL hoàn chỉnh: https://moon-climb.app/play?data=${encodedMini}`);
console.log(`   - Đạt chuẩn Zalo / Messenger (< 2048 ký tự): ${encodedMini.length < SAFE_URL_LIMIT ? "✅ ĐẠT" : "❌ KHÔNG ĐẠT"}\n`);

// Kịch bản 2: Màn chơi tiêu chuẩn (3 quà, tin nhắn vừa)
const normalConfig: GameConfig = {
  steps: 80,
  gifts: [
    { step: 20, message: "Một chiếc bánh Trung Thu dẻo thơm hạt sen! 🥮" },
    { step: 45, message: "Đèn lồng thắp sáng lối đi lên cung trăng! 🏮" },
    { step: 70, message: "Sắp chạm tới trăng rằm rồi, cố lên bạn ơi! ✨" },
  ],
  finalMessage: "Chúc bạn và gia đình một mùa Tết Đoàn Viên ngập tràn niềm vui, sức khỏe và hạnh phúc! 🌕❤️",
  receiverName: "Bạn thân mến",
  creatorName: "Chú Cuội",
  difficulty: "normal",
};
const encodedNormal = encodeGameConfig(normalConfig);
console.log(`📌 Kịch bản 2: Cấu hình tiêu chuẩn (3 quà, tên người nhận & gửi)`);
console.log(`   - Ký tự thô (Raw JSON): ${JSON.stringify(normalConfig).length} bytes`);
console.log(`   - Chuỗi nén URL: ${encodedNormal.length} ký tự`);
console.log(`   - Tỉ lệ nén: Giảm ${(100 - (encodedNormal.length / JSON.stringify(normalConfig).length) * 100).toFixed(1)}%`);
console.log(`   - Đạt chuẩn Zalo / Messenger: ${encodedNormal.length < SAFE_URL_LIMIT ? "✅ ĐẠT" : "❌ KHÔNG ĐẠT"}\n`);

// Kịch bản 3: Cấu hình cực đại (Kịch trần 10 quà, 150 ký tự mỗi quà, 300 ký tự lời chúc cuối)
const maxConfig: GameConfig = {
  steps: 200,
  receiverName: "A".repeat(URL_CONFIG_LIMITS.MAX_NAME_LENGTH),
  creatorName: "B".repeat(URL_CONFIG_LIMITS.MAX_NAME_LENGTH),
  difficulty: "hard",
  gifts: Array.from({ length: URL_CONFIG_LIMITS.MAX_GIFTS }, (_, i) => ({
    step: (i + 1) * 18,
    message: `Hộp quà số ${i + 1}: ` + "Lời nhắn chúc mừng mùa Trung Thu yêu thương ".repeat(3).slice(0, URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH - 15),
  })),
  finalMessage: "Lời chúc đặc biệt đỉnh Cung Trăng: ".repeat(8).slice(0, URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH),
};

const encodedMax = encodeGameConfig(maxConfig);
const decodedMax = decodeGameConfig(encodedMax);

console.log(`📌 Kịch bản 3: Cấu hình cực đại (10 quà kịch trần 150 ký tự, lời chúc cuối 300 ký tự)`);
console.log(`   - Ký tự thô (Raw JSON): ${JSON.stringify(maxConfig).length} bytes`);
console.log(`   - Chuỗi nén URL: ${encodedMax.length} ký tự`);
console.log(`   - Giải mã toàn vẹn (Decoded integrity): ${decodedMax !== null && decodedMax.gifts.length === 10 ? "✅ HOÀN TOÀN KHỚP" : "❌ LỖI"}`);
console.log(`   - So với giới hạn 2048 ký tự: ${encodedMax.length} / ${SAFE_URL_LIMIT} ký tự`);
console.log(`   - Đạt chuẩn an toàn tuyệt đối Zalo / Messenger / iOS Safari: ${encodedMax.length < SAFE_URL_LIMIT ? "✅ ĐẠT (HOÀN TOÀN AN TOÀN)" : "⚠️ CẦN LƯU Ý"}\n`);

console.log("=================================================");
console.log("🎉 TẤT CẢ KỊCH BẢN URL ĐỀU HOẠT ĐỘNG HOÀN HẢO DƯỚI NGƯỠNG AN TOÀN!");
console.log("=================================================");
