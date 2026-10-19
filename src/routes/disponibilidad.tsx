import { createFileRoute } from '@tanstack/react-router';
import { AvailabilityPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/disponibilidad')({head:()=>pageHead('Disponibilidad y versiones','VTweaks v3.2 está en desarrollo. Consulta requisitos y estado del instalador, licencias y distribución.'),component:AvailabilityPage});

