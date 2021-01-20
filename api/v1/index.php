<?php

require('../../src/Router.php');
require('../../src/Funcs.php');

$router = new \Bramus\Router\Router();

$router->set404(function () {
	header('HTTP/1.1 404 Not Found');
	$return	= [];
	$return['error']	= true;
	$return['message']	= "404 Not Found";

	echo json_encode($return, JSON_PRETTY_PRINT);
});

$router->before('GET', '/.*', function () {
	header('Content-Type: application/json');
});


$router->get('/', function () {
	header('HTTP/1.1 204 No Content');
	$return	= [];
	$return['error']	= true;
	$return['message']	= "204 No Content";

	echo json_encode($return, JSON_PRETTY_PRINT);
});

$router->get('/delegates(/[A-z0-9_\-\.]+)?(/[A-z0-9_\-\.]+)?(/\d+)?', function ($name = null, $amount = null, $days = null) {
	$amount	= ($amount) ? $amount : "2M";
	$days	= ($days) ? $days : 30;
	$name	= ($name) ? $name : "all";

	if($name == "all"){
		GetDelegates($amount, $days);
	} else {
		GetDelegate($name, $amount, $days);
	}
}); 

$router->run();

?>
