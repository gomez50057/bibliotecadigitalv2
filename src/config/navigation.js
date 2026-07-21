export const MAIN_NAV_LINKS = [
  { href: "/", label: "Biblioteca", match: "/" },
  { href: "/subir-documento", label: "Comparte documento", match: "/subir-documento" },
  { href: "/validador/login", label: "Acceder", match: "/validador" },
];

export function isActivePath(pathname, match) {
  return match === "/" ? pathname === match : pathname.startsWith(match);
}
