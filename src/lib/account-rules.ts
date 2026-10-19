import { z } from 'zod';
export const emailSchema = z.string().trim().email('Escribe un correo válido.').max(254);
export const passwordSchema = z.string().min(10, 'Usa al menos 10 caracteres.').max(128);
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Escribe tu contraseña.').max(128) });
export const registerSchema = z.object({ email: emailSchema, password: passwordSchema, confirm: z.string(), marketing: z.boolean() }).refine(v => v.password === v.confirm, { message: 'Las contraseñas deben coincidir.', path: ['confirm'] });
export const preferenceSchema = z.object({ name: z.string().trim().max(80, 'El nombre admite hasta 80 caracteres.'), marketing: z.boolean() });
export const adminFilterSchema = z.object({ search: z.string().trim().max(254), status: z.enum(['all', 'confirmed', 'pending']), plan: z.enum(['all', 'free', 'premium']), marketing: z.enum(['all', 'yes', 'no']) });
export function safeCsvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@\-\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export const freeTweaks = ['Explorador', 'Game Mode', 'Actividad de navegadores en segundo plano', 'Transparencia', 'Iluminación dinámica'];
