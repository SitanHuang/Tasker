URGENCY_DUE_COEFFICIENT = 12.0;
URGENCY_PRIORITY_H = 4.2;
URGENCY_PRIORITY_M = 1.8;
URGENCY_PRIORITY_L = 0;
URGENCY_STARTED = 4.0;
URGENCY_AGE = 2.0;
URGENCY_TAGS_COEFFICIENT = 1.0;

URGENCY_AGE_MAX = 365;

function urgency(task) {
  if (task.hidden) return -1;

  let urgency = 0;

  let now = moment().valueOf() / 86400000.0;
  let due = task.due / 86400000.0;
  let created = task.created / 86400000.0;

  // =================== due ====================
  if (due) {
    let daysOverdue = (now - due);
    if (daysOverdue >= 7.0) urgency += URGENCY_DUE_COEFFICIENT; // < 1 wk ago
    else if (daysOverdue >= -14.0) urgency += (((daysOverdue + 14.0) * 0.8 /
        21.0) +
      0.2) * URGENCY_DUE_COEFFICIENT;
    else urgency += 0.2 * URGENCY_DUE_COEFFICIENT;
  }

  // =================== priority ====================
  switch (task.priority) {
    case 'H':
      urgency += URGENCY_PRIORITY_H;
      break;
    case 'L':
      urgency += URGENCY_PRIORITY_L;
      break;
    case 'M':
    default:
      urgency += URGENCY_PRIORITY_M;
  }

  // =================== started ====================
  if (task.start) urgency += URGENCY_STARTED;

  // =================== tags ====================
  urgency += URGENCY_TAGS_COEFFICIENT * task.tags.length;

  // =================== age ====================
  let age = (now - created); // in days
  if (URGENCY_AGE_MAX == 0 || age > URGENCY_AGE_MAX)
    urgency += URGENCY_AGE;

  urgency += age / URGENCY_AGE_MAX * URGENCY_AGE;


  return urgency;
}
