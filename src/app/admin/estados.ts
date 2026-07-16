// Estados y tipos del panel de administracion.
//
// Viven aqui y no en acciones.ts porque un archivo "use server" SOLO puede
// exportar funciones async: cada export suyo se convierte en un endpoint
// invocable desde internet, asi que Next prohibe exportar datos.

export interface EstadoLogin {
  error: string | null;
}

export const ESTADO_LOGIN_INICIAL: EstadoLogin = { error: null };

export interface EstadoContenido {
  ok: boolean;
  mensaje: string | null;
  /**
   * JSON del contenido que quedo guardado, ya normalizado por zod.
   * El editor lo usa como referencia para saber si hay cambios pendientes.
   * Va aqui, y no en un useState del editor, para no tener que sincronizarlo
   * con un efecto: es un dato derivado del ultimo guardado.
   */
  guardado: string | null;
}

export const ESTADO_CONTENIDO_INICIAL: EstadoContenido = {
  ok: false,
  mensaje: null,
  guardado: null,
};
