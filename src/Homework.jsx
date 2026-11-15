import React,{useState} from 'react';
import {dateKey,subjects,uid,deadline,urgency} from './model.js';
import {Title,Icon,Empty,Field,Modal} from './ui.jsx';
export default function Homework({data,save,now,go}) {
  const today=dateKey(now);
  const options=subjects(data,today);
  const [adding,setAdding]=useState(false);
  const [error,setError]=useState('');
  const ordered=[...data.tasks].sort((a,b)=>deadline(a)-deadline(b) || a.title.localeCompare(b.title));
  const pending=ordered.filter(t=>!t.done), done=ordered.filter(t=>t.done);
  function update(tasks) {return save({...data,tasks});}
  function add(e) {
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.currentTarget));
    const title=f.title.trim();
    if(!title) {setError('Enter a title.');return;}
    if(update([...data.tasks,{...f,title,description:f.description.trim(),id:uid(),done:false}])) setAdding(false);
  }
  function item(t) {
    const [label,color]=urgency(t,now);
    return <article className="task" key={t.id}>
      <input type="checkbox" aria-label={'Mark '+t.title+' '+(t.done?'pending':'done')} checked={t.done} onChange={()=>update(data.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/>
      <div><small className="kicker">{t.subject}</small><h3>{t.title}</h3>{t.description && <p className="description">{t.description}</p>}
      <p className={t.done?'muted':color}>{!t.done && label+' · '}{t.date}{t.time && ' · '+t.time}</p></div>
      <button className="iconbtn" aria-label={'Delete '+t.title} onClick={()=>{if(window.confirm('Delete '+t.title+'?'))update(data.tasks.filter(x=>x.id!==t.id));}}><Icon name="trash" size={17}/></button>
    </article>;
  }
  return <><Title name="Homework"><button className="primary" onClick={()=>{setError('');setAdding(true);}}><Icon name="add"/> Task</button></Title>
    <div className="sectionHead row"><h2>Pending</h2><small>{pending.length} {pending.length===1?'task':'tasks'}</small></div>
    {pending.map(item)}{!pending.length && <Empty title="No pending homework" icon="check">Add an assignment and its deadline here.</Empty>}
    <details className="completed"><summary>Completed ({done.length})</summary>{done.map(item)}{done.length>0 && <button className="soft red" onClick={()=>{if(window.confirm('Delete all completed homework?'))update(pending);}}>Clear completed</button>}</details>
    {adding && <Modal title="New task" close={()=>setAdding(false)}>{options.length ? <form onSubmit={add}>
      <Field label="Title"><input name="title" required maxLength={140} placeholder="e.g. Submit lab record"/></Field>
      <Field label="Subject"><select name="subject">{options.map(s=><option key={s}>{s}</option>)}</select></Field>
      <Field label="Description (optional)"><textarea name="description" rows={3} maxLength={2000}/></Field>
      <div className="pair"><Field label="Due date"><input type="date" name="date" min="2000-01-01" max="2199-12-31" defaultValue={today} required/></Field><Field label="Time (optional)"><input type="time" name="time"/></Field></div>
      {error && <p className="error" role="alert">{error}</p>}<button className="primary wide">Save homework</button>
    </form> : <><p>Add a timetable subject effective today to create a task.</p><button className="primary" onClick={()=>go('Timetable')}>Open timetable</button></>}</Modal>}
  </>;
}
