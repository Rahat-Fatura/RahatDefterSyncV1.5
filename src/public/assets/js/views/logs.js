ipc.on('log-stream', function (event, data) {
  if (!$('#keep-logging').is(':checked')) {
    return;
  }
  const log = JSON.parse(data);
  let logColor;
  switch (log.level) {
    case 'info':
      logColor = 'light-info';
      break;
    case 'error':
      logColor = 'light-danger';
      break;
    case 'warn':
      logColor = 'light-warning';
      break;
    default:
      logColor = 'light-primary';
  }
  const table = $('#logs-table');
  const row = `<tr><td class="min-w-70px"><div class="badge badge-${logColor}">${log.level}</div></td><td>${log.message}</td><td class="pe-0 text-end min-w-200px">${log.timestamp}</td></tr>`;
  // add first line
  table.prepend(row);
  // remove last line if more than 50
  if (table.children().length > 50) {
    table.children().last().remove();
  }
});

$(document).ready(() => {
  $('#open-logfolder').on('click', () => {
    ipc.send('open-logfile');
  });
});
