import { useState } from 'react'
import { Button, LiveDot } from '../../../shared/ui'

/**
 * 참가자 데모를 이 페이지 안에서 띄워요.
 * 외부 페이지라 누르기 전엔 불러오지 않고, 불러올 때도 sandbox로 가둬요(같은 출처 권한·상단 이동 없음).
 */
function DemoFrame({ url, title }: { url: string; title: string }) {
  const [running, setRunning] = useState(false)
  const host = new URL(url).host

  return (
    <div className="border-(length:--tt-stroke-bold) border-(--tt-ink) rounded-[24px] overflow-hidden bg-(--tt-night)">
      <div className="flex justify-between items-center gap-4 px-5.5 py-3.5 bg-(--tt-ground) border-b-(length:--tt-stroke-bold) border-(--tt-ink)">
        <span className="mono flex items-center gap-2.5 text-[13px] min-w-0 truncate">
          <LiveDot />
          LIVE DEMO · {host}
        </span>
        <a href={url} target="_blank" rel="noreferrer" className="mono text-[13px] shrink-0">
          새 창에서 열기 ↗
        </a>
      </div>

      {running ? (
        <iframe
          src={url}
          title={`${title} 데모`}
          sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups"
          referrerPolicy="no-referrer"
          className="block w-full h-130 max-sm:h-110 border-0 bg-(--tt-surface)"
        />
      ) : (
        <div className="min-h-130 max-sm:min-h-90 flex flex-col items-center justify-center gap-6 p-14 max-sm:p-6 text-center text-(--tt-on-night)">
          <p className="m-0 text-[clamp(28px,3.4vw,44px)] leading-[1.15] tracking-[-0.04em] font-bold">
            {title},
            <br />
            여기서 바로 써볼 수 있어요.
          </p>
          <p className="mono m-0 text-[13px] text-(--tt-on-night-muted)">참가자가 올린 외부 페이지라 누르면 불러와요</p>
          <Button variant="primary" label="여기서 실행하기" hasArrow onClick={() => setRunning(true)} />
        </div>
      )}
    </div>
  )
}

export default DemoFrame
