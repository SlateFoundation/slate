<?php

namespace intouch\ical;

use \IteratorAggregate;

/**
 * The wrapper for the main vcalendar data. Used instead of ArrayObject
 * so you can easily query for title and description.
 * Exposes a iterator that will loop though all the data
 *
 * @author Morten Fangel (C) 2008
 * @author Michael Kahn (C) 2013
 * @license http://creativecommons.org/licenses/by-sa/2.5/dk/deed.en_GB CC-BY-SA-DK
 */
class VCalendar implements IteratorAggregate
{
    protected $data;

    /**
     * Creates a new intouch\ical\VCalendar.
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Returns the title of the calendar. If no title is known, NULL
     * will be returned
     * @return string
     */
    public function getTitle()
    {
        if ( isset($this->data['x-wr-calname']) ) {
            return $this->data['x-wr-calname'];
        } else {
            return null;
        }
    }

    /**
     * Returns the description of the calendar. If no description is
     * known, NULL will be returned.
     * @return string
     */
    public function getDescription()
    {
        if ( isset($this->data['x-wr-caldesc']) ) {
            return $this->data['x-wr-caldesc'];
        } else {
            return null;
        }
    }

    /**
     * @see IteratorAggregate.getIterator()
     */
    public function getIterator()
    {
        return new ArrayIterator($this->data);
    }
}
