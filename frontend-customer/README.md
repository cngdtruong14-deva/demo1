# Frontend Customer App - Next.js

Customer-facing web application for QR Order Platform built with Next.js 14, React, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend-customer/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (Menu display)
│   ├── globals.css         # Global styles with Tailwind
│   └── ...
├── components/             # React components
│   └── menu/
│       └── ProductCard.tsx # Product card component
├── lib/                    # Utilities
│   └── api.ts             # API client functions
├── public/                 # Static assets
└── ...
```

## 🎨 Features

### ProductCard Component

- ✅ Displays product image, name, description, and price
- ✅ Shows spicy icon (🌶️) when `is_spicy` is true
- ✅ Shows vegetarian badge when `is_vegetarian` is true
- ✅ Displays tags (best-seller, signature, etc.)
- ✅ "Add to Cart" button with loading state
- ✅ Responsive design with Tailwind CSS
- ✅ Image fallback for missing images

### Home Page (page.tsx)

- ✅ Fetches menu data from backend API
- ✅ ✅ Handles branch ID from URL params, localStorage, or fetches first branch
- ✅ Displays categories with products in a grid layout
- ✅ Loading and error states
- ✅ Responsive design

## 🔌 API Integration

The app fetches menu data from:
```
GET /api/v1/menu/:branchId
```

### Branch ID Resolution

1. **URL Parameter**: `?branchId=<uuid>`
2. **LocalStorage**: Cached branch ID from previous visit
3. **Auto-fetch**: Fetches first available branch if none provided

### API Response Format

```typescript
{
  success: true,
  data: {
    branch: {
      id: string;
      name: string;
      address?: string;
      phone?: string;
    };
    categories: Array<{
      id: string;
      name: string;
      icon?: string;
      products: Array<Product>;
    }>;
    metadata: {
      total_categories: number;
      total_products: number;
    };
  }
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DEFAULT_BRANCH_ID=<optional-branch-uuid>
```

## 📦 Dependencies

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🎯 Next Steps

1. **Cart Functionality**: Implement shopping cart state management
2. **Order Placement**: Connect to order API endpoints
3. **Real-time Updates**: Integrate Socket.io for order status
4. **Authentication**: Add customer login/registration
5. **QR Code Scanner**: Implement QR code scanning for table selection
6. **Payment Integration**: Add payment gateway integration

## 📝 Notes

- The app uses Next.js 14 App Router (not Pages Router)
- All components are client components (`'use client'`) for interactivity
- Image optimization is handled by Next.js Image component
- API calls use fetch with Next.js caching (revalidate: 60s)

