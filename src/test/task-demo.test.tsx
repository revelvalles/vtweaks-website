import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDemo } from '@/components/vtweaks/TaskDemo';

beforeEach(() => {
  vi.useFakeTimers({toFake:['setTimeout','clearTimeout','performance']});
  vi.stubGlobal('requestAnimationFrame', (callback:FrameRequestCallback) => window.setTimeout(() => callback(performance.now()),16));
  vi.stubGlobal('cancelAnimationFrame', (id:number) => window.clearTimeout(id));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function apply() {
  render(<TaskDemo />); fireEvent.click(screen.getByRole('button',{name:'Aplicar tweak'}));
  return screen.getByRole('button',{name:'Mantén pulsado para revertir el ajuste'});
}
describe('Hold to revert illustration', () => {
  it('cancels a short keyboard hold without reverting', () => {
    const revert=apply(); fireEvent.keyDown(revert,{key:' '}); act(() => vi.advanceTimersByTime(250)); fireEvent.keyUp(revert,{key:' '});
    act(() => vi.advanceTimersByTime(1500)); expect(screen.getByText('Desactivadas')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Original restaurado'})).not.toBeInTheDocument();
  });
  it('restores only after a complete hold and can apply again', () => {
    const revert=apply(); fireEvent.keyDown(revert,{key:'Enter'}); act(() => vi.advanceTimersByTime(1150)); fireEvent.keyUp(revert,{key:'Enter'});
    expect(screen.getByRole('button',{name:'Original restaurado'})).toBeInTheDocument(); expect(screen.getByText('Permitidas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Aplicar tweak'})); expect(screen.getByText('Desactivadas')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Mantén pulsado para revertir el ajuste'})).toBeEnabled();
  });
  it('cancels when focus leaves the held button', () => {
    const revert=apply(); fireEvent.keyDown(revert,{key:' '}); act(() => vi.advanceTimersByTime(400)); fireEvent.blur(revert);
    act(() => vi.advanceTimersByTime(1500)); expect(screen.getByText('Desactivadas')).toBeInTheDocument();
  });
});
