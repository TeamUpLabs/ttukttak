import type { ReactNode } from "react";
import { Button, SiteFooter, SiteHeader } from "../shared/ui";
import WeekEditor from "../features/admin/components/WeekEditor";
import ImportWeeks from "../features/admin/components/ImportWeeks";
import SuggestionList from "../features/admin/components/SuggestionList";
import { useSession } from "../features/auth/session";

const H1 = "m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold";

/** 운영자 화면: 주차 수정·공지 · 주차 가져오기 · 주제 제안. 제출작·피드백 숨기기는 각 상세 화면에 있어요. */
function AdminPage() {
  const session = useSession();

  let body;
  if (session === undefined) {
    body = null;
  } else if (!session) {
    body = (
      <div className="flex flex-col items-start gap-6">
        <h1 className={H1}>운영자만 들어올 수 있어요.</h1>
        <Button variant="secondary" href="/login?next=/admin" label="GitHub로 로그인하기" hasArrow />
      </div>
    );
  } else if (session.role !== "admin") {
    body = (
      <div className="flex flex-col items-start gap-6">
        <h1 className={H1}>운영자만 들어올 수 있어요.</h1>
        <Button variant="secondary" href="/" label="이번 주 주제 보러 가기" hasArrow />
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col gap-20">
        <div className="flex flex-col gap-3">
          <span className="mono text-[13px] text-(--tt-muted)">운영</span>
          <h1 className={H1}>운영자 화면</h1>
        </div>
        <Panel title="주차 고치기 · 공지">
          <WeekEditor />
        </Panel>
        <Panel title="주차 가져오기">
          <ImportWeeks />
        </Panel>
        <Panel title="주제 제안">
          <SuggestionList />
        </Panel>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <section className="max-w-4xl mx-auto px-8 max-sm:px-4 pt-12 pb-30">{body}</section>
      </main>
      <SiteFooter />
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8 pt-8 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
      <h2 className="m-0 text-[clamp(28px,3vw,40px)] leading-[1.1] tracking-[-0.04em] font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default AdminPage;
