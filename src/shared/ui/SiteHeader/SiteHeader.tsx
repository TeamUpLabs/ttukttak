import { Avatar, Button, LiveDot } from "../";
import { useThisWeek } from "../../../features/week/useThisWeek";
import { useSession } from '../../../features/auth/session'

function SiteHeader() {
  const { week: current, next, phase } = useThisWeek(60_000)
  // 시즌 시작 전엔 첫 주 주제를 미리 보여줘요.
  const week = current ?? next
  // 주제 주가 열려 있고 결과 발표 전이면 LIVE. 휴식 주·결과 발표 뒤·시즌 밖은 END.
  const live = current?.type === 'theme' && (phase === '제출 마감까지' || phase === '투표 마감까지' || phase === '결과 발표까지')
  const session = useSession()

  return (
    <header className="bg-(--tt-ground)/70 backdrop-blur-md w-full border-b border-(--tt-line) sticky top-0 z-50">
      <div className="w-7xl mx-auto flex items-center justify-between py-2 px-8">
        <a href='/'>
          <img src="/ttukttak-logo/svg/ttukttak-logo.svg" alt="뚝딱 로고" className="h-8.5 w-auto" />
        </a>
        <div className="flex items-center gap-6">
          <a className="nav-a" href="/#theme">이번주</a>
          <a className="nav-a" href="/#submit">제출작</a>
          <a className="nav-a" href="/#archive">아카이브</a>
          <a className="nav-a" href="/#rules">규칙</a>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-4">
            <LiveDot off={!live} />
            <span className={`text-sm mono ${live ? '' : 'text-(--tt-muted)'}`}>{week?.code} {live ? 'LIVE' : 'END'}</span>
          </span>
          {session ? (
            <div className="flex items-center gap-6">
              <Avatar handle={session.handle} href={`/@${session.handle.replace(/^@/, '')}`} />
              <Button variant="secondary" href="/submit" label="제출 하기" hasArrow />
            </div>
          ) :
            <Button variant="secondary" href="/login" label="GitHub로 시작하기" hasArrow />
          }
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;