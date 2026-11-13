
import { useState } from 'react';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CalendarPanel from './components/CalendarPanel.jsx';
import Market from './components/Market.jsx';
import HomeGuide from './components/HomeGuide.jsx';
import Footer from './components/Footer.jsx';

import MyPage from './pages/MyPage.jsx';
import PostDetail from './pages/PostDetail.jsx';
import TradeCreate from './pages/TradeCreate.jsx';
import TradeRequest from './pages/TradeRequest.jsx';
import Login from './pages/Login.jsx';
import Guide from './pages/Guide.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { appPath, routePathname } from './utils/paths.js';

import { getPosts } from './data/postStore.js';

// 홈 화면
function HomePage() {
  // URL에 전달된 날짜 확인
  const params = new URLSearchParams(window.location.search);
  const queryDate = params.get('date');

  // 게시글 데이터
  const [availablePosts] = useState(() => getPosts());

  // 날짜 초기값 설정
  const initialDate =
    queryDate && !isNaN(new Date(`${queryDate}T00:00:00`).getTime())
      ? queryDate
      : '2026-11-18';

  const [month, setMonth] = useState(() =>
    queryDate
      ? new Date(`${initialDate}T00:00:00`)
      : new Date(2026, 10, 1)
  );

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [marketDate, setMarketDate] = useState(initialDate);

  // 게시글 작성 페이지 이동
  const notify = () => {
    window.location.href = appPath('/post/new');
  };

  // 거래 게시글 영역으로 이동
  const browse = () => {
    document.getElementById('market')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  // 선택한 날짜의 거래 게시글 보기
  const viewDate = () => {
    setMarketDate(selectedDate);

    setTimeout(() => {
      browse();
    }, 0);
  };

  return (
    <>
      <Header onPost={notify} />

      <main>
        <Hero
          onBrowse={browse}
          onPost={notify}
        />

        <div className="content-wrap">
          <CalendarPanel
            posts={availablePosts}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            setMonth={setMonth}
            onViewDate={viewDate}
          />

          <Market
            posts={availablePosts}
            selectedDate={selectedDate}
            marketDate={marketDate}
          />
        </div>
        <HomeGuide />
      </main>

      <Footer />
    </>
  );
}

// 페이지 경로에 따라 화면 표시
export default function App() {
  const { user } = useAuth();
  // 마지막 슬래시 제거
  const pathname = routePathname();

  if (pathname === '/login') return <Login />;
  if (pathname === '/guide') return <Guide />;

  if ((pathname === '/mypage' || pathname === '/post/new') && !user) {
    const returnTo = `${pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(appPath(`/login?returnTo=${encodeURIComponent(returnTo)}`));
    return null;
  }

  // 거래글 작성 페이지
  if (pathname === '/post/new') {
    return <TradeCreate />;
  }

  // 구매자의 거래 요청 화면
  const requestMatch = pathname.match(/^\/post\/(\d+)\/request$/);
  if (requestMatch) {
    return <TradeRequest postId={Number(requestMatch[1])} />;
  }

  // 거래글 상세페이지
  // 예: /post/1, /post/2, /post/123
  const postMatch = pathname.match(/^\/post\/(\d+)$/);

  if (postMatch) {
    return <PostDetail postId={Number(postMatch[1])} />;
  }

  // 마이페이지
  if (pathname === '/mypage') {
    return <MyPage />;
  }

  // 기본 화면
  return <HomePage />;
}
