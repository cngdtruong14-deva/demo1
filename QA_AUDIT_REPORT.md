# 🔍 QA Audit Report - QR Order Platform
**Date:** 2025-01-15  
**Auditor:** Senior QA Architect  
**Scope:** Full codebase audit against documentation

---

## 🚨 CRITICAL ISSUES (Must Fix Immediately)

### 1. **Socket.io Room Join Event Mismatch** ⚠️ CRITICAL
**Location:** 
- Frontend: `frontend-customer/hooks/useSocket.ts:49`
- Frontend: `frontend-admin/src/hooks/useSocket.js:39`
- Backend: `backend/src/sockets/handlers/orderHandlers.js` (missing handler)
- Docs: `docs/architecture/realtime-flow.md:41`

**Issue:**
- **Frontend emits:** `socket.emit('join_room', { room })` (string)
- **Docs specify:** `socket.emit('join_room', { type: 'kitchen', id: 'branch-uuid' })` (object)
- **Backend:** No handler for `join_room` event exists

**Impact:** Socket.io room joining will **NOT WORK**. Real-time features broken.

**Fix Required:**
```javascript
// backend/src/sockets/handlers/orderHandlers.js
socket.on('join_room', (data) => {
  const { type, id } = data;
  const roomName = type === 'kitchen' ? `kitchen-${id}` : 
                   type === 'table' ? `table-${id}` :
                   type === 'order' ? `order-${id}` : 
                   type === 'admin' ? `admin-${id}` : null;
  if (roomName) {
    socket.join(roomName);
    socket.emit('room_joined', { room: roomName, message: 'Successfully joined room' });
  }
});
```

---

### 2. **Missing Socket.io Handler File** ⚠️ CRITICAL
**Location:** `backend/src/sockets/index.js:6,49`

**Issue:**
- Code imports `tableHandlers` but file `tableHandlers.js` **DOES NOT EXIST**
- This will cause **server crash** on startup

**Impact:** Backend server **CANNOT START**

**Fix Required:**
```bash
# Create missing file
touch backend/src/sockets/handlers/tableHandlers.js
```

```javascript
// backend/src/sockets/handlers/tableHandlers.js
const logger = require('../../config/logger');

module.exports = (io, socket) => {
  socket.on('table:join', (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`Socket ${socket.id} joined table room: ${tableId}`);
  });

  socket.on('table:leave', (tableId) => {
    socket.leave(`table:${tableId}`);
    logger.info(`Socket ${socket.id} left table room: ${tableId}`);
  });
};
```

---

### 3. **Kitchen Room Naming Inconsistency** ⚠️ CRITICAL
**Location:**
- Backend: `backend/src/sockets/handlers/orderHandlers.js:48`
- Frontend: `frontend-admin/src/pages/Kitchen.jsx:66`
- Docs: `docs/architecture/realtime-flow.md:86`

**Issue:**
- **Backend emits to:** `io.to('kitchen').emit('kitchen:new_order', ...)`
- **Docs specify:** `io.to('kitchen-branch123').emit('kitchen:new_order', ...)`
- **Frontend listens for:** `kitchen:new_order` ✅ (correct event name)

**Impact:** Kitchen will receive orders from **ALL branches** instead of specific branch. Multi-tenancy broken.

**Fix Required:**
```javascript
// backend/src/sockets/handlers/orderHandlers.js
const emitOrderToKitchen = (io, orderData) => {
  // Should be: kitchen-{branchId}
  io.to(`kitchen-${orderData.branchId}`).emit('kitchen:new_order', orderData);
};
```

---

### 4. **Missing API Routes** ⚠️ CRITICAL
**Location:** `backend/src/routes/index.js:8-21`

**Issue:**
- Routes are **commented out** but **frontend calls them**:
  - `POST /orders` - Called by `frontend-customer/lib/api.ts:190`
  - `GET /orders/:id` - Called by `frontend-customer/lib/api.ts:201`
  - `GET /tables/:id` - Called by `frontend-customer/lib/api.ts:179`
  - `GET /branches` - Called by `frontend-customer/lib/api.ts:213`
  - `PUT /orders/:id/status` - Called by `frontend-admin/src/services/api.js:32`
  - `PUT /orders/:id/items/:itemId/status` - Called by `frontend-admin/src/services/api.js:37`

