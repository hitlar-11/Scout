import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    nameAr: "",
    phone: "",
    email: "",
    messageAr: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ nameAr: "", phone: "", email: "", messageAr: "" });
      toast.success("تم إرسال رسالتك بنجاح!");
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (_error: any) => {
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.phone || !formData.messageAr) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
            تواصل معنا
          </h1>
          <p className="text-lg text-muted-foreground">
            لا تتردد في التواصل معنا بأي استفسار أو اقتراح
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">الهاتف</h3>
            <p className="text-muted-foreground">+961 XX XXX XXX</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">البريد الإلكتروني</h3>
            <p className="text-muted-foreground">info@kashaf.org</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">الموقع</h3>
            <p className="text-muted-foreground">بيروت، لبنان</p>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                شكراً لك!
              </h2>
              <p className="text-muted-foreground">
                تم استقبال رسالتك بنجاح. سنرد عليك قريباً.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-foreground"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-foreground"
                    placeholder="+961 XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-foreground"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الرسالة *
                </label>
                <textarea
                  name="messageAr"
                  value={formData.messageAr}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-foreground resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
              >
                {submitMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
              </Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
