import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogIn, BookOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/auth';
import type { Category } from '@/types';
import { fetchCategories } from '@/lib/api';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-[100] transition-all duration-300"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center transition-transform group-hover:scale-110">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg text-primary hidden sm:block">The Modern Stories</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 relative">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link header-tab ${isActive(item.path) ? 'active' : ''}`} 
            >
              {item.label}
              {isActive(item.path) && (
                <span className="header-tab-bump" aria-hidden="true" />
              )}
            </Link>
          ))}

          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className={`nav-link header-tab flex items-center gap-1 ${location.pathname.startsWith('/category') ? 'active' : ''}`}
            >
              Categories
              <ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full right-0 mt-2 glass-card p-2 min-w-[200px] animate-scale-in">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm text-secondary hover:text-primary hover:bg-brand-accent/10 transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
                {categories.length === 0 && (
                  <p className="px-4 py-2.5 text-sm text-muted">No categories yet</p>
                )}
              </div>
            )}
          </div>

          {/* Auth */}
          {user ? (
            <Link
              to="/profile"
              className={`nav-link flex items-center gap-1.5 ${isActive('/profile') ? 'active' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-xs font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block">Profile</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className={`nav-link flex items-center gap-1.5 ${isActive('/auth') ? 'active' : ''}`}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Login</span>
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
