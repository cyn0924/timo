
import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Ticket,
  Repeat2,
  UsersRound,
} from 'lucide-react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 거래 유형별 아이콘
const TRADE_ICONS = {
  양도: Ticket,
  교환: Repeat2,
  분철: UsersRound,
};

// 거래 유형 목록
const TRADE_TYPES = ['양도', '교환', '분철'];

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// 월 표시 형식
const formatMonth = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase();
};

export default function CalendarPanel({
  selectedDate,
  onSelect,
  month,
  setMonth,
  onViewDate,
  posts,
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // 선택한 달의 날짜 목록 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();

    const emptyDays = Array(firstDay).fill(null);
    const days = Array.from(
      { length: lastDate },
      (_, index) => index + 1
    );

    return [...emptyDays, ...days];
  }, [year, monthIndex]);

  // 게시글이 등록된 날짜를 Set으로 관리
  const postDates = useMemo(() => {
    return new Set(posts.map((post) => post.date));
  }, [posts]);

  // 선택한 날짜의 거래 유형별 게시글 수 계산
  const tradeCounts = useMemo(() => {
    return TRADE_TYPES.map((type) =>
      posts.filter(
        (post) =>
          post.date === selectedDate &&
          post.type === type
      ).length
    );
  }, [posts, selectedDate]);

  // 선택한 날짜 정보
  const selected = new Date(`${selectedDate}T00:00:00`);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setMonth(new Date(year, monthIndex - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setMonth(new Date(year, monthIndex + 1, 1));
  };

  // 날짜 버튼
  const renderCalendarDay = (day, index) => {
    if (!day) {
      return (
        <span
          className="day-empty"
          key={`empty-${index}`}
        />
      );
    }

    const dateKey = formatDateKey(year, monthIndex, day);
    const isSelected = dateKey === selectedDate;
    const hasPosts = postDates.has(dateKey);

    return (
      <button
        key={dateKey}
        className={`day ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(dateKey)}
        aria-pressed={isSelected}
        aria-label={`${monthIndex + 1}월 ${day}일`}
      >
        {day}
        {hasPosts && <i />}
      </button>
    );
  };

  return (
    <section
      className="match-section"
      aria-labelledby="match-title"
    >
      {/* 섹션 제목 */}
      <div className="section-heading">
        <div>
          <p className="section-kicker">
            FIND IT BY DATE
          </p>

          <h2 id="match-title">MATCH DAY</h2>

          <p>
            날짜를 선택하고 거래 현황을 확인하세요.
          </p>
        </div>

        <div className="month-pill">
          {formatMonth(month)}
        </div>
      </div>

      {/* 달력 및 거래 현황 */}
      <div className="match-layout">

        {/* 달력 */}
        <div className="calendar-card">
          <div className="calendar-top">
            <button
              aria-label="이전 달"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft />
            </button>

            <strong>
              {year}. {String(monthIndex + 1).padStart(2, '0')}
            </strong>

            <button
              aria-label="다음 달"
              onClick={goToNextMonth}
            >
              <ChevronRight />
            </button>
          </div>

          <div className="calendar-grid">
            {WEEKDAYS.map((weekday) => (
              <span
                className="weekday"
                key={weekday}
              >
                {weekday}
              </span>
            ))}

            {calendarDays.map((day, index) =>
              renderCalendarDay(day, index)
            )}
          </div>
        </div>

        {/* 선택 날짜의 거래 현황 */}
        <div className="day-summary">
          <div className="summary-label">
            {selected.getMonth() + 1}월 {selected.getDate()}일
            <span> 거래 현황</span>
          </div>

          <div className="count-cards">
            {TRADE_TYPES.map((type, index) => {
              const Icon = TRADE_ICONS[type];

              return (
                <div
                  className={`count-card count-${index}`}
                  key={type}
                >
                  <div className="count-top">
                    {type}

                    <span>
                      <Icon size={21} />
                    </span>
                  </div>

                  <strong>
                    {String(tradeCounts[index]).padStart(2, '0')}
                  </strong>

                  <small>게시글</small>
                </div>
              );
            })}
          </div>

          <button
            className="summary-cta"
            onClick={onViewDate}
          >
            해당 날짜 거래 보기
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}
