"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UserNav from "@/components/ui/user-nav";

const links = [
  { href: "/", label: "خانه" },
  { href: "/features", label: "ویژگی‌ها" },
  { href: "/contact", label: "ارتباطات" },
];

const authLinks = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/tasks", label: "تسک ها" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    
    if (userName && userEmail) {
      setUser({
        name: userName,
        email: userEmail
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <header className="fixed top-0 w-full backdrop-blur-md bg-background/70 border-b border-border z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        
        {/* Left side - Logo */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/60 transition-all duration-200"
        >
          زنترو
        </Link>

        {/* Center - Links (desktop) */}
        <ul className="hidden md:flex items-center gap-8">
          {/* Public links */}
          {links.map(({ href, label }) => (
            <li key={href} className="relative">
              <Link
                href={href}
                className={cn(
                  "relative py-2 transition-colors duration-200 text-sm font-medium",
                  pathname === href
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                )}
              >
                {label}
                {pathname === href && (
                  <span className="absolute bottom-0 right-0 h-1 w-full bg-gradient-to-l from-primary to-transparent rounded-full" />
                )}
              </Link>
            </li>
          ))}

          {/* Auth-only links */}
          {user && (
            <>
              <li className="w-px h-6 bg-border mx-2" />
              {authLinks.map(({ href, label }) => (
                <li key={href} className="relative">
                  <Link
                    href={href}
                    className={cn(
                      "relative py-2 transition-colors duration-200 text-sm font-medium",
                      pathname === href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                  >
                    {label}
                    {pathname === href && (
                      <span className="absolute bottom-0 right-0 h-1 w-full bg-gradient-to-l from-primary to-transparent rounded-full" />
                    )}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>

        {/* Right side - Auth or User Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <UserNav user={user} onLogout={handleLogout} />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-primary/10 font-medium"
                >
                  ورود
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 font-medium"
                >
                  ثبت نام
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:text-primary"
          onClick={() => setOpen(!open)}
        >
          <div className="relative w-6 h-6">
            <Menu 
              className={cn(
                "absolute inset-0 transition-all duration-300",
                open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )} 
              size={24} 
            />
            <X 
              className={cn(
                "absolute inset-0 transition-all duration-300",
                open ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
              )} 
              size={24} 
            />
          </div>
        </Button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out bg-background/90 backdrop-blur-lg border-t border-border",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col gap-2 py-4 px-4">
          {/* Public links */}
          {links.map(({ href, label }, index) => (
            <li 
              key={href}
              className={cn(
                "transform transition-all duration-300 ease-out",
                open 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-4 opacity-0"
              )}
              style={{ 
                transitionDelay: open ? `${index * 50}ms` : '0ms' 
              }}
            >
              <Link
                href={href}
                className={cn(
                  "block py-2 px-3 rounded-lg transition-all duration-200 font-medium text-sm",
                  pathname === href
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Auth-only links */}
          {user && (
            <>
              <li className="my-2 h-px bg-border" />
              {authLinks.map(({ href, label }, index) => (
                <li 
                  key={href}
                  className={cn(
                    "transform transition-all duration-300 ease-out",
                    open 
                      ? "translate-y-0 opacity-100" 
                      : "translate-y-4 opacity-0"
                  )}
                  style={{ 
                    transitionDelay: open ? `${(links.length + 1 + index) * 50}ms` : '0ms' 
                  }}
                >
                  <Link
                    href={href}
                    className={cn(
                      "block py-2 px-3 rounded-lg transition-all duration-200 font-medium text-sm",
                      pathname === href
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </>
          )}

          {/* Mobile auth buttons (when not logged in) */}
          {!user && (
            <li className="flex gap-2 mt-4 pt-2 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className={cn(
                  "flex-1 transform transition-all duration-300 ease-out",
                  open 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-4 opacity-0"
                )}
                style={{ 
                  transitionDelay: open ? `${links.length * 50}ms` : '0ms' 
                }}
              >
                <Link 
                  href="/auth/login" 
                  onClick={() => setOpen(false)}
                >
                  ورود
                </Link>
              </Button>
              <Button 
                size="sm" 
                asChild
                className={cn(
                  "flex-1 bg-primary hover:bg-primary/90 transform transition-all duration-300 ease-out",
                  open 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-4 opacity-0"
                )}
                style={{ 
                  transitionDelay: open ? `${(links.length + 1) * 50}ms` : '0ms' 
                }}
              >
                <Link 
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                >
                  ثبت‌نام
                </Link>
              </Button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}