function useAPI(text,source,dest,output){
	console.log('LOCAL use API now');
	var url = '/api/translate';
	var reqData = {'sourceText':text,
			'destinationLanguageCode':dest,
			'sourceLanguageCode':source};
	console.log(reqData);
	function callback(data, textStatus, jqXHR){
		console.log(data,textStatus,jqXHR);
		$('#'+output)[0].innerHTML = '';
		$('#'+output)[0].innerHTML += data.Translation.sourceText;
		$('#'+output)[0].innerHTML += ' (';
		$('#'+output)[0].innerHTML += data.Translation.sourceTextTone;
		$('#'+output)[0].innerHTML += ')<br/>';
		$('#'+output)[0].innerHTML += data.Translation.sourceLanguageCode;
		$('#'+output)[0].innerHTML += ' -> ';
		$('#'+output)[0].innerHTML += data.Translation.destinationLanguageCode;
		$('#'+output)[0].innerHTML += '<br/>';
		$('#'+output)[0].innerHTML += data.Translation.translatedText;
		$('#'+output)[0].innerHTML += ' (';
		$('#'+output)[0].innerHTML += data.Translation.translatedTextTone;
		$('#'+output)[0].innerHTML += ')';
		//$('#'+output)[0].innerHTML += '<div class=\"alert alert-info\"><strong>Info!</strong> Indicates a neutral informative change or action.</div>';
	}
	
	$.get(url,reqData,callback);
}
function getHistory(output,ttext,source,dest,output2,callback_tran){
	console.log('LOCAL history API now');
	var url = '/api/history';
	var reqData = {'num':5};
	console.log(ttext,source,dest,output2);
	function callback(data, textStatus, jqXHR){

		console.log(ttext,source,dest,output2);
		callback_tran(ttext,source,dest,output2);
		console.log(data,textStatus,jqXHR);
		var text = '<table class = "table"><thead><tr><th>No.</th><th>sourceText</th><th>destinationLanguageCode</th><th>translatedText</th></tr></thead>';
		
		for(var i in data) {
			var j = parseInt(i)+1;
			text += '<tr><td>'+j+'</td><td>'+data[i].Translation.sourceText+'</td><td>'+data[i].Translation.destinationLanguageCode+'</td><td>'+data[i].Translation.translatedText+'</td></tr>';
		}
		text += '</table>';
		$('#'+output)[0].innerHTML = text;
	}
	$.get(url,reqData,callback);
}