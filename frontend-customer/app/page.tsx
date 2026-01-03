'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/menu/ProductCard';
import CategoryFilter from '@/components/menu/CategoryFilter';
import CartSummary from '@/components/cart/CartSummary';
import { getMenu, getTable, Product, Category } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function HomePage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || searchParams.get('table_id');
  const branchIdParam = searchParams.get('branch') || searchParams.get('branch_id');
  
  const [menuData, setMenuData] = useState<{
    branch: { id: string; name: string; address?: string; phone?: string };
    categories: Category[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const { addItem, setTableId, setBranchId, getItemQuantity } = useCartStore();

  // Set table and branch IDs in cart store
  useEffect(() => {
    if (tableId) setTableId(tableId);
  }, [tableId, setTableId]);

  // Fetch menu data
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);

        let targetBranchId = branchIdParam;

        // If no branch ID, try to get from table
        if (!targetBranchId && tableId) {
          try {
            const tableInfo = await getTable(tableId);
            targetBranchId = tableInfo.branch_id;
          } catch (err) {
            console.warn('Failed to fetch table info:', err);
          }
        }

        // If still no branch ID, use default branch for demo
        if (!targetBranchId) {
          console.log('No branch/table ID provided, using default branch for demo');
          targetBranchId = 'demo-branch-1';
        }

        // Save branch ID to store
        setBranchId(targetBranchId);

        // Fetch menu
        const menu = await getMenu(targetBranchId);
        setMenuData(menu);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load menu';
        setError(errorMessage);
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [branchIdParam, tableId, setBranchId]);

  // Filter products by selected category
  const filteredCategories = useMemo(() => {
    if (!menuData) return [];
    
    if (selectedCategoryId === null) {
      return menuData.categories;
    }
    
    return menuData.categories.filter(cat => cat.id === selectedCategoryId);
  }, [menuData, selectedCategoryId]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-20">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không thể tải thực đơn</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>💡 Demo Mode:</strong> Bạn có thể xem menu mẫu ngay bây giờ!
            </p>
            <p className="text-xs text-blue-600">
              Hoặc quét mã QR bàn để trải nghiệm đầy đủ.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menuData.branch.name}</h1>
              {menuData.branch.address && (
                <p className="text-sm text-gray-600 mt-1">{menuData.branch.address}</p>
              )}
              {tableId && (
                <p className="text-xs text-orange-600 mt-1">Bàn: {tableId}</p>
              )}
            </div>
            <div className="text-right">
              {menuData.branch.phone && (
                <p className="text-sm text-gray-600">📞 {menuData.branch.phone}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      {menuData.categories.length > 0 && (
        <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
          <CategoryFilter
            categories={menuData.categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
      )}

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Menu Stats */}
        <div className="mb-4 text-center">
          <p className="text-gray-600 text-sm">
            {menuData.categories.length} danh mục • {menuData.categories.reduce((sum, cat) => sum + cat.product_count, 0)} món ăn
          </p>
        </div>

        {/* Categories and Products */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy món ăn nào.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <section key={category.id} id={`category-${category.id}`}>
                {/* Category Header */}
                <div className="mb-4 flex items-center gap-3">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                </div>

                {/* Products Grid */}
                {category.products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có món ăn nào trong danh mục này.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        quantity={getItemQuantity(product.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      <CartSummary />
    </div>
  );
}
