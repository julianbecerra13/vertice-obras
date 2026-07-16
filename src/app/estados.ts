// Estados y tipos del formulario publico.
//
// Viven aqui y no en acciones.ts porque un archivo "use server" SOLO puede
// exportar funciones async: cada export suyo se convierte en un endpoint
// invocable desde internet, asi que Next prohibe exportar datos.

export interface EstadoContacto {
  ok: boolean;
  mensaje: string | null;
  errores: Record<string, string> | null;
}

export const ESTADO_INICIAL: EstadoContacto = {
  ok: false,
  mensaje: null,
  errores: null,
};
