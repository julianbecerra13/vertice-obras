"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Save } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { guardarContenido } from "@/app/admin/acciones";
import { ESTADO_CONTENIDO_INICIAL } from "@/app/admin/estados";
import { ICONO_LABEL } from "@/components/iconos";
import { ICON_NAMES, type IconName, type SiteContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import {
  CampoBool,
  CampoNumero,
  CampoSelect,
  CampoTexto,
  ListaEditable,
  Panel,
} from "./campos";

type Pestana =
  | "marca"
  | "portada"
  | "servicios"
  | "proceso"
  | "trabajos"
  | "testimonios"
  | "faq"
  | "contacto";

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: "marca", label: "Marca y contacto" },
  { id: "portada", label: "Portada" },
  { id: "servicios", label: "Servicios" },
  { id: "proceso", label: "Proceso" },
  { id: "trabajos", label: "Trabajos" },
  { id: "testimonios", label: "Testimonios" },
  { id: "faq", label: "Preguntas" },
  { id: "contacto", label: "Contacto" },
];

const OPCIONES_ICONO = ICON_NAMES.map((n) => ({ valor: n as IconName, label: ICONO_LABEL[n] }));

export function EditorContenido({ inicial }: { inicial: SiteContent }) {
  const [contenido, setContenido] = useState<SiteContent>(inicial);
  const [pestana, setPestana] = useState<Pestana>("marca");
  const [estado, accion, guardando] = useActionState(
    guardarContenido,
    ESTADO_CONTENIDO_INICIAL,
  );

  const serializado = useMemo(() => JSON.stringify(contenido), [contenido]);

  // La referencia es lo ultimo que el servidor confirmo haber guardado; antes
  // del primer guardado, lo que llego del servidor al cargar la pagina.
  // Es un dato derivado, no estado: calcularlo aqui evita tener un useState
  // extra sincronizado con un efecto (que ademas provocaria doble render).
  const referencia = useMemo(
    () => estado.guardado ?? JSON.stringify(inicial),
    [estado.guardado, inicial],
  );
  const sucio = serializado !== referencia;

  // Aviso del navegador al cerrar con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [sucio]);

  // Helper para actualizar una clave de primer nivel sin mutar.
  function set<K extends keyof SiteContent>(clave: K, valor: SiteContent[K]) {
    setContenido((c) => ({ ...c, [clave]: valor }));
  }

  function setCampo<K extends keyof SiteContent, C extends keyof SiteContent[K]>(
    clave: K,
    campo: C,
    valor: SiteContent[K][C],
  ) {
    setContenido((c) => ({ ...c, [clave]: { ...c[clave], [campo]: valor } }));
  }

  function restaurar() {
    if (!confirm("¿Descartar todos los cambios sin guardar?")) return;
    setContenido(JSON.parse(referencia) as SiteContent);
  }

  return (
    <form action={accion} className="space-y-6 pb-28">
      {/* El contenido viaja como un solo JSON. El servidor lo revalida con zod:
          nunca confiamos en lo que manda el navegador. */}
      <input type="hidden" name="contenido" value={serializado} />

      {/* Pestanas */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 sm:w-auto sm:flex-wrap">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestana(p.id)}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                pestana === p.id ? "text-ink-950" : "text-bone-400 hover:text-bone-100",
              )}
            >
              {pestana === p.id && (
                <motion.span
                  layoutId="pestana-contenido"
                  className="absolute inset-0 rounded-full bg-brand-500"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pestana}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* --- MARCA --- */}
          {pestana === "marca" && (
            <Panel
              titulo="Datos de la empresa"
              descripcion="Aparecen en el menú, el pie de página y la sección de contacto."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                  etiqueta="Nombre de la empresa"
                  valor={contenido.brand.nombre}
                  onChange={(v) => setCampo("brand", "nombre", v)}
                  max={60}
                />
                <CampoTexto
                  etiqueta="Lema"
                  valor={contenido.brand.tagline}
                  onChange={(v) => setCampo("brand", "tagline", v)}
                  max={120}
                />
                <CampoTexto
                  etiqueta="Teléfono visible"
                  valor={contenido.brand.telefono}
                  onChange={(v) => setCampo("brand", "telefono", v)}
                  max={30}
                  ayuda="Como quiere que se vea. Ej: +57 604 444 8890"
                />
                <CampoTexto
                  etiqueta="WhatsApp"
                  valor={contenido.brand.whatsapp}
                  onChange={(v) => setCampo("brand", "whatsapp", v)}
                  max={30}
                  ayuda="Con indicativo, sin + ni espacios. Ej: 573001234567"
                />
                <CampoTexto
                  etiqueta="Correo"
                  valor={contenido.brand.email}
                  onChange={(v) => setCampo("brand", "email", v)}
                  max={120}
                />
                <CampoTexto
                  etiqueta="Ciudad"
                  valor={contenido.brand.ciudad}
                  onChange={(v) => setCampo("brand", "ciudad", v)}
                  max={60}
                />
                <CampoTexto
                  etiqueta="Dirección"
                  valor={contenido.brand.direccion}
                  onChange={(v) => setCampo("brand", "direccion", v)}
                  max={140}
                />
                <CampoTexto
                  etiqueta="Horario"
                  valor={contenido.brand.horario}
                  onChange={(v) => setCampo("brand", "horario", v)}
                  max={120}
                />
              </div>
            </Panel>
          )}

          {/* --- PORTADA --- */}
          {pestana === "portada" && (
            <>
              <Panel
                titulo="Portada"
                descripcion="Lo primero que ve quien entra. El título se parte en dos: la segunda parte se pinta en dorado."
              >
                <div className="space-y-4">
                  <CampoTexto
                    etiqueta="Texto pequeño de arriba"
                    valor={contenido.hero.eyebrow}
                    onChange={(v) => setCampo("hero", "eyebrow", v)}
                    max={60}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CampoTexto
                      etiqueta="Título (parte blanca)"
                      valor={contenido.hero.titulo}
                      onChange={(v) => setCampo("hero", "titulo", v)}
                      max={120}
                    />
                    <CampoTexto
                      etiqueta="Título (parte dorada)"
                      valor={contenido.hero.tituloResaltado}
                      onChange={(v) => setCampo("hero", "tituloResaltado", v)}
                      max={60}
                    />
                  </div>
                  <CampoTexto
                    etiqueta="Descripción"
                    valor={contenido.hero.subtitulo}
                    onChange={(v) => setCampo("hero", "subtitulo", v)}
                    multilinea
                    max={280}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CampoTexto
                      etiqueta="Botón principal"
                      valor={contenido.hero.ctaPrimario}
                      onChange={(v) => setCampo("hero", "ctaPrimario", v)}
                      max={40}
                    />
                    <CampoTexto
                      etiqueta="Botón secundario"
                      valor={contenido.hero.ctaSecundario}
                      onChange={(v) => setCampo("hero", "ctaSecundario", v)}
                      max={40}
                    />
                  </div>
                </div>
              </Panel>

              <Panel
                titulo="Cifras de confianza"
                descripcion="La barra de números que sube sola debajo de la portada. Entre 1 y 4."
              >
                <ListaEditable
                  items={contenido.stats}
                  onChange={(v) => set("stats", v)}
                  min={1}
                  max={4}
                  etiquetaNuevo="Añadir cifra"
                  titulo={(s) => s.label || "Cifra"}
                  nuevo={() => ({ valor: 0, prefijo: "+", sufijo: "", label: "Nueva cifra" })}
                  render={(stat, _i, actualizar) => (
                    <div className="grid gap-3 sm:grid-cols-4">
                      <CampoNumero
                        etiqueta="Número"
                        valor={stat.valor}
                        onChange={(v) => actualizar({ ...stat, valor: v })}
                        max={1_000_000}
                      />
                      <CampoTexto
                        etiqueta="Antes"
                        valor={stat.prefijo}
                        onChange={(v) => actualizar({ ...stat, prefijo: v })}
                        max={6}
                        placeholder="+"
                      />
                      <CampoTexto
                        etiqueta="Después"
                        valor={stat.sufijo}
                        onChange={(v) => actualizar({ ...stat, sufijo: v })}
                        max={6}
                        placeholder="%"
                      />
                      <CampoTexto
                        etiqueta="Etiqueta"
                        valor={stat.label}
                        onChange={(v) => actualizar({ ...stat, label: v })}
                        max={40}
                      />
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- SERVICIOS --- */}
          {pestana === "servicios" && (
            <>
              <Panel titulo="Encabezado de la sección">
                <EncabezadoSeccion
                  valor={contenido.serviciosHeader}
                  onChange={(v) => set("serviciosHeader", v)}
                />
              </Panel>

              <Panel
                titulo="Servicios"
                descripcion="Las tarjetas con el efecto de luz. Entre 1 y 8."
              >
                <ListaEditable
                  items={contenido.servicios}
                  onChange={(v) => set("servicios", v)}
                  min={1}
                  max={8}
                  etiquetaNuevo="Añadir servicio"
                  titulo={(s) => s.titulo || "Servicio"}
                  nuevo={() => ({
                    id: `servicio-${Date.now()}`,
                    icono: "hammer" as IconName,
                    titulo: "Nuevo servicio",
                    descripcion: "Describa el servicio.",
                    bullets: ["Detalle 1"],
                    destacado: false,
                  })}
                  render={(s, _i, actualizar) => (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <CampoTexto
                          etiqueta="Título"
                          valor={s.titulo}
                          onChange={(v) => actualizar({ ...s, titulo: v })}
                          max={60}
                        />
                        <CampoSelect
                          etiqueta="Icono"
                          valor={s.icono}
                          onChange={(v) => actualizar({ ...s, icono: v })}
                          opciones={OPCIONES_ICONO}
                        />
                      </div>
                      <CampoTexto
                        etiqueta="Descripción"
                        valor={s.descripcion}
                        onChange={(v) => actualizar({ ...s, descripcion: v })}
                        multilinea
                        max={280}
                      />
                      <CampoTexto
                        etiqueta="Viñetas (una por línea, máximo 5)"
                        valor={s.bullets.join("\n")}
                        onChange={(v) =>
                          actualizar({
                            ...s,
                            bullets: v.split("\n").map((b) => b.trim()).filter(Boolean).slice(0, 5),
                          })
                        }
                        multilinea
                        filas={3}
                      />
                      <CampoBool
                        etiqueta="Marcar como destacado"
                        ayuda="Le pone la etiqueta “Más solicitado”."
                        valor={s.destacado}
                        onChange={(v) => actualizar({ ...s, destacado: v })}
                      />
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- PROCESO --- */}
          {pestana === "proceso" && (
            <>
              <Panel titulo="Encabezado de la sección">
                <EncabezadoSeccion
                  valor={contenido.procesoHeader}
                  onChange={(v) => set("procesoHeader", v)}
                />
              </Panel>

              <Panel
                titulo="Pasos del proceso"
                descripcion="La línea de tiempo que se dibuja al bajar. Entre 1 y 6 pasos."
              >
                <ListaEditable
                  items={contenido.proceso}
                  onChange={(v) => set("proceso", v)}
                  min={1}
                  max={6}
                  etiquetaNuevo="Añadir paso"
                  titulo={(p, i) => `${String(i + 1).padStart(2, "0")} · ${p.titulo || "Paso"}`}
                  nuevo={() => ({ titulo: "Nuevo paso", descripcion: "Describa este paso." })}
                  render={(p, _i, actualizar) => (
                    <div className="space-y-3">
                      <CampoTexto
                        etiqueta="Título"
                        valor={p.titulo}
                        onChange={(v) => actualizar({ ...p, titulo: v })}
                        max={60}
                      />
                      <CampoTexto
                        etiqueta="Descripción"
                        valor={p.descripcion}
                        onChange={(v) => actualizar({ ...p, descripcion: v })}
                        multilinea
                        max={240}
                      />
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- TRABAJOS --- */}
          {pestana === "trabajos" && (
            <>
              <Panel titulo="Encabezado de la sección">
                <EncabezadoSeccion
                  valor={contenido.trabajosHeader}
                  onChange={(v) => set("trabajosHeader", v)}
                />
              </Panel>

              <Panel
                titulo="Obras (antes y después)"
                descripcion="Las rutas de imagen apuntan a archivos dentro de la carpeta public del proyecto. Para cambiar las fotos hay que subirlas ahí y poner la ruta aquí."
              >
                <ListaEditable
                  items={contenido.trabajos}
                  onChange={(v) => set("trabajos", v)}
                  min={1}
                  max={6}
                  etiquetaNuevo="Añadir obra"
                  titulo={(t) => t.titulo || "Obra"}
                  nuevo={() => ({
                    titulo: "Nueva obra",
                    descripcion: "Describa la obra.",
                    imagenAntes: "/trabajos/fachada-antes.svg",
                    imagenDespues: "/trabajos/fachada-despues.svg",
                  })}
                  render={(t, _i, actualizar) => (
                    <div className="space-y-3">
                      <CampoTexto
                        etiqueta="Título"
                        valor={t.titulo}
                        onChange={(v) => actualizar({ ...t, titulo: v })}
                        max={80}
                      />
                      <CampoTexto
                        etiqueta="Descripción"
                        valor={t.descripcion}
                        onChange={(v) => actualizar({ ...t, descripcion: v })}
                        max={160}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <CampoTexto
                          etiqueta="Imagen “antes”"
                          valor={t.imagenAntes}
                          onChange={(v) => actualizar({ ...t, imagenAntes: v })}
                          max={300}
                          ayuda="Ruta dentro de public/"
                        />
                        <CampoTexto
                          etiqueta="Imagen “después”"
                          valor={t.imagenDespues}
                          onChange={(v) => actualizar({ ...t, imagenDespues: v })}
                          max={300}
                          ayuda="Ruta dentro de public/"
                        />
                      </div>
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- TESTIMONIOS --- */}
          {pestana === "testimonios" && (
            <>
              <Panel titulo="Encabezado de la sección">
                <EncabezadoSeccion
                  valor={contenido.testimoniosHeader}
                  onChange={(v) => set("testimoniosHeader", v)}
                />
              </Panel>

              <Panel titulo="Testimonios" descripcion="El carrusel que se arrastra. Entre 1 y 8.">
                <ListaEditable
                  items={contenido.testimonios}
                  onChange={(v) => set("testimonios", v)}
                  min={1}
                  max={8}
                  etiquetaNuevo="Añadir testimonio"
                  titulo={(t) => t.nombre || "Testimonio"}
                  nuevo={() => ({
                    nombre: "Nombre del cliente",
                    ciudad: "Ciudad",
                    texto: "Lo que dijo el cliente.",
                    rating: 5,
                  })}
                  render={(t, _i, actualizar) => (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <CampoTexto
                          etiqueta="Nombre"
                          valor={t.nombre}
                          onChange={(v) => actualizar({ ...t, nombre: v })}
                          max={60}
                        />
                        <CampoTexto
                          etiqueta="Ciudad"
                          valor={t.ciudad}
                          onChange={(v) => actualizar({ ...t, ciudad: v })}
                          max={60}
                        />
                        <CampoNumero
                          etiqueta="Estrellas (1 a 5)"
                          valor={t.rating}
                          onChange={(v) =>
                            actualizar({ ...t, rating: Math.min(5, Math.max(1, Math.round(v))) })
                          }
                          min={1}
                          max={5}
                        />
                      </div>
                      <CampoTexto
                        etiqueta="Testimonio"
                        valor={t.texto}
                        onChange={(v) => actualizar({ ...t, texto: v })}
                        multilinea
                        filas={4}
                        max={400}
                      />
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- FAQ --- */}
          {pestana === "faq" && (
            <>
              <Panel titulo="Encabezado de la sección">
                <EncabezadoSeccion
                  valor={contenido.faqHeader}
                  onChange={(v) => set("faqHeader", v)}
                />
              </Panel>

              <Panel titulo="Preguntas frecuentes" descripcion="Entre 1 y 10 preguntas.">
                <ListaEditable
                  items={contenido.faq}
                  onChange={(v) => set("faq", v)}
                  min={1}
                  max={10}
                  etiquetaNuevo="Añadir pregunta"
                  titulo={(f) => f.pregunta || "Pregunta"}
                  nuevo={() => ({ pregunta: "¿Nueva pregunta?", respuesta: "La respuesta." })}
                  render={(f, _i, actualizar) => (
                    <div className="space-y-3">
                      <CampoTexto
                        etiqueta="Pregunta"
                        valor={f.pregunta}
                        onChange={(v) => actualizar({ ...f, pregunta: v })}
                        max={160}
                      />
                      <CampoTexto
                        etiqueta="Respuesta"
                        valor={f.respuesta}
                        onChange={(v) => actualizar({ ...f, respuesta: v })}
                        multilinea
                        filas={4}
                        max={600}
                      />
                    </div>
                  )}
                />
              </Panel>
            </>
          )}

          {/* --- CONTACTO --- */}
          {pestana === "contacto" && (
            <Panel
              titulo="Sección de contacto"
              descripcion="El encabezado del formulario donde la gente deja sus datos."
            >
              <EncabezadoSeccion
                valor={contenido.contactoHeader}
                onChange={(v) => set("contactoHeader", v)}
              />
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Barra de guardado fija */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-ink-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {estado.mensaje ? (
                <motion.p
                  key={estado.ok ? "ok" : "error"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="status"
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    estado.ok ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {estado.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{estado.mensaje}</span>
                </motion.p>
              ) : (
                <motion.p
                  key="pista"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-bone-500"
                >
                  {sucio ? "Tiene cambios sin guardar." : "Todo guardado."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {sucio && (
              <button
                type="button"
                onClick={restaurar}
                className="inline-flex items-center gap-1.5 rounded-full border border-linea px-3 py-2 text-xs text-bone-400 transition-colors hover:border-linea-fuerte hover:text-bone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Descartar</span>
              </button>
            )}

            <button
              type="submit"
              disabled={guardando || !sucio}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-semibold text-ink-950 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function EncabezadoSeccion({
  valor,
  onChange,
}: {
  valor: SiteContent["serviciosHeader"];
  onChange: (v: SiteContent["serviciosHeader"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Texto pequeño"
          valor={valor.eyebrow}
          onChange={(v) => onChange({ ...valor, eyebrow: v })}
          max={60}
        />
        <CampoTexto
          etiqueta="Título"
          valor={valor.titulo}
          onChange={(v) => onChange({ ...valor, titulo: v })}
          max={120}
        />
      </div>
      <CampoTexto
        etiqueta="Subtítulo"
        valor={valor.subtitulo}
        onChange={(v) => onChange({ ...valor, subtitulo: v })}
        multilinea
        max={280}
      />
    </div>
  );
}
