import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة.
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="w-4 h-4" />
          العودة إلى الصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}


