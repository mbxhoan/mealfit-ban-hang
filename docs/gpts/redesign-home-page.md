Bạn là Senior Frontend Engineer + Creative Frontend Designer + Food E-commerce UI/UX Designer + Motion Designer.

Nhiệm vụ của bạn là đọc repo hiện tại và **tập trung xây dựng/refactor trang Home Page `/`** cho website bán sản phẩm **mealprep / healthy meals / đồ ăn chuẩn bị sẵn**.

Không dùng phong cách công nghệ, coding, futuristic dashboard, cyber grid, code lines, data stream hoặc premium tech SaaS.

Thay vào đó, hãy thiết kế Home Page theo hướng:

```txt
Fresh Mealprep E-commerce
Healthy Lifestyle
Clean Food Brand
Warm Minimalism
Appetizing Product-first Design
Premium but friendly
Modern Vietnamese food commerce
```

## 1. Mục tiêu chính

Biến trang `/` thành một homepage bán mealprep thật tốt:

* Nhìn ngon miệng ngay từ hero.
* Làm người dùng muốn đặt món.
* Thể hiện rõ sản phẩm là mealprep tiện lợi, lành mạnh, đẹp mắt.
* Giao diện sạch, hiện đại, dễ mua hàng.
* Có animation sinh động nhưng tự nhiên, không lố.
* Tập trung vào món ăn, combo, khẩu phần, giá, lợi ích và CTA đặt hàng.
* Responsive tốt trên mobile vì khách hàng đặt món nhiều bằng điện thoại.
* Không phá logic sản phẩm, giỏ hàng, auth, order flow, API hoặc dữ liệu hiện có.

## 2. Bắt buộc áp dụng frontend-design skill

Nếu môi trường có `frontend-design` skill, hãy dùng skill này để tạo giao diện production-grade, có aesthetic direction rõ ràng.

Aesthetic direction cần chọn theo ngành đồ ăn:

```txt
Concept: Fresh Daily Mealprep

A warm, clean, appetizing homepage built around fresh ingredients, beautiful meal boxes, soft natural colors, editorial food photography, smooth product reveals, and frictionless ordering.
```

Không được thiết kế generic kiểu:

* SaaS dashboard.
* AI landing page tím gradient.
* Công nghệ/coding/futuristic.
* Cyberpunk/neon.
* Corporate lạnh lẽo.
* Template e-commerce rẻ tiền.
* Quá nhiều hiệu ứng làm mất tập trung khỏi món ăn.

Giao diện cần có cảm giác:

* Tươi.
* Sạch.
* Ngon.
* Tin cậy.
* Dễ đặt hàng.
* Thân thiện.
* Có chút premium nhưng không xa cách.

## 3. Remotion usage — chỉ dùng nếu phù hợp với food brand

Nếu repo đã có Remotion hoặc nếu việc thêm Remotion thật sự hữu ích, hãy dùng Remotion để tạo motion asset cho homepage.

Remotion nên dùng cho:

* Hero video loop món ăn.
* Meal box reveal animation.
* Ingredient falling / ingredient floating nhẹ.
* Combo meal carousel animation.
* Before/after lifestyle animation.
* Menu of the week animation.
* Social video export 9:16 / 1:1 / 16:9 nếu cần.
* Short product motion banner cho homepage.

Không dùng Remotion cho:

* Coding lines.
* Data stream.
* Cyber grid.
* Dashboard animation.
* Futuristic particles kiểu công nghệ.

Khi viết Remotion composition:

* Dùng `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()`, `Easing`.
* Không dùng CSS transition/animation trong Remotion composition.
* Dùng `Sequence` để chia timeline.
* Dùng `AbsoluteFill` để layout scene.
* Dùng `staticFile()` cho asset trong `public/`.
* Có thể tạo still preview hoặc studio preview nếu cần.

Nếu repo chưa có Remotion và homepage không cần video asset riêng, không cần thêm dependency. Hãy dùng runtime animation nhẹ bằng CSS/Motion/Framer Motion nếu project đã có.

## 4. Phạm vi chính

Chỉ tập trung route:

```txt
/
```

Trước khi code, hãy audit:

