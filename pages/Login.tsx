import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useEffect, useState } from "react";

export default function Login() {
  const { isAuthenticated, signInWithGoogle, loading } = useAuth();
  const [, navigate] = useLocation();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if authenticated AND NOT showing login page for first time
    if (isAuthenticated && !loading && !signingIn) {
      navigate("/admin");
    }
  }, [isAuthenticated, loading, signingIn, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setSigningIn(true);
      await signInWithGoogle();
      // clear signing state so the effect can redirect when auth state updates
      setSigningIn(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google"
      );
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-20 w-20 rounded-xl object-cover shadow-md ring-2 ring-green-200"
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-green-700 mb-2">
            {APP_TITLE}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            أهلاً بك
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Sign In Button */}
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground mb-6">
            يرجى تسجيل الدخول للمتابعة
          </p>

          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            size="lg"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {signingIn ? "جاري المحاولة..." : "تسجيل الدخول عبر Google"}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>
            تسجيل الدخول للأعضاء وللقادة
          </p>
        </div>
      </Card>
    </div>
  );
}
