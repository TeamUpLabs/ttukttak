import { useParams } from "react-router";
import { SiteFooter, SiteHeader } from "../shared/ui";
import SubmissionDetail from "../features/submission/components/SubmissionDetail";
import VoteToggle from "../features/vote/components/VoteToggle";
import { useSession } from "../features/auth/session";

function SubmissionPage() {
  const { id = "" } = useParams();
  const session = useSession();

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <SubmissionDetail
          key={id}
          id={id}
          viewer={session?.handle ?? null}
          renderVote={(s, size, votingOpen) => <VoteToggle submission={s} votingOpen={votingOpen} size={size} />}
        />
      </main>
      <SiteFooter />
    </>
  );
}

export default SubmissionPage;
