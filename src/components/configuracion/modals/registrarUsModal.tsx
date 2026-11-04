import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { invitarUsuario, type RolInvitacion } from "@/services/usuarioService";
import { useAuth } from "@/context/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  username?: string;
  rol?: string;
  general?: string;
}

export default function RegistrarUsModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  // Jerarquía del backend: solo se invita por debajo del propio nivel.
  // SUPERADMIN invita ADMIN y EMPLEADO; ADMIN solo EMPLEADO.
  const rolesPermitidos: RolInvitacion[] =
    user?.rol === "SUPERADMIN" ? ["ADMIN", "EMPLEADO"] : ["EMPLEADO"];

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    // Un ADMIN solo puede invitar empleados: con una única opción se preselecciona.
    rol: rolesPermitidos.length === 1 ? rolesPermitidos[0] : "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (form.username.includes("@")) {
      newErrors.username = "El nombre de usuario no puede contener @";
    }

    if (!form.rol) newErrors.rol = "Selecciona un rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const cuenta = await invitarUsuario({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        ...(form.username.trim() ? { username: form.username.trim() } : {}),
        rol: form.rol as RolInvitacion,
      });
      alert(
        `Invitación enviada a ${cuenta.email}. La persona recibe un mail para definir su contraseña (vence en 72 h).`
      );
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const data = err.response?.data;
      const detalle = Array.isArray(data?.details) ? data.details.join(", ") : "";
      setErrors({
        general: data?.error ? `${data.error}${detalle ? ` — ${detalle}` : ""}` : "Error al enviar la invitación",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      username: "",
      rol: rolesPermitidos.length === 1 ? rolesPermitidos[0] : "",
    });
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invitar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Se enviará un mail con el enlace para que la persona defina su contraseña.
            Nadie conoce esa contraseña desde acá.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Nombre</Label>
              <Input
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
              {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Apellido</Label>
              <Input
                placeholder="Apellido"
                value={form.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
              />
              {errors.apellido && <p className="text-red-500 text-xs">{errors.apellido}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Nombre de usuario (opcional)</Label>
            <Input
              placeholder="Si se deja vacío se deriva del email"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Rol</Label>
            <Select value={form.rol} onValueChange={(value) => handleChange("rol", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesPermitidos.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {rol === "ADMIN" ? "Admin" : "Empleado"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-red-500 text-xs">{errors.rol}</p>}
          </div>

          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Invitar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
