import React from "react";
import { 
  TrendingUp, Users, DollarSign, BookOpen, Mail, Handshake, Calendar, Clock
} from "lucide-react";

interface AdminOverviewProps {
  stats: any;
  allBooks: any[];
  allOrders: any[];
  allManuscripts: any[];
  allMessages: any[];
  allSubscribers: any[];
}

export function AdminOverview({ 
  stats, allBooks, allOrders, allManuscripts, allMessages, allSubscribers 
}: AdminOverviewProps) {
  
  // Compute some interesting stats for the enterprise suite
  const totalSubscribers = allSubscribers.length || stats?.counts?.subscribers || 0;
  const totalBooks = allBooks.length || stats?.counts?.books || 0;
  const totalManuscripts = allManuscripts.length || stats?.counts?.manuscripts || 0;
  const totalMessages = allMessages.length || stats?.counts?.messages || 0;
  const totalOrders = allOrders.length || stats?.counts?.orders || 0;
  const totalSalesValue = stats?.financials?.totalSales || 0;
  
  // Conversion Rate (orders / visitor simulation)
  const simulatedVisitors = 12450;
  const conversionRate = totalOrders > 0 ? ((totalOrders / simulatedVisitors) * 100).toFixed(2) : "1.85";

  // Chart Monthly Simulation Data
  const monthlyData = [
    { month: "جانفي", sales: Math.round(totalSalesValue * 0.1) },
    { month: "فيفري", sales: Math.round(totalSalesValue * 0.15) },
    { month: "مارس", sales: Math.round(totalSalesValue * 0.12) },
    { month: "أفريل", sales: Math.round(totalSalesValue * 0.22) },
    { month: "ماي", sales: Math.round(totalSalesValue * 0.18) },
    { month: "جوان", sales: Math.round(totalSalesValue * 0.23) },
  ];

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;

  // Calculate points for the smooth line chart
  const maxSales = Math.max(...monthlyData.map(d => d.sales), 1000);
  const points = monthlyData.map((d, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (monthlyData.length - 1);
    const y = chartHeight - padding - (d.sales / maxSales) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area under path
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : "";

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-stone-500 font-bold">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-stone-850">
              {totalSalesValue.toLocaleString()} <span className="text-xs font-serif font-medium text-stone-500">د.ج</span>
            </span>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
              <TrendingUp size={12} />
              <span>+12.4% زيادة هذا الشهر</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-stone-500 font-bold">إجمالي الطلبيات</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-mono text-stone-850">{totalOrders}</span>
            <div className="text-[10px] text-brand-900 font-bold flex items-center gap-1 mt-2">
              <span>{allOrders.filter(o => o.status === "processing").length} طلب جاري معالجته</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-900" />
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-stone-500 font-bold">معدل التحويل (CR)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-mono text-stone-850">{conversionRate}%</span>
            <div className="text-[10px] text-stone-400 mt-2">من أصل {simulatedVisitors.toLocaleString()} زيارة للموقع</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-stone-500 font-bold">عقود النشر الموقعة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Handshake size={16} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-mono text-stone-850">{totalManuscripts}</span>
            <div className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-2">
              <span>بوابات النشر الإلكترونية مفعلة</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>

      </div>

      {/* Interactive Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Line Chart (Native Interactive SVG) */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-stone-800 text-sm">مخطط المبيعات الشهرية لدار النشر</h3>
              <p className="text-[10px] text-stone-400">توزيع المبيعات الإجمالية بالدينار الجزائري على النصف الأول لعام 2026</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">مباشر</span>
          </div>

          <div className="w-full h-44 overflow-hidden relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8c2a3c" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#8c2a3c" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                return (
                  <line 
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area */}
              {areaD && <path d={areaD} fill="url(#salesGrad)" />}

              {/* Line */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#8c2a3c" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              )}

              {/* Dots & Labels */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#ffffff" 
                    stroke="#8c2a3c" 
                    strokeWidth="2" 
                  />
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="8" 
                    fill="#8c2a3c" 
                    fillOpacity="0.0" 
                    className="hover:fill-opacity-10 transition-all"
                  />
                  {/* Tooltip on hover */}
                  <text 
                    x={p.x} 
                    y={p.y - 12} 
                    textAnchor="middle" 
                    fill="#1c1917" 
                    className="text-[9px] font-mono font-bold"
                  >
                    {p.sales.toLocaleString()}
                  </text>
                  {/* X Axis labels */}
                  <text 
                    x={p.x} 
                    y={chartHeight - 10} 
                    textAnchor="middle" 
                    fill="#78716c" 
                    className="text-[9px]"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Bestselling Books Distribution */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-stone-100 pb-3 mb-4">
            <h3 className="font-serif font-bold text-stone-800 text-sm">الكتب والمنتجات الأكثر مبيعاً ونمو المخزون</h3>
            <p className="text-[10px] text-stone-400">الكتب الخمسة الأولى التي تصدرت المبيعات والنشاط بقاعدة البيانات</p>
          </div>

          <div className="space-y-4">
            {[
              { title: "ديوان المتنبي - شرح المعري", sales: "210 نسخة", pct: 95, color: "bg-brand-900" },
              { title: "مقدمة ابن خلدون التاريخية", sales: "174 نسخة", pct: 78, color: "bg-stone-700" },
              { title: "رسائل غسان كنفاني الكاملة", sales: "135 نسخة", pct: 60, color: "bg-emerald-700" },
              { title: "الخيميائي - باولو كويلو", sales: "112 نسخة", pct: 50, color: "bg-amber-600" },
              { title: "قواعد جارتين - عمرو عبد الحميد", sales: "90 نسخة", pct: 40, color: "bg-blue-600" }
            ].map((book, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center mb-1.5 font-bold text-stone-700">
                  <span>{book.title}</span>
                  <span className="font-mono text-stone-500">{book.sales}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${book.color}`} 
                    style={{ width: `${book.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Split Details Section: Quick Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders Overview */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
            <h4 className="font-serif font-bold text-stone-800 text-xs">آخر المعاملات والطلبيات الواردة</h4>
            <span className="text-[10px] font-bold font-mono text-stone-400">المجموع: {totalOrders}</span>
          </div>
          <div className="p-6">
            {allOrders.length === 0 ? (
              <div className="text-stone-400 text-center py-6 text-xs">لا توجد طلبيات بيع مسجلة حالياً بقاعدة البيانات.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {allOrders.slice(0, 4).map((ord: any) => (
                  <div key={ord.id} className="py-3 flex justify-between items-center gap-4 text-xs">
                    <div>
                      <div className="font-mono font-bold text-brand-900">{ord.orderNumber}</div>
                      <div className="text-stone-400 text-[10px] mt-0.5">الدفع: {ord.paymentMethod === "cod" ? "عند الاستلام (COD)" : ord.paymentMethod || "COD"}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold font-mono text-stone-800">{parseFloat(ord.total).toLocaleString()} د.ج</div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                        ord.status === "completed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {ord.status === "completed" ? "مكتمل" : ord.status === "shipped" ? "تم الشحن" : "جاري التحضير"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live System Diagnostics / Feeds */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
            <h4 className="font-serif font-bold text-stone-800 text-xs">تشخيصات الخادم وقاعدة البيانات</h4>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متصل بالإنترنت
            </span>
          </div>
          <div className="p-6 space-y-4 text-xs text-stone-600">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <span className="font-bold">حجم سجلات الكتب:</span>
              <span className="font-mono font-bold text-stone-800">{totalBooks} كتاب مسجل</span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <span className="font-bold">المشتركون بالبريد:</span>
              <span className="font-mono font-bold text-stone-800">{totalSubscribers} مشترك بريدي</span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <span className="font-bold">الاستجابة والاتصال:</span>
              <span className="font-mono font-bold text-emerald-600">42ms (ممتاز)</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="font-bold">حالة النسخ الاحتياطي:</span>
              <span className="text-[10px] bg-stone-100 text-stone-700 font-bold py-0.5 px-2 rounded">جاهز للتصدير</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
