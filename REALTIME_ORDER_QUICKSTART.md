# ⚡ Real-time Order Flow - Quick Reference

## ✅ Implementation Complete

### Backend Changes

**File:** `backend/src/controllers/order.controller.js`
- ✅ Emits socket events after order creation
- ✅ Fetches `table_number` from database
- ✅ Broadcasts to `kitchen-${branchId}` room
- ✅ Logs: `🔥 New Order emitted: [OrderNumber]`

**Files:** `backend/src/config/app.js` + `socket.js`
- ✅ CORS updated for ports: 3000, 3001, 5173

---

### Frontend Customer

**File:** `frontend-customer/app/customer/checkout/page.tsx`
- ✅ Calls `POST /api/v1/orders`
- ✅ No socket emission (security)
- ✅ Redirects to order status on success

---

### Frontend Admin

**File:** `frontend-admin/src/pages/Orders/KitchenDisplay.tsx`
- ✅ Connects to `kitchen-${branchId}` room
- ✅ Listens for `new_order` and `kitchen:new_order`
- ✅ Dispatches Redux `addOrder()` action
- ✅ Plays beep sound notification
- ✅ Shows toast: `🔔 Đơn hàng mới từ Bàn [X]`

---

## 🧪 Quick Test

### Terminal 1: Backend
```bash
cd backend
node scripts/quick-mock-server.js
```

### Terminal 2: Customer
```bash
cd frontend-customer
npm run dev
```

### Terminal 3: Admin
```bash
cd frontend-admin
npm run dev
```

### Test Flow
1. Open Admin KDS: `http://localhost:5173/orders/kitchen`
2. Check socket status: Should be green "Connected"
3. Open Customer: `http://localhost:3000/customer/menu`
4. Add items → Cart → Checkout → "Xác nhận đặt món"
5. **Watch Admin KDS:**
   - 🔔 Toast notification appears
   - 🔊 Beep sound plays
   - 📦 New order card added to grid

---

## 🎯 Expected Console Logs

### Backend
```
🔥 New Order emitted: ORD-1704276800000 (ID: 123) to kitchen-1
   Table: Bàn 1, Total: 150,000đ, Items: 2
```

### Frontend Admin
```
🔥 New order received via socket: {orderNumber: "ORD-...", ...}
✅ Order ORD-... added to KDS
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin not receiving | Check socket status badge (green = connected) |
| No audio | Click page first (browser audio policy) |
| Wrong table number | Check `tables` table has `table_number` column |
| Room mismatch | Verify branchId = "1" on both admin and backend |

---

**Full documentation:** See `REALTIME_ORDER_NOTIFICATION_COMPLETE.md`

**Status:** ✅ Ready to test!

