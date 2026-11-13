
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Gamepad2,
  Heart,
  House,
  MessageCircle,
  Share2,
  ShieldAlert,
  Ticket,
  Trash2,
  X
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {
  getPosts,
  togglePostFavorite,
  isPostFavorite,
  deletePost,
  getTradeRequest
} from '../data/postStore.js';
import { getPostDetails } from '../data/postDetails.js';
import './PostDetail.css';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

const fullDate = value => {
  const d = new Date(`${value}T00:00:00`);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} (${weekdays[d.getDay()]})`;
};

const shortDate = value => {
  const d = new Date(`${value}T00:00:00`);

  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}(${weekdays[d.getDay()]})`;
};

const typeTagClass = type => `detail-tag tag-${type}`;

const statusClass = status => ({
  '거래 가능': 'available',
  '거래 대기': 'pending',
  '거래 완료': 'completed',
  '기간 만료': 'expired',
  '모집 중': 'recruiting',
  '모집 마감': 'closed'
}[status] || 'available');

function TicketArtwork({ post, large = false, onClick }) {
  const label =
    post.image === 'logo' ? (
      <>
        OWCS
        <br />
        <b>KOREA</b>
      </>
    ) : post.image === 'crowd' ? (
      <>
        LIVE
        <br />
        <b>ARENA</b>
      </>
    ) : (
      <>
        STAGE
        <br />
        <b>03</b>
      </>
    );

  const image = post.coverImage || post.images?.[post.coverIndex || 0];

  return (
    <button
      type="button"
      className={`detail-art art-${post.image} ${large ? 'large-art' : ''}`}
      onClick={onClick}
      aria-label="거래 이미지 크게 보기"
    >
      {image ? (
        <img
          className="detail-art-photo"
          src={image}
          alt="거래 티켓 이미지"
        />
      ) : (
        <span>{label}</span>
      )}

      {!large && <small>티켓 이미지 크게 보기</small>}
    </button>
  );
}

function Dialog({
  title,
  eyebrow,
  onClose,
  children,
  className = ''
}) {
  return (
    <div
      className="detail-modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`detail-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
      >
        <button
          className="detail-modal-close"
          aria-label="닫기"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {eyebrow && <p className="detail-kicker">{eyebrow}</p>}

        <h2 id="detail-modal-title">{title}</h2>

        {children}
      </section>
    </div>
  );
}

