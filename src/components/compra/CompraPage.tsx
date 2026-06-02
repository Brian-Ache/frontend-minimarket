import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import NuevaCompra from "./NuevaCompra";
import HistorialCompras from "./HistorialCompras";

export default function CompraPage() {
  return (
    <div className="w-full h-full p-3 overflow-hidden">

      <Tabs
        defaultValue="nueva"
        className="w-full h-full flex flex-col"
      >

        {/* 🔝 Tabs */}
        <TabsList className="w-fit">
          <TabsTrigger value="nueva">
            Nueva Compra
          </TabsTrigger>

          <TabsTrigger value="historial">
            Historial
          </TabsTrigger>
        </TabsList>

        {/* 📦 Nueva compra */}
        <TabsContent
          value="nueva"
          className="flex-1 min-h-0 mt-3"
        >
          <NuevaCompra />
        </TabsContent>

        {/* 📋 Historial */}
        <TabsContent
          value="historial"
          className="flex-1 min-h-0 mt-3"
        >
          <HistorialCompras />
        </TabsContent>

      </Tabs>
    </div>
  );
}