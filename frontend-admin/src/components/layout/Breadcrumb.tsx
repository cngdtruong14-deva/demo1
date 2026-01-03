import { useLocation } from 'react-router-dom';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export default function Breadcrumb() {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const breadcrumbNameMap: Record<string, string> = {
    products: 'Products',
    orders: 'Orders',
    tables: 'Tables',
    branches: 'Branches',
    analytics: 'Analytics',
    customers: 'Customers',
    settings: 'Settings',
    kitchen: 'Kitchen Display',
  };

  const breadcrumbItems = [
    {
      title: (
        <span>
          <HomeOutlined />
          <span>Dashboard</span>
        </span>
      ),
      href: '/',
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = breadcrumbNameMap[pathSnippets[index]] || pathSnippets[index];
      return {
        title: index === pathSnippets.length - 1 ? title : <a href={url}>{title}</a>,
      };
    }),
  ];

  return <AntBreadcrumb items={breadcrumbItems} />;
}

