import { redirect } from "next/navigation";

import { SectionCard } from "@/components/ui";
import { LoginForm } from "@/components/login-form";
import { getViewerSession } from "@/lib/auth";
import { getPlayersPageData } from "@/lib/data";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const viewer = await getViewerSession();
  const resolvedSearchParams = await searchParams;
  const next = resolvedSearchParams.next ?? "/";

  if (viewer) {
    if (next === "/admin" && !viewer.isAdmin) {
      redirect("/");
    }

    redirect(next);
  }

  const { clusterPlayers } = await getPlayersPageData();

  return (
    <main className="grain min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-3xl place-items-center">
        <section className="grid w-full gap-6">
          <SectionCard eyebrow="Acceso" title="Entrar al grupo">
            <LoginForm
              next={next}
              players={clusterPlayers.filter((player) => player.status === "Activo")}
            />
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
