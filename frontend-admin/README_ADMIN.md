# Frontend Admin Portal - QR Order Platform

Admin portal được xây dựng với **React + Vite**, Redux Toolkit (RTK Query), Ant Design, và Recharts.

## ✨ Tính năng

- 🔐 **Authentication**: JWT-based login/logout với token persistence
- 🍳 **Kitchen Display System (KDS)**: Real-time order management cho bếp
- 📊 **Analytics Dashboard**: Sales reports, heatmaps, BCG matrix
- 🍽️ **Product Management**: CRUD operations cho món ăn và categories
- 📦 **Order Management**: Xem và quản lý đơn hàng
- 🏢 **Branch Management**: Quản lý chi nhánh
- 🪑 **Table Management**: Quản lý bàn ăn và tạo QR codes
- 👥 **Customer Management**: Xem thông tin khách hàng và phân khúc
- ⚙️ **Settings**: Dynamic pricing rules và promotions
- ⚡ **Real-time Updates**: Socket.io cho cập nhật đơn hàng real-time

## 📁 Cấu trúc thư mục

```
frontend-admin/
├── src/
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Orders/
│   │   │   ├── OrderList.tsx
│   │   │   └── KitchenDisplay.tsx  # KDS với Socket.io
│   │   ├── Products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── CategoryManager.tsx
│   │   ├── Tables/
│   │   │   ├── TableLayout.tsx
│   │   │   └── QRGenerator.tsx
│   │   ├── Branches/
│   │   │   └── BranchManager.tsx
│   │   ├── Analytics/
│   │   │   ├── SalesDashboard.tsx  # Sales charts
│   │   │   ├── HeatmapChart.tsx    # Peak hours heatmap
│   │   │   └── MenuMatrix.tsx      # BCG Matrix
│   │   ├── Customers/
│   │   │   ├── CustomerList.tsx
│   │   │   └── SegmentAnalysis.tsx
│   │   └── Settings/
│   │       ├── PricingRules.tsx
│   │       └── Promotions.tsx
│   │
│   ├── components/            # Reusable components
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx     # Main app layout
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── Header.tsx         # Top header
│   │   │   └── Breadcrumb.tsx     # Breadcrumb navigation
│   │   ├── charts/
│   │   │   ├── LineChart.tsx      # Line chart wrapper
│   │   │   ├── BarChart.tsx       # Bar chart wrapper
│   │   │   └── HeatmapChart.tsx   # Heatmap wrapper
│   │   └── forms/
│   │       ├── ProductForm.tsx    # Product form
│   │       └── FormField.tsx      # Form field component
│   │
│   ├── store/                 # Redux state management
│   │   ├── store.ts           # Redux store configuration
│   │   ├── hooks.ts           # Typed hooks (useAppDispatch, useAppSelector)
│   │   ├── slices/
│   │   │   ├── authSlice.ts   # Auth state (JWT, user info)
│   │   │   ├── orderSlice.ts  # Orders state (KDS)
│   │   │   └── productSlice.ts # Products state
│   │   └── api/
│   │       └── apiSlice.ts    # RTK Query API slice
│   │
│   ├── services/             # API & Socket services
│   │   ├── api.ts            # Axios API client with all endpoints
│   │   └── socket.ts         # Socket.io client
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useSocket.ts      # Socket.io hook with auto-connect
│   │
│   └── styles/
│       └── index.css         # Global styles (Tailwind)
│
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

```bash
cd frontend-admin
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env`:

```bash
cp .env.example .env
```

Sửa nội dung `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3001](http://localhost:3001) trong trình duyệt.

### 4. Build production

```bash
npm run build
npm run preview
```

## 🔐 Authentication Flow

### Login

```typescript
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { login } from '@/services/api';

const handleLogin = async (email: string, password: string) => {
  const response = await login(email, password);
  const { token, user } = response.data;
  
  // Save to Redux & localStorage
  dispatch(setCredentials({ user, token }));
};
```

### Auto-logout on 401

API client tự động xử lý 401 Unauthorized:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🍳 Kitchen Display System (KDS)

### Tính năng KDS

- ✅ Real-time order updates via Socket.io
- ✅ Auto-refresh khi có đơn mới
- ✅ Color-coded elapsed time (green → yellow → orange → red)
- ✅ Item-level status tracking (pending → cooking → ready)
- ✅ Visual alerts for urgent orders
- ✅ Branch filtering
- ✅ Order notes display

### Socket.io Integration

`src/pages/Orders/KitchenDisplay.tsx`:

```typescript
import { useSocket } from '@/hooks/useSocket';

const { socket, isConnected, on, off } = useSocket({
  room: { type: 'kitchen', id: branchId },
  enabled: !!branchId,
});

useEffect(() => {
  if (!isConnected || !socket) return;

  // Listen for new orders
  const cleanup1 = on("new_order", (orderData) => {
    dispatch(addOrder(transformOrder(orderData)));
  });

  // Listen for order updates
  const cleanup2 = on("order:status_update", (data) => {
    dispatch(updateOrder(data));
  });

  return () => {
    cleanup1();
    cleanup2();
  };
}, [isConnected, socket]);
```

### useSocket Hook

`src/hooks/useSocket.ts`:

```typescript
import { useSocket } from '@/hooks/useSocket';

// Auto-connect with room
const { socket, isConnected, on, off } = useSocket({
  room: { type: 'kitchen', id: '1' },
  enabled: true,
});

// Listen to events
const cleanup = on('event_name', (data) => {
  console.log('Event received:', data);
});

// Cleanup
return () => cleanup();
```

## 📊 Analytics

### Sales Dashboard

`src/pages/Analytics/SalesDashboard.tsx`:

- Revenue trend (Line chart)
- Top products (Bar chart)
- Key metrics (Cards)

### Heatmap Chart

`src/pages/Analytics/HeatmapChart.tsx`:

- Peak dining hours visualization
- Color intensity based on order volume
- Recharts-based implementation

### Menu Matrix (BCG Matrix)

`src/pages/Analytics/MenuMatrix.tsx`:

- Product performance quadrants:
  - Stars (high profit, high popularity)
  - Cash Cows (high profit, low popularity)
  - Question Marks (low profit, high popularity)
  - Dogs (low profit, low popularity)

## 🎨 UI Components

### Layout Components

- **MainLayout**: App layout với Sidebar + Header
- **Sidebar**: Navigation menu với icons
- **Header**: Top bar với user dropdown
- **Breadcrumb**: Auto breadcrumb từ route

### Chart Components

- **LineChart**: Recharts Line chart wrapper
- **BarChart**: Recharts Bar chart wrapper
- **HeatmapChart**: Custom heatmap cho peak hours

### Form Components

- **ProductForm**: Product creation/edit form
- **FormField**: Reusable form field với validation

## 🔧 State Management

### Redux Slices

#### authSlice

```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';

const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
```

#### orderSlice

```typescript
import { setOrders, addOrder, updateOrder } from '@/store/slices/orderSlice';

const { orders, loading } = useAppSelector((state) => state.orders);
```

#### productSlice

```typescript
import { setProducts, addProduct } from '@/store/slices/productSlice';

const { products, loading } = useAppSelector((state) => state.products);
```

### RTK Query (Future Enhancement)

`src/store/api/apiSlice.ts` đã được setup để sử dụng RTK Query cho API caching:

```typescript
import { apiSlice } from '@/store/api/apiSlice';

const { data, error, isLoading } = useGetProductsQuery();
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

### Orders

- `GET /orders/kitchen/:branchId` - Get kitchen orders
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:orderId/items/:itemId/status` - Update item status

### Products

- `GET /products` - List products
- `GET /products/:id` - Get product
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Tables

- `GET /tables` - List tables
- `POST /tables` - Create table
- `PATCH /tables/:id` - Update table
- `GET /tables/:id/qr` - Generate QR code

### Analytics

- `GET /analytics/sales` - Sales report
- `GET /analytics/revenue` - Revenue report
- `GET /analytics/products` - Product performance
- `GET /analytics/peak-hours` - Peak hours data

## 🔌 Socket.io Events

### Client Emits

```typescript
socket.emit('join_room', { type: 'kitchen', id: branchId });
socket.emit('leave_room', { type: 'kitchen', id: branchId });
```

### Server Emits (Client Listens)

```typescript
socket.on('new_order', (orderData) => { /* ... */ });
socket.on('kitchen:new_order', (orderData) => { /* ... */ });
socket.on('order:status_update', (data) => { /* ... */ });
socket.on('kitchen:item_ready', (data) => { /* ... */ });
```

## 🎯 Best Practices

### TypeScript

- Full type safety cho API responses
- Interfaces cho Order, Product, Customer, etc.
- Typed Redux hooks (useAppDispatch, useAppSelector)

### Error Handling

- Try-catch blocks trong async functions
- Ant Design notifications cho user feedback
- 401 auto-redirect to login

### Performance

- Code splitting (vendor, redux, ui, charts)
- Lazy loading routes (future)
- Memoization với React.memo, useMemo, useCallback
- Debounce cho search inputs

### Security

- JWT token in localStorage
- Authorization header auto-injection
- Token expiry handling

## 📦 Dependencies

### Core

- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **react-router-dom**: ^6.20.1
- **vite**: ^5.0.8

### State Management

- **@reduxjs/toolkit**: ^2.11.2
- **react-redux**: ^9.2.0

### UI Framework

- **antd**: ^5.12.1 (Ant Design)
- **@ant-design/icons**: ^5.2.6

### Charts

- **recharts**: ^2.10.3

### HTTP & Real-time

- **axios**: ^1.6.2
- **socket.io-client**: ^4.6.1

### Utilities

- **dayjs**: ^1.11.10 (Date manipulation)

## 🐳 Docker

Build và chạy với Docker:

```bash
docker build -t frontend-admin .
docker run -p 3001:3001 frontend-admin
```

## 🧪 Testing (Future)

```bash
# Unit tests (Jest + React Testing Library)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## 📝 TODO / Enhancements

- [ ] Add Login/Register pages
- [ ] Implement RTK Query fully (replace axios calls)
- [ ] Add permission-based UI (RBAC)
- [ ] Implement dashboard widgets
- [ ] Add real-time notifications (toast)
- [ ] Add export to CSV/Excel functionality
- [ ] Add print functionality for orders
- [ ] Implement dark mode
- [ ] Add multi-language support (i18n)
- [ ] Add comprehensive unit tests
- [ ] Add E2E tests with Playwright

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

---

**Author**: Smart Restaurant Team  
**Last Updated**: January 2, 2025

