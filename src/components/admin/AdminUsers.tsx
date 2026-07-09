import React, { useState } from "react";
import { 
  Users, Shield, ShieldAlert, Check, Ban, Unlock, Mail, Phone, Calendar
} from "lucide-react";

interface AdminUsersProps {
  allUsers: any[];
  onRefresh: () => void;
}

export function AdminUsers({ allUsers, onRefresh }: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const handleChangeRole = async (userId: number, nextRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to update user role", err);
    }
  };

  const handleToggleBan = async (userId: number, currentRole: string) => {
    const isBannedNow = currentRole === "banned";
    const nextBanState = !isBannedNow;
    
    const confirmMsg = nextBanState 
      ? "هل أنت متأكد من حظر هذا المستخدم ومنعه من الشراء واستخدام الحساب؟" 
      : "هل ترغب في إلغاء الحظر وإعادة تنشيط هذا الحساب؟";

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextBanState })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to toggle ban user", err);
    }
  };

  // Filters users list
  const filteredUsers = allUsers.filter(user => {
    const nameMatch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const phoneMatch = user.phone?.includes(searchQuery) || false;
    const matchesSearch = nameMatch || emailMatch || phoneMatch;
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Filters bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="ابحث بالاسم، البريد أو رقم الهاتف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-brand-900 font-bold"
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs font-bold text-stone-700"
          >
            <option value="all">كل الصلاحيات والأدوار</option>
            <option value="customer">عميل / زبون (Customer)</option>
            <option value="editor">محرر محتوى (Editor)</option>
            <option value="admin">مدير النظام (Admin)</option>
            <option value="banned">مستخدمون محظورون</option>
          </select>
        </div>
        
        <span className="text-xs text-stone-400 font-bold font-mono shrink-0">
          عدد المستخدمين المسجلين: {allUsers.length}
        </span>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
          <h3 className="font-serif font-bold text-stone-850 text-xs">قاعدة بيانات المشتركين والمستخدمين</h3>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-stone-400 text-center py-12 text-xs">لم يتم العثور على أي مستخدمين يطابقون معايير البحث.</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                  <th className="p-4">الاسم والمستخدم</th>
                  <th className="p-4">تفاصيل الاتصال</th>
                  <th className="p-4">تاريخ الانضمام</th>
                  <th className="p-4">الصلاحيات الحالية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left pl-6">عمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredUsers.map((user: any) => {
                  const isBanned = user.role === "banned";
                  return (
                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-stone-850 text-sm mb-1">{user.name || "مستخدم جديد"}</div>
                        <div className="text-stone-400 text-[10px] font-mono">UID: {user.uid?.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-stone-700 font-bold mb-0.5">
                          <Mail size={12} className="text-stone-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                            <Phone size={10} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-stone-500 font-mono">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "غير متوفر"}
                      </td>
                      <td className="p-4">
                        {isBanned ? (
                          <span className="text-red-500 font-bold text-xs">حساب محظور</span>
                        ) : (
                          <select
                            value={user.role || "customer"}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="border border-stone-250 bg-stone-50 rounded px-2 py-1 text-xs font-bold text-stone-700 focus:outline-none focus:border-brand-900"
                          >
                            <option value="customer">عميل / زبون (Customer)</option>
                            <option value="editor">محرر المدونة (Editor)</option>
                            <option value="admin">مدير بصلاحيات كاملة (Admin)</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isBanned 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          <Shield size={10} />
                          {isBanned ? "محظور" : user.role === "admin" ? "أدمن" : "نشط"}
                        </span>
                      </td>
                      <td className="p-4 text-left pl-6">
                        <button
                          onClick={() => handleToggleBan(user.id, user.role)}
                          className={`font-bold py-1.5 px-3.5 rounded text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            isBanned
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                          }`}
                        >
                          {isBanned ? <Unlock size={12} /> : <Ban size={12} />}
                          <span>{isBanned ? "إلغاء الحظر" : "حظر المستخدم"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
