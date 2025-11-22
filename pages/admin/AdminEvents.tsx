import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminEvents() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: events = [], refetch } = trpc.events.list.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titleAr: "",
    descriptionAr: "",
    date: "",
    location: "",
    points: 10,
    status: "upcoming" as const,
  });

  // Get registrations for selected event
  const { data: registrations = [] } = trpc.eventRegistrations.getByEvent.useQuery(
    selectedEventId || ''
  );

  // Get all users for manual registration
  const { data: allUsers = [] } = trpc.admin.getAllUsers.useQuery();
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const registerUserMutation = trpc.eventRegistrations.register.useMutation({
    onSuccess: () => {
      // Invalidate all eventRegistrations queries to update both admin view and user profiles
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
      toast.success("تم تسجيل المستخدم بنجاح");
      setShowUserSelect(false);
    },
    onError: (error: any) => {
      toast.error("فشل تسجيل المستخدم: " + error.message);
    }
  });

  const markAttendanceMutation = trpc.eventRegistrations.markAttendance.useMutation({
    onSuccess: () => {
      // Invalidate all eventRegistrations queries to update both admin view and user profiles
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
      toast.success("تم تحديث الحضور بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل تحديث الحضور: " + error.message);
    }
  });

  const handleManualRegister = (user: any) => {
    if (!selectedEventId) return;

    // Check if already registered
    const isRegistered = registrations.some(r => r.userId === user.id);
    if (isRegistered) {
      toast.error("المستخدم مسجل بالفعل في هذه الفعالية");
      return;
    }

    registerUserMutation.mutate({
      eventId: selectedEventId,
      userId: user.id,
      userName: user.name || user.email || "مستخدم",
      userEmail: user.email
    });
  };

  const filteredUsers = allUsers.filter(u =>
    (u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())) &&
    !registrations.some(r => r.userId === u.id)
  );

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ titleAr: "", descriptionAr: "", date: "", location: "", points: 10, status: "upcoming" });
      setShowForm(false);
    },
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ titleAr: "", descriptionAr: "", date: "", location: "", points: 10, status: "upcoming" });
      setEditingId(null);
      setShowForm(false);
    },
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateStatusMutation = trpc.events.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم تحديث حالة الفعالية بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل تحديث حالة الفعالية: " + error.message);
    }
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/");
    }
  }, [loading, isAuthenticated, user?.role, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        titleAr: formData.titleAr || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        location: formData.location || undefined,
        points: formData.points,
      });
    } else {
      createMutation.mutate({
        titleAr: formData.titleAr,
        descriptionAr: formData.descriptionAr,
        date: new Date(formData.date),
        location: formData.location,
        points: formData.points,
      });
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setFormData({
      titleAr: event.titleAr,
      descriptionAr: event.descriptionAr || "",
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location || "",
      points: event.points || 10,
      status: event.status || "upcoming",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الورشة؟")) {
      deleteMutation.mutate(id);
    }
  };

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">الورش المضافة ({events.length})</h2>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({ titleAr: "", descriptionAr: "", date: "", location: "", points: 10, status: "upcoming" });
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة ورشة جديدة
            </Button>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد ورش مضافة حالياً</p>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{event.titleAr}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        📅 {new Date(event.date).toLocaleDateString("ar-SA")}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground mb-2">
                          📍 {event.location}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">
                        🏆 {event.points || 10} نقطة
                      </p>
                      {event.descriptionAr && (
                        <p className="text-sm text-foreground line-clamp-2">{event.descriptionAr}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedEventId(event.id)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition"
                      >
                        عرض المسجلين
                      </button>
                      {event.status !== 'completed' && (
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من إنهاء هذه الفعالية؟ سيتم احتساب النقاط للمشاركين.')) {
                              updateStatusMutation.mutate({ id: event.id, status: 'completed' });
                            }
                          }}
                          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs transition"
                        >
                          إنهاء الفعالية
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <Card className="max-w-2xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "تعديل الورشة" : "إضافة ورشة جديدة"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الورشة</label>
              <input
                type="text"
                name="titleAr"
                value={formData.titleAr}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                placeholder="أدخل عنوان الورشة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <textarea
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
                placeholder="أدخل وصف الورشة"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">التاريخ</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المكان</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="أدخل مكان الورشة"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">النقاط</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "جاري الحفظ..."
                  : editingId
                    ? "تحديث الورشة"
                    : "إضافة الورشة"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ titleAr: "", descriptionAr: "", date: "", location: "", points: 10, status: "upcoming" });
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      )}
      {/* Event Registrations Modal */}
      {
        selectedEventId && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEventId(null)}
          >
            <Card
              className="w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {showUserSelect ? "إضافة مشارك" : `المسجلين في الفعالية (${registrations.length})`}
                  </h2>
                  <div className="flex gap-2">
                    {!showUserSelect && (
                      <Button
                        onClick={() => setShowUserSelect(true)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة مشارك
                      </Button>
                    )}
                    {showUserSelect && (
                      <Button
                        onClick={() => setShowUserSelect(false)}
                        variant="outline"
                        size="sm"
                      >
                        عودة للقائمة
                      </Button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEventId(null);
                        setShowUserSelect(false);
                      }}
                      className="text-slate-400 hover:text-white transition mr-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {showUserSelect ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="بحث عن مستخدم..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="text-center text-slate-400 py-4">لا يوجد مستخدمين</p>
                      ) : (
                        filteredUsers.map(user => (
                          <Card key={user.id} className="p-4 bg-slate-700 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-white">{user.name || "بدون اسم"}</p>
                              <p className="text-sm text-slate-400">{user.email}</p>
                            </div>
                            <Button
                              onClick={() => handleManualRegister(user)}
                              disabled={registerUserMutation.isPending}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {registerUserMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                            </Button>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  registrations.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">
                      لا يوجد مسجلين في هذه الفعالية حتى الآن
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {registrations.map((registration) => (
                        <Card key={registration.id} className="p-4 bg-slate-700">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-white">
                                {registration.userName}
                              </p>
                              <p className="text-sm text-slate-400">
                                {registration.userEmail || 'لا يوجد بريد إلكتروني'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                تاريخ التسجيل: {new Date(registration.registeredAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {registration.attended ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => markAttendanceMutation.mutate({
                                    registrationId: registration.id,
                                    attended: false
                                  })}
                                  disabled={markAttendanceMutation.isPending}
                                >
                                  ✓ حضر
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-slate-400 hover:text-white hover:bg-slate-600"
                                  onClick={() => markAttendanceMutation.mutate({
                                    registrationId: registration.id,
                                    attended: true
                                  })}
                                  disabled={markAttendanceMutation.isPending}
                                >
                                  تسجيل حضور
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )
      }
    </div >
  );
}
