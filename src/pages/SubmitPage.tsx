import { Button, SiteFooter, SiteHeader } from "../shared/ui";
import { kstDayTime, kstMonthDay } from "../shared/lib/kst";
import SubmitForm from "../features/submission/components/SubmitForm";
import { allSubmissions } from "../features/submission/data";
import { useSession } from "../features/auth/session";
import { useThisWeek } from "../features/week/useThisWeek";
import { useProfile } from "../features/profile/useProfile";

const WRAP = "max-w-7xl mx-auto px-8 max-sm:px-4";
const H1 = "m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold";

/** 제출하기: 로그인 · 제출 기간을 확인하고 폼을 보여줘요. */
function SubmitPage() {
  const session = useSession();
  const { now, isPending, week, next, phase, deadline } = useThisWeek();
  const profile = useProfile(session?.handle ?? "");

  let body;
  if (session === undefined || isPending) {
    body = null;
  } else if (!session) {
    body = (
      <div className="flex flex-col items-start gap-6 max-w-200">
        <span className="mono text-[13px] text-(--tt-muted)">결과물 제출하기</span>
        <h1 className={H1}>제출하려면 먼저 로그인해 주세요.</h1>
        <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">GitHub 계정으로 로그인하면 레포와 프로필이 이어져요.</p>
        <Button variant="secondary" href="/login?next=/submit" label="GitHub로 로그인하기" hasArrow />
      </div>
    );
  } else if (week?.type !== "theme" || phase !== "제출 마감까지" || !deadline) {
    const opensAt = next && new Date(next.schedule.opensAt);
    body = (
      <div className="flex flex-col items-start gap-6 max-w-200">
        <span className="mono text-[13px] text-(--tt-muted)">결과물 제출하기</span>
        <h1 className={H1}>지금은 제출 기간이 아니에요.</h1>
        <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">
          {opensAt
            ? `다음 주제는 ${kstMonthDay(opensAt)} ${kstDayTime(opensAt)}에 공개돼요. 그때부터 72시간 동안 제출할 수 있어요.`
            : "이번 시즌이 끝났어요. 다음 시즌 일정이 나오면 알려드릴게요."}
        </p>
        <Button variant="secondary" href="/#submit" label="이번 주 제출작 구경하기" hasArrow />
      </div>
    );
  } else {
    body = (
      <SubmitForm
        week={week}
        deadline={deadline}
        now={now}
        submittedCount={allSubmissions.filter((s) => s.weekId === week.id).length}
        viewer={session.handle}
        streakBefore={profile?.streak ?? 0}
      />
    );
  }

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <section className={`${WRAP} pt-12 pb-30`}>{body}</section>
      </main>
      <SiteFooter />
    </>
  );
}

export default SubmitPage;
