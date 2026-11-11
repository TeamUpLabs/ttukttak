import { Button, SiteHeader } from "../shared/ui";
import ThisWeekCard from "../features/week/components/ThisWeekCard";
import RecentSubmissionsMarquee from "../features/submission/components/RecentSubmissionsMarquee";
import WeekFlow from "../features/week/components/WeekFlow";
import WeekRange from "../features/week/components/WeekRange";

function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section id="theme" className="max-w-7xl mx-auto py-20 flex flex-col gap-30">
        <div className="mono tt-fade flex justify-between items-center flex-wrap">
          <WeekRange />
          <span>매주 월요일 10:00 새 주제 공개</span>
        </div>

        <h1 className="m-0 text-9xl leading-[0.98] tracking-wider font-bold">
          <span className="block overflow-hidden pb-[.04em]"><span className="tt-line__in delay-5">매주 하나씩,</span></span>
          <span className="block overflow-hidden pb-[.04em]"><span className="tt-line__in delay-18"><span className="tt-highlight">끝까지</span> 만든다.</span></span>
        </h1>

        <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-20 items-end">
          <div className="tt-fade delay-45 flex flex-col gap-7 pb-8">
            <p className="m-0 text-lg leading-[1.7] max-w-md">월요일에 주제가 열리면 72시간 안에 만들어 올리세요. 작게 만들고, 완성하고, 서로의 결과물에 투표하는 주간 미니 해커톤이에요.</p>
            <div className="flex gap-4 flex-wrap">
              <Button variant="secondary" label="이번 주 참가하기" hasArrow />
              <Button variant="primary" label="제출작 구경하기" />
            </div>
            <div className="w-full pt-10 border-t border-(--tt-line)">
              <div className="w-full flex gap-12 justify-center">
                <div className="flex flex-col">
                  <span className="text-4xl font-stretch-extra-condensed font-extrabold leading-none">46</span>
                  <span className="text-[#5E5E58] text-sm">지금 만드는 중</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-stretch-extra-condensed font-extrabold leading-none">23</span>
                  <span className="text-[#5E5E58] text-sm">제출 완료</span>
                </div>
              </div>
            </div>
          </div>

          <ThisWeekCard />
        </div>
      </section>

      <RecentSubmissionsMarquee />

      <section id="rules" className="max-w-7xl mx-auto py-30">
        <WeekFlow />
      </section>
    </main>
  )
}

export default HomePage