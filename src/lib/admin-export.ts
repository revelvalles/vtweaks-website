import { AccountActionError } from './account-request';
interface ExportPage<T> {total:number;rows:T[]}
/** Collect only while the original administrator remains the current account. */
export async function collectAdminExport<T extends {id:string}>(fetchPage:(offset:number)=>Promise<ExportPage<T>>,valid:()=>boolean,signal:AbortSignal):Promise<T[]> {
  const check=()=>{if(signal.aborted||!valid())throw new AccountActionError('La sesión cambió. La exportación se canceló.');};
  check();const first=await fetchPage(0);check();
  if(!Number.isInteger(first.total)||first.total<0)throw new AccountActionError('Respuesta del servicio no válida.');
  if(first.total>10000)throw new AccountActionError('Filtra a un máximo de 10.000 cuentas.');
  const rows=[...first.rows];
  for(let offset=100;offset<first.total;offset+=100){
    check();const page=await fetchPage(offset);check();
    if(page.total!==first.total)throw new AccountActionError('La lista cambió. Vuelve a exportar.');
    rows.push(...page.rows);
  }
  check();
  if(rows.length!==first.total||new Set(rows.map(row=>row.id)).size!==first.total)throw new AccountActionError('La lista cambió. Vuelve a exportar.');
  return rows;
}
