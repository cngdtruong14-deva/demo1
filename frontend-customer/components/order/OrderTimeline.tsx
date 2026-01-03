/**
 * Order Timeline Component
 * Visual timeline of order progress
 */

'use client';

import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TimelineItem {
  status: string;
  timestamp: string;
}

interface OrderTimelineProps {
  timeline: TimelineItem[];
  currentStatus: string;
}

export default function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  const statusSteps = [
    { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
    { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle },
    { key: 'preparing', label: 'Đang chuẩn bị', icon: Clock },
    { key: 'ready', label: 'Sẵn sàng', icon: CheckCircle },
    { key: 'completed', label: 'Hoàn thành', icon: CheckCircle },
  ];

  const currentIndex = statusSteps.findIndex((step) => step.key === currentStatus);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="relative">
      {statusSteps.map((step, index) => {
        const status = getStepStatus(index);
        const timelineItem = timeline.find((item) => item.status === step.key);
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex gap-4 pb-8 last:pb-0 relative">
            {/* Connector Line */}
            {index < statusSteps.length - 1 && (
              <div
                className={`absolute left-4 top-10 w-0.5 h-full ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === 'completed'
                  ? 'bg-green-500 text-white'
                  : status === 'current'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {status === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pt-1">
              <p
                className={`font-medium ${
                  status === 'completed' || status === 'current'
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {timelineItem && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatTime(timelineItem.timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

