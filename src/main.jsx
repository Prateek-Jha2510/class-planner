import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {KEY,dateKey,initial,validateBackup} from './model.js';
import Today from './Today.jsx';
import Homework from './Homework.jsx';
import Attendance from './Attendance.jsx';
import Timetable from './Timetable.jsx';
import Settings from './Settings.jsx';
import {Icon} from './ui.jsx';
import './style.css';

function load() {
  try {
    const raw=localStorage.getItem(KEY);
    if(raw!==null) return {data:validateBackup(JSON.parse(raw)),raw};
    const data=initial(), encoded=JSON.stringify(data);
    localStorage.setItem(KEY,encoded);
    return {data,raw:encoded};
  } catch(err) {return {fault:'The saved planner could not be opened. '+err.message};}
}
function App() {
  const [state,setState]=useState(load);
  const [tab,setTab]=useState('Today');
  const [settings,setSettings]=useState(false);
  const [now,setNow]=useState(()=>new Date());
  const picker=useRef(null);
  const data=state.data;
  useEffect(()=>{
    const tick=()=>setNow(new Date());
    const changed=e=>{if(e.key===KEY || e.key===null) setState(load());};
    const timer=setInterval(tick,15000);
    window.addEventListener('storage',changed);window.addEventListener('focus',tick);
    document.addEventListener('visibilitychange',tick);
    return ()=>{clearInterval(timer);window.removeEventListener('storage',changed);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick);};
  },[]);
  useEffect(()=>{document.documentElement.dataset.theme=data?.theme??'System';},[data?.theme]);
  function save(next) {
    try {
      if(data && localStorage.getItem(KEY)!==state.raw) {setState(load());window.alert('Your planner changed in another window. Please repeat your last edit.');return false;}
      const raw=JSON.stringify(next);
      localStorage.setItem(KEY,raw);setState({data:next,raw});return true;
    } catch(err) {window.alert('Could not save on this device. Your previous data is still in storage. '+err.message);return false;}
  }
  const go=next=>{setTab(next);window.scrollTo(0,0);};
  if(!data) return <main><h1>Recover planner</h1><p role="alert">{state.fault}</p><button onClick={()=>picker.current.click()}>Restore JSON backup</button><input hidden ref={picker} type="file" accept=".json,application/json" onChange={async e=>{
    const f=e.target.files?.[0];e.target.value='';if(!f)return;
    try{const next=validateBackup(JSON.parse(await f.text()));if(window.confirm('Replace unreadable data with this backup?'))save(next);}catch(err){window.alert(err.message);}
  }}/><button className="danger" onClick={()=>{if(window.confirm('Erase unreadable data and start empty?'))save(initial(dateKey(),false));}}>Reset all data</button></main>;
  const props={data,save,today:dateKey(now),go,now};
  return <><header><div className="headerInner"><span className="logo" aria-hidden="true"><i/><i/><i/></span><span className="wordmark">Class<span>Planner</span></span><button className="iconbtn" onClick={()=>setSettings(true)} aria-label="Open settings"><Icon name="settings"/></button></div></header>
    <main>{tab==='Today'?<Today {...props}/>:tab==='Homework'?<Homework {...props}/>:tab==='Attendance'?<Attendance {...props} settings={()=>setSettings(true)}/>:<Timetable {...props}/>}</main>
    <nav aria-label="Planner tabs"><div>{['Today','Homework','Attendance','Timetable'].map(t=><button key={t} aria-current={tab===t?'page':undefined} onClick={()=>go(t)}><Icon name={t}/>{t}</button>)}</div></nav>
    {settings && <Settings {...props} close={()=>setSettings(false)}/>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
