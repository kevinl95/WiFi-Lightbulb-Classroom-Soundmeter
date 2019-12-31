var max = 100;
var stilllisten = false;
var level = 0;
var rgb = [];

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function numberToColorHsl(i) {
  // as the function expects a value between 0 and 1, and red = 0° and green = 120°
  // we convert the input to the appropriate hue value
  var hue = i * 1.2 / 360;
  // we convert hsl to rgb (saturation 100%, lightness 50%)
  var rgb = hslToRgb(hue, 1, .5);
  // we format to css value and return
  return rgb;
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
      var volBar = $('#vol');
      volBar.val(volume / max);
      var applyThresh = (max / 100) * (volume - 100) + max;
      console.log(applyThresh);
      level = applyThresh;
      rgb = numberToColorHsl(applyThresh / max);
      console.log(rgb);
    }
  }
}

function handleError(e) {
  console.log(e)
}

function changeColor(light) {
  console.log('Running change color')
  light.setColor(rgb[0], rgb[1], rgb[2], handleError).then(success => {
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
    let light = new Control(rawBulb.split(": ")[1], {apply_masks:true});
    startlisten(light);
    setInterval(function() {
      changeColor(light);
    }, 5000);
  });
  $('#stop').on('click', function(event) {
    stilllisten = false;
  });
});
