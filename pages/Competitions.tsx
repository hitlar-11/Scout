import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Lock, BookOpen, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function Competitions() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCompetitionForResults, setSelectedCompetitionForResults] = useState<string | null>(null);

  const { data: competitions = [] } = trpc.competition.getAll.useQuery();
  const { data: competitionResults = [], isLoading: isLoadingResults } = trpc.competitionResults.list.useQuery(
    selectedCompetitionForResults || ''
  );

  const handleEnter = (competitionId: string) => {
    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    navigate(`/competitions/${competitionId}/enter`);
  };

  const handleViewResults = (competitionId: string) => {
    setSelectedCompetitionForResults(competitionId);
  };

  const activeCompetitions = competitions.filter(c => c.status === "active");
  const finishedCompetitions = competitions.filter(c => c.status === "finished");

  // Get selected competition details
  const selectedCompetition = competitions.find(c => c.id === selectedCompetitionForResults);

  // Sort results by score (highest first)
  const sortedResults = [...competitionResults].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              المسابقات
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">اختبر معلوماتك وشارك في المسابقات المتاحة</p>
        </div>

        {/* Active Competitions */}
        {activeCompetitions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-foreground">المسابقات النشطة</h2>
              <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                {activeCompetitions.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCompetitions.map((comp) => (
                <Card key={comp.id} className="p-6 border-0 shadow-sm bg-white hover:shadow-lg transition-all overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">نشطة</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{comp.titleAr}</h3>
                    {comp.descriptionAr && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{comp.descriptionAr}</p>
                    )}

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{comp.numberOfQuestions} أسئلة</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>محمية بكلمة مرور</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleEnter(comp.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold gap-2"
                    >
                      دخول المسابقة
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Finished Competitions */}
        {finishedCompetitions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-foreground">المسابقات المنتهية</h2>
              <span className="ml-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                {finishedCompetitions.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedCompetitions.map((comp) => (
                <Card key={comp.id} className="p-6 border-0 shadow-sm bg-gray-50 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Trophy className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">منتهية</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-600 mb-2">{comp.titleAr}</h3>
                  {comp.descriptionAr && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{comp.descriptionAr}</p>
                  )}

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" />
                      <span>{comp.numberOfQuestions} أسئلة</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewResults(comp.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold gap-2"
                  >
                    عرض النتائج
                    <Trophy className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {competitions.length === 0 && (
          <Card className="p-12 text-center border-0 shadow-sm bg-white">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد مسابقات متاحة</h3>
            <p className="text-muted-foreground">سيتم إضافة مسابقات جديدة قريباً</p>
          </Card>
        )}

        {/* Info Box */}
        {activeCompetitions.length > 0 && (
          <Card className="mt-12 p-6 border-l-4 border-l-blue-600 bg-blue-50">
            <h3 className="font-bold text-foreground mb-2">💡 نصيحة</h3>
            <p className="text-muted-foreground">
              تأكد من حصولك على كلمة المرور من الفائد قبل دخول المسابقة. الأسئلة ستكون عشوائية لكل مشارك.
            </p>
          </Card>
        )}

        {/* Results Modal */}
        {selectedCompetitionForResults && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCompetitionForResults(null)}
          >
            <Card
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        نتائج المسابقة
                      </h2>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{selectedCompetition?.titleAr}</h3>
                    {selectedCompetition?.descriptionAr && (
                      <p className="text-sm text-muted-foreground">{selectedCompetition.descriptionAr}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCompetitionForResults(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Results Content */}
                {isLoadingResults ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="text-muted-foreground mt-4">جاري تحميل النتائج...</p>
                  </div>
                ) : sortedResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">لا توجد نتائج لهذه المسابقة بعد</p>
                    <p className="text-sm text-muted-foreground mt-2">سيتم عرض النتائج بعد مشاركة المتسابقين</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Top 3 Podium */}
                    {sortedResults.slice(0, 3).length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-foreground mb-4 text-center">🏆 المتصدرون</h4>
                        <div className="space-y-3">
                          {sortedResults.slice(0, 3).map((result, index) => (
                            <Card
                              key={result.id}
                              className={`p-5 border-2 ${index === 0
                                ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400"
                                : index === 1
                                  ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                                  : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400"
                                }`}
                            >
                              <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className="flex-shrink-0">
                                  <div className="text-4xl">{getRankBadge(index + 1)}</div>
                                </div>
                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xl font-bold text-foreground truncate">{result.userName}</h4>
                                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                    <span>النتيجة: {result.score}/{result.totalQuestions}</span>
                                    <span>•</span>
                                    <span className="font-semibold">{result.percentage}%</span>
                                  </div>
                                </div>
                                {/* Score Badge */}
                                <div className="text-center">
                                  <div
                                    className={`text-3xl font-bold ${index === 0
                                      ? "text-yellow-600"
                                      : index === 1
                                        ? "text-gray-600"
                                        : "text-amber-600"
                                      }`}
                                  >
                                    {result.percentage}%
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rest of Participants */}
                    {sortedResults.length > 3 && (
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-4">المشاركون الآخرون</h4>
                        <div className="space-y-2">
                          {sortedResults.slice(3).map((result, index) => (
                            <Card key={result.id} className="p-4 hover:shadow-md transition">
                              <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-bold text-blue-700">#{index + 4}</span>
                                </div>
                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-foreground truncate">{result.userName}</h5>
                                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                    <span>{result.score}/{result.totalQuestions}</span>
                                    <span>•</span>
                                    <span>{result.percentage}%</span>
                                  </div>
                                </div>
                                {/* Score */}
                                <div className="text-left">
                                  <div className="text-xl font-bold text-blue-600">{result.percentage}%</div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
