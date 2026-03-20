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
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-5xl place-items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard eyebrow="Acceso" title="Entrar al grupo">
            <LoginForm
              next={next}
              players={clusterPlayers.filter((player) => player.status === "Activo")}
            />
          </SectionCard>

          <SectionCard eyebrow="MVP" title="Auth simple" dark>
            <div className="space-y-4 text-sm leading-6 text-white/78">
              <p>
                Esta primera version usa un codigo compartido del grupo y un codigo extra
                para admins. Sirve para salir rapido sin depender todavia de OTP.
              </p>
              <p>
                Una vez adentro, `Confirmar` queda asociado al jugador autenticado y `/admin`
                solo abre para jugadores con rol admin mas codigo admin valido.
              </p>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
