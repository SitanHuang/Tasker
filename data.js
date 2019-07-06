DATA = [];

if (localStorage.taskData) {
  DATA = JSON.parse(localStorage.taskData);
}

function save() {
  localStorage.taskData = JSON.stringify(DATA);
}
