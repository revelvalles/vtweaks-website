import { createFileRoute } from '@tanstack/react-router';
import { GamesPage } from '@/components/vtweaks/ContentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/juegos')({head:()=>pageHead('Windows antes de jugar','Casos de uso de ajustes generales de Windows. No son presets por juego ni certificaciones anticheat.'),component:GamesPage});

