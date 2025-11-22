import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, ChevronLeft, UserPlus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Events() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: events = [], isLoading } = trpc.events.list.useQuery();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Register mutation
  const registerMutation = trpc.eventRegistrations.register.useMutation({
    onSuccess: () => {
      // Refetch registration status
      window.location.reload(); // Simple reload to update status
    },
  });

  // Component to check registration status for each event
  const EnrollButton = ({ event }: { event: any }) => {
    const { data: isRegistered = false } = trpc.eventRegistrations.isRegistered.useQuery(
      event.id || '',
      user?.id || ''
    );

    if (!isAuthenticated) {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/login');
          }}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="w-4 h-4 ml-2" />
          سجل دخولك للتسجيل
        </Button>
      );
    }

    if (isRegistered) {
      return (
        <Button
          disabled
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-green-100 text-green-800 cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4 ml-2" />
          مسجل
        </Button>
      );
    }

    return (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          if (user) {
            registerMutation.mutate({
              eventId: event.id,
              userId: user.id,
              userName: user.name || user.email || 'مستخدم',
              userEmail: user.email || null,
            });
          }
        }}
        disabled={registerMutation.isPending}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <UserPlus className="w-4 h-4 ml-2" />
        {registerMutation.isPending ? 'جاري...' : 'سجل'}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
            الورش والفعاليات
          </h1>
          <p className="text-lg text-muted-foreground">
            اكتشف جميع الورش والفعاليات القادمة
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              لا توجد ورش مضافة حالياً
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 min-h-32 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-green-600 opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-green-700 transition">
                    {event.titleAr}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString("ar-SA", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  {event.descriptionAr && (
                    <p className="text-sm text-foreground line-clamp-2">
                      {event.descriptionAr}
                    </p>
                  )}

                  {/* Enrollment Button */}
                  <div className="mt-4">
                    <EnrollButton event={event} />
                  </div>
                </div>

              </Card>

            ))}

          </div>
        )}
      </main>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-3xl font-bold text-foreground">
                  {selectedEvent.titleAr}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-muted rounded-lg transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ والوقت</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedEvent.date).toLocaleDateString("ar-SA", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">المكان</p>
                      <p className="font-medium text-foreground">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.descriptionAr && (
                <div>
                  <h3 className="font-bold text-foreground mb-3">التفاصيل</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.descriptionAr}
                  </p>
                </div>
              )}

            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