* File route `/` đang nằm ở đâu.
* Stack frontend đang dùng.
* UI library đang dùng.
* Tailwind/CSS module/global CSS đang ở đâu.
* Có Framer Motion/Motion/GSAP/Lottie/Remotion không.
* Có data sản phẩm/menu/combo chưa.
* Home page hiện tại có những section nào.
* Có cart/order CTA chưa.
* Có responsive issue không.
* Có SEO metadata không.
* Có ảnh sản phẩm không.
* Có loading state không.
* Có error/empty state không.

Không code ngay trước khi audit.

## 5. Cấu trúc Home Page đề xuất

Trang Home `/` nên có các section sau:

## 5.1 Hero Section — phần quan trọng nhất

Hero phải làm người dùng thấy “ngon” và muốn đặt ngay.

Yêu cầu:

* Headline ngắn, mạnh, dễ hiểu.
* Subheadline nói rõ mealprep tiện lợi, lành mạnh, giao hằng ngày/tuần.
* CTA chính: “Đặt món ngay”, “Xem thực đơn”, “Chọn combo”.
* CTA phụ: “Xem menu tuần này”, “Tính khẩu phần”, “Tư vấn thực đơn”.
* Có ảnh món ăn/meal box lớn, đẹp, sắc nét.
* Có badge như “Fresh daily”, “Healthy meals”, “Ready-to-eat”, “High protein” nếu đúng với sản phẩm.
* Có price teaser nếu dữ liệu có thật, ví dụ “Chỉ từ ...”.
* Có animation reveal nhẹ cho món ăn, CTA, badge.

Visual hero nên theo hướng:

* Meal box đặt nổi bật.
* Nền sáng ấm, sạch.
* Ingredient floating rất nhẹ: rau, cà chua, trứng, gà, cá hồi, hạt, lá herbs.
* Card nhỏ hiển thị calories/protein/carbs nếu có dữ liệu.
* Menu preview dạng mini cards.
* Soft shadow, natural light, rounded surfaces.

Không được:

* Dùng background tech/coding.
* Dùng neon/cyber.
* Dùng ảnh AI nhìn giả.
* Dùng màu quá chói làm món ăn mất ngon.
* Làm CTA khó thấy.

## 5.2 Product Categories

Hiển thị nhóm sản phẩm:

* Meal theo ngày.
* Combo tuần.
* High protein.
* Low carb.
* Eat clean.
* Tăng cơ.
* Giảm cân.
* Văn phòng.
* Family combo nếu có.

Mỗi category card nên có:

* Ảnh món hoặc icon thực phẩm.
* Tên nhóm.
* Mô tả ngắn.
* CTA nhỏ.
* Hover lift nhẹ.
* Không quá nhiều text.

## 5.3 Best Sellers / Featured Meals

Hiển thị món bán chạy hoặc món nổi bật.

Card sản phẩm cần rõ:

* Ảnh món.
* Tên món.
* Trọng lượng/phần ăn nếu có.
* Calories/protein nếu có.
* Giá.
* Tag: best seller, high protein, new, low carb.
* Nút thêm vào giỏ.
* Hover đổi ảnh/zoom nhẹ nếu có.
* Loading skeleton nếu đang fetch data.

Không bịa calories/protein/giá nếu data không có.

## 5.4 Meal Plans / Combo Section

Nếu sản phẩm có combo:

* Combo 3 ngày.
* Combo 5 ngày.
* Combo 7 ngày.
* Combo văn phòng.
* Combo giảm cân.
* Combo tăng cơ.

Section này phải giúp khách hiểu nhanh:

* Mỗi combo gồm gì.
* Phù hợp với ai.
* Giá hoặc khoảng giá nếu có.
* CTA chọn combo.

Có thể dùng layout dạng pricing cards nhưng phải mềm mại, food-friendly, không giống SaaS pricing lạnh lẽo.

## 5.5 Why Choose Us

Nêu lý do chọn thương hiệu:

* Nguyên liệu tươi.
* Chế biến trong ngày.
* Định lượng rõ.
* Tiết kiệm thời gian.
* Phù hợp người bận rộn.
* Có thể chọn theo mục tiêu.
* Giao hàng tiện lợi.
* Đóng gói sạch sẽ.

Dùng icon/card nhẹ, không dùng icon công nghệ.

## 5.6 How It Works

Flow đặt món:

