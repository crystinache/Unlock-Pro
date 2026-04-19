import { FAMOUS_PEOPLE } from '../constants';

export const formatPin = (pin: string) => {
  return pin.match(/.{1,2}/g)?.join(' ') || pin;
};

export const getFamousPerson = (pin: string) => {
  if (pin.length < 4) return null;
  const day = pin.substring(0, 2);
  const month = pin.substring(2, 4);
  const key = `${month}-${day}`;
  return FAMOUS_PEOPLE[key] || null;
};

export const getZodiacAndAge = (pin: string) => {
  if (pin.length !== 4 && pin.length !== 6) return '- -';
  
  const day = parseInt(pin.substring(0, 2));
  const month = parseInt(pin.substring(2, 4));
  
  if (isNaN(day) || !month || month < 1 || month > 12 || day < 1 || day > 31) return '- -';
  
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return '- -';

  const zodiacSigns = [
    { name: 'Capricorno', start: { m: 12, d: 22 }, end: { m: 1, d: 19 } },
    { name: 'Acquario', start: { m: 1, d: 20 }, end: { m: 2, d: 18 } },
    { name: 'Pesci', start: { m: 2, d: 19 }, end: { m: 3, d: 20 } },
    { name: 'Ariete', start: { m: 3, d: 21 }, end: { m: 4, d: 19 } },
    { name: 'Toro', start: { m: 4, d: 20 }, end: { m: 5, d: 20 } },
    { name: 'Gemelli', start: { m: 5, d: 21 }, end: { m: 6, d: 20 } },
    { name: 'Cancro', start: { m: 6, d: 21 }, end: { m: 7, d: 22 } },
    { name: 'Leone', start: { m: 7, d: 23 }, end: { m: 8, d: 22 } },
    { name: 'Vergine', start: { m: 8, d: 23 }, end: { m: 9, d: 22 } },
    { name: 'Bilancia', start: { m: 9, d: 23 }, end: { m: 10, d: 22 } },
    { name: 'Scorpione', start: { m: 10, d: 23 }, end: { m: 11, d: 21 } },
    { name: 'Sagittario', start: { m: 11, d: 22 }, end: { m: 12, d: 21 } }
  ];

  let sign = '';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sign = 'Capricorno';
  else {
    const found = zodiacSigns.find(s => 
      (month === s.start.m && day >= s.start.d) || 
      (month === s.end.m && day <= s.end.d)
    );
    sign = found ? found.name : '-';
  }

  let age = '-';
  if (pin.length === 6) {
    let year = parseInt(pin.substring(4, 6));
    if (!isNaN(year)) {
      const fullYear = year <= 26 ? 2000 + year : 1900 + year;
      const currentYear = 2026;
      const currentMonth = 4;
      const currentDay = 5;
      
      age = (currentYear - fullYear).toString();
      if (month > currentMonth || (month === currentMonth && day > currentDay)) {
        age = (currentYear - fullYear - 1).toString();
      }
    }
  }

  return `${sign} ${age}`;
};
