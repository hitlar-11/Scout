import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ChevronRight, Calendar, Image, BookOpen, Mail } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-green-700 mb-4">
            كشافة المهدي-فوج العماد
          </h1>
          <p className="text-2xl md:text-3xl text-purple-600 font-semibold mb-6 italic">
            "حبل الإيمان والتضحية"
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            من البراعم الصغار إلى الجوالة الشباب، يجمع فوج العماد مراحل الكشفية كلها تحت رسالة واحدة: تربية جيل قيادي، مؤمن، وفاعل في مجتمعه          </p>
          <Button
            onClick={() => navigate(isAuthenticated ? "/competitions" : "/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg gap-2"
          >
            {isAuthenticated ? "الذهاب للمسابقات" : "انضم إلينا"}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-700 mb-12">
            اكتشف عالمنا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Events Card */}
            <Card
              onClick={() => navigate("/events")}
              className="p-6 text-center hover:shadow-lg transition cursor-pointer group"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">الورش</h3>
              <p className="text-sm text-muted-foreground mb-4">
                اكتشف جميع الورش والفعاليات القادمة
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                عرض الورش
              </Button>
            </Card>

            {/* Gallery Card */}
            <Card
              onClick={() => navigate("/gallery")}
              className="p-6 text-center hover:shadow-lg transition cursor-pointer group"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                <Image className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">المعرض</h3>
              <p className="text-sm text-muted-foreground mb-4">
استعرض لحظاتنا الجميلة من الورش والفعاليات </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                عرض الصور
              </Button>
            </Card>

            {/* Stories Card */}
            <Card
              onClick={() => navigate("/stories")}
              className="p-6 text-center hover:shadow-lg transition cursor-pointer group"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">القصص</h3>
              <p className="text-sm text-muted-foreground mb-4">
                اقرأ قصص الأعضاء والتجارب الملهمة
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                عرض القصص
              </Button>
            </Card>

            {/* Contact Card */}
            <Card
              onClick={() => navigate("/contact")}
              className="p-6 text-center hover:shadow-lg transition cursor-pointer group"
            >
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">تواصل معنا</h3>
              <p className="text-sm text-muted-foreground mb-4">
                لا تتردد في التواصل بأي استفسار
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                إرسال رسالة
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      {/* About Section */}
      <section className="py-16 md:py-24 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-green-700 mb-6"> سيّد شهداء الأمّة</h2>
              <h2 className="text-4xl font-bold text-green-700 mb-6">سماحة السيّد حسن نصر الله</h2>
              <p className="text-lg text-foreground mb-4 leading-relaxed">
                الرؤية المستقبلية وأدبيات كشافة المهدي تتحدّث عن بناء جيل ممهد، ويمكن أن نُوسّع هذا المفهوم ليصبح مجتمعًا ممهدًا وناصرًا. فلا بدّ من تطوير الفكرة نحو مشروعٍ تربويّ شامل يُنتج مجتمعًا ممهدًا وناصرًا              </p>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                من خلال ورشنا وفعالياتنا، نسعى لغرس القيم الأساسية مثل الولاء والشرف والمسؤولية والعدالة في نفوس أعضائنا.
              </p>

            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg h-64 md:h-96 flex items-center justify-center">
              <div className="text-6xl">🏕️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">كشافة المهدي</h3>
              <p className="text-gray-400">
                جمعية كشافة المهدي (عجل الله فرجه) جمعية كشفية لبنانية بدأت عملها عام 1985م، ونالت رخصتها من وزارة التربية الوطنية والفنون الجميلة - المديرية العامة للشباب والرياضة بقرار رقم 563 سنة 1992 م              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">الروابط السريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate("/")} className="hover:text-white transition">
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/events")} className="hover:text-white transition">
                    الورش
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/gallery")} className="hover:text-white transition">
                    المعرض
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/stories")} className="hover:text-white transition">
                    القصص
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/competitions")} className="hover:text-white transition">
                    مسابقات
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/contact")} className="hover:text-white transition">
                    تواصل معنا
                  </button>
                </li>

              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">معلومات التواصل</h3>
              <p className="text-gray-400 mb-2">✉️ qasemsoleimani195@gmail.com</p>
              <p className="text-gray-400 mb-3">📍 بيروت، لبنان</p>
              <a
                href="https://www.instagram.com/foj.elimad/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                تابعنا على انستا
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 كشافة المهدي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer >
    </div >
  );
}
