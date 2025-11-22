import { useAuth } from "@/_core/hooks/useAuth";
import { updateUserProfile, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function UserProfile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // default fixed values (to avoid hook mismatch)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    scoutLevel: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: profile } = trpc.user.getProfile.useQuery(user?.id, {
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: registrations = [] } = trpc.eventRegistrations.getByUser.useQuery(user?.id || "");

  const [liveProfile, setLiveProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLiveProfile(null);
      return;
    }

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setLiveProfile(snap.data());
        else setLiveProfile(null);
      },
      (err) => console.error("Firestore snapshot error:", err)
    );

    return () => unsub();
  }, [isAuthenticated, user?.id]);



  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/");
  }, [loading, isAuthenticated, navigate]);

  const shownProfile = liveProfile || profile || null;

  // update form after shownProfile is loaded
  useEffect(() => {
    if (!shownProfile || isEditing) return;
    setFormData({
      name: shownProfile.name || "",
      age: shownProfile.age ? String(shownProfile.age) : "",
      phone: shownProfile.phone || "",
      scoutLevel: shownProfile.scoutLevel || "",
    });
  }, [shownProfile, isEditing]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);

    try {
      const payload: Record<string, any> = {};

      if (formData.name) payload.name = formData.name;
      if (formData.age) payload.age = parseInt(formData.age);
      if (formData.phone) payload.phone = formData.phone;
      if (formData.scoutLevel) payload.scoutLevel = formData.scoutLevel;
      if (payload.name || payload.age || payload.phone || payload.scoutLevel)
        payload.profileCompleted = true;

      await updateUserProfile(user.id, payload);
      setIsEditing(false);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("فشل حفظ التغييرات. حاول لاحقًا.");
    } finally {
      setSaving(false);
    }
  };



  const attendedCount = registrations.filter(r => r.attended).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-green-700">ملفي الشخصي</h1>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {shownProfile?.name?.charAt(0) || "ك"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {shownProfile?.name || "المستخدم"}
                </h2>
                <p className="text-muted-foreground">{shownProfile?.email}</p>
              </div>
            </div>

            {!isEditing ? (
              <>
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      الاسم
                    </label>
                    <p className="text-lg text-foreground mt-1">
                      {shownProfile?.name || "لم يتم تحديده"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        العمر
                      </label>
                      <p className="text-lg text-foreground mt-1">
                        {shownProfile?.age || "لم يتم تحديده"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        رقم الهاتف
                      </label>
                      <p className="text-lg text-foreground mt-1">
                        {shownProfile?.phone || "لم يتم تحديده"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      المستوى الكشفي
                    </label>
                    <p className="text-lg text-foreground mt-1">
                      {shownProfile?.scoutLevel || "لم يتم تحديده"}
                    </p>
                  </div>
                </div>

                {!shownProfile?.profileCompleted && (
                  <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      يرجى إكمال ملفك الشخصي لتتمكن من المشاركة في الأنشطة.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  تعديل الملف الشخصي
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 ring-green-500"
                    placeholder="أدخل اسمك (عربي أو إنجليزي)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">العمر</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 ring-green-500"
                      placeholder="أدخل عمرك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 ring-green-500"
                      placeholder="+961 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المستوى الكشفي</label>
                  <select
                    name="scoutLevel"
                    value={formData.scoutLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 ring-green-500"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="برعم">برعم</option>
                    <option value="أشبال">أشبال</option>
                    <option value="كشافة">كشافة </option>
                    <option value="جوالة">جوالة</option>
                    <option value="قائد">قائد</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">{attendedCount}</p>
                <p className="text-muted-foreground">الورش التي شاركت فيها</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {shownProfile?.scoutLevel || "-"}
                </p>
                <p className="text-muted-foreground">المستوى الكشفي</p>
              </div>
            </Card>
          </div>

          {/* Trophies Section */}
          {shownProfile?.trophies && shownProfile.trophies.length > 0 && (
            <Card className="p-6 mt-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                🏆 الأوسمة والإنجازات
              </h3>
              <div className="flex flex-wrap gap-3">
                {shownProfile.trophies.map((trophy: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg shadow-sm"
                  >
                    <span className="text-yellow-800 font-semibold">🏆 {trophy}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
