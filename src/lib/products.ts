export const products = [
  {id:'app',name:'VTweaks App',amount:1499,currency:'usd',description:'Ajustes y mantenimiento para tu Windows actual.',features:['Catálogo de ajustes de la app','Monitor y medición de dispositivos','Mantenimiento e historial de cambios'],includesApp:true,includesIso:false},
  {id:'iso',name:'VTweaks ISO',amount:1999,currency:'usd',description:'La propuesta de sistema VTweaks para una instalación limpia.',features:['Paquete de sistema, pendiente de entrega','Instalación limpia de Windows','Sin licencia Premium de la app'],includesApp:false,includesIso:true},
  {id:'bundle',name:'ISO + App',amount:2499,currency:'usd',description:'Empieza con el sistema y mantenlo con la app.',features:['Todo lo incluido en VTweaks App','Paquete ISO para instalación limpia, en preparación','Ambos productos en la misma cuenta'],includesApp:true,includesIso:true},
] as const;
export type ProductId = typeof products[number]['id'];
export function productId(value:unknown):ProductId|undefined {return products.find(p=>p.id===value)?.id}
export const productName=(value:unknown)=>products.find(p=>p.id===value)?.name||'VTweaks App';
export const productMoney=(amount:number,currency:string)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:currency.toUpperCase(),currencyDisplay:'code',maximumFractionDigits:2}).format(amount/100);
export function purchasePath(id:ProductId){return '/cuenta?product='+id+'&checkout=1#compras'}
