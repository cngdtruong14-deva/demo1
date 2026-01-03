import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Dashboard
import Dashboard from './pages/Dashboard';

// Products
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryManager from './pages/Products/CategoryManager';

// Orders
import OrderList from './pages/Orders/OrderList';
import KitchenDisplay from './pages/Orders/KitchenDisplay';
import SocketTest from './pages/SocketTest';

// Tables
import TableLayout from './pages/Tables/TableLayout';
import QRGenerator from './pages/Tables/QRGenerator';

// Branches
import BranchManager from './pages/Branches/BranchManager';

// Analytics
import SalesDashboard from './pages/Analytics/SalesDashboard';
import HeatmapChart from './pages/Analytics/HeatmapChart';
import MenuMatrix from './pages/Analytics/MenuMatrix';

// Customers
import CustomerList from './pages/Customers/CustomerList';
import SegmentAnalysis from './pages/Customers/SegmentAnalysis';

// Settings
import PricingRules from './pages/Settings/PricingRules';
import Promotions from './pages/Settings/Promotions';

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Products */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/products/categories" element={<CategoryManager />} />

        {/* Orders */}
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/kitchen" element={<KitchenDisplay />} />

        {/* Tables */}
        <Route path="/tables" element={<TableLayout />} />
        <Route path="/tables/qr" element={<QRGenerator />} />

        {/* Branches */}
        <Route path="/branches" element={<BranchManager />} />

        {/* Analytics */}
        <Route path="/analytics" element={<SalesDashboard />} />
        <Route path="/analytics/heatmap" element={<HeatmapChart />} />
        <Route path="/analytics/menu-matrix" element={<MenuMatrix />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/segments" element={<SegmentAnalysis />} />

        {/* Settings */}
        <Route path="/settings" element={<PricingRules />} />
        <Route path="/settings/pricing" element={<PricingRules />} />
        <Route path="/settings/promotions" element={<Promotions />} />

        {/* Legacy route for kitchen */}
        <Route path="/kitchen" element={<KitchenDisplay />} />

        {/* Socket test page */}
        <Route path="/test/socket" element={<SocketTest />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
