import InsightsService from '../services/InsightsService';
import TwitterService from '../services/TwitterService';

export default {
  getPersonalityInsights,
};

async function getPersonalityInsights(req, res) {
  //get twitter from handle req.query.handle
  try {
    console.log('input handle: ',req.query.handle);
    const tweetsText = await TwitterService.getTweets(req.query.handle,req.query.n||25, ', ');
    console.log('tweets obtained');
    const result = await InsightsService.getInsights(tweetsText.text);
    console.log('insights obtained');
    //var result = tweetsText; //testing

    res.json({"tweets":tweetsText.raw, 'insights':result});
  } catch (err) {
    console.log('error: ',err);
    res.json(err);
  }
}

