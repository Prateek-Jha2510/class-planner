import React,{useMemo,useState} from 'react';
import {DAYS,STATUSES,dayAt,weekday,dateKey,offset,pretty,reminder,saveDay,weekAt} from './model.js';
import {Icon,Tile,Empty,Modal,Field} from './ui.jsx';
export default function Today({data,save,now,go}) {
  const today=dateKey(now);
  const [chosen,setChosen]=useState('');
  const date=chosen && chosen<today ? chosen : today;
  const select=d=>setChosen(d===today ? '' : d);
  const [picker,setPicker]=useState(false);
  const day=dayAt(data,date);
  const missing=useMemo(()=>reminder(data,today),[data,today]);
  const pending=data.tasks.filter(t=>!t.done).length;
  const start=offset(date,-DAYS.indexOf(weekday(date)));
  const marked=day.holiday ? day.slots.length : day.slots.filter(c=>c.status).length;
  function mark(id,status) {
    const slots=day.slots.map(c=>c.id===id ? {...c,status:c.status===status ? '' : status} : c);
    save(saveDay(data,date,{...day,slots}));
  }
  let next=null;
  for(let n=1; n<=7 && !next; n++) {
    const d=offset(date,n);
    const candidate=dayAt(data,d);
    if(!candidate.holiday && candidate.slots.length) next={date:d,slot:candidate.slots[0]};
  }
  return <>
    <div className="pageTitle row"><h1>{date===today?'Today':'Past schedule'}</h1><button className="soft" onClick={()=>setPicker(true)}><Icon name="Today"/> Pick date</button></div>
    <section className="hero">
      <div className="orbit" aria-hidden="true"><i/><b/></div>
      <div className="heroTop"><span className="signal"/>{pretty(date,{month:'long',year:'numeric'})}</div>
      <h2>{pretty(date,{weekday:'long'})}<span>.</span></h2>
      <div className="heroSub">{pretty(date,{day:'numeric',month:'long'})} <span> / </span> {day.holiday?'Holiday':day.slots.length+' scheduled '+(day.slots.length===1?'class':'classes')}</div>
      <div className="weekStrip" aria-label="Choose a day this week">{DAYS.map((d,i)=>{
        const key=offset(start,i);
        return <button key={d} disabled={key>today} aria-pressed={key===date} aria-label={pretty(key,{dateStyle:'full'})} onClick={()=>select(key)}><small>{d}</small><strong>{Number(key.slice(-2))}</strong></button>;
      })}</div>
    </section>
    <div className="metrics"><div className="metric"><Icon name="Attendance"/><span><b>{marked}<em> / {day.slots.length}</em></b><small>Classes marked</small></span></div>
    <button className="metric" onClick={()=>go('Homework')}><Icon name="Homework"/><span><b>{pending}</b><small>Pending homework</small></span><Icon name="right" size={15}/></button></div>
    {missing.count>0 && <button className="notice" onClick={()=>select(missing.first)}>{missing.count} unmarked past {missing.count===1?'class':'classes'} <span>Review →</span></button>}
    <div className="sectionHead row"><h2>Schedule</h2><button className="soft" onClick={()=>save(saveDay(data,date,{...day,holiday:!day.holiday}))}><Icon name="flag" size={16}/>{day.holiday?'Undo holiday':date===today?'Mark today as Holiday':'Mark as Holiday'}</button></div>
    {day.holiday && <p className="holiday">Holiday · All classes on this date are excluded.</p>}
    {day.slots.map(c=><Tile key={c.id} classItem={c}><div className="statuses">{STATUSES.map(s=><button disabled={day.holiday} aria-pressed={!day.holiday && c.status===s} className={s.toLowerCase()} key={s} onClick={()=>mark(c.id,s)}>{s}</button>)}</div></Tile>)}
    {!day.slots.length && <Empty title="No classes scheduled" icon="Today">{next ? 'Next class: '+next.slot.subject+' · '+pretty(next.date,{weekday:'short'})+' at '+next.slot.start+'.' : 'Add a class in Timetable to start planning.'}</Empty>}
    {date!==today && <button className="wide" onClick={()=>select(today)}>Back to today</button>}
    {weekAt(data,today).some(c=>c.id.startsWith('dtu-')) && <button className="textBtn" onClick={()=>go('Timetable')}>Edit B19 timetable or choose lab group <Icon name="right" size={15}/></button>}
    {picker && <Modal title="Choose a date" close={()=>setPicker(false)}><form onSubmit={e=>{e.preventDefault();select(e.currentTarget.elements.date.value);setPicker(false);}}><Field label="Attendance date"><input type="date" name="date" min="2000-01-01" max={today} defaultValue={date} required/></Field><button className="primary">Open schedule</button></form></Modal>}
  </>;
}
