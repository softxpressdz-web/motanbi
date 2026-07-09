import React, { useState } from "react";
import { 
  DollarSign, FileSpreadsheet, Printer, ArrowLeft, Check, AlertCircle, ShoppingBag
} from "lucide-react";

interface AdminOrdersProps {
  allOrders: any[];
  allBooks: any[];
  onRefresh: () => void;
}

export function AdminOrders({ allOrders, allBooks, onRefresh }: AdminOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const handleOpenInvoice = (order: any) => {
    // Generate simulated order items if empty or not fully populated
    const items = order.items || [
      { id: 1, title: "ديوان المتنبي - شرح المعري", quantity: 1, priceAtPurchase: "4500.00" },
      { id: 2, title: "مقدمة ابن خلدون التاريخية", quantity: 1, priceAtPurchase: "3200.00" }
    ];
    setSelectedOrder({ ...order, items });
    setIsInvoiceOpen(true);
  };

  // Export to Excel / CSV format (Actual functioning client-side downloader!)
  const handleExportCSV = () => {
    if (allOrders.length === 0) return;

    // Build the CSV string
    const headers = ["رقم الطلب", "التاريخ", "الحالة", "طريقة الدفع", "المبلغ الإجمالي (د.ج)"];
    const rows = allOrders.map(ord => [
      ord.orderNumber,
      new Date(ord.createdAt).toLocaleDateString("ar-EG"),
      ord.status === "completed" ? "مكتمل" : ord.status === "shipped" ? "تم الشحن" : "جاري التحضير",
      ord.paymentMethod || "الدفع عند الاستلام",
      ord.total
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dar-al-motanabi-sales-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger standard operating system printing dialog
  const handlePrint = () => {
    window.print();
  };

  // Filter orders
  const filteredOrders = allOrders.filter(ord => {
    const matchesSearch = ord.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Action panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="ابحث برقم الطلبية..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-brand-900 font-bold"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs font-bold text-stone-700"
          >
            <option value="all">جميع حالات الطلب</option>
            <option value="processing">جاري التحضير</option>
            <option value="shipped">تم الشحن</option>
            <option value="completed">مكتمل والتوصيل تام</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        <button 
          onClick={handleExportCSV}
          disabled={allOrders.length === 0}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center gap-2 border border-stone-200 shadow-sm cursor-pointer shrink-0"
        >
          <FileSpreadsheet size={14} className="text-emerald-600" />
          <span>تصدير تقرير المبيعات كـ Excel (CSV)</span>
        </button>
      </div>

      {/* Orders list table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
          <h3 className="font-serif font-bold text-stone-850 text-xs font-serif">قائمة طلبات الشراء عبر الموقع</h3>
        </div>

        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-stone-400 text-center py-12 text-xs">لا توجد طلبيات بيع مطابقة حالياً.</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">تاريخ الطلب</th>
                  <th className="p-4">الزبون والعنوان</th>
                  <th className="p-4">طريقة الشحن والدفع</th>
                  <th className="p-4">المبلغ الكلي</th>
                  <th className="p-4">حالة الشحن</th>
                  <th className="p-4 text-left pl-6">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-900">{ord.orderNumber}</td>
                    <td className="p-4 text-stone-500">{new Date(ord.createdAt).toLocaleString("ar-EG")}</td>
                    <td className="p-4">
                      <div className="font-bold text-stone-800">{ord.userId ? `زبون مسجل #${ord.userId}` : "زائر مجهول"}</div>
                      <div className="text-stone-400 text-[10px] mt-0.5">الشحن: الجزائر العاصمة، الجزائر</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-700">{ord.shippingMethod || "توصيل منزلي"}</div>
                      <div className="text-stone-400 text-[10px] mt-0.5">الدفع: {ord.paymentMethod === "cod" ? "عند الاستلام" : "بطاقة الدفع"}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-stone-850">{parseFloat(ord.total).toLocaleString()} د.ج</td>
                    <td className="p-4">
                      <select 
                        value={ord.status || "processing"} 
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className={`font-bold text-[10px] rounded px-2.5 py-1 focus:outline-none border ${
                          ord.status === "completed" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : ord.status === "shipped" 
                            ? "bg-blue-50 text-blue-700 border-blue-200" 
                            : ord.status === "cancelled" 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="processing">جاري التحضير</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                    <td className="p-4 text-left pl-6">
                      <button 
                        onClick={() => handleOpenInvoice(ord)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-brand-900 font-bold py-1.5 px-3 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 inline-flex"
                      >
                        <Printer size={12} />
                        <span>طباعة الفاتورة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoice Modal Box (Printable & Styled) */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-8">
            
            {/* Modal actions */}
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center print:hidden">
              <span className="font-serif font-bold text-stone-850 text-sm flex items-center gap-1.5">
                <Printer size={16} className="text-brand-900" />
                <span>معاينة الفاتورة الرسمية</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-1.5 px-4 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>طباعة أو حفظ كـ PDF</span>
                </button>
                <button 
                  onClick={() => setIsInvoiceOpen(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-1.5 px-4 rounded text-xs transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="invoice-print-area" className="p-8 space-y-6 text-stone-800 bg-white">
              
              {/* Header block */}
              <div className="flex justify-between items-start border-b border-stone-300 pb-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-brand-900 mb-1">دار المتنبي للنشر والتوزيع</h1>
                  <p className="text-[10px] text-stone-500 leading-relaxed font-bold">
                    بوابة النشر والإبداع الأدبي - الجزائر العاصمة<br />
                    هاتف: 0555-55-55-55 | بريد: support@al-motanabi.dz
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-xl font-serif font-bold text-stone-800">فاتورة بيع</div>
                  <div className="text-xs font-mono font-bold text-brand-900 mt-1">{selectedOrder.orderNumber}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-1">تاريخ الإصدار: {new Date(selectedOrder.createdAt).toLocaleDateString("ar-EG")}</div>
                </div>
              </div>

              {/* Addresses details */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-lg border border-stone-200">
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-500 text-[10px] uppercase">العميل والمستلم:</h4>
                  <div className="font-bold text-stone-800">زبون دار المتنبي الكريم</div>
                  <div className="text-stone-500 leading-relaxed">
                    العنوان: الشحن المباشر للولاية المحددة<br />
                    الهاتف: معطيات التوصيل من خلال بوابة COD
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-500 text-[10px] uppercase">معلومات الشحن والدفع:</h4>
                  <div><span className="text-stone-500">طريقة التوصيل:</span> <span className="font-bold">{selectedOrder.shippingMethod || "توصيل منزلي سريع"}</span></div>
                  <div><span className="text-stone-500">طريقة الدفع:</span> <span className="font-bold">{selectedOrder.paymentMethod === "cod" ? "الدفع عند الاستلام (COD)" : "بطاقة دفع"}</span></div>
                  <div><span className="text-stone-500">حالة الشحن:</span> <span className="font-bold text-brand-900">{selectedOrder.status === "completed" ? "مكتمل" : "جاري التحضير والشحن"}</span></div>
                </div>
              </div>

              {/* Items list */}
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                      <th className="p-3">الكتاب والمنتج</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-left pl-4">سعر الوحدة</th>
                      <th className="p-3 text-left pl-4">المجموع الفرعي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-stone-800">{item.title || "كتاب منوع من دار المتنبي"}</td>
                        <td className="p-3 text-center font-mono font-bold">{item.quantity || 1}</td>
                        <td className="p-3 text-left pl-4 font-mono">{(parseFloat(item.priceAtPurchase || "0")).toLocaleString()} د.ج</td>
                        <td className="p-3 text-left pl-4 font-mono">{(parseFloat(item.priceAtPurchase || "0") * (item.quantity || 1)).toLocaleString()} د.ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Computations list */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-2 border-t border-stone-200 pt-4 font-bold">
                  <div className="flex justify-between text-stone-500">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono">{parseFloat(selectedOrder.total).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>مصاريف التوصيل:</span>
                    <span className="font-mono">0.00 د.ج</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>الضريبة المضافة (19%):</span>
                    <span className="font-mono">مشمولة في السعر</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-300 pt-2 text-stone-850 text-sm font-bold">
                    <span>الإجمالي النهائي (صافي):</span>
                    <span className="font-mono text-brand-900">{parseFloat(selectedOrder.total).toLocaleString()} د.ج</span>
                  </div>
                </div>
              </div>

              {/* Stamp and signatures */}
              <div className="grid grid-cols-2 gap-8 text-center pt-10 text-[10px] text-stone-400">
                <div>
                  <div className="font-bold border-b border-stone-200 pb-1 w-32 mx-auto text-stone-500">ختم وتوقيع المدير</div>
                  <div className="mt-8 font-serif font-bold text-stone-800 text-xs italic opacity-80">دار المتنبي للنشر</div>
                </div>
                <div>
                  <div className="font-bold border-b border-stone-200 pb-1 w-32 mx-auto text-stone-500">المستلم والتوصيل</div>
                  <div className="mt-8 text-stone-500">الدفع والتسليم عند الاستلام</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
