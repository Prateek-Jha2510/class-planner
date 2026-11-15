// B19, Environmental Engineering, semester I. Each continuous teaching block is one class.
const courses = {
  AP101: ['Physics', 'Dr. Pawan K. Tyagi'],
  AM101: ['Mathematics I', 'Dr. Mamta Rani'],
  AC101: ['Chemistry', 'Dr. Priyanka'],
  CE101: ['Basic Civil Engineering', 'Prof. Rajeev Kr. Garg'],
  EN103: ['Water and Waste Water Analysis', 'Prof. A. K. Haritash'],
  'AEC/VAC': ['AEC/VAC', ''], ECC1: ['ECC1', ''], ZERO: ['Zero Hour', '']
};
export const SEMESTER = '2026-08-03';
const blocks = [
  ['Mon',8,10,'AP101','Practical'], ['Mon',10,11,'AM101','Lecture','SPS10'],
  ['Mon',11,12,'AM101','Tutorial G1/G2','SPS10'], ['Mon',12,14,'EN103','Practical G1'],
  ['Tue',8,10,'AEC/VAC','Elective'], ['Tue',10,12,'AC101','Lecture','SPS12'],
  ['Tue',13,15,'AM101','Lecture','SPS10'], ['Tue',15,16,'AP101','Lecture','SPS10'], ['Tue',16,18,'ECC1','Activity'],
  ['Wed',8,10,'EN103','Practical G2'], ['Wed',10,11,'CE101','Tutorial G1/G2','SPS11'],
  ['Wed',11,12,'CE101','Lecture','SPS11'], ['Wed',13,15,'AP101','Lecture','SPS11'],
  ['Wed',15,16,'AC101','Lecture','SPS11'], ['Wed',16,18,'ZERO','Activity'],
  ['Thu',8,10,'AEC/VAC','Elective'], ['Thu',10,11,'EN103','Lecture','SPS11'],
  ['Thu',12,14,'AC101','Practical'], ['Thu',14,16,'EN103','Practical G3'], ['Thu',16,18,'ECC1','Activity'],
  ['Fri',11,13,'CE101','Lecture','SPS11'], ['Fri',14,16,'EN103','Practical G4']
];
const hour = value => String(value).padStart(2,'0') + ':00';
export function dtuWeek(group = '', activities = false, tutorials = true) {
  return blocks.filter(([, , ,code,kind]) => {
    if (kind.startsWith('Practical G')) return kind === 'Practical ' + group;
    if (kind.startsWith('Tutorial')) return tutorials;
    return activities || !['ECC1','ZERO'].includes(code);
  }).map(([day,start,end,code,kind,room = '']) => ({
    id: 'dtu-' + day + '-' + start + '-' + code.replace('/', '-'), day, start:hour(start), end:hour(end),
    subject:courses[code][0], teacher:kind === 'Practical G4' ? 'RS' : courses[code][1], room, code, kind
  }));
}
