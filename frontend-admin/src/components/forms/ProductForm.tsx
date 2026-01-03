import { Form, Button, Row, Col } from 'antd';
import FormField from './FormField';

interface ProductFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

export default function ProductForm({ initialValues, onSubmit, onCancel }: ProductFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <FormField
            name="name"
            label="Product Name"
            type="text"
            required
            placeholder="Enter product name"
          />
        </Col>
        <Col span={12}>
          <FormField
            name="category"
            label="Category"
            type="select"
            required
            options={[
              { label: 'Appetizers', value: 'appetizers' },
              { label: 'Main Course', value: 'main' },
              { label: 'Drinks', value: 'drinks' },
            ]}
          />
        </Col>
      </Row>

      <FormField
        name="description"
        label="Description"
        type="textarea"
        placeholder="Enter product description"
      />

      <Row gutter={16}>
        <Col span={12}>
          <FormField
            name="price"
            label="Price (VND)"
            type="number"
            required
            placeholder="Enter price"
          />
        </Col>
        <Col span={12}>
          <FormField
            name="costPrice"
            label="Cost Price (VND)"
            type="number"
            placeholder="Enter cost price"
          />
        </Col>
      </Row>

      <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button onClick={onCancel}>Cancel</Button>
        )}
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </div>
    </Form>
  );
}

