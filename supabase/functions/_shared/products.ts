export const catalog = [
  {id:'app',name:'VTweaks App',amount:1499,currency:'usd',testPrice:'price_1UQiRWChkdIuPYsYI3X1GeOK',legacyTestPrices:[{id:'price_1UQTaSChkdIuPYsYR8qSLOnI',amount:1000}]},
  {id:'iso',name:'VTweaks ISO',amount:1999,currency:'usd',testPrice:'price_1UQiZkChkdIuPYsYsRg7SFqe',legacyTestPrices:[{id:'price_1UQTekChkdIuPYsYFUwWkwOq',amount:1500}]},
  {id:'bundle',name:'ISO + App',amount:2499,currency:'usd',testPrice:'price_1UQie8ChkdIuPYsYvurZuV4W',legacyTestPrices:[{id:'price_1UQThwChkdIuPYsYuUdYz9f9',amount:3000}]},
] as const;
export function supportedProduct(value:unknown){return catalog.some(p=>p.id===value)}
