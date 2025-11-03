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
  { href: "/dashboard", label: "داشبورد" },
  { href: "/tasks", label: "تسک ها" },
  { href: "/contact", label: "ارتباطات" },
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
    <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
      {/* Right side (logo + links) */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:text-primary/80 transition-colors duration-200"
        >
          زنترو
        </Link>

        {/* Links (desktop) */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <li key={href} className="relative">
              <Link
                href={href}
                className={cn(
                  "relative py-2 transition-colors duration-200",
                  pathname === href
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                )}
              >
                {label}
                {/* Active indicator line */}
                {pathname === href && (
                  <span className="absolute bottom-0 right-0 h-0.5 w-full bg-gradient-to-l from-primary to-accent animate-in slide-in-from-left-full duration-300" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

        {/* Left side (auth buttons or user menu) */}
        <div className="flex items-center gap-4">
          {user ? (
            <UserNav user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="hover:text-primary hover:bg-primary/10"
                >
                  ورود
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 font-medium"
                >
                  ثبت نام
                </Button>
              </Link>
            </>
          )}
        </div>      {/* Mobile menu button */}
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
              open ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
            )} 
            size={24} 
          />
          <X 
            className={cn(
              "absolute inset-0 transition-all duration-300",
              open ? "rotate-0 opacity-100" : "-rotate-180 opacity-0"
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
      <ul className="flex flex-col items-center gap-4 py-4">
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
                "relative block py-2 px-4 rounded-lg transition-all duration-200",
                pathname === href
                  ? "text-primary font-semibold bg-accent"
                  : "text-foreground hover:text-primary hover:bg-accent"
              )}
              onClick={() => setOpen(false)}
            >
              {label}
              {/* Active indicator for mobile */}
              {pathname === href && (
                <span className="absolute bottom-1 right-2 left-2 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
              )}
            </Link>
          </li>
        ))}
        
        {/* Mobile auth buttons */}
        <li className="flex gap-3 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className={cn(
              "transform transition-all duration-300 ease-out",
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
              className="text-primary hover:text-primary/80"
              onClick={() => setOpen(false)}
            >
              ورود
            </Link>
          </Button>
          <Button 
            size="sm" 
            asChild
            className={cn(
              "bg-primary hover:bg-primary/90 transform transition-all duration-300 ease-out",
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
      </ul>
    </div>
  </header>
  );
}