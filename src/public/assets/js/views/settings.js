ipc.on('settings-saved', function (event, data) {
  if (data.status === 'success') {
    Swal.fire({
      title: 'Başarılı',
      text: 'Ayarlar başarıyla kaydedildi. Uygulama yeniden başlatılacak.',
      icon: 'success',
      confirmButtonText: 'Tamam',
    }).then(() => {
      ipc.send('relaunch');
    });
  } else {
    Swal.fire({
      title: 'Hata',
      text: 'Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin. Detaylar: ' + data.error,
      icon: 'error',
      confirmButtonText: 'Tamam',
    });
  }
});

$(document).ready(function () {
  $('#save-settings').click(function () {
    ipc.send('save-settings', {
      autoLaunch: $('#auto-launch').is(':checked') ? 'active' : 'deactive',
      port: $('input[type="port"]').val(),
      rmq: $('input[type="rmq"]').val(),
      url: $('input[type="url"]').val(),
      uuid: $('input[type="uuid"]').val(),
      path: $('input[type="path"]').val(),
    });
  });
});
