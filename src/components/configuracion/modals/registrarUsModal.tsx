import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import api from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  usuario?: string;
  email?: string;
  telefono?: string;
  password?: string;
  confirmarPassword?: string;
  rol?: string;
}

const ROLES = ["Admin", "Empleado"];

export default function RegistrarUsModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    email: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
    rol: "",
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
    if (!form.usuario.trim()) newErrors.usuario = "El usuario es obligatorio";

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }

    if (!form.confirmarPassword) {
      newErrors.confirmarPassword = "Confirma la contraseña";
    } else if (form.password !== form.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas no coinciden";
    }

    if (!form.rol) newErrors.rol = "Selecciona un rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      ///ESTA SERIA LA LLAMADA AL ENDPOINT ORIGINAL
      // const { data } = await api.post("/api/auth/v1/register", {
      //   nombre: form.nombre,
      //   apellido: form.apellido,
      //   email: form.email,
      //   username: form.usuario,
      //   password: form.password,
      // });
      console.log("Usuario registrado:", form);
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al registrar usuario";
      setErrors({ usuario: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      usuario: "",
      email: "",
      telefono: "",
      password: "",
      confirmarPassword: "",
      rol: "",
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
          <DialogTitle>Registrar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <Label>Usuario</Label>
            <Input
              placeholder="Nombre de usuario"
              value={form.usuario}
              onChange={(e) => handleChange("usuario", e.target.value)}
            />
            {errors.usuario && <p className="text-red-500 text-xs">{errors.usuario}</p>}
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
            <Label>Teléfono</Label>
            <Input
              placeholder="Opcional"
              value={form.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                placeholder="Repetir contraseña"
                value={form.confirmarPassword}
                onChange={(e) => handleChange("confirmarPassword", e.target.value)}
              />
              {errors.confirmarPassword && <p className="text-red-500 text-xs">{errors.confirmarPassword}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Rol</Label>
            <Select value={form.rol} onValueChange={(value) => handleChange("rol", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-red-500 text-xs">{errors.rol}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
