import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { makeUserAdmin, removeUserAdmin, listAllUsers, getUserByEmail, awardTrophy, removeTrophy, deleteUser, resetUserPoints } from '@/lib/adminManagement';
import { Loader2, Shield, LogOut, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string | null;
  scoutLevel: string | null;
  manualPoints?: number;
  points: number;
  competitionPoints?: number;
  eventPoints?: number;
  achievements: number;
  trophies: string[];
  createdAt: string;
  lastSignIn: string | null;
}

import { useQueryClient } from '@tanstack/react-query';

export default function AdminUserManagement() {
  const { user, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth();
  const [_navigate, setLocation] = useLocation();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [trophyInput, setTrophyInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserInfo | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', scoutLevel: '', manualPoints: 0 });
  const queryClient = useQueryClient();

  // Fetch leaderboard data to get points and achievements
  const { data: leaderboardData = [] } = trpc.leaderboard.getTopUsers.useQuery();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      setLocation('/');
    }
  }, [user, isAdmin, authLoading, setLocation]);

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await listAllUsers();
      if (result.success && result.users) {
        // Merge user data with leaderboard data for points/achievements
        const usersWithStats = result.users.map(user => {
          const leaderboardEntry = leaderboardData.find(lb => lb.userId === user.id);
          return {
            ...user,
            manualPoints: (user as any).manualPoints || 0,
            points: leaderboardEntry?.totalPoints || 0,
            competitionPoints: (leaderboardEntry as any)?.competitionPoints || 0,
            eventPoints: (leaderboardEntry as any)?.eventPoints || 0,
            achievements: (user.trophies || []).length,
            trophies: user.trophies || [],
          };
        });
        setUsers(usersWithStats as UserInfo[]);
      } else {
        toast.error(result.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboardData]);

  // Search for a specific user
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setActionLoading(true);
    try {
      const result = await getUserByEmail(searchQuery);
      if (result.success && result.user) {
        // Check if user already in list, if not add
        const exists = users.find(u => u.email === result.user.email);
        if (!exists) {
          const leaderboardEntry = leaderboardData.find(lb => lb.userId === result.user.id);
          const userWithStats = {
            ...result.user,
            manualPoints: (result.user as any).manualPoints || 0,
            scoutLevel: result.user.scoutLevel || null,
            points: leaderboardEntry?.totalPoints || 0,
            competitionPoints: (leaderboardEntry as any)?.competitionPoints || 0,
            eventPoints: (leaderboardEntry as any)?.eventPoints || 0,
            achievements: leaderboardEntry?.competitionsParticipated || 0,
            trophies: result.user.trophies || [],
          };
          setUsers([userWithStats as UserInfo, ...users]);
        }
        toast.success(`تم العثور على المستخدم: ${result.user.name || result.user.email}`);
      } else {
        toast.error(result.message || 'لم يتم العثور على المستخدم');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('خطأ في البحث عن المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  // Make user admin
  const handleMakeAdmin = async (email: string) => {
    setActionLoading(true);
    try {
      const result = await makeUserAdmin(email);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setUsers(users.map(u =>
          u.email === email ? { ...u, role: 'admin' } : u
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Error making user admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove admin role
  const handleRemoveAdmin = async (email: string) => {
    setActionLoading(true);
    try {
      const result = await removeUserAdmin(email);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setUsers(users.map(u =>
          u.email === email ? { ...u, role: 'user' } : u
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Error removing admin role');
    } finally {
      setActionLoading(false);
    }
  };

  // Award trophy
  const handleAwardTrophy = async (userId: string) => {
    if (!trophyInput.trim()) {
      toast.error('Please enter a trophy name');
      return;
    }

    setActionLoading(true);
    try {
      const result = await awardTrophy(userId, trophyInput);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setUsers(users.map(u =>
          u.id === userId ? { ...u, trophies: [...(u.trophies || []), trophyInput] } : u
        ));
        setTrophyInput('');
        setSelectedUserId(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error awarding trophy:', error);
      toast.error('Error awarding trophy');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove trophy
  const handleRemoveTrophy = async (userId: string, trophyName: string) => {
    setActionLoading(true);
    try {
      const result = await removeTrophy(userId, trophyName);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setUsers(users.map(u =>
          u.id === userId ? { ...u, trophies: (u.trophies || []).filter(t => t !== trophyName) } : u
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing trophy:', error);
      toast.error('Error removing trophy');
    } finally {
      setActionLoading(false);
    }
  };

  // Save user edits
  const handleSaveUserEdit = async () => {
    if (!selectedUserForDetails) return;

    setActionLoading(true);
    try {
      const userRef = doc(db, 'users', selectedUserForDetails.id);
      await updateDoc(userRef, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone || null,
        scoutLevel: editFormData.scoutLevel || null,
        manualPoints: Number(editFormData.manualPoints) || 0,
      });

      // Calculate new total points locally
      const oldManualPoints = selectedUserForDetails.manualPoints || 0;
      const newManualPoints = Number(editFormData.manualPoints) || 0;
      const currentTotalPoints = selectedUserForDetails.points;
      const newTotalPoints = currentTotalPoints - oldManualPoints + newManualPoints;

      // Update local state
      const updatedUser = {
        ...selectedUserForDetails,
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone || null,
        scoutLevel: editFormData.scoutLevel || null,
        manualPoints: newManualPoints,
        points: newTotalPoints,
      };

      setSelectedUserForDetails(updatedUser);
      setUsers(users.map(u => u.id === selectedUserForDetails.id ? updatedUser : u));

      // Invalidate leaderboard query to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

      setIsEditingUser(false);
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('فشل حفظ التغييرات');
    } finally {
      setActionLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDeleteUser = async () => {
    if (!selectedUserForDetails) return;

    setActionLoading(true);
    try {
      const result = await deleteUser(selectedUserForDetails.id);
      if (result.success) {
        toast.success(result.message);
        // Remove from local state
        setUsers(users.filter(u => u.id !== selectedUserForDetails.id));
        setSelectedUserForDetails(null);
        setShowDeleteConfirm(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPoints = async () => {
    if (!selectedUserForDetails) return;

    setActionLoading(true);
    try {
      const result = await resetUserPoints(selectedUserForDetails.id);
      if (result.success) {
        toast.success(result.message);

        // Update local state - reset all points to 0
        const updatedUser = {
          ...selectedUserForDetails,
          manualPoints: 0,
          points: 0,
          competitionPoints: 0,
          eventPoints: 0,
        };

        setSelectedUserForDetails(updatedUser);
        setUsers(users.map(u => u.id === selectedUserForDetails.id ? updatedUser : u));

        // Invalidate leaderboard query
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

        setShowResetConfirm(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error resetting points:', error);
      toast.error('فشل إعادة تعيين النقاط');
    } finally {
      setActionLoading(false);
    }
  };


  const [, navigate] = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              إدارة المستخدمين
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">إدارة أدوار المستخدمين والصلاحيات</p>
        </div>

        {/* Current User Info */}
        <Card className="p-4 mb-6 border-l-4 border-l-green-600 bg-green-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              مسجل الدخول: <span className="font-semibold">{user.email}</span>
              <span className="mr-2 px-3 py-1 bg-green-600 text-white rounded-full text-xs">مسؤول</span>
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">البحث عن مستخدم</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              بحث
            </button>
          </form>
        </Card>

        {/* Users List */}
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-foreground">جميع المستخدمين</h2>
            <p className="text-sm text-muted-foreground mt-1">{users.length} مستخدم</p>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              لا يوجد مستخدمين. ابحث عن المستخدمين لإضافتهم إلى القائمة.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">البريد</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الدور</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">المرحلة الكشفية</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">النقاط</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الإنجازات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserForDetails(u)}
                      className="hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{u.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                          {u.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {u.scoutLevel || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {u.points}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {u.achievements} 🏆
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {u.role === 'user' ? (
                            <button
                              onClick={() => handleMakeAdmin(u.email)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition disabled:opacity-50"
                              title="جعله مسؤول"
                            >
                              👑
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRemoveAdmin(u.email)}
                              disabled={actionLoading || u.email === user.email}
                              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition disabled:opacity-50"
                              title="إزالة كمسؤول"
                            >
                              ⬇️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {selectedUserForDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setSelectedUserForDetails(null); setShowDeleteConfirm(false); }}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl mx-4">
              <Card className="bg-white p-6 w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-foreground">معلومات المستخدم</h2>
                  <button onClick={() => { setSelectedUserForDetails(null); setShowDeleteConfirm(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                {/* User Info */}
                <div className="space-y-4 mb-6">
                  {!isEditingUser ? (
                    <>
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => {
                            setEditFormData({
                              name: selectedUserForDetails.name,
                              email: selectedUserForDetails.email,
                              phone: selectedUserForDetails.phone || '',
                              scoutLevel: selectedUserForDetails.scoutLevel || '',
                              manualPoints: selectedUserForDetails.manualPoints || 0,
                            });
                            setIsEditingUser(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                          ✏️ تعديل
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">الاسم</label>
                          <p className="text-lg font-semibold">{selectedUserForDetails.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                          <p className="text-lg">{selectedUserForDetails.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground" >الدور</label>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUserForDetails.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {selectedUserForDetails.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">المرحلة الكشفية</label>
                          <p className="text-lg">{selectedUserForDetails.scoutLevel || '-'}</p>
                        </div>
                        <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h4 className="font-bold text-blue-800 mb-3">تفاصيل النقاط</h4>
                          <div className="grid grid-cols-4 gap-4 text-center mb-4">
                            <div className="bg-white p-2 rounded shadow-sm">
                              <span className="block text-xs text-gray-500">المسابقات</span>
                              <span className="font-bold text-blue-600">{selectedUserForDetails.competitionPoints || 0}</span>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <span className="block text-xs text-gray-500">الفعاليات</span>
                              <span className="font-bold text-green-600">{selectedUserForDetails.eventPoints || 0}</span>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <span className="block text-xs text-gray-500">يدوي</span>
                              <span className="font-bold text-orange-600">{selectedUserForDetails.manualPoints || 0}</span>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm border-2 border-blue-200">
                              <span className="block text-xs text-gray-500">المجموع</span>
                              <span className="font-bold text-xl text-blue-800">{selectedUserForDetails.points}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">الإنجازات</label>
                          <p className="text-lg font-bold text-purple-600">{selectedUserForDetails.achievements} 🏆</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-end gap-2 mb-2">
                        <button
                          onClick={() => setIsEditingUser(false)}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleSaveUserEdit}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                        >
                          💾 حفظ
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">الاسم</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">البريد الإلكتروني</label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">رقم الهاتف</label>
                          <input
                            type="text"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="اختياري"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">المرحلة الكشفية</label>
                          <select
                            value={editFormData.scoutLevel}
                            onChange={(e) => setEditFormData({ ...editFormData, scoutLevel: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">اختر المستوى</option>
                            <option value="برعم">برعم</option>
                            <option value="أشبال">أشبال</option>
                            <option value="كشافة">كشافة</option>
                            <option value="جوالة">جوالة</option>
                            <option value="قائد">قائد</option>
                          </select>
                        </div>
                        <div className="col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <label className="text-sm font-medium text-muted-foreground block mb-2">إدارة النقاط اليدوية</label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <input
                                type="number"
                                value={editFormData.manualPoints}
                                onChange={(e) => setEditFormData({ ...editFormData, manualPoints: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg text-center font-bold text-lg"
                                placeholder="0"
                              />
                            </div>
                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) + 5 })}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-bold"
                                title="إضافة 5 نقاط"
                              >
                                +5
                              </button>                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) + 10 })}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-bold"
                                title="إضافة 10 نقاط"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) + 50 })}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-bold"
                                title="إضافة 50 نقطة"
                              >
                                +50
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) - 5 })}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold"
                                title="خصم 5 نقاط"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) - 10 })}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold"
                                title="خصم 10 نقاط"
                              >
                                -10
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: (Number(editFormData.manualPoints) || 0) - 50 })}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold"
                                title="خصم 50 نقطة"
                              >
                                -50
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, manualPoints: 0 })}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-bold"
                                title="تصفير النقاط اليدوية"
                              >
                                0
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            النقاط اليدوية الحالية: <span className="font-bold">{selectedUserForDetails.manualPoints || 0}</span> |
                            المجموع الجديد المتوقع: <span className="font-bold text-blue-600">{(selectedUserForDetails.points - (selectedUserForDetails.manualPoints || 0)) + (Number(editFormData.manualPoints) || 0)}</span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">الإنجازات</label>
                          <p className="text-lg font-bold text-purple-600">{selectedUserForDetails.achievements} 🏆</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Trophies Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">الأوسمة 🏆</h3>
                  {selectedUserForDetails.trophies && selectedUserForDetails.trophies.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedUserForDetails.trophies.map((trophy, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                          🏆 {trophy}
                          <button
                            onClick={async () => {
                              await handleRemoveTrophy(selectedUserForDetails.id, trophy);
                              const newTrophies = selectedUserForDetails.trophies.filter(t => t !== trophy);
                              setSelectedUserForDetails({
                                ...selectedUserForDetails,
                                trophies: newTrophies,
                                achievements: newTrophies.length
                              });
                              // Also update in main users list
                              setUsers(users.map(u =>
                                u.id === selectedUserForDetails.id
                                  ? { ...u, trophies: newTrophies, achievements: newTrophies.length }
                                  : u
                              ));
                            }}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mb-4">لا توجد أوسمة</p>
                  )}

                  {/* Add Trophy */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اسم الوسام الجديد..."
                      value={selectedUserId === selectedUserForDetails.id ? trophyInput : ''}
                      onChange={(e) => {
                        setTrophyInput(e.target.value);
                        setSelectedUserId(selectedUserForDetails.id);
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={async () => {
                        await handleAwardTrophy(selectedUserForDetails.id);
                        if (trophyInput) {
                          const newTrophies = [...selectedUserForDetails.trophies, trophyInput];
                          setSelectedUserForDetails({
                            ...selectedUserForDetails,
                            trophies: newTrophies,
                            achievements: newTrophies.length
                          });
                          // Also update in main users list
                          setUsers(users.map(u =>
                            u.id === selectedUserForDetails.id
                              ? { ...u, trophies: newTrophies, achievements: newTrophies.length }
                              : u
                          ));
                        }
                      }}
                      disabled={!trophyInput || selectedUserId !== selectedUserForDetails.id}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg disabled:opacity-50"
                    >
                      إضافة 🏆
                    </button>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-col gap-4 pt-4 border-t">
                  {showDeleteConfirm ? (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="text-red-800 font-bold mb-2">⚠️ تحذير: حذف المستخدم</h4>
                      <p className="text-red-700 text-sm mb-4">
                        هل أنت متأكد أنك تريد حذف هذا المستخدم؟ سيتم حذف جميع بياناته بما في ذلك النتائج، التسجيلات، والأوسمة نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading ? 'جاري الحذف...' : 'نعم، احذف المستخدم'}
                        </button>
                      </div>
                    </div>
                  ) : showResetConfirm ? (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="text-orange-800 font-bold mb-2">⚠️ تحذير: إعادة تعيين النقاط</h4>
                      <p className="text-orange-700 text-sm mb-4">
                        هل أنت متأكد أنك تريد إعادة تعيين جميع نقاط هذا المستخدم؟ سيتم حذف جميع نتائج المسابقات، تسجيلات الفعاليات، والنقاط اليدوية. هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleResetPoints}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading ? 'جاري إعادة التعيين...' : 'نعم، أعد تعيين النقاط'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {selectedUserForDetails.role === 'user' ? (
                        <button
                          onClick={async () => {
                            await handleMakeAdmin(selectedUserForDetails.email);
                            setSelectedUserForDetails({ ...selectedUserForDetails, role: 'admin' });
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                          👑 جعله مسؤول
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await handleRemoveAdmin(selectedUserForDetails.email);
                            setSelectedUserForDetails({ ...selectedUserForDetails, role: 'user' });
                          }}
                          disabled={selectedUserForDetails.email === user.email}
                          className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50"
                        >
                          ⬇️ إزالة كمسؤول
                        </button>
                      )}

                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition"
                      >
                        🔄 إعادة تعيين النقاط
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={selectedUserForDetails.email === user.email}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        حذف المستخدم
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-6 p-6 border-l-4 border-l-blue-600 bg-blue-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-blue-600" />
            كيفية الاستخدام
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 mr-4 list-disc">
            <li>ابحث عن المستخدمين عبر البريد الإلكتروني لإضافتهم إلى قائمة الإدارة</li>
            <li>انقر على "جعله مسؤول" لمنح صلاحيات المسؤول للمستخدم</li>
            <li>انقر على "إزالة كمسؤول" لإلغاء صلاحيات المسؤول (لا يمكنك إزالة صلاحيتك الخاصة)</li>
            <li>المستخدمون المسؤولون سيرون لوحة التحكم عند تسجيل الدخول</li>
            <li>التغييرات تصبح سارية فوراً بعد تسجيل دخول المستخدم التالي</li>
          </ul>
        </Card>
      </div>
    </div >
  );
}
