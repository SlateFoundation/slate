<?php

// registers the canvas-user-merge follow-up action's mapping-action deriver
// and executor; unconditional, since it only reacts to connector_mappings
// rows a site chooses to create -- credentials for actually calling the
// Canvas API are configured separately, see
// php-config/RemoteSystems/Canvas.config.php
Slate\Connectors\Canvas\Connector::register();
