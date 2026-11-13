import { useEffect, useState } from 'react';
import { Menu, Plus, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { appPath } from '../utils/paths.js';

const navItems = [
  { label: '홈', href: appPath('/#top') },
  { label: '티켓 거래', href: appPath('/#market') },
  { label: '이용안내', href: appPath('/guide') },
  { label: '고객센터', href: appPath('/#support') },
];

export default function Header({ onPost }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const loginHref = returnTo => appPath(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = event => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const registerPost = () => {
    closeMenu();
    if (!user) {
      window.location.href = loginHref('/post/new');
      return;
    }
    onPost?.();
  };

  return (
    <header className="site-header">
      <a className="brand" href={appPath('/')} aria-label="TIMO 홈">
        <img
          src={`${import.meta.env.BASE_URL}images/logo.png`}
          alt="TIMO"
        />
      </a>

      <nav className="main-nav" aria-label="주 메뉴">
        {navItems.map(item => <a href={item.href} key={item.label}>{item.label}</a>)}
      </nav>

      <div className="header-actions">
        <a className="mypage" href={user ? appPath('/mypage') : loginHref('/mypage')}><UserRound size={18}/>마이페이지</a>
        <button className="post-button" type="button" onClick={registerPost}>
          <Plus size={18}/>글 등록
        </button>
      </div>

      <button
        className="header-menu-toggle"
        type="button"
        aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={menuOpen}
        aria-controls="mobile-site-menu"
        onClick={() => setMenuOpen(open => !open)}
      >
        {menuOpen ? <X size={24}/> : <Menu size={24}/>}
      </button>

      <div
        className={`mobile-menu-layer ${menuOpen ? 'is-open' : ''}`}
        onMouseDown={event => { if (event.target === event.currentTarget) closeMenu(); }}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-site-menu" id="mobile-site-menu" aria-label="모바일 메뉴">
          {navItems.map(item => <a href={item.href} key={item.label} onClick={closeMenu}>{item.label}</a>)}
          <a href={user ? appPath('/mypage') : loginHref('/mypage')} onClick={closeMenu}><UserRound size={18}/>마이페이지</a>
          <button type="button" onClick={registerPost}><Plus size={19}/>글 등록</button>
        </nav>
      </div>
    </header>
  );
}
