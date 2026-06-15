export interface PricingOption {
  weight: string; // "100g" | "150g" | "200g" | "Combo"
  price: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface MealItem {
  id: string;
  name: string;
  code: string;
  category: string;
  options: PricingOption[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface OrderDetail {
  mealId: string;
  mealName: string;
  weight: string; // "100g" | "150g" | "200g" | "Combo"
  quantity: number;
  price: number;
  cost: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderDetail[];
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  deliveryFee: number;
  paymentMethod: "COD" | "Chuyển khoản" | "Tiền mặt";
  paymentStatus: "Chưa thanh toán" | "Đã thanh toán";
  status: "Mới" | "Đang xử lý" | "Đang giao" | "Đã giao" | "Đã hủy";
  deliveryDate: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export const INITIAL_MEAL_ITEMS: MealItem[] = [
  // Ức gà
  {
    id: "cg-cj",
    name: "Ức gà cajun",
    code: "MF-CG-CJ",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 16609, profit: 8391, margin: 34 },
      { weight: "150g", price: 36000, cost: 24913, profit: 11087, margin: 31 },
      { weight: "200g", price: 48000, cost: 33218, profit: 14782, margin: 31 }
    ]
  },
  {
    id: "cg-nv",
    name: "Ức gà ngũ vị",
    code: "MF-CG-NV",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 16354, profit: 8646, margin: 35 },
      { weight: "150g", price: 36000, cost: 24531, profit: 11469, margin: 32 },
      { weight: "200g", price: 48000, cost: 32708, profit: 15292, margin: 32 }
    ]
  },
  {
    id: "cg-sc",
    name: "Ức gà sả chanh",
    code: "MF-CG-SC",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 16011, profit: 8989, margin: 36 },
      { weight: "150g", price: 36000, cost: 24016, profit: 11984, margin: 33 },
      { weight: "200g", price: 48000, cost: 32022, profit: 15978, margin: 33 }
    ]
  },
  {
    id: "cg-gt",
    name: "Ứ́c gà gừng tỏi",
    code: "MF-CG-GT",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 16024, profit: 8976, margin: 36 },
      { weight: "150g", price: 36000, cost: 24037, profit: 11963, margin: 33 },
      { weight: "200g", price: 48000, cost: 32049, profit: 15951, margin: 33 }
    ]
  },
  {
    id: "cg-cr",
    name: "Ức gà̀ cà ri",
    code: "MF-CG-CR",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 15920, profit: 9080, margin: 36 },
      { weight: "150g", price: 36000, cost: 23879, profit: 12121, margin: 34 },
      { weight: "200g", price: 48000, cost: 31839, profit: 16161, margin: 34 }
    ]
  },
  {
    id: "cg-tc",
    name: "Ức gà tiêu chanh",
    code: "MF-CG-TC",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 15927, profit: 9073, margin: 36 },
      { weight: "150g", price: 36000, cost: 23890, profit: 12110, margin: 34 },
      { weight: "200g", price: 48000, cost: 31854, profit: 16146, margin: 34 }
    ]
  },
  {
    id: "cg-bbq",
    name: "Ức gà BBQ",
    code: "MF-CG-BBQ",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 15999, profit: 9001, margin: 36 },
      { weight: "150g", price: 36000, cost: 23999, profit: 12001, margin: 33 },
      { weight: "200g", price: 48000, cost: 31998, profit: 16002, margin: 33 }
    ]
  },
  {
    id: "cg-sn",
    name: "Ức gà sả nghệ",
    code: "MF-CG-SN",
    category: "Ức gà",
    options: [
      { weight: "100g", price: 25000, cost: 16261, profit: 8739, margin: 35 },
      { weight: "150g", price: 36000, cost: 24391, profit: 11609, margin: 32 },
      { weight: "200g", price: 48000, cost: 32522, profit: 15478, margin: 32 }
    ]
  },

  // Đùi gà
  {
    id: "dg-ty",
    name: "Đùi gà Teriyaki",
    code: "MF-DG-TY",
    category: "Đùi gà",
    options: [
      { weight: "100g", price: 33000, cost: 20854, profit: 12146, margin: 37 },
      { weight: "150g", price: 49000, cost: 31282, profit: 17718, margin: 36 },
      { weight: "200g", price: 66000, cost: 41709, profit: 24291, margin: 37 }
    ]
  },
  {
    id: "dg-sn",
    name: "Đùi gà sả nghệ",
    code: "MF-DG-SN",
    category: "Đùi gà",
    options: [
      { weight: "100g", price: 33000, cost: 20853, profit: 12147, margin: 37 },
      { weight: "150g", price: 49000, cost: 31280, profit: 17720, margin: 36 },
      { weight: "200g", price: 66000, cost: 41706, profit: 24294, margin: 37 }
    ]
  },
  {
    id: "dg-nv",
    name: "Đùi gà ngũ vị",
    code: "MF-DG-NV",
    category: "Đùi gà",
    options: [
      { weight: "100g", price: 33000, cost: 20454, profit: 12546, margin: 38 },
      { weight: "150g", price: 49000, cost: 30681, profit: 18319, margin: 37 },
      { weight: "200g", price: 66000, cost: 40908, profit: 25092, margin: 38 }
    ]
  },
  {
    id: "dg-cj",
    name: "Đùi gà cajun",
    code: "MF-DG-CJ",
    category: "Đùi gà",
    options: [
      { weight: "100g", price: 33000, cost: 20709, profit: 12291, margin: 37 },
      { weight: "150g", price: 49000, cost: 31063, profit: 17937, margin: 37 },
      { weight: "200g", price: 66000, cost: 41418, profit: 24582, margin: 37 }
    ]
  },

  // Cốt lết
  {
    id: "cl-mr",
    name: "Cốt lết mè rang",
    code: "MF-CL-MR",
    category: "Cốt lết",
    options: [
      { weight: "100g", price: 30000, cost: 19900, profit: 10100, margin: 34 },
      { weight: "150g", price: 44000, cost: 29850, profit: 14150, margin: 32 },
      { weight: "200g", price: 58000, cost: 39800, profit: 18200, margin: 31 }
    ]
  },
  {
    id: "cl-gt",
    name: "Cốt lết gừng tỏi",
    code: "MF-CL-GT",
    category: "Cốt lết",
    options: [
      { weight: "100g", price: 30000, cost: 19824, profit: 10176, margin: 34 },
      { weight: "150g", price: 44000, cost: 29737, profit: 14263, margin: 32 },
      { weight: "200g", price: 58000, cost: 39649, profit: 18351, margin: 32 }
    ]
  },
  {
    id: "cl-nv",
    name: "Cốt lết ngũ vị",
    code: "MF-CL-NV",
    category: "Cốt lết",
    options: [
      { weight: "100g", price: 30000, cost: 19824, profit: 10176, margin: 34 },
      { weight: "150g", price: 44000, cost: 29737, profit: 14263, margin: 32 },
      { weight: "200g", price: 58000, cost: 39649, profit: 18351, margin: 32 }
    ]
  },
  {
    id: "cl-bbq",
    name: "Cốt lết BBQ",
    code: "MF-CL-BBQ",
    category: "Cốt lết",
    options: [
      { weight: "100g", price: 30000, cost: 19791, profit: 10209, margin: 34 },
      { weight: "150g", price: 44000, cost: 29687, profit: 14313, margin: 33 },
      { weight: "200g", price: 58000, cost: 39582, profit: 18418, margin: 32 }
    ]
  },
  {
    id: "cl-cr",
    name: "Cốt lết cà ri",
    code: "MF-CL-CR",
    category: "Cốt lết",
    options: [
      { weight: "100g", price: 30000, cost: 19824, profit: 10176, margin: 34 },
      { weight: "150g", price: 44000, cost: 29737, profit: 14263, margin: 32 },
      { weight: "200g", price: 58000, cost: 39649, profit: 18351, margin: 32 }
    ]
  },

  // Nạc heo
  {
    id: "nh-tb",
    name: "Nạ̣c heo tây bắc",
    code: "MF-NH-TB",
    category: "Nạc heo",
    options: [
      { weight: "100g", price: 30000, cost: 20640, profit: 9360, margin: 31 },
      { weight: "150g", price: 44000, cost: 30961, profit: 13039, margin: 30 },
      { weight: "200g", price: 58000, cost: 41281, profit: 16719, margin: 29 }
    ]
  },
  {
    id: "nh-sn",
    name: "Nạc heo sả nghệ",
    code: "MF-NH-SN",
    category: "Nạc heo",
    options: [
      { weight: "100g", price: 30000, cost: 18661, profit: 11339, margin: 38 },
      { weight: "150g", price: 44000, cost: 27991, profit: 16009, margin: 36 },
      { weight: "200g", price: 58000, cost: 37322, profit: 20678, margin: 36 }
    ]
  },
  {
    id: "nh-nv",
    name: "Nạ̣c heo ngũ vị",
    code: "MF-NH-NV",
    category: "Nạc heo",
    options: [
      { weight: "100g", price: 30000, cost: 20354, profit: 9646, margin: 32 },
      { weight: "150g", price: 44000, cost: 30531, profit: 13469, margin: 31 },
      { weight: "200g", price: 58000, cost: 40708, profit: 17292, margin: 30 }
    ]
  },
  {
    id: "nh-xx",
    name: "Nạc heo xá xíu",
    code: "MF-NH-XX",
    category: "Nạc heo",
    options: [
      { weight: "100g", price: 30000, cost: 20647, profit: 9353, margin: 31 },
      { weight: "150g", price: 44000, cost: 30970, profit: 13030, margin: 30 },
      { weight: "200g", price: 58000, cost: 41294, profit: 16706, margin: 29 }
    ]
  },

  // Thăn bò
  {
    id: "tb-nv",
    name: "Thăn bò ngũ vị",
    code: "MF-TB-NV",
    category: "Thăn bò",
    options: [
      { weight: "100g", price: 59000, cost: 44740, profit: 14260, margin: 24 },
      { weight: "150g", price: 87000, cost: 67111, profit: 19889, margin: 23 },
      { weight: "200g", price: 116000, cost: 89481, profit: 26519, margin: 23 }
    ]
  },
  {
    id: "tb-tb",
    name: "Thăn bò tây bắc",
    code: "MF-TB-TB",
    category: "Thăn bò",
    options: [
      { weight: "100g", price: 59000, cost: 44740, profit: 14260, margin: 24 },
      { weight: "150g", price: 87000, cost: 67111, profit: 19889, margin: 23 },
      { weight: "200g", price: 116000, cost: 89481, profit: 26519, margin: 23 }
    ]
  },
  {
    id: "tb-cj",
    name: "Thăn bò̀ cajun",
    code: "MF-TB-CJ",
    category: "Thăn bò",
    options: [
      { weight: "100g", price: 59000, cost: 44709, profit: 14291, margin: 24 },
      { weight: "150g", price: 87000, cost: 67063, profit: 19937, margin: 23 },
      { weight: "200g", price: 116000, cost: 89418, profit: 26582, margin: 23 }
    ]
  },
  {
    id: "tb-tc",
    name: "Thăn bò tiêu chanh",
    code: "MF-TB-TC",
    category: "Thăn bò",
    options: [
      { weight: "100g", price: 59000, cost: 44327, profit: 14673, margin: 25 },
      { weight: "150g", price: 87000, cost: 66490, profit: 20510, margin: 24 },
      { weight: "200g", price: 116000, cost: 88654, profit: 27346, margin: 24 }
    ]
  },
  {
    id: "tb-ka",
    name: "Thăn bò kiểu Âu",
    code: "MF-TB-KA",
    category: "Thăn bò",
    options: [
      { weight: "100g", price: 59000, cost: 44824, profit: 14176, margin: 24 },
      { weight: "150g", price: 87000, cost: 67235, profit: 19765, margin: 23 },
      { weight: "200g", price: 116000, cost: 89647, profit: 26353, margin: 23 }
    ]
  },

  // Tôm
  {
    id: "tm-gt",
    name: "Tôm gừng tỏi",
    code: "MF-TM-GT",
    category: "Tôm",
    options: [
      { weight: "100g", price: 59000, cost: 45492, profit: 13508, margin: 23 },
      { weight: "150g", price: 86000, cost: 68239, profit: 17761, margin: 21 },
      { weight: "200g", price: 115000, cost: 90985, profit: 24015, margin: 21 }
    ]
  },
  {
    id: "tm-cj",
    name: "Tôm cajun",
    code: "MF-TM-CJ",
    category: "Tôm",
    options: [
      { weight: "100g", price: 59000, cost: 45777, profit: 13223, margin: 22 },
      { weight: "150g", price: 86000, cost: 68665, profit: 17335, margin: 20 },
      { weight: "200g", price: 115000, cost: 91554, profit: 23446, margin: 20 }
    ]
  },
  {
    id: "tm-ya",
    name: "Tôm kiểu Ý",
    code: "MF-TM-YA",
    category: "Tôm",
    options: [
      { weight: "100g", price: 59000, cost: 46065, profit: 12935, margin: 22 },
      { weight: "150g", price: 86000, cost: 69098, profit: 16902, margin: 20 },
      { weight: "200g", price: 115000, cost: 92131, profit: 22869, margin: 20 }
    ]
  },
  {
    id: "tm-tc",
    name: "Tôm tiêu chanh",
    code: "MF-TM-TC",
    category: "Tôm",
    options: [
      { weight: "100g", price: 59000, cost: 45395, profit: 13605, margin: 23 },
      { weight: "150g", price: 86000, cost: 68092, profit: 17908, margin: 21 },
      { weight: "200g", price: 115000, cost: 90790, profit: 24210, margin: 21 }
    ]
  },
  {
    id: "tm-xx",
    name: "Tôm xá xíu",
    code: "MF-TM-XX",
    category: "Tôm",
    options: [
      { weight: "100g", price: 59000, cost: 45715, profit: 13285, margin: 23 },
      { weight: "150g", price: 86000, cost: 68572, profit: 17428, margin: 20 },
      { weight: "200g", price: 115000, cost: 91430, profit: 23570, margin: 20 }
    ]
  },

  // Cá thu
  {
    id: "ct-cr",
    name: "Cá thu cà ri",
    code: "MF-CT-CR",
    category: "Cá thu",
    options: [
      { weight: "100g", price: 47000, cost: 29777, profit: 17223, margin: 37 },
      { weight: "150g", price: 69000, cost: 44665, profit: 24335, margin: 35 },
      { weight: "200g", price: 92000, cost: 59554, profit: 32446, margin: 35 }
    ]
  },
  {
    id: "ct-au",
    name: "Cá thu kiểu Âu",
    code: "MF-CT-AU",
    category: "Cá thu",
    options: [
      { weight: "100g", price: 47000, cost: 29822, profit: 17178, margin: 37 },
      { weight: "150g", price: 69000, cost: 44732, profit: 24268, margin: 35 },
      { weight: "200g", price: 92000, cost: 59643, profit: 32357, margin: 35 }
    ]
  },

  // Cá hồi
  {
    id: "ch-cj",
    name: "Cá hồi cajun",
    code: "MF-CH-CJ",
    category: "Cá hồi",
    options: [
      { weight: "100g", price: 63000, cost: 43807, profit: 19193, margin: 30 },
      { weight: "150g", price: 93000, cost: 65710, profit: 27290, margin: 29 },
      { weight: "200g", price: 124000, cost: 87614, profit: 36386, margin: 29 }
    ]
  },
  {
    id: "ch-au",
    name: "Cá hồi kiểu âu",
    code: "MF-CH-AU",
    category: "Cá hồi",
    options: [
      { weight: "100g", price: 63000, cost: 43792, profit: 19208, margin: 30 },
      { weight: "150g", price: 93000, cost: 65687, profit: 27313, margin: 29 },
      { weight: "200g", price: 124000, cost: 87583, profit: 36417, margin: 29 }
    ]
  },
  {
    id: "ch-bbq",
    name: "Cái hồi BBQ",
    code: "MF-CH-BBQ",
    category: "Cá hồi",
    options: [
      { weight: "100g", price: 63000, cost: 43659, profit: 19341, margin: 31 },
      { weight: "150g", price: 93000, cost: 65489, profit: 27511, margin: 30 },
      { weight: "200g", price: 124000, cost: 87318, profit: 36682, margin: 30 }
    ]
  },
  {
    id: "ch-ya",
    name: "Cá hồi kiểu Ý",
    code: "MF-CH-YA",
    category: "Cá hồi",
    options: [
      { weight: "100g", price: 63000, cost: 43797, profit: 19203, margin: 30 },
      { weight: "150g", price: 93000, cost: 65696, profit: 27304, margin: 29 },
      { weight: "200g", price: 124000, cost: 87595, profit: 36405, margin: 29 }
    ]
  },
  {
    id: "ch-sc",
    name: "Cá hồi sả chanh",
    code: "MF-CH-SC",
    category: "Cá hồi",
    options: [
      { weight: "100g", price: 63000, cost: 43179, profit: 19821, margin: 31 },
      { weight: "150g", price: 93000, cost: 64768, profit: 28232, margin: 30 },
      { weight: "200g", price: 124000, cost: 86358, profit: 37642, margin: 30 }
    ]
  },

  // Cá tầm
  {
    id: "ctl-ya",
    name: "Cá tầm kiểu Ý",
    code: "MF-CTL-YA",
    category: "Cá tầm",
    options: [
      { weight: "100g", price: 49000, cost: 29765, profit: 19235, margin: 39 },
      { weight: "150g", price: 73000, cost: 44648, profit: 28352, margin: 39 },
      { weight: "200g", price: 97000, cost: 59531, profit: 37469, margin: 39 }
    ]
  },
  {
    id: "ctl-gt",
    name: "Cá tầm gừng tỏi",
    code: "MF-CTL-GT",
    category: "Cá tầm",
    options: [
      { weight: "100g", price: 49000, cost: 29392, profit: 19608, margin: 40 },
      { weight: "150g", price: 73000, cost: 44089, profit: 28911, margin: 40 },
      { weight: "200g", price: 97000, cost: 58785, profit: 38215, margin: 39 }
    ]
  },

  // Cá bóp
  {
    id: "cbp-au",
    name: "Cá bóp kiểu Âu",
    code: "MF-CBP-AU",
    category: "Cá bóp",
    options: [
      { weight: "100g", price: 61000, cost: 44892, profit: 16108, margin: 26 },
      { weight: "150g", price: 90000, cost: 67337, profit: 22663, margin: 25 },
      { weight: "200g", price: 120000, cost: 89783, profit: 30217, margin: 25 }
    ]
  },
  {
    id: "cbp-tc",
    name: "Cá bóp tiêu chanh",
    code: "MF-CBP-TC",
    category: "Cá bóp",
    options: [
      { weight: "100g", price: 61000, cost: 44395, profit: 16605, margin: 27 },
      { weight: "150g", price: 90000, cost: 66592, profit: 23408, margin: 26 },
      { weight: "200g", price: 120000, cost: 88790, profit: 31210, margin: 26 }
    ]
  },
  {
    id: "cbp-bbq",
    name: "Cá bóp BBQ",
    code: "MF-CBP-BBQ",
    category: "Cá bóp",
    options: [
      { weight: "100g", price: 61000, cost: 44659, profit: 16341, margin: 27 },
      { weight: "150g", price: 90000, cost: 66989, profit: 23011, margin: 26 },
      { weight: "200g", price: 120000, cost: 89318, profit: 30682, margin: 26 }
    ]
  },

  // Combos
  {
    id: "combo-gd",
    name: "Combo giữ dáng",
    code: "MF-CB-GD",
    category: "Combo",
    options: [{ weight: "Combo", price: 219000, cost: 173427, profit: 45573, margin: 21 }]
  },
  {
    id: "combo-gc",
    name: "Combo giảm cân",
    code: "MF-CB-GC",
    category: "Combo",
    options: [{ weight: "Combo", price: 345000, cost: 269515, profit: 75485, margin: 22 }]
  },
  {
    id: "combo-tc",
    name: "Combo Tăng cơ",
    code: "MF-CB-TC",
    category: "Combo",
    options: [{ weight: "Combo", price: 395000, cost: 313613, profit: 81387, margin: 21 }]
  },
  {
    id: "combo-pf",
    name: "Combo Power Fit",
    code: "MF-CB-PF",
    category: "Combo",
    options: [{ weight: "Combo", price: 536000, cost: 423824, profit: 112176, margin: 21 }]
  },
  {
    id: "combo-gd-dot",
    name: "Combo giữ dáng.",
    code: "MF-CB-GD-DOT",
    category: "Combo",
    options: [{ weight: "Combo", price: 219000, cost: 172145, profit: 46855, margin: 21 }]
  },
  {
    id: "combo-gc-dot",
    name: "Combo giảm cân.",
    code: "MF-CB-GC-DOT",
    category: "Combo",
    options: [{ weight: "Combo", price: 345000, cost: 268742, profit: 76258, margin: 22 }]
  },
  {
    id: "combo-tc-dot",
    name: "Combo Tăng cơ.",
    code: "MF-CB-TC-DOT",
    category: "Combo",
    options: [{ weight: "Combo", price: 394000, cost: 313268, profit: 80732, margin: 20 }]
  },
  {
    id: "combo-pf-dot",
    name: "Combo Power Fit.",
    code: "MF-CB-PF-DOT",
    category: "Combo",
    options: [{ weight: "Combo", price: 524000, cost: 413451, profit: 110549, margin: 21 }]
  },
  {
    id: "combo-gd-v1",
    name: "Combo giữ dáng v1",
    code: "MF-CB-GD-V1",
    category: "Combo",
    options: [{ weight: "Combo", price: 219000, cost: 172145, profit: 46855, margin: 21 }]
  },
  {
    id: "combo-gc-v1",
    name: "Combo giảm cân v1",
    code: "MF-CB-GC-V1",
    category: "Combo",
    options: [{ weight: "Combo", price: 394000, cost: 310569, profit: 83431, margin: 21 }]
  },
  {
    id: "combo-tc-v1",
    name: "Combo Tăng cơ v1",
    code: "MF-CB-TC-V1",
    category: "Combo",
    options: [{ weight: "Combo", price: 466000, cost: 369023, profit: 96977, margin: 21 }]
  },
  {
    id: "combo-pf-v1",
    name: "Combo Power Fit v1",
    code: "MF-CB-PF-V1",
    category: "Combo",
    options: [{ weight: "Combo", price: 528000, cost: 413451, profit: 114549, margin: 22 }]
  },
  {
    id: "combo-gd-v2",
    name: "Combo giữ dáng v2",
    code: "MF-CB-GD-V2",
    category: "Combo",
    options: [{ weight: "Combo", price: 233000, cost: 187066, profit: 45934, margin: 20 }]
  },
  {
    id: "combo-gc-v2",
    name: "Combo giảm cân v2",
    code: "MF-CB-GC-V2",
    category: "Combo",
    options: [{ weight: "Combo", price: 413000, cost: 336700, profit: 76300, margin: 18 }]
  },
  {
    id: "combo-tc-v2",
    name: "Combo Tăng cơ v2",
    code: "MF-CB-TC-V2",
    category: "Combo",
    options: [{ weight: "Combo", price: 485000, cost: 388466, profit: 96534, margin: 20 }]
  },
  {
    id: "combo-bf-v2",
    name: "Combo Bulk Fit v2",
    code: "MF-CB-BF-V2",
    category: "Combo",
    options: [{ weight: "Combo", price: 549000, cost: 447563, profit: 101437, margin: 18 }]
  },
  {
    id: "combo-gd-v3",
    name: "Combo giữ dáng v3",
    code: "MF-CB-GD-V3",
    category: "Combo",
    options: [{ weight: "Combo", price: 234900, cost: 186264, profit: 48636, margin: 21 }]
  },
  {
    id: "combo-gc-v3",
    name: "Combo giảm cân v3",
    code: "MF-CB-GC-V3",
    category: "Combo",
    options: [{ weight: "Combo", price: 415800, cost: 333439, profit: 82361, margin: 20 }]
  },
  {
    id: "combo-tc-v3",
    name: "Combo Tăng cơ v3",
    code: "MF-CB-TC-V3",
    category: "Combo",
    options: [{ weight: "Combo", price: 487800, cost: 388735, profit: 99065, margin: 20 }]
  },
  {
    id: "combo-bf-v3",
    name: "Combo Bulk Fit v3",
    code: "MF-CB-BF-V3",
    category: "Combo",
    options: [{ weight: "Combo", price: 553500, cost: 443931, profit: 109569, margin: 20 }]
  },
  {
    id: "combo-gd-v4",
    name: "Combo giữ dáng v4",
    code: "MF-CB-GD-V4",
    category: "Combo",
    options: [{ weight: "Combo", price: 219000, cost: 172145, profit: 46855, margin: 21 }]
  },
  {
    id: "combo-gc-v4",
    name: "Combo giảm cân v4",
    code: "MF-CB-GC-V4",
    category: "Combo",
    options: [{ weight: "Combo", price: 394000, cost: 313268, profit: 80732, margin: 20 }]
  },
  {
    id: "combo-tc-v4",
    name: "Combo Tăng cơ v4",
    code: "MF-CB-TC-V4",
    category: "Combo",
    options: [{ weight: "Combo", price: 466000, cost: 365962, profit: 100038, margin: 21 }]
  },
  {
    id: "combo-bf-v4",
    name: "Combo Bulk Fit v4",
    code: "MF-CB-BF-V4",
    category: "Combo",
    options: [{ weight: "Combo", price: 524000, cost: 413451, profit: 110549, margin: 21 }]
  },
  {
    id: "combo-gd-v5",
    name: "Combo giữ dáng v5",
    code: "MF-CB-GD-V5",
    category: "Combo",
    options: [{ weight: "Combo", price: 242000, cost: 190648, profit: 51352, margin: 21 }]
  },
  {
    id: "combo-gc-v5",
    name: "Combo giảm cân v5",
    code: "MF-CB-GC-V5",
    category: "Combo",
    options: [{ weight: "Combo", price: 427000, cost: 339744, profit: 87256, margin: 20 }]
  },
  {
    id: "combo-tc-v5",
    name: "Combo Tăng cơ v5",
    code: "MF-CB-TC-V5",
    category: "Combo",
    options: [{ weight: "Combo", price: 511000, cost: 401462, profit: 109538, margin: 21 }]
  },
  {
    id: "combo-bf-v5",
    name: "Combo Bulk Fit v5",
    code: "MF-CB-BF-V5",
    category: "Combo",
    options: [{ weight: "Combo", price: 569000, cost: 452251, profit: 116749, margin: 21 }]
  },
  {
    id: "combo-gd-v6",
    name: "Combo giữ dáng v6",
    code: "MF-CB-GD-V6",
    category: "Combo",
    options: [{ weight: "Combo", price: 240000, cost: 191960, profit: 48040, margin: 20 }]
  },
  {
    id: "combo-gc-v6",
    name: "Combo giảm cân v6",
    code: "MF-CB-GC-V6",
    category: "Combo",
    options: [{ weight: "Combo", price: 424000, cost: 342148, profit: 81852, margin: 19 }]
  },
  {
    id: "combo-tc-v6",
    name: "Combo Tăng cơ v6",
    code: "MF-CB-TC-V6",
    category: "Combo",
    options: [{ weight: "Combo", price: 508000, cost: 403945, profit: 104055, margin: 20 }]
  },
  {
    id: "combo-bf-v6",
    name: "Combo Bulk Fit v6",
    code: "MF-CB-BF-V6",
    category: "Combo",
    options: [{ weight: "Combo", price: 566000, cost: 456197, profit: 109803, margin: 19 }]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Nguyên Khang",
    phone: "0901234567",
    email: "khang.nguyen@gmail.com",
    address: "72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. HCM",
    totalOrders: 12,
    totalSpent: 4250000,
    notes: "Khách ăn nhạt, không lấy hành tây, thích ăn ức gà cay.",
    createdAt: "2026-03-10"
  },
  {
    id: "cust-2",
    name: "Thùy Trang",
    phone: "0918765432",
    email: "trang.le@yahoo.com",
    address: "15 Thảo Điền, Phường Thảo Điền, Quận 2, TP. Thuận An",
    totalOrders: 7,
    totalSpent: 2850000,
    notes: "Giao trước 11h30 trưa. Chỉ lấy thịt bò và tôm.",
    createdAt: "2026-04-15"
  },
  {
    id: "cust-3",
    name: "Hoàng Minh",
    phone: "0982223344",
    email: "minh.dang@gmail.com",
    address: "450 Điện Biên Phủ, Phường 21, Quận Bình Thạnh, TP. HCM",
    totalOrders: 4,
    totalSpent: 1540000,
    notes: "Gymer tăng cơ. Thích lấy khối lượng 200g.",
    createdAt: "2026-05-01"
  },
  {
    id: "cust-4",
    name: "Minh Thư",
    phone: "0934567890",
    email: "thu.pham@outlook.com",
    address: "Chung cư Sunrise City, Nguyễn Hữu Thọ, Quận 7, TP. HCM",
    totalOrders: 18,
    totalSpent: 8350000,
    notes: "Giao cả tuần từ thứ 2 đến thứ 7. Nhận trưa lúc 11h.",
    createdAt: "2026-01-20"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "MP-20260612-001",
    customerId: "cust-1",
    customerName: "Nguyên Khang",
    customerPhone: "0901234567",
    customerAddress: "72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. HCM",
    items: [
      {
        mealId: "cg-cj",
        mealName: "Ức gà cajun",
        weight: "150g",
        quantity: 5,
        price: 36000,
        cost: 24913
      },
      {
        mealId: "tb-nv",
        mealName: "Thăn bò ngũ vị",
        weight: "200g",
        quantity: 5,
        price: 116000,
        cost: 89481
      }
    ],
    totalAmount: 760000, // 36k*5 + 116k*5 = 180k + 580k = 760k
    totalCost: 571970, // 24.913*5 + 89.481*5 = 124.565 + 447.405 = 571.970
    totalProfit: 188030,
    deliveryFee: 30000,
    paymentMethod: "Chuyển khoản",
    paymentStatus: "Đã thanh toán",
    status: "Đã giao",
    deliveryDate: "2026-06-12",
    createdAt: "2026-06-11T14:30:00Z",
    notes: "Không hành tây, ăn nhạt."
  },
  {
    id: "ord-2",
    orderNumber: "MP-20260613-001",
    customerId: "cust-3",
    customerName: "Hoàng Minh",
    customerPhone: "0982223344",
    customerAddress: "450 Điện Biên Phủ, Phường 21, Quận Bình Thạnh, TP. HCM",
    items: [
      {
        mealId: "combo-pf",
        mealName: "Combo Power Fit v1",
        weight: "Combo",
        quantity: 1,
        price: 536000,
        cost: 423824
      }
    ],
    totalAmount: 536000,
    totalCost: 423824,
    totalProfit: 112176,
    deliveryFee: 25000,
    paymentMethod: "COD",
    paymentStatus: "Chưa thanh toán",
    status: "Đang xử lý",
    deliveryDate: "2026-06-13",
    createdAt: "2026-06-12T09:15:00Z",
    notes: "Giao giờ hành chính, gọi trước 15 phút."
  },
  {
    id: "ord-3",
    orderNumber: "MP-20260613-002",
    customerId: "cust-2",
    customerName: "Thùy Trang",
    customerPhone: "0918765432",
    customerAddress: "15 Thảo Điền, Phường Thảo Điền, Quận 2, TP. Thuận An",
    items: [
      {
        mealId: "dg-ty",
        mealName: "Đùi gà Teriyaki",
        weight: "150g",
        quantity: 4,
        price: 49000,
        cost: 31282
      },
      {
        mealId: "ch-cj",
        mealName: "Cá hồi cajun",
        weight: "100g",
        quantity: 3,
        price: 63000,
        cost: 43807
      }
    ],
    totalAmount: 385000, // 49k*4 + 63k*3 = 196k + 189k = 385k
    totalCost: 256549, // 31.282*4 + 43.807*3 = 125.128 + 131.421 = 256.549
    totalProfit: 128451,
    deliveryFee: 40000,
    paymentMethod: "Chuyển khoản",
    paymentStatus: "Đã thanh toán",
    status: "Mới",
    deliveryDate: "2026-06-14",
    createdAt: "2026-06-13T07:10:00Z",
    notes: "Giao trước 11h30 trưa."
  }
];
