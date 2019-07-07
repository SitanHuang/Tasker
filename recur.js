MODIFIER_EVERY_REGEX = /^(\d+)([a-zA-Z]+)$/;

function updateAll() {
  for (let i = 0;i < DATA.length;i++) {
    let entry = DATA[i];
    for (let j = 0;j < entry.modifiers.length;j++) {
      let x = entry.modifiers[j];
      let key = x[0];
      let val = x[1];

      if (key == 'wait' && entry.wait) {
        let date = parseDate(val);
        if (isNaN(date) || moment().startOf('day').valueOf() >= date) {
          entry.created = date;
          delete entry.hidden;
          delete entry.wait;
          j = 0;
        }
      } else if (key == 'every' && !entry.wait && entry.hidden) {
        let match = val.match(MODIFIER_EVERY_REGEX);
        if (match) {
          let num = parseInt(match[1]);
          let interval = match[2];
          let from = moment(entry.created).startOf('day');
          let to = from.add(num, interval).startOf('day');

          console.log('Next: ' + to.format('M/D/YY'));

          if (moment().startOf('day').valueOf() >= to) {
            entry.created = moment().startOf('day');
            delete entry.hidden;
          }
        }
      }


    }
  }
}
