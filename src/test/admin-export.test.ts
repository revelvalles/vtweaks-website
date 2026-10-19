import { describe, expect, it, vi } from 'vitest';
import { collectAdminExport } from '../lib/admin-export';
describe('administrative export guard',()=>{
 it('refuses to collect rows if the original administrator is no longer current',async()=>{
  let valid=true,resolve!:(value:any)=>void;const page=vi.fn(()=>new Promise<any>(done=>{resolve=done}));
  const result=collectAdminExport(page,()=>valid,new AbortController().signal).catch(error=>error);
  valid=false;resolve({total:1,rows:[{id:'mock-user'}]});
  expect((await result).message).toContain('se canceló');expect(page).toHaveBeenCalledTimes(1);
 });
 it('cancels between pages and does not return rows after caller abort',async()=>{
  const controller=new AbortController();const page=vi.fn(async()=>{controller.abort();return {total:150,rows:[{id:'mock-user'}]}});
  await expect(collectAdminExport(page,()=>true,controller.signal)).rejects.toThrow('se canceló');expect(page).toHaveBeenCalledTimes(1);
 });
 it('rejects a changed or duplicated list before generating a CSV',async()=>{
  const page=vi.fn().mockResolvedValueOnce({total:101,rows:Array.from({length:100},(_,i)=>({id:String(i)}))}).mockResolvedValueOnce({total:101,rows:[{id:'0'}]});
  await expect(collectAdminExport(page,()=>true,new AbortController().signal)).rejects.toThrow('La lista cambió');
 });
});
