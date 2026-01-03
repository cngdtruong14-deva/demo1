import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Card,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} from "@/store/api/apiSlice";
import { useSocket } from "@/hooks/useSocket";
import type { ColumnsType } from "antd/es/table";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category_id: string;
  category_name?: string;
  image_url?: string;
  status: string;
  is_spicy: boolean;
  is_vegetarian: boolean;
  tags?: string[];
  sold_count: number;
  rating: number;
}

export default function ProductList() {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // RTK Query hooks
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetProductsQuery({
    search: searchText,
    category: categoryFilter,
  });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // 🔥 Real-time: Listen for menu updates via Socket.IO
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("🔌 Admin: Socket connected, listening for menu updates...");

    // Listen for menu_updated events
    const handleMenuUpdate = (data: any) => {
      console.log("📡 Admin received menu_updated event:", data);

      const { action, product } = data;

      // Show notification
      if (action === "create") {
        message.success(`Món mới được thêm: ${product?.name}`);
      } else if (action === "update") {
        message.info(`Món được cập nhật: ${product?.name}`);
      } else if (action === "delete") {
        message.warning(`Món đã bị xóa`);
      }

      // Refetch products to update the list
      refetch();
    };

    socket.on("menu_updated", handleMenuUpdate);

    return () => {
      socket.off("menu_updated", handleMenuUpdate);
    };
  }, [socket, isConnected, refetch]);

  const columns: ColumnsType<Product> = [
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.image_url && (
            <img
              src={record.image_url}
              alt={text}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 120,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "available" ? "green" : "red"}>
          {status === "available" ? "Có sẵn" : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Đặc biệt",
      key: "special",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.is_spicy && <Tag color="red">🌶️ Cay</Tag>}
          {record.is_vegetarian && <Tag color="green">🌱 Chay</Tag>}
          {record.tags?.includes("best-seller") && (
            <Tag color="gold">⭐ Bán chạy</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "sold_count",
      key: "sold_count",
      width: 80,
      sorter: (a, b) => a.sold_count - b.sold_count,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 80,
      render: (rating) => `${rating.toFixed(1)} ⭐`,
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa món "${product.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(product.id).unwrap();
          message.success("Xóa món thành công");
        } catch (error) {
          message.error("Lỗi khi xóa món");
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...values }).unwrap();
        message.success("Cập nhật món thành công");
      } else {
        await createProduct(values).unwrap();
        message.success("Thêm món mới thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý món ăn</h1>
            <p className="text-gray-500">
              {isConnected ? "🟢 Đang kết nối real-time" : "🔴 Mất kết nối"}
            </p>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm món mới
            </Button>
          </Space>
        </div>

        <Space className="mb-4" size="middle">
          <Input
            placeholder="Tìm kiếm món ăn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
          >
            {(Array.isArray(categoriesData)
              ? categoriesData
              : categoriesData?.data
            )?.map((cat: any) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={(productsData as any) || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} món`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingProduct ? "Sửa món ăn" : "Thêm món mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên món"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
          >
            <Input placeholder="Ví dụ: Phở Bò Tái" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả món ăn..." />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {(Array.isArray(categoriesData)
                ? categoriesData
                : categoriesData?.data
              )?.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Giá bán"
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) =>
                  Number(value!.replace(/\$\s?|(,*)/g, "")) as any
                }
                suffix="₫"
              />
            </Form.Item>

            <Form.Item label="Giá vốn" name="cost_price">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) =>
                  Number(value!.replace(/\$\s?|(,*)/g, "")) as any
                }
                suffix="₫"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Món cay" name="is_spicy" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item
              label="Món chay"
              name="is_vegetarian"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item label="Hình ảnh" name="image_url">
            <Input placeholder="URL hình ảnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
