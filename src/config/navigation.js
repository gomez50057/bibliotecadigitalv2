export const MAIN_NAV_LINKS = [
  { href: "/", label: "Biblioteca", match: "/" },
  { href: "/documentos-aprobados", label: "Comparte y consulta", match: "/documentos-aprobados" },
  { href: "/validador/login", label: "Acceder", match: "/validador" },
];

export function isActivePath(pathname, match) {
  return match === "/" ? pathname === match : pathname.startsWith(match);
}
