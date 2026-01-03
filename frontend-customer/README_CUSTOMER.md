# Frontend Customer - QR Order Platform

Frontend khách hàng được xây dựng với **Next.js 14 (App Router)**, Tailwind CSS, và Zustand.

## ✨ Tính năng

- 🎯 **QR Code Scan**: Quét mã QR bàn ăn để truy cập thực đơn
- 📱 **Mobile-First**: Tối ưu cho thiết bị di động
- 🛒 **Shopping Cart**: Giỏ hàng với localStorage persistence
- 🍽️ **Menu Browse**: Xem thực đơn theo danh mục
- 📦 **Order Tracking**: Theo dõi trạng thái đơn hàng real-time
- ⚡ **Real-time Updates**: Socket.io cho cập nhật trạng thái đơn hàng
- 💾 **Offline Support**: Mock data fallback khi backend không khả dụng

## 📁 Cấu trúc thư mục

```
frontend-customer/
├── app/                    # Next.js App Router
│   ├── customer/           # Customer-facing pages
│   │   ├── menu/           # Menu page
│   │   ├── cart/           # Cart page
│   │   ├── checkout/       # Checkout page
│   │   └── order-status/   # Order tracking
│   └── qr/[tableId]/       # QR scan landing page
├── components/             # React components
│   ├── cart/               # Cart-related components
│   ├── menu/               # Menu components
│   ├── order/              # Order components
│   ├── layout/             # Layout components
│   └── shared/             # Shared/reusable components
├── hooks/                  # Custom React hooks
│   ├── useCart.ts          # Cart management hook
│   ├── useSocket.ts        # Socket.io hook
│   ├── useAuth.ts          # Authentication hook
│   └── useTracking.ts      # Analytics tracking hook
├── store/                  # Zustand stores
│   ├── cartStore.ts        # Shopping cart state
│   ├── orderStore.ts       # Order state
│   └── authStore.ts        # Auth state
├── lib/                    # Utilities
│   ├── api.ts              # API client (Axios)
│   ├── socket.ts           # Socket.io client
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

```bash
cd frontend-customer
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### 4. Build production

```bash
npm run build
npm start
```

## 🔗 Luồng sử dụng

### 1. Quét QR Code
Khách hàng quét mã QR trên bàn → Chuyển đến `/qr/[tableId]`

### 2. Xem thực đơn
Tự động chuyển đến `/customer/menu?table=XXX&branch=YYY`

### 3. Thêm món vào giỏ hàng
Chọn món → Thêm vào giỏ hàng (lưu trong localStorage)

### 4. Checkout
Xem lại đơn hàng → Xác nhận đặt món

### 5. Theo dõi đơn hàng
Chuyển đến `/customer/order-status/[orderId]` → Xem tiến trình real-time

## 📦 State Management

### Cart Store (Zustand)

```typescript
import { useCart } from '@/hooks/useCart';

function MyComponent() {
  const { items, totalPrice, addItem, removeItem } = useCart();
  
  // Add item to cart
  addItem(product, quantity, notes);
  
  // Remove item
  removeItem(productId);
}
```

### Order Store

```typescript
import { useOrderStore } from '@/store/orderStore';

function OrderComponent() {
  const { currentOrder, setCurrentOrder } = useOrderStore();
  
  setCurrentOrder(orderData);
}
```

## 🔌 Socket.io Integration

```typescript
import { useSocket } from '@/hooks/useSocket';

function OrderStatus() {
  const socket = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    // Join order room
    socket.emit('join_order', orderId);
    
    // Listen for status updates
    socket.on('order_status_changed', (data) => {
      console.log('New status:', data.status);
    });
    
    return () => {
      socket.off('order_status_changed');
      socket.emit('leave_order', orderId);
    };
  }, [socket, orderId]);
}
```

## 🎨 Components

### Shared Components

- **Button**: Nút bấm với các variant (primary, secondary, outline, ghost)
- **Modal**: Dialog modal
- **Loading**: Loading spinner
- **Header**: Navigation bar
- **Footer**: Footer component
- **MobileNav**: Bottom navigation cho mobile

### Cart Components

- **CartItem**: Hiển thị item trong giỏ hàng
- **CartSummary**: Tổng kết giỏ hàng
- **CartDrawer**: Drawer sidebar cho giỏ hàng
- **PremiumCartBar**: Floating cart bar

### Menu Components

- **ProductCard**: Card hiển thị món ăn
- **ProductListItem**: List item cho món ăn
- **CategoryFilter**: Bộ lọc danh mục
- **SearchBar**: Tìm kiếm món ăn
- **HeroSection**: Hero banner
- **PremiumCategoryTabs**: Tab danh mục premium

### Order Components

- **OrderStatusBadge**: Badge hiển thị trạng thái
- **OrderTimeline**: Timeline tiến trình đơn hàng

## 🧪 Mock Data

Khi backend không khả dụng, app sẽ tự động sử dụng mock data:

```typescript
// lib/api.ts tự động fallback
const menu = await getMenu(branchId); // Trả về mock data nếu API fail
const table = await getTable(tableId); // Trả về mock table
```

## 📱 Responsive Design

- **Mobile-First**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm, md, lg, xl
- **Bottom Navigation**: Mobile nav cho màn hình nhỏ
- **Touch-Friendly**: Button và UI element dễ chạm

## 🔒 API Integration

### API Client (Axios)

```typescript
import { getMenu, createOrder, getOrder } from '@/lib/api';

// Fetch menu
const menu = await getMenu(branchId);

// Create order
const result = await createOrder({
  tableId,
  items: [{ productId, quantity, notes }],
  notes: 'Special request',
});

// Get order details
const order = await getOrder(orderId);
```

### Error Handling

API client tự động xử lý lỗi và fallback sang mock data:

```typescript
try {
  const data = await apiCall();
} catch (error) {
  console.warn('API failed, using mock data');
  return mockData;
}
```

## 🐳 Docker

Build và chạy với Docker:

```bash
docker build -t frontend-customer .
docker run -p 3000:3000 frontend-customer
```

## 📝 TODO

- [ ] Implement Google Analytics integration
- [ ] Add PWA support (Service Worker)
- [ ] Implement push notifications
- [ ] Add product image optimization
- [ ] Implement customer login/register
- [ ] Add loyalty points display
- [ ] Implement product reviews

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

