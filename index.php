<!DOCTYPE html>
<html lang="en-us">
	<head>
		<title>Questionaire data visualization App - Impact of Membrane Transporters</title>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="chrome=1">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<link rel="stylesheet" href="https://openlayers.org/en/v4.6.5/css/ol.css" type="text/css">
		  
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
		
		<script src="https://www.gstatic.com/charts/loader.js"></script>
		<script src="//code.jquery.com/jquery-1.10.2.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		  <script src="https://openlayers.org/en/v4.6.5/build/ol.js"></script>
		<style>
		@media screen {
				#printSection {
					display: none;
				}
			}
			@media print {
				body * {
					visibility:hidden;
				}
				#printSection, #printSection * {
					visibility:visible;
				}
				#printSection {
					position:absolute;
					left:0;
					top:0;
				}
			}
			
		</style>
		<style type="text/css">
      html, body, .map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
    </style>
		<!-- Piwik -->
		<script type="text/javascript">
		  var _paq = _paq || [];
		  // tracker methods like "setCustomDimension" should be called before "trackPageView"
		  _paq.push(['trackPageView']);
		  _paq.push(['enableLinkTracking']);
		  (function() {
			var u="//bolegweb.geof.unizg.hr/piwik/";
			_paq.push(['setTrackerUrl', u+'piwik.php']);
			_paq.push(['setSiteId', '14']);
			var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
			g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
		  })();
		</script>
		<!-- End Piwik Code -->
		
	</head>
	<body>
	<div class="navbar navbar-fixed-top" style="background:none; left:5%">
	   <nav class="navbar-inner">
		   <h2 style="text-shadow: 0px 0px 7px rgba(0, 0, 0, 0.75);color: #ad3535;">Impact of Membrane Transporters</h2>
		   <h3 style="text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.75);color: #ada135;">Geographic distribution of the questionnaire results</h3>
	   </nav>
   </div>
   <div class="navbar navbar-fixed-bottom" style="background:none; left:2.5%" >
	   <nav class="navbar-inner">
		   <h4 style="text-shadow: 0px 0px 7px rgba(0, 0, 0, 0.75);color: #ad3535;" id="footerText"></h4>
	   </nav>
   </div>
			
			<div>
				
				<!--<div id="regions_div" style="width:50%; height: 50%; position: absolute; left: 1%"></div>-->
				<div id="map" class="map" ></div>

				 <div id="info" style="position: absolute;">&nbsp;</div>
			</div>
		<div id="myModal" class="modal fade" role="dialog">
		  <div class="modal-dialog">
			<!-- Modal content-->
			<div class="modal-content">
			  <div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<!--<h4 class="modal-title">Results for selected country</h4>-->
			  </div>
			  <div id="myModalBody" class="modal-body"></div>
			  <div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-info" id="cmd" style="float: left;" onclick="printElement(document.getElementById('myModalBody'))">Print</button>
			  </div>
			</div>
		  </div>
		 </div>
		<div id="loaderDIV" style="position:absolute; left:50%; top: 40%"><img id="loaderImage" src="http://4.bp.blogspot.com/-hO_3iF0kUXc/Ui_Qa3obNpI/AAAAAAAAFNs/ZP-S8qyUTiY/s200/pageloader.gif"><h2>Loading data ...</h2></div>
		 <p style="float: right;">Developed by <a href="http://klimeto.com" target="_new"><span class="label label-default">klimeto</span></a></p>
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	<script type="text/javascript" src="app.js"></script>
</body>
</html>