<?php
	require_once("php/config.php");
	require_once("php/functions.php");
	/*var_dump(curl(tmdb__api_url."list/18380", "GET", array(
		"page" => 1
	)));*/
?>
<html>
<head>
	<link rel="stylesheet" href="<?=autoVer("css/1-vendor/jquery.iziModal.css")?>" type="text/css">
	<link rel="stylesheet" href="<?=autoVer("css/2-app/app.css")?>" type="text/css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script src="<?=autoVer("js/1-vendor/jquery.iziModal.js")?>"></script>
	<script src="<?=autoVer("js/2-app/app.js")?>"></script>
</head>
<body>
	<header>
		<h1>Movies</h1>
	</header>
	<div class="lists">
		<div class="list__column list__column--local">
			<input type="file" id="local_file_input" webkitdirectory="" directory="">
			<ul id="local_list_items"></ul>
		</div>
		<div class="list__column list__column--tmdb">
			<ul id="tmdb_list_items"></ul>
		</div>
	</div>
</body>
</html>