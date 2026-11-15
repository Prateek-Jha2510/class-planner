import React from 'react';
import {stats,percent,band,STATUSES} from './model.js';
import {Title,Empty} from './ui.jsx';
const format=p=>p===null?'--':Number(p.toFixed(1))+'%';
function Counts({counts}) {return <div className="counts">{[...STATUSES,'Holiday'].map(s=><div key={s}><b>{counts[s]}</b><small>{s}</small></div>)}</div>;}
export default function Attendance({data,today,settings}) {
  const {total,by}=stats(data,today), p=percent(total);
  return <><Title name="Attendance"><button className="soft" onClick={settings}>Target {data.target}%</button></Title>
    <section className="report"><small className="kicker">Overall attendance</small><h2 className={band(p,data.target)}>{format(p)}</h2>
    <p>{total.Attended} attended out of {total.Attended+total.Absent} counted classes</p>
    <div className="track"><i className={band(p,data.target)} style={{width:(p??0)+'%'}}/><b style={{left:data.target+'%'}}/></div>
    <Counts counts={total}/></section>
    <div className="sectionHead"><h2>By subject</h2></div>{by.map(([subject,c])=>{
      const value=percent(c);
      return <article className="panel" key={subject}><div className="row"><h3>{subject}</h3><strong className={band(value,data.target)}>{format(value)}</strong></div><Counts counts={c}/></article>;
    })}{!by.length && <Empty title="No subjects yet">Add your subjects in Timetable.</Empty>}
    <p className="footnote">Only Attended and Absent count toward your percentage. Bunked, Cancelled and Holiday are shown separately.</p></>;
}
