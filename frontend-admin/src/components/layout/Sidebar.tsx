import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FireOutlined,
  MenuOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
  BranchesOutlined,
  TableOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/products",
    icon: <MenuOutlined />,
    label: "Products",
  },
  {
    key: "/orders",
    icon: <ShoppingOutlined />,
    label: "Orders",
  },
  {
    key: "/tables",
    icon: <TableOutlined />,
    label: "Tables",
  },
  {
    key: "/branches",
    icon: <BranchesOutlined />,
    label: "Branches",
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: "Analytics",
  },
  {
    key: "/customers",
    icon: <UserOutlined />,
    label: "Customers",
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    key: "/kitchen",
    icon: <FireOutlined />,
    label: "Kitchen Display",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      width={250}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: collapsed ? 16 : 20,
          fontWeight: "bold",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {collapsed ? "QR" : "QR Order"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}
