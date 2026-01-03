import { useState } from "react";
import { ResponsiveContainer, Tooltip, Cell } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "antd";

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  height?: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapChart({
  data,
  height = 500,
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: number;
  } | null>(null);

  // Transform data into a matrix format
  const transformData = () => {
    const matrix: Record<string, Record<number, number>> = {};
    DAYS.forEach((day) => {
      matrix[day] = {};
      HOURS.forEach((hour) => {
        matrix[day][hour] = 0;
      });
    });

    data.forEach((item) => {
      if (matrix[item.day] && matrix[item.day][item.hour] !== undefined) {
        matrix[item.day][item.hour] += item.value;
      }
    });

    return matrix;
  };

  const matrix = transformData();
  const maxValue = Math.max(
    ...data.map((d) => d.value),
    1
  );

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return "#f3f4f6"; // Gray - No activity
    if (intensity > 0.7) return "#ef4444"; // Red - Very High
    if (intensity > 0.5) return "#f97316"; // Orange - High
    if (intensity > 0.3) return "#fbbf24"; // Yellow - Medium
    if (intensity > 0.1) return "#84cc16"; // Green - Low
    return "#d1d5db"; // Light Gray - Very Low
  };

  // Prepare data for rendering
  const chartData = DAYS.map((day) => {
    const row: Record<string, any> = { day };
    HOURS.forEach((hour) => {
      row[hour] = matrix[day][hour] || 0;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const hour = payload[0].dataKey;
      const value = payload[0].value;
      const day = payload[0].payload.day;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>
            {day} {hour}:00
          </p>
          <p style={{ margin: "4px 0 0 0" }}>
            Orders: <strong>{value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#f3f4f6",
              border: "1px solid #ccc",
            }}
          />
          <span style={{ fontSize: "12px" }}>None</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#d1d5db",
            }}
          />
          <span style={{ fontSize: "12px" }}>Low</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#84cc16",
            }}
          />
          <span style={{ fontSize: "12px" }}>Medium</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#fbbf24",
            }}
          />
          <span style={{ fontSize: "12px" }}>High</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#f97316",
            }}
          />
          <span style={{ fontSize: "12px" }}>Very High</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#ef4444",
            }}
          />
          <span style={{ fontSize: "12px" }}>Peak</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            domain={[0, 24]}
            ticks={[0, 6, 12, 18, 24]}
            label={{
              value: "Hour of Day",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            type="category"
            dataKey="day"
            width={50}
            label={{ value: "Day", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          {HOURS.map((hour) => (
            <Bar
              key={hour}
              dataKey={hour}
              stackId="a"
              onMouseEnter={() => setHoveredCell({ day: "", hour })}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {chartData.map((entry, index) => {
                const value = entry[hour] || 0;
                return (
                  <Cell
                    key={`cell-${index}-${hour}`}
                    fill={getColor(value)}
                    stroke={
                      hoveredCell?.hour === hour ? "#000" : "transparent"
                    }
                    strokeWidth={hoveredCell?.hour === hour ? 2 : 0}
                  />
                );
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
