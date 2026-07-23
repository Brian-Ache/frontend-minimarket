import { useState } from "react";

export type TabReporte = "general" | "productos" | "proveedores";

interface ReportesSidebarProps {
  activeTab: TabReporte;
  onSelectTab: (tab: TabReporte) => void;
}

export default function ReportesSidebar({ activeTab, onSelectTab }: ReportesSidebarProps) {
  const [isCollapsed] = useState(false);

  const menuItems = [
    {
      id: "general" as TabReporte,
      label: "General (KPIs)",
      description: "Salud global y caja",
    },
    {
      id: "productos" as TabReporte,
      label: "Productos y Rotación",
      description: "Top ventas y hueso",
    },
    {
      id: "proveedores" as TabReporte,
      label: "Proveedores y Rubros",
      description: "Participación y márgenes",
    },
  ];

  return (
    <aside
      className={`h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none overflow-hidden shrink-0 ${
        isCollapsed ? "w-16" : "w-52"
      }`}
    >
      {/* SECCIÓN SUPERIOR (Header + Lista de Menú) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Secciones
            </span>
          )}
        </div>

        {/* NAVEGACIÓN (Toma el espacio sobrante con scroll si hace falta) */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all relative group ${
                  isActive
                    ? "bg-indigo-50/70 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                )}

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="text-xs truncate leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER (Fijo en el fondo del aside) */}
      {!isCollapsed && (
        <div className="h-[150px] text-center py-6 bg-slate-50 border-t border-slate-100 shrink-0">
          <p className="text-[11px] font-medium text-slate-600">Modo Consolidado</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Métricas acumuladas.
          </p>
        </div>
      )}
    </aside>
  );
}