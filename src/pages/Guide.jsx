import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Handshake,
  HeartHandshake,
  Repeat2,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  UsersRound
} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import './Guide.css';

const howSteps = [
  {
    number: '01', title: '티켓 찾기', Icon: Search,
    lines: ['원하는 경기와 거래 유형을 선택해요.', '경기 날짜와 좌석 정보를 확인해요.', '나에게 맞는 거래 게시글을 찾아요.']
  },
  {
    number: '02', title: '거래 요청', Icon: Send,
    lines: ['게시글의 거래 조건을 확인해요.', '거래 요청 버튼을 눌러 상대방에게 요청해요.', '상대방의 요청 확인과 수락을 기다려요.']
  },
  {
    number: '03', title: '거래 완료', Icon: CheckCircle2,
    lines: ['티켓 전달과 금액 송금을 진행해요.', '거래가 끝나면 각자 완료 버튼을 눌러요.', '양쪽 모두 눌러야 최종 완료 처리돼요.']
  }
];

const tradeTypes = [
  {
    number: '01', english: 'TRANSFER', title: '티켓 양도', Icon: Ticket,
    description: '더 이상 관람하기 어려운 티켓을 다른 팬에게 양도하는 거래예요.',
    points: ['원하는 경기의 티켓을 등록할 수 있어요.', '티켓 가격과 좌석 정보를 확인할 수 있어요.', '오리지널 티켓, 포토카드 등 포함 여부를 확인할 수 있어요.']
  },
  {
    number: '02', english: 'EXCHANGE', title: '좌석 교환', Icon: Repeat2,
    description: '내가 가진 좌석과 다른 팬이 가진 좌석을 서로 교환하는 거래예요.',
    points: ['원하는 교환 좌석 조건을 등록할 수 있어요.', '서로의 좌석 위치와 티켓 조건을 비교할 수 있어요.', '좌석 차이에 따른 추가금 협의 여부를 확인할 수 있어요.']
  },
  {
    number: '03', english: 'SPLIT', title: '티켓 분철', Icon: UsersRound,
    description: '하루에 진행되는 여러 경기의 티켓을 경기별로 나누어 거래하는 방식이에요.',
    points: ['하루 전체 티켓을 경기별로 나누어 거래할 수 있어요.', '원하는 경기만 선택해서 참여할 수 있어요.', '다른 팬들과 경기별 티켓을 나누어 관람할 수 있어요.']
  }
];

const tradeFlow = [
  ['거래 요청', '구매 또는 교환을 원하는 사용자가 거래 요청을 보냅니다.'],
  ['요청 수락', '게시글 작성자가 거래 요청을 확인하고 수락합니다.'],
  ['개별 거래 진행', '거래 당사자끼리 티켓 전달 방법과 금액을 협의합니다.'],
  ['거래 완료 확인', '양쪽 사용자가 각각 거래 완료 버튼을 누릅니다.'],
  ['최종 완료', '양쪽 모두 완료 버튼을 눌렀을 때 거래 완료 상태로 변경됩니다.']
];

const safetyGroups = [
  { title: '티켓 정보 확인', Icon: CalendarDays, lines: ['경기 날짜와 경기 회차가 맞는지 확인해 주세요.', '좌석 구역과 열, 번호를 꼼꼼하게 확인해 주세요.', '하루 전체 티켓인지 특정 경기 티켓인지 확인해 주세요.'] },
  { title: '거래 조건 확인', Icon: BadgeCheck, lines: ['양도 금액 또는 교환 조건을 확인해 주세요.', '추가금 발생 여부와 협의 가능 여부를 확인해 주세요.', '오리지널 티켓, 포토카드 등 포함 항목을 확인해 주세요.'] },
  { title: '거래 상대 확인', Icon: ShieldAlert, lines: ['티켓 소지 여부를 확인할 수 있는 자료를 요청해 주세요.', '개인정보나 불필요한 인증 정보는 공유하지 마세요.', '의심스러운 거래 게시글은 신고 기능을 이용해 주세요.'] }
];

const policies = [
  { number: '01', title: '금액 전달 방식', Icon: Handshake, lines: ['TIMO는 거래 금액을 직접 중개하지 않아요.', '거래 금액의 송금은 거래 당사자 간 별도로 진행해 주세요.'] },
  { number: '02', title: '거래 완료 기준', Icon: CheckCircle2, lines: ['거래 당사자 양쪽 모두 거래 완료 버튼을 눌러야 최종 완료 처리돼요.', '한쪽만 완료 버튼을 누른 경우에는 상대방 확인 대기 상태로 표시돼요.'] },
  { number: '03', title: '신고 및 관리', Icon: ShieldCheck, lines: ['의심스러운 게시글이나 이용자를 발견하면 신고해 주세요.', '신고된 내용은 관리자가 확인한 후 필요한 조치를 진행해요.'] },
  { number: '04', title: '게시글 자동 삭제', Icon: Clock3, lines: ['경기 날짜가 지난 게시글은 7일간 보관돼요.', '보관 기간이 지나면 게시글은 자동으로 삭제돼요.'] }
];

