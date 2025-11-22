import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, BookOpen } from "lucide-react";

export default function AdminCompetitionQuestions() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/competitions/:id/questions");
  const competitionId = params?.id || null;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    questionAr: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A" as "A" | "B" | "C" | "D",
  });

  const { data: competition } = trpc.competition.getById.useQuery({ id: competitionId || "" });
  const { data: questions = [], refetch } = trpc.competitionQuestions.list.useQuery(
    competitionId || ""
  );

  const addQuestionMutation = trpc.competitionQuestions.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة السؤال بنجاح");
      setShowAddDialog(false);
      setFormData({
        questionAr: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      refetch();
    },
    onError: () => {
      toast.error("خطأ في إضافة السؤال");
    },
  });

  const deleteQuestionMutation = trpc.competitionQuestions.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح");
      refetch();
    },
    onError: () => {
      toast.error("خطأ في حذف السؤال");
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin" || !competitionId) {
    navigate("/");
    return null;
  }

  const handleAddQuestion = () => {
    if (
      !formData.questionAr ||
      !formData.optionA ||
      !formData.optionB ||
      !formData.optionC ||
      !formData.optionD
    ) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    addQuestionMutation.mutate({
      competitionId: competitionId!,
      ...formData,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">أسئلة المسابقة</h1>
                {competition && <p className="text-muted-foreground">{competition.titleAr}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between mb-8">
          <Card className="p-4 border-0 shadow-sm bg-white">
            <p className="text-sm text-muted-foreground mb-1">إجمالي الأسئلة</p>
            <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
          </Card>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            إضافة سؤال جديد
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-sm bg-white">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد أسئلة في هذه المسابقة</p>
              <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة سؤال جديد</p>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id} className="p-6 border-0 shadow-sm bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">{question.questionAr}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { letter: "أ", value: question.optionA },
                        { letter: "ب", value: question.optionB },
                        { letter: "ج", value: question.optionC },
                        { letter: "د", value: question.optionD },
                      ].map((option, idx) => {
                        const optionKey = ["A", "B", "C", "D"][idx] as "A" | "B" | "C" | "D";
                        const isCorrect = question.correctAnswer === optionKey;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 transition-all ${isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${isCorrect ? "text-green-700" : "text-gray-600"}`}>
                                {option.letter})
                              </span>
                              <span className={isCorrect ? "text-green-700 font-medium" : "text-foreground"}>
                                {option.value}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                  ✓ الإجابة الصحيحة
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="gap-2 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">إضافة سؤال جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">نص السؤال *</label>
              <Input
                value={formData.questionAr}
                onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                placeholder="أدخل نص السؤال"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "optionA", label: "الخيار أ)" },
                { key: "optionB", label: "الخيار ب)" },
                { key: "optionC", label: "الخيار ج)" },
                { key: "optionD", label: "الخيار د)" },
              ].map((option) => (
                <div key={option.key}>
                  <label className="text-sm font-semibold text-foreground mb-2 block">{option.label} *</label>
                  <Input
                    value={formData[option.key as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [option.key]: e.target.value })
                    }
                    placeholder={`أدخل ${option.label}`}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">الإجابة الصحيحة *</label>
              <div className="grid grid-cols-4 gap-2">
                {["A", "B", "C", "D"].map((option) => (
                  <Button
                    key={option}
                    variant={formData.correctAnswer === option ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, correctAnswer: option as "A" | "B" | "C" | "D" })}
                    className={`font-bold ${formData.correctAnswer === option
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : ""
                      }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={addQuestionMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {addQuestionMutation.isPending ? "جاري الإضافة..." : "إضافة السؤال"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
