google.load("visualization", "1", {
	packages: ["corechart"]
});
var url = "https://spreadsheets.google.com/feeds/list/1BOHzW4vpqkNx3615XVD71WaaS7fbqwDYGjZ9oN3yr3U/1/public/values?alt=json";
//var urlCountriesGEojson = "https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson";
var urlCountriesGEojson = "http://data.klimeto.com/au/gadm/v3_4/countries.geojson?f=foo";
var sendData = {};
var zgrupnute = {};
var mapData = [];
var mapDataRow;
var out = [];
var min = 1;
var max = 1;
var countryData = {
	'type': 'FeatureCollection',
	'features': []
};
var table;
$.getJSON(url, sendData, function (res) {

	$.each(res.feed.entry, function (key, feature) {
		var itemClass = feature.gsx$inwhichcountrydoyoucurrentlywork.$t;
		//console.log(itemClass);
		var length = feature.length;
		if ($.type(zgrupnute[itemClass]) !== "array") {
			zgrupnute[itemClass] = [];
		}
		zgrupnute[itemClass].push(feature);

	});
	var dataNum = Object.keys(zgrupnute).length;
	var counter = 1;
	if (dataNum > 0) {
		$.each(zgrupnute, function (key, group) {
			if (group.length <= min) {
				min = group.length
			}
			if (group.length >= max) {
				max = group.length
			}
			console.log(min);
			console.log(max);
			if (key != '') {
				var featureData = getGeoJsonForCountry(key, group.length, dataNum);

			}
		});
	}
})
.error(function (e) {
	console.log(e);
	location.reload(true);
});
function getGeoJsonForCountry(country, total, num) {
	$.getJSON(urlCountriesGEojson, sendData, function (res) {
		$.each(res.features, function (k, v) {
			if (country == v.properties.name || country == v.id) {
				kurac = v;
				kurac.properties["total"] = total;
				countryData["features"].push(kurac);
			}
		})
		if (num == countryData["features"].length) {
			zrobMapu();
			$("#loaderDIV").hide();
		}
	})
}
function zrobMapu() {
	var style = new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.6)'
			}),
			stroke: new ol.style.Stroke({
				color: '#319FD3',
				width: 1
			}),
			text: new ol.style.Text({
				font: '12px Calibri,sans-serif',
				fill: new ol.style.Fill({
					color: '#000'
				}),
				stroke: new ol.style.Stroke({
					color: '#fff',
					width: 3
				})
			})
		});
	var vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(JSON.stringify(countryData), {
				featureProjection: 'EPSG:3857'
			})
			//rl: urlCountriesGEojson,
			//format: new ol.format.GeoJSON()
		});
	var vectorLayer = new ol.layer.Vector({
			source: vectorSource,
			style: function (feature) {
				var dif = max - min;
				k = Math.abs(((feature.get('total') - min) / dif) * 100);
				ks = Math.abs(((feature.get('total') - min) / dif) * 255);
				ks2 = Math.abs(255 - ks);
				//console.log("KOEFICIENT:" + k);
				var r = Math.floor(Math.random() * (max - min + 1)) + min;
				//console.log("RENDOM:" + r);
				//var color ='#'+(Math.random()).toString(16).substr(2,6);
				var color = 'RGBA(' + 0 + ',' + ks.toFixed(0) + ',' + ks2.toFixed(0) + ',0.5)';
				//var color = 'RGBA('+ k.toFixed(0)+','+ k.toFixed(0)+','+ k.toFixed(0)+',0.85)';
				//var text = resolution < 15000 ? feature.getId() : '';
				style.setFill(new ol.style.Fill({
						color: color
					}));
				/*
				if (feature.get('total') <= 5) {
				style.setFill(new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.6)'
				}))
				}
				else if (feature.get('total') > 5){
				style.setFill(new ol.style.Fill({
				color: 'rgba(0, 255, 29, 0.6)'
				}))
				}
				 */

				return style;
			}
		});
	var baselayer = new ol.layer.Tile({
			source: new ol.source.OSM()
		})

		var map = new ol.Map({
			layers: [baselayer, vectorLayer],
			target: 'map',
			view: new ol.View({
				center: ol.proj.transform([0, 40], 'EPSG:4326', 'EPSG:3857'),
				zoom: 2.5
			})
		});

	// Popup showing the position the user clicked
	var popup = new ol.Overlay({
			element: document.getElementById('info')
		});
	map.addOverlay(popup);

	var highlightStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#f00',
				width: 1
			}),
			fill: new ol.style.Fill({
				color: 'rgba(255,0,0,0.1)'
			}),
			text: new ol.style.Text({
				font: '12px Calibri,sans-serif',
				fill: new ol.style.Fill({
					color: '#000'
				}),
				stroke: new ol.style.Stroke({
					color: '#f00',
					width: 3
				})
			})
		});

	var featureOverlay = new ol.layer.Vector({
			source: new ol.source.Vector(),
			map: map,
			style: function (feature) {
				highlightStyle.getText().setText(feature.get('name'));
				return highlightStyle;
			}
		});

	var highlight;
	var displayFeatureInfo = function (pixel) {
		var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
				return feature;
			});
		var element = popup.getElement();
		if (feature) {
			info.innerHTML = feature.getId() + ': ' + feature.get('name');
			var coordinate = pixel.coordinate;
			var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
			$(element).popover('destroy');
			popup.setPosition(coordinate);
			$(element).popover({
				'placement': 'top',
				'animation': false,
				'html': true,
				'content': feature.getId() + ': ' + feature.get('name')
			});
			$(element).popover('show');
		} else {
			//$('#infoModal').modal('hide');
			info.innerHTML = '&nbsp;';
		}
		if (feature !== highlight) {
			if (highlight) {
				featureOverlay.getSource().removeFeature(highlight);
			}
			if (feature) {
				featureOverlay.getSource().addFeature(feature);
			}
			highlight = feature;
		}
	};
	map.on('pointermove', function (evt) {
		if (evt.dragging) {
			return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
				console.log(feature.get('name'), feature.get('total'));
				$("#footerText").text("Country: " + feature.get('name') + ", no. responses: " + feature.get('total') + ". Click to see the results.");
			});
	});
	map.on('click', function (evt) {
		var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
				console.log(feature.get('name'), feature.get('total'));
				$("#loaderDIV").show()
				zrobKolace(feature.get('name'));
				var featureGeom = feature.getGeometry().getCoordinates();
				var extent = feature.getGeometry().getExtent();
				//map.getView().setCenter(featureGeom);
				map.getView().fit(extent, map.getSize());
			});
	});
}

