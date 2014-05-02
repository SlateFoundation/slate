<?php

//Slate::$schoolName = 'MyTown High';
//Slate::$schoolAbbr = 'MTH';
//Slate::$siteSlogan = 'Open-source for education';

//Slate::$manageTools['Narratives'] = '/manage#progress/narratives';
//Slate::$manageTools['Standards'] = '/manage#progress/standards';
//Slate::$manageTools['Interims'] = '/manage#progress/interims';

if (RemoteSystems\GoogleApps::$domain) {
    Slate::$webTools['Google Apps'] = array(
        'Email' => 'https://mail.google.com/a/' . RemoteSystems\GoogleApps::$domain
        ,'Drive' => 'https://drive.google.com/a/' . RemoteSystems\GoogleApps::$domain
        ,'Calendar' => 'https://www.google.com/calendar/hosted/' . RemoteSystems\GoogleApps::$domain
        ,'Sites' => 'https://sites.google.com/a/' . RemoteSystems\GoogleApps::$domain
    );
}

if (RemoteSystems\Canvas::$canvasHost) {
    Slate::$webTools['Canvas'] = 'https://' . RemoteSystems\Canvas::$canvasHost;
}

//Slate::$webTools['Naviance'] = 'http://www.naviance.com/';
