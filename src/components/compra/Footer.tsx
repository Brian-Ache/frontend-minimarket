import { Button } from "@/components/ui/button";

type CompraFooterProps = {
  total: number;
  onSave: () => Promise<void>;
  loading?: boolean;
};

export default function CompraFooter({ total, onSave, loading }: CompraFooterProps) {
  return (
    <div className="flex justify-between items-center">

      <div className="text-3xl font-bold text-blue-600">
        Total: ${total.toFixed(2)}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary">
          Cancelar
        </Button>

        <Button  className="bg-emerald-600 hover:bg-emerald-700" onClick={onSave} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Compra"}
        </Button>
      </div>

    </div>
  );
}