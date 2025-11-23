import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";

export default function Stories() {
  const { isAuthenticated } = useAuth();
  const { data: stories = [], isLoading } = trpc.stories.list.useQuery();
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const visibleStories = stories.filter(
    (story) => story.visibleToAll || isAuthenticated
  );

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
            القصص والتجارب
          </h1>
          <p className="text-lg text-muted-foreground">
            اقرأ قصص الأعضاء والتجارب الملهمة
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : visibleStories.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              {!isAuthenticated
                ? "يجب تسجيل الدخول لعرض القصص"
                : "لا توجد قصص مضافة حالياً"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleStories.map((story) => (
              <Card
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 min-h-32 flex items-center justify-center">
                  <div className="text-4xl">📖</div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-purple-700 transition flex-1">
                      {story.titleAr}
                    </h3>
                    {!story.visibleToAll && (
                      <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-foreground line-clamp-3">
                    {story.contentAr}
                  </p>
                  {!story.visibleToAll && !isAuthenticated && (
                    <p className="text-xs text-yellow-600 mt-3">
                      محتوى حصري للأعضاء المسجلين
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Story Details Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStory(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground">
                    {selectedStory.titleAr}
                  </h2>
                  {!selectedStory.visibleToAll && (
                    <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      محتوى حصري للأعضاء
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-muted rounded-lg transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedStory.contentAr}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  تم النشر في{" "}
                  {new Date(selectedStory.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
