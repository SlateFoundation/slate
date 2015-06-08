<?php

User::$dynamicFields['ticketsCount'] = [
    'method' => function(User $User, $stringsOnly, $options, $field) {
        return \Slate\Assets\Ticket::getCount(['AssigneeID' => $User->ID]);
    }
];