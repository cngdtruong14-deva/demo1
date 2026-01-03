# 🚀 Real-time Menu Updates - Quick Reference

## ✅ Implemented

### Backend
- ✅ Socket events on CREATE/UPDATE/DELETE products
- ✅ Sample data from `menu.json` (20 items) & `menu-quannhautudo.json` (148 items)
- ✅ **Quick mock server** (no database needed!)
- ✅ File: `backend/src/controllers/product.controller.js`
- ✅ File: `backend/src/utils/sampleDataLoader.js`
- ✅ File: `backend/scripts/quick-mock-server.js` ← NEW!
- ✅ File: `backend/src/routes/index.js`

### Frontend Customer
- ✅ Real-time menu updates via Socket.IO
- ✅ Toast notifications for changes
- ✅ File: `frontend-customer/app/customer/menu/page.tsx`

### Frontend Admin
- ✅ Full CRUD interface with Ant Design
- ✅ Real-time refetch on socket events
- ✅ File: `frontend-admin/src/pages/Products/ProductList.tsx`

---

## 🎯 Quick Start

### Option 1: Mock Server (No Database)
```bash
# Terminal 1: Mock Backend
cd backend
node scripts/quick-mock-server.js

# Terminal 2: Customer
cd frontend-customer && npm run dev

# Terminal 3: Admin
cd frontend-admin && npm run dev
```

### Option 2: Full Setup with Docker
```bash
# Start MySQL + Redis
docker-compose up -d

# OR manually:
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8.0
docker run -d -p 6379:6379 redis:alpine

# Setup backend
cd backend
# Edit .env: DB_PASSWORD=password
npm run migrate
npm run dev

# Start frontends
cd frontend-customer && npm run dev
cd frontend-admin && npm run dev
```

**URLs:**
- Customer: http://localhost:3000/customer/menu
- Admin: http://localhost:3001/products
- API: http://localhost:5000/api/v1

---

## 🧪 Test Real-time

1. Open Customer app
2. Open Admin app
3. Admin: Click "Thêm món mới", create product
4. Customer: See toast + product appears
5. Admin (other window): See notification + table updates

---

## 📦 Sample Menus

**Default (20 items):**
```bash
GET /api/v1/menu/demo-branch-1
```

**Quán Nhậu (148 items with images):**
```bash
GET /api/v1/menu/demo-branch-1?source=menu-quannhautudo.json
```

---

## 📁 Files Modified

```
backend/
├── src/
│   ├── controllers/product.controller.js   ✅ Socket events
│   ├── utils/sampleDataLoader.js           ✅ NEW
│   └── routes/index.js                     ✅ Sample data

frontend-customer/
└── app/customer/menu/page.tsx              ✅ Real-time

frontend-admin/
└── src/pages/Products/ProductList.tsx      ✅ Full CRUD + Real-time

docs/
└── development/sample-data/
    ├── menu.json                           ✅ 20 items
    └── menu-quannhautudo.json              ✅ 148 items
```

---

## 📚 Documentation

- `REALTIME_MENU_UPDATES_GUIDE.md` - Full testing guide
- `REALTIME_MENU_UPDATES_COMPLETE.md` - Complete summary
- `REALTIME_MENU_QUICKREF.md` - This file

---

**Status:** ✅ 100% Complete  
**Date:** January 2, 2026

