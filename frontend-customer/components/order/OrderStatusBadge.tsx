/**
 * Order Status Badge Component
 * Display order status with appropriate styling
 */

'use client';

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          label: 'Chờ xác nhận',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };
      case 'preparing':
        return {
          label: 'Đang chuẩn bị',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
        };
      case 'ready':
        return {
          label: 'Sẵn sàng',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
}

