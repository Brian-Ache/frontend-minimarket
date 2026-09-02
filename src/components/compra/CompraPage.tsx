import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import NuevaCompra from "./NuevaCompra";
import HistorialCompras from "./HistorialCompras";

export default function CompraPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="w-full h-full p-3 overflow-hidden">

      <Tabs
        defaultValue="nueva"
        className="w-full h-full flex flex-col"
      >
        <TabsList className="w-fit gap-2">
          <TabsTrigger value="nueva">
            Nueva Compra
          </TabsTrigger>

          <TabsTrigger value="historial">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="nueva"
          className="flex-1 min-h-0 mt-3"
        >
          <NuevaCompra onCompraCreada={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>

        <TabsContent
          value="historial"
          className="flex-1 min-h-0 mt-3"
        >
          <HistorialCompras refreshKey={refreshKey} />
        </TabsContent>

      </Tabs>
    </div>
  );
}