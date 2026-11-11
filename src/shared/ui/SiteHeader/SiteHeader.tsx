import { Button, LiveDot } from "../";
import { useThisWeek } from "../../../features/week/useThisWeek";

function SiteHeader() {
  const { week: current, next } = useThisWeek()
  // 시즌 시작 전엔 첫 주 주제를 미리 보여줘요.
  const week = current ?? next

  return (
    <header className="bg-(--tt-ground)/70 backdrop-blur-md w-full border-b border-(--tt-line) sticky top-0 z-50">
      <div className="w-7xl mx-auto flex items-center justify-between py-2 px-8">
        <a href='/'>
          <img src="/ttukttak-logo/svg/ttukttak-logo.svg" alt="뚝딱 로고" className="h-8.5 w-auto" />
        </a>
        <div className="flex items-center gap-6">
          <a className="nav-a" href="#theme">이번주</a>
          <a className="nav-a" href="#submit">제출작</a>
          <a className="nav-a" href="#archive">아카이브</a>
          <a className="nav-a" href="#rules">규칙</a>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-4">
            <LiveDot />
            <span className="text-sm mono">{week.code} LIVE</span>
          </span>

          <Button variant="secondary" label="GitHub로 시작하기" hasArrow />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;