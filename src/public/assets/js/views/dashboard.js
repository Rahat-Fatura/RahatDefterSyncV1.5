$(document).ready(function () {
  ipc.on('rmq-status', function (event, data) {
    console.log(data);
    if (data.status === 'success') {
      $('#rmq-status-desc').html('Bağlı').removeClass('bg-light-danger').addClass('bg-light-success');
      $('#rmq-status-pulse')
        .removeClass('btn-light-danger')
        .removeClass('pulse-danger')
        .addClass('btn-light-success')
        .addClass('pulse-success');
    } else {
      $('#rmq-status-desc')
        .html(`Bağlı Değil! Detay: ${data.error.err.message}`)
        .removeClass('bg-light-success')
        .addClass('bg-light-danger');
      $('#rmq-status-pulse')
        .removeClass('btn-light-success')
        .removeClass('pulse-success')
        .addClass('btn-light-danger')
        .addClass('pulse-danger');
    }
  });
  setInterval(() => {
    ipc.send('check-rmq');
  }, 3000);
});
