var $input = $('input.top');
var $console = $('div.console');

function next() {
  updateAll();

  let inputValue = $input.val();

  if (inputValue.trim().toLowerCase() == 'help') {
    $console.html('<pre>' +
`
Version: 7/6 WITH RECUR

To create your first entry, try:

  #test Add exclamation! today

Or this:

  Not so important~ 1/1/2030

=== ui ===
long press entry - remove entry
click entry - see details

=== syntax ===
#... - create entry with tag / search by tag
... - create entry with title
! - create entry with high priority
~ - create entry with low priority
.../... - create entry with due date
.../.../... - create entry with due date with year
today - create entry with due date to today
tomorrow - create entry with due date to tomorrow
...:... - create entry with modifier

=== modifiers ===
wait:.../.../...
wait:.../...
every:1days
every:1months

days-d
months-M
weeks-w

=== commands ===
reset - clear all entries
help - show this message again

=== search ===
filter:due
filter:!due
filter:hidden
sort:due
sort:age / sort:created
#...

`
    + '</pre>');
    return;
  }

  let entry;
  let original;
  if (inputValue.startsWith('mod')) {
    let created = parseInt(inputValue.replace(/^mod(\d+)/, '$1'));
    original = DATA.filter(x => x.created == created)[0];

    inputValue = inputValue.replace(/^mod(\d+) ?/, '');

    entry = task(inputValue, original);
  } else {
    entry = task(inputValue);
  }

  if (entry.name.toLowerCase() == 'reset') {
    DATA = [];
    $input.val('');

    save();
    next();
    return;
  }

  // ======= add new entry =======
  if (entry.name.length > 0) {
    console.log(entry.name)
    $input.val('');

    if (original) {
      DATA = DATA.filter(x => x.created != original.created);
    }

    DATA.push(entry);

    save();
  }

  let $table = $('<table></table>');

  $table.html('<tr><th>P<th>Description<th>Due<th>Urg');

  // ======= filter =======
  let query = DATA.sort((a, b) => urgency(b) - urgency(a));

  if (entry.name.length == 0) {
    entry.tags.forEach(tag => query = query.filter(x => x.tags.indexOf(tag) >= 0));
  }

  let showHidden = false;

  entry.modifiers.forEach(x => {
    if (x[0].toLowerCase() == 'sort') {
      if (x[1].toLowerCase() == 'due') {
        query = query.sort((a, b) => {
          a = a.due || Infinity;
          b = b.due || Infinity;
          return a - b;
        });
      } else if (x[1].toLowerCase() == 'age' || x[1].toLowerCase() == 'created') {
        query = query.sort((a, b) => a.created - b.created);
      }
    }
    if (x[0].toLowerCase() == 'filter') {
      if (x[1].toLowerCase() == 'due') {
        query = query.filter(x => x.due);
      } else if (x[1].toLowerCase() == '!due') {
        query = query.filter(x => !x.due);
      } else if (x[1].toLowerCase() == 'hidden') {
        showHidden = true;
        query = query.filter(x => x.hidden);
      }
    }
  });

  // ======= display =======
  query.forEach(entry => {
    if (entry.hidden && !showHidden) return;

    let tags = entry.tags.map(x => `<tag>#${x}</tag>`).join('') + ' ';

    let dueInDays = Math.ceil((entry.due - moment().valueOf()) / 86400000);
    let due = dueInDays + 'd';
    if (entry.due == 0) due = '';

    let priority = entry.priority == 'L' ? 'L' : entry.priority == 'H' ? 'H' : '&nbsp;';

    let $tr = $(`<tr><th>${priority}</th><th>${escapeHtml(tags)}${escapeHtml(entry.name)}</th><th>${due}</th><th>${urgency(entry).round(1)}</th>`);

    if (entry.start) $tr.addClass('started');
    if (entry.due > 0) {
      if (dueInDays <= 0)
        $tr.addClass('overdue');
      else if (dueInDays <= 5)
        $tr.addClass('due');
    }

    if (entry.priority == 'H')
      $tr.addClass('highPriority');
    else if (entry.priority == 'L')
      $tr.addClass('lowPriority');

    $tr.contextmenu(() => {
      DATA = DATA.filter(x => x.created != entry.created);
      save();
      next();
    });

    let $info = $(`<tr><th colspan=4>
      Modifers: ${entry.modifiers.map(x => x.join(':')).join(', ')}<br>
      Tags: ${entry.tags.map(x => escapeHtml(x)).join(',')}<br>
      Due: ${moment(entry.due).format('M/D/YY')}<br>
      Created: ${moment(entry.created).format('M/D/YY')}<br>
      `).hide();
    $info.find('th').append($(`<b style="background: white;color: black;">START</b>`).click(() => {
      entry.start = !entry.start;
      save();
      next();
    })).append('<span>&nbsp;</span>').append($(`<b style="background: black;color: white;">MOD</b>`).click(() => {
      $input.val(`mod${entry.created} ${entry.name}`);
      $input[0].focus();
    })).append('<span>&nbsp;</span>').append($(`<b style="background: black;color: white;">HIDE</b>`).click(() => {
      entry.hidden = !entry.hidden;
      save();
      next();
    }));

    $tr.click(() => {
      $info.toggle();
    });

    $table.append($tr);
    $table.append($info);
  });

  $console.html('');
  $console.append($table);

  // TODO: query
}

next();

if (DATA.length == 0) {
  $input.val('help');
  next();
  $input.val('');
}
