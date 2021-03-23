let canvas = document.getElementById('audio_visual');
let ctx = canvas.getContext('2d');
let audioCtx = new AudioContext();
//analize the frequency of audio dat
let analyzer = audioCtx.createAnalyser();
//set the size of data array
analyzer.ffSize = 2048;

let audioData;
let chunks = [];

const record = document.getElementById('record');
const stop = document.getElementById('stop');
const audioClip = document.getElementById('audio_clip');
const audio = document.createElement('audio');
audio.id = 'audio-player';
audio.controls = 'controls';

document.querySelector('body').appendChild(audio);

let source = audioCtx.createMediaElementSource(audio);

source.connect(analyzer);

//constraint for the UserMedia
const constrait = {
  audio: true,
};

//record audio from microphone
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported');

  navigator.mediaDevices
    .getUserMedia(constrait)
    .then(stream => {
      //capture audio
      const mediaRecorder = new MediaRecorder(stream);

      record.onclick = () => {
        chunks = [];
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log('recorder started');
        record.style.background = 'red';
        record.style.color = 'black';
      };

      mediaRecorder.ondataavailable = e => {
        chunks.push(e.data);
      };

      stop.onclick = () => {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log('recorder stopped');
        record.style.background = '';
        record.style.color = '';
      };

      mediaRecorder.onstop = e => {
        console.log('recorder stopped');
        let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const audioUrl = URL.createObjectURL(blob);
        audioData = new Audio(audioUrl);
        audio.src = audioUrl;

        let data = new Uint8Array(analyzer.frequencyBinCount);

        const draw = data => {
          data = [...data];
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let space = canvas.width / data.length;

          data.forEach((value, i) => {
            ctx.beginPath();
            ctx.moveTo(space * i, canvas.height); //x,y
            ctx.lineTo(space * i, canvas.height - value); // x,y
            ctx.stroke();
          });
        };

        const animate = () => {
          requestAnimationFrame(animate);
          analyzer.getByteFrequencyData(data);
          draw(data);
        };

        requestAnimationFrame(animate);
      };

      audio.onplay = () => {
        audioCtx.resume();
        audioData.play();
      };
    })
    .catch(err => {
      console.error('The following getUserMedia error occured: ' + err);
    });
} else {
  console.log('getUserMedia not supported on your browser');
}
