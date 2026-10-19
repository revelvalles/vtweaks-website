import { createFileRoute } from '@tanstack/react-router';
import { RecoveryPage } from '@/components/vtweaks/AccountPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/recuperar')({head:()=>pageHead('Recuperar acceso','Solicita un enlace de recuperación o establece una nueva contraseña desde una sesión de recuperación válida.'),component:RecoveryPage});

