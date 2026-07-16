"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// El tema oscuro es la identidad de la marca y el que se usa para vender.
// Por eso enableSystem va en false: si lo dejaramos detectar el sistema, un
// cliente con Windows en claro abriria la demo en claro y no veria nunca la
// version oscura. El claro queda como alternativa a un clic.
export function ProveedorTema({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "light"]}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}

// Devuelve false en el servidor y true en el cliente, sin efectos ni renders
// en cascada: useSyncExternalStore ya distingue los dos entornos. La
// suscripcion es vacia a proposito porque el valor nunca cambia despues.
const sinCambios = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

/**
 * Boton flotante para alternar entre oscuro y claro.
 *
 * Espera a estar montado antes de comprometerse con un tema: en el servidor no
 * existe localStorage, asi que React no puede saber cual toca. Pintar el icono
 * o la etiqueta antes de tiempo provoca un desajuste de hidratacion.
 */
export function BotonTema() {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useSyncExternalStore(sinCambios, enCliente, enServidor);
  const reducir = useReducedMotion();

  const esOscuro = resolvedTheme !== "light";

  // Antes de montar el tema real es desconocido, asi que TODO lo que dependa
  // de el debe quedarse neutro: el icono, la etiqueta y el titulo. Si solo se
  // protege el icono, el aria-label del servidor ("modo claro") choca con el
  // del cliente ("modo oscuro") y React reporta un desajuste de hidratacion.
  const etiqueta = !montado
    ? "Cambiar tema"
    : esOscuro
      ? "Cambiar a modo claro"
      : "Cambiar a modo oscuro";

  return (
    <button
      type="button"
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      aria-label={etiqueta}
      title={etiqueta}
      // Va apilado encima del boton de WhatsApp, no abajo a la izquierda: esa
      // esquina la ocupa el navegador para previsualizar enlaces al pasar el
      // raton, y en desarrollo tambien el indicador de Next.
      className="fixed right-4 bottom-[4.75rem] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-linea bg-ink-850/80 text-bone-300 backdrop-blur-xl transition-colors duration-200 hover:border-brand-500/40 hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:right-6 sm:bottom-[5.5rem] sm:h-12 sm:w-12"
    >
      {/* Sin montar dejamos el hueco: reservar el espacio evita que la interfaz
          salte cuando aparece el icono. */}
      <span className="relative flex h-5 w-5 items-center justify-center">
        {montado && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={esOscuro ? "luna" : "sol"}
              initial={reducir ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reducir ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: reducir ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {esOscuro ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </button>
  );
}
