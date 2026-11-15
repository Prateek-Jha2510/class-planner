import React,{useState} from 'react';
import {DAYS,weekday,weekAt,changeWeek,readWeek,cleanClass,sortSlots,uid,validDate} from './model.js';
import {dtuWeek,SEMESTER} from './preset.js';
import sample from '../examples/timetable.json?raw';
import {Title,Icon,Field,Tile,Empty,Modal} from './ui.jsx';
export default function Timetable({data,save,today}) {
  const [date,setDate]=useState(today);
  const [day,setDay]=useState(weekday(today));
  const [mode,setMode]=useState('');
  const [editing,setEditing]=useState(null);
  const [error,setError]=useState('');
  const week=weekAt(data,date);
  function open(m,entry=null) {setEditing(entry);setError('');setMode(m);}
  function commit(rows) {
    if(save(changeWeek(data,date,rows))) setMode('');
  }
  function handle(e) {
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.currentTarget));
    try {
      if(mode==='class') {
        const c=cleanClass({...f,id:editing?.id??uid()},0,true);
        commit([...week.filter(old=>old.id!==c.id),c]);setDay(c.day);
      } else {
        const rows=mode==='import' ? readWeek(JSON.parse(f.json)) : dtuWeek(f.group,f.activities==='on',f.tutorials==='on');
        if(window.confirm('Replace the weekly timetable from '+date+' with '+rows.length+' classes? Recorded dates keep their original classes.')) commit(rows);
      }
    } catch(err) {setError(err.message);}
  }
  const rows=sortSlots(week.filter(c=>c.day===day));
  return <><Title name="Timetable"><button className="primary" onClick={()=>open('class')}><Icon name="add"/> Class</button></Title>
    <div className="panel toolbar"><Field label="Edit week effective from"><input aria-label="Edit week effective from" type="date" min="2000-01-01" max="2199-12-31" value={date} onChange={e=>{if(validDate(e.target.value))setDate(e.target.value);}}/></Field>
    <div className="actions"><button onClick={()=>open('import')}><Icon name="import" size={16}/> Import timetable</button><button onClick={()=>open('preset')}>DTU B19 preset</button></div></div>
    <div className="days">{DAYS.map(d=><button key={d} aria-pressed={d===day} onClick={()=>setDay(d)}>{d}</button>)}</div>
    <div className="row sectionHead"><h2>{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][DAYS.indexOf(day)]}</h2><small>{rows.length} {rows.length===1?'class':'classes'}</small></div>
    {rows.map(c=><Tile key={c.id} classItem={c}><div className="classActions"><button className="soft" onClick={()=>open('class',c)}><Icon name="edit" size={15}/>Edit</button><button className="iconbtn red" aria-label={'Delete '+c.subject} onClick={()=>{if(window.confirm('Delete '+c.subject+' from this weekly timetable?')) commit(week.filter(x=>x.id!==c.id));}}><Icon name="trash" size={17}/></button></div></Tile>)}
    {!rows.length && <Empty title="No classes this day">Tap + Class to add one.</Empty>}
    <p className="footnote">Edits apply from the selected date until the next timetable version. A date with attendance or a holiday keeps its saved class list.</p>
    {mode && <Modal title={mode==='class'?(editing?'Edit class':'Add class'):mode==='preset'?'DTU B19 timetable':'Import timetable'} close={()=>setMode('')}><form onSubmit={handle}>
      {mode==='class' && <>
        <Field label="Subject"><input name="subject" required maxLength={100} defaultValue={editing?.subject} list="known-subjects" placeholder="e.g. Physics"/></Field>
        <datalist id="known-subjects">{[...new Set(week.map(c=>c.subject))].map(s=><option key={s}>{s}</option>)}</datalist>
        <Field label="Weekday"><select name="day" defaultValue={editing?.day??day}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></Field>
        <div className="pair"><Field label="Start time"><input type="time" name="start" required defaultValue={editing?.start??'09:00'}/></Field><Field label="End time"><input type="time" name="end" required defaultValue={editing?.end??'10:00'}/></Field></div>
        <Field label="Room (optional)"><input name="room" maxLength={120} defaultValue={editing?.room}/></Field>
        <Field label="Teacher (optional)"><input name="teacher" maxLength={120} defaultValue={editing?.teacher}/></Field>
        <div className="pair"><Field label="Code (optional)"><input name="code" maxLength={32} defaultValue={editing?.code}/></Field><Field label="Type (optional)"><input name="kind" maxLength={60} defaultValue={editing?.kind} placeholder="Lecture"/></Field></div>
      </>}
      {mode==='import' && <><p>Paste the whole week as a JSON array. Use Mon through Sun and 24-hour times.</p><details><summary>View sample JSON</summary><pre>{sample}</pre></details><Field label="Timetable JSON"><textarea rows={8} name="json" required spellCheck="false" placeholder='[{"day":"Mon","subject":"Physics","start":"09:00","end":"10:00"}]'/></Field></>}
      {mode==='preset' && <><p>Environmental Engineering · Semester I, effective {SEMESTER}. Each continuous class block counts once.</p>
        <Field label="EN103 practical group"><select name="group" defaultValue={week.find(c=>c.code==='EN103' && c.kind.startsWith('Practical G'))?.kind.slice(-2)??''}><option value="">Shared classes only</option>{['G1','G2','G3','G4'].map(g=><option key={g}>{g}</option>)}</select></Field>
        <label className="checkline"><input type="checkbox" name="tutorials" defaultChecked={week.some(c=>c.kind.includes('Tutorial'))}/> Include tutorials labelled G1/G2</label>
        <label className="checkline"><input type="checkbox" name="activities" defaultChecked={week.some(c=>c.code==='ECC1')}/> Include ECC1 and Zero Hour</label>
      </>}
      {error && <p role="alert" className="error">{error}</p>}<button className="primary wide">{mode==='class'?'Save class':mode==='preset'?'Apply preset':'Import week'}</button>
    </form></Modal>}
  </>;
}
