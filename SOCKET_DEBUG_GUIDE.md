# 🔧 Socket Connection Debug Guide

## ✅ Issues Found & Fixed

### Issue 1: Vite Proxy Missing for Socket.io
**Problem:** Vite proxy only handles `/api` but not `/socket.io`
**Fix:** Added `/socket.io` proxy in `vite.config.js`

### Issue 2: Port Mismatch
**Problem:** Vite runs on port 3001, but CORS might expect 5173
**Fix:** Backend CORS already includes both ports

---

## 🧪 Step-by-Step Debug

### Step 1: Verify Backend is Running
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok","mode":"mock",...}`

### Step 2: Check Backend Socket CORS
**File:** `backend/scripts/quick-mock-server.js`
**Line 17:** Should include `'http://localhost:3001'` and `'http://localhost:5173'`

### Step 3: Check Frontend Console
Open browser console (F12) and look for:
```
🔧 Socket URL configured: http://localhost:5000
🔧 Environment: development
🔌 Connecting to Socket.io server: http://localhost:5000
   Room: { type: 'kitchen', id: '1' }
```

### Step 4: Check Network Tab
1. Open DevTools → Network
2. Filter by "WS" (WebSocket)
3. Look for connection to `ws://localhost:5000/socket.io/`
4. Status should be "101 Switching Protocols"

### Step 5: Check Backend Logs
Backend console should show:
```
🔌 Client connected: [socket-id]
📍 Client [socket-id] joined room: kitchen-1
```

---

## 🐛 Common Errors

### Error 1: "CORS policy blocked"
**Solution:**
- Check `backend/scripts/quick-mock-server.js` line 17
- Ensure `'http://localhost:3001'` is in CORS origins
- Restart backend

### Error 2: "Connection refused"
**Solution:**
- Backend not running → Start: `cd backend/scripts && node quick-mock-server.js`
- Port 5000 blocked → Check firewall

### Error 3: "Socket connects but no room_joined"
**Solution:**
- Check backend `join_room` handler
- Verify room format: `{ type: 'kitchen', id: '1' }`

---

## 📋 Quick Test Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001 (or 5173)
- [ ] Browser console shows "Connecting to Socket.io server"
- [ ] Browser console shows "Socket connected!"
- [ ] Browser console shows "Room joined: kitchen-1"
- [ ] Network tab shows WebSocket connection
- [ ] Backend logs show "Client connected"
- [ ] Alert badge shows green "Connected"

---

## 🔍 Manual Test

### Test 1: Direct Socket Connection
Open browser console and run:
```javascript
import('socket.io-client').then(({ io }) => {
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('✅ Connected!', socket.id);
    socket.emit('join_room', { type: 'kitchen', id: '1' });
  });
  
  socket.on('room_joined', (data) => {
    console.log('✅ Room joined:', data);
  });
  
  socket.on('connect_error', (err) => {
    console.error('❌ Error:', err.message);
  });
});
```

### Test 2: Check Environment Variables
In browser console:
```javascript
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
console.log('Mode:', import.meta.env.MODE);
```

---

## ✅ Expected Console Output

**Frontend (Browser Console):**
```
🔧 Socket URL configured: http://localhost:5000
🔧 Environment: development
🔌 Connecting to Socket.io server: http://localhost:5000
   Room: { type: 'kitchen', id: '1' }
✅ Socket connected! abc123xyz
📍 Joining room: { type: 'kitchen', id: '1' }
✅ Room joined: { room: 'kitchen-1', message: 'Successfully joined room' }
🔌 Socket state changed: { isConnected: true, socketId: 'abc123xyz', branchId: '1' }
```

**Backend (Terminal):**
```
🔌 Client connected: abc123xyz
📍 Client abc123xyz joined room: kitchen-1
```

---

**Status:** ✅ **FIXED** - Added socket.io proxy and enhanced logging

**Next:** Reload frontend and check browser console for connection logs

