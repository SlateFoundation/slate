<?php

namespace Emergence\Connectors;

use Emergence\People\IPerson;

interface IIdentityConsumer
{
    const RESULT_PUSH_USER_CREATED = 'user-created';
    const RESULT_PUSH_USER_UPDATED = 'user-updated';
    const RESULT_PUSH_USER_UPTODATE = 'user-up_to_date';
    const RESULT_PUSH_USER_FAILED = 'user-failed';

    public static function getLaunchUrl(Mapping $Mapping = null);
    public static function handleLaunchRequest();
    public static function userIsPermitted(IPerson $Person);
#    public static function userShouldAutoProvision(IPerson $Person);
    public static function beforeAuthenticate(IPerson $Person);
    public static function getSAMLNameId(IPerson $Person);
    public static function getSAMLAttributes(IPerson $Person);
}