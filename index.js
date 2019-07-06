var $input = $('input.top');
var $console = $('div.console');

function next() {
  let entry = task($input.val());

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

    DATA.push(entry);

    save();
  }

  let $table = $('<table></table>');

  $table.html('<tr><th>P<th>Description<th>Due<th>Urg');

  // ======= display =======
  DATA.sort((a, b) => urgency(b) - urgency(a)).forEach(entry => {
    let tags = entry.tags.map(x => `<tag>#${x}</tag>`).join('') + ' ';

    let dueInDays = Math.ceil((entry.due - moment().valueOf()) / 86400000);
    let due = dueInDays + 'd';
    if (entry.due == 0) due = '';

    let priority = entry.priority == 'L' ? 'L' : entry.priority == 'H' ? 'H' : '&nbsp;';

    let $tr = $(`<tr><th>${priority}<th>${escapeHtml(tags)}${escapeHtml(entry.name)}<th>${due}<th>${urgency(entry).round(1)}`);

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
      Modifers: ${entry.modifiers.map(x => x.join(':')).join(', ')}
      Tags: ${entry.tags.map(x => escapeHtml(x)).join(',')}<br>
      Due: ${moment(entry.due).format('M/D/YY')}<br>
      Created: ${moment(entry.created).format('M/D/YY')}<br>
      `).hide();
    $info.find('th').append($(`<b style="background: white;color: black;">START</b>`).click(() => {
      entry.start = !entry.start;
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
