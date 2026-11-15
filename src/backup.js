import {Capacitor,registerPlugin} from '@capacitor/core';
import {dateKey} from './model.js';

const Documents = registerPlugin('PlannerDocuments');
export async function exportBackup(data) {
  const text=JSON.stringify(data,null,2);
  const filename='class-planner-'+dateKey()+'.json';
  if(Capacitor.getPlatform()==='android') {
    const result=await Documents.save({filename,text});
    return !result.cancelled;
  }
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url; a.download=filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  return true;
}
