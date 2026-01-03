import { useState } from "react";
import { Card, Select, Row, Col, Tag, Tooltip } from "antd";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const { Option } = Select;

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  popularity: number; // 0-100
  revenue: number;
  soldCount: number;
  profitMargin: number; // 0-100
  quadrant: "stars" | "cashCows" | "dogs" | "questionMarks";
}

// Mock data generator
const generateMenuMatrixData = (): MenuItem[] => {
  const categories = ["Appetizers", "Main Course", "Drinks", "Desserts"];
  const items: MenuItem[] = [];

  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 10; i++) {
      const price = 30000 + Math.random() * 150000;
      const popularity = Math.random() * 100;
      const soldCount = Math.round(50 + Math.random() * 300);
      const profitMargin = 20 + Math.random() * 50;
      const revenue = price * soldCount;
      const profitability = (revenue * profitMargin) / 100;

      // Determine quadrant
      let quadrant: MenuItem["quadrant"];
      if (popularity > 50 && profitability > 5000000) {
        quadrant = "stars";
      } else if (popularity <= 50 && profitability > 5000000) {
        quadrant = "cashCows";
      } else if (popularity <= 50 && profitability <= 5000000) {
        quadrant = "dogs";
      } else {
        quadrant = "questionMarks";
      }

      items.push({
        id: `${category}-${i}`,
        name: `${category} Item ${i + 1}`,
        category,
        price: Math.round(price),
        popularity: Math.round(popularity * 10) / 10,
        revenue,
        soldCount,
        profitMargin: Math.round(profitMargin * 10) / 10,
        quadrant,
      });
    }
  });

  return items;
};

const QUADRANT_COLORS = {
  stars: "#10b981", // Green - High popularity, High profit
  cashCows: "#3b82f6", // Blue - Low popularity, High profit
  dogs: "#ef4444", // Red - Low popularity, Low profit
  questionMarks: "#fbbf24", // Yellow - High popularity, Low profit
};

const QUADRANT_LABELS = {
  stars: "Stars ⭐",
  cashCows: "Cash Cows 💰",
  dogs: "Dogs 🐕",
  questionMarks: "Question Marks ❓",
};

