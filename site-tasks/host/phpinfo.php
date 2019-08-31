<?php

return [
    'title' => 'Show PHP Configuration',
    'description' => 'Show the output of [`phpinfo()`](http://php.net/phpinfo)',
    'icon' => 'search',
    'requireAccountLevel' => 'Developer',
    'handler' => function () {
        ob_start();
        phpinfo();
        $html = ob_get_contents();
        ob_end_clean();

        // strip everything outside the <body>
        $html = preg_replace('/.*<body>(.*)<\/body>.*/s', '$1', $html);

        // style tables
        $html = str_replace('<table>', '<table class="table table-striped">', $html);

        return static::respond('phpinfo', [
            'html' => $html
        ]);
    }
];