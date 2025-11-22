import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Trophy, Users, BookOpen } from "lucide-react";

export default function AdminCompetitions() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [formData, setFormData] = useState({
    titleAr: "",
    descriptionAr: "",
    password: "",
    entryMode: "once", // 'once' or 'unlimited'
    numberOfQuestions: 10,
    startDate: "",
    endDate: "",
    participationPoints: 20,
    firstPlacePoints: 100,
    secondPlacePoints: 75,
    thirdPlacePoints: 50,
  });

  const { data: competitions = [], refetch } = trpc.competition.getAll.useQuery();
  const createMutation = trpc.competition.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المسابقة بنجاح");
      setShowCreateDialog(false);
      setFormData({
        titleAr: "",
        descriptionAr: "",
        password: "",
        entryMode: "once",
        numberOfQuestions: 10,
        startDate: "",
        endDate: "",
        participationPoints: 20,
        firstPlacePoints: 100,
        secondPlacePoints: 75,
        thirdPlacePoints: 50,
      });
      refetch();
    },
    onError: (error: any) => {
      console.error("Error creating competition:", error);
      toast.error("خطأ في إنشاء المسابقة");
    },
  });

  const deleteMutation = trpc.competition.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المسابقة بنجاح");
      refetch();
    },
    onError: () => {
      toast.error("خطأ في حذف المسابقة");
    },
  });

  const updateStatusMutation = trpc.competition.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleCreate = () => {
    if (!formData.titleAr || !formData.password || !formData.startDate || !formData.endDate || !formData.numberOfQuestions) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (isNaN(formData.numberOfQuestions) || formData.numberOfQuestions < 1) {
      toast.error("عدد الأسئلة يجب أن يكون رقماً صحيحاً أكبر من 0");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error("تاريخ البداية أو النهاية غير صالح");
      return;
    }

    if (endDate <= startDate) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    createMutation.mutate({
      titleAr: formData.titleAr,
      descriptionAr: formData.descriptionAr,
      password: formData.password,
      entryMode: formData.entryMode,
      numberOfQuestions: formData.numberOfQuestions,
      startDate: startDate,
      endDate: endDate,
      createdBy: user!.id,
      status: "draft",
      totalQuestions: 0,
      participationPoints: formData.participationPoints,
      firstPlacePoints: formData.firstPlacePoints,
      secondPlacePoints: formData.secondPlacePoints,
      thirdPlacePoints: formData.thirdPlacePoints,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المسابقة؟")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              إدارة المسابقات
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">إنشاء وإدارة المسابقات والأسئلة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المسابقات</p>
                <p className="text-3xl font-bold text-foreground">{competitions.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">المسابقات النشطة</p>
                <p className="text-3xl font-bold text-foreground">
                  {competitions.filter(c => c.status === "active").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الأسئلة</p>
                <p className="text-3xl font-bold text-foreground">
                  {competitions.reduce((sum, c) => sum + (c.totalQuestions || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            إنشاء مسابقة جديدة
          </Button>
        </div>

        {/* Competitions Grid */}
        <div className="grid gap-6">
          {competitions.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-sm bg-white">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد مسابقات حتى الآن</p>
              <p className="text-sm text-muted-foreground mt-2">ابدأ بإنشاء مسابقة جديدة</p>
            </Card>
          ) : (
            competitions.map((comp) => (
              <Card key={comp.id} className="p-6 border-0 shadow-sm bg-white hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-foreground">{comp.titleAr}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${comp.status === "active" ? "bg-green-100 text-green-700" :
                        comp.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                        {comp.status === "draft" && "مسودة"}
                        {comp.status === "active" && "نشطة"}
                        {comp.status === "finished" && "منتهية"}
                      </span>
                    </div>
                    {comp.descriptionAr && (
                      <p className="text-muted-foreground mb-4">{comp.descriptionAr}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">عدد الأسئلة</p>
                        <p className="text-lg font-bold text-blue-700">{comp.numberOfQuestions}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">إجمالي الأسئلة</p>
                        <p className="text-lg font-bold text-purple-700">{comp.totalQuestions}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">كلمة المرور</p>
                        <p className="text-sm font-mono font-bold text-amber-700">{comp.password}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                        <p className="text-lg font-bold text-green-700">
                          {comp.status === "draft" && "مسودة"}
                          {comp.status === "active" && "نشطة"}
                          {comp.status === "finished" && "منتهية"}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">توزيع النقاط</p>
                        <div className="flex justify-between text-xs font-bold text-yellow-700">
                          <span>مشاركة: {comp.participationPoints || 20}</span>
                          <span>1️⃣: {comp.firstPlacePoints || 100}</span>
                          <span>2️⃣: {comp.secondPlacePoints || 75}</span>
                          <span>3️⃣: {comp.thirdPlacePoints || 50}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/competitions/${comp.id}/questions`)}
                      className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <BookOpen className="w-4 h-4" />
                      الأسئلة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/competitions/${comp.id}/results`)}
                      className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                    >
                      <Eye className="w-4 h-4" />
                      النتائج
                    </Button>
                    {comp.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: comp.id, status: "active" })}
                        className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                      >
                        تفعيل
                      </Button>
                    )}
                    {comp.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: comp.id, status: "finished" })}
                        className="gap-2 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300"
                      >
                        إنهاء
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(comp.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-2xl p-8">
          <DialogHeader className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-green-600" />
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-bold">إنشاء مسابقة جديدة</DialogTitle>
              <p className="text-sm text-muted-foreground">املأ تفاصيل المسابقة</p>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="pr-4 border-r border-gray-200">
              <label className="text-sm font-semibold text-foreground mb-2 block">عنوان المسابقة *</label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="أدخل عنوان المسابقة"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">الوصف</label>
              <Input
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                placeholder="أدخل وصف المسابقة"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">كلمة المرور *</label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="أدخل كلمة المرور"
                type="password"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-foreground mb-2 block">طريقة الدخول *</label>
              <select
                value={formData.entryMode}
                onChange={(e) => {
                  const mode = e.target.value as "once" | "unlimited";
                  setFormData((prev) => ({
                    ...prev,
                    entryMode: mode,
                    // If unlimited, set points to 0
                    ...(mode === "unlimited"
                      ? {
                        participationPoints: 0,
                        firstPlacePoints: 0,
                        secondPlacePoints: 0,
                        thirdPlacePoints: 0,
                      }
                      : {}),
                  }));
                }}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500 w-full p-2 rounded"
              >
                <option value="once">مرة واحدة لكل مستخدم</option>
                <option value="unlimited">دخول غير محدود (نقاط 0)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">عدد الأسئلة لكل مستخدم *</label>
              <Input
                type="number"
                value={formData.numberOfQuestions}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfQuestions: e.target.value ? parseInt(e.target.value) : 0 })
                }
                min="1"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">تاريخ النهاية *</label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">تاريخ البداية *</label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2 border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground mb-2">نظام النقاط</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">نقاط المشاركة</label>
                  <Input
                    type="number"
                    value={formData.participationPoints}
                    onChange={(e) =>
                      setFormData({ ...formData, participationPoints: e.target.value ? parseInt(e.target.value) : 0 })
                    }
                    min="0"
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">المركز الأول</label>
                  <Input
                    type="number"
                    value={formData.firstPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, firstPlacePoints: e.target.value ? parseInt(e.target.value) : 0 })
                    }
                    min="0"
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">المركز الثاني</label>
                  <Input
                    type="number"
                    value={formData.secondPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, secondPlacePoints: e.target.value ? parseInt(e.target.value) : 0 })
                    }
                    min="0"
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">المركز الثالث</label>
                  <Input
                    type="number"
                    value={formData.thirdPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, thirdPlacePoints: e.target.value ? parseInt(e.target.value) : 0 })
                    }
                    min="0"
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded mt-6"
          >
            {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المسابقة"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
