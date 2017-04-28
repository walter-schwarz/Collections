<?php
// CURL wrapper ________________________________________________________________________________________________________
	function curl($url, $method = "GET", array $data = array(), array $options = array(), $json = false, $useAdminUser = false){
		$defaults = array(
			CURLOPT_HEADER => false,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT => 30, // timeout after 30 seconds if no result is coming back
			CURLOPT_CONNECTTIMEOUT => 10, // timeout after 10 seconds if the connection does not succeed
			CURLOPT_HTTPHEADER => array(
				"authorization: Bearer ".tmdb__user_access_token,
				"content-type: application/json;charset=utf-8"
			)
		);
		$data["api_key"] = tmdb__api_key;
		$debug = isset($data["debug"]);
		if($debug) {
			$verbose = fopen('php://temp', 'rw+');
			$defaults = $defaults + array(
					CURLOPT_VERBOSE => true,
					CURLOPT_STDERR => $verbose
				);
		}
		if($json) {
			$data = $data["json"];
		}
		if($method == "GET") {
			$defaults = $defaults + array(
					CURLOPT_URL => $url. (strpos($url, "?") === false ? "?" : ""). http_build_query($data)
				);
		}
		else {
			$defaults = $defaults + array(
					CURLOPT_URL => $url,
					CURLOPT_FRESH_CONNECT => true,
					CURLOPT_FORBID_REUSE => true,
					CURLOPT_POSTFIELDS => $json ? $data : http_build_query($data)
				);
			if($json) {
				$defaults[CURLOPT_HTTPHEADER] = array_merge(isset($defaults[CURLOPT_HTTPHEADER]) ? $defaults[CURLOPT_HTTPHEADER] : array(), array(
					"Content-Type: application/json",
					"Content-Length: " . strlen($data)
				));
			}
			if($method == "POST") {
				$defaults = $defaults + array(
						CURLOPT_POST => true
					);
			}
			else {
				$defaults = $defaults + array(
						CURLOPT_CUSTOMREQUEST => $method
					);
			}
		}
		$ch = curl_init();
		curl_setopt_array($ch, ($options + $defaults));
		$result = curl_exec($ch);
		if(floor(curl_getinfo($ch, CURLINFO_HTTP_CODE) / 100) != 2) {
			$result = json_encode(array(
				"error" => 'API error '.curl_getinfo($ch, CURLINFO_HTTP_CODE),
				"errorDescription" => curl_error($ch),
				"success" => false,
				"url" => $url,
				"data" => $data,
				"result" => $result
			));
		}
		if($debug) {
			rewind($verbose);
			$verboseLog = stream_get_contents($verbose);
			echo "Verbose information:\n<pre>", htmlspecialchars($verboseLog), "</pre>\n";
		}
		curl_close($ch);
		return $result == '' ? '{}' : $result;
	}

// Minifying and cache busting _________________________________________________________________________________________
	function autoVer($url){
		$path = pathinfo($url);
		$ver = ".".filemtime(__ROOT__."/".$url);
		return $path["dirname"]."/".$path["filename"].$ver.".".$path["extension"];
	}

// Debugging ___________________________________________________________________________________________________________
	function debug($var, $label = "", $force = false) {
		global $debug;
		if($force || $debug) {
			echo "<hr/>$label<pre>";
			var_dump($var);
			echo "</pre>";
		}
	}