import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '@/components/vtweaks/AccountPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/cuenta')({head:()=>pageHead('Tu cuenta','Inicia sesión, crea una cuenta o consulta tus preferencias y estado real de licencia VTweaks.'),component:AccountPage});

