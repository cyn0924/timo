const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function appPath(target = '/') {
  const path = target.startsWith('/') ? target : `/${target}`;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`) || path.startsWith(`${basePath}?`) || path.startsWith(`${basePath}#`)) {
    return path || '/';
  }
  return `${basePath}${path}`;
}

export function routePathname(pathname = window.location.pathname) {
  let path = pathname;
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
    path = path.slice(basePath.length) || '/';
  }
  return path.replace(/\/+$/, '') || '/';
}
