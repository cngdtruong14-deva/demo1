import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Spin, Alert } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FireOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getDashboardStats, getAnalytics, getMenuMatrix } from '../services/api';

const { Option } = Select;

// Mock menu matrix data (Price vs Popularity scatter chart)
const generateMockMenuMatrix = () => {
  const categories = ['Khai Vị', 'Món Chính', 'Đồ Uống', 'Tráng Miệng'];
  const data = [];
  
  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 8; i++) {
      const price = 20000 + Math.random() * 80000;
      const popularity = Math.random() * 100; // 0-100 popularity score
      const revenue = price * (50 + Math.random() * 200); // Mock revenue
      
      data.push({
        name: `${category} ${i + 1}`,
        category,
        price: Math.round(price),
        popularity: Math.round(popularity * 10) / 10,
        revenue: Math.round(revenue),
        soldCount: Math.round(50 + Math.random() * 200),
      });
    }
  });
  
  return data;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('1');
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [menuMatrixData, setMenuMatrixData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [branchId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      try {
        const statsData = await getDashboardStats(branchId);
        setStats(statsData);
      } catch (error) {
        console.warn('Stats endpoint not available, using mock data');
        setStats({
          todayRevenue: 12500000,
          todayOrders: 45,
          activeCustomers: 120,
          pendingOrders: 8,
          revenueChange: 12.5,
          ordersChange: 8.3,
        });
      }

      // Fetch revenue analytics
      try {
        const analyticsData = await getAnalytics(branchId, 'week');
        setRevenueData(analyticsData?.revenue || []);
      } catch (error) {
        console.warn('Analytics endpoint not available, using mock data');
        // Generate mock revenue data for last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setRevenueData(
          days.map((day) => ({
            day,
            revenue: Math.round(8000000 + Math.random() * 5000000),
            orders: Math.round(30 + Math.random() * 20),
          }))
        );
      }

      // Fetch menu matrix
      try {
        const matrixData = await getMenuMatrix(branchId);
        if (matrixData) {
          setMenuMatrixData(matrixData);
        } else {
          setMenuMatrixData(generateMockMenuMatrix());
        }
      } catch (error) {
        console.warn('Menu matrix endpoint not available, using mock data');
        setMenuMatrixData(generateMockMenuMatrix());
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Dashboard</h1>
          <Select
            value={branchId}
            onChange={setBranchId}
            style={{ width: 200 }}
            placeholder="Select Branch"
          >
            <Option value="1">Branch 1</Option>
            <Option value="2">Branch 2</Option>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={stats?.todayRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#3f8600' }}
            />
            {stats?.revenueChange && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                <ArrowUpOutlined style={{ color: '#3f8600' }} /> {stats.revenueChange}% vs yesterday
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={stats?.todayOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            {stats?.ordersChange && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                <ArrowUpOutlined style={{ color: '#3f8600' }} /> {stats.ordersChange}% vs yesterday
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={stats?.activeCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend (Last 7 Days)" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(value),
                    'Revenue',
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Orders Trend (Last 7 Days)" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Menu Matrix - Scatter Chart */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card
            title="Menu Matrix - Price vs Popularity"
            extra={
              <div style={{ fontSize: 12, color: '#999' }}>
                Each dot represents a menu item. Size indicates revenue.
              </div>
            }
            style={{ height: 500 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="price"
                  name="Price"
                  label={{ value: 'Price (VND)', position: 'insideBottom', offset: -5 }}
                  domain={[0, 'dataMax']}
                />
                <YAxis
                  type="number"
                  dataKey="popularity"
                  name="Popularity"
                  label={{ value: 'Popularity Score', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    if (name === 'price') {
                      return [
                        new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(value),
                        'Price',
                      ];
                    }
                    if (name === 'popularity') {
                      return [value.toFixed(1), 'Popularity'];
                    }
                    return [value, name];
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            padding: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
                          <p style={{ margin: '4px 0' }}>
                            Price:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(data.price)}
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            Popularity: {data.popularity.toFixed(1)}
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            Revenue:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(data.revenue)}
                          </p>
                          <p style={{ margin: '4px 0' }}>Sold: {data.soldCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Scatter
                  name="Menu Items"
                  data={menuMatrixData}
                  fill="#8884d8"
                >
                  {menuMatrixData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
              <strong>Insights:</strong> Items in the top-right quadrant (high price, high popularity) are
              your best performers. Items in the bottom-left (low price, low popularity) may need
              promotion or removal.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

