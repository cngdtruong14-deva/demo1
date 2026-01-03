import { Form, Input, Select, InputNumber, DatePicker } from 'antd';
import { ReactNode } from 'react';

const { TextArea } = Input;

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  rules?: any[];
  children?: ReactNode;
}

export default function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  options = [],
  rules = [],
  children,
}: FormFieldProps) {
  const baseRules = required ? [{ required: true, message: `${label} is required` }] : [];
  const finalRules = [...baseRules, ...rules];

  const renderInput = () => {
    switch (type) {
      case 'number':
        return <InputNumber placeholder={placeholder} style={{ width: '100%' }} />;
      case 'textarea':
        return <TextArea placeholder={placeholder} rows={4} />;
      case 'select':
        return (
          <Select placeholder={placeholder}>
            {options.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'date':
        return <DatePicker placeholder={placeholder} style={{ width: '100%' }} />;
      default:
        return <Input placeholder={placeholder} />;
    }
  };

  return (
    <Form.Item name={name} label={label} rules={finalRules}>
      {children || renderInput()}
    </Form.Item>
  );
}

