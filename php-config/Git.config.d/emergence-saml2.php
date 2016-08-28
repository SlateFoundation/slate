<?php

Git::$repositories['emergence-saml2'] = [
    'remote' => 'https://github.com/JarvusInnovations/emergence-saml2.git',
    'originBranch' => 'master',
    'workingBranch' => 'master',
    'trees' => [
        'php-classes/Emergence/Connectors/SAML2.php',
        'php-classes/Emergence/SAML2/Container.php',

        'php-config/Emergence/Connectors/SAML2.config.php',
        'php-config/Git.config.d/emergence-saml2.php',
        'php-config/Git.config.d/simplesamlphp-saml2.php',
        'php-config/Git.config.d/xmlseclibs.php',
        'php-config/SAML2/Compat/ContainerSingleton.config.php',
        'php-config/TableManagerRequestHandler.config.d/emergence-saml2.php',

        'site-root/connectors/saml2.php'
    ]
];