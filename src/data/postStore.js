import { posts as seedPosts } from './posts.js';

const STORAGE_KEY = 'timo-post-store-v1';
export const CURRENT_USER_ID = 'current-user';

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { created: Array.isArray(parsed.created) ? parsed.created : [], updates: parsed.updates || {}, requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
  } catch {
    return { created: [], updates: {}, requests: [] };
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAllPosts() {
  const store = readStore();
  const updatedSeeds = seedPosts.map(post => ({ ...post, ...(store.updates[post.id] || {}) }));
  const removed = new Set(updatedSeeds.filter(post => post.deleted).map(post => post.id));
  return [...updatedSeeds.filter(post => !post.deleted), ...store.created.filter(post => !post.deleted && !removed.has(post.id))];
}

export function getPosts() {
  return getAllPosts().filter(post => post.isPublished !== false);
}

export function getUserPosts(userId = CURRENT_USER_ID) {
  const ownPosts = getAllPosts().filter(post => post.ownerId === userId).map(post => ({
    ...post,
    createdAt: post.createdAt || post.detail?.createdAt || '',
    matchDate: post.matchDate || formatMatchDate(post.date),
    comments: post.comments ?? 0,
    likes: post.likes ?? 0,
    status: post.status || post.detail?.status || '거래 중',
    thumbnail: post.thumbnail || post.image || 'arena',
  }));
  const outgoingRequests = readStore().requests.filter(request => request.requesterId === userId).map(request => ({
    id: `request-${request.id}`,
    title: request.postTitle,
    createdAt: request.createdAt,
    matchDate: formatMatchDate(request.date),
    date: request.date,
    comments: 0,
    likes: 0,
    status: request.status,
    thumbnail: request.image || 'arena',
    type: request.type,
    isRequest: true,
    postId: request.postId,
  }));
  return [...outgoingRequests, ...ownPosts];
}

export function getFavoritePosts(userId = CURRENT_USER_ID) {
  return getAllPosts().filter(post => post.favoritedBy?.includes(userId)).map(post => ({
    ...post,
    createdAt: post.createdAt || post.detail?.createdAt || '',
    matchDate: post.matchDate || formatMatchDate(post.date),
    comments: post.comments ?? 0,
    likes: post.likes ?? 0,
    thumbnail: post.favoriteThumbnail || post.thumbnail || post.image || 'arena',
    matchDate: post.favoriteMatchDate || post.matchDate || formatMatchDate(post.date),
  }));
}

export function isPostFavorite(postId, userId = CURRENT_USER_ID) {
  return getAllPosts().find(post => post.id === postId)?.favoritedBy?.includes(userId) || false;
}

export function togglePostFavorite(postId, userId = CURRENT_USER_ID) {
  const post = getAllPosts().find(item => item.id === postId);
  if (!post) return false;
  const favorites = new Set(post.favoritedBy || []);
  if (favorites.has(userId)) favorites.delete(userId); else favorites.add(userId);
  updatePost(postId, { favoritedBy: [...favorites] });
  return favorites.has(userId);
}

export function createPost(post) {
  const store = readStore();
  const id = Math.max(Date.now(), ...seedPosts.map(item => item.id), ...store.created.map(item => Number(item.id) || 0)) + 1;
  const normalizedPost = Array.isArray(post.images)
    ? { ...post, images: post.images.slice(0, 1), coverIndex: 0 }
    : { ...post, images: [] };
  const created = { ...normalizedPost, id, isPublished: true, comments: 0, likes: 0, favoritedBy: [], status: post.status || (post.type === '분철' ? '모집 중' : '거래 가능') };
  store.created.push(created);
  writeStore(store);
  return created;
}

export function updatePost(postId, updates) {
  const store = readStore();
  const createdIndex = store.created.findIndex(post => post.id === postId);
  if (createdIndex >= 0) store.created[createdIndex] = { ...store.created[createdIndex], ...updates };
  else store.updates[postId] = { ...(store.updates[postId] || {}), ...updates };
  writeStore(store);
}

export function deletePost(postId) {
  updatePost(postId, { deleted: true });
}

export function getTradeRequest(postId, requesterId = CURRENT_USER_ID) {
  return readStore().requests.find(request => request.postId === postId && request.requesterId === requesterId) || null;
}

export function createTradeRequest(request) {
  const store = readStore();
  const previous = store.requests.find(item => item.postId === request.postId && item.requesterId === request.requesterId);
  if (previous) return { request: previous, created: false };
  const createdRequest = {
    ...request,
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: '판매자 확인 대기',
    createdAt: request.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  store.requests.push(createdRequest);
  writeStore(store);
  return { request: createdRequest, created: true };
}

function formatMatchDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}(${['일','월','화','수','목','금','토'][date.getDay()]})`;
}
