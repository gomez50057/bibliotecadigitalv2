"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import { isActivePath, MAIN_NAV_LINKS } from "@/config/navigation";
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import { normalizeText, searchIncludes } from "@/utils/normalizeText";
import styles from "./BibliotecaDigital3D.module.css";

export default function LibraryHeader({
  total,
  totalGeneral,
  activeFilterCount
}) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <BibliotecaDigitalLogo className={styles.desktopLogo} />
        <BibliotecaDigitalLogo compact className={styles.mobileLogo} />
        <div>
          <p>Gobierno del Estado de Hidalgo</p>
          <span>{totalGeneral} documentos</span>
          {activeFilterCount > 0 && <small>{total} visibles con filtros</small>}
        </div>
        <nav className={styles.headerNav} aria-label="Navegación principal">
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className={isActivePath(pathname, link.match) ? styles.navActive : ""}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function LibraryFilters({
  filters,
  setFilters,
  categoryOptions,
  subcategoryOptions,
  years,
  onQuickFilter,
  autocompleteDocuments,
  onSearchSelect,
  activeFilterCount,
  allowAllCategories = false
}) {
  const query = normalizeText(filters.query);
  const filterLabel = `${activeFilterCount} ${activeFilterCount === 1 ? "filtro activo" : "filtros activos"}`;
  const suggestions = query
    ? autocompleteDocuments
      .filter((document) => searchIncludes(document.searchText, query) && normalizeText(document.title) !== query)
      .slice(0, 7)
    : [];
  const update = (key) => (event) => setFilters((current) => ({
    ...current,
    [key]: event.target.value,
    ...(key === "category" ? { subcategory: "" } : {})
  }));

  return (
    <div className={styles.filterPanel}>
      <div className={styles.searchArea}>
        <label className={styles.searchBox}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.searchIcon}>
            <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          </svg>
          <input
            type="search"
            value={filters.query}
            onChange={update("query")}
            placeholder="Buscar documentos..."
            aria-label="Buscar documentos"
          />
          <kbd>Ctrl K</kbd>
        </label>
        {suggestions.length > 0 && (
          <div className={styles.autocompleteList} role="listbox" aria-label="Sugerencias de documentos">
            {suggestions.map((document) => (
              <button
                key={document.id}
                type="button"
                role="option"
                onMouseDown={() => onSearchSelect(document)}
              >
                <strong>{document.title}</strong>
                <span>{CATEGORY_LABELS[document.categoryKey]} - {SUBCATEGORY_LABELS[document.subcategory]} - {document.year}</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.selectRow}>
          <select value={filters.category} onChange={update("category")} aria-label="Filtrar por categoría">
            {allowAllCategories && <option value="">Todas las categorías</option>}
            {categoryOptions.map((key) => <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>)}
          </select>
          <select value={filters.subcategory} onChange={update("subcategory")} aria-label="Filtrar por subcategoría">
            <option value="">Todas las subcategorías</option>
            {subcategoryOptions.map((key) => <option key={key} value={key}>{SUBCATEGORY_LABELS[key]}</option>)}
          </select>
          <select value={filters.year} onChange={update("year")} aria-label="Filtrar por año">
            <option value="">Todos los años</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={filters.order} onChange={update("order")} aria-label="Ordenar resultados">
            <option value="recent">Mas recientes</option>
            <option value="oldest">Mas antiguos</option>
            <option value="title">Titulo A-Z</option>
          </select>
        </div>

        <div className={styles.chips} aria-label="Filtros rápidos">
          <span className={styles.filterCount}>{filterLabel}</span>
          <button className={filters.order === "recent" ? styles.chipActive : ""} onClick={() => onQuickFilter("recent")}>Más recientes</button>
          {["nacional", "estatal", "municipal"].map((key) => (
            <button
              key={key}
              className={filters.subcategory === key ? styles.chipActive : ""}
              onClick={() => onQuickFilter(key)}
            >
              {SUBCATEGORY_LABELS[key]}
            </button>
          ))}
          <button disabled={!activeFilterCount} onClick={() => onQuickFilter("clear")}>Limpiar filtros</button>
        </div>
      </div>
    </div>
  );
}
