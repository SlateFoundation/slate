<?php // BUILD: Remove line

namespace intouch\ical;

/**
 * Class Parser
 *
 * @author Morten Fangel (C) 2008
 * @author Michael Kahn (C) 2013
 * @license http://creativecommons.org/licenses/by-sa/2.5/dk/deed.en_GB CC-BY-SA-DK
 */
class Parser
{
    /**
     * Fetches $url and passes it on to be parsed
     * @param string $url
     * @param intouch\ical\iCal$ical
     */
    public static function Parse( $url, iCal $ical )
    {
        $content = self::Fetch( $url );
        $content = self::UnfoldLines($content);
        self::_Parse( $content, $ical );
    }

    /**
     * Passes a text string on to be parsed
     * @param string            $content
     * @param intouch\ical\iCal $ical
     */
    public static function ParseString($content, iCal $ical )
    {
        $content = self::UnfoldLines($content);
        self::_Parse( $content, $ical );
    }

    /**
     * Fetches a resource and tries to make sure it's UTF8
     * encoded
     * @return string
     */
    protected static function Fetch( $resource )
    {
        $is_utf8 = true;

        if ( is_file( $resource ) ) {
            // The resource is a local file
            $content = file_get_contents($resource);

            if ( ! self::_ValidUtf8( $content ) ) {
                // The file doesn't appear to be UTF8
                $is_utf8 = false;
            }
        } else {
            // The resource isn't local, so it's assumed to
            // be a URL
            $c = curl_init();
            curl_setopt($c, CURLOPT_URL, $resource);
            curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
            if ( !ini_get('safe_mode') && !ini_get('open_basedir') ) {
                curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);
            }
            $content = curl_exec($c);

            $ct = curl_getinfo($c, CURLINFO_CONTENT_TYPE);
            $enc = preg_replace('/^.*charset=([-a-zA-Z0-9]+).*$/', '$1', $ct);
            if ( $ct != '' && strtolower(str_replace('-','', $enc)) != 'utf8' ) {
                // Well, the encoding says it ain't utf-8
                $is_utf8 = false;
            } elseif ( ! self::_ValidUtf8( $content ) ) {
                // The data isn't utf-8
                $is_utf8 = false;
            }
        }

        if (!$is_utf8) {
            $content = utf8_encode($content);
        }

        return $content;
    }

    /**
     * Takes the string $content, and creates a array of iCal lines.
     * This includes unfolding multi-line entries into a single line.
     * @param $content string
     */
    protected static function UnfoldLines($content)
    {
        $data = array();
        $content = explode("\n", $content);
        for ( $i=0; $i < count($content); $i++) {
            $line = rtrim($content[$i]);
            while ( isset($content[$i+1]) && strlen($content[$i+1]) > 0 && ($content[$i+1]{0} == ' ' || $content[$i+1]{0} == "\t" )) {
                $line .= rtrim(substr($content[++$i],1));
            }
            $data[] = $line;
        }

        return $data;
    }

    /**
     * Parses the feed found in content and calls storeSection to store
     * parsed data
     * @param string $content
     * @param intouch\ical\iCal$ical
     */
    private static function _Parse( $content, iCal $ical )
    {
        $main_sections = array('vevent', 'vjournal', 'vtodo', 'vtimezone', 'vcalendar');
        $array_idents = array('exdate','rdate');
        $sections = array();
        $section = '';
        $current_data = array();

        foreach ($content AS $line) {
            $line = new Line($line);
            if ( $line->isBegin() ) {
                // New block of data, $section = new block
                $section = strtolower($line->getData());
                $sections[] = strtolower($line->getData());
            } elseif ( $line->isEnd() ) {
                // End of block of data ($removed = just ended block, $section = new top-block)
                $removed = array_pop($sections);
                $section = end($sections);

                if ( array_search($removed, $main_sections) !== false ) {
                    self::StoreSection( $removed, $current_data[$removed], $ical);
                    $current_data[$removed] = array();
                }
            } else {
                // Data line
                foreach ($main_sections AS $s) {
                    // Loops though the main sections
                    if ( array_search($s, $sections) !== false ) {
                        // This section is in the main section
                        if ($section == $s) {
                            // It _is_ the main section else
                            if (in_array($line->getIdent(), $array_idents))
                                //exdate could appears more that once
                                $current_data[$s][$line->getIdent()][] = $line;
                            else {
                                $current_data[$s][$line->getIdent()] = $line;
                            }
                        } else {
                            // Sub section
                            $current_data[$s][$section][$line->getIdent()] = $line;
                        }
                        break;
                    }
                }
            }
        }
        $current_data = array();
    }

    /**
     * Stores the data in provided intouch\ical\iCalobject
     * @param string $section eg 'vcalender', 'vevent' etc
     * @param string $data
     * @param intouch\ical\iCal$ical
     */
    protected static function storeSection( $section, $data, iCal $ical )
    {
        $data = Factory::Factory($ical, $section, $data);
        switch ($section) {
            case 'vcalendar':
                return $ical->setCalendarInfo( $data );
            case 'vevent':
                return $ical->addEvent( $data );
            case 'vjournal':
            case 'vtodo':
                return true; // TODO: Implement
            case 'vtimezone':
                return $ical->addTimeZone( $data );
        }
    }

    /**
     * This functions does some regexp checking to see if the value is
     * valid UTF-8.
     *
     * The function is from the book "Building Scalable Web Sites" by
     * Cal Henderson.
     *
     * @param  string $data
     * @return bool
     */
    private static function _ValidUtf8( $data )
    {
        $rx  = '[\xC0-\xDF]([^\x80-\xBF]|$)';
        $rx .= '|[\xE0-\xEF].{0,1}([^\x80-\xBF]|$)';
        $rx .= '|[\xF0-\xF7].{0,2}([^\x80-\xBF]|$)';
        $rx .= '|[\xF8-\xFB].{0,3}([^\x80-\xBF]|$)';
        $rx .= '|[\xFC-\xFD].{0,4}([^\x80-\xBF]|$)';
        $rx .= '|[\xFE-\xFE].{0,5}([^\x80-\xBF]|$)';
        $rx .= '|[\x00-\x7F][\x80-\xBF]';
        $rx .= '|[\xC0-\xDF].[\x80-\xBF]';
        $rx .= '|[\xE0-\xEF]..[\x80-\xBF]';
        $rx .= '|[\xF0-\xF7]...[\x80-\xBF]';
        $rx .= '|[\xF8-\xFB]....[\x80-\xBF]';
        $rx .= '|[\xFC-\xFD].....[\x80-\xBF]';
        $rx .= '|[\xFE-\xFE]......[\x80-\xBF]';
        $rx .= '|^[\x80-\xBF]';

        return ( ! (bool) preg_match('!'.$rx.'!', $data) );
    }
}
