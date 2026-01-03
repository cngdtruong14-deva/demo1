import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: Array<Record<string, any>>;
  dataKey?: string;
  xAxisKey: string;
  lines?: Array<{ key: string; color: string; name: string }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: any, name: string) => [string, string];
  yAxisFormatter?: (value: any) => string;
}

export default function LineChart({
  data,
  dataKey,
  xAxisKey,
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  yAxisFormatter,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          dataKey={xAxisKey}
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <YAxis
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
        {lines.length > 0 ? (
          lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))
        ) : dataKey ? (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ) : null}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

