/**
 * QR Scan Landing Page
 * Captures tableId from URL and redirects to menu
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { getTable } from "@/lib/api";
import { Loader2, QrCode, CheckCircle } from "lucide-react";

export default function QRScanPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const { setTableId, setBranchId } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);

  useEffect(() => {
    if (!tableId) {
      setError("Không tìm thấy mã bàn. Vui lòng quét lại QR code.");
      setLoading(false);
      return;
    }

    // Fetch table information and redirect to menu
    const initializeTable = async () => {
      try {
        setLoading(true);
        const table = await getTable(tableId);

        if (!table) {
          throw new Error("Không tìm thấy thông tin bàn");
        }

        // Save to store
        setTableId(table.id);
        setBranchId(table.branch_id);
        setTableInfo(table);

        // Redirect to menu after 1.5 seconds
        setTimeout(() => {
          router.push(
            `/customer/menu?table=${table.id}&branch=${table.branch_id}`
          );
        }, 1500);
      } catch (err: any) {
        console.error("Error fetching table:", err);
        setError(err.message || "Có lỗi xảy ra khi tải thông tin bàn");
        setLoading(false);
      }
    };

    initializeTable();
  }, [tableId, router, setTableId, setBranchId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {loading && !error && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Đang tải thông tin bàn...
            </h1>
            {tableInfo && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  Bàn số: {tableInfo.table_number}
                </p>
              </div>
            )}
            <div className="flex justify-center mt-6">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Đang chuyển đến thực đơn...
            </p>
          </>
        )}

        {error && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Lỗi tải thông tin
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Quay lại trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
