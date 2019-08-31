<?php

ContactRequestHandler::$validators[] = array(
    'field' => 'Name'
    ,'validator' => 'string'
    ,'required' => true
);


ContactRequestHandler::$validators[] = array(
    'field' => 'Email'
    ,'validator' => 'email'
    ,'required' => true
);


ContactRequestHandler::$validators[] = array(
    'field' => 'Phone'
    ,'validator' => 'phone'
    ,'required' => false
);


ContactRequestHandler::$validators[] = array(
    'field' => 'Message'
    ,'validator' => 'string_multiline'
    ,'required' => true
);