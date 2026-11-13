
import { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Gamepad2,
  Heart,
  House,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  UserRound,
  X
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import MyPageSidebar from '../components/MyPageSidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { appPath } from '../utils/paths.js';

import { profileSeed } from '../data/myPage.js';
import {
  deletePost,
  getFavoritePosts,
  getUserPosts,
  togglePostFavorite
} from '../data/postStore.js';

import './MyPage.css';

// 게시글 썸네일
function PostThumbnail({ post }) {
  const image =
    post.coverImage ||
    post.thumbnailUrl ||
    post.images?.[post.coverIndex || 0];

  const theme = post.thumbnail || post.image || 'arena';

  return (
    <div
      className={`mypage-thumb thumb-${theme}`}
      aria-hidden="true"
    >
      {image ? (
        <img src={image} alt="" />
      ) : theme === 'owcs' || theme === 'logo' ? (
        <span>
          OWCS
          <br />
          <b>KOREA</b>
        </span>
      ) : theme === 'arena' || theme === 'crowd' ? (
        <span>
          LIVE
          <br />
          ARENA
        </span>
      ) : (
        <span>
          FINALS
          <br />
          2026
        </span>
      )}
    </div>
  );
}

// 게시글 메타 정보
function PostMeta({ post }) {
  return (
    <div className="mypage-post-meta">
      <span>작성일 {post.createdAt}</span>
      <i />

      <span>
        <Gamepad2 size={14} />
        {post.matchDate}
      </span>
      <i />

      <span>
        <MessageCircle size={14} />
        {post.comments}
      </span>

      {post.likes !== undefined && (
        <>
          <i />
          <span>
            <Heart size={14} />
            {post.likes}
          </span>
        </>
      )}
    </div>
  );
}

// 거래 내역 게시글
function TransactionRow({
  post,
  openMenu,
  setOpenMenu,
  onDelete
}) {
  const statusClass =
    post.status === '거래 완료'
      ? 'status-done'
      : post.status === '거래 중'
        ? 'status-active'
        : post.status === '판매자 확인 대기'
          ? 'status-waiting'
          : 'status-expired';

  return (
    <article className="mypage-post-row">
      <PostThumbnail post={post} />

      <div className="mypage-post-copy">
        <h3>{post.title}</h3>
        <PostMeta post={post} />
      </div>

      <span className={`trade-status ${statusClass}`}>
        {post.status}
      </span>

      {!post.isRequest && (
        <div className="post-more-wrap">
          <button
            className="post-more"
            aria-label={`${post.title} 메뉴`}
            aria-expanded={openMenu === post.id}
            onClick={() =>
              setOpenMenu(openMenu === post.id ? null : post.id)
            }
          >
            <MoreHorizontal size={23} />
          </button>

          {openMenu === post.id && (
            <div className="post-more-menu">
              <button
                onClick={() => {
                  setOpenMenu(null);
                  window.alert('게시글 수정 기능은 준비 중입니다.');
                }}
              >
                게시글 수정
              </button>

              <button
                className="delete-action"
                onClick={() => onDelete(post.id)}
              >
                게시글 삭제
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// 찜한 게시글
function FavoriteRow({ post, onRemove }) {
  return (
    <article className="mypage-post-row favorite-row">
      <PostThumbnail post={post} />

      <div className="mypage-post-copy">
        <div className="favorite-title-line">
          <span className="favorite-type">{post.type}</span>
          <h3>{post.title}</h3>
        </div>

        <PostMeta post={post} />
      </div>

      <button
        className="favorite-heart"
        aria-label="찜 목록에서 제거"
        onClick={() => onRemove(post.id)}
      >
        <Heart size={25} fill="currentColor" />
      </button>
    </article>
  );
}

// 프로필 수정 모달
function ProfileModal({
  nickname,
  avatar,
  onClose,
  onSave
}) {
  const [draft, setDraft] = useState(nickname);
  const [imageDraft, setImageDraft] = useState(avatar);

  const fileRef = useRef(null);

  const chooseImage = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setImageDraft(URL.createObjectURL(file));
    }
  };

  const submit = (event) => {
    event.preventDefault();

    if (!draft.trim()) return;

    onSave(draft.trim(), imageDraft);
  };

  return (
    <div
      className="profile-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <button
          className="modal-close"
          aria-label="닫기"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <p className="mypage-kicker">PROFILE SETTINGS</p>
        <h2 id="profile-modal-title">프로필 수정</h2>

        <form onSubmit={submit}>
          <button
            className="avatar-picker"
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="프로필 이미지 선택"
          >
            {imageDraft ? (
              <img
                src={imageDraft}
                alt="선택한 프로필 이미지"
              />
            ) : (
              <UserRound size={33} />
            )}

            <span>
              <Pencil size={14} />
            </span>
          </button>

          <input
            ref={fileRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={chooseImage}
          />

          <label className="profile-input-label">
            닉네임

            <input
              autoFocus
              maxLength={20}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>

          <div className="profile-modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={onClose}
            >
              취소
            </button>

            <button
              type="submit"
              className="modal-save"
            >
              저장하기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// 섹션 제목
function SectionHeading({
  title,
  onViewAll,
  allLabel = '전체 보기'
}) {
  return (
    <div className="mypage-section-heading">
      <h2>{title}</h2>

      <button onClick={onViewAll}>
        {allLabel}
        <ChevronRight size={21} />
      </button>
    </div>
  );
}

// 마이페이지
export default function MyPage() {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('mypage');

  const [nickname, setNickname] = useState(user?.nickname || profileSeed.nickname);
  const [avatar, setAvatar] = useState('');

  const [profileOpen, setProfileOpen] = useState(false);

  const [transactions, setTransactions] = useState(() =>
    getUserPosts()
  );

  const [favorites, setFavorites] = useState(() =>
    getFavoritePosts()
  );

  const [openMenu, setOpenMenu] = useState(null);
  const [allView, setAllView] = useState('');

  // 로그아웃
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠어요?')) {
      logout();
      window.location.href = appPath('/login');
    }
  };

  // 게시글 삭제
  const handleDelete = (id) => {
    if (
      window.confirm(
        '이 게시글을 삭제할까요? 삭제한 게시글은 목록에서 사라집니다.'
      )
    ) {
      deletePost(id);
      setTransactions(getUserPosts());
    }

    setOpenMenu(null);
  };

  // 전체 보기
  const viewAll = (type) => {
    setActiveMenu('mypage');

    setAllView(type);

    requestAnimationFrame(() => {
      document
        .getElementById(
          type === 'favorites'
            ? 'favorite-posts'
            : 'transaction-posts'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    });
  };

  // 사이드바 메뉴 선택
  const chooseMenu = (id) => {
    setActiveMenu(id);
    setAllView('');
  };

  return (
    <div className="mypage-shell" id="top">
      <Header
        onPost={() => {
          window.location.href = appPath('/post/new');
        }}
      />

      <main className="mypage-main">
        <div
          className="mypage-backdrop-pattern"
          aria-hidden="true"
        />

        <div className="mypage-container">
          <nav
            className="mypage-breadcrumb"
            aria-label="현재 위치"
          >
            <House size={19} />
            <a href={appPath('/')}>홈</a>
            <ChevronRight size={17} />
            <span>마이페이지</span>
          </nav>

          <div className="mypage-layout">
            <MyPageSidebar
              active={activeMenu}
              onSelect={chooseMenu}
            />

            <div className="mypage-content">
              {activeMenu !== 'mypage' &&
              activeMenu !== 'transactions' ? (
                <section className="coming-soon-card">
                  <p className="mypage-kicker">TIMO ACCOUNT</p>

                  <h1>{activeMenu === 'settings' ? '계정 설정' : '고객센터'}</h1>

                  {activeMenu === 'settings' ? (
                    <div className="account-settings-details">
                      <p><b>닉네임</b><span>{user?.nickname || nickname}</span></p>
                      <p><b>아이디</b><span>{user?.id || '정보 없음'}</span></p>
                      <p><b>로그인 방식</b><span>{user?.method || '정보 없음'}</span></p>
                      <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                    </div>
                  ) : (
                    <p>고객센터 메뉴는 준비 중입니다.</p>
                  )}

                  <button onClick={() => setActiveMenu('mypage')}>
                    마이페이지로 돌아가기
                    <ArrowRight size={17} />
                  </button>
                </section>
              ) : (
                <>
                  <section className="profile-card">
                    <div
                      className={`profile-avatar ${
                        avatar ? 'has-avatar' : ''
                      }`}
                    >
                      {avatar && (
                        <img
                          src={avatar}
                          alt="프로필 이미지"
                        />
                      )}
                    </div>

                    <div className="profile-details">
                      <div className="profile-name-line">
                        <h1>{nickname}</h1>

                        <button
                          className="edit-profile"
                          aria-label="프로필 수정"
                          onClick={() => setProfileOpen(true)}
                        >
                          <Pencil size={25} />
                        </button>
                      </div>

                      <p>가입일 {profileSeed.joinedAt}</p>
                    </div>

                    <button
                      className="logout-button"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  </section>

                  <section
                    className="mypage-list-card"
                    id="transaction-posts"
                  >
                    <SectionHeading
                      title={
                        allView === 'transactions'
                          ? '전체 거래 내역'
                          : '나의 거래 내역'
                      }
                      onViewAll={() => viewAll('transactions')}
                    />

                    <div className="mypage-post-list">
                      {transactions.length ? (
                        transactions.map((post) => (
                          <TransactionRow
                            key={post.id}
                            post={post}
                            openMenu={openMenu}
                            setOpenMenu={setOpenMenu}
                            onDelete={handleDelete}
                          />
                        ))
                      ) : (
                        <p className="mypage-empty">
                          등록한 거래 내역이 없습니다.
                        </p>
                      )}
                    </div>
                  </section>

                  <section
                    className="mypage-list-card favorites-card"
                    id="favorite-posts"
                  >
                    <SectionHeading
                      title={
                        allView === 'favorites'
                          ? '찜한 티켓 전체'
                          : '찜한 티켓'
                      }
                      onViewAll={() => viewAll('favorites')}
                    />

                    <div className="mypage-post-list">
                      {favorites.length ? (
                        favorites.map((post) => (
                          <FavoriteRow
                            key={post.id}
                            post={post}
                            onRemove={(id) => {
                              togglePostFavorite(id);
                              setFavorites(getFavoritePosts());
                            }}
                          />
                        ))
                      ) : (
                        <p className="mypage-empty">
                          찜한 티켓이 없습니다.
                        </p>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {profileOpen && (
        <ProfileModal
          nickname={nickname}
          avatar={avatar}
          onClose={() => setProfileOpen(false)}
          onSave={(nextName, nextAvatar) => {
            setNickname(nextName);
            setAvatar(nextAvatar);
            setProfileOpen(false);
          }}
        />
      )}
    </div>
  );
}
