DATA = [];

if (localStorage.taskData) {
  DATA = JSON.parse(localStorage.taskData);
}

function save() {
  updateAll();
  localStorage.taskData = JSON.stringify(DATA);
}
