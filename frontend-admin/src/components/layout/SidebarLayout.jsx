import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FireOutlined,
  MenuOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
  BranchesOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/kitchen',
    icon: <FireOutlined />,
    label: 'Live Kitchen',
  },
  {
    key: '/orders',
    icon: <ShoppingOutlined />,
    label: 'Orders',
  },
  {
    key: '/menu',
    icon: <MenuOutlined />,
    label: 'Menu Management',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: 'Customers',
  },
  {
    key: '/branches',
    icon: <BranchesOutlined />,
    label: 'Branches',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={250}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? 'QR' : 'QR Order'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Layout.Content style={{ margin: '16px', background: '#fff', padding: 24 }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

