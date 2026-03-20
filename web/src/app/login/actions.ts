"use server";

import { redirect } from "next/navigation";

import {
  clearViewerSession,
  createViewerSession,
  hasSimpleAuthConfig,
  verifyAdminAccessCode,
  verifyGroupAccessCode,
} from "@/lib/auth";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type LoginActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const playerId = String(formData.get("playerId") ?? "");
  const accessCode = String(formData.get("accessCode") ?? "");
  const adminMode = String(formData.get("adminMode") ?? "") === "true";
  const adminCode = String(formData.get("adminCode") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!hasSimpleAuthConfig()) {
    return {
      message: "Faltan las variables de auth simple para habilitar el login.",
      status: "demo",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "Falta Supabase para resolver jugadores y permisos reales.",
      status: "demo",
    };
  }

  if (!playerId || !accessCode) {
    return {
      message: "Elegi tu jugador y cargá el codigo del grupo.",
      status: "error",
    };
  }

  if (!verifyGroupAccessCode(accessCode)) {
    return {
      message: "El codigo del grupo no coincide.",
      status: "error",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("id, full_name, role, is_active")
    .eq("id", playerId)
    .maybeSingle<{
      full_name: string;
      id: string;
      is_active: boolean;
      role: "admin" | "player";
    }>();

  if (error || !player) {
    return {
      message: "No se encontro el jugador para iniciar sesion.",
      status: "error",
    };
  }

  if (!player.is_active) {
    return {
      message: "Ese jugador esta inactivo y no puede iniciar sesion.",
      status: "error",
    };
  }

  if (adminMode) {
    if (player.role !== "admin") {
      return {
        message: "Solo los jugadores admin pueden entrar en modo admin.",
        status: "error",
      };
    }

    if (!verifyAdminAccessCode(adminCode)) {
      return {
        message: "El codigo admin no coincide.",
        status: "error",
      };
    }
  }

  await createViewerSession({
    isAdmin: adminMode,
    playerId: player.id,
    playerName: player.full_name,
    role: player.role,
  });

  redirect(next || "/");
}

export async function logoutAction() {
  await clearViewerSession();
  redirect("/login");
}
