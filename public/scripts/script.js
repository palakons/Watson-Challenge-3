$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});
getHistory('history-content',$('#sourceText')[0].value,'en',$('#destLang')[0].value,'completed-transaction',function(){});

function useAPI(text, source, dest, output) {
	console.log('LOCAL use API now');
	var url = '/api/translate';
	var reqData = {
		'sourceText': text,
		'destinationLanguageCode': dest,
		'sourceLanguageCode': source
	};
	console.log(reqData);
	function callback(data, textStatus, jqXHR) {
		console.log(data);
		$('#' + output)[0].innerHTML = '';
		$('#' + output)[0].innerHTML += '(' + data.sourceLanguage + ')' + data.Translation.sourceText;
		$('#' + output)[0].innerHTML += '<div id="toneGraph"></div>';
		$('#' + output)[0].innerHTML += '(' + data.destinationLanguage + ')' + data.Translation.translatedText;
	}

	$.get(url, reqData, callback);
}
function getHistory(output, ttext, source, dest, output2, callback_tran) {
	console.log('LOCAL history API now');
	var url = '/api/history';
	var reqData = { 'num': 5 };
	console.log(ttext, source, dest, output2);
	function callback(data, textStatus, jqXHR) {

		console.log(ttext, source, dest, output2);
		callback_tran(ttext, source, dest, output2);
		console.log(data, textStatus, jqXHR);
		var text = '<table class = "table"><thead><tr><th>No.</th><th>Original</th><th>Target Language</th><th>Translated</th></tr></thead><tbody>';

		for (var i in data) {
			var j = parseInt(i) + 1;
			text += '<tr><td>' + (j == 1 ? '<mark>recent</mark>' : j) + '</td><td>' + data[i].Translation.sourceText + '</td><td>' + data[i].Translation.destinationLanguage + '</td><td><a href="#" data-toggle="tooltip" title="'+data[i].Translation.destinationLanguage+'"><span class="badge">'+data[i].Translation.destinationLanguageCode+'</span></a>' + data[i].Translation.translatedText + '</td></tr>';
		}
		text += '</tbody></table>';
		$('#' + output)[0].innerHTML = text;
	}
	$.get(url, reqData, callback);
}
function plotToneGraph(translation) {
	/*translation.sourceTextTone
	translation.translatedTextTone
		.document_tone.tone_categories[].category_id === 'social_tone'
			.document_tone.tone_categories[].tones[].tone_id
			.document_tone.tone_categories[].tones[].tone_name
			.document_tone.tone_categories[].tones[].score*/
	var toneData = [];
	var tempTone = translation.sourceTextTone;
	for (var i in tempTone.document_tone.tone_categories) {
		if (tempTone.document_tone.tone_categories.category_id === 'social_tone') {
			tempTone.document_tone.tone_categories[i].tones.sort(function (a, b) {
				if (a.tone_name < b.tone_name) return -1;
				if (a.tone_name > b.tone_name) return 1;
				return 0;
			});
			for (var j in tempTone.document_tone.tone_categories[i].tones) {
				toneData[j]["category"] = tempTone.document_tone.tone_categories[i].tones[j].tone_name;
				toneData[j]["column-1"] = tempTone.document_tone.tone_categories[i].tones[j].score;
			}
		}
		break;
	}
	var tempTone = translation.translatedTextTone;
	for (var i in tempTone.document_tone.tone_categories) {
		if (tempTone.document_tone.tone_categories.category_id === 'social_tone') {
			tempTone.document_tone.tone_categories[i].tones.sort(function (a, b) {
				if (a.tone_name < b.tone_name) return -1;
				if (a.tone_name > b.tone_name) return 1;
				return 0;
			});
			for (var j in tempTone.document_tone.tone_categories[i].tones) {
				toneData[j]["column-2"] = tempTone.document_tone.tone_categories[i].tones[j].score;
			}
		}
		break;
	}
	console.log(toneData);
	AmCharts.makeChart("toneGraph",
		{
			"type": "serial",
			"categoryField": "category",
			"startDuration": 1,
			"handDrawn": true,
			"categoryAxis": {
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
			"titles": [
				{
					"id": "Title-1",
					"size": 15,
					"text": "Chart Title"
				}
			],
			"dataProvider": toneData
			/*[
				{
					"category": "mood1",
					"column-1": 8,
					"column-2": 5
				},
				{
					"category": "category 2",
					"column-1": 6,
					"column-2": 7
				},
				{
					"category": "category 3",
					"column-1": 2,
					"column-2": 3
				}
			]*/
		}
	);
}