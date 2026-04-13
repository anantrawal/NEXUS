import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, User, LogOut, Package, Menu, X, Search } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleCart, selectCartItemCount } from '../../store/slices/cartSlice';

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(8,8,8,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--accent)',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex', gap: '2rem', alignItems: 'center',
    listStyle: 'none',
  },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    letterSpacing: '0.02em',
  },
  navLinkActive: { color: 'var(--text-primary)' },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  iconBtn: {
    width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: '4px', right: '4px',
    background: 'var(--accent-bright)',
    color: '#000',
    fontSize: '0.6rem', fontWeight: 700,
    width: '16px', height: '16px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userMenu: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem',
    minWidth: '180px',
    boxShadow: 'var(--shadow-md)',
    animation: 'fadeIn 0.15s ease',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.6rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', width: '100%',
    fontSize: '0.875rem', color: 'var(--text-secondary)',
    transition: 'all 0.15s', background: 'none', border: 'none',
    textAlign: 'left',
  },
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartItemCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setUserMenuOpen(false); setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{ ...styles.nav, boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>NEXUS</Link>

      {/* Desktop Links */}
      <ul style={{ ...styles.navLinks, '@media(max-width:768px)': { display: 'none' } }}
          className="desktop-nav">
        {[['/', 'Home'], ['/products', 'Shop']].map(([path, label]) => (
          <li key={path}>
            <Link to={path} style={{
              ...styles.navLink,
              ...(isActive(path) && path !== '/' || location.pathname === path ? styles.navLinkActive : {}),
              color: location.pathname === path || (path !== '/' && isActive(path))
                ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>{label}</Link>
          </li>
        ))}
        {isAuthenticated && (
          <li>
            <Link to="/orders" style={{
              ...styles.navLink,
              color: isActive('/orders') ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>Orders</Link>
          </li>
        )}
      </ul>

      {/* Actions */}
      <div style={styles.actions}>
        <Link to="/products" style={{ ...styles.iconBtn, textDecoration: 'none' }}
          title="Search">
          <Search size={18} />
        </Link>

        {isAuthenticated && (
          <button
            style={{ ...styles.iconBtn }}
            onClick={() => dispatch(toggleCart())}
            title="Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>
        )}

        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              style={{
                ...styles.iconBtn,
                background: userMenuOpen ? 'var(--bg-elevated)' : 'none',
                border: '1px solid ' + (userMenuOpen ? 'var(--border-hover)' : 'transparent'),
                color: 'var(--text-primary)',
              }}
              onClick={() => setUserMenuOpen((v) => !v)}
              title="Account"
            >
              <User size={18} />
            </button>
            {userMenuOpen && (
              <div style={styles.userMenu}>
                <div style={{ padding: '0.5rem 0.8rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.username || user?.email}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
                </div>
                <button style={styles.menuItem} onClick={() => navigate('/orders')}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <Package size={15} /> My Orders
                </button>
                <button style={{ ...styles.menuItem, color: 'var(--red)' }} onClick={handleLogout}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(224,92,92,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            padding: '0.45rem 1.1rem',
            background: 'var(--accent)',
            color: '#000',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
            textDecoration: 'none',
          }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}
