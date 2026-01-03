import { ReactNode } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content style={{ margin: '16px', background: '#fff', padding: 24, borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

