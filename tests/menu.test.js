import test from 'node:test';
import assert from 'node:assert/strict';
import {DAYS,weekday,offset} from '../src/model.js';
import {messMenu} from '../src/menu.js';

test('each local weekday has breakfast, lunch, snacks and dinner',()=>{
  for(const [i,day] of DAYS.entries()) {
    const menu=messMenu[weekday(offset('2026-11-16',i))];
    assert.equal(menu,messMenu[day]);
    assert.deepEqual(Object.keys(menu),['Breakfast','Lunch','Snacks','Dinner']);
    assert.ok(Object.values(menu).every(food=>food.trim().length>0));
  }
  assert.match(messMenu.Mon.Breakfast,/Aloo pyaaz paratha/);
  assert.match(messMenu.Tue.Snacks,/\[E\].*\[O\]/);
  assert.match(messMenu.Sun.Dinner,/Chicken biryani OR veg biryani/);
});
