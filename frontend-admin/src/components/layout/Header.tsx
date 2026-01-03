import { Layout } from 'antd';
import Breadcrumb from './Breadcrumb';

const { Header: AntHeader } = Layout;

export default function Header() {
  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        marginLeft: 250, // Account for sidebar width
        width: 'calc(100% - 250px)',
      }}
    >
      <Breadcrumb />
      <div style={{ marginLeft: 'auto' }}>
        {/* User menu or notifications can go here */}
      </div>
    </AntHeader>
  );
}

