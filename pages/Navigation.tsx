import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, LogOut, Settings, ChevronDown } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "الورش", href: "/events" },
    { label: "المعرض", href: "/gallery" },
    { label: "القصص", href: "/stories" },
    { label: "المسابقات", href: "/competitions" },
    { label: "لوحة المتصدرين", href: "/leaderboard" },
    { label: "تواصل معنا", href: "/contact" },

  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
    navigate("/");
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            {APP_LOGO && (
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-12 w-12 rounded-full object-cover shadow-lg border-2 border-green-600 hover:border-green-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
              />
            )}
            <h1 className="text-lg font-bold text-green-700 block">
              {APP_TITLE}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side - Auth & Admin */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>

                {/* Admin Dropdown */}
                {isAdmin && (
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>الإدارة</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {adminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          لوحة التحكم
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/events");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة الورش
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/gallery");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة المعرض
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/stories");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة القصص
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/competitions");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة المسابقات
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/users");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة المستخدمين
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/messages");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          إدارة الرسائل
                        </button>
                        <div className="border-t border-border my-2" />
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setAdminDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          ملفي الشخصي
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* User Profile & Logout */}
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    {user?.name || "ملفي"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <a onClick={() => navigate("/login")}
                className="hidden sm:block">
                <Button className="bg-green-600 hover:bg-green-700 font-semibold rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md">
                  دخول
                </Button>
              </a>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && (
              <div className="border-t border-gray-200 my-4 pt-4">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      لوحة التحكم
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/events");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      إدارة الورش
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/gallery");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      إدارة المعرض
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/stories");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      إدارة القصص
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/messages");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      الرسائل
                    </button>
                    <div className="border-t border-gray-200 my-4" />
                  </>
                )}
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-5 py-3 text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  ملفي الشخصي
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
