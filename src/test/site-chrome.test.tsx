import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/vtweaks/SiteChrome';

const route=vi.hoisted(()=>({pathname:'/',navigate:vi.fn()}));
vi.mock('@tanstack/react-router',()=>({
  Link:({to,children,...props}:{to:string;children:ReactNode})=><a href={to} {...props}>{children}</a>,
  useNavigate:()=>route.navigate,
  useRouterState:()=>route.pathname,
}));
vi.mock('@/lib/auth',()=>({useAuth:()=>({account:null,recovery:false})}));
vi.mock('@/components/vtweaks/motion',()=>({useMotion:()=>({enabled:false,toggle:vi.fn()})}));
vi.mock('@/components/vtweaks/PageMotion',()=>({PageMotion:()=>null}));
vi.mock('@/components/vtweaks/SiteAtmosphere',()=>({SiteAtmosphere:()=>null}));

beforeEach(()=>{
  route.pathname='/';route.navigate.mockClear();
  vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>window.setTimeout(()=>callback(performance.now()),0));
  vi.stubGlobal('cancelAnimationFrame',(id:number)=>window.clearTimeout(id));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals()});
function mount(){return render(<SiteChrome><h1>Contenido de ejemplo</h1><input aria-label="Control fuera del menú"/></SiteChrome>)}
async function open(){const button=screen.getByRole('button',{name:'Abrir menú'});fireEvent.click(button);await waitFor(()=>expect(screen.getByRole('link',{name:'La app'})).toHaveFocus());return button}

describe('Mobile navigation disclosure',()=>{
  it('focuses the first link when opened',async()=>{mount();const button=await open();expect(button).toHaveAttribute('aria-expanded','true');expect(button).toHaveAttribute('aria-controls','site-nav')});
  it('handles Escape from a navigation link and restores the toggle focus',async()=>{mount();const button=await open();fireEvent.keyDown(screen.getByRole('link',{name:'Juegos'}),{key:'Escape'});expect(button).toHaveAttribute('aria-expanded','false');expect(button).toHaveFocus()});
  it('closes on outside pointer input without leaving focus in hidden navigation',async()=>{mount();const button=await open();fireEvent.pointerDown(screen.getByRole('heading',{name:'Contenido de ejemplo'}));expect(button).toHaveAttribute('aria-expanded','false');expect(button).toHaveFocus()});
  it('allows focus to leave the navigation without trapping it',async()=>{mount();const button=await open();const outside=screen.getByRole('textbox',{name:'Control fuera del menú'});act(()=>outside.focus());expect(button).toHaveAttribute('aria-expanded','false');expect(outside).toHaveFocus()});
  it('closes after a route change and focuses the new main region',async()=>{const view=mount();const button=await open();route.pathname='/juegos';view.rerender(<SiteChrome><h1>Nueva página</h1></SiteChrome>);await waitFor(()=>expect(document.getElementById('contenido')).toHaveFocus());expect(button).toHaveAttribute('aria-expanded','false')});
  it('keeps the main region available to the skip link without an extra tab stop',()=>{mount();expect(screen.getByRole('link',{name:'Saltar al contenido'})).toHaveAttribute('href','#contenido');expect(document.getElementById('contenido')).toHaveAttribute('tabindex','-1')});
});
