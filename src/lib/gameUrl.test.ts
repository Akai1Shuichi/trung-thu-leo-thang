import {
  encodeGameConfig,
  decodeGameConfig,
  validateGameConfigDetailed,
  validateGameConfig,
  getSafeGameConfig,
  DEFAULT_GAME_CONFIG,
  URL_CONFIG_LIMITS,
} from "./gameUrl";
import { GameConfig } from "@/types/game";

function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ GAME URL ENGINE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS]: ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL]: ${testName} ${detail ? "- " + detail : ""}`);
      failed++;
    }
  }

  // 1. Kiểm tra cấu hình mặc định (DEFAULT_GAME_CONFIG)
  assert(validateGameConfig(DEFAULT_GAME_CONFIG), "Cấu hình mặc định phải hợp lệ");

  // 2. Kiểm tra Encode và Decode hai chiều (Round-trip integrity)
  const sampleConfig: GameConfig = {
    steps: 100,
    gifts: [
      { step: 20, message: "Bánh dẻo thơm ngon! 🌕" },
      { step: 50, message: "Đèn ông sao lung linh! ⭐" },
      { step: 80, message: "Trăng tròn vành vạnh! 🏮" },
    ],
    finalMessage: "Chúc mừng bạn đã tới Cung Trăng đoàn viên! ❤️",
    receiverName: "Bé An",
    creatorName: "Chú Cuội",
    difficulty: "normal",
  };

  const encoded = encodeGameConfig(sampleConfig);
  assert(typeof encoded === "string" && encoded.length > 0, "Mã hóa config thành chuỗi không rỗng");
  console.log(`   ℹ️ Độ dài chuỗi nén URL: ${encoded.length} ký tự`);

  const decoded = decodeGameConfig(encoded);
  assert(decoded !== null, "Giải mã chuỗi hợp lệ không được trả về null");
  assert(decoded?.steps === sampleConfig.steps, "Số bậc giải mã khớp với ban đầu");
  assert(decoded?.gifts.length === sampleConfig.gifts.length, "Số lượng quà giải mã khớp");
  assert(decoded?.gifts[0].message === sampleConfig.gifts[0].message, "Nội dung quà giải mã khớp");
  assert(decoded?.finalMessage === sampleConfig.finalMessage, "Lời chúc cuối giải mã khớp");
  assert(decoded?.receiverName === sampleConfig.receiverName, "Tên người nhận giải mã khớp");

  // 3. Kiểm tra Validation giới hạn số bậc thang (steps)
  assert(!validateGameConfig({ ...sampleConfig, steps: 19 }), "Từ chối số bậc < 20");
  assert(!validateGameConfig({ ...sampleConfig, steps: 201 }), "Từ chối số bậc > 200");
  assert(!validateGameConfig({ ...sampleConfig, steps: 50.5 }), "Từ chối số bậc không phải số nguyên");
  assert(validateGameConfig({ ...sampleConfig, steps: 20, gifts: [{ step: 10, message: "Bánh dẻo" }] }), "Chấp nhận số bậc tối thiểu 20");
  assert(validateGameConfig({ ...sampleConfig, steps: 200 }), "Chấp nhận số bậc tối đa 200");

  // 4. Kiểm tra Validation lời chúc cuối (finalMessage)
  assert(!validateGameConfig({ ...sampleConfig, finalMessage: "" }), "Từ chối lời chúc cuối rỗng");
  assert(!validateGameConfig({ ...sampleConfig, finalMessage: "   " }), "Từ chối lời chúc toàn khoảng trắng");
  assert(
    !validateGameConfig({ ...sampleConfig, finalMessage: "A".repeat(URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH + 1) }),
    `Từ chối lời chúc > ${URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH} ký tự`
  );

  // 5. Kiểm tra Validation danh sách quà (gifts)
  assert(
    !validateGameConfig({
      ...sampleConfig,
      gifts: Array.from({ length: 11 }, (_, i) => ({ step: i + 1, message: `Quà ${i}` })),
    }),
    "Từ chối vượt quá 10 hộp quà"
  );

  assert(
    !validateGameConfig({
      ...sampleConfig,
      gifts: [{ step: 0, message: "Quà tại bậc 0" }],
    }),
    "Từ chối quà tại bậc <= 0"
  );

  assert(
    !validateGameConfig({
      ...sampleConfig,
      steps: 50,
      gifts: [{ step: 50, message: "Quà tại bậc đích" }],
    }),
    "Từ chối quà tại bậc >= tổng số bậc"
  );

  assert(
    !validateGameConfig({
      ...sampleConfig,
      gifts: [
        { step: 20, message: "Quà 1" },
        { step: 20, message: "Quà 2 trùng bậc" },
      ],
    }),
    "Từ chối quà trùng bậc thang"
  );

  assert(
    !validateGameConfig({
      ...sampleConfig,
      gifts: [{ step: 20, message: "A".repeat(URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH + 1) }],
    }),
    `Từ chối lời nhắn quà > ${URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH} ký tự`
  );

  // 6. Kiểm tra giải mã chuỗi rác / hỏng (Corrupted string)
  const corruptedDecoded = decodeGameConfig("chuoi-rac-khong-the-giai-ma-xyz-123");
  assert(corruptedDecoded === null, "Chuỗi hỏng phải trả về null khi giải mã");

  const emptyDecoded = decodeGameConfig("");
  assert(emptyDecoded === null, "Chuỗi rỗng phải trả về null khi giải mã");

  // 7. Kiểm tra hàm getSafeGameConfig (Fallback helper)
  const safeFallback = getSafeGameConfig("chuoi-loi");
  assert(safeFallback.isDefault === true, "getSafeGameConfig fallback về mặc định khi link lỗi");
  assert(safeFallback.error !== undefined, "getSafeGameConfig báo lỗi khi link lỗi");

  const safeSuccess = getSafeGameConfig(encoded);
  assert(safeSuccess.isDefault === false, "getSafeGameConfig nhận đúng config từ link hợp lệ");

  // 8. Kiểm tra chi tiết thông báo lỗi (validateGameConfigDetailed)
  const detailCheck = validateGameConfigDetailed({ ...sampleConfig, steps: 10 });
  assert(detailCheck.isValid === false && Boolean(detailCheck.error?.includes("20 đến 200")), "Chi tiết lỗi mô tả đúng nguyên nhân");

  console.log("=========================================");
  console.log(`KẾT QUẢ: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