**Impact:** All order operations, table lookups, and admin features **WILL FAIL** with 404 errors.

**Fix Required:**
Uncomment and implement routes:
```javascript
// backend/src/routes/index.js
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/branches', branchRoutes);
```

---

### 5. **Frontend Socket Room Parameter Mismatch** ⚠️ CRITICAL
**Location:** `frontend-customer/hooks/useSocket.ts:48-50`

**Issue:**
- Frontend passes `room` as **string**: `socket.emit('join_room', { room })`
- Docs specify **object** with `type` and `id`: `{ type: 'table', id: 'table-uuid' }`
- Frontend customer app uses: `room: \`order_${orderId}\`` (string)

**Impact:** Room joining fails silently, real-time updates won't work.

**Fix Required:**
```typescript
// frontend-customer/hooks/useSocket.ts
interface UseSocketOptions {
  room?: { type: string; id: string } | string; // Support both for backward compat
  // ...
}

// In useEffect:
if (room) {
  if (typeof room === 'string') {
    // Legacy: parse string format "order_123" -> { type: 'order', id: '123' }
    const [type, id] = room.split('_');
    socket.emit('join_room', { type, id });
  } else {
    socket.emit('join_room', room);
  }
}
```

---

## ⚠️ WARNINGS (Improvements Needed)

### 6. **Categories Table: Multi-tenancy Design Decision**
**Location:** `database/init.sql:39-50` vs `docs/architecture/database-schema.md:48-62`

**Issue:**
- **Database schema:** Categories table has **NO branch_id** (shared across branches)
- **Documentation:** Also shows no branch_id for categories
- **Implementation:** `Category.findByBranch()` uses JOIN with products to filter

**Status:** ✅ **INTENTIONAL DESIGN** - Categories are shared, products are branch-specific. This is correct.

**Recommendation:** Document this design decision clearly.

---

### 7. **Empty Background Jobs**
**Location:** `backend/src/jobs/index.js:14,22,30`

**Issue:**
- All job functions contain only `TODO` comments
- No actual implementation

**Impact:** Analytics, segment updates, log cleanup won't run.

**Priority:** Medium (can be implemented later)

---

### 8. **Missing Route Implementations**
**Location:** `backend/src/routes/index.js:8-21`

**Missing Routes:**
- `orderRoutes` - Order CRUD operations
- `tableRoutes` - Table management
- `branchRoutes` - Branch management
- `customerRoutes` - Customer management
- `analyticsRoutes` - Analytics endpoints
- `segmentRoutes` - Customer segments
- `recommendationRoutes` - AI recommendations
- `notificationRoutes` - Notifications
- `staffRoutes` - Staff management
- `promotionRoutes` - Promotions
- `reviewRoutes` - Product reviews
- `paymentRoutes` - Payment processing

**Priority:** High (required for full functionality)

---

### 9. **Socket.io Event Name Inconsistencies**
**Location:** Multiple files

