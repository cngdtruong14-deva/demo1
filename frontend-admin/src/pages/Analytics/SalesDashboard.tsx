import { useState } from "react";
import { Card, Row, Col, Statistic, Select, DatePicker, Space } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data
const generateRevenueData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    revenue: Math.round(5000000 + Math.random() * 3000000),
    orders: Math.round(20 + Math.random() * 30),
  }));
};

const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    orders: hour >= 11 && hour <= 14 ? Math.round(15 + Math.random() * 20) : hour >= 18 && hour <= 21 ? Math.round(20 + Math.random() * 25) : Math.round(Math.random() * 10),
  }));
};

export default function SalesDashboard() {
  const [branchId, setBranchId] = useState("1");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, "days"),
    dayjs(),
  ]);

  // Mock statistics
  const stats = {
    totalRevenue: 125000000,
    totalOrders: 1245,
    activeTables: 18,
    revenueChange: 12.5,
    ordersChange: 8.3,
    tablesChange: -2.1,
  };

  const revenueData = generateRevenueData();
  const hourlyData = generateHourlyData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>
          Sales Dashboard
        </h1>
        <Space>
          <Select
            value={branchId}
            onChange={setBranchId}
            style={{ width: 200 }}
            placeholder="Select Branch"
          >
            <Option value="1">Branch 1 - Cầu Giấy</Option>
            <Option value="2">Branch 2 - Hoàn Kiếm</Option>
            <Option value="3">Branch 3 - Đống Đa</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
              <ArrowUpOutlined style={{ color: "#3f8600" }} />{" "}
              {stats.revenueChange}% vs last period
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
              <ArrowUpOutlined style={{ color: "#3f8600" }} />{" "}
              {stats.ordersChange}% vs last period
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Tables"
              value={stats.activeTables}
              prefix={<TableOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
              <ArrowDownOutlined style={{ color: "#cf1322" }} />{" "}
              {Math.abs(stats.tablesChange)}% vs last period
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend (Last 7 Days)" style={{ height: 400 }}>
            <LineChart
              data={revenueData}
              xAxisKey="day"
              lines={[
                {
                  key: "revenue",
                  color: "#f97316",
                  name: "Revenue (VND)",
                },
              ]}
              height={300}
              tooltipFormatter={(value) => [
                formatCurrency(Number(value)),
                "Revenue",
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Orders Trend (Last 7 Days)" style={{ height: 400 }}>
            <BarChart
              data={revenueData}
              xAxisKey="day"
              bars={[
                {
                  key: "orders",
                  color: "#1890ff",
                  name: "Orders",
                },
              ]}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card title="Hourly Order Distribution" style={{ height: 400 }}>
            <BarChart
              data={hourlyData}
              xAxisKey="hour"
              bars={[
                {
                  key: "orders",
                  color: "#10b981",
                  name: "Orders",
                },
              ]}
              height={300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
