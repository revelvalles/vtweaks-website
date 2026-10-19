import { createFileRoute } from '@tanstack/react-router';
import { AdminPage } from '@/components/vtweaks/AccountPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/administracion')({head:()=>pageHead('Administración de cuentas','Consulta y exportación de cuentas restringidas a administradores autorizados por el servicio existente.'),component:AdminPage});

