
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { getPostOptions } from '../data/postOptions.js';
import { appPath } from '../utils/paths.js';

const tabs = ['전체', '양도', '교환', '분철'];

const prettyDate = (value) => {
  if (!value) return '';

  const d = new Date(`${value}T00:00:00`);

  if (Number.isNaN(d.getTime())) return value;

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}일 (${weekdays[d.getDay()]})`;
};

function PostOptions({ post }) {
  const options = getPostOptions(post);
  return (
    <div className="post-options" aria-label="거래 옵션">
      {options.map(({ label, checked }) => {
        const Icon = checked ? Check : X;
        return (
          <span className={`post-option ${checked ? 'is-checked' : 'is-unchecked'}`} key={label}>
            <Icon size={14} strokeWidth={2.7} aria-hidden="true" />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}

// 게시글 카드
function PostCard({ post, onOpen }) {
  const coverImage =
    post.coverImage ||
    post.images?.[post.coverIndex ?? 0];

  return (
    <article className="post-card">
      <div className={`post-thumb thumb-${post.image}`}>
        {coverImage ? (
          <img src={coverImage} alt="" />
        ) : post.image === 'logo' ? (
          <span>
            OWCS
            <br />
            <b>KOREA</b>
          </span>
        ) : (
          <span>
            {post.image === 'crowd' ? 'LIVE ARENA' : 'STAGE 03'}
          </span>
        )}
        <i />
      </div>

      <div className="post-main">
        <div className="post-title-line">
          <span className={`type-tag tag-${post.type}`}>
            {post.type}
          </span>
          <h3>{post.title}</h3>
        </div>

        <div className="post-meta">
          <span>{prettyDate(post.date)}</span>
          <i />
          <span>{post.seat}</span>
          <i />
          <span>{post.method}</span>
        </div>

        <PostOptions post={post} />
      </div>

      <div className="post-offer">
        {post.type === '교환' ? (
          <strong className="wanted-seat">
            {post.wanted || '희망 좌석'}
          </strong>
        ) : (
          <strong>
            {Number(post.price || 0).toLocaleString()}
            <small>원</small>
          </strong>
        )}
      </div>

      <a
        className="detail-button"
        href={post.id != null ? appPath(`/post/${post.id}`) : '#'}
        onClick={(event) => {
          if (post.id == null) {
            event.preventDefault();
            alert('게시글 ID를 확인할 수 없습니다.');
            return;
          }

          onOpen(post);
        }}
      >
        상세 보기
        <ArrowRight size={17} />
      </a>
    </article>
  );
}

// 거래 게시글 목록
export default function Market({ marketDate, posts = [] }) {
  const restoredState = useRef(null);

  // 이전 목록 상태 복원
  if (restoredState.current === null) {
    try {
      restoredState.current = JSON.parse(
        sessionStorage.getItem('timo-market-return-state') || 'null'
      );

      sessionStorage.removeItem('timo-market-return-state');
    } catch {
      restoredState.current = null;
    }
  }

  const [type, setType] = useState(
    () => restoredState.current?.type || '전체'
  );

  const [date, setDate] = useState(
    () => restoredState.current?.date ?? marketDate ?? ''
  );

  const [sort, setSort] = useState(
    () => restoredState.current?.sort || '최신순'
  );

  const [page, setPage] = useState(
    () => restoredState.current?.page || 1
  );

  const pageSize = 3;

  // 홈 화면에서 선택한 날짜 반영
  useEffect(() => {
    if (marketDate && !restoredState.current) {
      setDate(marketDate);
      setPage(1);
    }
  }, [marketDate]);

  // 이전 목록 스크롤 위치 복원
  useEffect(() => {
    if (restoredState.current?.scrollY != null) {
      window.scrollTo({
        top: restoredState.current.scrollY,
        behavior: 'instant',
      });
    }

    restoredState.current = null;
  }, []);

  // 게시글 필터링 및 정렬
  const filtered = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesType =
          type === '전체' || post.type === type;

        const matchesDate =
          !date || post.date === date;

        return matchesType && matchesDate;
      })
      .sort((a, b) => {
        return sort === '최신순'
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      });
  }, [posts, type, date, sort]);

  const pages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const current = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 거래 유형 변경
  const changeType = (selectedType) => {
    setType(selectedType);
    setPage(1);
  };

  // 상세페이지 이동 전 목록 상태 저장
  const openPost = (post) => {
    if (post.id == null) return;

    try {
      sessionStorage.setItem(
        'timo-market-return-state',
        JSON.stringify({
          type,
          date,
          sort,
          page,
          scrollY: window.scrollY,
        })
      );

      sessionStorage.setItem(
        'timo-market-return-path',
        `${window.location.pathname}${window.location.search}#market`
      );
    } catch {
      // 저장에 실패해도 상세페이지 이동은 진행
    }
  };

  return (
    <section className="market-section" id="market">
      <div className="market-heading">
        <div>
          <p className="section-kicker">
            TICKETS, ALL IN ONE PLACE
          </p>

          <h2>TICKET MARKET</h2>

          <p>
            지금 바로 거래 가능한 티켓을 확인해 보세요.
          </p>
        </div>

        <div className="market-controls">
          <div className="filter-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={type === tab ? 'active' : ''}
                onClick={() => changeType(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <label className="select-control date-control">
            <CalendarDays size={15} />

            <input
              aria-label="날짜 선택 필터"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="select-control">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              aria-label="정렬"
            >
              <option>최신순</option>
              <option>오래된순</option>
            </select>

            <ChevronDown size={15} />
          </label>
        </div>
      </div>

      <div className="post-list">
        {current.length > 0 ? (
          current.map((post) => (
            <PostCard
              post={post}
              key={post.id}
              onOpen={openPost}
            />
          ))
        ) : (
          <div className="empty-state">
            선택한 조건에 해당하는 거래가 없습니다.
          </div>
        )}
      </div>

      <nav className="pagination" aria-label="페이지 이동">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={17} />
        </button>

        {Array.from({ length: pages }, (_, index) => (
          <button
            key={index}
            className={page === index + 1 ? 'current' : ''}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={page === pages}
          onClick={() => setPage((prev) => prev + 1)}
          aria-label="다음 페이지"
        >
          <ChevronRight size={17} />
        </button>
      </nav>
    </section>
  );
}