1. Chọn món hoặc combo.
2. Tùy chọn khẩu phần/trọng lượng nếu có.
3. Đặt hàng và xác nhận.
4. Nhận mealprep theo lịch.
5. Ăn ngon, theo dõi mục tiêu.

Có thể dùng step cards hoặc timeline mềm, có animation connector nhẹ.

## 5.7 Nutrition / Portion Section

Nếu sản phẩm có thông tin dinh dưỡng:

* Calories.
* Protein.
* Carbs.
* Fat.
* Trọng lượng.
* Mục tiêu: giảm cân, giữ dáng, tăng cơ.

Thiết kế cần dễ đọc, không biến thành dashboard công nghệ. Nên dùng nutrition pill, label mềm, mini chart nhẹ nếu phù hợp.

## 5.8 Testimonials / Social Proof

Nếu có review thật:

* Hiển thị review khách hàng.
* Ảnh thật nếu có quyền dùng.
* Rating nếu có dữ liệu thật.
* Không bịa review.

Nếu chưa có review thật:

* Tạo section “Phù hợp với” thay vì bịa testimonial.

Ví dụ:

* Dân văn phòng bận rộn.
* Người tập gym.
* Người muốn ăn sạch.
* Người muốn kiểm soát khẩu phần.
* Người không có thời gian nấu ăn.

## 5.9 FAQ

FAQ nên giải quyết các câu hỏi mua hàng:

* Món bảo quản được bao lâu?
* Có giao theo ngày không?
* Có đổi món không?
* Có chọn khẩu phần không?
* Có món giảm cân/tăng cơ không?
* Giao hàng khu vực nào?
* Thanh toán thế nào?
* Có cần hâm lại không?

## 5.10 Final CTA

CTA cuối trang:

* “Sẵn sàng ăn ngon và gọn hơn mỗi ngày?”
* “Chọn combo phù hợp với bạn”
* “Xem thực đơn hôm nay”
* “Đặt bữa đầu tiên”

Nền nên đẹp, ấm, có ảnh món/ingredient nhẹ, không quá rối.

## 6. Visual Direction

Không dùng màu tech. Dùng palette food-friendly.

Gợi ý màu:

```txt
Cream / warm white
Fresh green
Olive
Avocado
Tomato red nhẹ
Carrot orange
Soft yellow
Warm beige
Charcoal text
```

Ví dụ CSS variables:

```css
:root {
  --meal-bg: #fffaf2;
  --meal-surface: #ffffff;
  --meal-cream: #f7efe3;
  --meal-green: #4f8f45;
  --meal-green-dark: #2f5f34;
  --meal-orange: #f28c38;
  --meal-tomato: #d9573f;
  --meal-text: #243126;
  --meal-muted: #6d756e;
  --meal-border: rgba(47, 95, 52, 0.14);
  --meal-shadow: 0 24px 70px rgba(71, 56, 36, 0.12);
}
```

Typography direction:

* Display font có cảm giác organic/editorial, không quá công nghệ.
* Body font dễ đọc.
* Không dùng font quá corporate hoặc quá tech.
* Không dùng Inter/Roboto nếu muốn tránh generic, trừ khi project đã khóa design system.

Gợi ý vibe font:

```txt
Display: Fraunces / Lora / Playfair Display / DM Serif Display / Cormorant Garamond
Body: Nunito Sans / Manrope / Source Sans 3 / Plus Jakarta Sans
```

Chọn font phù hợp với brand, không cần dùng đúng các font trên nếu project đã có font riêng.

## 7. Motion Direction

Motion phải giống food/lifestyle brand:

```txt
Soft
Fresh
Natural
Warm
Appetizing
Smooth
Lightweight
```

Có thể dùng:

* Hero meal box float nhẹ.
* Ingredient drift nhẹ.
* Steam animation rất nhẹ nếu có món nóng.
* Sauce swipe / plate reveal.
* Product card hover zoom ảnh nhẹ.
* CTA press animation.
* Scroll reveal cho section.
* Category card stagger.
* Add-to-cart micro animation.
* Cart badge pulse nhẹ khi thêm món.
* Sticky order bar trên mobile nếu phù hợp.
* Menu carousel swipe mượt.

Không dùng:

