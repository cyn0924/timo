export const postDetails = {
  1: {
    author: '자신있는 매 234', joinedAt: '2026.11.10', status: '거래 가능',
    methodLabel: '현장 수령 후 양도', description: '오티, 포카 X 2만원에 양도합니다.\n당일에 티켓 검표하고 전달해 드려요.',
    perks: ['별도 특전 없음'], createdAt: '2026-11-10 15:22', isAuthor: false,
  },
  2: {
    author: '이상한 라쿤 297', joinedAt: '2026.10.24', status: '거래 가능',
    methodLabel: '현장 직거래', description: '우블 하파석을 좌블 하파석과 교환 원합니다.\n좌석 차이가 있으면 차액 조율 가능합니다.',
    perks: ['티켓 포함'], createdAt: '2026-11-10 14:08', wantedSeat: '좌블 하파석', isAuthor: false,
  },
  3: {
    author: '귀여운 늑대 876', joinedAt: '2026.09.08', status: '모집 중',
    methodLabel: '경기별 현장 정산', description: '옵챔스 3경기 중 3경기 분철 참여자를 모집합니다.\n경기 시작 전에 만나 티켓을 전달할게요.',
    perks: ['3경기 참여 모집'], createdAt: '2026-11-09 19:40', rounds: ['1경기 마감', '2경기 마감', '3경기 모집 중'], isAuthor: false,
  },
  4: { author: '응원석 수집가', joinedAt: '2026.08.12', status: '거래 대기', methodLabel: '현장 거래', description: '경기장 현장에서 안전하게 전달하겠습니다.', perks: ['별도 특전 없음'], createdAt: '2026-11-09 17:12', isAuthor: false },
  
  5: { author: '자리 교환 구해요', joinedAt: '2026.10.02', status: '거래 가능', methodLabel: '현장 직거래', description: '좌블석과 우블석 교환 원합니다. 자세한 내용은 문의 주세요.', perks: ['티켓 포함'], createdAt: '2026-11-08 20:00', wantedSeat: '우블 하파석', isAuthor: false },

  6: { author: '경기 같이 봐요', joinedAt: '2026.07.19', status: '모집 중', methodLabel: '경기별 정산', description: '경기별 참여 여부를 확인한 뒤 세부 일정 안내드릴게요.', perks: ['경기별 티켓'], rounds: ['1경기 모집 중', '2경기 모집 중', '3경기 마감'], createdAt: '2026-11-07 12:21', isAuthor: false },

  7: { author: '티켓 양도합니다', joinedAt: '2026.06.04', status: '기간 만료', methodLabel: '현장 거래', description: '경기 일정 확인 부탁드립니다.', perks: ['별도 특전 없음'], createdAt: '2026-11-06 09:12', isAuthor: false },

  8: { author: '교환 원해요', joinedAt: '2026.06.14', status: '거래 완료', methodLabel: '현장 직거래', description: '교환 완료되었습니다.', perks: ['티켓 포함'], wantedSeat: 'A구역 몇 열', createdAt: '2026-11-05 15:22', isAuthor: false },

  9: { author: '분철 참여자', joinedAt: '2026.09.24', status: '모집 마감', methodLabel: '경기별 정산', description: '모집 마감되었습니다.', perks: ['경기별 티켓'], rounds: ['1경기 마감', '2경기 마감', '3경기 마감'], createdAt: '2026-10-20 18:00', isAuthor: false },
  
  10: { author: '첫 경기 보고 싶어요', joinedAt: '2026.10.20', status: '모집 중', methodLabel: '경기별 현장 정산', description: '1경기 분철 참여를 원합니다. 좌석 정보는 문의로 알려주세요.', perks: ['1경기 참여'], rounds: ['1경기 모집 중', '2경기 마감', '3경기 마감'], createdAt: '2026-11-10 10:02', isAuthor: false },
};

export function getPostDetails(post) {
  const seeded = postDetails[post.id] || {};
  const saved = post.detail || {};
  return {
    ...seeded,
    ...saved,
    author: post.author?.nickname || saved.author || seeded.author || 'TIMO 회원',
    joinedAt: post.author?.joinedAt || saved.joinedAt || seeded.joinedAt || '2026.11.10',
    status: post.status || saved.status || seeded.status || '거래 가능',
    methodLabel: post.methodLabel || saved.methodLabel || seeded.methodLabel || post.method,
    description: post.description ?? saved.description ?? seeded.description ?? '',
    perks: post.perks?.length ? post.perks : saved.perks || seeded.perks || ['별도 특전 없음'],
    createdAt: post.createdAt || saved.createdAt || seeded.createdAt || '',
    wantedSeat: post.wantedSeat || saved.wantedSeat || seeded.wantedSeat || post.wanted || '',
    rounds: post.rounds || saved.rounds || seeded.rounds || [],
    gameRounds: post.roundDetails || saved.roundDetails || seeded.gameRounds || [],
    isAuthor: post.ownerId === 'current-user' || saved.isAuthor || seeded.isAuthor || false,
  };
}
