
getHistory('history-content', $('#sourceText')[0].value, 'en', $('#destLang')[0].value, 'completed-transaction', function () { });

function useAPI(text, source, dest, output) {
	console.log('LOCAL translation API now');
	var url = '/api/v1/translate';
	var reqData = {
		'sourceText': text,
		'destinationLanguageCode': dest,
		'sourceLanguageCode': source
	};
	function callback(data, textStatus, jqXHR) {
		$('#' + output)[0].innerHTML = '';
		$('#' + output)[0].innerHTML += '<p><a href="#" data-toggle="tooltip" title="' + data.sourceLanguage + '"><span class="badge">' + data.Translation.sourceLanguageCode + '</span></a> ' + data.Translation.sourceText+'<p>';
		$('#' + output)[0].innerHTML += '<p>&#8659;</p>';
		$('#' + output)[0].innerHTML += '<p><a href="#" data-toggle="tooltip" title="' + data.destinationLanguage + '"><span class="badge">' + data.Translation.destinationLanguageCode + '</span></a> ' + data.Translation.translatedText+'<p>';
		$('#' + output)[0].innerHTML += '<div id="toneGraph" style="height:200px;"></div>';
		$('[data-toggle="tooltip"]').tooltip();
		plotToneGraph(data, 'toneGraph');
	}

	$.get(url, reqData, callback);
}
function getHistory(output, ttext, source, dest, output2, callback_tran) {
	console.log('LOCAL history API now');
	var url = '/api/v1/history';
	var reqData = { 'num': 5 };
	function callback(data, textStatus, jqXHR) {
		callback_tran(ttext, source, dest, output2);
		var text = '<table class = "table"><thead><tr><th>No.</th><th>Original</th><th>Translated</th></tr></thead><tbody>';

		for (var i in data) {
			var j = parseInt(i) + 1;
			text += '<tr><td>' + (j == 1 ? '<mark>recent</mark>' : j) + '</td><td>' + data[i].Translation.sourceText + '</td><td><a href="#" data-toggle="tooltip" title="' + data[i].Translation.destinationLanguage + '"><span class="badge">' + data[i].Translation.destinationLanguageCode + '</span></a> ' + data[i].Translation.translatedText + '</td></tr>';
		}
		text += '</tbody></table>';
		$('#' + output)[0].innerHTML = text;
		$('[data-toggle="tooltip"]').tooltip();

	}
	$.get(url, reqData, callback);
}
function plotToneGraph(translation, toneDiv) {
	console.log('translation data');
	console.log(translation);
	var toneData = [];
	var tempTone = translation.Translation.sourceTextTone;
	for (var i in tempTone.document_tone.tone_categories) {
		if (tempTone.document_tone.tone_categories[i].category_id === 'social_tone') {
			tempTone.document_tone.tone_categories[i].tones.sort(function (a, b) {
				if (a.tone_name < b.tone_name) return -1;
				if (a.tone_name > b.tone_name) return 1;
				return 0;
			});
			for (var j in tempTone.document_tone.tone_categories[i].tones) {
				toneData[j] = {};
				toneData[j]["category"] = tempTone.document_tone.tone_categories[i].tones[j].tone_name;
				toneData[j]["column-1"] = tempTone.document_tone.tone_categories[i].tones[j].score;
			}
			break;
			
		}
	}
	var tempTone = translation.Translation.translatedTextTone;
	for (var i in tempTone.document_tone.tone_categories) {
		if (tempTone.document_tone.tone_categories[i].category_id === 'social_tone') {
			tempTone.document_tone.tone_categories[i].tones.sort(function (a, b) {
				if (a.tone_name < b.tone_name) return -1;
				if (a.tone_name > b.tone_name) return 1;
				return 0;
			});
			for (var j in tempTone.document_tone.tone_categories[i].tones) {
				toneData[j]["column-2"] = tempTone.document_tone.tone_categories[i].tones[j].score;
			}
			break;
		}
	}
	AmCharts.makeChart(toneDiv,
		{
			"type": "serial",
			"categoryField": "category",
			"startDuration": 1,
			"handDrawn": true,
			"categoryAxis": {
				"labelRotation": -10,
				"gridPosition": "start"
			},
			"trendLines": [],
			"graphs": [
				{
					"balloonText": "[[title]] of [[category]]:[[value]]",
					"fillAlphas": 1,
					"id": "AmGraph-1",
					"title": "Original Tone",
					"type": "column",
					"valueField": "column-1"
				},
				{
					"balloonText": "[[title]] of [[category]]:[[value]]",
					"fillAlphas": 1,
					"id": "AmGraph-2",
					"title": "Translated Tone",
					"type": "column",
					"valueField": "column-2"
				}
			],
			"guides": [],
			"valueAxes": [
				{
					"id": "ValueAxis-1",
					"title": "Confidence"
				}
			],
			"allLabels": [],
			"balloon": {},
			"legend": {
				"enabled": true,
				"useGraphSettings": true
			},
			"titles": [],
			"dataProvider": toneData
		}
	);
}