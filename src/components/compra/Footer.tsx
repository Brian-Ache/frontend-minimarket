import { Button } from "@/components/ui/button";

type CompraFooterProps = {
  total: number;
  onSave: () => Promise<void>;
  loading?: boolean;
};

export default function CompraFooter({ total, onSave, loading }: CompraFooterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div className="text-right text-2xl font-bold text-blue-600 sm:text-left sm:text-3xl">
        Total: ${total.toFixed(2)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button className="w-full" variant="secondary">
          Cancelar
        </Button>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={onSave} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Compra"}
        </Button>
      </div>

    </div>
  );
}