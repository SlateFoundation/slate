<?php

namespace Emergence;

class SearchStringParser
{
    public static $debug = false;
    public static $quotes = '\'"‘’“”';

    // parser state
    protected $string;
    protected $cursorMax;
    protected $terms = array();

    // scanning state
    protected $qualifier = '';
    protected $term = '';
    protected $cursor = 0;
    protected $state = self::STATE_READY;

    // scanning state modes
    const STATE_READY = 0;
    const STATE_QUALIFIER = 1;
    const STATE_TERM = 2;


    function __construct($string)
    {
        $this->string = $string;
        $this->cursorMax = strlen($string) - 1;
    }

    public static function parseString($string)
    {
        $parser = new static($string);
        return $parser->parse();
    }

    protected static function isQuote($character)
    {
        return strpos(static::$quotes, $character) !== false;
    }

    protected static function isSpace($character)
    {
        return ctype_space($character);
    }

    protected static function isDelimiter($character)
    {
        return $character == ':';
    }

    protected function parse()
    {
        static::$debug && printf("Parsing string: %s\n\n", $this->string);

        while ($this->cursor <= $this->cursorMax) {
            static::$debug && printf("%u\t%s\t%u\t%s\t%s\n", $this->cursor, json_encode($this->string[$this->cursor]), $this->state, $this->qualifier, $this->term);

            switch ($this->state) {

                case self::STATE_READY:
                    $character = $this->string[$this->cursor];

                    if (static::isSpace($character)) {
                        // skip space in ready state
                        $this->cursor++;
                        break;
                    }

                    if (static::isDelimiter($character)) {
                        // skip delimiter and jump to term mode
                        $this->state = self::STATE_TERM;
                        $this->cursor++;
                        break;
                    }

                    // continue into qualifier mode and continue scan without advancing cursor

                case self::STATE_QUALIFIER:

                    $this->qualifier = $this->readSubstring();

                    if ($this->cursor > $this->cursorMax || !static::isDelimiter($this->string[$this->cursor])) {
                        // if there is no delimiter coming, this was a term
                        $this->term = $this->qualifier;
                        $this->qualifier = '';
                        $this->flushTerm();
                        break;
                    }

                    // skip delimeter and continue into term parsing
                    $this->cursor++;

                case self::STATE_TERM:
                    $this->term = $this->readSubstring(false);
                    $this->flushTerm();
                    break;
            }
        }

        return $this->terms;
    }

    protected function readSubstring($stopAtDelimiter = true)
    {
        $string = '';
        $quote = null;

        while ($this->cursor <= $this->cursorMax) {
            $character = $this->string[$this->cursor];

            if (!$quote && static::isQuote($character)) {
                // advance cursor, skip opening quote mark, and begin quoted region
                $this->cursor++;
                $quote = $character;
            } elseif ($character === $quote) {
                $stringLast = strlen($string) - 1;

                if ($string[$stringLast] == '\\') {
                    // replace escape sequence with quote
                    $string[$stringLast] = $character;
                } else {
                    // end quoted region
                    $quote = null;
                }

                // advance cursor and skip closing quote mark
                $this->cursor++;
            } elseif (!$quote && (static::isSpace($character) || ($stopAtDelimiter && static::isDelimiter($character)))) {
                // finish string without advancing cursor
                break;
            } else {
                // advance cursor and consume character
                $this->cursor++;
                $string .= $character;
            }
        }

        static::$debug && printf("Read substring: %s\n", var_export($string, true));
        return $string;
    }

     protected function flushTerm()
     {
        if ($this->term || $this->qualifier) {
            $this->terms[] = array(
                'qualifier' => $this->qualifier ?: null,
                'term' => $this->term ?: null
            );

            $this->qualifier = '';
            $this->term = '';

            static::$debug && printf("Flushed term: %s\n", print_r($this->terms[count($this->terms)-1], true));
        }

        $this->state = self::STATE_READY;
     }
}