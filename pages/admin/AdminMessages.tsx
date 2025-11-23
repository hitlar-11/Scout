import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Trash2, Check } from "lucide-react";

export default function AdminMessages() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const queryResult = trpc.admin.getMessages.useQuery();
  const { data: messages = [], refetch } = queryResult;

  const markAsReadMutation = trpc.contact.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedMessage(null);
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/");
    }
  }, [loading, isAuthenticated, user?.role, navigate]);

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      deleteMutation.mutate(id);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">الرسائل الواردة</h1>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">
              {unreadCount} جديد
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد رسائل</p>
              ) : (
                messages.map((msg) => (
                  <Card
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition ${selectedMessage?.id === msg.id
                      ? "bg-green-50 border-green-300"
                      : msg.read
                        ? "hover:bg-muted"
                        : "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {!msg.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{msg.nameAr}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.phone}</p>
                        <p className="text-sm text-foreground line-clamp-2 mt-1">{msg.messageAr}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground">{selectedMessage.nameAr}</h2>
                    <span className={`text-xs px-3 py-1 rounded ${selectedMessage.read
                      ? "bg-gray-100 text-gray-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {selectedMessage.read ? "مقروءة" : "جديدة"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    📞 {selectedMessage.phone}
                  </p>
                  {selectedMessage.email && (
                    <p className="text-sm text-muted-foreground">
                      ✉️ {selectedMessage.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedMessage.createdAt).toLocaleString("ar-SA")}
                  </p>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="font-bold text-foreground mb-3">الرسالة:</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.messageAr}
                  </p>
                </div>

                <div className="flex gap-3">
                  {!selectedMessage.read && (
                    <Button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      disabled={markAsReadMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {markAsReadMutation.isPending ? "جاري..." : "تحديد كمقروءة"}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(selectedMessage.id)}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteMutation.isPending ? "جاري..." : "حذف"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">اختر رسالة لعرض التفاصيل</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
