import {
  Droplets,
  Hammer,
  HardHat,
  Paintbrush,
  Ruler,
  Shield,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/content";

// Puente entre el contenido guardado y los componentes de icono.
// En la base de datos el icono es texto ("paintbrush") porque un JSON no puede
// guardar componentes de React. Aqui lo traducimos al componente real.
export const ICONOS: Record<IconName, LucideIcon> = {
  paintbrush: Paintbrush,
  wrench: Wrench,
  zap: Zap,
  "hard-hat": HardHat,
  hammer: Hammer,
  droplets: Droplets,
  ruler: Ruler,
  shield: Shield,
};

// Etiquetas legibles para el selector del admin.
export const ICONO_LABEL: Record<IconName, string> = {
  paintbrush: "Brocha (pintura)",
  wrench: "Llave (plomería)",
  zap: "Rayo (eléctrico)",
  "hard-hat": "Casco (estructural)",
  hammer: "Martillo (remodelación)",
  droplets: "Gotas (agua)",
  ruler: "Regla (diseño)",
  shield: "Escudo (garantía)",
};
