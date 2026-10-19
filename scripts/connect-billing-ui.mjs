import fs from 'node:fs';
function edit(file,from,to){let s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw Error(file+' missing '+from.slice(0,70));fs.writeFileSync(file,s.replace(from,to));}
edit('src/components/vtweaks/AccountPages.tsx',"import { PageHead, Busy, InfoNote, CheckList } from './shared';","import { PageHead, Busy, InfoNote, CheckList } from './shared';\nimport { BillingPanel } from './BillingPanel';\nimport './billing.css';");
edit('src/components/vtweaks/AccountPages.tsx','Un plan Premium no se presenta como activo si el servicio no lo confirma en su estado de licencia. No se venden ni activan licencias aquí.','La licencia comercial depende del estado confirmado por el servicio. Los pagos de prueba se muestran por separado.');
edit('src/components/vtweaks/AccountPages.tsx','<p className="small-note">La sesión de Windows se administra por separado.</p></aside>','<p className="small-note">La sesión de Windows se administra por separado.</p><BillingPanel/></aside>');
edit('src/components/vtweaks/shared.tsx','29 ajustes con implementación','Catálogo de ajustes implementados');
edit('src/components/vtweaks/shared.tsx','<Link to="/planes">Explorar la propuesta <ArrowUpRight/></Link>','<Link to="/cuenta">Consultar licencia y pagos <ArrowUpRight/></Link>');
edit('src/components/vtweaks/shared.tsx','Precio, pagos y activación comercial en preparación.','Precio público por anunciar. Pruebas de pago disponibles para administración.');
