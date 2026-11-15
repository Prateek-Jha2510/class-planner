import React, {useEffect,useRef} from 'react';
const paths = {
  Today:'M3 10h18 M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M8 3v4m8-4v4 M7 14h3v3H7z',
  Homework:'M6 3h10l3 3v15H6z M9 9h6m-6 4h6m-6 4h4',
  Attendance:'M3 20h18 M6 16v-5m6 5V4m6 12V8',
  Timetable:'M3 5h18v15H3z M3 10h18 M9 5v15 M15 10v10',
  settings:'M3 6h6m4 0h8M3 12h11m4 0h3M3 18h3m4 0h11 M9 3v6m5 0v6m-8 0v6',
  left:'m14 6-6 6 6 6',right:'m9 6 6 6-6 6', add:'M12 5v14m-7-7h14', close:'m6 6 12 12M18 6 6 18',
  check:'m4 12 5 5L20 6', book:'M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1z M12 6v14',
  moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z', flag:'M5 21V4q4-3 8 0t7 0v9q-4 3-8 0t-7 0',
  edit:'m5 16 11-11 3 3L8 19l-4 1z M14 7l3 3',trash:'M3 6h18 M7 6l1 14h8l1-14 M9 6V3h6v3',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2', import:'M12 3v12m-5-5 5 5 5-5 M4 16v5h16v-5'
};
export function Icon({name,size=20}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
export function Modal({title,close,children}) {
  const ref=useRef(null);
  useEffect(()=>{const el=ref.current; el.showModal(); return ()=>el.close();},[]);
  return <dialog ref={ref} aria-labelledby="modal-title" onCancel={e=>{e.preventDefault();close();}}>
    <div className="row"><h2 id="modal-title">{title}</h2><button className="iconbtn" onClick={close} aria-label="Close"><Icon name="close"/></button></div>{children}
  </dialog>;
}
export function Empty({icon='book',title,children}) {
  return <div className="empty"><span className="emptyIcon"><Icon name={icon} size={24}/></span><div><strong>{title}</strong>{children && <p>{children}</p>}</div></div>;
}
export function Field({label,children}) {return <label className="field"><span>{label}</span>{children}</label>;}
export function Title({name,children}) {return <div className="pageTitle row"><h1>{name}</h1>{children}</div>;}
export function Tile({classItem:c,children}) {
  return <article className="tile"><div className="times"><strong>{c.start}</strong><span>{c.end}</span></div><div className="tileText">
    {(c.code || c.kind) && <small className="kicker">{[c.code,c.kind].filter(Boolean).join(' · ')}</small>}
    <h3>{c.subject}</h3>{(c.room || c.teacher) && <p>{[c.room,c.teacher].filter(Boolean).join(' · ')}</p>}
  </div>{children}</article>;
}
