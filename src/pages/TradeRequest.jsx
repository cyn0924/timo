
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Gamepad2,
  House,
  MessageCircle,
  ShieldCheck,
  Ticket,
  X
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {
  createTradeRequest,
  getPosts,
  getTradeRequest,
  CURRENT_USER_ID
} from '../data/postStore.js';
import { getPostDetails } from '../data/postDetails.js';
import './TradeRequest.css';

const days = ['일', '월', '화', '수', '목', '금', '토'];

const formatDay = value => {
  const d = new Date(`${value}T00:00:00`);

  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
};

const formatFullDay = value => {
  const d = new Date(`${value}T00:00:00`);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
};

const inactiveStatuses = ['거래 완료', '기간 만료', '모집 마감'];

function TicketImage({ post }) {
  const image = post.coverImage || post.images?.[post.coverIndex || 0];

  return (
    <div className={`request-ticket-thumb thumb-${post.image || 'arena'}`}>
      {image ? (
        <img src={image} alt="거래 티켓" />
      ) : (
        <span>
          {post.image === 'logo' ? (
            <>
              OWCS
              <br />
              KOREA
            </>
          ) : post.image === 'crowd' ? (
            <>
              LIVE
              <br />
              ARENA
            </>
          ) : (
            <>
              STAGE
              <br />
              03
            </>
          )}
        </span>
      )}
    </div>
  );
}

function PriceText({ post }) {
  if (post.type === '교환') {
    return <strong>좌석 교환</strong>;
  }

  if (post.type === '분철') {
    return (
      <strong>
        {post.price
          ? `${post.price.toLocaleString()}원부터`
          : '경기별 분담금'}
      </strong>
    );
  }

  return (
    <strong>
      {post.price
        ? `${post.price.toLocaleString()}원`
        : '가격 협의'}
    </strong>
  );
}

