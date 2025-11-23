import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Trophy } from "lucide-react";

export default function CompetitionQuiz() {
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/competitions/:id/quiz");
  const competitionId = params?.id || null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: "A" | "B" | "C" | "D" }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const { data: competition } = trpc.competition.getById.useQuery(
    { id: competitionId! },
    { enabled: !!competitionId }
  );
  const { data: questions = [], isLoading: isLoadingQuestions } = trpc.competition.getRandomQuestions.useQuery(
    { competitionId: competitionId!, count: competition?.numberOfQuestions || 10 },
    { enabled: !!competitionId && !!competition }
  );

  const { data: hasEntered, isLoading: checkingEntry } = trpc.competition.hasUserEntered.useQuery(
    competitionId!,
    authUser?.id!
  );

  const saveAnswerMutation = trpc.competition.saveAnswer.useMutation();
  const saveResultMutation = trpc.competition.saveResult.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ النتائج بنجاح");
      setTimeout(() => navigate("/"), 2000);
    },
    onError: () => {
      toast.error("خطأ في حفظ النتائج");
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !competitionId) {
      navigate("/");
    }
  }, [isAuthenticated, competitionId, navigate, loading]);

  // Redirect if user has already entered and mode is 'once'
  useEffect(() => {
    if (competition?.entryMode === 'once' && hasEntered) {
      toast.error("لقد شاركت في هذه المسابقة مسبقاً");
      navigate("/competitions");
    }
  }, [competition, hasEntered, navigate]);

  if (loading || isLoadingQuestions || checkingEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAuthenticated || !competitionId) {
    return null;
  }

  if (!competition) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-muted-foreground">المسابقة غير موجودة</p>
        <Button onClick={() => navigate("/")} variant="link">العودة للرئيسية</Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">لا توجد أسئلة</h2>
          <p className="text-muted-foreground">لم يتم إضافة أسئلة لهذه المسابقة بعد.</p>
          <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectAnswer = (answer: "A" | "B" | "C" | "D") => {
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let correctCount = 0;

      // Save all answers and count correct ones
      for (let i = 0; i < questions.length; i++) {
        const selectedAnswer = answers[i];
        const isCorrect = selectedAnswer === questions[i].correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        await saveAnswerMutation.mutateAsync({
          competitionId,
          userId: authUser?.id || "",
          questionId: questions[i].id,
          selectedAnswer: selectedAnswer || "A",
          isCorrect,
        });
      }

      setScore(correctCount);
      setShowResults(true);

      // Save result
      await saveResultMutation.mutateAsync({
        competitionId,
        userId: authUser?.id || "",
        userName: authUser?.name || "Unknown",
        userEmail: authUser?.email || "",
        score: correctCount,
        totalQuestions: questions.length,
        percentage: ((correctCount / questions.length) * 100).toFixed(1),
      });
    } catch (error) {
      toast.error("حدث خطأ في حفظ الإجابات");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!competition || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (showResults) {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    const isPassed = parseFloat(percentage) >= 60;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border-0 bg-white">
          <div className="mb-6">
            {isPassed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 mb-4 shadow-lg">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">النتائج</h1>
          <p className="text-muted-foreground mb-8">{competition.titleAr}</p>

          <div className="space-y-4 mb-8">
            <div className={`p-6 rounded-lg border-2 ${isPassed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <p className={`text-sm font-semibold mb-1 ${isPassed ? "text-green-700" : "text-red-700"}`}>
                {isPassed ? "ممتاز! لقد نجحت في المسابقة" : "يمكنك المحاولة مرة أخرى"}
              </p>
              <p className={`text-4xl font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}>
                {percentage}%
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-semibold mb-1">الإجابات الصحيحة</p>
                <p className="text-2xl font-bold text-blue-600">{score}/{questions.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700 font-semibold mb-1">الإجابات الخاطئة</p>
                <p className="text-2xl font-bold text-purple-600">{questions.length - score}/{questions.length}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold"
            size="lg"
          >
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4 gap-2 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </Button>

        <Card className="p-8 shadow-2xl border-0 bg-white">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                  {competition.titleAr}
                </h1>
                <p className="text-sm text-muted-foreground">السؤال {currentQuestionIndex + 1} من {questions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">الإجابات المكتملة</p>
                <p className="text-2xl font-bold text-green-600">{answeredCount}/{questions.length}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6 leading-relaxed">
              {currentQuestion.questionAr}
            </h2>

            <div className="space-y-3">
              {[
                { key: "A", text: currentQuestion.optionA },
                { key: "B", text: currentQuestion.optionB },
                { key: "C", text: currentQuestion.optionC },
                { key: "D", text: currentQuestion.optionD },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSelectAnswer(option.key as "A" | "B" | "C" | "D")}
                  className={`w-full p-4 text-right rounded-lg border-2 transition-all font-medium ${selectedAnswer === option.key
                    ? "border-green-500 bg-green-50 text-green-900"
                    : "border-gray-200 bg-white hover:border-green-300 text-foreground"
                    }`}
                >
                  <span className="font-bold text-lg">{option.key}) </span>
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 hover:bg-gray-100"
            >
              ← السابق
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold"
              >
                {isSubmitting ? "جاري الحفظ..." : "انتهيت من الإجابة"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold"
              >
                التالي →
              </Button>
            )}
          </div>

          {/* Question Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-foreground mb-4">الملخص السريع:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${answers[index]
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md"
                    : index === currentQuestionIndex
                      ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  title={`السؤال ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
