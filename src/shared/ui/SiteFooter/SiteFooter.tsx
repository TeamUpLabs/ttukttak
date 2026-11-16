import type { ReactNode } from 'react'

const LINKS = [
  { href: '/suggest', label: '주제 제안하기' },
  { href: '#', label: '디스코드' },
  { href: '#', label: '운영 원칙' },
]

/** 모든 화면 공통 푸터. children 자리에 페이지가 CTA를 꽂을 수 있어요. */
function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="bg-(--tt-night) text-(--tt-on-night)">
      <div className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-28 pb-14 flex flex-col gap-16">
        {children}
        <div className="flex justify-between flex-wrap gap-5 pt-7 border-t border-(--tt-night-line) text-sm text-(--tt-on-night-muted)">
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-(--tt-signal)" />
            <span className="font-bold text-(--tt-on-night)">뚝딱</span>
            매주 하나씩, 끝까지.
          </span>
          <nav aria-label="푸터 링크" className="flex flex-wrap gap-6">
            {LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-(--tt-on-night) no-underline hover:underline">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
