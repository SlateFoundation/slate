<?php

namespace Emergence\Connectors\iCal;

use Emergence\Events\Feed;
use Emergence\Events\FeedEvent;
use Emergence\Connectors\IJob;
use intouch\ical\iCal;

class Connector extends \Emergence\Connectors\AbstractConnector implements \Emergence\Connectors\ISynchronize
{
    public static $title = 'iCal Feeds';
    public static $connectorId = 'ical';

    public static function synchronize(IJob $Job, $pretend = true)
    {
        if ($Job->Status != 'Pending' && $Job->Status != 'Completed') {
            return static::throwError('Cannot execute job, status is not Pending or Complete');
        }

        // update job status
        $Job->Status = 'Pending';

        if (!$pretend) {
            $Job->save();
        }

        // init results struct
        $results = array(
            'events' => array(
                'analyzed' => 0
                ,'created' => 0
                ,'updated' => 0
                ,'deleted' => 0
                ,'skipped' => 0
            )
        );

        // uncap execution time
        set_time_limit(0);
        $now = time();
        $nowString = date('Y-m-d H:i:s', $now);

        // compile course upload data
        foreach (Feed::getAll() AS $Feed) {
            $ics = new iCal($Feed->Link);

            foreach ($ics->getEvents() AS $icsEvent) {
                if ($Feed->MinimumDate && $Feed->MinimumDate > $icsEvent->getStart()) {
                    $results['events']['skipped']++;
                    continue;
                }

                $results['events']['analyzed']++;

                $icsId = $icsEvent->getUID();
                if ($recurrenceId = $icsEvent->getProperty('recurrence-id')) {
                    $icsId .= '+'.$recurrenceId;
                }

                // try to get existing
                if (!$Event = FeedEvent::getByUID($icsId)) {
                    $Event = FeedEvent::create(array(
                        'UID' => $icsId
                    ));
                }

                $description = trim($icsEvent->getDescription());
                $location = trim($icsEvent->getLocation());

                $Event->setFields(array(
                    'Title' => $icsEvent->getSummary()
                    ,'Description' => $description ? $description : null
                    ,'Location' => $location ? $location : null
                    ,'StartTime' => $icsEvent->getStart()
                    ,'EndTime' => $icsEvent->getEnd()
                    ,'FeedID' => $Feed->ID
                    ,'Imported' => $now
                ));

                $logEntry = $Job->logRecordDelta($Event, array(
                    'messageRenderer' => function($logEntry) {
                        if ($logEntry['action'] == 'create') {
                            return "Created new event: {$logEntry[record]->Title}";
                        } else {
                            return "Updated event #{$logEntry[record]->ID}: {$logEntry[record]->Title}";
                        }
                    }
                    ,'ignoreFields' => array('Imported')
                    ,'valueRenderers' => array(
                        'StartTime' => function($value) {
                            return date('Y-m-d H:i:s', $value);
                        }
                        ,'EndTime' => function($value) {
                            return date('Y-m-d H:i:s', $value);
                        }
                    )
                ));

                if ($logEntry['action'] == 'create') {
                    $results['events']['created']++;
                } elseif ($logEntry['action'] == 'update') {
                    $results['events']['updated']++;
                }

                if (!$pretend) {
                    $Event->save();
                }
            }

            if (!$pretend) {
                // delete events that came from this feed but weren't included this time
                \DB::nonQuery('DELETE FROM `%s` WHERE FeedID = %u AND Imported != "%s"', array(FeedEvent::$tableName, $Feed->ID, $nowString));
            }

            $results['events']['deleted'] += \DB::affectedRows();
        }


        // save job results
        $Job->Status = 'Completed';
        $Job->Results = $results;

        if (!$pretend) {
            $Job->save();
        }

        return true;
    }
}
