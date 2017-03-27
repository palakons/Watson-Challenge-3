const TwitterService = {
    getTweets,
};

export default TwitterService;

var twitter = require('twitter');
var params = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
};
console.log(params);
var twit = new twitter(params);


async function getTweets(handle, n = 25, delimit = ' ') {
    var txt = ('hello ' + delimit).repeat(n);
    //n max 200
    var promise = new Promise((resolve, reject) => {


        twit.get('statuses/user_timeline', { screen_name: handle, 'count': n, 'include_rts': false }, function (error, tweets, response) {
            //console.log(tweets);
            if (error) {
                console.log('Twitter service error');
                reject(error);
            } else {
                console.log('Twitter service OK');
                var temp = [];
                for (var i in tweets) {
                    temp[i] = tweets[i].text;
                }
                resolve({'raw':tweets,'text':temp.join(delimit)});
            }
        });
    });
    return promise;
}
