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

ipc.on('log-stream', function (event, data) {
  // $('#log-stream').append(data);
  // $('#log-stream').scrollTop($('#log-stream')[0].scrollHeight);
  console.log(data);
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
      excludeKeys: $('input[type="excludeKeys"]').val(),
    });
  });
  let sweetUpdater = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  $('#version-button').click(function () {
    ipc.send('check-for-updates');
  });
  ipc.on('updater-message', (event, text) => {
    console.log(text);
    const data = JSON.parse(text);
    console.log(data);
    switch (data.status) {
      case 'checking-for-update':
        // $('#updater-logs').append(`<li class="list-group-item list-group-timeline-primary">${data.message}</li>`);
        sweetUpdater.fire({
          icon: 'info',
          title: data.message,
        });
        break;
      case 'update-available':
        // $('#updater-logs').append(
        //   `<li class="list-group-item list-group-timeline-success">${data.message} - Bulunan versiyon: <b>${data.info.version}</b></li>`,
        // );
        sweetUpdater.fire({
          icon: 'success',
          title: data.message,
          text: `Yeni versiyon: ${data.info.version}`,
        });
        break;
      case 'update-not-available':
        // $('#updater-logs').append(`<li class="list-group-item list-group-timeline-danger">${data.message}</li>`);
        sweetUpdater.fire({
          icon: 'success',
          title: data.message,
        });
        break;
      case 'error':
        // $('#updater-logs').append(
        //   `<li class="list-group-item list-group-timeline-danger">${data.message} - Hata: <b>${data.err}</b></li>`,
        // );
        sweetUpdater.fire({
          icon: 'error',
          title: data.message,
          text: `Hata: ${data.err}`,
        });
        break;
      case 'download-progress':
        // let bar = Swal.mixin({
        //   toast: true,
        //   position: 'top-end',
        //   showConfirmButton: false,
        //   timer: 3000,
        //   timerProgressBar: true,
        // });
        if ($('#download-progress-bar').length === 0) {
          // $('#updater-logs').append(
          //   ` <li class="list-group-item list-group-timeline-success demo-vertical-spacing demo-only-element">
          //         <div class="progress">
          //             <div id="download-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
          //         </div>
          //         <p>İndirme: <span id="download-progress-percent">0</span> || Hız: <span id="download-progress-speed">0</span> || Durum: <span id="download-progress-transferred">0</span> / <span id="download-progress-total">0</span> </p>
          //     </li>`,
          // );
        }
        // $('#download-progress-bar').css('width', data.data.percent);
        // $('#download-progress-bar').attr('aria-valuenow', data.data.percent);
        // $('#download-progress-percent').text(data.data.percent);
        // $('#download-progress-speed').text(data.data.bytesPerSecond);
        // $('#download-progress-transferred').text(data.data.transferred);
        // $('#download-progress-total').text(data.data.total);
        break;
      case 'update-downloaded':
        Swal.fire({
          icon: 'success',
          title: 'Başarılı',
          text: 'Güncelleme indirildi. Uygulamayı yeniden başlatınız.',
        });
        break;
      default:
        sweetUpdater.fire({
          icon: 'info',
          title: 'Bilinmeyen bir hata oluştu.',
        });
        break;
    }
  });
});