export default function MenuMatrix() {
  const [branchId, setBranchId] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allData = generateMenuMatrixData();
  const filteredData = selectedCategory
    ? allData.filter((item) => item.category === selectedCategory)
    : allData;

  // Calculate median values for reference lines
  const medianPopularity =
    filteredData.reduce((sum, item) => sum + item.popularity, 0) /
    filteredData.length;
  const medianProfitability =
    filteredData.reduce((sum, item) => sum + (item.revenue * item.profitMargin) / 100, 0) /
    filteredData.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MenuItem;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
            {data.name}
          </p>
          <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
            {data.category}
          </p>
          <p style={{ margin: "4px 0" }}>
            Price: <strong>{formatCurrency(data.price)}</strong>
          </p>
          <p style={{ margin: "4px 0" }}>
            Popularity: <strong>{data.popularity.toFixed(1)}</strong>
          </p>
          <p style={{ margin: "4px 0" }}>
            Profitability: <strong>{formatCurrency((data.revenue * data.profitMargin) / 100)}</strong>
          </p>
          <p style={{ margin: "4px 0" }}>
            Sold: <strong>{data.soldCount}</strong>
          </p>
          <p style={{ margin: "4px 0" }}>
            <Tag color={QUADRANT_COLORS[data.quadrant]}>
              {QUADRANT_LABELS[data.quadrant]}
            </Tag>
          </p>
        </div>
      );
    }
    return null;
  };

  // Count items by quadrant
  const quadrantCounts = {
    stars: filteredData.filter((item) => item.quadrant === "stars").length,
    cashCows: filteredData.filter((item) => item.quadrant === "cashCows").length,
    dogs: filteredData.filter((item) => item.quadrant === "dogs").length,
    questionMarks: filteredData.filter((item) => item.quadrant === "questionMarks").length,
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>
            Menu Matrix (BCG Analysis)
          </h1>
          <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
            Analyze menu items by Popularity vs Profitability
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Select
            value={branchId}
            onChange={setBranchId}
            style={{ width: 200 }}
            placeholder="Select Branch"
          >
            <Option value="1">Branch 1</Option>
            <Option value="2">Branch 2</Option>
            <Option value="3">Branch 3</Option>
          </Select>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
            placeholder="All Categories"
            allowClear
          >
            <Option value="Appetizers">Appetizers</Option>
            <Option value="Main Course">Main Course</Option>
            <Option value="Drinks">Drinks</Option>
            <Option value="Desserts">Desserts</Option>
          </Select>
        </div>
      </div>

      {/* Quadrant Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Tag color={QUADRANT_COLORS.stars} style={{ fontSize: "16px", padding: "4px 12px" }}>
                ⭐ Stars
              </Tag>
              <div style={{ marginTop: 8, fontSize: "24px", fontWeight: "bold" }}>
                {quadrantCounts.stars}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>High Pop, High Profit</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Tag color={QUADRANT_COLORS.cashCows} style={{ fontSize: "16px", padding: "4px 12px" }}>
                💰 Cash Cows
              </Tag>
              <div style={{ marginTop: 8, fontSize: "24px", fontWeight: "bold" }}>
                {quadrantCounts.cashCows}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>Low Pop, High Profit</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Tag color={QUADRANT_COLORS.questionMarks} style={{ fontSize: "16px", padding: "4px 12px" }}>
                ❓ Question Marks
              </Tag>
              <div style={{ marginTop: 8, fontSize: "24px", fontWeight: "bold" }}>
                {quadrantCounts.questionMarks}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>High Pop, Low Profit</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Tag color={QUADRANT_COLORS.dogs} style={{ fontSize: "16px", padding: "4px 12px" }}>
                🐕 Dogs
              </Tag>
              <div style={{ marginTop: 8, fontSize: "24px", fontWeight: "bold" }}>
                {quadrantCounts.dogs}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>Low Pop, Low Profit</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Scatter Chart */}
      <Card
        title="BCG Matrix: Popularity vs Profitability"
        extra={
          <div style={{ fontSize: "12px", color: "#999" }}>
            Each dot represents a menu item. Size indicates revenue.
          </div>
        }
        style={{ height: 600 }}
      >
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="popularity"
              name="Popularity"
              label={{
                value: "Popularity Score (0-100)",
                position: "insideBottom",
                offset: -5,
              }}
              domain={[0, 100]}
            />
            <YAxis
              type="number"
              dataKey={(item: MenuItem) => (item.revenue * item.profitMargin) / 100}
              name="Profitability"
              label={{
                value: "Profitability (VND)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ZAxis
              type="number"
              dataKey="revenue"
              range={[50, 500]}
              name="Revenue"
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <ReferenceLine
              x={medianPopularity}
              stroke="#999"
              strokeDasharray="3 3"
              label={{ value: "Median Popularity", position: "top" }}
            />
            <ReferenceLine
              y={medianProfitability}
              stroke="#999"
              strokeDasharray="3 3"
              label={{ value: "Median Profitability", position: "right" }}
            />
            <Scatter name="Menu Items" data={filteredData} fill="#8884d8">
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={QUADRANT_COLORS[entry.quadrant]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div style={{ marginTop: 24, padding: 16, backgroundColor: "#f9fafb", borderRadius: 4 }}>
          <h4 style={{ margin: "0 0 12px 0" }}>Insights & Recommendations:</h4>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: QUADRANT_COLORS.stars }}>⭐ Stars:</strong> Invest in
                marketing and maintain quality. These are your best performers.
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: QUADRANT_COLORS.cashCows }}>💰 Cash Cows:</strong>{" "}
                Maintain these items. They generate steady profit with low marketing needs.
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: QUADRANT_COLORS.questionMarks }}>❓ Question Marks:</strong>{" "}
                Consider price optimization or cost reduction. High potential but need improvement.
              </div>
              <div>
                <strong style={{ color: QUADRANT_COLORS.dogs }}>🐕 Dogs:</strong> Consider
                removing or repositioning. Low performance in both metrics.
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}
