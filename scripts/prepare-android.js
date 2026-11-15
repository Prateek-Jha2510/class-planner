// Reapply the tracked native files to the generated Capacitor project.
import {access,copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const main=path.join(root,'android/app/src/main');
await access(path.join(main,'AndroidManifest.xml')).catch(()=>{throw new Error('Run npm run android:init first.');});
const java=path.join(main,'java/in/classplanner/student');
await mkdir(java,{recursive:true});
for(const name of ['MainActivity.java','PlannerDocuments.java']) await copyFile(path.join(root,'native',name),path.join(java,name));
const drawable=path.join(main,'res/drawable');
await mkdir(drawable,{recursive:true});
await copyFile(path.join(root,'native/planner_icon.xml'),path.join(drawable,'planner_icon.xml'));
const manifest=path.join(main,'AndroidManifest.xml');
let xml=await readFile(manifest,'utf8');
xml=xml.replace(/android:allowBackup="[^"]*"/,'android:allowBackup="false"')
       .replace(/android:(icon|roundIcon)="[^"]*"/g,'android:$1="@drawable/planner_icon"');
await writeFile(manifest,xml);
// Release tags supply the version in CI. Local builds use package.json.
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const version=process.env.PLANNER_VERSION || pkg.version;
if(!/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(version)) throw new Error('Use a numeric version such as 1.0.0.');
const [major,minor,patch]=version.split('.').map(Number);
const code=major*1000000+minor*1000+patch;
const gradle=path.join(root,'android/app/build.gradle');
let config=await readFile(gradle,'utf8');
config=config.replace(/versionCode\s*(?:=\s*)?\d+/, 'versionCode = '+Math.max(code,1))
             .replace(/versionName\s*(?:=\s*)?["'][^"']+["']/, 'versionName = "'+version+'"');
await writeFile(gradle,config);
console.log('Prepared native backup, launcher icon and version '+version+'.');
