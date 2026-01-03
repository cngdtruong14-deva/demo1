# 🔧 Fix: Menu chỉ hiển thị 3 món thay vì 15

## 🐛 Vấn đề

Frontend-customer chỉ hiển thị **3 món** thay vì **15 món** như mong đợi.

## 🔍 Nguyên nhân

Có 2 nơi chứa mock data:

1. **Backend** (`backend/src/routes/index.js`): Có đầy đủ **15 products** ✅
2. **Frontend fallback** (`frontend-customer/lib/api.ts`): Function `getInlineMockData()` chỉ có **2 products** ❌

**Flow hoạt động:**
```
Frontend call getMenu() 
  → Try API /menu/:branchId
  → If fail → Use getMenuMock()
    → Try fetch /api/mock-menu.json (không có)
    → Fallback to getInlineMockData() ← CHỈ CÓ 2 PRODUCTS!
```

Khi backend chưa chạy hoặc API fails, frontend chỉ hiển thị 2 món từ `getInlineMockData()`.

## ✅ Giải pháp

Update `getInlineMockData()` trong `frontend-customer/lib/api.ts` để có **15 products đầy đủ**.

### Changes Made

File: `frontend-customer/lib/api.ts`

**Before:**
```typescript
function getInlineMockData() {
  return {
    // ...
    products: [
      { id: 'prod-001', name: 'Gỏi Cuốn Tôm Thịt', ... },
      { id: 'prod-002', name: 'Phở Bò Tái', ... },
      // Chỉ 2 món!
    ],
  };
}
```

**After:**
```typescript
function getInlineMockData() {
  return {
    // ...
    products: [
      // Khai Vị (3 món)
      { id: 'prod-001', name: 'Gỏi Cuốn Tôm Thịt', ... },
      { id: 'prod-002', name: 'Chả Giò Rế', ... },
      { id: 'prod-003', name: 'Salad Trộn', ... },
      
      // Món Chính (4 món)
      { id: 'prod-004', name: 'Phở Bò Tái', ... },
      { id: 'prod-005', name: 'Bún Chả Hà Nội', ... },
      { id: 'prod-006', name: 'Cơm Tấm Sườn Bì', ... },
      { id: 'prod-007', name: 'Mì Xào Giòn Hải Sản', ... },
      
      // Đồ Uống (5 món)
      { id: 'prod-008', name: 'Trà Đá', ... },
      { id: 'prod-009', name: 'Nước Cam Vắt', ... },
      { id: 'prod-010', name: 'Cà Phê Sữa Đá', ... },
      { id: 'prod-011', name: 'Trà Sữa Trân Châu', ... },
      { id: 'prod-012', name: 'Sinh Tố Bơ', ... },
      
      // Tráng Miệng (3 món)
      { id: 'prod-013', name: 'Chè Ba Màu', ... },
      { id: 'prod-014', name: 'Bánh Flan Caramen', ... },
      { id: 'prod-015', name: 'Kem Dừa Non', ... },
      
      // TOTAL: 15 món!
    ],
  };
}
```

## 🎯 Kết quả

Bây giờ frontend sẽ hiển thị **15 món** trong cả 2 trường hợp:
- ✅ Backend đang chạy: Lấy từ API `/menu/:branchId` (15 món)
- ✅ Backend không chạy: Fallback sang `getInlineMockData()` (15 món)

### Menu breakdown:
- 🥗 Khai Vị: 3 món
- 🍜 Món Chính: 4 món
- 🥤 Đồ Uống: 5 món
- 🍰 Tráng Miệng: 3 món

**TOTAL: 15 món**

## 🧪 Test

```bash
# Stop backend nếu đang chạy
# Start frontend only
cd frontend-customer
npm run dev

# Open browser
http://localhost:3000

# Expected: Thấy 15 món trong 4 categories
```

## 📝 Note

Giờ đây frontend hoàn toàn **standalone** và có thể demo mà không cần backend!

---

**Date:** January 2, 2026  
**Status:** ✅ FIXED  
**Products:** 2 → 15 ✅

