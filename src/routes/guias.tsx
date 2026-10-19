import { createFileRoute } from '@tanstack/react-router';
import { GuidesPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/guias')({head:()=>pageHead('Guías prácticas','Guías conservadas de VTweaks: primeros pasos, temporales, restauración, energía y mediciones repetibles.'),component:GuidesPage});

