<?php



 class ManageRequestHandler extends RequestHandler
 {
     public static $viewportLoader = 'Manager.Viewport';

     public static $applicationPanels = array(
        //'dashboard' => 'Dashboard.DashboardPanel'
        'browser' => 'Browser.BrowserPanel'
        ,'people' => 'People.PeopleManager'
        ,'media' => 'Media.MediaManager'
    );

     public static $contextPanels = array(
        'Person' => array(
            'People.PersonDetailsPanel'
            ,'People.PersonGroupsPanel'
            ,'People.PersonJournalPanel'
        )
    );

     public static $globalUse = array();


     public static function handleRequest()
     {
         $GLOBALS['Session']->requireAccountLevel('Staff');

        // handle JSON requests
        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        }

        // route request
        switch ($request = static::shiftPath()) {
            case 'sandbox':
            {
                return static::handleSandboxRequest();
            }

            default:
            {
                return static::handleConsoleRequest();
            }
        }
     }

     public static function handleConsoleRequest()
     {
         return static::respond('console', array(
            'success' => true
            ,'viewportLoader' => static::$viewportLoader
            ,'applicationPanels' => static::$applicationPanels
            ,'contextPanels' => static::$contextPanels
        ));
     }

     public static function handleSandboxRequest()
     {
         return static::respond('sandbox', array(
            'success' => true
        ));
     }
 }