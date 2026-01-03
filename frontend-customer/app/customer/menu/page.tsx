"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getMenu, getTable, MenuResponse, Category, Product } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import HeroSection from "@/components/menu/HeroSection";
import ProductListItem from "@/components/menu/ProductListItem";
import PremiumCategoryTabs from "@/components/menu/PremiumCategoryTabs";
import PremiumCartBar from "@/components/cart/PremiumCartBar";
import { useSocket } from "@/hooks/useSocket";

// Toast notification component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
  >
    <span className="text-lg">🍽️</span>
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
      ✕
    </button>
  </motion.div>
);

export default function MenuPage() {
  const searchParams = useSearchParams();
  const branchIdParam =
    searchParams.get("branch_id") || searchParams.get("branch") || "";
  const tableIdParam =
    searchParams.get("table_id") || searchParams.get("table") || "";

  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>(branchIdParam);
  const [tableId, setTableId] = useState<string>(tableIdParam);
  const [toast, setToast] = useState<string | null>(null);

  const categorySectionsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const {
    addItem,
    removeItem,
    setTableId: setCartTableId,
    setBranchId: setCartBranchId,
    getItemQuantity,
  } = useCartStore();

  // 🔥 Real-time: Listen for menu updates via Socket.IO
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🔌 Socket connected, listening for menu updates...');

    // Listen for menu_updated events
    const handleMenuUpdate = (data: any) => {
      console.log('📡 Received menu_updated event:', data);

      const { action, product, productId } = data;

      if (!menuData) return;

      // Update local menu state based on action
      if (action === 'create' && product) {
        // Add new product to the appropriate category
        setMenuData((prev) => {
          if (!prev) return prev;

          const updatedCategories = prev.categories.map((cat) => {
            if (cat.id === product.category_id) {
              // Check if product already exists
              const exists = cat.products.some((p) => p.id === product.id);
              if (exists) return cat;

              return {
                ...cat,
                products: [...cat.products, product],
                product_count: cat.product_count + 1,
              };
            }
            return cat;
          });

          return { ...prev, categories: updatedCategories };
        });

        // Show toast notification
        setToast(`Món mới: ${product.name}`);
        setTimeout(() => setToast(null), 3000);
      } else if (action === 'update' && product) {
        // Update existing product
        setMenuData((prev) => {
          if (!prev) return prev;

          const updatedCategories = prev.categories.map((cat) => ({
            ...cat,
            products: cat.products.map((p) =>
              p.id === product.id ? product : p
            ),
          }));

          return { ...prev, categories: updatedCategories };
        });

        setToast(`Đã cập nhật: ${product.name}`);
        setTimeout(() => setToast(null), 3000);
      } else if (action === 'delete' && productId) {
        // Remove deleted product
        setMenuData((prev) => {
          if (!prev) return prev;

          const updatedCategories = prev.categories.map((cat) => ({
            ...cat,
            products: cat.products.filter((p) => p.id !== productId),
            product_count: cat.products.filter((p) => p.id !== productId).length,
          }));

          return { ...prev, categories: updatedCategories };
        });

        setToast(`Món đã bị xóa`);
        setTimeout(() => setToast(null), 3000);
      }
    };

    socket.on('menu_updated', handleMenuUpdate);

    return () => {
      socket.off('menu_updated', handleMenuUpdate);
    };
  }, [socket, isConnected, menuData]);

  // Set table and branch IDs in cart store
  useEffect(() => {
    if (tableId) setCartTableId(tableId);
    if (branchId) setCartBranchId(branchId);
  }, [tableId, branchId, setCartTableId, setCartBranchId]);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetBranchId = branchIdParam;
        let targetTableId = tableIdParam;

        // If no branch ID, try to get from table
        if (!targetBranchId && targetTableId) {
          try {
            const tableInfo = await getTable(targetTableId);
            targetBranchId = tableInfo.branch_id;
            setBranchId(targetBranchId);
            setCartBranchId(targetBranchId);
            setTableId(targetTableId);
            setCartTableId(targetTableId);
          } catch (err) {
            console.warn("Failed to fetch table info:", err);
          }
        }

        // If still no branch ID, use default for demo
        if (!targetBranchId) {
          console.log('No branch/table ID provided, using default branch for demo');
          targetBranchId = 'demo-branch-1';
          setBranchId(targetBranchId);
          setCartBranchId(targetBranchId);
        }

        // Fetch menu
        const data = await getMenu(targetBranchId);
        setMenuData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load menu");
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [branchIdParam, tableIdParam]);

  // Scroll to category when selected
  useEffect(() => {
    if (
      selectedCategoryId &&
      categorySectionsRef.current.has(selectedCategoryId)
    ) {
      const section = categorySectionsRef.current.get(selectedCategoryId);
      if (section) {
        const headerOffset = 80; // Account for sticky header
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selectedCategoryId]);

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Filter products by selected category
  const getFilteredCategories = (): Category[] => {
    if (!menuData) return [];

    if (selectedCategoryId === null) {
      return menuData.categories;
    }

    return menuData.categories.filter((cat) => cat.id === selectedCategoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 text-lg font-medium">
            Đang tải thực đơn...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Không thể tải thực đơn
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
          >
            Thử lại
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!menuData) {
    return null;
  }

  const filteredCategories = getFilteredCategories();

  // Get table number - try to extract from tableId or use a placeholder
  const getTableNumber = () => {
    if (!tableId) return undefined;
    // If tableId is a UUID, try to get last 2 chars, otherwise use as-is
    const tableNum = tableId.length > 8 ? tableId.slice(-2) : tableId;
    return `Bàn ${tableNum}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
      
      {/* Hero Section */}
      <HeroSection
        branchName={menuData.branch.name}
        branchAddress={menuData.branch.address}
        tableNumber={getTableNumber()}
      />

      {/* Premium Category Tabs */}
      {menuData.categories.length > 0 && (
        <PremiumCategoryTabs
          categories={menuData.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Menu Content - List View */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600 text-lg font-medium">
              Không có món ăn nào trong danh mục này
            </p>
          </motion.div>
        ) : (
          filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              ref={(el) => {
                if (el) {
                  categorySectionsRef.current.set(category.id, el);
                } else {
                  categorySectionsRef.current.delete(category.id);
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-8"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                {category.icon && (
                  <span className="text-3xl">{category.icon}</span>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-slate-600 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Products List */}
              {category.products && category.products.length > 0 ? (
                <div className="space-y-3">
                  {category.products.map((product, productIndex) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: productIndex * 0.05 }}
                    >
                      <ProductListItem
                        product={product}
                        onAddToCart={handleAddToCart}
                        onRemoveFromCart={handleRemoveFromCart}
                        quantity={getItemQuantity(product.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Chưa có món ăn trong danh mục này</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </main>

      {/* Premium Floating Cart Bar */}
      <PremiumCartBar />
    </div>
  );
}
