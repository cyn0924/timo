import { appPath } from '../utils/paths.js';

export default function Footer() {
  return (
    <footer className="site-footer" id="support">

      {/* 브랜드 영역 */}
      <div className="footer-brand">
        <a className="brand" href={appPath('/')}>
          <img
              src={`${import.meta.env.BASE_URL}images/logo_white.png`}
              alt="TIMO"
          />
        </a>

        <p>
          티켓 거래를 모두 모아서,
          <br />
          원하는 경기의 순간을 함께합니다.
        </p>
      </div>

      {/* 푸터 메뉴 */}
      <nav className="footer-links" id="guide">
        <a href={appPath('/guide')}>이용안내</a>
        <a href={appPath('/#guide')}>거래 주의사항</a>
        <a href={appPath('/#support')}>자주 묻는 질문</a>
        <a href={appPath('/#support')}>고객센터</a>
      </nav>

      {/* 안내 및 저작권 */}
      <div className="footer-copy">
        <p>
          본 서비스는 티켓 거래 중개 플랫폼입니다.
          <br />
          안전한 거래를 위해 유의사항을 확인해 주세요.
        </p>

        <small>
          © 2026 TIMO. All rights reserved.
        </small>
      </div>

      {/* 배경 장식 */}
      <div className="footer-stripe" />

    </footer>
  );
}
