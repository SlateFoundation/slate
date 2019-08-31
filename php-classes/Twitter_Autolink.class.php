<?php

/**
 * Twitter Autolink Class
 *
 * Based on code by Matt Sanford, http://github.com/mzsanford
 */
class Twitter_Autolink
{
    /* HTML attribute to add when noFollow is true (default) */
    const NO_FOLLOW_HTML_ATTRIBUTE = " rel=\"nofollow\"";

    /* Default CSS class for auto-linked URLs */
    protected $urlClass = "tweet-url";

    /* Default CSS class for auto-linked list URLs */
    protected $listClass = "list-slug";

    /* Default CSS class for auto-linked username URLs */
    protected $usernameClass = "username";

    /* Default CSS class for auto-linked hashtag URLs */
    protected $hashtagClass = "hashtag";

    /* Default href for username links (the username without the @ will be appended) */
    protected $usernameUrlBase = "http://twitter.com/";

    /* Default href for list links (the username/list without the @ will be appended) */
    protected $listUrlBase = "http://twitter.com/";

    /* Default href for hashtag links (the hashtag without the # will be appended) */
    protected $hashtagUrlBase = "http://twitter.com/search?q=%23";
    protected $noFollow = true;

    public function __construct()
    {
    }

    public function autolink($tweet)
    {
        return $this->autoLinkUsernamesAndLists($this->autoLinkURLs($this->autoLinkHashtags($tweet)));
    }

    public function autoLinkHashtags($tweet)
    {
        // TODO Match latin chars with accents
        return preg_replace('$(^|[^0-9A-Z&/]+)([#?]+)([0-9A-Z_]*[A-Z_]+[a-z0-9_uA-OO-oo-y]*)$i',
            '${1}<a href="'.$this->hashtagUrlBase.'${3}" title="#${3}" class="'.$this->urlClass.' '.$this->hashtagClass.'">${2}${3}</a>',
                            $tweet);
    }

    public function autoLinkURLs($tweet)
    {
        $URL_VALID_PRECEEDING_CHARS = "(?:[^/\"':!=]|^|\\:)";
        $URL_VALID_DOMAIN = "(?:[\\.-]|[^\\p{P}\\s])+\\.[a-z]{2,}(?::[0-9]+)?";
        $URL_VALID_URL_PATH_CHARS = "[a-z0-9!\\*'\\(\\);:&=\\+\\$/%#\\[\\]\\-_\\.,~@]";
          // Valid end-of-path chracters (so /foo. does not gobble the period).
          //   1. Allow ) for Wikipedia URLs.
          //   2. Allow =&# for empty URL parameters and other URL-join artifacts
          $URL_VALID_URL_PATH_ENDING_CHARS = "[a-z0-9\\)=#/]";
        $URL_VALID_URL_QUERY_CHARS = "[a-z0-9!\\*'\\(\\);:&=\\+\\$/%#\\[\\]\\-_\\.,~]";
        $URL_VALID_URL_QUERY_ENDING_CHARS = "[a-z0-9_&=#]";
        $VALID_URL_PATTERN_STRING = '$('.//  $1 total match
            "(".$URL_VALID_PRECEEDING_CHARS.")".//  $2 Preceeding chracter
            "(".//  $3 URL
              "(https?://|www\\.)".//  $4 Protocol or beginning
              "(".$URL_VALID_DOMAIN.")".//  $5 Domain(s) and optional port number
              "(/".$URL_VALID_URL_PATH_CHARS."*".//  $6 URL Path
                     $URL_VALID_URL_PATH_ENDING_CHARS."?)?".
              "(\\?".$URL_VALID_URL_QUERY_CHARS."*".//  $7 Query String
                      $URL_VALID_URL_QUERY_ENDING_CHARS.")?".
            ")".
          ')$i';

        return preg_replace_callback($VALID_URL_PATTERN_STRING,
                                     array($this, 'replacementURLs'),
                                     $tweet);
    }

    /**
     * Callback used by autoLinkURLs
     */
    private function replacementURLs($matches)
    {
        $replacement  = $matches[2];
        if (substr($matches[3], 0, 7) == 'http://' || substr($matches[3], 0, 8) == 'https://') {
            $replacement .= '<a href="'.$matches[3].'">'.$matches[3].'</a>';
        } else {
            $replacement .= '<a href="http://'.$matches[3].'">'.$matches[3].'</a>';
        }
        return $replacement;
    }

    public function autoLinkUsernamesAndLists($tweet)
    {
        return preg_replace_callback('$([^a-z0-9_]|^)([@|?])([a-z0-9_]{1,20})(/[a-z][a-z0-9\x80-\xFF-]{0,79})?$i',
                                     array($this, 'replacementUsernameAndLists'),
                                     $tweet);
    }

    /**
     * Callback used by autoLinkUsernamesAndLists
     */
    private function replacementUsernameAndLists($matches)
    {
        $replacement  = $matches[1];
        $replacement .= $matches[2];

        if (isset($matches[4])) {
            /* Replace the list and username */
            $replacement .= '<a class="'.$this->urlClass.' '.$this->listClass.'" href="'.$this->listUrlBase.$matches[3].$matches[4].'">'.$matches[3].$matches[4].'</a>';
        } else {
            /* Replace the username */
            $replacement .= '<a class="'.$this->urlClass.' '.$this->usernameClass.'" href="'.$this->usernameUrlBase.$matches[3].'">'.$matches[3].'</a>';
        }

        return $replacement;
    }
}