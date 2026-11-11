import { Button } from "../";

function SiteHeader() {
  return (
    <header className="w-full border-b border-(--tt-line) sticky top-0 z-50">
      <div className="w-7xl mx-auto flex items-center justify-between py-2 px-8">
        <a href='/'>
          <img src="/ttukttak-logo/svg/ttukttak-logo.svg" alt="뚝딱 로고" className="h-8.5 w-auto" />
        </a>
        <div className="flex items-center gap-6">
          <span className="nav-a">이번주</span>
          <span className="nav-a">제출작</span>
          <span className="nav-a">아카이브</span>
          <span className="nav-a">규칙</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-red-500"></span>
            </span>
            <span className="text-sm mono">W1 LIVE</span>
          </span>

          <Button variant="secondary" label="GitHub로 시작하기" hasArrow />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;