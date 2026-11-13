import { CircleHelp, Settings, UserRound } from 'lucide-react';

const items = [
  { id: 'mypage', label: '마이페이지', Icon: UserRound },
  { id: 'settings', label: '계정 설정', Icon: Settings },
  { id: 'support', label: '고객센터', Icon: CircleHelp },
];

export default function MyPageSidebar({ active, onSelect }) {
  return (
    <nav 
      className="mypage-sidebar"
      aria-label="마이페이지 메뉴"
    >
      {items.map(({ id, label, Icon }) => 
        <button 
          key={id} 
          className={`mypage-nav-item ${active === id ? 'active' : ''}`}
          onClick={() => onSelect(id)} 
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={23} strokeWidth={2.2}/>
          <span>{label}</span>
        </button>
      )}
    </nav>
  );
}
