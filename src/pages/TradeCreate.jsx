
import { useRef, useState } from 'react';

import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  HeartHandshake,
  House,
  Pencil,
  Plus,
  Repeat2,
  Ticket,
  Trash2,
  UploadCloud,
  UsersRound,
  X,
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { createPost } from '../data/postStore.js';

import './TradeCreate.css';

const maxImages = 1;
const maxBytes = 10 * 1024 * 1024;

const regions = ['A구역', 'B구역'];

const rows = [
  'A열',
  'B열',
  'C열',
  'D열',
  'E열',
  'F열',
  'G열',
  'H열',
  'I열',
  'J열',
  'K열',
  'L열',
  'M열',
  'N열',
  'O열',
  'P열',
  'Q열',
  'R열',
  'S열',
];

const methods = ['현장 거래', '기타'];

const types = [
  {
    key: '양도',
    caption: '티켓을 양도해요.',
    Icon: Ticket,
  },
  {
    key: '교환',
    caption: '자리를 교환해요.',
    Icon: Repeat2,
  },
  {
    key: '분철',
    caption: '경기별로 나눠요.',
    Icon: UsersRound,
  },
];

const todayString = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const localStamp = () => {
  const date = new Date();
  const pad = (number) => String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

const makeGame = (index) => ({
  name: `${index + 1}경기`,
  attend: index === 0,
  recruit: index !== 0,
  amount: '',
});

function Section({ title, hint, required, className = '', children }) {
  return (
    <section className={`create-section ${className}`}>
      <div className="create-section-label">
        <h2>
          {title}
          {required && <b>＊</b>}
        </h2>

        {hint && <p>{hint}</p>}
      </div>

      <div className="create-section-body">{children}</div>
    </section>
  );
}

function Field({ label, error, className = '', children }) {
  return (
    <label
      className={`create-field ${className} ${
        error ? 'has-error' : ''
      }`}
    >
      <span>{label}</span>

      {children}

      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function ImageModal({ onStay, onDiscard }) {
  return (
    <div className="discard-backdrop" role="presentation">
      <section
        className="discard-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
      >
        <h2 id="discard-title">작성 중인 내용을 취소할까요?</h2>

        <p>입력한 거래 정보는 저장되지 않습니다.</p>

        <div>
          <button onClick={onStay}>계속 작성</button>

          <button
            className="discard-confirm"
            onClick={onDiscard}
          >
            취소하기
          </button>
        </div>
      </section>
    </div>
  );
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('이미지를 읽지 못했습니다.'));
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        reject(new Error('이미지 파일을 처리하지 못했습니다.'));
      };

      image.onload = () => {
        const scale = Math.min(
          1,
          1000 / Math.max(image.width, image.height)
        );

        const canvas = document.createElement('canvas');

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.68));
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

export default function TradeCreate() {
  const [type, setType] = useState('양도');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-18');

  const [region, setRegion] = useState('');
  const [seatRow, setSeatRow] = useState('');
  const [manualRow, setManualRow] = useState('');

  const [price, setPrice] = useState('');
  const [method, setMethod] = useState('현장 거래');
  const [perks, setPerks] = useState([]);

  const [wantedRegion, setWantedRegion] = useState('');
  const [wantedRow, setWantedRow] = useState('');
  const [wantedManualRow, setWantedManualRow] = useState('');
  const [wantedDescription, setWantedDescription] = useState('');

  const [difference, setDifference] = useState('none');
  const [differenceAmount, setDifferenceAmount] = useState('');

  const [gameCount, setGameCount] = useState(3);
  const [games, setGames] = useState([
    makeGame(0),
    makeGame(1),
    makeGame(2),
  ]);

  const [description, setDescription] = useState('');

  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const fileInput = useRef(null);

  // 입력값 변경 처리
  const setField = (setter, key) => (event) => {
    setter(event.target.value);
    setDirty(true);

    setErrors((previous) => ({
      ...previous,
      [key]: '',
    }));
  };

  // 분철 경기 수 변경
  const handleCount = (event) => {
    const nextCount = Number(event.target.value);

    setGameCount(nextCount);

    setGames((current) =>
      Array.from(
        { length: nextCount },
        (_, index) => current[index] || makeGame(index)
      )
    );

    setDirty(true);
  };

  // 분철 경기 정보 변경
  const updateGame = (index, key, value) => {
    setGames((current) =>
      current.map((game, gameIndex) =>
        gameIndex === index
          ? {
              ...game,
              [key]: value,
              ...(key === 'attend' && value
                ? { recruit: false }
                : {}),
              ...(key === 'recruit' && value
                ? { attend: false }
                : {}),
            }
          : game
      )
    );

    setDirty(true);

    setErrors((previous) => ({
      ...previous,
      games: '',
    }));
  };

  // 이미지 첨부
  const addFiles = (fileList) => {
    const incoming = [...fileList];

    if (!incoming.length) return;

    if (incoming.length > maxImages) {
      setFormError('이미지는 한 장만 첨부할 수 있습니다.');
      return;
    }

    const valid = [];

    for (const file of incoming) {
      const validType =
        ['image/jpeg', 'image/png'].includes(file.type) ||
        /\.(jpe?g|png)$/i.test(file.name);

      if (!validType) {
        setFormError('JPG 또는 PNG 이미지만 첨부할 수 있습니다.');
        continue;
      }

      if (file.size > maxBytes) {
        setFormError(
          `${file.name}: 파일 크기는 10MB 이하여야 합니다.`
        );
        continue;
      }

      valid.push(file);
    }

    if (!valid.length) return;

    if (images.length + valid.length > maxImages) {
      setFormError('첨부한 이미지를 삭제한 뒤 다른 사진으로 교체해주세요.');
      return;
    }

    setFormError('');

    setImages((current) => [
      ...current,
      ...valid.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    setDirty(true);
  };

  // 이미지 삭제
  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);

    setImages((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );

    setCoverIndex((current) =>
      current === index
        ? 0
        : current > index
          ? current - 1
          : current
    );

    setDirty(true);
  };

  // 작성 취소
  const cancel = () => {
    if (dirty) {
      setDiscardOpen(true);
    } else {
      window.location.href = '/#market';
    }
  };

  const abandon = () => {
    setDiscardOpen(false);
    window.location.href = '/#market';
  };

  // 입력값 검증
  const validate = () => {
    const next = {};

    if (!title.trim()) {
      next.title = '게시글 제목을 입력해주세요.';
    }

    if (!date || date < todayString()) {
      next.date = '오늘 이후의 경기 날짜를 선택해주세요.';
    }

    if (!region) {
      next.region = '좌석 구역을 선택해주세요.';
    }

    if (
      !(seatRow === '직접 입력' ? manualRow.trim() : seatRow)
    ) {
      next.seatRow = '좌석 열을 입력해주세요.';
    }

    if (type === '양도') {
      if (price === '' || Number(price) < 0) {
        next.price = '판매 가격을 입력해주세요.';
      }
    }

    if (type === '교환') {
      if (!wantedRegion) {
        next.wantedRegion = '희망 구역을 선택해주세요.';
      }

      if (
        !(
          wantedRow === '직접 입력'
            ? wantedManualRow.trim()
            : wantedRow
        )
      ) {
        next.wantedRow = '희망 좌석 열을 입력해주세요.';
      }
    }

    if (type === '분철') {
      if (!games.some((game) => game.attend)) {
        next.games = '본인이 관람할 경기를 하나 이상 선택해주세요.';
      }

      if (!games.some((game) => game.recruit)) {
        next.games = '모집할 경기를 하나 이상 선택해주세요.';
      }

      if (
        games.some(
          (game) =>
            game.recruit &&
            (!game.amount || Number(game.amount) < 0)
        )
      ) {
        next.games = '모집 경기의 분담금을 입력해주세요.';
      }
    }

    setErrors(next);

    const firstError = Object.keys(next)[0];

    if (firstError) {
      document
        .querySelector(`[data-error="${firstError}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }

    return Object.keys(next).length === 0;
  };

  // 게시글 등록
  const submit = async (event) => {
    event.preventDefault();

    setFormError('');

    if (!validate()) return;

    setBusy(true);

    try {
      const imageData = await Promise.all(
        images.map(({ file }) => compressImage(file))
      );

      const createdAt = localStamp();

      const rowValue =
        seatRow === '직접 입력' ? manualRow.trim() : seatRow;

      const seat = `${region} ${rowValue}`;

      const methodValue =
        type === '교환'
          ? difference === 'allowed'
            ? `차액 지불 가능${
                differenceAmount
                  ? ` · ${Number(
                      differenceAmount
                    ).toLocaleString()}원`
                  : ' · 협의'
              }`
            : '차액 없이 교환'
          : type === '분철'
            ? '경기별 참여 모집'
            : method;

      const wantedSeat =
        type === '교환'
          ? `${wantedRegion} ${
              wantedRow === '직접 입력'
                ? wantedManualRow.trim()
                : wantedRow
            }`
          : '';

      const roundDetails =
        type === '분철'
          ? games.map((game, index) => ({
              index: index + 1,
              name: `${index + 1}경기`,
              attend: game.attend,
              recruit: game.recruit,
              amount: game.recruit
                ? Number(game.amount || 0)
                : 0,
            }))
          : [];

      const roundLabels = roundDetails.map(
        (game) =>
          `${game.name} ${
            game.attend
              ? '본인 관람'
              : game.recruit
                ? '모집 중'
                : '미모집'
          }`
      );

      const firstContribution =
        roundDetails.find((game) => game.recruit)?.amount || 0;

      const generatedTitle = title.trim();

      const stored = createPost({
        type,
        title: generatedTitle,
        date,
        seat,
        seatRegion: region,
        seatRow: rowValue,

        method: methodValue,

        methodLabel:
          type === '양도'
            ? method
            : type === '교환'
              ? `${method} · ${methodValue}`
              : '경기별 현장 정산',

        price:
          type === '양도'
            ? Number(price)
            : type === '분철'
              ? firstContribution
              : undefined,

        wanted: type === '교환' ? wantedSeat : undefined,
        wantedSeat,

        wantedDescription:
          type === '교환' ? wantedDescription.trim() : '',

        difference:
          type === '교환' ? difference : undefined,

        differenceAmount:
          type === '교환' &&
          difference === 'allowed' &&
          differenceAmount
            ? Number(differenceAmount)
            : undefined,

        perks: type === '양도' ? perks : [],

        rounds: type === '분철' ? roundLabels : undefined,

        roundDetails:
          roundDetails.length ? roundDetails : undefined,

        images: imageData,
        coverIndex,

        image: imageData.length
          ? 'upload'
          : type === '교환'
            ? 'logo'
            : type === '분철'
              ? 'crowd'
              : 'arena',

        description: description.trim(),
        createdAt,
        ownerId: 'current-user',

        author: {
          id: 'current-user',
          nickname: '이상한 라쿤 123',
          joinedAt: '2026.11.10',
        },

        status: type === '분철' ? '모집 중' : '거래 가능',
        comments: 0,
        likes: 0,

        detail: {
          author: '이상한 라쿤 123',
          joinedAt: '2026.11.10',
          status: type === '분철' ? '모집 중' : '거래 가능',

          methodLabel:
            type === '양도'
              ? method
              : type === '교환'
                ? `${method} · ${methodValue}`
                : '경기별 현장 정산',

          description: description.trim(),

          perks:
            type === '양도' && perks.length
              ? perks
              : ['별도 특전 없음'],

          createdAt,
          wantedSeat,
          wantedDescription: wantedDescription.trim(),
          difference,

          differenceAmount: differenceAmount
            ? Number(differenceAmount)
            : undefined,

          rounds: roundLabels,
          roundDetails,
        },
      });

      window.alert('거래 게시글이 등록되었습니다.');
      window.location.href = `/post/${stored.id}`;
    } catch (error) {
      console.error(error);

      setFormError(
        '게시글 저장에 실패했습니다. 이미지 용량을 줄이거나 다시 시도해주세요.'
      );

      setBusy(false);
    }
  };

  return (
    <div className="trade-create-page">
      <Header
        onPost={() => {
          window.location.href = '/post/new';
        }}
      />

      <div className="trade-breadcrumb-band">
        <div className="trade-breadcrumb-pattern" />

        <nav aria-label="현재 위치">
          <House size={19} />

          <a href="/">홈</a>

          <ChevronRight size={16} />

          <a href="/#market">티켓 거래</a>

          <ChevronRight size={16} />

          <span>거래글 등록하기</span>
        </nav>
      </div>

      <main className="trade-create-main">
        <form
          className="trade-create-card"
          onChange={() => setDirty(true)}
          onSubmit={submit}
        >
          <header className="trade-create-heading">
            <Pencil size={34} />

            <div>
              <h1>거래 등록하기</h1>
              <p>티켓 거래 정보를 입력하고, 판매를 시작하세요.</p>
            </div>
          </header>

          {/* 거래 유형 */}
          <Section
            title="거래 유형"
            hint={
              <>
                등록할 거래 종류를
                <br />
                선택해주세요.
              </>
            }
            required
          >
            <div className="trade-type-options">
              {types.map(({ key, caption, Icon }) => (
                <button
                  type="button"
                  key={key}
                  className={`trade-type-option ${
                    type === key ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setType(key);
                    setErrors({});
                    setDirty(true);
                  }}
                >
                  <span className="trade-type-icon">
                    <Icon size={24} />
                  </span>

                  <span className="trade-type-copy">
                    <b>{key}</b>
                    <small>{caption}</small>
                  </span>

                  {type === key && (
                    <i>
                      <Check size={14} />
                    </i>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* 경기 정보 */}
          <Section
            title="경기 정보"
            hint={
              <>
                경기 날짜와 좌석을
                <br />
                입력해주세요.
              </>
            }
            required
          >
            <div className="game-info-fields">
              <Field label="날짜 선택" error={errors.date}>
                <div className="input-with-icon">
                  <CalendarDays size={17} />

                  <input
                    data-error="date"
                    type="date"
                    value={date}
                    min={todayString()}
                    onChange={setField(setDate, 'date')}
                  />
                </div>
              </Field>

              <Field label="좌석 구역" error={errors.region}>
                <select
                  data-error="region"
                  value={region}
                  onChange={setField(setRegion, 'region')}
                >
                  <option value="">구역 선택</option>

                  {regions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="열" error={errors.seatRow}>
                <select
                  data-error="seatRow"
                  value={seatRow}
                  onChange={setField(setSeatRow, 'seatRow')}
                >
                  <option value="">-- 열</option>

                  {rows.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                {seatRow === '직접 입력' && (
                  <input
                    className="manual-row-input"
                    value={manualRow}
                    onChange={setField(setManualRow, 'seatRow')}
                    placeholder="좌석 열 직접 입력"
                  />
                )}
              </Field>
            </div>

            {/* 교환 희망 좌석 */}
            {type === '교환' && (
              <div className="exchange-fields">
                <h3>희망 좌석</h3>

                <div className="exchange-seat-fields">
                  <Field
                    label="희망 구역"
                    error={errors.wantedRegion}
                  >
                    <select
                      data-error="wantedRegion"
                      value={wantedRegion}
                      onChange={setField(
                        setWantedRegion,
                        'wantedRegion'
                      )}
                    >
                      <option value="">구역 선택</option>

                      {regions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="희망 열"
                    error={errors.wantedRow}
                  >
                    <select
                      data-error="wantedRow"
                      value={wantedRow}
                      onChange={setField(
                        setWantedRow,
                        'wantedRow'
                      )}
                    >
                      <option value="">-- 열</option>

                      {rows.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>

                    {wantedRow === '직접 입력' && (
                      <input
                        className="manual-row-input"
                        value={wantedManualRow}
                        onChange={setField(
                          setWantedManualRow,
                          'wantedRow'
                        )}
                        placeholder="희망 열 직접 입력"
                      />
                    )}
                  </Field>

                  <Field label="희망 좌석 추가 설명">
                    <input
                      value={wantedDescription}
                      onChange={setField(
                        setWantedDescription,
                        'wantedDescription'
                      )}
                      placeholder="예: 우블 하파석"
                    />
                  </Field>
                </div>

                <div className="difference-options">
                  <span>차액 조건</span>

                  <label>
                    <input
                      type="radio"
                      name="difference"
                      checked={difference === 'allowed'}
                      onChange={() => {
                        setDifference('allowed');
                        setDirty(true);
                      }}
                    />
                    차액 지불 가능
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="difference"
                      checked={difference === 'none'}
                      onChange={() => {
                        setDifference('none');
                        setDifferenceAmount('');
                        setDirty(true);
                      }}
                    />
                    차액 없이 교환 희망
                  </label>

                  {difference === 'allowed' && (
                    <input
                      className="difference-amount"
                      type="number"
                      min="0"
                      value={differenceAmount}
                      onChange={setField(
                        setDifferenceAmount,
                        'differenceAmount'
                      )}
                      placeholder="희망 차액 또는 협의"
                    />
                  )}
                </div>
              </div>
            )}
          </Section>

          {/* 거래 정보 */}
          <Section
            title="거래 정보"
            hint={
              <>
                판매할 조건을
                <br />
                입력해주세요.
              </>
            }
            required
          >
            <div className="transaction-fields">
              <Field
                label="게시글 제목"
                error={errors.title}
                className="title-field"
              >
                <input
                  data-error="title"
                  type="text"
                  value={title}
                  onChange={setField(setTitle, 'title')}
                  maxLength="80"
                  placeholder="거래글 제목을 입력해주세요."
                />
              </Field>

              {/* 양도 */}
              {type === '양도' && (
                <>
                  <Field
                    label="판매 가격"
                    error={errors.price}
                  >
                    <div className="currency-input">
                      <input
                        data-error="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={price}
                        onChange={setField(setPrice, 'price')}
                        placeholder="0"
                      />

                      <span>원</span>
                    </div>
                  </Field>

                  <Field label="거래 방식">
                    <select
                      value={method}
                      onChange={setField(setMethod, 'method')}
                    >
                      {methods.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>

                  <fieldset className="perks-field">
                    <legend>티켓 포함 구성 및 특전 여부</legend>

                    <div>
                      {[
                        '오리지널 티켓',
                        '젬 쿠폰',
                        '포토카드',
                      ].map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            checked={perks.includes(item)}
                            onChange={(event) => {
                              setPerks((current) =>
                                event.target.checked
                                  ? [...current, item]
                                  : current.filter(
                                      (value) => value !== item
                                    )
                              );

                              setDirty(true);
                            }}
                          />

                          {item}
                        </label>
                      ))}
                    </div>

                    <small>
                      티켓에 포함해 전달할 구성만 선택해주세요.
                      별도 굿즈 거래는 지원하지 않습니다.
                    </small>
                  </fieldset>
                </>
              )}

              {/* 교환 */}
              {type === '교환' && (
                <>
                  <Field label="거래 방식">
                    <select
                      value={method}
                      onChange={setField(setMethod, 'method')}
                    >
                      {methods
                        .filter((item) => item !== '우편 거래')
                        .map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                    </select>
                  </Field>

                  <div className="exchange-condition-preview">
                    <HeartHandshake size={20} />

                    <span>
                      {difference === 'allowed'
                        ? `차액 지불 가능${
                            differenceAmount
                              ? ` · ${Number(
                                  differenceAmount
                                ).toLocaleString()}원`
                              : ' · 협의'
                          }`
                        : '차액 없이 교환 희망'}
                    </span>
                  </div>
                </>
              )}

              {/* 분철 */}
              {type === '분철' && (
                <div className="split-fields">
                  <div className="split-topline">
                    <Field label="하루 전체 경기">
                      <select
                        value={gameCount}
                        onChange={handleCount}
                      >
                        {[1, 2, 3, 4, 5].map((count) => (
                          <option key={count} value={count}>
                            {count}경기
                          </option>
                        ))}
                      </select>
                    </Field>

                    <p>
                      경기별로 본인 관람 또는 모집 여부와 분담금을
                      설정하세요.
                    </p>
                  </div>

                  <div className="split-game-list">
                    {games.map((game, index) => (
                      <div
                        className="split-game-row"
                        key={index}
                      >
                        <b>{index + 1}경기</b>

                        <label>
                          <input
                            type="checkbox"
                            checked={game.attend}
                            onChange={(event) =>
                              updateGame(
                                index,
                                'attend',
                                event.target.checked
                              )
                            }
                          />
                          본인 관람
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={game.recruit}
                            disabled={game.attend}
                            onChange={(event) =>
                              updateGame(
                                index,
                                'recruit',
                                event.target.checked
                              )
                            }
                          />
                          모집
                        </label>

                        {game.recruit && (
                          <div className="currency-input split-amount">
                            <input
                              type="number"
                              min="0"
                              value={game.amount}
                              onChange={(event) =>
                                updateGame(
                                  index,
                                  'amount',
                                  event.target.value
                                )
                              }
                              placeholder="분담금"
                            />

                            <span>원</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.games && (
                    <small
                      className="field-error"
                      data-error="games"
                    >
                      {errors.games}
                    </small>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* 첨부 이미지 */}
          <Section
            title="첨부 이미지"
            hint={
              <>
                사진 첨부는 선택이며,
                <br />
                없어도 등록할 수 있어요.
              </>
            }
          >
            <div className="image-upload-content">
              <button
                type="button"
                className={`image-drop-zone ${
                  dragging ? 'dragging' : ''
                }`}
                onClick={() => fileInput.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud size={38} />

                <b>이미지를 드래그하여 첨부하거나 클릭하세요.</b>

                <span>JPG, PNG 형식 / 사진 1장, 최대 10MB</span>
              </button>

              <input
                ref={fileInput}
                className="file-input-hidden"
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = '';
                }}
              />

              {images.length > 0 ? (
                <div className="image-preview-list">
                  {images.map((image, index) => (
                    <div
                      className={`image-preview ${
                        coverIndex === index ? 'cover' : ''
                      }`}
                      key={image.preview}
                    >
                      <button
                        type="button"
                        className="preview-select"
                        onClick={() => setCoverIndex(index)}
                      >
                        <img
                          src={image.preview}
                          alt={`첨부 이미지 ${index + 1}`}
                        />

                        {coverIndex === index && (
                          <span>대표 이미지</span>
                        )}
                      </button>

                      <button
                        type="button"
                        className="preview-remove"
                        aria-label={`이미지 ${index + 1} 삭제`}
                        onClick={() => removeImage(index)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="default-cover-tile">
                  <span>TIMO</span>
                  <small>기본 이미지</small>
                </div>
              )}

              {images.length < maxImages && (
                <button
                  type="button"
                  className="add-image-tile"
                  onClick={() => fileInput.current?.click()}
                  aria-label="이미지 첨부"
                >
                  <Plus size={31} />
                </button>
              )}

              {formError && (
                <p className="upload-error">{formError}</p>
              )}
            </div>
          </Section>

          {/* 상세 설명 */}
          <Section
            title="상세 설명"
            hint={
              <>
                거래에 대한 자세한
                <br />
                내용을 입력해주세요.
              </>
            }
          >
            <div className="description-input-wrap">
              <textarea
                maxLength={1000}
                value={description}
                onChange={setField(setDescription, 'description')}
                placeholder={
                  '거래에 대한 설명을 입력해주세요.\n(예: 양도 사유, 티켓 수령 방식, 주의사항 등)'
                }
              />

              <span>{description.length} / 1000</span>
            </div>
          </Section>

          {/* 거래 유의사항 */}
          <aside className="trade-caution">
            <h2>
              <span>ⓘ</span>
              거래 전 꼭 확인해주세요!
            </h2>

            <ul>
              <li>
                티켓 거래는 개인 간의 거래로, TIMO는 거래에 대한
                책임을 지지 않습니다.
              </li>

              <li>
                사기 피해를 예방하기 위해 의심스러운 거래는
                신고해주세요.
              </li>

              <li>
                경기 당일 및 이후에는 거래가 제한될 수 있습니다.
              </li>
            </ul>
          </aside>

          {formError && (
            <p className="form-submit-error" role="alert">
              {formError}
            </p>
          )}

          {/* 하단 버튼 */}
          <div className="trade-form-actions">
            <button
              type="button"
              className="cancel-create"
              onClick={cancel}
            >
              취소
            </button>

            <button
              type="submit"
              className="submit-create"
              disabled={busy}
            >
              {busy ? '등록 중...' : '등록하기'}
              <ArrowRight size={22} />
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {discardOpen && (
        <ImageModal
          onStay={() => setDiscardOpen(false)}
          onDiscard={abandon}
        />
      )}
    </div>
  );
}
