# Redux Toolkit & RTK Query Setup

This directory contains the Redux Toolkit store configuration with RTK Query for API management.

## Structure

```
store/
├── store.ts          # Main store configuration
├── hooks.ts          # Typed hooks (useAppDispatch, useAppSelector)
├── slices/           # Redux slices
│   ├── authSlice.ts  # Authentication state
│   ├── orderSlice.ts # Orders state
│   └── productSlice.ts # Products state
└── api/
    └── apiSlice.ts   # RTK Query API slice
```

## Usage

### Typed Hooks

Always use the typed hooks instead of plain `useDispatch` and `useSelector`:

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// or
import { useAppDispatch, useAppSelector } from '@/store/store';

// In your component
const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

### Authentication

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    // After successful login
    dispatch(setCredentials({
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        branchId: 'branch-1',
      },
      token: 'your-jwt-token',
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };
}
```

### RTK Query - Fetching Data

```typescript
import { useGetProductsQuery, useCreateProductMutation } from '@/store/api/apiSlice';

function ProductsPage() {
  // Fetch products
  const { data, error, isLoading } = useGetProductsQuery({ branchId: '1' });

  // Create product mutation
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const handleCreate = async () => {
    try {
      await createProduct({
        name: 'New Product',
        price: 100000,
        category: 'food',
      }).unwrap();
      // Product created, cache automatically updated
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      {data?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### RTK Query - Available Hooks

**Orders:**
- `useGetOrdersQuery(params)` - Get orders list
- `useGetOrderQuery(id)` - Get single order
- `useUpdateOrderStatusMutation()` - Update order status

**Products:**
- `useGetProductsQuery(params)` - Get products list
- `useCreateProductMutation()` - Create product
- `useUpdateProductMutation()` - Update product
- `useDeleteProductMutation()` - Delete product

**Categories:**
- `useGetCategoriesQuery(params)` - Get categories
- `useCreateCategoryMutation()` - Create category

**Branches:**
- `useGetBranchesQuery(params)` - Get branches
- `useGetBranchQuery(id)` - Get single branch

**Tables:**
- `useGetTablesQuery(params)` - Get tables
- `useGetTableQuery(id)` - Get single table

**Customers:**
- `useGetCustomersQuery(params)` - Get customers
- `useGetCustomerQuery(id)` - Get single customer

**Analytics:**
- `useGetAnalyticsQuery(params)` - Get analytics data
- `useGetDashboardStatsQuery(branchId)` - Get dashboard statistics

## Environment Variables

Make sure to set these in your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Features

- ✅ TypeScript support with full type safety
- ✅ Automatic token injection in API requests
- ✅ Automatic logout on 401 errors
- ✅ localStorage persistence for auth state
- ✅ Cache invalidation with tags
- ✅ Optimistic updates support
- ✅ DevTools integration

