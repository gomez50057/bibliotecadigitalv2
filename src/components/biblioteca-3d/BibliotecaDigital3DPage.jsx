"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_LABELS, LIBRARY_TAXONOMY, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import { libraryDocuments, pendingClassification } from "@/data/libraryDocuments";
import { chunkBooks } from "@/utils/chunkBooks";
import { fuzzyIncludes, normalizeText, searchIncludes } from "@/utils/normalizeText";
import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import DocumentDetailPanel from "./DocumentDetailPanel";
import LibraryHeader, { LibraryFilters } from "./LibraryHeader";
import Loading3D from "./Loading3D";
import styles from "./BibliotecaDigital3D.module.css";

const LibraryCanvas = dynamic(() => import("./LibraryCanvas"), {
  ssr: false,
  loading: () => null
});

const CATEGORY_KEYS = Object.keys(LIBRARY_TAXONOMY);
const INITIAL_FILTERS = { query: "", category: "planes", subcategory: "", year: "", order: "recent", recent: false };

function latestYear(value) {
  return Math.max(...String(value).match(/\d{4}/g)?.map(Number) || [0]);
}

function documentSearchText(document) {
  return normalizeText([
    document.title,
    document.categoryKey,
    CATEGORY_LABELS[document.categoryKey],
    document.subcategory,
    SUBCATEGORY_LABELS[document.subcategory],
    document.year,
    document.booksIndex
  ].join(" "));
}

function documentMatchesFilters(document, filters, ignoredFilters = []) {
  const ignored = new Set(ignoredFilters);
  const query = normalizeText(filters.query);

  return (ignored.has("query") || !query || fuzzyIncludes(documentSearchText(document), query))
    && (ignored.has("category") || !filters.category || document.categoryKey === filters.category)
    && (ignored.has("subcategory") || !filters.subcategory || document.subcategory === filters.subcategory)
    && (ignored.has("year") || !filters.year || document.year === filters.year);
}

