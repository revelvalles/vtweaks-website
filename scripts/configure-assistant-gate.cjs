'use strict';
// Generates a dedicated server-to-database gate; never writes the secret to disk.
const {randomBytes,createHash}=require('node:crypto');
const {spawn}=require('node:child_process');
const cli=process.argv[2];
if(!cli)throw Error('Indica la ruta de la CLI oficial de Vercel.');
const secret=randomBytes(32).toString('hex');
const child=spawn(process.execPath,[cli,'env','add','VTWEAKS_AI_GATE','production','--sensitive','--yes','--scope','velpris-projects'],{cwd:require('node:path').resolve(__dirname,'..'),stdio:['pipe','pipe','pipe'],windowsHide:true});
let output='';
child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
child.stdin.end(secret);
child.on('error',()=>{process.stderr.write('No se pudo ejecutar la CLI.\n');process.exitCode=1;});
child.on('close',code=>{if(code!==0){process.stderr.write(output.split(secret).join('[REDACTED]'));process.exitCode=1;return;}process.stdout.write(JSON.stringify({saved:true,sha256:createHash('sha256').update(secret).digest('hex')})+'\n');});
