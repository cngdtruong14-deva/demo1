import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: Array<Record<string, any>>;
  dataKey?: string;
  xAxisKey: string;
  bars?: Array<{ key: string; color: string; name: string }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: any, name: string) => [string, string];
  yAxisFormatter?: (value: any) => string;
  layout?: "horizontal" | "vertical";
}

export default function BarChart({
  data,
  dataKey,
  xAxisKey,
  bars = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  yAxisFormatter,
  layout = "vertical",
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          dataKey={layout === "vertical" ? xAxisKey : undefined}
          type={layout === "vertical" ? "category" : "number"}
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          dataKey={layout === "horizontal" ? xAxisKey : undefined}
          type={layout === "horizontal" ? "category" : "number"}
          stroke="#666"
          style={{ fontSize: "12px" }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          formatter={tooltipFormatter}
        />
        {showLegend && <Legend />}
        {bars.length > 0 ? (
          bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              name={bar.name}
              radius={[4, 4, 0, 0]}
            />
          ))
        ) : dataKey ? (
          <Bar dataKey={dataKey} fill="#f97316" radius={[4, 4, 0, 0]} />
        ) : null}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

