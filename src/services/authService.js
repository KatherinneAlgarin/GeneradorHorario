import { supabase } from "./supabaseClient";

export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userId = user.id;

  // Buscar en docente
  const { data: docente } = await supabase
    .from("docente")
    .select("id_docente, activo")
    .eq("id_auth_user", userId)
    .maybeSingle();

  if (docente) {
    return { 
      rol: "docente", 
      activo: docente.activo,
      id: docente.id_docente
    };
  }

  // Buscar en administrador
  const { data: admin } = await supabase
    .from("administrador")
    .select("id_administrador, id_facultad, activo")
    .eq("id_auth_user", userId)
    .maybeSingle();

  if (admin) {
    if (admin.id_facultad === null) {
      return { 
        rol: "admin_general", 
        activo: admin.activo,
        id: admin.id_administrador
      };
    } else {
      return { 
        rol: "decano", 
        activo: admin.activo,
        id: admin.id_administrador,
        id_facultad: admin.id_facultad
      };
    }
  }

  return null;
};
