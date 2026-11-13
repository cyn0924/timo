import { ArrowRight } from 'lucide-react';
export default function Hero({ onBrowse, onPost }) {
  const markImageMissing = ({ currentTarget }) => {
    currentTarget.hidden = true;
    currentTarget.parentElement?.classList.add('image-empty');
  };

  const markImageLoaded = ({ currentTarget }) => {
    currentTarget.hidden = false;
    currentTarget.parentElement?.classList.remove('image-empty');
  };

  return (
    <section className="hero" id="top">
      {/* 메인 이미지 */}
      <div className="hero-art">
        <div className="hero-image-frame image-empty">
          <img
            className="hero-character"
            src={`${import.meta.env.BASE_URL}images/header_image.png`}
            alt="TIMO 메인 비주얼"
            onLoad={markImageLoaded}
            onError={markImageMissing}
          />
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="hero-lines" />

      {/* 메인 카피 */}
      <div className="hero-copy">
        <h1>FIND YOUR MATCH</h1>
        <h2>티켓 거래를 모두 모아서,</h2>

        <p className="hero-description">
          양도부터 좌석 교환, 경기별 분철까지.
          <br />
          원하는 티켓 거래를 TIMO에서 편하게 찾아보세요.
        </p>

        <div className="hero-buttons">
          <button className="button-dark" onClick={onBrowse}>
            거래 둘러보기
            <ArrowRight size={20} />
          </button>

          <button className="button-light" onClick={onPost}>
            게시글 작성하기
          </button>
        </div>
      </div>

      <div className="hero-bottom">
        TIMO TICKET MARKET
      </div>
    </section>
  );
}