* Coding line.
* Data stream.
* Cyber grid.
* Neon glow công nghệ.
* Glitch text.
* Matrix background.
* Particle quá tech.
* Animation quá nhanh hoặc quá phức tạp.

## 8. Components cần tạo/refactor

Tùy stack hiện tại, tạo hoặc refactor:

```txt
HomePage
MealHero
MealHeroVisual
IngredientFloatLayer
MealCategoryGrid
FeaturedMealCard
MealPlanCard
NutritionBadge
HowItWorks
WhyChooseUs
MealTestimonials
MealFAQ
FinalOrderCTA
FoodButton
FoodCard
Reveal
AddToCartButton
MobileStickyOrderBar
```

Nếu dùng Remotion:

```txt
MealHeroComposition
MealBoxRevealComposition
IngredientLoopComposition
WeeklyMenuComposition
```

## 9. E-commerce UX bắt buộc

Homepage bán hàng phải ưu tiên conversion:

* CTA rõ trên hero.
* Có đường đi nhanh đến menu/combo.
* Card sản phẩm có nút thêm giỏ hoặc xem chi tiết.
* Giá rõ nếu có.
* Trọng lượng/phần ăn rõ nếu có.
* Món hết hàng phải có state riêng.
* Loading không làm layout nhảy.
* Mobile đặt hàng dễ.
* Cart access dễ thấy.
* Không để animation che CTA.
* Không để thông tin quá marketing mà thiếu sản phẩm thật.

Nếu có nhiều món, ưu tiên:

* Filter nhanh theo mục tiêu.
* Category chips.
* Search món nếu có.
* “Best sellers” phía trên.

## 10. Responsive yêu cầu bắt buộc

Test Home Page ở:

```txt
320px
375px
390px
430px
768px
820px
1024px
1280px
1440px
1536px
1920px
```

Mobile cực kỳ quan trọng.

Yêu cầu mobile:

* Hero không quá cao.
* CTA nằm trong màn hình đầu tiên hoặc gần đầu.
* Product cards dễ bấm.
* Nút thêm giỏ đủ lớn.
* Không horizontal scroll.
* Category chips không vỡ layout.
* Meal image không tràn.
* Sticky cart/order bar nếu phù hợp.
* Text không quá dài.
* Không dùng motion quá nặng.

## 11. Performance

* Tối ưu ảnh món ăn.
* Dùng responsive image nếu framework hỗ trợ.
* Lazy-load section dưới fold.
* Không dùng video quá nặng ở hero nếu không có fallback.
* Không animate nhiều ảnh lớn cùng lúc.
* Dùng transform/opacity cho animation.
* Không animate layout properties nặng.
* Không thêm dependency lớn nếu không cần.
* Nếu dùng Remotion asset/video, cần poster image và fallback.
* Giảm/tắt ingredient animation trên mobile yếu nếu cần.

## 12. Accessibility

* CTA có focus-visible rõ.
* Button/link semantic đúng.
* Contrast đủ.
* Alt text cho ảnh món ăn.
* Không dùng animation flash.
* Hỗ trợ prefers-reduced-motion.
* Form/order actions dùng được bằng keyboard.
* Không chỉ dùng màu để thể hiện trạng thái.
* Giá và thông tin sản phẩm dễ đọc.

## 13. SEO / Content

Nếu project dùng Next.js hoặc framework có metadata, đảm bảo homepage có:

* Title phù hợp.
* Description phù hợp.
* Open Graph nếu có asset.
* Structured copy dễ hiểu.
* Heading hierarchy đúng.
* Không bịa claim y tế hoặc dinh dưỡng quá mức.

Tránh claim kiểu:

* “Giảm cân chắc chắn”.
* “Tốt nhất thị trường”.
* “100% healthy”.
* “Cam kết giảm mỡ”.

Dùng copy an toàn hơn:

* “Hỗ trợ ăn uống gọn gàng hơn”.
* “Dễ kiểm soát khẩu phần”.
* “Phù hợp người bận rộn”.
* “Tùy chọn theo mục tiêu ăn uống”.

## 14. Quy trình làm việc

### Phase 1 — Audit

Không code ngay.

Báo cáo:

