<?php

// registers the canvas-user-merge follow-up action's mapping-action deriver
// and executor (Slate\Connectors\Canvas\MergeSupport, not ...\Connector --
// see that class's docblock); unconditional, since it only reacts to
// connector_mappings rows a site chooses to create. Calling the live
// Canvas API needs the real, separately distributed Canvas connector
// package composed into the site (its own leaf config sets
// RemoteSystems\Canvas::$canvasHost/$apiToken); a site without it gets a
// clear error from the executor rather than a fatal, see
// Slate\Connectors\Canvas\CanvasClient.
Slate\Connectors\Canvas\MergeSupport::register();
