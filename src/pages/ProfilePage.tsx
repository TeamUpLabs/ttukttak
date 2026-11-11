import { useParams } from "react-router";
import { Button, SiteFooter, SiteHeader } from "../shared/ui";
import ProfileView from "../features/profile/components/ProfileView";
import { useSession } from "../features/auth/session";

// React Router는 "/@:handle"처럼 세그먼트 일부만 파라미터로 못 받아서 "/:handle"로 받고 @를 확인해요.
function ProfilePage() {
  const { handle = "" } = useParams();
  const session = useSession();

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        {handle.startsWith("@") ? (
          <ProfileView key={handle} handle={handle.slice(1)} isMe={session?.handle.replace(/^@/, "") === handle.slice(1)} />
        ) : (
          <section className="max-w-7xl mx-auto px-8 max-sm:px-4 py-30 flex flex-col items-start gap-6">
            <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">페이지를 찾을 수 없어요.</h1>
            <Button variant="secondary" href="/" label="이번 주 주제 보러 가기" hasArrow />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default ProfilePage;
