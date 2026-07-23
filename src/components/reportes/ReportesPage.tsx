import { useState } from "react";
import {TabReporte } from "./ReportesSideBar";
import ReportesSidebar from "./ReportesSideBar";
import VistaGeneral from "./VistaGeneral";
import VistaProductos from "./VistaProductos";
import VistaProveedores from "./VistaProveedores";

export default function ReportesPage() {
  // Estado para controlar qué pestaña está seleccionada (por defecto "general")
  const [activeTab, setActiveTab] = useState<TabReporte>("general");

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Pasamos la pestaña activa y la función para cambiarla */}
      <ReportesSidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      {/* ÁREA DE CONTENIDO (Se actualizará según activeTab) */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6">
        {activeTab === "general" && (<VistaGeneral></VistaGeneral>)}
        {activeTab === "productos" && (
          <VistaProductos></VistaProductos>
        )}
        {activeTab === "proveedores" && (
          <VistaProveedores></VistaProveedores>
        )}
      </main>
    </div>  
  );
}