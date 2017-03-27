export default {
  getVoice,
};

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const textToSpeech = new TextToSpeechV1({
  // If unspecified here, the TEXT_TO_SPEECH_USERNAME and
  // TEXT_TO_SPEECH_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
});

async function getVoice(req, res, next) {
  var params = {
    text: req.query.text,
    voice: 'en-US_AllisonVoice'/*,
    accept: 'audio/wav'*/
  };
  const transcript = textToSpeech.synthesize(params);
  transcript.on('response', (response) => {
    if (req.query.download) {
      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
    }
  });
  transcript.on('error', next);
  transcript.pipe(res);
}
