import React,{useRef,useState} from 'react';
import {initial,validateBackup,validDate} from './model.js';
import {exportBackup} from './backup.js';
import {Modal,Field} from './ui.jsx';
export default function Settings({data,save,today,close}) {
  const file=useRef(null);
  const [msg,setMsg]=useState('');
  const [busy,setBusy]=useState(false);
  async function restore(e) {
    const f=e.target.files?.[0]; e.target.value='';
    if(!f) return;
    try {
      const restored=validateBackup(JSON.parse(await f.text()));
      if(window.confirm('Replace all current planner data with this backup?') && save(restored)) setMsg('Backup restored.');
    } catch(err) {setMsg('Import failed: '+err.message);}
  }
  return <Modal title="Settings" close={close}>
    <Field label="Appearance"><select value={data.theme} onChange={e=>save({...data,theme:e.target.value})}>{['System','Light','Dark'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <form onSubmit={e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));if(validDate(f.since) && save({...data,target:Number(f.target),since:f.since})) setMsg('Settings saved.');}} key={data.target+data.since}>
    <Field label="Attendance target (%)"><input type="number" name="target" required min={60} max={100} step={1} defaultValue={data.target}/></Field>
    <Field label="Check unmarked classes starting"><input type="date" name="since" min="2000-01-01" max={today} defaultValue={data.since} required/></Field><button>Save settings</button></form>
    <h3 className="sectionHead">Backup and restore</h3><p>Save a JSON file before changing phones or uninstalling the app.</p>
    <div className="actions"><button disabled={busy} onClick={async()=>{setBusy(true);try{if(await exportBackup(data))setMsg('Backup exported.');}catch(err){setMsg('Export failed: '+err.message);}finally{setBusy(false);}}}>Export backup</button>
    <button onClick={()=>file.current.click()}>Import backup</button></div><input hidden type="file" ref={file} accept=".json,application/json,text/plain" onChange={restore}/>
    <hr/><button className="danger" onClick={()=>{if(window.confirm('Reset ALL timetables, attendance, homework and settings? This cannot be undone.') && save(initial(today,false))) {close();}}}>Reset all data</button>
    {msg && <p role="status">{msg}</p>}
  </Modal>;
}
