import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import { fuzzyIncludes, normalizeText } from "@/utils/normalizeText";
import styles from "./BibliotecaDigital3D.module.css";

export default function LibraryHeader({
  total
}) {
  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <BibliotecaDigitalLogo className={styles.desktopLogo} />
        <BibliotecaDigitalLogo compact className={styles.mobileLogo} />
        <div>
          <p>Gobierno del Estado de Hidalgo</p>
          <span>{total} documentos institucionales</span>
        </div>
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
  autocompleteTitles
}) {
  const query = normalizeText(filters.query);
  const suggestions = query
    ? autocompleteTitles
      .filter((title) => fuzzyIncludes(title, query) && normalizeText(title) !== query)
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
            {suggestions.map((title) => (
              <button
                key={title}
                type="button"
                role="option"
                onMouseDown={() => setFilters((current) => ({ ...current, query: title }))}
              >
                {title}
              </button>
            ))}
          </div>
        )}

        <div className={styles.selectRow}>
          <select value={filters.category} onChange={update("category")} aria-label="Filtrar por categoría">
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
          <button onClick={() => onQuickFilter("clear")}>Limpiar filtros</button>
        </div>
      </div>
    </div>
  );
}
