import { createFileRoute } from '@tanstack/react-router';
import { ProductPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/como-funciona')({head:()=>pageHead('Cómo funciona','Inspecciona, elige, verifica y restaura ajustes de Windows. Compatibilidad, permisos y límites reales de VTweaks.'),component:ProductPage});

