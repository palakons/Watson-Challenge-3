$('#goButton').click(updateFromHandle);
$('#aStat').click(togglePlay);
$('#handleBox').keypress((e) => {
    if (e.which == 13) {
        updateFromHandle();
    }
});

$('#handleBox').val('oprah');
updateFromHandle();
var isPlay = false;

function updateFromHandle() {
    if ($('#handleBox').val() == '') return;

    console.log($('#handleBox').val());
    getData($('#handleBox').val())
        .then((data) => {
            //update both boxes

            console.log(data);
            if (data.insights != undefined) {

                //updateTwitter(data.tweets);
                updateInsights(data.insights);
                var voiceURL = 'https://tc-nizzz-03social.mybluemix.net/api/speak?text=' + formatInsightsforTTS(data.insights);
                $('#sBox')[0].src = voiceURL;
                //console.log($('#sBox').src);
                console.log(voiceURL);
                $('#aBox')[0].load(); //call this to just preload the audio without playing

                $('#aStatText').text('click to read');
                isPlay = false;
            } else {
                alert('Not enough tweets from ' + $('#handleBox').val() + ' consider a different account');
            }

        });
}
function togglePlay() {
    if (!isPlay) {
        $('#aBox')[0].play();
        $('#aStatText').text('click to pause');
        isPlay = true;
    } else {
        $('#aBox')[0].pause();
        //$('#aBox')[0].currentTime = 0;
        $('#aStatText').text('click to read');
        isPlay = false;
    }
    console.log('isPlay: ' + isPlay);
}
function findCommon(ss1, ss2) {
    var s1 = ss1.split(' ');
    var s2 = ss2.split(' ');
    var c1 = 0;
    var c2 = 0;
    for (var i in s1) {
        if (i < s2.length) {
            if (s1[i] == s2[i])
                c1 += s1[i].length + 1;
            else
                break;
        }
    }
    for (var i in s1) {
        if (i < s2.length) {
            if (s1[s1.length - 1 - i] == s2[s2.length - 1 - i]) {
                c2 += s2[s2.length - 1 - i].length + 1;
                //console.log('s2 matched: ' + s2[s2.length - 1 - i]);
            } else
                break;
        }
    }
    if (false && c1 > 10 && c2 > 0)
        console.log(ss1, ss2, c1, c2, ss1.substring(c1, ss1.length - c2), ss2.substring(c1, ss2.length - c2));
    return [c1, c2, ss1.substring(c1, ss1.length - c2), ss2.substring(c1, ss2.length - c2)];
}
function shrink(data, ending) {
    var output = []
    while (data.length > 0) {
        var temp = [data[0]];
        //console.log(data[0]);
        data.splice(0, 1);
        for (var i = 0; i < data.length; i++) {
            var res = findCommon(temp[0], data[i]);
            //console.log('checking ', data[i], res);
            if (res[0] > 10 && res[1] > 0) { //matched
                //console.log('matched',res[3]);
                temp.push(data[i]);
                data.splice(i, 1);
                i--;
            }
        }
        output.push(temp);
    }
    var output2 = [];
    for (var i = 0; i < output.length; i++) {
        if (output[i].length == 1) {
            output2.push(output[i][0]);
        } else {
            //console.log(output[i][0], output[i][1]);
            var res = findCommon(output[i][0], output[i][1]);
            var text = output[i][0].substring(0, res[0]);
            for (var j = 0; j < output[i].length; j++) {
                text += output[i][j].substring(res[0], output[i][j].length - res[1]);
                if (j < output[i].length - 2)
                    text += ', ';
                else if (j == output[i].length - 2)
                    text += ', ' + ending + ' ';
            }

            text += output[i][0].substring(output[i][0].length - res[1], output[i][0].length);
            output2.push(text);
        }
    }
    return output2;
}
function formatInsightsforTTS(data) {
    var text = '';
    if (data.consumption_preferences) {
        var t1 = [];
        var t0 = [];
        for (var i in data.consumption_preferences) {
            for (var j in data.consumption_preferences[i].consumption_preferences) {
                if (data.consumption_preferences[i].consumption_preferences[j].score == 0) {
                    t0.push(data.consumption_preferences[i].consumption_preferences[j].name);
                } else {
                    t1.push(data.consumption_preferences[i].consumption_preferences[j].name);
                }
            }
        }
    }
    //t1.sort(checkString);
    //t0.sort(checkString);

    //shrink string

    //console.log(shrink(t1,'and'));
    //console.log(shrink(t0,'or'));

    //end shrink string
    var uWord = $('#handleBox').val();//'You';
    text += uWord + ' is ' + shrink(t1, 'and').join('... ' + uWord + ' is ');
    text += '... On the other hand, ' + uWord + ' is NOT ' + shrink(t0, 'or').join('... ' + uWord + ' is NOT ');
    return encodeURIComponent(text);
}
function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}
function checkString(a, b) {
    var A = a.toLowerCase();
    var B = b.toLowerCase();
    if (A < B) {
        return -1;
    } else if (A > B) {
        return 1;
    } else {
        return 0;
    }
}
function updateInsights(data) {
    //console.log(data);
    //$('#insightsWell').text(JSON.stringify(data, null, ' '));
    var traits = ['needs', 'personality', 'values'];
    $('#insightsWell').html('');
    var text = '';
    if (data.consumption_preferences) {
        var t1 = [];
        var t0 = [];
        for (var i in data.consumption_preferences) {
            for (var j in data.consumption_preferences[i].consumption_preferences) {
                if (data.consumption_preferences[i].consumption_preferences[j].score == 0) {
                    t0.push(data.consumption_preferences[i].consumption_preferences[j].name);
                } else {
                    t1.push(data.consumption_preferences[i].consumption_preferences[j].name);
                }
            }
        }
    }
    t1=shrink(t1, 'and');
    t0=shrink(t0, 'or');
    text += '<div class="row">';
    text += '<div class="col-xs-6">';
    text += '<h3>You are likely to ...</h3>';
    text += '<ul><li>' + t1.join('</li><li>').replace(new RegExp('Likely to ', 'g'),'') + '</li></ul>'
    text += '</div>';
    text += '<div class="col-xs-6">';
    text += '<h3>You are NOT likely to ...</h3>';
    text += '<ul><li>' + t0.join('</li><li>').replace(new RegExp('Likely to ', 'g'),'') + '</li></ul>'
    text += '</div>';
    text += '</div>';
    text += '<div class="row">';
    for (var k in traits) {
        var divId = 'myChart-' + traits[k];
        text += '<div class="col-xs-4"><ul><h3>' + titleCase(traits[k]) + '</h3>';
        //$('#insightsWell').html($('#insightsWell').html() + '<canvas id='+divId + ' height=300> </canvas>');
        var labels = [];
        var chartData = [];
        data[traits[k]].sort((a, b) => {
            return b.percentile - a.percentile;
        });
        for (var i in data[traits[k]]) {
            text += '<li>' + data[traits[k]][i].percentile.toFixed(2) + ': ' + data[traits[k]][i].name;
            labels.push(data[traits[k]][i].name);
            chartData.push(data[traits[k]][i].percentile);
            //console.log(data[traits[k]][i])
            //conosle.log(data.k[i].name + ', ' + data.k[i].percentile);
            if (traits[k] == 'personality') {
                text += '<ul>'
                data[traits[k]][i].children.sort((a, b) => {
                    return b.percentile - a.percentile;
                });
                for (var j in data[traits[k]][i].children) {
                    //console.log(data[traits[k]][i].children[j].name + ', ' + data[traits[k]][i].children[j].percentile);

                    text += '<li>' + data[traits[k]][i].children[j].percentile.toFixed(2) + ': ' + data[traits[k]][i].children[j].name;

                    text += '</li>';
                }
                text += '</ul>'
            }

            text += '</li>';
        }

        text += '</ul></div>';

        var dataC = {
            labels: labels,
            datasets: [
                {
                    data: chartData
                }
            ]
        };
        var options = {
            type: 'horizontalBar',
            animation: true
        };
        //new Chart(document.getElementById(divId).getContext("2d")).Bar(dataC, options);
    }

    text += '</div>';

    $('#insightsWell').html(text);
}

function updateTwitter(data) {

    for (var i in data) {
        data[i].tago = '<time class="timeago" datetime="' + data[i].created_at + '"></time>';
    }
    var params = {
        columns: [{
            field: 'tago',
            title: 'date/time'
        }, {
            field: 'text',
            title: 'tweet'
        }],
        data: data//[{ 'created_at': '1', 'text': 'hi' }]
    };
    console.log(params);
    $('#table').bootstrapTable("destroy");
    $('#table').bootstrapTable(params);
    $("time.timeago").timeago();
}
function getData(handle) {
    var promise = new Promise((resolve, reject) => {
        var URL = '/api/insights';
        var data = { 'handle': handle };
        $.get(URL, data, (data, status, xhr) => {
            if (status == 'error') {
                reject(status);
            } else {
                resolve(data);
            }
        });
    });
    return promise;
}