function CheckList({ lines }) {
  return <ul className="guide-check-list">{lines.map(line => <li key={line}><Check size={16} aria-hidden="true" />{line}</li>)}</ul>;
}

function SectionIntro({ eyebrow, title, description }) {
  return <div className="guide-section-intro"><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span></div>;
}

export default function Guide() {
  return (
    <div className="guide-page">
      <Header />
      <main>
        <section className="guide-hero">
          <div className="guide-hero-inner">
            <p className="guide-eyebrow">GUIDE</p>
            <h1>TIMO 이용 안내</h1>
            <p>티켓 거래부터 경기별 분철까지,<br />TIMO를 더 쉽고 편리하게 이용하는 방법을 알아보세요.</p>
          </div>
        </section>

        <section className="guide-section guide-how" id="how-it-works">
          <div className="guide-wrap">
            <SectionIntro eyebrow="HOW TIMO WORKS" title="티켓 거래, 어렵지 않아요!" description="처음 이용하는 팬도 쉽게 따라 할 수 있는 TIMO 이용 방법을 소개합니다." />
            <div className="guide-how-grid">
              {howSteps.map(({ number, title, Icon, lines }) => (
                <article className="guide-step-card" key={number}>
                  <div className="guide-step-top"><span>{number}</span><Icon size={25} /></div>
                  <h3>{title}</h3>
                  <CheckList lines={lines} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="guide-section guide-types">
          <div className="guide-wrap">
            <SectionIntro eyebrow="TIMO TRADE TYPES" title="TIMO의 세 가지 거래 유형" description="나에게 필요한 거래 방식을 선택해 보세요." />
            <div className="guide-type-grid">
              {tradeTypes.map(({ number, english, title, Icon, description, points }) => (
                <article className="guide-type-card" key={english}>
                  <div className="guide-type-symbol"><Icon size={25} /></div>
                  <p className="guide-card-kicker">{number} · {english}</p>
                  <h3>{title}</h3>
                  <p className="guide-card-description">{description}</p>
                  <CheckList lines={points} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="guide-section guide-flow-section">
          <div className="guide-wrap">
            <SectionIntro eyebrow="TRADE FLOW" title="거래는 이렇게 진행돼요." description="요청부터 최종 완료까지, 두 사용자의 확인을 거쳐 안전하게 진행해요." />
            <div className="guide-flow-grid">
              {tradeFlow.map(([title, description], index) => (
                <article className="guide-flow-step" key={title}>
                  <span className="guide-flow-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="guide-confirm-panel">
              <div className="guide-confirm-icon"><HeartHandshake size={25} /></div>
              <div><strong>양쪽 모두 확인해야 거래가 완료돼요</strong><p>한쪽 사용자만 완료 버튼을 누르면 ‘상대방 확인 대기’ 상태로 표시됩니다.</p></div>
              <div className="guide-confirm-users"><span><Check size={15} />나</span><span><Check size={15} />상대방</span><b>최종 완료</b></div>
            </div>
          </div>
        </section>

        <section className="guide-section guide-safety">
          <div className="guide-wrap">
            <SectionIntro eyebrow="SAFE TRADE" title="안전한 거래를 위해 꼭 확인해 주세요!" description="거래 전 정보를 꼼꼼히 확인하고, 의심스러운 상황에서는 신고 기능을 이용해 주세요." />
            <div className="guide-safety-grid">
              {safetyGroups.map(({ title, Icon, lines }) => (
                <article className="guide-safety-card" key={title}><div className="guide-card-title-icon"><Icon size={20} /></div><h3>{title}</h3><CheckList lines={lines} /></article>
              ))}
            </div>
          </div>
        </section>

        <section className="guide-section guide-policy">
          <div className="guide-wrap">
            <SectionIntro eyebrow="TIMO POLICY" title="TIMO 이용 정책" description="모두가 안심하고 이용할 수 있도록 거래 전 정책을 확인해 주세요." />
            <div className="guide-policy-grid">
              {policies.map(({ number, title, Icon, lines }) => (
                <article className="guide-policy-card" key={number}><div className="guide-policy-top"><span>{number}</span><Icon size={21} /></div><h3>{title}</h3>{lines.map(line => <p key={line}>{line}</p>)}</article>
              ))}
            </div>
          </div>
        </section>

        <section className="guide-cta">
          <div><p className="guide-eyebrow">SEE YOU AT THE MATCH</p><h2>좋아하는 경기를 더 편하게, TIMO와 함께!</h2><p>티켓 거래부터 경기별 분철까지,<br />e스포츠 팬들을 위한 티켓 거래 모음 TIMO입니다.</p></div>
          <a href="/#market">거래 게시글 둘러보기 <ArrowRight size={19} /></a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
