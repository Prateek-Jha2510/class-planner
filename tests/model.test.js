import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,dayAt,saveDay,stats,percent,band,weekday,offset,reminder,changeWeek,weekAt,validateBackup,readWeek,urgency,deadline} from '../src/model.js';
import {dtuWeek} from '../src/preset.js';
const mon='2026-11-16',tue='2026-11-17';
function sample() {
  const week=readWeek(['Attended','Absent','Bunked','Cancelled',''].map((s,i)=>({day:'Mon',subject:i<3?'Physics':'Chemistry',start:'09:00',end:'10:00'})));
  const data=changeWeek(initial(mon,false),mon,week);
  const slots=dayAt(data,mon).slots.map((c,i)=>({...c,status:['Attended','Absent','Bunked','Cancelled',''][i]}));
  return saveDay(data,mon,{holiday:false,slots});
}
test('only attended and absent affect the numerator and denominator',()=>{
  const {total,by}=stats(sample(),tue);
  assert.deepEqual(total,{Attended:1,Absent:1,Bunked:1,Cancelled:1,Holiday:0});
  assert.equal(percent(total),50);
  assert.equal(by.reduce((sum,[,c])=>sum+c.Attended+c.Absent,0),2);
  assert.equal(percent({Attended:0,Absent:0}),null);
});
test('changing one status replaces its previous count',()=>{
  const d=sample(), day=dayAt(d,mon);
  const next=saveDay(d,mon,{...day,slots:day.slots.map(c=>c.status==='Absent'?{...c,status:'Attended'}:c)});
  assert.equal(percent(stats(next,tue).total),100);
});
test('holiday suppresses marks and reminders; undo restores original marks',()=>{
  const d=sample(), day=dayAt(d,mon);
  const holiday=saveDay(d,mon,{...day,holiday:true});
  const total=stats(holiday,tue).total;
  assert.equal(total.Holiday,5); assert.equal(percent(total),null);
  assert.equal(reminder(holiday,tue).count,0);
  const undo=saveDay(holiday,mon,{...dayAt(holiday,mon),holiday:false});
  assert.deepEqual(undo,d);
  assert.deepEqual(reminder(undo,tue),{first:mon,count:1});
});
test('later edits and same-day edits retain previously recorded day snapshots',()=>{
  const d=sample(), changed=changeWeek(d,mon,[]);
  assert.equal(dayAt(changed,mon).slots.length,5);
  assert.equal(dayAt(changed,offset(mon,7)).slots.length,0);
  assert.deepEqual(stats(changed,tue).total,stats(d,tue).total);
  const future=changeWeek(d,tue,[]);
  assert.equal(weekAt(future,mon).length,5);
});
test('reminders begin on the tracking date and exclude today',()=>{
  assert.deepEqual(reminder(sample(),mon),{first:'',count:0});
  assert.deepEqual(reminder({...sample(),since:tue},tue),{first:'',count:0});
});
test('local weekday and leap-day arithmetic',()=>{
  assert.equal(weekday(mon),'Mon');assert.equal(offset('2024-02-28',1),'2024-02-29');
});
test('B19 practicals select exactly one group; activities are optional',()=>{
  assert.equal(dtuWeek().filter(c=>c.kind.startsWith('Practical G')).length,0);
  for(const [i,g] of ['G1','G2','G3','G4'].entries()) {
    const lab=dtuWeek(g).filter(c=>c.kind.startsWith('Practical G'));
    assert.equal(lab.length,1);assert.equal(lab[0].day,['Mon','Wed','Thu','Fri'][i]);
  }
  assert.equal(dtuWeek('',true,false).filter(c=>c.kind==='Activity').length,3);
  assert.equal(dtuWeek('',true,false).filter(c=>c.kind.startsWith('Tutorial')).length,0);
});
test('backup round-trip retains historical records, deadlines and settings',()=>{
  const d=sample();
  d.tasks.push({id:'hw-1',title:'Lab',subject:'Physics',description:'',date:mon,time:'09:30',done:false});
  d.theme='Dark';d.target=80;
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(d))),d);
});
test('reject broken imports before replacing existing data',()=>{
  assert.throws(()=>readWeek([{day:'Monday',start:'08:00',end:'09:00',subject:'X'}]));
  assert.throws(()=>readWeek([{day:'Mon',start:'10:00',end:'09:00',subject:'X'}]));
  let d=sample();d.records[mon].slots[0].status='Skipped';assert.throws(()=>validateBackup(d));
  d=sample();d.since='2026-02-30';assert.throws(()=>validateBackup(d));
});
test('percentage bands respect the configured green threshold',()=>{
  assert.equal(band(null,75),'muted');assert.equal(band(59.99,75),'red');
  assert.equal(band(60,75),'amber');assert.equal(band(75,75),'green');assert.equal(band(75,80),'amber');
});
test('deadline comparisons use the phone clock and the end of an untimed day',()=>{
  const now=new Date(mon+'T14:00:00');
  const task={date:mon,time:''};
  assert.equal(urgency(task,now)[0],'Due today');
  assert.equal(urgency({...task,time:'13:59'},now)[0],'Overdue');
  assert.equal(urgency({...task,date:tue},now)[0],'Tomorrow');
  assert.ok(deadline({...task,time:'14:00'})<deadline(task));
});
test('every built-in schedule survives closing and reopening the planner',()=>{
  for(const group of ['', 'G1', 'G2', 'G3', 'G4']) {
    const d=changeWeek(initial(mon),mon,dtuWeek(group,true,true));
    assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(d))),d);
  }
});
test('1.0.0 AEC/VAC IDs in saved weeks and marked dates retain attendance',()=>{
  let d=initial(tue);
  for(const c of d.versions[0].week) {
    if(c.code==='AEC/VAC') c.id=c.id.replace('AEC-VAC','AEC/VAC');
  }
  const day=dayAt(d,tue);
  day.slots.find(c=>c.code==='AEC/VAC').status='Attended';
  d=saveDay(d,tue,day);
  const restored=validateBackup(JSON.parse(JSON.stringify(d)));
  assert.deepEqual(restored,d);
  assert.equal(stats(restored,tue).total.Attended,1);
});
