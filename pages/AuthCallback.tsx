import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The Supabase client will automatically handle the OAuth callback
    // and update the session. We just need to wait and redirect.
    const handleCallback = async () => {
      try {
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to admin dashboard
        navigate("/admin");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication error");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="p-8 text-center">
        {error ? (
          <>
            <h2 className="text-lg font-semibold text-destructive mb-2">
              خطأ في المصادقة
            </h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحويل البيانات...</p>
          </>
        )}
      </Card>
    </div>
  );
}
