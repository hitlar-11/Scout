import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Users, TrendingUp, Eye, CheckCircle, XCircle, X } from "lucide-react";
import { useState } from "react";

export default function AdminCompetitionResults() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/competitions/:id/results");
  const competitionId = params?.id || null;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: competition } = trpc.competition.getById.useQuery({ id: competitionId || "" });
  const { data: results = [] } = trpc.competitionResults.list.useQuery(
    competitionId || ""
  );
  const { data: allQuestions = [] } = trpc.competitionQuestions.list.useQuery(
    competitionId || ''
  );
  const { data: userAnswers = [], isLoading: isLoadingAnswers } = trpc.competition.getAnswers.useQuery(
    selectedUserId || '',
    competitionId || ''
  );

  // Get selected user's result
  const selectedUserResult = results.find(r => r.userId === selectedUserId);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin" || !competitionId) {
    navigate("/");
    return null;
  }

  const sortedResults = [...results].sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  const avgPercentage = results.length > 0
    ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(1)
    : "0";
  const maxPercentage = results.length > 0
    ? Math.max(...results.map((r) => parseFloat(r.percentage))).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/competitions")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">نتائج المسابقة</h1>
                {competition && <p className="text-muted-foreground">{competition.titleAr}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المشاركين</p>
                <p className="text-3xl font-bold text-foreground">{results.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">متوسط النسبة</p>
                <p className="text-3xl font-bold text-foreground">{avgPercentage}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">أعلى نسبة</p>
                <p className="text-3xl font-bold text-foreground">{maxPercentage}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-foreground">تفاصيل النتائج</h2>
          </div>
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد نتائج حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="text-right p-4 font-semibold text-foreground">الترتيب</th>
                    <th className="text-right p-4 font-semibold text-foreground">اسم المستخدم</th>
                    <th className="text-right p-4 font-semibold text-foreground">البريد الإلكتروني</th>
                    <th className="text-right p-4 font-semibold text-foreground">الإجابات الصحيحة</th>
                    <th className="text-right p-4 font-semibold text-foreground">النسبة المئوية</th>
                    <th className="text-right p-4 font-semibold text-foreground">التاريخ</th>
                    <th className="text-right p-4 font-semibold text-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result, index) => {
                    const percentage = parseFloat(result.percentage);
                    const isTopThree = index < 3;
                    return (
                      <tr
                        key={result.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isTopThree ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                          }`}
                      >
                        <td className="p-4 text-foreground font-semibold">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4 text-foreground font-medium">{result.userName}</td>
                        <td className="p-4 text-muted-foreground text-sm">{result.userEmail}</td>
                        <td className="p-4 text-foreground font-semibold">
                          {result.score}/{result.totalQuestions}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold inline-block ${percentage >= 80
                              ? "bg-green-100 text-green-700"
                              : percentage >= 60
                                ? "bg-blue-100 text-blue-700"
                                : percentage >= 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            {result.percentage}%
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {new Date(result.completedAt).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            onClick={() => setSelectedUserId(result.userId)}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            عرض التفاصيل
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Performance Chart */}
        {results.length > 0 && (
          <Card className="mt-8 p-6 border-0 shadow-sm bg-white">
            <h2 className="text-xl font-bold text-foreground mb-6">توزيع الأداء</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { range: "90-100%", color: "from-green-500 to-emerald-600", count: results.filter(r => parseFloat(r.percentage) >= 90).length },
                { range: "70-89%", color: "from-blue-500 to-cyan-600", count: results.filter(r => parseFloat(r.percentage) >= 70 && parseFloat(r.percentage) < 90).length },
                { range: "50-69%", color: "from-yellow-500 to-orange-600", count: results.filter(r => parseFloat(r.percentage) >= 50 && parseFloat(r.percentage) < 70).length },
                { range: "أقل من 50%", color: "from-red-500 to-pink-600", count: results.filter(r => parseFloat(r.percentage) < 50).length },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className={`bg-gradient-to-br ${item.color} rounded-lg p-4 text-white mb-2`}>
                    <p className="text-2xl font-bold">{item.count}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.range}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Answers Modal */}
        {selectedUserId && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUserId(null)}
          >
            <Card
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      تفاصيل الإجابات - {selectedUserResult?.userName}
                    </h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>النتيجة: {selectedUserResult?.score}/{selectedUserResult?.totalQuestions}</span>
                      <span>•</span>
                      <span>النسبة: {selectedUserResult?.percentage}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Answers Content */}
                {isLoadingAnswers ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="text-muted-foreground mt-4">جاري تحميل التفاصيل...</p>
                  </div>
                ) : userAnswers.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">لا توجد إجابات مسجلة لهذا المستخدم</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Filter to get only unique answers per question (most recent ones)
                      // Group by questionId and keep only the latest answer for each question
                      const uniqueAnswers = userAnswers.reduce((acc: any[], answer: any) => {
                        const existingIndex = acc.findIndex((a: any) => a.questionId === answer.questionId);
                        if (existingIndex === -1) {
                          // No answer for this question yet, add it
                          acc.push(answer);
                        } else {
                          // Compare timestamps if available, otherwise keep the first one
                          const existingAnswer = acc[existingIndex];
                          const answerTime = answer.createdAt ? new Date(answer.createdAt).getTime() : 0;
                          const existingTime = existingAnswer.createdAt ? new Date(existingAnswer.createdAt).getTime() : 0;

                          // Keep the most recent answer
                          if (answerTime > existingTime) {
                            acc[existingIndex] = answer;
                          }
                        }
                        return acc;
                      }, []);

                      return uniqueAnswers.map((answer: any, index: number) => {
                        // Find the question details
                        const question = allQuestions.find((q: any) => q.id === answer.questionId);
                        if (!question) return null;

                        const isCorrect = answer.isCorrect;

                        return (
                          <Card
                            key={answer.id}
                            className={`p-5 border-2 ${isCorrect
                              ? "border-green-200 bg-green-50/50"
                              : "border-red-200 bg-red-50/50"
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Question Number & Status */}
                              <div className="flex-shrink-0">
                                {isCorrect ? (
                                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Question Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="text-base font-bold text-foreground">
                                    السؤال {index + 1}
                                  </h4>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${isCorrect
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {isCorrect ? "إجابة صحيحة ✓" : "إجابة خاطئة ✗"}
                                  </span>
                                </div>

                                <p className="text-foreground font-medium mb-4">
                                  {question.questionAr}
                                </p>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                  {["A", "B", "C", "D"].map((option) => {
                                    const isUserAnswer = answer.selectedAnswer === option;
                                    const isCorrectAnswer = question.correctAnswer === option;
                                    const optionText = String(question[`option${option}` as keyof typeof question] || '');

                                    return (
                                      <div
                                        key={option}
                                        className={`p-3 rounded-lg border-2 text-sm ${isCorrectAnswer
                                          ? "border-green-500 bg-green-100"
                                          : isUserAnswer && !isCorrect
                                            ? "border-red-500 bg-red-100"
                                            : "border-gray-200 bg-gray-50"
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold">{option})</span>
                                          <span className="flex-1">{optionText}</span>
                                          {isCorrectAnswer && (
                                            <span className="text-green-600 font-bold">✓ الصحيحة</span>
                                          )}
                                          {isUserAnswer && !isCorrect && (
                                            <span className="text-red-600 font-bold">✗ اختيارك</span>
                                          )}
                                          {isUserAnswer && isCorrect && (
                                            <span className="text-green-600 font-bold">✓ اختيارك</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      });
                    })()}
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
