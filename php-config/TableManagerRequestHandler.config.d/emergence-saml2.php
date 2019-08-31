<?php

// Prevent table manager from scanning SAML2 classes as the SAML2 library contains a lot of broken classes that will just die if you try to load them
TableManagerRequestHandler::$classFilters[] = '/^((Emergence\\\\)?SAML2|XmlSecurity)[\\\\_]/';