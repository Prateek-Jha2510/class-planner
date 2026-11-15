import { dtuWeek, SEMESTER } from './preset.js';

export const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const STATUSES = ['Attended','Absent','Bunked','Cancelled'];
export const KEY = 'class-planner-v1';
export const uid = () => crypto.randomUUID();
export function dateKey(date = new Date()) {
  const pad = n => String(n).padStart(2,'0');
  return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate());
}
export const localDay = key => new Date(key + 'T12:00:00');
export function offset(key, days) {
  const d = localDay(key);
  d.setDate(d.getDate()+days);
  return dateKey(d);
}
export const weekday = key => DAYS[(localDay(key).getDay()+6)%7];
export const pretty = (key, options) => localDay(key).toLocaleDateString('en-GB',options);
export const validDate = s => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s) && s >= '2000-01-01' && s <= '2199-12-31' && dateKey(localDay(s)) === s;
export const validTime = s => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function check(ok, message) { if (!ok) throw new Error(message); }
const isObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(id);
const unique = values => new Set(values).size === values.length;
function line(value, name, max = 120, required = false) {
  check(typeof value === 'string' && value.length <= max && (!required || value.trim()),'Check ' + name + ' (up to ' + max + ' characters).');
  return value.trim();
}
export function cleanClass(row, index = 0, requireId = false) {
  const label = 'Class ' + (index+1);
  check(isObj(row) && DAYS.includes(row.day),label + ' needs a day such as Mon.');
  check(validTime(row.start) && validTime(row.end) && row.start < row.end,label + ' needs HH:MM times with end after start.');
  const id = requireId ? row.id : uid();
  const legacyElective = /^dtu-(Tue|Thu)-8-AEC\/VAC$/.test(id);
  check(validId(id) || legacyElective,label + ' has an invalid ID.');
  return {id, day:row.day, subject:line(row.subject,label + ' subject',100,true), start:row.start, end:row.end,
    room:line(row.room ?? '', 'room'), teacher:line(row.teacher ?? '', 'teacher'), code:line(row.code ?? '', 'code',32), kind:line(row.kind ?? '', 'type',60)};
}
export function readWeek(rows, requireId = false) {
  check(Array.isArray(rows) && rows.length <= 350,'Use a JSON array with up to 350 classes.');
  const week = rows.map((row,i) => cleanClass(row,i,requireId));
  check(unique(week.map(c=>c.id)), 'Duplicate class ID.');
  return week;
}
export function initial(today = dateKey(), preset = true) {
  return {version:1, since:today, target:75, theme:'System',
    versions:[{from:preset && SEMESTER < today ? SEMESTER : today, week:preset ? dtuWeek() : []}], records:{}, tasks:[]};
}
export function weekAt(data, date) {
  return data.versions.filter(v=>v.from<=date).at(-1)?.week ?? [];
}
export function changeWeek(data, from, week) {
  check(validDate(from), 'Choose a valid effective date.');
  check(week.length <= 350,'A week can have up to 350 classes.');
  const versions = [...data.versions.filter(v=>v.from!==from),{from,week}].sort((a,b)=>a.from.localeCompare(b.from));
  return {...data, versions};
}
export const sortSlots = rows => [...rows].sort((a,b)=>a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.subject.localeCompare(b.subject));
export function dayAt(data,date) {
  return data.records[date] ?? { holiday:false, slots:sortSlots(weekAt(data,date).filter(c=>c.day===weekday(date))).map(c=>({...c,status:''})) };
}
export function saveDay(data,date,day) {
  const records = {...data.records};
  if (!day.holiday && day.slots.every(c=>!c.status)) delete records[date];
  else records[date] = day;
  return {...data, records};
}
export function reminder(data,today) {
  let first = '', count = 0;
  for(let d = data.since; d < today; d = offset(d,1)) {
    const day = dayAt(data,d);
    const unmarked = day.holiday ? 0 : day.slots.filter(c=>!c.status).length;
    count += unmarked;
    if(unmarked && !first) first = d;
  }
  return {first,count};
}
export function subjects(data,date) {
  return [...new Set(weekAt(data,date).map(c=>c.subject))].sort((a,b)=>a.localeCompare(b));
}
const zero = () => ({Attended:0,Absent:0,Bunked:0,Cancelled:0,Holiday:0});
export const percent = c => c.Attended+c.Absent ? 100*c.Attended/(c.Attended+c.Absent) : null;
export function band(value,target) {
  return value === null ? 'muted' : value >= target ? 'green' : value >= 60 ? 'amber' : 'red';
}
export function stats(data,today) {
  const total = zero();
  const by = new Map(subjects(data,today).map(s=>[s,zero()]));
  for(const [date,day] of Object.entries(data.records)) {
    if(date>today) continue;
    for(const c of day.slots) {
      const s = day.holiday ? 'Holiday' : c.status;
      if(!s) continue;
      if(!by.has(c.subject)) by.set(c.subject,zero());
      total[s]++; by.get(c.subject)[s]++;
    }
  }
  return {total,by:[...by].sort(([a],[b])=>a.localeCompare(b))};
}
export function deadline(task) {
  return new Date(task.date + 'T' + (task.time ? task.time + ':00' : '23:59:59.999'));
}
export function urgency(task, now) {
  if(deadline(task)<now) return ['Overdue','red'];
  if(task.date===dateKey(now)) return ['Due today','amber'];
  if(task.date===offset(dateKey(now),1)) return ['Tomorrow','amber'];
  return ['Upcoming','muted'];
}
export function validateBackup(raw) {
  check(isObj(raw) && raw.version === 1,'Choose a Class Planner v1 backup.');
  check(validDate(raw.since) && Number.isInteger(raw.target) && raw.target>=60 && raw.target<=100 && ['System','Light','Dark'].includes(raw.theme),'Invalid settings in backup.');
  check(Array.isArray(raw.versions) && raw.versions.length>0 && isObj(raw.records) && Array.isArray(raw.tasks),'Backup is incomplete.');
  const versions = raw.versions.map(v=>{
    check(isObj(v) && validDate(v.from),'Invalid timetable date.');
    return {from:v.from,week:readWeek(v.week,true)};
  }).sort((a,b)=>a.from.localeCompare(b.from));
  check(unique(versions.map(v=>v.from)),'Duplicate timetable date.');
  const records = {};
  for(const [date,day] of Object.entries(raw.records)) {
    check(validDate(date) && isObj(day) && typeof day.holiday==='boolean','Invalid attendance date.');
    const slots = readWeek(day.slots,true).map((c,i)=>{
      const status = day.slots[i].status;
      check(c.day===weekday(date) && (status==='' || STATUSES.includes(status)), 'Invalid attendance entry.');
      return {...c,status};
    });
    records[date] = {holiday:day.holiday,slots:sortSlots(slots)};
  }
  const tasks = raw.tasks.map(t=>{
    check(isObj(t) && validId(t.id) && validDate(t.date) && (t.time==='' || validTime(t.time)) && typeof t.done==='boolean','Invalid homework entry.');
    return {id:t.id,title:line(t.title,'title',140,true),subject:line(t.subject,'subject',100,true),description:line(t.description,'description',2000),date:t.date,time:t.time,done:t.done};
  });
  check(unique(tasks.map(t=>t.id)),'Duplicate task ID.');
  return {version:1,since:raw.since,target:raw.target,theme:raw.theme,versions,records,tasks};
}
