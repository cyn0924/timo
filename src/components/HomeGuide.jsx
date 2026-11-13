import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Repeat2,
  Search,
  Send,
  Ticket,
  UsersRound
} from 'lucide-react';
import './HomeGuide.css';
import { appPath } from '../utils/paths.js';

const steps = [
  { number: '01', title: '티켓 찾기', Icon: Search, lines: ['원하는 경기와 거래 유형을 선택해요.', '경기 날짜와 좌석 정보를 확인해요.'] },
  { number: '02', title: '거래 요청', Icon: Send, lines: ['마음에 드는 게시글을 선택해요.', '거래 조건을 확인하고 요청해요.'] },
  { number: '03', title: '거래 완료', Icon: CheckCircle2, lines: ['상대방과 티켓 전달 및 송금을 진행해요.', '서로 거래 완료를 눌러 마무리해요.'] }
];

const types = [
  { title: '티켓 양도', name: 'TRANSFER', text: '더 이상 관람하기 어려운 티켓을 다른 팬에게 양도해요.', Icon: Ticket, color: 'transfer' },
  { title: '좌석 교환', name: 'EXCHANGE', text: '내가 가진 좌석과 원하는 좌석을 서로 교환해요.', Icon: Repeat2, color: 'exchange' },
  { title: '티켓 분철', name: 'SPLIT', text: '하루 전체 티켓을 경기별로 나누어 거래해요.', Icon: UsersRound, color: 'split' }
];

export default function HomeGuide() {
  return (
    <section className="home-guide" aria-labelledby="home-guide-title">
      <div className="home-guide-inner">
        <header className="home-guide-heading">
          <div>
            <p className="home-guide-kicker">HOW TIMO WORKS</p>
            <h2 id="home-guide-title">티켓 거래, 어렵지 않아요!</h2>
            <p className="home-guide-intro">처음 이용하는 팬도 쉽게 따라 할 수 있는 TIMO 이용 방법을 소개합니다.</p>
          </div>
        </header>

        <div className="home-guide-steps">
          {steps.map(({ number, title, Icon, lines }, index) => (
            <article className="home-guide-step" key={number}>
              <div className="home-guide-step-head"><span>{number}</span><Icon size={23} /></div>
              <h3>{title}</h3>
              <p>{lines[0]}<br />{lines[1]}</p>
              {index < steps.length - 1 && <span className="home-guide-arrow" aria-hidden="true"><ChevronRight size={19} /></span>}
            </article>
          ))}
        </div>

        <div className="home-guide-types-heading"><h3>TIMO에서 만나는 세 가지 거래</h3></div>
        <div className="home-guide-types">
          {types.map(({ title, name, text, Icon, color }) => (
            <article className={`home-guide-type ${color}`} key={name}>
              <span className="home-guide-type-icon"><Icon size={20} /></span>
              <div><p>{name}</p><h4>{title}</h4><span>{text}</span></div>
            </article>
          ))}
        </div>

        <a className="home-guide-link" href={appPath('/guide')}>TIMO 이용 방법 자세히 보기 <ArrowRight size={18} /></a>
      </div>
    </section>
  );
}
