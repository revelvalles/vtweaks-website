import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/privacidad')({head:()=>pageHead('Uso y privacidad','Información de cuenta, consentimiento opcional, sesiones, datos locales y límites de los cambios de VTweaks.'),component:PrivacyPage});

