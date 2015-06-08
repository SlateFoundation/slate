<?php

$Person = Person::getByID(20810);

\Debug::dumpVar($Person, false, 'Person');

\Debug::dumpVar(
    JSON::translateObjects($Person, false, ['FirstName', 'LastName', 'PrimaryEmail'], true),
    false,
    'translated'
);