export default function PostDetail({ postId }) {
  const [availablePosts] = useState(() => getPosts());

  const post = availablePosts.find(item => item.id === postId);
  const detail = post && getPostDetails(post);

  const [dialog, setDialog] = useState('');

  const [favorite, setFavorite] = useState(() =>
    post ? isPostFavorite(post.id) : false
  );

  const [requestSent] = useState(() =>
    post ? Boolean(getTradeRequest(post.id)) : false
  );

  const [reportType, setReportType] = useState('사기 의심');
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const sameDay = useMemo(
    () =>
      post
        ? availablePosts
            .filter(
              item => item.date === post.date && item.id !== post.id
            )
            .slice(0, 4)
        : [],
    [post, availablePosts]
  );

  if (!post || !detail || deleted) {
    return (
      <div className="detail-not-found">
        <Header
          onPost={() => {
            window.location.href = '/post/new';
          }}
        />

        <main>
          <h1>
            {deleted
              ? '게시글을 삭제했습니다.'
              : '거래글을 찾을 수 없습니다.'}
          </h1>

          <a href="/#market">거래 목록으로 이동</a>
        </main>

        <Footer />
      </div>
    );
  }

  const priceLabel = post.price
    ? `${post.price.toLocaleString()}원`
    : '가격 협의';

  const splitSummary =
    detail.rounds?.find(round => round.includes('모집')) || '경기별 참여';

  // The detail view uses the post's representative image. The image remains
  // clickable and opens the existing enlarged-image dialog.
  const activeImagePost = post;

  const backToList = () => {
    let savedPath = '';

    try {
      savedPath =
        sessionStorage.getItem('timo-market-return-path') || '';
    } catch {
      // Use the date-filtered fallback below.
    }

    if (savedPath) {
      window.location.assign(savedPath);
      return;
    }

    if (document.referrer) {
      try {
        if (
          new URL(document.referrer).origin === window.location.origin
        ) {
          window.history.back();
          return;
        }
      } catch {
        // Fall through to the listing URL.
      }
    }

    window.location.assign(`/?date=${post.date}#market`);
  };

  const openDateListings = event => {
    event.preventDefault();

    try {
      sessionStorage.removeItem('timo-market-return-state');
      sessionStorage.removeItem('timo-market-return-path');
    } catch {
      // The date-filtered route works without session storage.
    }

    window.location.assign(`/?date=${post.date}#market`);
  };

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert('게시글 주소를 복사했습니다.');
    } catch {
      window.prompt(
        '게시글 주소를 복사해 주세요.',
        window.location.href
      );
    }
  };

  const submitReport = event => {
    event.preventDefault();

    setReportSent(true);
    setDialog('');

    window.alert('신고가 접수되었습니다. (데모)');
  };

  return (
    <div className="post-detail-page">
      <Header
        onPost={() => {
          window.location.href = '/post/new';
        }}
      />

      <div className="detail-breadcrumb-band">
        <div className="detail-breadcrumb-pattern" />

        <nav className="detail-breadcrumb" aria-label="현재 위치">
          <House size={19} />

          <a href="/">홈</a>
          <ChevronRight size={16} />

          <a
            href={`/?date=${post.date}#market`}
            onClick={openDateListings}
          >
            티켓 거래
          </a>

          <ChevronRight size={16} />
          <span>게시글 상세 보기</span>
        </nav>
      </div>

      <main className="detail-container">
        <section className="detail-heading-card">
          <div className="detail-heading-copy">
            <span className={typeTagClass(post.type)}>
              {post.type}
            </span>

            <div className="detail-heading-text">
              <h1>{post.title}</h1>

              <div className="detail-inline-meta">
                <span>
                  <Gamepad2 size={14} />
                  {shortDate(post.date)}
                </span>

                <i />
                <span>{post.seat}</span>

                <i />
                <span>{post.method}</span>

                <i />
                <span>
                  작성일 {detail.createdAt || '2026-11-10 15:22'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-heading-side">
            <div className="detail-price">
              {post.type === '양도' ? (
                <>
                  <strong>{priceLabel.replace('원', '')}</strong>
                  <small>원</small>
                </>
              ) : post.type === '교환' ? (
                <>
                  <span className="price-label">희망 좌석</span>
                  <strong>
                    {post.wanted || detail.wantedSeat || '좌석 교환'}
                  </strong>
                </>
              ) : (
                <>
                  <span className="price-label">모집 정보</span>
                  <strong>{splitSummary}</strong>
                </>
              )}
            </div>

            <div className="detail-heading-actions">
              <button
                className={favorite ? 'is-favorite' : ''}
                aria-label={favorite ? '찜 해제' : '찜하기'}
                title={favorite ? '찜 해제' : '찜하기'}
                onClick={() =>
                  setFavorite(togglePostFavorite(post.id))
                }
              >
                <Heart
                  size={25}
                  fill={favorite ? 'currentColor' : 'none'}
                />
              </button>

              <button
                aria-label="공유하기"
                title="공유하기"
                onClick={sharePost}
              >
                <Share2 size={22} />
              </button>
            </div>
          </div>
        </section>

        <div className="detail-main-grid">
          <div className="detail-left-column">
            <section className="detail-gallery" aria-label="거래 이미지">
              <TicketArtwork
                post={activeImagePost}
                onClick={() => setDialog('image')}
              />

            </section>

            <section className="detail-info-card">
              <h2>
                <Ticket size={21} />
                티켓 정보
              </h2>

              <dl className="ticket-info-list">
                <div>
                  <dt>경기 일정</dt>
                  <dd>{fullDate(post.date)}</dd>
                </div>

                {post.type === '양도' && (
                  <>
                    <div>
                      <dt>좌석 정보</dt>
                      <dd>{post.seat}</dd>
                    </div>

                    <div>
                      <dt>거래 가격</dt>
                      <dd>{priceLabel}</dd>
                    </div>
                  </>
                )}

                {post.type === '교환' && (
                  <>
                    <div>
                      <dt>보유 좌석</dt>
                      <dd>{post.seat}</dd>
                    </div>

                    <div>
                      <dt>희망 좌석</dt>
                      <dd>
                        {post.wanted || detail.wantedSeat || '협의 가능'}
                      </dd>
                    </div>

                    <div>
                      <dt>거래 조건</dt>
                      <dd>{post.method}</dd>
                    </div>

                    {detail.wantedDescription && (
                      <div>
                        <dt>추가 설명</dt>
                        <dd>{detail.wantedDescription}</dd>
                      </div>
                    )}
                  </>
                )}

                {post.type === '분철' && (
                  <>
                    <div>
                      <dt>좌석 정보</dt>
                      <dd>{post.seat}</dd>
                    </div>

                    <div>
                      <dt>분철 정보</dt>
                      <dd className="round-info">
                        {detail.gameRounds?.length
                          ? detail.gameRounds.map(game => (
                              <span key={game.index}>
                                {game.name} · {game.team || '경기명 미입력'} ·{' '}
                                {game.attend
                                  ? '본인 관람'
                                  : game.recruit
                                    ? `모집 중 ${game.amount.toLocaleString()}원`
                                    : '미모집'}
                              </span>
                            ))
                          : (detail.rounds || post.rounds || []).map(
                              item => <span key={item}>{item}</span>
                            )}
                      </dd>
                    </div>
                  </>
                )}

                {post.type !== '분철' && post.type !== '교환' && (
                  <div>
                    <dt>거래 방식</dt>
                    <dd>{detail.methodLabel || post.method}</dd>
                  </div>
                )}

                {post.type === '교환' && (
                  <div>
                    <dt>거래 방식</dt>
                    <dd>{detail.methodLabel || post.method}</dd>
                  </div>
                )}

                {post.type === '분철' && (
                  <div>
                    <dt>거래 방식</dt>
                    <dd>{detail.methodLabel || post.method}</dd>
                  </div>
                )}

                {post.type === '양도' && (
                  <div>
                    <dt>티켓 특전</dt>
                    <dd>
                      {(detail.perks || ['별도 특전 없음']).join(', ')}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="detail-info-card description-card">
              <h2>
                <MessageCircle size={21} />
                상세 설명
              </h2>

              <p className="detail-description">
                {detail.description || '판매자가 등록한 상세 설명이 없습니다.'}
              </p>

              <div className="seller-safety-note">
                <AlertCircle size={16} />
                판매자와 직접 거래 시 사기를 주의해 주세요.
              </div>
            </section>
          </div>

          <aside className="detail-right-column">
            <div className="detail-state-pair">
              <div className="detail-state-card">
                <h2>거래 유형</h2>
                <span className={typeTagClass(post.type)}>
                  {post.type}
                </span>
              </div>

              <div className="detail-state-card">
                <h2>
                  {post.type === '분철' ? '모집 상태' : '거래 상태'}
                </h2>

                <span
                  className={`status-pill status-${statusClass(detail.status)}`}
                >
                  {detail.status}
                </span>
              </div>
            </div>

            <a className="seller-card" href="/mypage">
              <span className="seller-avatar" />

              <span className="seller-card-info">
                <strong>{detail.author}</strong>
                <small>가입일 {detail.joinedAt}</small>
              </span>

              <ChevronRight size={17} />
            </a>

            <div className="detail-action-card">
              <button
                className="inquiry-button"
                onClick={() => setDialog('inquiry')}
              >
                문의하기
              </button>

              {requestSent ? (
                <button className="request-button" disabled>
                  요청 완료
                </button>
              ) : ['거래 완료', '기간 만료', '모집 마감'].includes(
                  detail.status
                ) ? (
                <button className="request-button" disabled>
                  요청 불가
                </button>
              ) : (
                <a
                  className="request-button"
                  href={`/post/${post.id}/request`}
                >
                  거래 요청
                </a>
              )}
            </div>

            <a className="first-trade-guide" href="/#guide">
              <span>거래가 처음인가요?</span>

              <strong>
                이용안내
                <ArrowRight size={13} />
              </strong>
            </a>

            <aside className="same-day-card">
              <h2>
                <span>
                  <CalendarDays size={17} />
                </span>
                다른 거래 둘러보기
              </h2>

              {sameDay.length ? (
                <div className="same-day-list">
                  {sameDay.map(item => (
                    <a
                      href={`/post/${item.id}`}
                      className="same-day-item"
                      key={item.id}
                    >
                      <span className={typeTagClass(item.type)}>
                        {item.type}
                      </span>

                      <div>
                        <strong>{item.title}</strong>
                        <small>
                          {shortDate(item.date)} · {item.seat}
                        </small>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="same-day-empty">
                  같은 날짜에 등록된 다른 거래글이 없습니다.
                </p>
              )}

              <a
                className="same-day-all"
                href={`/?date=${post.date}#market`}
                onClick={openDateListings}
              >
                전체 거래글 보기
              </a>
            </aside>
          </aside>
        </div>

        <div className="detail-bottom-actions">
          <button className="back-to-list" onClick={backToList}>
            <ArrowLeft size={17} />
            목록으로 돌아가기
          </button>

          <div>
            <button
              className="report-post-button"
              onClick={() => setDialog('report')}
            >
              <ShieldAlert size={18} />
              신고하기
            </button>

            {detail.isAuthor && (
              <button
                className="delete-post-button"
                onClick={() => setDialog('delete')}
              >
                <Trash2 size={17} />
                삭제하기
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {dialog === 'image' && (
        <Dialog
          title="거래 이미지"
          eyebrow="TICKET PHOTO"
          onClose={() => setDialog('')}
          className="image-viewer"
        >
          <TicketArtwork
            post={activeImagePost}
            large
            onClick={() => setDialog('')}
          />
        </Dialog>
      )}

      {dialog === 'inquiry' && (
        <Dialog
          title="판매자에게 문의하기"
          eyebrow="CONTACT SELLER"
          onClose={() => setDialog('')}
        >
          <p className="dialog-copy">
            판매자 <b>{detail.author}</b>님에게 문의를 남길 수 있어요.
            <br />
            실제 채팅 기능은 준비 중입니다.
          </p>

          <button
            className="dialog-primary"
            onClick={() => setDialog('')}
          >
            확인
          </button>
        </Dialog>
      )}

      {dialog === 'report' && (
        <Dialog
          title="게시글 신고"
          eyebrow="REPORT POST"
          onClose={() => setDialog('')}
        >
          <form className="report-form" onSubmit={submitReport}>
            <label>
              신고 유형

              <select
                value={reportType}
                onChange={event => setReportType(event.target.value)}
              >
                <option>사기 의심</option>
                <option>프리미엄 가격(플미) 의심</option>
                <option>허위 정보</option>
                <option>기타</option>
              </select>
            </label>

            <label>
              상세 내용

              <textarea
                value={reportText}
                onChange={event => setReportText(event.target.value)}
                placeholder="신고 내용을 입력해 주세요."
                rows="4"
              />
            </label>

            <button className="dialog-primary" type="submit">
              신고 제출
            </button>
          </form>
        </Dialog>
      )}

      {dialog === 'delete' && (
        <Dialog
          title="게시글을 삭제할까요?"
          eyebrow="DELETE POST"
          onClose={() => setDialog('')}
        >
          <p className="dialog-copy">
            삭제한 게시글은 거래 목록에서 확인할 수 없습니다.
          </p>

          <div className="dialog-actions">
            <button
              className="dialog-secondary"
              onClick={() => setDialog('')}
            >
              취소
            </button>

            <button
              className="dialog-danger"
              onClick={() => {
                deletePost(post.id);
                setDialog('');
                setDeleted(true);
                requestAnimationFrame(backToList);
              }}
            >
              삭제하기
            </button>
          </div>
        </Dialog>
      )}

      {reportSent && (
        <span className="sr-only" role="status">
          신고가 접수되었습니다.
        </span>
      )}
    </div>
  );
}
