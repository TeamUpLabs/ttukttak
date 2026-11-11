import { useParams } from "react-router";
import { SiteFooter, SiteHeader } from "../shared/ui";
import WeekResults from "../features/week/components/WeekResults";

function WeekPage() {
  const { id = "" } = useParams();

  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <WeekResults key={id} id={id} />
      </main>
      <SiteFooter />
    </>
  );
}

export default WeekPage;
