import { useState, useRef } from "react";
import {TabReporte } from "./ReportesSideBar";
import ReportesSidebar from "./ReportesSideBar";
import VistaGeneral from "./VistaGeneral";
import VistaProductos from "./VistaProductos";
import VistaProveedores from "./VistaProveedores";

const tabs: TabReporte[] = ["general", "productos", "proveedores"];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<TabReporte>("general");
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;

    const currentIndex = tabs.indexOf(activeTab);
    if (diff > 0 && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (diff < 0 && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden flex flex-col">
      <div className="md:hidden shrink-0">
        <ReportesSidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
        />
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block shrink-0">
          <ReportesSidebar 
            activeTab={activeTab} 
            onSelectTab={setActiveTab} 
          />
        </div>

        <main
          className="flex-1 flex flex-col overflow-y-auto p-6 md:p-6 pt-2 md:pt-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {activeTab === "general" && (<VistaGeneral></VistaGeneral>)}
          {activeTab === "productos" && (
            <VistaProductos></VistaProductos>
          )}
          {activeTab === "proveedores" && (
            <VistaProveedores></VistaProveedores>
          )}
        </main>
      </div>
    </div>  
  );
}