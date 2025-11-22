import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminStories() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titleAr: "",
    contentAr: "",
    visibleToAll: false,
  });

  const { data: stories = [], refetch } = trpc.stories.list.useQuery();
  const createMutation = trpc.stories.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ titleAr: "", contentAr: "", visibleToAll: false });
      setShowForm(false);
    },
  });

  const updateMutation = trpc.stories.update.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ titleAr: "", contentAr: "", visibleToAll: false });
      setEditingId(null);
      setShowForm(false);
    },
  });

  const deleteMutation = trpc.stories.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        titleAr: formData.titleAr || undefined,
        contentAr: formData.contentAr || undefined,
        visibleToAll: formData.visibleToAll,
      });
    } else {
      createMutation.mutate({
        titleAr: formData.titleAr,
        contentAr: formData.contentAr,
        visibleToAll: formData.visibleToAll,
      });
    }
  };

  const handleEdit = (story: any) => {
    setEditingId(story.id);
    setFormData({
      titleAr: story.titleAr,
      contentAr: story.contentAr,
      visibleToAll: story.visibleToAll,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه القصة؟")) {
      deleteMutation.mutate(id);
    }
  };

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-green-700">إدارة القصص</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">القصص المضافة ({stories.length})</h2>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ titleAr: "", contentAr: "", visibleToAll: false });
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة قصة جديدة
              </Button>
            </div>

            <div className="space-y-4">
              {stories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد قصص مضافة حالياً</p>
              ) : (
                stories.map((story) => (
                  <Card key={story.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-foreground">{story.titleAr}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${story.visibleToAll
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {story.visibleToAll ? "عام" : "للكشافة فقط"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-3">{story.contentAr}</p>
                      </div>
                      <div className="flex gap-2 mr-4">
                        <button
                          onClick={() => handleEdit(story)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              {editingId ? "تعديل القصة" : "إضافة قصة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان القصة</label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="أدخل عنوان القصة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">محتوى القصة</label>
                <textarea
                  name="contentAr"
                  value={formData.contentAr}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
                  placeholder="أدخل محتوى القصة"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  name="visibleToAll"
                  checked={formData.visibleToAll}
                  onChange={handleChange}
                  id="visibleToAll"
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="visibleToAll" className="flex items-center gap-2 cursor-pointer flex-1">
                  {formData.visibleToAll ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    {formData.visibleToAll ? "عام - مرئي للجميع" : "للأعضاء فقط - مرئي للمسجلين"}
                  </span>
                </label>
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
                      ? "تحديث القصة"
                      : "إضافة القصة"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ titleAr: "", contentAr: "", visibleToAll: false });
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
      </main>
    </div>
  );
}