**Issues Found:**
- ✅ `kitchen:new_order` - Consistent across backend/frontend/docs
- ✅ `order:status_update` - Consistent
- ⚠️ `join_room` - Format mismatch (see Critical Issue #1)
- ⚠️ Room naming: `kitchen` vs `kitchen-{branchId}` (see Critical Issue #3)

---

### 10. **Frontend API Endpoint Mismatches**
**Location:** `frontend-customer/lib/api.ts` vs `backend/src/routes/`

**Missing Endpoints Called by Frontend:**
- ✅ `GET /menu/:branchId` - Implemented
- ✅ `GET /menu/:branchId/summary` - Implemented
- ❌ `GET /tables/:id` - **Route missing**
- ❌ `POST /orders` - **Route missing**
- ❌ `GET /orders/:id` - **Route missing**
- ❌ `GET /branches` - **Route missing**

**Impact:** Customer app will fail when trying to:
- Get table information
- Create orders
- View order details
- Auto-detect branches

---

### 11. **Admin Portal API Endpoint Mismatches**
**Location:** `frontend-admin/src/services/api.js` vs `backend/src/routes/`

**Missing Endpoints:**
- ❌ `GET /admin/dashboard/stats` - **Route missing**
- ❌ `GET /orders?branchId=...&status=...` - **Route missing**
- ❌ `PUT /orders/:id/status` - **Route missing**
- ❌ `PUT /orders/:id/items/:itemId/status` - **Route missing**
- ❌ `GET /admin/analytics/revenue` - **Route missing**
- ❌ `GET /admin/analytics/menu-matrix` - **Route missing**

**Impact:** Admin portal will fail for:
- Dashboard statistics
- Kitchen order management
- Analytics and reports

---

### 12. **Database Schema: Products Table Missing branch_id in Docs**
**Location:** `docs/architecture/database-schema.md:65-92`

**Issue:**
- **Documentation** shows products table **WITHOUT branch_id**
- **Actual schema** (`init.sql:56-84`) **HAS branch_id** ✅
- **Comment in init.sql** says: "Multi-tenancy: Added branch_id for chain model"

**Status:** ✅ **Schema is correct**, documentation is outdated.

**Fix Required:** Update `database-schema.md` to include `branch_id` in products table.

---

## ✅ PASSED CHECKS

### Database Schema Compliance
- ✅ **Products table** has `branch_id` (multi-tenancy)
- ✅ **Orders table** has `branch_id` (multi-tenancy)
- ✅ **Tables table** has `branch_id` (multi-tenancy)
- ✅ **Products table** supports all `menu.json` fields:
  - ✅ `cost_price` (DECIMAL)
  - ✅ `preparation_time` (INT)
  - ✅ `calories` (INT)
  - ✅ `is_spicy` (BOOLEAN)
  - ✅ `is_vegetarian` (BOOLEAN)
  - ✅ `tags` (JSON)
- ✅ **Activity_logs table** exists for AI readiness
- ✅ All foreign keys properly defined
- ✅ Indexes created for performance

### Code Structure
- ✅ Naming conventions consistent:
  - JavaScript: camelCase ✅
  - Database: snake_case ✅
- ✅ File structure matches documentation
- ✅ Configuration files present (`.env.example`, `docker-compose.yml`, `tsconfig.json`)
- ✅ Seed script exists and correctly maps JSON to SQL

### Frontend Implementation
- ✅ ProductCard component displays `is_spicy` icon
- ✅ Cart state management with localStorage
- ✅ Socket.io hooks implemented
- ✅ API client using axios

### Backend Implementation
- ✅ Express app structure correct
- ✅ Middleware chain properly configured
- ✅ Error handling middleware present
- ✅ Database connection pool configured
- ✅ Socket.io initialized

---

## 🛠️ ACTION PLAN

### Immediate Fixes (Critical - Do First)

#### Fix 1: Create Missing tableHandlers.js
```bash
cat > backend/src/sockets/handlers/tableHandlers.js << 'EOF'
const logger = require('../../config/logger');

module.exports = (io, socket) => {
  socket.on('table:join', (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`Socket ${socket.id} joined table room: ${tableId}`);
  });

  socket.on('table:leave', (tableId) => {
    socket.leave(`table:${tableId}`);
    logger.info(`Socket ${socket.id} left table room: ${tableId}`);
  });
};
EOF
```

#### Fix 2: Add join_room Handler
```bash
# Edit backend/src/sockets/handlers/orderHandlers.js
# Add after line 34:
socket.on('join_room', (data) => {
  const { type, id } = data;
  if (!type || !id) {
    logger.warn(`Invalid join_room request from ${socket.id}`);
    return;
  }
  
  let roomName;
  switch (type) {
    case 'kitchen':
      roomName = `kitchen-${id}`;
      break;
    case 'table':
      roomName = `table:${id}`;
      break;
    case 'order':
      roomName = `order:${id}`;
      break;
    case 'admin':
      roomName = `admin-${id}`;
      break;
    default:
      logger.warn(`Unknown room type: ${type}`);
      return;
  }
  
  socket.join(roomName);
  socket.emit('room_joined', { room: roomName, message: 'Successfully joined room' });
  logger.info(`Socket ${socket.id} joined room: ${roomName}`);
});

socket.on('leave_room', (data) => {
  const { type, id } = data;
  if (!type || !id) return;
  
  let roomName;
  switch (type) {
    case 'kitchen': roomName = `kitchen-${id}`; break;
    case 'table': roomName = `table:${id}`; break;
    case 'order': roomName = `order:${id}`; break;
    case 'admin': roomName = `admin-${id}`; break;
    default: return;
  }
  
  socket.leave(roomName);
  logger.info(`Socket ${socket.id} left room: ${roomName}`);
});
```

#### Fix 3: Fix Kitchen Room Naming
```bash
# Edit backend/src/sockets/handlers/orderHandlers.js
# Line 47-48, change:
const emitOrderToKitchen = (io, orderData) => {
  const branchId = orderData.branchId || orderData.branch_id;
  if (!branchId) {
    logger.error('Cannot emit to kitchen: missing branchId');
    return;
  }
  io.to(`kitchen-${branchId}`).emit('kitchen:new_order', orderData);
};
```

#### Fix 4: Fix Frontend Socket Room Joining
```typescript
// Edit frontend-customer/hooks/useSocket.ts
// Replace lines 47-50:
if (room) {
  if (typeof room === 'string') {
    // Parse legacy format: "order_123" -> { type: 'order', id: '123' }
    const parts = room.split('_');
    if (parts.length === 2) {
      socket.emit('join_room', { type: parts[0], id: parts[1] });
    } else {
      console.warn('Invalid room format:', room);
    }
  } else {
    socket.emit('join_room', room);
  }
}
```

```javascript
// Edit frontend-admin/src/hooks/useSocket.js
// Lines 38-42 are already correct ✅
```

#### Fix 5: Update Frontend Customer Order Page
```typescript
// Edit frontend-customer/app/order/[id]/page.tsx
// Line 54, change:
const { isConnected, on } = useSocket({
  room: { type: 'order', id: orderId }, // Changed from string to object
  enabled: !!orderId,
});
```

### High Priority Fixes (Required for Functionality)

#### Fix 6: Implement Missing Routes
```bash
# Create orderRoutes.js
# Create tableRoutes.js  
# Create branchRoutes.js
# Uncomment in routes/index.js
```

**Estimated Time:** 4-6 hours

#### Fix 7: Update Database Schema Documentation
```bash
# Edit docs/architecture/database-schema.md
# Add branch_id to products table schema
```

### Medium Priority (Can Be Done Later)

#### Fix 8: Implement Background Jobs
- Analytics aggregation
- Segment updates
- Log cleanup

#### Fix 9: Complete Missing Route Implementations
- Customer routes
- Analytics routes
- Promotion routes
- etc.

---

## 📊 Summary Statistics

| Category | Count |
|----------|-------|
| **Critical Issues** | 5 |
| **Warnings** | 7 |
| **Passed Checks** | 12 |
| **Total Issues** | 12 |

### Severity Breakdown
- 🔴 **Critical (Blocking):** 5 issues
- 🟡 **High Priority:** 4 issues
- 🟢 **Medium Priority:** 3 issues

---

## 🎯 Recommended Fix Order

1. **Fix #2** - Create tableHandlers.js (Server won't start without it)
2. **Fix #1** - Add join_room handler (Socket.io broken)
3. **Fix #3** - Fix kitchen room naming (Multi-tenancy broken)
4. **Fix #4** - Fix frontend socket room joining (Real-time broken)
5. **Fix #5** - Update order page (Real-time tracking broken)
6. **Fix #6** - Implement missing routes (API endpoints broken)

---

## ✅ Verification Checklist

After fixes, verify:
- [ ] Backend server starts without errors
- [ ] Socket.io connections work
- [ ] Customer can create orders
- [ ] Kitchen receives orders in real-time
- [ ] Order status updates in real-time
- [ ] Multi-tenancy works (orders filtered by branch)
- [ ] All API endpoints return 200 (not 404)

---

**Report Generated:** 2025-01-15  
**Next Review:** After critical fixes implemented

