import { postDetails } from './postDetails.js';

const transferPerks = ['포토카드', '오리지널 티켓', '젬 쿠폰'];

function hasPerk(post, name) {
  const perks = post.perks ?? post.detail?.perks ?? postDetails[post.id]?.perks;
  return Array.isArray(perks) && perks.includes(name);
}

function canPayDifference(post) {
  const value = post.difference ?? post.detail?.difference ?? postDetails[post.id]?.difference;
  if (value === 'allowed' || value === true) return true;
  if (value === 'none' || value === false) return false;

  // Older seed posts kept this option only in the method label.
  return /차액\s*지불\s*가능/.test(post.method || '');
}

function isRoundRecruiting(post, roundNumber) {
  const details = post.roundDetails ?? post.detail?.roundDetails ?? post.detail?.gameRounds;
  const detail = Array.isArray(details)
    ? details.find((item) => Number(item.index) === roundNumber || item.name === `${roundNumber}경기`)
    : null;

  if (detail) return detail.recruit === true;

  const labelSources = [
    post.rounds,
    post.detail?.rounds,
    postDetails[post.id]?.rounds,
  ];

  for (const labels of labelSources) {
    if (!Array.isArray(labels)) continue;
    const label = labels.find((item) =>
      String(item).startsWith(`${roundNumber}경기`) &&
      /모집|미모집|마감|본인 관람/.test(String(item))
    );
    if (label) return /모집\s*중|모집 가능/.test(String(label));
  }

  // A bare legacy label such as "1경기" has no recruiting state.
  return false;
}

export function getPostOptions(post) {
  if (post.type === '양도') {
    return transferPerks.map((label) => ({ label, checked: hasPerk(post, label) }));
  }

  if (post.type === '교환') {
    const checked = canPayDifference(post);
    return [{ label: checked ? '차액 지불 가능' : '차액 지불 불가', checked }];
  }

  if (post.type === '분철') {
    return [1, 2, 3].map((round) => ({
      label: `${round}경기`,
      checked: isRoundRecruiting(post, round),
    }));
  }

  return [];
}
