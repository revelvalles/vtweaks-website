import { createFileRoute } from '@tanstack/react-router';
import { PlansPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/planes')({head:()=>pageHead('App, ISO y paquetes','VTweaks App 14,99 USD, ISO 19,99 USD e ISO + App 24,99 USD. Pago único; prueba Stripe sin cobro real.'),component:PlansPage});

