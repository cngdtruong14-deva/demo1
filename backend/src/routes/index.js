/**
 * Routes Index
 * Central route registry
 */

const express = require('express');
const router = express.Router();
const { getSampleMenu, getAvailableMenuFiles } = require('../utils/sampleDataLoader');

// Import route modules
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const tableRoutes = require('./table.routes');
const branchRoutes = require('./branch.routes');
const customerRoutes = require('./customer.routes');
const analyticsRoutes = require('./analytics.routes');
const adminRoutes = require('./admin.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Public menu endpoint (no auth required)
// Now uses sample data from JSON files
router.get('/menu/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { source = 'menu.json' } = req.query; // Allow specifying which menu file to use

    // Try to load from sample data first
    const sampleMenu = getSampleMenu(source, branchId);

    if (sampleMenu) {
      return res.json({
        success: true,
        data: sampleMenu,
        source: 'sample-data'
      });
    }

    // Fallback to inline mock if sample data not available
    const mockMenu = {
      success: true,
      data: {
        branch: {
          id: branchId,
          name: 'Nhà Hàng Việt Nam',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          phone: '0123456789'
        },
        categories: [
          {
            id: 'cat-001',
            name: 'Khai Vị',
            description: 'Món khai vị ngon miệng',
            icon: '🥗',
            display_order: 1,
            status: 'active',
            product_count: 3,
            products: [
              {
                id: 'prod-001',
                category_id: 'cat-001',
                name: 'Gỏi Cuốn Tôm Thịt',
                description: 'Bánh tráng cuốn tôm thịt tươi, rau sống, bún',
                price: 45000,
                cost_price: 20000,
                image_url: null,
                preparation_time: 10,
                calories: 150,
                is_spicy: false,
                is_vegetarian: false,
                tags: ['best-seller'],
                status: 'available',
                sold_count: 156,
                rating: 4.5
              },
              {
                id: 'prod-002',
                category_id: 'cat-001',
                name: 'Chả Giò Rế',
                description: 'Chả giò chiên giòn, nhân thịt và rau củ',
                price: 55000,
                is_spicy: false,
                is_vegetarian: false,
                tags: [],
                status: 'available',
                sold_count: 98,
                rating: 4.3
              },
              {
                id: 'prod-003',
                category_id: 'cat-001',
                name: 'Salad Trộn',
                description: 'Salad rau củ tươi với sốt đặc biệt',
                price: 40000,
                is_spicy: false,
                is_vegetarian: true,
                tags: ['healthy'],
                status: 'available',
                sold_count: 45,
                rating: 4.0
              }
            ]
          },
          {
            id: 'cat-002',
            name: 'Món Chính',
            description: 'Các món ăn chính đặc sắc',
            icon: '🍜',
            display_order: 2,
            status: 'active',
            product_count: 4,
            products: [
              {
                id: 'prod-004',
                category_id: 'cat-002',
                name: 'Phở Bò Tái',
                description: 'Phở bò truyền thống, nước dùng đậm đà',
                price: 65000,
                is_spicy: false,
                is_vegetarian: false,
                tags: ['best-seller', 'signature'],
                status: 'available',
                sold_count: 342,
                rating: 4.8
              },
              {
                id: 'prod-005',
                category_id: 'cat-002',
                name: 'Bún Chả Hà Nội',
                description: 'Bún chả với chả nướng thơm ngon',
                price: 60000,
                is_spicy: false,
                is_vegetarian: false,
                tags: ['signature'],
                status: 'available',
                sold_count: 234,
                rating: 4.6
              },
              {
                id: 'prod-006',
                category_id: 'cat-002',
                name: 'Cơm Tấm Sườn Bì',
                description: 'Cơm tấm với sườn nướng và bì',
                price: 55000,
                is_spicy: false,
                is_vegetarian: false,
                tags: [],
                status: 'available',
                sold_count: 189,
                rating: 4.4
              },
              {
                id: 'prod-007',
                category_id: 'cat-002',
                name: 'Mì Xào Giòn Hải Sản',
                description: 'Mì xào giòn với hải sản tươi',
                price: 70000,
                is_spicy: true,
                is_vegetarian: false,
                tags: [],
                status: 'available',
                sold_count: 145,
                rating: 4.5
              }
            ]
          },
          {
            id: 'cat-003',
            name: 'Đồ Uống',
            description: 'Nước giải khát, trà, cà phê',
            icon: '🥤',
            display_order: 3,
            status: 'active',
            product_count: 5,
            products: [
              {
                id: 'prod-008',
                category_id: 'cat-003',
                name: 'Trà Đá',
                description: 'Trà đá miễn phí',
                price: 0,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 890,
                rating: 4.0
              },
              {
                id: 'prod-009',
                category_id: 'cat-003',
                name: 'Nước Cam Vắt',
                description: 'Nước cam tươi vắt 100%',
                price: 25000,
                is_spicy: false,
                is_vegetarian: true,
                tags: ['fresh'],
                status: 'available',
                sold_count: 267,
                rating: 4.7
              },
              {
                id: 'prod-010',
                category_id: 'cat-003',
                name: 'Cà Phê Sữa Đá',
                description: 'Cà phê phin truyền thống',
                price: 20000,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 456,
                rating: 4.6
              },
              {
                id: 'prod-011',
                category_id: 'cat-003',
                name: 'Trà Sữa Trân Châu',
                description: 'Trà sữa với trân châu đường đen',
                price: 35000,
                is_spicy: false,
                is_vegetarian: true,
                tags: ['best-seller'],
                status: 'available',
                sold_count: 312,
                rating: 4.5
              },
              {
                id: 'prod-012',
                category_id: 'cat-003',
                name: 'Sinh Tố Bơ',
                description: 'Sinh tố bơ béo ngậy',
                price: 30000,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 178,
                rating: 4.4
              }
            ]
          },
          {
            id: 'cat-004',
            name: 'Tráng Miệng',
            description: 'Món tráng miệng ngọt ngào',
            icon: '🍰',
            display_order: 4,
            status: 'active',
            product_count: 3,
            products: [
              {
                id: 'prod-013',
                category_id: 'cat-004',
                name: 'Chè Ba Màu',
                description: 'Chè ba màu truyền thống',
                price: 20000,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 123,
                rating: 4.2
              },
              {
                id: 'prod-014',
                category_id: 'cat-004',
                name: 'Bánh Flan Caramen',
                description: 'Bánh flan mềm mịn với caramen',
                price: 25000,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 156,
                rating: 4.5
              },
              {
                id: 'prod-015',
                category_id: 'cat-004',
                name: 'Kem Dừa Non',
                description: 'Kem dừa non mát lạnh',
                price: 30000,
                is_spicy: false,
                is_vegetarian: true,
                tags: [],
                status: 'available',
                sold_count: 89,
                rating: 4.3
              }
            ]
          }
        ],
        metadata: {
          total_categories: 4,
          total_products: 15,
          generated_at: new Date().toISOString()
        }
      }
    };

    res.json(mockMenu);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu',
      error: error.message
    });
  }
});

// Get available sample menus
router.get('/menu/:branchId/sources', (req, res) => {
  try {
    const availableFiles = getAvailableMenuFiles();
    res.json({
      success: true,
      data: {
        sources: availableFiles,
        default: 'menu.json',
        description: 'Available menu data sources from sample-data directory'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu sources',
      error: error.message
    });
  }
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/branches', branchRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
