<?php

namespace Slate\Connectors\GoogleApps;

use Slate;
use Emergence\Connectors\IJob;
use Emergence\Connectors\Mapping;
use Emergence\People\User;
use Emergence\People\ContactPoint\Email AS EmailContactPoint;
use RemoteSystems\GoogleApps;
use Psr\Log\LogLevel;
use Emergence\Util\Data AS DataUtil;


class Connector extends \Emergence\Connectors\AbstractConnector implements \Emergence\Connectors\ISynchronize
{
    public static $title = 'Google Apps';
    public static $connectorId = 'google-apps';


    // workflow implementations
    protected static function _getJobConfig(array $requestData)
    {
        $config = parent::_getJobConfig($requestData);

        $config['apiToken'] = $requestData['apiToken'];
        $config['pushUsers'] = !empty($requestData['pushUsers']);

        return $config;
    }

    public static function synchronize(IJob $Job, $pretend = true)
    {
        if ($Job->Status != 'Pending' && $Job->Status != 'Completed') {
            return static::throwError('Cannot execute job, status is not Pending or Complete');
        }

        if (empty($Job->Config['apiToken'])) {
            return static::throwError('Cannot execute job, apiToken not provided');
        }


        // configure API wrapper
        GoogleApps::$apiToken = $Job->Config['apiToken'];


        // update job status
        $Job->Status = 'Pending';

        if (!$pretend) {
            $Job->save();
        }


        // init results struct
        $results = [];


        // uncap execution time
        set_time_limit(0);


        // execute tasks based on available spreadsheets
        if (!empty($Job->Config['pushUsers'])) {
            $results['push-users'] = static::pushUsers(
                $Job,
                $pretend
            );
        }


        // save job results
        $Job->Status = 'Completed';
        $Job->Results = $results;

        if (!$pretend) {
            $Job->save();
        }

        return true;
    }