function zrobKolace(country) {
	$('#myModalBody').empty();
	$('.modal-header').empty();
	//var country = data.getValue(selectedItem.row, 0);
	var url = "https://spreadsheets.google.com/feeds/list/1BOHzW4vpqkNx3615XVD71WaaS7fbqwDYGjZ9oN3yr3U/1/public/values?alt=json";
	var sendData = {};
	$.getJSON(url, sendData, function (res) {
		tables = "";
		charts = "";

		tables += '<table class="table table-condensed" id="answer1" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q1: In which sector do you work?</th>';
		tables += '</tr></thead><tbody>';

		tables += '<table class="table table-condensed" id="answer2" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q2: What kind of work do you do?</th>';
		tables += '</tr></thead><tbody>';

		tables += '<table class="table table-condensed" id="answer3" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q3: Do you consider membrane (drug) transporters as part of your work plan?</th>';
		tables += '</tr></thead><tbody>';

		tables += '<table class="table table-condensed" id="answer4" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q4. For which field(s) do you study membrane (drug) transporters?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer5" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q5: For which application(s) do you study membrane (drug) transporters? What are your incentives to consider membrane transporters in your work?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer51" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q5.1: Please specify</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer6" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q6: What kind of membrane (drug) transporter mechanism(s) are you interested in?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer71" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q7.1: Which ADME properties do you think membrane (drug) transporters impact the most?: Absorption</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer72" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q7.2: Which ADME properties do you think membrane (drug) transporters impact the most?: Distribution</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer73" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q7.3: Which ADME properties do you think membrane (drug) transporters impact the most?: Metabolism</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer74" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q7.4: Which ADME properties do you think membrane (drug) transporters impact the most?: Elimination</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer75" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q7.5: Which organs/physiological barriers are you interested in (related to transporters)?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer8" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q8: Which organs/physiological barriers are you interested in (related to transporters)??</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer9" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q9: Which membrane (drug) transporters are you interested in?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer10" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q10: What makes you decide which membrane transporter(s) to study?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer11" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q11: What drives your choice on the method to study membrane transporter(s)?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer12" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q12: Did you follow guideline or guidance document to decide when/which/how to study transporters?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer121" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q12.1:  Which one?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer122" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q12.2:  Do you think there is a need for further guidelines or guidance documents?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer13" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13: How do you study membrane transporters?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer131" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13.1:  Please specify which in vivo model(s)</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer132" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13.2: Please specify which in vivo method(s)</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer133" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13.3: Please specify which in vitro method(s)</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer134" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13.4: Please specify which in silico method(s)</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer135" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q13.5: Which sources for input parameters do you use?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer14" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q14: Do you think public (and inter-sector) sharing of databases on membrane (drug) transporters is currently sufficient?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer141" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q14.1: Which databases do you use?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer142" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q14.2: Which kind of data would be useful to share that are not available currently in databases?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer15" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q15: Are there appropriate non-animal assays to study each kind of membrane transporter mechanism (transport, inhibition, induction, interaction)?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer151" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q15.1: Please specify what is missing.</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer16" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q16: What are the challenges in interpretation or use of membrane transporters data from in vitro assays?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer161" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q16.1: For a same in vitro model, which experimental parameters would affect transporters activity?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer17" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q17: What are challenges in interpretation or use of membrane (drug) transporters data from in silico approaches?</th>';
		tables += '</thead><tbody>';

		tables += '<table class="table table-condensed" id="answer18" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q18: Are there any other challenges related to the use of in vitro/in silico drug transporters data for chemical risk assessment or for biomedical research, and if so, how can they be addressed?</th>';
		tables += '</tr></thead><tbody>';

		tables += '<table class="table table-condensed" id="answer19" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q19: How can we gain confidence in describing transporter toxicokinetics in the absence of in vivo data?</th>';
		tables += '</tr></thead><tbody>';

		tables += '<table class="table table-condensed" id="answer20" style="table-layout: fixed; word-wrap: break-word;">';
		tables += '<thead>';
		tables += '<tr>';
		tables += '<th colspan="2">Q20: This is the end of the questionnaire. We would like to thank you kindly for your participation. If there is any further comments or experiences that you would like to share related to the relevance of studying membrane (drug) transporters for chemical risk assessment or biomedical research using in vitro or in silico approaches, please feel free to do so in the text field below.</th>';
		tables += '</tr></thead><tbody>';

		$('#myModalBody').append(tables);
		var ans1 = [];
		var ans2 = [];
		var ans3 = [];
		var ans4 = [];
		var ans5 = [];
		var ans51 = [];
		var ans6 = [];
		var ans71 = [];
		var ans72 = [];
		var ans73 = [];
		var ans74 = [];
		var ans75 = [];
		var ans8 = [];
		var ans9 = [];
		var ans10 = [];
		var ans11 = [];
		var ans12 = [];
		var ans121 = [];
		var ans122 = [];
		var ans13 = [];
		var ans131 = [];
		var ans132 = [];
		var ans133 = [];
		var ans134 = [];
		var ans135 = [];
		var ans14 = [];
		var ans141 = [];
		var ans142 = [];
		var ans15 = [];
		var ans151 = [];
		var ans16 = [];
		var ans17 = [];
		var ans18 = [];
		var ans19 = [];
		var ans20 = [];

		$.each(res.feed.entry, function (key, feature) {
			console.log(feature);
			if (feature.gsx$inwhichcountrydoyoucurrentlywork.$t == country) {
				var a1 = feature.gsx$inwhichsectordoyouwork.$t;
				var a2 = feature.gsx$whatkindofworkdoyoudo.$t;
				var a3 = feature.gsx$doyouconsidermembranedrugtransportersaspartofyourworkplan.$t;
				var a4 = feature.gsx$forwhichfieldsdoyoustudymembranedrugtransporters.$t;
				var a5 = feature.gsx$forwhichapplicationsdoyoustudymembranedrugtransporterswhatareyourincentivestoconsidermembranetransportersinyourwork.$t;
				var a51 = feature.gsx$pleasespecify.$t;
				var a6 = feature.gsx$whatkindofmembranedrugtransportermechanismsareyouinterestedin.$t;
				var a71 = feature.gsx$whichadmepropertiesdoyouthinkmembranedrugtransportersimpactthemostabsorption.$t;
				var a72 = feature.gsx$whichadmepropertiesdoyouthinkmembranedrugtransportersimpactthemostdistribution.$t;
				var a73 = feature.gsx$whichadmepropertiesdoyouthinkmembranedrugtransportersimpactthemostmetabolism.$t;
				var a74 = feature.gsx$whichadmepropertiesdoyouthinkmembranedrugtransportersimpactthemostelimination.$t;
				var a75 = feature.gsx$whichorgansphysiologicalbarriersareyouinterestedinrelatedtotransporters.$t;
				var a8 = feature.gsx$whichmembranedrugtransportersareyouinterestedin.$t;
				var a9 = feature.gsx$whatmakesyoudecidewhichmembranetransporterstostudy.$t;
				var a10 = feature.gsx$whatdrivesyourchoiceonthemethodtostudymembranetransporters.$t;
				var a11 = feature.gsx$didyoufollowguidelineorguidancedocumenttodecidewhenwhichhowtostudytransporters.$t;
				var a12 = feature.gsx$whichone.$t;
				var a121 = feature.gsx$doyouthinkthereisaneedforfurtherguidelinesorguidancedocuments.$t;
				var a122 = feature.gsx$howdoyoustudymembranetransporters.$t;
				var a13 = feature.gsx$pleasespecifywhichinvivomodels.$t;
				var a131 = feature.gsx$pleasespecifywhichinvivomethods.$t;
				var a132 = feature.gsx$pleasespecifywhichinvitromethods.$t;
				var a133 = feature.gsx$pleasespecifywhichinsilicomethods.$t;
				var a134 = feature.gsx$whichsourcesforinputparametersdoyouuse.$t;
				var a135 = feature["gsx$doyouthinkpublicandinter-sectorsharingofdatabasesonmembranedrugtransportersiscurrentlysufficient"].$t;
				var a14 = feature.gsx$whichdatabasesdoyouuse.$t;
				var a141 = feature.gsx$whichkindofdatawouldbeusefultosharethatarenotavailablecurrentlyindatabases.$t;
				var a142 = feature["gsx$arethereappropriatenon-animalassaystostudyeachkindofmembranetransportermechanismtransportinhibitioninductioninteraction"].$t;
				var a15 = feature["gsx$pleasespecifywhatismissing."].$t;
				var a151 = feature.gsx$whatarethechallengesininterpretationoruseofmembranetransportersdatafrominvitroassays.$t;
				var a16 = feature.gsx$forasameinvitromodelwhichexperimentalparameterswouldaffecttransportersactivity.$t;
				var a17 = feature.gsx$whatarechallengesininterpretationoruseofmembranedrugtransportersdatafrominsilicoapproaches.$t;
				var a18 = feature.gsx$arethereanyotherchallengesrelatedtotheuseofinvitroinsilicodrugtransportersdataforchemicalriskassessmentorforbiomedicalresearchandifsohowcantheybeaddressed.$t;
				var a19 = feature.gsx$howcanwegainconfidenceindescribingtransportertoxicokineticsintheabsenceofinvivodata.$t;
				var a20 = feature["gsx$thisistheendofthequestionnaire.wewouldliketothankyoukindlyforyourparticipation.ifthereisanyfurthercommentsorexperiencesthatyouwouldliketosharerelatedtotherelevanceofstudyingmembranedrugtransportersforchemicalriskassessmentorbiomedicalresearchusinginvitroorinsilicoapproachespleasefeelfreetodosointhetextfieldbelow."].$t;
				if (a1 != '') {
					$("#answer1").show();
					if (a1.indexOf(';') !== -1) {
						var a1a = a1.split(";");
						$.each(a1a, function (i) {
							ans1.push(a1a[i]);
						});
					} else {
						ans1.push(a1);
					}
					$("#answer1").append('<tr><td>' + key + '</td><td>' + a1 + '</td></tr></tbody></table>');
				} else {
					$("#answer1").remove();
				}
				if (a2 != '') {
					$("#answer2").show();
					if (a2.indexOf(';') !== -1) {
						var a1Sa = a2.split(";");
						$.each(a1Sa, function (i) {
							ans2.push(a1Sa[i]);
						});
					} else {
						ans2.push(a2);
					}
					$("#answer2").append('<tr><td>' + key + '</td><td>' + a2 + '</td></tr></tbody></table>');
				} else {
					if ($("#answer2").find('tbody tr').length == 0) {
						$("#answer2").hide();
						//ans5.push(a5);
					}
				}

				if (a3 != '') {
					$("#answer3").show();
					if (a3.indexOf(';') !== -1) {
						var a3a = a3.split(";");
						$.each(a3a, function (i) {
							ans3.push(a3a[i]);
						});
					} else {
						ans3.push(a3);
					}
					$("#answer3").append('<tr><td>' + key + '</td><td>' + a3 + '</td></tr></tbody></table>');
				} else {
					$("#answer3").remove();
				}
				if (a4 != '') {
					$("#answer4").show();
					if (a4.indexOf(';') !== -1) {
						var a4a = a4.split(";");
						$.each(a4a, function (i) {
							ans4.push(a4a[i]);
						});
					} else {
						ans4.push(a4);
					}
					$("#answer4").append('<tr><td>' + key + '</td><td>' + a4 + '</td></tbody></table>');
				} else {
					$("#answer4").remove();
				}
				if (a5 != '') {
					$("#answer5").show();
					if (a5.indexOf(';') !== -1) {
						var a5a = a5.split(";");
						$.each(a5a, function (i) {
							ans5.push(a5a[i]);
						});
					} else {
						ans5.push(a5);
					}
					$("#answer5").append('<tr><td>' + key + '</td><td>' + a5 + '</td></tbody></table>');
				} else {
					if ($("#answer5").find('tbody tr').length == 0) {
						$("#answer5").hide();
						//ans5.push(a5);
					}
				}

				if (a51 != '') {
					$("#answer51").show();
					if (a5.indexOf(';') !== -1) {
						var a5a = a51.split(";");
						$.each(a5a, function (i) {
							ans51.push(a5a[i]);
						});
					} else {
						ans51.push(a51);
					}
					$("#answer51").append('<tr><td>' + key + '</td><td>' + a51 + '</td></tbody></table>');
				} else {
					if ($("#answer5").find('tbody tr').length == 0) {
						$("#answer5").hide();
						//ans5.push(a5);
					}
				}

				if (a6 != '') {
					$("#answer6").show();
					if (a6.indexOf(';') !== -1) {
						var a6a = a6.split(";");
						$.each(a6a, function (i) {
							ans6.push(a6a[i]);
						});
					} else {
						ans6.push(a6);
					}
					$("#answer6").append('<tr><td>' + key + '</td><td>' + a6 + '</td></tbody></table>');
				} else {
					if ($("#answer6").find('tbody tr').length == 0) {
						$("#answer6").hide();
						ans6.push(a6);
					}
				}
				if (a71 != '') {
					$("#answer71").show();
					if (a71.indexOf(';') !== -1) {
						var a71a = a71.split(";");
						$.each(a71a, function (i) {
							ans71.push(a71a[i]);
						});
					} else {
						ans71.push(a71);
					}
					$("#answer71").append('<tr><td>' + key + '</td><td>' + a71 + '</td></tbody></table>');
				} else {
					if ($("#answer71").find('tbody tr').length == 0) {
						$("#answer71").hide();
					}
				}

				if (a72 != '') {
					$("#answer72").show();
					if (a72.indexOf(';') !== -1) {
						var a72a = a72.split(";");
						$.each(a72a, function (i) {
							ans72.push(a72a[i]);
						});
					} else {
						ans72.push(a72);
					}
					$("#answer72").append('<tr><td>' + key + '</td><td>' + a72 + '</td></tbody></table>');
				} else {
					if ($("#answer72").find('tbody tr').length == 0) {
						$("#answer72").hide();
					}
				}
				if (a73 != '') {
					$("#answer73").show();
					if (a73.indexOf(';') !== -1) {
						var a73a = a73.split(";");
						$.each(a73a, function (i) {
							ans73.push(a73a[i]);
						});
					} else {
						ans73.push(a73);
					}
					$("#answer73").append('<tr><td>' + key + '</td><td>' + a73 + '</td></tbody></table>');
				} else {
					if ($("#answer73").find('tbody tr').length == 0) {
						$("#answer73").hide();
					}
				}

				if (a74 != '') {
					$("#answer74").show();
					if (a74.indexOf(';') !== -1) {
						var a74a = a74.split(";");
						$.each(a74a, function (i) {
							ans74.push(a74a[i]);
						});
					} else {
						ans74.push(a74);
					}
					$("#answer74").append('<tr><td>' + key + '</td><td>' + a74 + '</td></tbody></table>');
				} else {
					if ($("#answer74").find('tbody tr').length == 0) {
						$("#answer74").hide();
					}
				}

				if (a75 != '') {
					$("#answer75").show();
					if (a75.indexOf(';') !== -1) {
						var a75a = a75.split(";");
						$.each(a75a, function (i) {
							ans75.push(a75a[i]);
						});
					} else {
						ans75.push(a75);
					}
					$("#answer75").append('<tr><td>' + key + '</td><td>' + a75 + '</td></tbody></table>');
				} else {
					if ($("#answer75").find('tbody tr').length == 0) {
						$("#answer75").hide();
					}
				}
				if (a8 != '') {
					$("#answer8").show();
					if (a8.indexOf(';') !== -1) {
						var a8a = a8.split(";");
						$.each(a8a, function (i) {
							ans8.push(a8a[i]);
						});
					} else {
						ans8.push(a8);
					}
					$("#answer8").append('<tr><td>' + key + '</td><td>' + a8 + '</td></tbody></table>');
				} else {
					if ($("#answer8").find('tbody tr').length == 0) {
						$("#answer8").hide();
						ans8.push(a8);
					}
					//$("#answer8").remove();
				}
				if (a9 != '') {
					$("#answer9").show();
					if (a9.indexOf(';') !== -1) {
						var a9a = a9.split(";");
						$.each(a9a, function (i) {
							ans9.push(a9a[i]);
						});
					} else {
						ans9.push(a9);
					}
					$("#answer9").append('<tr><td>' + key + '</td><td>' + a9 + '</td></tbody></table>');
				} else {
					if ($("#answer9").find('tbody tr').length == 0) {
						$("#answer9").hide();
						ans9.push(a9);
					}
				}
				if (a10 != '') {
					$("#answer10").show();
					if (a10.indexOf(';') !== -1) {
						var a10a = a10.split(";");
						$.each(a10a, function (i) {
							ans10.push(a10a[i]);
						});
					} else {
						ans10.push(a10);
					}
					$("#answer10").append('<tr><td>' + key + '</td><td>' + a10 + '</td></tbody></table>');
				} else {
					if ($("#answer10").find('tbody tr').length == 0) {
						$("#answer10").hide();
						ans10.push(a10);
					}
				}

				if (a11 != '') {
					$("#answer11").show();
					if (a11.indexOf(';') !== -1) {
						var a11a = a11.split(";");
						$.each(a11a, function (i) {
							ans11.push(a11a[i]);
						});
					} else {
						ans11.push(a11);
					}
					$("#answer11").append('<tr><td>' + key + '</td><td>' + a11 + '</td></tbody></table>');
				} else {
					if ($("#answer11").find('tbody tr').length == 0) {
						$("#answer11").hide();
						ans11.push(a11);
					}
				}

				if (a12 != '') {
					$("#answer12").show();
					if (a12.indexOf(';') !== -1) {
						var a12a = a12.split(";");
						$.each(a12a, function (i) {
							ans12.push(a12a[i]);
						});
					} else {
						ans12.push(a12);
					}
					$("#answer12").append('<tr><td>' + key + '</td><td>' + a12 + '</td></tbody></table>');
				} else {
					if ($("#answer12").find('tbody tr').length == 0) {
						$("#answer12").hide();
						ans12.push(a12);
					}
				}

				if (a121 != '') {
					$("#answer121").show();
					if (a121.indexOf(';') !== -1) {
						var a121a = a121.split(";");
						$.each(a121a, function (i) {
							ans121.push(a121a[i]);
						});
					} else {
						ans121.push(a121);
					}
					$("#answer121").append('<tr><td>' + key + '</td><td>' + a121 + '</td></tbody></table>');
				} else {
					if ($("#answer121").find('tbody tr').length == 0) {
						$("#answer121").hide();
						ans121.push(a121);
					}
				}

				if (a122 != '') {
					$("#answer122").show();
					if (a122.indexOf(';') !== -1) {
						var a122a = a122.split(";");
						$.each(a122a, function (i) {
							ans122.push(a122a[i]);
						});
					} else {
						ans122.push(a122);
					}
					$("#answer122").append('<tr><td>' + key + '</td><td>' + a122 + '</td></tbody></table>');
				} else {
					if ($("#answer122").find('tbody tr').length == 0) {
						$("#answer122").hide();
						ans122.push(a122);
					}
				}

				if (a13 != '') {
					$("#answer13").show();
					if (a13.indexOf(';') !== -1) {
						var a13a = a13.split(";");
						$.each(a13a, function (i) {
							ans13.push(a13a[i]);
						});
					} else {
						ans13.push(a13);
					}
					$("#answer13").append('<tr><td>' + key + '</td><td>' + a13 + '</td></tbody></table>');
				} else {
					if ($("#answer13").find('tbody tr').length == 0) {
						$("#answer13").hide();
						ans13.push(a13);
					}
				}

				if (a131 != '') {
					$("#answer131").show();
					if (a131.indexOf(';') !== -1) {
						var a131a = a131.split(";");
						$.each(a131a, function (i) {
							ans131.push(a131a[i]);
						});
					} else {
						ans131.push(a131);
					}
					$("#answer131").append('<tr><td>' + key + '</td><td>' + a131 + '</td></tbody></table>');
				} else {
					if ($("#answer131").find('tbody tr').length == 0) {
						$("#answer131").hide();
						ans131.push(a131);
					}
				}

				if (a132 != '') {
					$("#answer132").show();
					if (a132.indexOf(';') !== -1) {
						var a132a = a132.split(";");
						$.each(a132a, function (i) {
							ans132.push(a132a[i]);
						});
					} else {
						ans132.push(a132);
					}
					$("#answer132").append('<tr><td>' + key + '</td><td>' + a132 + '</td></tbody></table>');
				} else {
					if ($("#answer132").find('tbody tr').length == 0) {
						$("#answer132").hide();
						ans132.push(a132);
					}
				}

				if (a133 != '') {
					$("#answer133").show();
					if (a133.indexOf(';') !== -1) {
						var a133a = a133.split(";");
						$.each(a133a, function (i) {
							ans133.push(a133a[i]);
						});
					} else {
						ans133.push(a133);
					}
					$("#answer133").append('<tr><td>' + key + '</td><td>' + a133 + '</td></tbody></table>');
				} else {
					if ($("#answer133").find('tbody tr').length == 0) {
						$("#answer133").hide();
						ans133.push(a133);
					}
				}

				if (a134 != '') {
					$("#answer134").show();
					if (a134.indexOf(';') !== -1) {
						var a134a = a134.split(";");
						$.each(a134a, function (i) {
							ans134.push(a134a[i]);
						});
					} else {
						ans134.push(a134);
					}
					$("#answer134").append('<tr><td>' + key + '</td><td>' + a134 + '</td></tbody></table>');
				} else {
					if ($("#answer134").find('tbody tr').length == 0) {
						$("#answer134").hide();
						ans134.push(a134);
					}
				}

				if (a135 != '') {
					$("#answer135").show();
					if (a135.indexOf(';') !== -1) {
						var a135a = a135.split(";");
						$.each(a135a, function (i) {
							ans135.push(a135a[i]);
						});
					} else {
						ans135.push(a135);
					}
					$("#answer135").append('<tr><td>' + key + '</td><td>' + a135 + '</td></tbody></table>');
				} else {
					if ($("#answer135").find('tbody tr').length == 0) {
						$("#answer135").hide();
						ans135.push(a135);
					}
				}

				if (a14 != '') {
					$("#answer14").show();
					if (a14.indexOf(';') !== -1) {
						var a14a = a14.split(";");
						$.each(a14a, function (i) {
							ans14.push(a14a[i]);
						});
					} else {
						ans14.push(a14);
					}
					$("#answer14").append('<tr><td>' + key + '</td><td>' + a14 + '</td></tbody></table>');
				} else {
					if ($("#answer14").find('tbody tr').length == 0) {
						$("#answer14").hide();
						ans14.push(a14);
					}
				}

				if (a141 != '') {
					$("#answer141").show();
					if (a141.indexOf(';') !== -1) {
						var a141a = a141.split(";");
						$.each(a141a, function (i) {
							ans141.push(a141a[i]);
						});
					} else {
						ans141.push(a141);
					}
					$("#answer141").append('<tr><td>' + key + '</td><td>' + a141 + '</td></tbody></table>');
				} else {
					if ($("#answer141").find('tbody tr').length == 0) {
						$("#answer141").hide();
						ans141.push(a141);
					}
				}

				if (a142 != '') {
					$("#answer142").show();
					if (a142.indexOf(';') !== -1) {
						var a142a = a142.split(";");
						$.each(a142a, function (i) {
							ans142.push(a142a[i]);
						});
					} else {
						ans142.push(a142);
					}
					$("#answer142").append('<tr><td>' + key + '</td><td>' + a142 + '</td></tbody></table>');
				} else {
					if ($("#answer142").find('tbody tr').length == 0) {
						$("#answer142").hide();
						ans142.push(a142);
					}
				}

				if (a15 != '') {
					$("#answer15").show();
					if (a15.indexOf(';') !== -1) {
						var a15a = a15.split(";");
						$.each(a15a, function (i) {
							ans15.push(a15a[i]);
						});
					} else {
						ans15.push(a15);
					}
					$("#answer15").append('<tr><td>' + key + '</td><td>' + a15 + '</td></tbody></table>');
				} else {
					if ($("#answer15").find('tbody tr').length == 0) {
						$("#answer15").hide();
						ans15.push(a15);
					}
				}

				if (a151 != '') {
					$("#answer151").show();
					if (a151.indexOf(';') !== -1) {
						var a151a = a151.split(";");
						$.each(a151a, function (i) {
							ans151.push(a151a[i]);
						});
					} else {
						ans151.push(a151);
					}
					$("#answer151").append('<tr><td>' + key + '</td><td>' + a151 + '</td></tbody></table>');
				} else {
					if ($("#answer151").find('tbody tr').length == 0) {
						$("#answer151").hide();
						ans151.push(a151);
					}
				}

				if (a16 != '') {
					$("#answer16").show();
					if (a16.indexOf(';') !== -1) {
						var a16a = a16.split(";");
						$.each(a16a, function (i) {
							ans16.push(a16a[i]);
						});
					} else {
						ans16.push(a16);
					}
					$("#answer16").append('<tr><td>' + key + '</td><td>' + a16 + '</td></tbody></table>');
				} else {
					if ($("#answer16").find('tbody tr').length == 0) {
						$("#answer16").hide();
						ans16.push(a16);
					}
				}

				if (a17 != '') {
					$("#answer17").show();
					if (a17.indexOf(';') !== -1) {
						var a17a = a17.split(";");
						$.each(a17a, function (i) {
							ans17.push(a17a[i]);
						});
					} else {
						ans17.push(a17);
					}
					$("#answer17").append('<tr><td>' + key + '</td><td>' + a17 + '</td></tbody></table>');
				} else {
					if ($("#answer17").find('tbody tr').length == 0) {
						$("#answer17").hide();
						ans17.push(a17);
					}
				}
				if (a18 != '') {
					$("#answer18").show();
					if (a18.indexOf(';') !== -1) {
						var a18a = a18.split(";");
						$.each(a18a, function (i) {
							ans18.push(a18a[i]);
						});
					} else {
						ans18.push(a18);
					}
					$("#answer18").append('<tr><td>' + key + '</td><td>' + a18 + '</td></tbody></table>');
				} else {
					if ($("#answer18").find('tbody tr').length == 0) {
						$("#answer18").hide();
						ans18.push(a18);
					}
				}
				if (a19 != '') {
					$("#answer19").show();
					if (a19.indexOf(';') !== -1) {
						var a19a = a19.split(";");
						$.each(a19a, function (i) {
							ans19.push(a19a[i]);
						});
					} else {
						ans19.push(a19);
					}
					$("#answer19").append('<tr><td>' + key + '</td><td>' + a19 + '</td></tbody></table>');
				} else {
					if ($("#answer19").find('tbody tr').length == 0) {
						$("#answer19").hide();
						ans19.push(a19);
					}
				}

				if (a20 != '') {
					$("#answer20").show();
					if (a20.indexOf(';') !== -1) {
						var a20a = a20.split(";");
						$.each(a20a, function (i) {
							ans20.push(a20a[i]);
						});
					} else {
						ans20.push(a20);
					}
					$("#answer20").append('<tr><td>' + key + '</td><td>' + a20 + '</td></tbody></table>');
				} else {
					if ($("#answer20").find('tbody tr').length == 0) {
						$("#answer20").hide();
						ans20.push(a20);
					}
				}

			}

		})

		if (ans1.length >= 2) {
			groupAnswers(ans1, 1);
		}
		if (ans2.length >= 2) {
			groupAnswers(ans2, 2);
		}
		if (ans3.length >= 2) {
			groupAnswers(ans3, 3);
		}
		if (ans4.length >= 2) {
			groupAnswers(ans4, 4);
		}
		if (ans5.length >= 2) {
			groupAnswers(ans5, 5);
		}
		if (ans51.length >= 2) {
			groupAnswers(ans51, 51);
		}
		if (ans6.length >= 2) {
			groupAnswers(ans6, 6);
		}
		if (ans71.length >= 2) {
			groupAnswers(ans71, 71);
		}
		if (ans72.length >= 2) {
			groupAnswers(ans72, 72);
		}
		if (ans73.length >= 2) {
			groupAnswers(ans73, 73);
		}
		if (ans74.length >= 2) {
			groupAnswers(ans74, 74);
		}
		if (ans75.length >= 2) {
			groupAnswers(ans75, 75);
		}
		if (ans8.length >= 2) {
			groupAnswers(ans8, 8);
		}
		if (ans9.length >= 2) {
			groupAnswers(ans9, 9);
		}
		if (ans10.length >= 2) {
			groupAnswers(ans10, 10);
		}
		if (ans11.length >= 2) {
			groupAnswers(ans11, 11);
		}
		if (ans12.length >= 2) {
			groupAnswers(ans12, 12);
		}
		if (ans121.length >= 2) {
			groupAnswers(ans121, 121);
		}
		if (ans122.length >= 2) {
			groupAnswers(ans122, 122);
		}
		if (ans13.length >= 2) {
			groupAnswers(ans13, 13);
		}
		if (ans131.length >= 2) {
			groupAnswers(ans131, 131);
		}
		if (ans132.length >= 2) {
			groupAnswers(ans132, 132);
		}
		if (ans133.length >= 2) {
			groupAnswers(ans133, 133);
		}
		if (ans134.length >= 2) {
			groupAnswers(ans134, 134);
		}
		if (ans135.length >= 2) {
			groupAnswers(ans135, 135);
		}
		if (ans14.length >= 2) {
			groupAnswers(ans14, 14);
		}
		if (ans141.length >= 2) {
			groupAnswers(ans141, 141);
		}
		if (ans142.length >= 2) {
			groupAnswers(ans142, 142);
		}
		if (ans15.length >= 2) {
			groupAnswers(ans15, 15);
		}
		if (ans151.length >= 2) {
			groupAnswers(ans151, 151);
		}
		if (ans16.length >= 2) {
			groupAnswers(ans16, 16);
		}
		if (ans17.length >= 2) {
			groupAnswers(ans17, 17);
		}
		if (ans18.length >= 2) {
			groupAnswers(ans18, 18);
		}
		if (ans19.length >= 2) {
			groupAnswers(ans19, 19);
		}
		if (ans20.length >= 2) {
			groupAnswers(ans20, 20);
		}
		$("#loaderDIV").hide();
		$('#myModal').modal('show');
		$('.modal-header').append('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
		if (country == 'Malaysia') {
			$('.modal-header').append('<center><h3>Singapore</h3></center>');
		} else {
			$('.modal-header').append('<center><h3>' + country + '</h3></center>');
		}

	})
}

function printElement(elem) {
	var domClone = elem.cloneNode(true);

	var $printSection = document.getElementById("printSection");

	if (!$printSection) {
		var $printSection = document.createElement("div");
		$printSection.id = "printSection";
		document.body.appendChild($printSection);
	}

	$printSection.innerHTML = "";
	$printSection.appendChild(domClone);
	window.print();
}

function groupAnswers(a, n) {
	//charts = "";
	pieData = [];
	console.log("############# QUESTION NUMNER: " + n);
	console.log("############# CHART VALUES: " + a);
	var categories = {},
	category;
	$.each(a, function (i, el) {
		category = el; //.text();
		//console.log(category + "was not found? " + categories.hasOwnProperty(category));
		if (categories.hasOwnProperty(category)) {
			categories[category] += 1;
		} else {
			categories[category] = 1;
			//console.log("adding category " + category);
			//console.log(category + "was not found? " + categories.hasOwnProperty(category));
			//console.log(categories);
		}
	});
	var pieHead = ["Q" + n + "", "Answers"];
	pieData.push(pieHead);
	for (var key in categories) {
		//$('ul').append('<li>' + key + ' (' + categories[key] + ')</li>');
		//$("#answer3").append('<tr><td>'+ key + ' (' + categories[key] +')</td></tr></tbody></table>');
		var slice = [key, categories[key]];
		pieData.push(slice);
	}
	console.log("DATA POSIELANE DO GRAFU: ", pieData);
	drawChart(pieData, n);
}

function drawChart(pieData, n) {
	var chartDiv = '<div id="piechart_' + n + '"></div>';
	$('#answer' + n + '').after(chartDiv);
	var data = google.visualization.arrayToDataTable(pieData);
	var options = {
		title: 'Question number: '.n,
		//height: 250,
		//width: 250,
		is3D: true,
		chartArea: {
			left: 0,
			top: 0,
			width: '100%',
			height: '100%'
		},
		legend: {
			position: 'labeled'
		}
	};

	//charts = '<div id="piechart_'+n+'"  style="width: 100%;"</div>'
	var chart = new google.visualization.PieChart(document.getElementById('piechart_' + n + ''));
	chart.draw(data, options);
}

//setTimeout(zrobMapu,5000);
/*
setTimeout(function(){
$("#loaderDIV").hide();
}, 5500);
*/

