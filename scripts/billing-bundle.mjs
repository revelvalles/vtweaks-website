import fs from 'node:fs';
const migration='supabase/migrations/20261013173712_vtweaks_billing.sql';
if(process.argv[2]==='sql')console.log(JSON.stringify({query:fs.readFileSync(migration,'utf8')}));
else {
 const name=process.argv[2];if(!['vt-billing','vt-stripe-webhook','vt-checkout-status'].includes(name))throw Error('Unknown function');
 const files=[{name:'index.ts',content:fs.readFileSync('supabase/functions/'+name+'/index.ts','utf8').replaceAll('../_shared/billing.ts','./billing.ts').replaceAll('../_shared/products.ts','./products.ts')},{name:'billing.ts',content:fs.readFileSync('supabase/functions/_shared/billing.ts','utf8')},{name:'products.ts',content:fs.readFileSync('supabase/functions/_shared/products.ts','utf8')},{name:'deno.json',content:fs.readFileSync('supabase/functions/deno.json','utf8')}];
 console.log(JSON.stringify({name,project_id:'rybwxspbtleugpfjdybx',entrypoint_path:'index.ts',import_map_path:'deno.json',files,verify_jwt:name==='vt-billing'}));
}
