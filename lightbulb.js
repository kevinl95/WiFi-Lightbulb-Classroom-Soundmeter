$(() => {
  $('#scan').on('click', function(event) {
    const { Discovery } = require('magic-home');
    var dropdown = $('#dropdown');
    var selection = $('#selection');
    let discovery = new Discovery();
    dropdown.empty();
    discovery.scan(500).then(devices => {
      devices.forEach(function (item, index) {
        dropdown.append(
            $('<x-menuitem></x-menuitem>').val(item).html('<x-label>' + item['id'] + ': ' + item['address'] + '</x-label>')
        );
      });
    });
  });
});
