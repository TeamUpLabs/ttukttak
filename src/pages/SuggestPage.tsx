import { Button, SiteFooter, SiteHeader } from "../shared/ui";
import SuggestForm from "../features/suggestion/components/SuggestForm";
import { useSession } from "../features/auth/session";
import { loginHref } from "../shared/lib/login";

/** 주제 제안: 로그인을 확인하고 폼을 보여줘요. */
function SuggestPage() {
  const session = useSession();

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-12 pb-30">
          {session === undefined ? null : session ? (
            <SuggestForm />
          ) : (
            <div className="flex flex-col items-start gap-6 max-w-200">
              <span className="mono text-[13px] text-(--tt-muted)">주제 제안하기</span>
              <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">제안하려면 먼저 로그인해 주세요.</h1>
              <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">남긴 제안은 시즌 후반 주제 투표 후보가 돼요.</p>
              <Button variant="secondary" href={loginHref("/suggest")} label="GitHub로 로그인하기" hasArrow />
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default SuggestPage;
