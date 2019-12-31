var max = 100;
var stilllisten = false;
var rgb = [];


function numberToColor(i) {
  r = 255 * i;
  g = -255 * i + 255;
  return [r, g, 0]
}

async function startlisten(light) {
  // Get the overall volume (between 0 and 100)
  const {
    desktopCapturer
  } = require('electron');
  desktopCapturer.getSources({
    types: ['window', 'screen']
  }).then(async sources => {
    for (const source of sources) {
      if (source.name === 'Wifi Lightbulb Classroom Soundmeter') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          })
          await handleStream(stream, light)
        } catch (e) {
          handleError(e)
        }
      }
    }
  })
}

async function handleStream(stream, light) {
  if (stilllisten == true) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    javascriptNode.onaudioprocess = await async function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += (array[i]);
      }
      var average = values / length;
      let volume = Math.round(average);
      console.log('VOLUME');
      console.log(volume);
      var volBar = $('#vol');
      var scaled = volume / max;
      volBar.val(scaled);
      console.log(scaled);
      rgb = numberToColor(scaled);
      console.log(rgb);
    }
  }
}

function handleError(e) {
  console.log(e)
}

function changeColor(light) {
  console.log('Running change color')
  light.setColorWithBrightness(rgb[0], rgb[1], rgb[2], 100, handleError).then(success => {
    console.log('Success!')
  });
}

$(() => {
  $('#scan').on('click', function(event) {
    const {
      Discovery
    } = require('magic-home');
    var dropdown = $('#dropdown');
    let discovery = new Discovery();
    dropdown.empty();
    discovery.scan(500).then(devices => {
      devices.forEach(function(item, index) {
        dropdown.append(
          $('<x-menuitem></x-menuitem>').val(item).html('<x-label>' + item['id'] + ': ' + item['address'] + '</x-label>')
        );
      });
    });
  });
  $('#threshold').on('click', function(event) {
    var threshold = $('#threshold');
    max = threshold.val();
  });
  $('#listen').on('click', function(event) {
    const {
      Control
    } = require('magic-home');
    stilllisten = true;
    var rawBulb = $('#dropdown').text();
    console.log(rawBulb.split(": ")[1]);
    let light = new Control(rawBulb.split(": ")[1], {
      apply_masks: true,
      wait_for_reply: false
    });
    light.setPower(true).then(success => {
      startlisten(light);
      setInterval(function() {
        changeColor(light);
      }, 1000);
    });
  });
  $('#stop').on('click', function(event) {
    stilllisten = false;
  });
});