    // task handlers
    public static function pushUsers(IJob $Job, $pretend = true)
    {
        // initialize results
        $results = [];


        // get existing users and map by email address
        $googleUsers = [];
        $googleIds = [];

        foreach (GoogleApps::getAllUsers(['fields' => 'users(id,name,primaryEmail)']) AS $googleUser) {
            $googleUsername = strstr($googleUser['primaryEmail'], '@', true);
            $googleUsers[$googleUsername] = $googleUser;
            $googleIds[$googleUser['id']] = $googleUsername;
        }

        $Job->notice('Loaded {totalUsers} users from Google Apps for analysis', [
            'totalUsers' => count($googleUsers)
        ]);
        $results['analyzed']['remote'] = count($googleUsers);


        // iterate over Slate users
        $slateUsers = [];
        $slateOnlyUsers = [];

        foreach (User::getAllByWhere('Username IS NOT NULL AND AccountLevel != "Disabled"') AS $User) {
            $slateUsers[] = $User->Username;
            $googleUser = null;
            $results['analyzed']['local']++;


            // look for an email address contact point @ the domain
            $DomainEmailPoint = null;
            foreach ($User->ContactPoints AS $ContactPoint) {
                if (is_a($ContactPoint, EmailContactPoint::class) && $ContactPoint->getDomainName() == GoogleApps::$domain) {
                    $DomainEmailPoint = $ContactPoint;
                    break;
                }
            }


            // try to match existing remote user by mapped id
            $Mapping = Mapping::getByWhere([
                'ContextClass' => $User->getRootClass(),
                'ContextID' => $User->ID,
                'Connector' => static::getConnectorId(),
                'ExternalKey' => 'user[id]'
            ]);

            if ($Mapping && array_key_exists($Mapping->ExternalIdentifier, $googleIds)) {
                $googleUser = $googleUsers[$googleIds[$Mapping->ExternalIdentifier]];
            }


            // try to match existing remote user by username
            if (!$googleUser && array_key_exists($User->Username, $googleUsers)) {
                $googleUser = $googleUsers[$User->Username];
            }


            // update existing remote user
            if ($googleUser) {
                if (!$DomainEmailPoint) {
                    $Job->error('Cannot update existing remote user {username} because they don\'t have an email contact point matching the domain', [
                        'username' => $User->Username
                    ]);
                    $results['outcome']['failed']['no-domain-email-contact-point']++;
                    continue;
                }


                // compare records and prepare changes
                $changes = [];

                $givenName = $User->PreferredName ?: $User->FirstName;
                if ($googleUser['name']['givenName'] != $givenName) {
                    $changes['name.givenName'] = [
                        'from' => $googleUser['name']['givenName'],
                        'to' => $givenName
                    ];
                }

                if ($googleUser['name']['familyName'] != $User->LastName) {
                    $changes['name.familyName'] = [
                        'from' => $googleUser['name']['familyName'],
                        'to' => $User->LastName
                    ];
                }

                if ($googleUser['primaryEmail'] != $DomainEmailPoint->address) {
                    $changes['primaryEmail'] = [
                        'from' => $googleUser['primaryEmail'],
                        'to' => $DomainEmailPoint->address
                    ];
                }


                // save matched mapping if an existing one wasn't used to find the local user
                if (!$Mapping) {
                    $Job->notice('Mapping external identifier {googleId} to user {username}', [
                        'googleId' => $googleUser['id'],
                        'username' => $User->Username
                    ]);
                    $results['mapping']['saved-from-match']++;

                    $Mapping = Mapping::create([
                        'Context' => $User,
                        'Source' => 'matching',
                        'Connector' => static::getConnectorId(),
                        'ExternalKey' => 'user[id]',
                        'ExternalIdentifier' => $googleUser['id']
                    ], !$pretend);
                }


                // log and apply changes
                if (count($changes)) {
                    if (!$pretend) {
                        try {
                            GoogleApps::patchUser(
                                $googleUser['id'],
                                DataUtil::extractToFromDelta(
                                    DataUtil::expandDottedKeysToTree($changes)
                                )
                            );
                        } catch (\Exception $e) {
                            $Job->error('Failed to patch Google user {googleId}: {errorMessage}', [
                                'googleId' => $googleUser['id'],
                                'errorMessage' => $e->getMessage()
                            ]);
                            $results['outcome']['request-failed'][$e->getCode()]++;
                            continue;
                        }
                    }

                    $Job->notice('Updating user {username}', [
                        'action' => 'update',
                        'changes' => $changes,
                        'username' => $User->Username
                    ]);

                    $results['outcome']['updated']++;
                } else {
                    $Job->debug('Remote user {username} matches local user', [
                        'username' => $User->Username
                    ]);
                    $results['outcome']['untouched']++;
                }

                $results['matched']['both']++;
                continue;
            }


            // consider creating a new remote user
            $slateOnlyUsers[] = $User->Username;

            $results['matched']['only-local']++;

            if (!$DomainEmailPoint) {
                $Job->debug('Skipping user {username} because they don\'t have an email contact point matching the domain', [
                    'username' => $User->Username
                ]);
                $results['outcome']['skipped']['no-domain-email-contact-point']++;
                continue;
            }


            // proceed with creating a new remote user
            if ($pretend) {
                $Job->notice('Creating user {username}', [
                    'username' => $User->Username
                ]);
                $results['outcome']['created']++;
            } else {
                try {
                    $googleResponse = GoogleApps::createUser([
                        'name' => [
                            'givenName' => $User->FirstName,
                            'familyName' => $User->LastName
                        ],
                        'password' => User::generatePassword(), // google requires a password, but we won't be storing it
                        'primaryEmail' => $DomainEmailPoint->address
                    ]);
                } catch (\Exception $e) {
                    $Job->error('Failed to create Google user for {username}: {errorMessage}', [
                        'username' => $User->Username,
                        'errorMessage' => $e->getMessage()
                    ]);
                    $results['outcome']['request-failed'][$e->getCode()]++;
                    continue;
                }

                if (empty($googleResponse['error'])) {
                    $Job->notice('Created user {username}, saving mapping to Google id "{googleId}"', [
                        'username' => $User->Username,
                        'googleId' => $googleResponse['id']
                    ]);
                    $results['outcome']['created']++;
                    $results['mapping']['saved-from-create']++;

                    $Mapping = Mapping::create([
                        'Context' => $User,
                        'Source' => 'creation',
                        'Connector' => static::getConnectorId(),
                        'ExternalKey' => 'user[id]',
                        'ExternalIdentifier' => $googleResponse['id']
                    ], true);
                } else {
                    $Job->error('Failed to create user {username}, received error from Google: {errorMessage}', [
                        'username' => $User->Username,
                        'errorMessage' => $googleResponse['error']
                    ]);
                    $results['outcome']['failed']['api-error'][$googleResponse['error']]++;
                }
            }
        } // end of Slate users loop


        // process extra remote users
        $googleOnlyUsers = array_diff(array_keys($googleUsers), $slateUsers);
        $results['matched']['only-remote'] = count($googleOnlyUsers);

        foreach ($googleOnlyUsers AS $googleUsername) {
            $Job->debug('Ignoring unmatched remote user {googleUsername}', [
                'googleUsername' => $googleUsername
            ]);
        }


        // print review spreadsheets
#        print "<h1>Users to create in Google Apps</h1><pre>Username,First name,Last name,Account Type,Graduation year,Student ID\n";
#
#        foreach ($slateOnlyUsers AS $username) {
#            $User = User::getByUsername($username);
#            print "$User->Username,$User->FirstName,$User->LastName,$User->AccountLevel,$User->GraduationYear,$User->StudentNumber\n";
#        }
#
#        print "</pre>";
#
#        print "<h1>Users to remove from Google Apps</h1><pre>Username,Given name,Family name\n";
#
#        foreach ($googleOnlyUsers AS $username) {
#            $userData = $googleUsers[$username];
#            print "$username,$userData[givenName],$userData[familyName]\n";
#        }
#
#        print "</pre>";
#
#        print "<h1>Changes to users in Google Apps</h1><pre>Username,Field,Existing value,New value\n";
#
#        foreach ($googleChanges AS $username => $changes) {
#            foreach ($changes AS $field => $delta) {
#                print "$username,$field,$delta[from],$delta[to]\n";
#            }
#        }
#
#        print "</pre>";

        return $results;
    }
}
