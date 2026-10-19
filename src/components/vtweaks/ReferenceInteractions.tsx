import { useEffect } from 'react';
import { useMotion } from './motion';
export function ReferenceInteractions({pathname}:{pathname:string}){
  const {enabled}=useMotion();
  useEffect(()=>{
    const nav=document.querySelector<HTMLElement>('.nav-links'),pill=nav?.querySelector<HTMLElement>('.nav-selection');
    if(!nav||!pill)return;
    let frame=0;
    const compact=matchMedia('(max-width: 640px)');
    const sync=()=>{frame=0;const active=nav.querySelector<HTMLElement>('a[aria-current=page]');if(!active||compact.matches){nav.dataset['capsule']='false';return;}pill.style.width=active.offsetWidth+'px';pill.style.height=active.offsetHeight+'px';pill.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px)`;nav.dataset['capsule']='true';};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(sync);};
    const resize=new ResizeObserver(schedule);resize.observe(nav);const observer=new MutationObserver(schedule);observer.observe(nav,{attributes:true,attributeFilter:['aria-current'],subtree:true});
    sync();window.addEventListener('resize',schedule);compact.addEventListener('change',schedule);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('resize',schedule);compact.removeEventListener('change',schedule);};
  },[pathname,enabled]);
  return null;
}
