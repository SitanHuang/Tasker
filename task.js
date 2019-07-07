CURRENT_YEAR = moment().format('YY');
DATE_REGEX = /^(\d{1,2})\/(\d{1,2})(\/(\d{1,2}))?$|^tomorrow|today$/;
MODIFIER_REGEX = /^([^:]+)\:([^:]+)$/;

function parseDate(date) {
  let match = date.match(DATE_REGEX);
  if (!match) return date;

  if (date.toLowerCase() == 'tomorrow') {
    return moment().add(1,'days').valueOf();
  } else if (date.toLowerCase() == 'today') {
    return moment().startOf('day').valueOf();
  }

  let m = match[1];
  let d = match[2];
  let y = match[4] ? '20' + match[4] : CURRENT_YEAR;

  return moment(`${m}/${d}/${y}`, 'M/D/YY').valueOf();
}

function task(command, original) {
  let entry = original || {
    name: '',
    tags: [],
    due: 0,
    priority: 'M',
    start: false,
    modifiers: [],
    created: moment().valueOf()
  };

  let name = '';

  let groups = command.replace(/([^:])(\#|\!|\~)/g, '$1 $2').split(' ').filter(x => x.length);

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];

    let remove = false;
    let match = null;

    // add tags
    if (group.startsWith('#')) {
      remove = true;
      entry.tags.push(group.slice(1));
    } else if (match = group.match(DATE_REGEX)) { // due date
      remove = true;
      entry.due = parseDate(group);
    } else if (match = group.match(MODIFIER_REGEX)) { // asdf:asdf
      remove = true;
      match[1] = match[1].toLowerCase();
      if(match[1] == 'wait') {
        entry.hidden = true;
        entry.wait = true;
      }

      entry.modifiers.push([match[1], match[2]]);
    } else if (group == '!') {
      remove = true;
      entry.priority = 'H';
    } else if (group == '~') {
      remove = true;
      entry.priority = 'L';
    }

    // add to name
    if (!remove) {
      name += group + ' ';
    }
  }

  entry.name = (name.length ? name : (original ? original.name : '')).trim().replace(/ +/g, ' ');
  entry.tags = entry.tags.sort();

  return entry;
}
