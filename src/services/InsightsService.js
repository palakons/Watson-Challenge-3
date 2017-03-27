const InsightsService = {
    getInsights,
};

export default InsightsService;

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const personalityInsights = new PersonalityInsightsV3({
    // If unspecified here, the PERSONALITY_INSIGHTS_USERNAME and
    // PERSONALITY_INSIGHTS_PASSWORD env properties will be checked
    // After that, the SDK will fall back to the bluemix-provided
    // VCAP_SERVICES environment property
    // username: '<username>',
    // password: '<password>',
    version_date: '2016-10-19',
});

async function getInsights(txt) {
    //var txt = 'hello '.repeat(100);
    var params = {
        // Get the content items from the JSON file.
        content_items: [{ 'content': txt }],
        consumption_preferences: true,
        raw_scores: true,
        headers: {
            'accept-language': 'en',
            'accept': 'application/json'
        }
    };
    var promise = new Promise((resolve, reject) => {
        personalityInsights.profile(params, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });

    });
    return promise;
}
