<?php

MICS::redirect(
	empty($_SERVER['HTTP_REFERER'])
		? '/home'
		: parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH)
	,'thanks'
)

?>