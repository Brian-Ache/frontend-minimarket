import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  crearProveedor,
  eliminarProveedor,
  getProveedores,
  modificarProveedor,
} from "@/services/productoService";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";

/**
 * ModalProveedores — Gestión de proveedores desde el header de la compra.
 *
 * Muestra los proveedores activos y permite crear, editar y dar de baja sin
 * salir del formulario de compra. El backend hace baja lógica, por eso no hay
 * ninguna validación de productos o compras asignados: la referencia vieja se
 * conserva. Los errores (duplicados, email inválido, permisos) llegan en
 * `response.data.error` y se muestran en rojo.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  onCreada?: (id: string) => void;
}

const mensajeDeError = (err: unknown) =>
  (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
  "Ocurrió un error inesperado";

export default function ModalProveedores({ open, onClose, onCreada }: Props) {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = async () => {
    setCargando(true);
    try {
      setProveedores(await getProveedores());
    } catch {
      setError("No se pudieron cargar los proveedores");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setEditandoId(null);
    recargar();
  }, [open]);

  const limpiar = () => {
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setEditandoId(null);
  };

  const guardar = async () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (editandoId) {
        await modificarProveedor(
          editandoId,
          nombreLimpio,
          telefono.trim(),
          email.trim(),
          direccion.trim()
        );
      } else {
        const creado = await crearProveedor(
          nombreLimpio,
          telefono.trim(),
          email.trim(),
          direccion.trim()
        );
        onCreada?.(creado.id);
      }
      limpiar();
      await recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const editar = (proveedor: ProveedorResponse) => {
    setEditandoId(proveedor.id);
    setNombre(proveedor.nombre);
    setTelefono(proveedor.telefono ?? "");
    setEmail(proveedor.email ?? "");
    setDireccion(proveedor.direccion ?? "");
    setError(null);
  };

  const borrar = async (proveedor: ProveedorResponse) => {
    if (!window.confirm(`¿Eliminar el proveedor «${proveedor.nombre}»?`)) return;
    setBorrandoId(proveedor.id);
    setError(null);
    try {
      await eliminarProveedor(proveedor.id);
      if (editandoId === proveedor.id) limpiar();
      await recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setBorrandoId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Proveedores</DialogTitle>
          <DialogDescription>
            Administrá los proveedores de las compras.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label className="text-slate-600">{editandoId ? "Editando" : "Nuevo proveedor"}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Nombre"
              value={nombre}
              autoFocus
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
            />
            <Input
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
            />
            <Input
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Teléfono</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Dirección</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">Cargando...</td>
              </tr>
            ) : proveedores.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">
                  No hay proveedores cargados
                </td>
              </tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-slate-50">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.telefono || "—"}</td>
                  <td className="p-2">{p.email || "—"}</td>
                  <td className="p-2">{p.direccion || "—"}</td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Editar"
                      onClick={() => editar(p)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      title="Eliminar"
                      disabled={borrandoId === p.id}
                      onClick={() => borrar(p)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <DialogFooter className="flex flex-row justify-between items-center w-full">
          {editandoId && (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={limpiar}>
              Cancelar edición
            </Button>
          )}
          <div className={`flex gap-2 ${editandoId ? "" : "ml-auto"}`}>
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={guardar}
              disabled={guardando || cargando}
            >
              {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Guardar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
