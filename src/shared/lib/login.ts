const here = () => window.location.pathname + window.location.search + window.location.hash

/** 로그인 뒤 next(기본: 지금 보던 곳)로 돌아오는 주소 */
export const loginHref = (next = here()) => `/login?next=${encodeURIComponent(next)}`

/** 로그인 화면으로 보내요. 비로그인이거나, 받아 둔 viewer와 달리 세션이 끝나 401을 받았을 때 써요. */
export const goLogin = (next?: string) => window.location.assign(loginHref(next))
