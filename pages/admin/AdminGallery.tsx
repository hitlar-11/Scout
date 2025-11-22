import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function AdminGallery() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    titleAr: "",
    descriptionAr: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: gallery = [], refetch } = trpc.gallery.list.useQuery();
  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ imageUrl: "", titleAr: "", descriptionAr: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowForm(false);
    },
  });

  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ imageUrl: "", titleAr: "", descriptionAr: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingId(null);
      setShowForm(false);
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;
    if (selectedFile) {
      try {
        setUploading(true);
        imageUrl = await uploadToCloudinary(selectedFile);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        alert("فشل رفع الصورة. حاول مرة أخرى.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        imageUrl: imageUrl || undefined,
        titleAr: formData.titleAr || undefined,
        descriptionAr: formData.descriptionAr || undefined,
      });
    } else {
      createMutation.mutate({
        imageUrl: imageUrl,
        titleAr: formData.titleAr,
        descriptionAr: formData.descriptionAr,
      });
    }
  };

  const handleEdit = (image: any) => {
    setEditingId(image.id);
    setFormData({
      imageUrl: image.imageUrl,
      titleAr: image.titleAr,
      descriptionAr: image.descriptionAr || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
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
          <h1 className="text-2xl font-bold text-green-700">إدارة المعرض</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">الصور المضافة ({gallery.length})</h2>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ imageUrl: "", titleAr: "", descriptionAr: "" });
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة صورة جديدة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  لا توجد صور مضافة حالياً
                </p>
              ) : (
                gallery.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={image.titleAr}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(image)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-2">{image.titleAr}</h3>
                      {image.descriptionAr && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {image.descriptionAr}
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "تعديل الصورة" : "إضافة صورة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">اختر صورة من جهازك</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رابط الصورة (URL)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {(previewUrl || formData.imageUrl) && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <img
                    src={previewUrl || formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الصورة</label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="أدخل عنوان الصورة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
                  placeholder="أدخل وصف الصورة"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || uploading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {uploading
                    ? "جاري الرفع..."
                    : createMutation.isPending || updateMutation.isPending
                    ? "جاري الحفظ..."
                    : editingId
                    ? "تحديث الصورة"
                    : "إضافة الصورة"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ imageUrl: "", titleAr: "", descriptionAr: "" });
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
