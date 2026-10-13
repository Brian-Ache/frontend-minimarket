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
  crearCategoria,
  eliminarCategoria,
  getCategorias,
  modificarCategoria,
} from "@/services/productoService";
import type { CategoriaResponse } from "@/types/response/categoriaResponse";

/**
 * ModalCategorias — Gestión de categorías desde el formulario de productos.
 *
 * Muestra el listado completo y permite crear, editar y dar de baja categorías
 * sin salir del formulario de carga. El backend hace baja lógica y se niega a
 * borrar una categoría con productos asignados; esos mensajes llegan en
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

export default function ModalCategorias({ open, onClose, onCreada }: Props) {
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = async () => {
    setCargando(true);
    try {
      setCategorias(await getCategorias());
    } catch {
      setError("No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNombre("");
    setDescripcion("");
    setEditandoId(null);
    recargar();
  }, [open]);

  const limpiar = () => {
    setNombre("");
    setDescripcion("");
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
        await modificarCategoria(editandoId, nombreLimpio, descripcion.trim());
      } else {
        const creada = await crearCategoria(nombreLimpio, descripcion.trim());
        onCreada?.(creada.id);
      }
      limpiar();
      await recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const editar = (categoria: CategoriaResponse) => {
    setEditandoId(categoria.id);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion ?? "");
    setError(null);
  };

  const borrar = async (categoria: CategoriaResponse) => {
    if (!window.confirm(`¿Eliminar la categoría «${categoria.nombre}»?`)) return;
    setBorrandoId(categoria.id);
    setError(null);
    try {
      await eliminarCategoria(categoria.id);
      if (editandoId === categoria.id) limpiar();
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
          <DialogTitle className="text-2xl font-bold">Categorías</DialogTitle>
          <DialogDescription>
            Administrá las categorías de los productos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label className="text-slate-600">{editandoId ? "Editando" : "Nueva categoría"}</Label>
          <Input
            placeholder="Nombre"
            value={nombre}
            autoFocus
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
          />
          <Input
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-400">Cargando...</td>
              </tr>
            ) : categorias.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-400">
                  No hay categorías cargadas
                </td>
              </tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-slate-50">
                  <td className="p-2">{c.nombre}</td>
                  <td className="p-2">{c.descripcion || "—"}</td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Editar"
                      onClick={() => editar(c)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      title="Eliminar"
                      disabled={borrandoId === c.id}
                      onClick={() => borrar(c)}
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