export default function BibliotecaDigital3DPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeCategory, setActiveCategory] = useState("planes");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [render3D, setRender3D] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const searchRef = useRef(null);
  const tooltipPortal = useRef(null);

  const clearDocumentUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("doc");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
      }
      if (event.key === "Escape") {
        setSelectedDocument(null);
        clearDocumentUrl();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 701px)");
    const sync = () => setRender3D(desktop.matches);
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveCategory(filters.category);
    setActiveSubcategory(filters.subcategory);
    setPage(0);
  }, [filters]);

  const isSearching = Boolean(filters.query.trim());

  const categoryOptions = useMemo(
    () => CATEGORY_KEYS.filter((category) =>
      libraryDocuments.some((document) =>
        document.categoryKey === category && documentMatchesFilters(document, filters, ["category", "query"])
      )
    ),
    [filters]
  );

  const subcategoryOptions = useMemo(
    () => (LIBRARY_TAXONOMY[filters.category] || []).filter((subcategory) =>
      libraryDocuments.some((document) =>
        document.subcategory === subcategory && documentMatchesFilters(document, filters, ["subcategory", "query"])
      )
    ),
    [filters]
  );

  const years = useMemo(
    () => [...new Set(libraryDocuments
      .filter((document) => documentMatchesFilters(document, filters, ["year", "query"]))
      .map((document) => document.year))]
      .sort((a, b) => latestYear(b) - latestYear(a)),
    [filters]
  );

  const filtered = useMemo(() => {
    const query = normalizeText(filters.query);
    const result = libraryDocuments.filter((document) => {
      if (query) return searchIncludes(documentSearchText(document), query);
      return documentMatchesFilters(document, filters);
    });
    return [...result].sort((a, b) => {
      if (filters.order === "title") return a.title.localeCompare(b.title, "es");
      if (filters.order === "oldest") return latestYear(a.year) - latestYear(b.year);
      return latestYear(b.year) - latestYear(a.year);
    });
  }, [filters]);

  useEffect(() => {
    if (filters.query.trim()) return;
    setFilters((current) => {
      const nextCategoryOptions = CATEGORY_KEYS.filter((category) =>
        libraryDocuments.some((document) =>
          document.categoryKey === category && documentMatchesFilters(document, current, ["category"])
        )
      );
      const nextCategory = !current.category || nextCategoryOptions.includes(current.category)
        ? current.category
        : nextCategoryOptions[0] || "";
      const categoryFilters = { ...current, category: nextCategory };
      const nextSubcategoryOptions = (LIBRARY_TAXONOMY[nextCategory] || []).filter((subcategory) =>
        libraryDocuments.some((document) =>
          document.subcategory === subcategory && documentMatchesFilters(document, categoryFilters, ["subcategory"])
        )
      );
      const nextSubcategory = !current.subcategory || nextSubcategoryOptions.includes(current.subcategory)
        ? current.subcategory
        : "";
      const nextYearOptions = libraryDocuments
        .filter((document) => documentMatchesFilters(document, { ...categoryFilters, subcategory: nextSubcategory }, ["year"]))
        .map((document) => document.year);
      const nextYear = !current.year || nextYearOptions.includes(current.year) ? current.year : "";

      if (nextCategory === current.category && nextSubcategory === current.subcategory && nextYear === current.year) {
        return current;
      }

      return { ...current, category: nextCategory, subcategory: nextSubcategory, year: nextYear };
    });
  }, [filters.query, filters.category, filters.subcategory, filters.year]);

  const activeDocuments = useMemo(
    () => {
      if (isSearching) return filtered;
      return filtered.filter((document) =>
        document.categoryKey === activeCategory
        && (!activeSubcategory || document.subcategory === activeSubcategory)
      );
    },
    [filtered, activeCategory, activeSubcategory, isSearching]
  );

  const show3D = render3D && !accessibleMode && !compactMode;
  const showCompact = compactMode;
  const activeFilterCount = [
    filters.query.trim(),
    filters.category,
    filters.subcategory,
    filters.year,
    filters.order !== INITIAL_FILTERS.order
  ].filter(Boolean).length;
  const activeFilterText = `${activeFilterCount} ${activeFilterCount === 1 ? "filtro activo puede" : "filtros activos pueden"}`;
  const categoryCounts = useMemo(
    () => CATEGORY_KEYS.map((category) => ({
      key: category,
      total: libraryDocuments.filter((document) => document.categoryKey === category).length
    })),
    []
  );
  // ponytail: one page is one two-shelf block; mobile keeps the lighter list.
  const pageSize = showCompact ? 50 : show3D ? 20 : 18;
  const pages = useMemo(() => chunkBooks(activeDocuments, pageSize), [activeDocuments, pageSize]);
  const visibleDocuments = pages[page] || [];
  const shareUrl = selectedDocument && typeof window !== "undefined"
    ? `${window.location.origin}/?doc=${encodeURIComponent(selectedDocument.id)}`
    : "";

  const selectDocument = (document, updateUrl = true) => {
    setSelectedDocument(document);
    if (!updateUrl) return;
    const url = new URL(window.location.href);
    if (!document) {
      url.searchParams.delete("doc");
      window.history.replaceState(null, "", url);
      return;
    }
    url.searchParams.set("doc", document.id);
    window.history.replaceState(null, "", url);
  };

  const autocompleteDocuments = useMemo(
    () => libraryDocuments.map((document) => ({
      ...document,
      searchText: documentSearchText(document)
    })),
    []
  );

  const showSearchDocument = (document) => {
    const searchFilters = {
      ...filters,
      query: document.title,
      category: document.categoryKey,
      subcategory: "",
      year: ""
    };
    const query = normalizeText(document.title);
    const searchResults = libraryDocuments
      .filter((item) => searchIncludes(documentSearchText(item), query))
      .sort((a, b) => {
        if (searchFilters.order === "title") return a.title.localeCompare(b.title, "es");
        if (searchFilters.order === "oldest") return latestYear(a.year) - latestYear(b.year);
        return latestYear(b.year) - latestYear(a.year);
      });
    const documentIndex = Math.max(0, searchResults.findIndex((item) => item.id === document.id));

    setActiveCategory(document.categoryKey);
    setActiveSubcategory("");
    setFilters(searchFilters);
    setPage(Math.floor(documentIndex / pageSize));
    selectDocument(document);
  };

  const closeDocument = () => {
    setSelectedDocument(null);
    clearDocumentUrl();
  };

  const copyCitation = async (document) => {
    await navigator.clipboard.writeText(`Gobierno del Estado de Hidalgo. (${document.year}). ${document.title}. Biblioteca Digital de Planeación. ${document.url}`);
  };

  useEffect(() => {
    const documentId = new URLSearchParams(window.location.search).get("doc");
    if (!documentId) return;
    const directDocument = libraryDocuments.find((document) => document.id === documentId);
    if (!directDocument) return;
    const categoryDocuments = libraryDocuments.filter((document) => document.categoryKey === directDocument.categoryKey);
    setActiveCategory(directDocument.categoryKey);
    setActiveSubcategory("");
    setFilters((current) => ({ ...current, category: directDocument.categoryKey, subcategory: "" }));
    setPage(Math.max(0, Math.floor(categoryDocuments.findIndex((document) => document.id === documentId) / pageSize)));
    selectDocument(directDocument, false);
  }, [pageSize]);

  const chooseCategory = (category) => {
    setActiveCategory(category);
    setFilters((current) => ({ ...current, category, subcategory: "" }));
  };

  const quickFilter = (value) => {
    if (value === "clear") {
      setFilters(INITIAL_FILTERS);
      setActiveSubcategory("");
      setActiveCategory(INITIAL_FILTERS.category);
      setPage(0);
      return;
    }
    if (value === "recent") {
      setFilters((current) => ({ ...current, order: "recent", recent: true }));
      return;
    }
    const nextCategory = LIBRARY_TAXONOMY[activeCategory].includes(value)
      ? activeCategory
      : CATEGORY_KEYS.find((category) => LIBRARY_TAXONOMY[category].includes(value));
    setActiveCategory(nextCategory || "planes");
    setActiveSubcategory(value);
    setFilters((current) => ({ ...current, category: nextCategory || "planes", subcategory: value }));
  };

  return (
    <main className={styles.page} ref={searchRef}>
      <LibraryHeader
        total={filtered.length}
        totalGeneral={libraryDocuments.length}
        activeFilterCount={activeFilterCount}
      />

      <section className={styles.libraryShell}>
        <div className={styles.roomTopbar}>
          <div>
            <span>Acervo institucional / Sala principal</span>
            <h1>
              Explora los instrumentos de planeación
              <em className={styles.h1Accent}> de la Biblioteca Digital</em>
            </h1>
          </div>
          <div className={styles.roomStats}>
            <span><b>{activeDocuments.length}</b> documentos</span>
            <span><b>{page + 1}</b> / {Math.max(pages.length, 1)} bloques</span>
            <button
              type="button"
              className={styles.viewModeButton}
              onClick={() => {
                setCompactMode(false);
                setAccessibleMode(show3D);
              }}
              disabled={!render3D}
              aria-pressed={accessibleMode}
            >
              {show3D ? "Modo accesible" : "Modo 3D"}
            </button>
            <button
              type="button"
              className={styles.viewModeButton}
              onClick={() => {
                setAccessibleMode(false);
                setCompactMode((current) => !current);
              }}
              aria-pressed={compactMode}
            >
              {compactMode ? "Salir compacto" : "Modo compacto"}
            </button>
          </div>
        </div>

        <LibraryFilters
          filters={filters}
          setFilters={setFilters}
          categoryOptions={categoryOptions}
          subcategoryOptions={subcategoryOptions}
          years={years}
          onQuickFilter={quickFilter}
          autocompleteDocuments={autocompleteDocuments}
          onSearchSelect={showSearchDocument}
          activeFilterCount={activeFilterCount}
        />

        <nav className={styles.categoryRail} aria-label="Categorías del acervo">
          {categoryOptions.map((category, index) => (
            <button
              key={category}
              className={activeCategory === category ? styles.categoryActive : ""}
              onClick={() => chooseCategory(category)}
            >
              <span>0{index + 1}</span>{CATEGORY_LABELS[category]}
            </button>
          ))}
        </nav>

        <div className={styles.subcategoryBar}>
          <span>Subcategoría</span>
          <button
            className={!activeSubcategory ? styles.subcategoryActive : ""}
            onClick={() => setFilters((current) => ({ ...current, subcategory: "" }))}
          >
            Todas
          </button>
          {subcategoryOptions.map((subcategory) => (
            <button
              key={subcategory}
              className={activeSubcategory === subcategory ? styles.subcategoryActive : ""}
              onClick={() => {
                setFilters((current) => ({ ...current, subcategory }));
                setPage(0);
              }}
            >
              {SUBCATEGORY_LABELS[subcategory]}
            </button>
          ))}
        </div>

        <div className={styles.sceneFrame}>
          {show3D && <Loading3D />}
          {show3D && (
            <LibraryCanvas
              documents={visibleDocuments}
              activeCategory={activeCategory}
              selectedDocument={selectedDocument}
              onSelect={selectDocument}
              tooltipPortal={tooltipPortal}
            />
          )}
          <div ref={tooltipPortal} className={styles.tooltipPortal} />

          {showCompact && (
            <div className={styles.compactTable} aria-label="Documentos en modo compacto">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Subcategoría</th>
                    <th>Año</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDocuments.map((document) => (
                    <tr key={document.id}>
                      <td data-label="Título">{document.title}</td>
                      <td data-label="Categoría">{CATEGORY_LABELS[document.categoryKey]}</td>
                      <td data-label="Subcategoría">{SUBCATEGORY_LABELS[document.subcategory]}</td>
                      <td data-label="Año">{document.year}</td>
                      <td data-label="Acciones">
                        <button type="button" onClick={() => selectDocument(document)}>Ver</button>
                        <a href={document.url} target="_blank" rel="noreferrer">Abrir</a>
                        <button type="button" onClick={() => copyCitation(document)}>Cita</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!showCompact && (
            <div className={`${styles.mobileBooks} ${!show3D ? styles.lightBooks : ""}`} aria-label="Libros visibles">
              {visibleDocuments.map((document) => (
                <button key={document.id} onClick={() => selectDocument(document)}>
                  <span className={styles.mobileBookCover} style={{ "--book-color": document.colorVariant }}>
                    <BibliotecaDigitalLogo compact className={styles.lightBookLogo} />
                    <small>{document.year}</small>
                    <strong title={document.title}>{document.title}</strong>
                  </span>
                </button>
              ))}
            </div>
          )}

          {!visibleDocuments.length && (
            <div className={styles.emptyState}>
              <span>⌕</span>
              <h2>No hay documentos en este estante</h2>
              <p>{activeFilterCount ? `${activeFilterText} estar limitando la vista.` : "Prueba otra categoría con documentos disponibles."}</p>
              {activeFilterCount > 0 && <button type="button" onClick={() => quickFilter("clear")}>Limpiar filtros</button>}
              <div className={styles.emptyCategories}>
                {categoryCounts.filter((category) => category.total > 0).map((category) => (
                  <button key={category.key} type="button" onClick={() => chooseCategory(category.key)}>
                    {CATEGORY_LABELS[category.key]} <b>{category.total}</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.pagination}>
            <button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Página anterior">
              <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.paginationIcon}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span>Página {page + 1} de {Math.max(pages.length, 1)}</span>
            <button disabled={page >= pages.length - 1} onClick={() => setPage((current) => Math.min(pages.length - 1, current + 1))} aria-label="Página siguiente">
              <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.paginationIcon}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.accessibleList}>
          <h2>Documentos visibles</h2>
          {visibleDocuments.map((document) => (
            <button key={document.id} onClick={() => selectDocument(document)}>
              {document.title}, {SUBCATEGORY_LABELS[document.subcategory]}, {document.year}
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedDocument && (
          <>
            <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDocument} />
            <DocumentDetailPanel document={selectedDocument} onClose={closeDocument} shareUrl={shareUrl} />
          </>
        )}
      </AnimatePresence>

      <footer className={styles.footer}>
        <span>Biblioteca Digital de Planeación - Hidalgo</span>
        <span>{pendingClassification.length} pendientes de clasificación técnica</span>
      </footer>
    </main>
  );
}