export default function TradeRequest({ postId }) {
  const [availablePosts] = useState(() => getPosts());

  const post = availablePosts.find(item => item.id === postId);
  const detail = post && getPostDetails(post);

  const [existingRequest, setExistingRequest] = useState(() =>
    post ? getTradeRequest(post.id) : null
  );

  const initialMethod = useMemo(() => {
    const previous = existingRequest?.method;

    if (previous) return previous;

    if (/택배|우편/.test(post?.method || '')) {
      return '택배 거래';
    }

    if (/기타|협의/.test(post?.method || '')) {
      return '기타 협의';
    }

    return '현장 수령';
  }, [existingRequest, post]);

  const defaultMessage = post
    ? `안녕하세요! ${post.seat} 티켓 거래에 관심 있어요.
경기 시작 시간 전에 현장 수령이 가능할까요?
가능한 시간과 장소를 알려주세요. 감사합니다.`
    : '';

  const [method, setMethod] = useState(initialMethod);
  const [message, setMessage] = useState(
    existingRequest?.message || defaultMessage
  );

  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!post || !detail) {
    return (
      <div className="request-page">
        <Header
          onPost={() => {
            window.location.href = '/post/new';
          }}
        />

        <main className="request-missing">
          <section>
            <h1>거래글을 찾을 수 없습니다.</h1>
            <p>게시글이 삭제되었거나 주소가 올바르지 않습니다.</p>
            <a href="/#market">목록으로 돌아가기</a>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  const unavailable = inactiveStatuses.includes(detail.status);

  const complete =
    Boolean(message.trim()) &&
    scheduleConfirmed &&
    termsConfirmed &&
    !unavailable &&
    !existingRequest;

  const transactionSummary =
    post.type === '교환'
      ? `${post.method || '희망 좌석 교환'}${post.wanted ? ` · ${post.wanted}` : ''}`
      : post.type === '분철'
        ? '경기별 참여 분담'
        : detail.methodLabel || post.method || '현장 수령';

  const statusLabel = detail.status;

  const handleSubmit = event => {
    event.preventDefault();
    setAttempted(true);

    if (
      !message.trim() ||
      !scheduleConfirmed ||
      !termsConfirmed ||
      unavailable ||
      existingRequest
    ) {
      return;
    }

    setSaveError('');
    setConfirmOpen(true);
  };

  const sendRequest = () => {
    try {
      const result = createTradeRequest({
        postId: post.id,
        postTitle: post.title,
        type: post.type,
        date: post.date,
        seat: post.seat,
        price: post.price ?? null,
        image: post.image || 'arena',
        method,
        message: message.trim(),
        requesterId: CURRENT_USER_ID,
        requesterNickname: '이상한 라쿤 123',
        sellerNickname: detail.author
      });

      setExistingRequest(result.request);
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch {
      setConfirmOpen(false);
      setSaveError(
        '요청을 저장하지 못했습니다. 브라우저 저장 공간을 확인하고 다시 시도해주세요.'
      );
    }
  };

  return (
    <div className="request-page">
      <Header
        onPost={() => {
          window.location.href = '/post/new';
        }}
      />

      <div className="detail-breadcrumb-band">
        <div className="detail-breadcrumb-pattern" />

        <nav className="detail-breadcrumb" aria-label="현재 위치">
          <House size={18} />
          <a href="/">홈</a>
          <ChevronRight size={15} />
          <a href={`/?date=${post.date}#market`}>티켓 거래</a>
          <ChevronRight size={15} />
          <a href={`/post/${post.id}`}>게시글 상세 보기</a>
          <ChevronRight size={15} />
          <span>거래 요청</span>
        </nav>
      </div>

      <main className="request-main">
        <ol className="request-steps">
          <li className="current">
            <i>1</i>
            <span>요청 작성</span>
          </li>

          <b>
            <ChevronRight />
          </b>

          <li>
            <i>2</i>
            <span>판매자 확인</span>
          </li>

          <b>
            <ChevronRight />
          </b>

          <li>
            <i>3</i>
            <span>거래 진행</span>
          </li>
        </ol>

        <form className="request-columns" onSubmit={handleSubmit}>
          <div className="request-left-column">
            <section className="request-card ticket-summary-card">
              <h1>거래할 티켓</h1>

              <div className="request-ticket-row">
                <TicketImage post={post} />

                <div className="request-ticket-copy">
                  <div className="request-ticket-tags">
                    <span className={`request-type-tag type-${post.type}`}>
                      {post.type}
                    </span>

                    <span
                      className={`request-status-tag ${
                        inactiveStatuses.includes(statusLabel)
                          ? 'inactive'
                          : 'active'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h2>{post.title}</h2>

                  <div className="request-ticket-meta">
                    <span>
                      <Gamepad2 size={14} />
                      {formatDay(post.date)}
                    </span>

                    <i />

                    <span>{post.seat}</span>
                  </div>
                </div>
              </div>

              <div className="request-seller-line">
                <span>
                  판매자 <b>{detail.author}</b>
                </span>

                <span>
                  수령 방법 <b>{detail.methodLabel || post.method}</b>
                </span>

                <a href={`/post/${post.id}`}>
                  게시글 다시 보기 <ArrowRight size={13} />
                </a>
              </div>
            </section>

            <section className="request-card request-content-card">
              <h2>요청 내용</h2>

              <label className="request-field">
                <span>거래 방식</span>

                <select
                  value={method}
                  onChange={event => setMethod(event.target.value)}
                  disabled={Boolean(existingRequest)}
                >
                  <option>현장 수령</option>
                  <option>택배 거래</option>
                  <option>기타 협의</option>
                </select>
              </label>

              <label
                className={`request-field message-field ${
                  attempted && !message.trim() ? 'error' : ''
                }`}
              >
                <span>
                  판매자에게 보낼 메시지 <b>*</b>
                </span>

                <textarea
                  value={message}
                  maxLength={1000}
                  onChange={event => setMessage(event.target.value)}
                  placeholder="판매자에게 전달할 내용을 입력해주세요."
                  disabled={Boolean(existingRequest)}
                />

                <small className="message-count">
                  {message.length} / 1,000
                </small>

                {attempted && !message.trim() && (
                  <small className="request-error">
                    메시지를 입력해주세요.
                  </small>
                )}
              </label>

              <p className="privacy-note">
                <ShieldCheck size={15} />
                전화번호, 계좌번호 등 개인정보는 메시지에 입력하지 마세요.
              </p>

              {existingRequest && (
                <p className="request-existing-note">
                  <Check size={16} />
                  이 게시글에는 이미 요청을 보냈어요. 상태:{' '}
                  {existingRequest.status}
                </p>
              )}
            </section>

            <section className="request-card confirmation-card">
              <h2>요청 전, 꼭 확인해주세요</h2>

              <label
                className={attempted && !scheduleConfirmed ? 'error' : ''}
              >
                <input
                  type="checkbox"
                  checked={scheduleConfirmed}
                  onChange={event =>
                    setScheduleConfirmed(event.target.checked)
                  }
                />
                <span>경기 일정, 좌석과 게시글의 거래 조건을 확인했어요.</span>
              </label>

              <label
                className={attempted && !termsConfirmed ? 'error' : ''}
              >
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={event =>
                    setTermsConfirmed(event.target.checked)
                  }
                />
                <span>
                  거래 요청은 결제가 아니며, 판매자와 조건을 확인한 뒤
                  거래할게요.
                </span>
              </label>

              <p>
                개인 간 거래입니다. 입금 전 티켓 보유 여부와 수령 방법을
                확인해주세요.
              </p>

              <small className="confirmation-hint">
                두 항목을 모두 체크하면 거래 요청을 보낼 수 있어요.
              </small>

              {attempted && (!scheduleConfirmed || !termsConfirmed) && (
                <small className="request-error">
                  확인 항목을 모두 체크해주세요.
                </small>
              )}
            </section>

            {saveError && (
              <p className="request-save-error" role="alert">
                {saveError}
              </p>
            )}
          </div>

          <aside className="request-right-column">
            <section className="request-card request-order-card">
              <h2>거래 요약</h2>

              <span className={`request-type-tag type-${post.type}`}>
                {post.type}
              </span>

              <dl>
                <div>
                  <dt>경기 날짜</dt>
                  <dd>
                    {formatFullDay(post.date)} · {post.eventTime || '19:00'}
                  </dd>
                </div>

                <div>
                  <dt>좌석 정보</dt>
                  <dd>{post.seat}</dd>
                </div>

                <div>
                  <dt>거래 방식</dt>
                  <dd>{method}</dd>
                </div>
              </dl>

              <div className="request-total">
                <span>
                  {post.type === '양도'
                    ? '거래 금액'
                    : post.type === '교환'
                      ? '교환 조건'
                      : '경기별 분담금'}
                </span>

                <div>
                  <PriceText post={post} />
                </div>
              </div>

              <p className="payment-disclaimer">
                표시 금액은 게시글에 등록된 거래 정보이며, 실제 결제 금액이
                아닙니다.
              </p>

              <button
                className="send-request-button"
                type="submit"
                disabled={
                  !complete || Boolean(existingRequest) || unavailable
                }
              >
                거래 요청 보내기 <ArrowRight size={18} />
              </button>

              <a className="detail-back-link" href={`/post/${post.id}`}>
                게시글로 돌아가기
              </a>

              <small className="request-delivery-note">
                요청 내용은 판매자에게 전달됩니다.
              </small>

              {unavailable && (
                <p className="request-error unavailable-note">
                  현재 거래가 종료되어 요청할 수 없습니다.
                </p>
              )}
            </section>

            <section className="request-card request-guide-card">
              <h2>요청을 보내면 어떻게 되나요?</h2>

              <ol>
                <li>
                  <i>1</i>
                  <div>
                    <b>판매자가 요청을 확인해요</b>
                    <small>메시지와 거래 조건을 확인합니다.</small>
                  </div>
                </li>

                <li>
                  <i>2</i>
                  <div>
                    <b>서로 거래 조건을 맞춰요</b>
                    <small>수령 시간과 장소, 최종 금액 등을 협의합니다.</small>
                  </div>
                </li>

                <li>
                  <i>3</i>
                  <div>
                    <b>거래 상태를 확인해요</b>
                    <small>마이페이지 거래 내역에서 확인합니다.</small>
                  </div>
                </li>
              </ol>
            </section>

            <a className="request-help-link" href="/#guide">
              <span>거래가 처음이신가요?</span>
              <b>
                이용안내 <ArrowRight size={13} />
              </b>
            </a>
          </aside>
        </form>
      </main>

      <Footer />

      {confirmOpen && (
        <div
          className="request-modal-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setConfirmOpen(false);
            }
          }}
        >
          <section
            className="request-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-confirm-title"
          >
            <button
              className="request-modal-close"
              aria-label="닫기"
              onClick={() => setConfirmOpen(false)}
            >
              <X size={20} />
            </button>

            <p className="request-modal-eyebrow">TRADE REQUEST</p>
            <h2 id="request-confirm-title">
              거래 요청을 보내시겠어요?
            </h2>

            <strong className="confirm-post-title">{post.title}</strong>

            <dl>
              <div>
                <dt>거래 유형</dt>
                <dd>{post.type}</dd>
              </div>

              <div>
                <dt>거래 금액</dt>
                <dd>
                  <PriceText post={post} />
                </dd>
              </div>

              <div>
                <dt>거래 방식</dt>
                <dd>{method}</dd>
              </div>
            </dl>

            <div className="confirm-message">
              <span>보낼 메시지</span>
              <p>{message}</p>
            </div>

            <div className="request-modal-actions">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
              >
                취소
              </button>

              <button type="button" onClick={sendRequest}>
                요청 보내기
              </button>
            </div>
          </section>
        </div>
      )}

      {successOpen && (
        <div className="request-modal-overlay">
          <section
            className="request-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-success-title"
          >
            <span className="success-check">
              <Check size={29} />
            </span>

            <h2 id="request-success-title">
              거래 요청을 보냈어요
            </h2>

            <p>
              판매자가 요청을 확인하면 마이페이지 거래 내역에서 상태를
              확인할 수 있습니다.
            </p>

            <b>현재 상태 · 판매자 확인 대기</b>

            <div>
              <a href="/mypage">마이페이지에서 확인</a>
              <a href={`/post/${post.id}`}>게시글로 돌아가기</a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
