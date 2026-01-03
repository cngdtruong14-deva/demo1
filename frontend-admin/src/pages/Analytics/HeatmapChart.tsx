import { useState } from "react";
import { Card, Select, DatePicker, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import HeatmapChart from "@/components/charts/HeatmapChart";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Generate mock heatmap data
const generateHeatmapData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data: Array<{ day: string; hour: number; value: number }> = [];

  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour++) {
      let value = 0;

      // Lunch peak: 11-14
      if (hour >= 11 && hour <= 14) {
        value = Math.round(15 + Math.random() * 25);
        // Weekend lunch is busier
        if (day === "Sat" || day === "Sun") {
          value = Math.round(20 + Math.random() * 30);
        }
      }
      // Dinner peak: 18-21
      else if (hour >= 18 && hour <= 21) {
        value = Math.round(20 + Math.random() * 30);
        // Weekend dinner is much busier
        if (day === "Sat" || day === "Sun") {
          value = Math.round(30 + Math.random() * 40);
        }
      }
      // Breakfast: 7-9
      else if (hour >= 7 && hour <= 9) {
        value = Math.round(5 + Math.random() * 10);
      }
      // Late night: 22-23
      else if (hour >= 22) {
        value = Math.round(Math.random() * 8);
      }
      // Very early morning: 0-6
      else if (hour <= 6) {
        value = Math.round(Math.random() * 3);
      }
      // Other hours
      else {
        value = Math.round(Math.random() * 5);
      }

      data.push({
        day,
        hour,
        value,
      });
    }
  });

  return data;
};

export default function HeatmapChartPage() {
  const [branchId, setBranchId] = useState("1");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, "days"),
    dayjs(),
  ]);

  const heatmapData = generateHeatmapData();

  // Calculate statistics
  const totalOrders = heatmapData.reduce((sum, item) => sum + item.value, 0);
  const peakHour = heatmapData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    heatmapData[0]
  );
  const averageOrders = Math.round(totalOrders / (7 * 24));

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
            Peak Hours Heatmap
          </h1>
          <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
            Visualize dining patterns by day and hour
          </p>
        </div>
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

      {/* Statistics Cards */}
      <div style={{ marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card>
          <div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
              Total Orders (Week)
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totalOrders}</div>
          </div>
        </Card>
        <Card>
          <div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
              Peak Hour
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {peakHour.day} {peakHour.hour}:00
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
              {peakHour.value} orders
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
              Average Orders/Hour
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{averageOrders}</div>
          </div>
        </Card>
      </div>

      {/* Heatmap Chart */}
      <Card title="Order Distribution Heatmap (Time vs Day of Week)">
        <HeatmapChart data={heatmapData} height={500} />
      </Card>

      {/* Insights */}
      <Card title="Insights" style={{ marginTop: 24 }}>
        <div style={{ lineHeight: 1.8 }}>
          <p>
            <strong>Peak Hours Identified:</strong>
          </p>
          <ul>
            <li>
              <strong>Lunch Rush:</strong> 11:00 - 14:00 (Highest on weekends)
            </li>
            <li>
              <strong>Dinner Rush:</strong> 18:00 - 21:00 (Peak hours, especially
              weekends)
            </li>
            <li>
              <strong>Breakfast:</strong> 7:00 - 9:00 (Moderate activity)
            </li>
          </ul>
          <p style={{ marginTop: 16 }}>
            <strong>Recommendations:</strong>
          </p>
          <ul>
            <li>Schedule more staff during peak hours (11-14, 18-21)</li>
            <li>Consider promotions for off-peak hours (10-11, 14-18)</li>
            <li>Weekend staffing should be increased by 30-40%</li>
            <li>Kitchen prep should start earlier on weekends</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
