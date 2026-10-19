import { createFileRoute } from '@tanstack/react-router';
import { HelpPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/ayuda')({head:()=>pageHead('Centro de ayuda','Busca respuestas prácticas sobre compatibilidad, mantenimiento y restauración en VTweaks.'),component:HelpPage});

