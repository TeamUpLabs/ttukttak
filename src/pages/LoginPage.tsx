import { SiteFooter, SiteHeader } from "../shared/ui";
import LoginPanel from "../features/auth/components/LoginPanel";

function LoginPage() {
  return (
    <>
      <main className="min-h-screen">
        <SiteHeader />
        <section className="max-w-7xl mx-auto py-10 px-8">
          <LoginPanel />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

export default LoginPage
