function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return url.match(p)[1];
    }
    return false;
}


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
})});
