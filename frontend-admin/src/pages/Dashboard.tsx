import { Card, Row, Col, Statistic } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  FireOutlined,
} from "@ant-design/icons";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={112893}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Orders"
              value={12}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Best Seller"
              value="Pho Bo"
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Waste"
              value={5.2}
              suffix="%"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and other content will go here */}
      <Card title="Analytics Overview">
        <p>Analytics charts and visualizations will be displayed here.</p>
      </Card>
    </div>
  );
}