* Home route ở đâu.
* Stack hiện tại.
* CSS/UI/motion library.
* Có Remotion không.
* Có frontend-design skill không.
* Data sản phẩm lấy từ đâu.
* Home page hiện tại thiếu gì.
* Rủi ro khi chỉnh route `/`.
* Đề xuất concept mealprep phù hợp.

### Phase 2 — Concept Direction

Chọn một concept rõ ràng.

Ví dụ:

```txt
Concept: Fresh Daily Mealprep

A warm, editorial, appetizing homepage with natural colors, soft food photography, floating ingredients, clear meal cards, and fast ordering paths for busy customers.
```

Báo cáo:

* Mood.
* Color direction.
* Typography direction.
* Motion direction.
* Section structure.
* Conversion strategy.
* Mobile strategy.

### Phase 3 — Build Foundation

Triển khai:

* Food color tokens.
* Typography setup nếu cần.
* Button/card style.
* Reveal animation.
* Ingredient/background layer.
* Responsive section container.
* Reduced motion handling.

### Phase 4 — Build Home Sections

Triển khai:

* Hero.
* Product categories.
* Featured meals.
* Meal plans/combo.
* Why choose us.
* How it works.
* Nutrition/portion section nếu có.
* Testimonials hoặc suitable-for section.
* FAQ.
* Final CTA.

### Phase 5 — Product / Cart Integration

Nếu app đã có sản phẩm/giỏ hàng:

* Kết nối FeaturedMealCard với data thật.
* Không hard-code giá nếu data có sẵn.
* Add-to-cart dùng logic hiện tại.
* Loading/error/empty state rõ.
* Không phá cart/order flow.

Nếu chưa có data thật:

* Tách mock data vào file riêng.
* Ghi rõ mock data cần thay bằng API thật.
* Không bịa claim dinh dưỡng như dữ liệu thật.

### Phase 6 — Optional Remotion Layer

Nếu phù hợp:

* Tạo Remotion composition cho meal hero hoặc weekly menu.
* Tạo motion asset food-friendly.
* Không dùng tech/coding visuals.
* Ghi rõ cách preview/render.
* Có fallback static image.

Nếu không phù hợp:

* Không thêm Remotion.
* Dùng CSS/Motion animation nhẹ.
* Báo cáo lý do.

### Phase 7 — Polish

Tinh chỉnh:

* Ảnh món ăn.
* Spacing.
* Typography.
* Hover states.
* Add-to-cart interaction.
* Mobile layout.
* CTA visibility.
* Section rhythm.
* Loading skeleton.
* Empty state.

### Phase 8 — QA

Chạy các lệnh phù hợp từ `package.json`, ví dụ:

```bash
npm run build
npm run lint
npm run typecheck
```

Kiểm tra:

* Route `/` chạy ổn.
* Không lỗi console nghiêm trọng.
* Không horizontal scroll.
* Mobile pass.
* Tablet pass.
* Desktop pass.
* Add to cart không lỗi nếu có.
* Product data không bị sai.
* Reduced motion pass.
* Ảnh không quá nặng.
* Lighthouse/performance không giảm nghiêm trọng.

## 15. Output cuối cần báo cáo

Sau khi làm xong, báo cáo:

* Đã chỉnh file nào.
* Đã tạo component nào.
* Concept thiết kế đã chọn.
* Có dùng frontend-design skill như thế nào.
* Có dùng Remotion không, vì sao.
* Nếu có Remotion: composition nào, preview/render thế nào.
* Section nào đã hoàn thành.
* Product/cart integration đã xử lý ra sao.
* Responsive đã test breakpoint nào.
* Performance/accessibility đã xử lý gì.
* Rủi ro còn lại.
* Lệnh test/build đã chạy và kết quả.

## 16. Điều kiện hoàn thành

Chỉ xem là hoàn thành khi:

* Trang `/` nhìn đúng ngành mealprep.
* Món ăn là trung tâm, không phải hiệu ứng.
* Giao diện sạch, ngon mắt, dễ đặt hàng.
* CTA rõ ràng.
* Product cards dễ hiểu.
* Mobile tốt.
* Không horizontal scroll.
* Không phá logic sản phẩm/giỏ hàng/order.
* Animation nhẹ, tự nhiên, food-friendly.
* Không còn yếu tố tech/coding/futuristic.
* Build pass.
* Code sạch, dễ maintain.
