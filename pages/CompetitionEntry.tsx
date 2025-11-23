import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft, Trophy, BookOpen } from "lucide-react";

export default function CompetitionEntry() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/competitions/:id/enter");
  const competitionId = params?.id || null;

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: competition } = trpc.competition.getById.useQuery(
    { id: competitionId! },
    { enabled: !!competitionId }
  );

  const { data: hasEntered, isLoading: checkingEntry } = trpc.competition.hasUserEntered.useQuery(
    competitionId!,
    user?.id!
  );

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !competitionId) {
      navigate("/");
    }
  }, [isAuthenticated, competitionId, navigate, loading]);

  if (loading || checkingEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAuthenticated || !competitionId) {
    return null;
  }

  // Block entry if mode is 'once' and user has already entered
  if (competition?.entryMode === 'once' && hasEntered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 gap-2 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </Button>
        <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            عذراً، لا يمكنك المشاركة
          </h1>
          <p className="text-muted-foreground mb-6">
            لقد شاركت في هذه المسابقة مسبقاً. يسمح بالمشاركة مرة واحدة فقط.
          </p>
          <Button
            onClick={() => navigate("/competitions")}
            className="w-full bg-gray-900 text-white hover:bg-gray-800"
          >
            العودة للمسابقات
          </Button>
        </Card>
      </div>
    );
  }

  const handleEnter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    if (password !== competition?.password) {
      toast.error("كلمة المرور غير صحيحة");
      return;
    }

    setIsSubmitting(true);
    try {
      navigate(`/competitions/${competitionId}/quiz`);
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!competition) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 gap-2 hover:bg-white"
      >
        <ArrowLeft className="w-4 h-4" />
        رجوع
      </Button>

      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {competition.titleAr}
          </h1>
          {competition.descriptionAr && (
            <p className="text-muted-foreground text-sm">{competition.descriptionAr}</p>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">عدد الأسئلة</p>
            <p className="text-2xl font-bold text-blue-700">{competition.numberOfQuestions} أسئلة</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-semibold mb-1">نوع المسابقة</p>
            <p className="text-lg font-bold text-purple-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {competition.entryMode === 'unlimited' ? 'دخول غير محدود' : 'مرة واحدة فقط'}
            </p>
          </div>
        </div>

        {/* Password Input */}
        <form onSubmit={handleEnter} className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              كلمة المرور *
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور للدخول للمسابقة"
                className="pr-10 text-right border-gray-200 focus:border-green-500 focus:ring-green-500 h-11"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? "جاري الدخول..." : "دخول المسابقة"}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            تأكد من إدخال كلمة المرور الصحيحة للدخول للمسابقة. الأسئلة ستكون عشوائية لكل مشارك.
          </p>
        </div>
      </Card>
    </div>
  );
}
