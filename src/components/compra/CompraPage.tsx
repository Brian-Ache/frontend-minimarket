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
    <div className="min-h-full w-full p-2 sm:p-3 md:h-full md:overflow-hidden">

      <Tabs
        defaultValue="nueva"
        className="flex w-full flex-col md:h-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:w-fit">
          <TabsTrigger value="nueva">
            Nueva Compra
          </TabsTrigger>

          <TabsTrigger value="historial">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="nueva"
          className="mt-3 data-[state=inactive]:hidden md:flex-1 md:min-h-0"
        >
          <NuevaCompra onCompraCreada={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>

        <TabsContent
          value="historial"
          className="mt-3 data-[state=inactive]:hidden md:flex-1 md:min-h-0"
        >
          <HistorialCompras refreshKey={refreshKey} />
        </TabsContent>

      </Tabs>
    </div>
  );
}