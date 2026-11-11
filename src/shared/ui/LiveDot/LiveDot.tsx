/** 지금 진행 중이라는 표시. 주황 점 + 퍼지는 고리. */
function LiveDot() {
  return (
    <span aria-hidden="true" className="relative inline-flex size-2.5">
      <span className="absolute inset-0 rounded-full bg-(--tt-signal) animate-[tt-ping_1.6s_ease-out_infinite]" />
      <span className="relative size-2.5 rounded-full bg-(--tt-signal)" />
    </span>
  )
}

export default LiveDot
