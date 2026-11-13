import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

function getReturnPath() {
  const requested = new URLSearchParams(window.location.search).get('returnTo');
  if (!requested || !requested.startsWith('/') || requested.startsWith('//') || requested === '/login') return '/';
  return requested;
}

export default function Login() {
  const { user, loginWithTestAccount } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [socialNotice, setSocialNotice] = useState('');

  if (user) {
    window.location.replace(getReturnPath());
    return null;
  }

  const submit = event => {
    event.preventDefault();
    if (!id.trim() || !password) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }
    if (!loginWithTestAccount(id.trim(), password)) {
      setError('아이디 또는 비밀번호를 다시 확인해 주세요.');
      return;
    }
    window.location.assign(getReturnPath());
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <div className="login-decoration" aria-hidden="true" />
        <section className="login-card">
          <a className="login-logo" href="/" aria-label="TIMO 홈">
            <img src="/images/logo.png" alt="TIMO" />
          </a>
          <p className="login-eyebrow">WELCOME BACK TO TIMO</p>
          <h1>다시 만나서 반가워요!</h1>
          <p className="login-subtitle">TIMO에서 원하는 티켓 거래를 시작해 보세요.</p>

          <div className="social-login-buttons">
            <button className="social-login kakao-login" type="button" onClick={() => setSocialNotice('카카오 OAuth 서버 연동 후 이용할 수 있습니다. 테스트 계정으로 로그인해 주세요.')}>
              <MessageCircle size={19} fill="currentColor" />카카오톡으로 로그인
            </button>
            <button className="social-login naver-login" type="button" onClick={() => setSocialNotice('네이버 OAuth 서버 연동 후 이용할 수 있습니다. 테스트 계정으로 로그인해 주세요.')}>
              <span className="naver-mark">N</span>네이버로 시작하기
            </button>
          </div>
          {socialNotice && <p className="login-feedback" role="status">{socialNotice}</p>}

          <div className="login-divider"><span>테스트 계정으로 로그인</span></div>
          <form className="test-login-form" onSubmit={submit} noValidate>
            <label htmlFor="login-id">아이디</label>
            <input id="login-id" autoComplete="username" value={id} onChange={event => { setId(event.target.value); setError(''); }} placeholder="아이디를 입력해 주세요" />
            <label htmlFor="login-password">비밀번호</label>
            <div className="password-field">
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder="비밀번호를 입력해 주세요" />
              <button type="button" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
            </div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="test-login-submit" type="submit">로그인</button>
          </form>

          <div className="test-account-hint">
            <LockKeyhole size={17} />
            <span>테스트 ID <b>test1234</b> · PW <b>test1234@</b></span>
          </div>
          <p className="login-legal"><ShieldCheck size={15} />테스트 계정은 화면 기능 확인을 위한 데모용이며, 카카오·네이버 로그인은 OAuth 서버 연동 후 제공됩니다.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
