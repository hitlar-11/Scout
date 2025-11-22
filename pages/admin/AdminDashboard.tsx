import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Calendar, Image, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: users = [] } = trpc.admin.getAllUsers.useQuery();
  const { data: messages = [] } = trpc.admin.getMessages.useQuery();
  const { data: events = [] } = trpc.events.list.useQuery();
  const { data: gallery = [] } = trpc.gallery.list.useQuery();

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const stats = [
    {
      label: "عدد الأعضاء",
      value: users.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "الورش المضافة",
      value: events.length,
      icon: Calendar,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "صور المعرض",
      value: gallery.length,
      icon: Image,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "الرسائل",
      value: messages.filter((m) => !m.read).length,
      icon: MessageSquare,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة التحكم الإدارية</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/events" className="block">
            <Card className="p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">📅</div>
              <p className="font-medium text-foreground">إدارة الورش</p>
            </Card>
          </Link>
          <Link href="/admin/gallery" className="block">
            <Card className="p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="font-medium text-foreground">إدارة المعرض</p>
            </Card>
          </Link>
          <Link href="/admin/stories" className="block">
            <Card className="p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">📖</div>
              <p className="font-medium text-foreground">إدارة القصص</p>
            </Card>
          </Link>
          <Link href="/admin/competitions" className="block">
            <Card className="p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">🏆</div>
              <p className="font-medium text-foreground">إدارة المسابقات</p>
            </Card>
          </Link>
          <Link href="/admin/messages" className="block">
            <Card className="p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">💬</div>
              <p className="font-medium text-foreground">الرسائل</p>
            </Card>
          </Link>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">إدارة الأعضاء</h2>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                إضافة عضو
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                    {u.role === "admin" ? "مسؤول" : "عضو"}
                  </span>
                </div>
              ))}
              {users.length > 5 && (
                <Button variant="ghost" className="w-full text-green-600">
                  عرض الكل ({users.length})
                </Button>
              )}
            </div>
          </Card>

          {/* Messages Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">الرسائل الواردة</h2>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                {messages.filter((m) => !m.read).length} جديد
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.slice(0, 5).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${msg.read ? "bg-background border-border" : "bg-yellow-50 border-yellow-200"
                    }`}
                >
                  <p className="font-medium text-foreground">{msg.nameAr}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{msg.messageAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{msg.phone}</p>
                </div>
              ))}
              {messages.length > 5 && (
                <Button variant="ghost" className="w-full text-green-600">
                  عرض الكل ({messages.length})
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Content Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">إدارة الورش</h2>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                إضافة ورشة
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">{event.titleAr}</p>
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(event.date).toLocaleDateString("ar-SA")}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="text-blue-600">
                      تعديل
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
              {events.length > 5 && (
                <Button variant="ghost" className="w-full text-green-600">
                  عرض الكل ({events.length})
                </Button>
              )}
            </div>
          </Card>

          {/* Gallery Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">إدارة المعرض</h2>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                إضافة صورة
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {gallery.slice(0, 4).map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.imageUrl}
                    alt={img.titleAr}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" className="text-white">
                      تعديل
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white">
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {gallery.length > 4 && (
              <Button variant="ghost" className="w-full text-green-600 mt-3">
                عرض الكل ({gallery.length})
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
