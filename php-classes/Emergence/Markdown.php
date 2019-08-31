<?php

namespace Emergence;

/**
 * Emergence-flavored markdown parser
 *
 * Adds:
 * - Shell formatting
 */
class Markdown extends \Michelf\MarkdownExtra
{
    public $code_attr_on_pre = true;

    protected function _doFencedCodeBlocks_callback($matches)
    {
        $hashes    =& $this->html_hashes;
        $classname =& $matches[2];
        $attrs     =& $matches[3];
        $codeblock = $matches[4];


        $html = parent::_doFencedCodeBlocks_callback($matches);

        preg_replace_callback('/B\x1A[0-9]+B/', function($blockHashMatches) use (&$hashes) {
            $hashId = $blockHashMatches[0];

            if (array_key_exists($hashId, $hashes)) {
                $hashes[$hashId] = preg_replace_callback('|<pre class="shell">(.*?)</pre>|s', function($codeBlockMatches) {
                    $shellCode = $codeBlockMatches[1];

                    $shellCode = preg_replace_callback('/^([^\s]+\s+)([^\s]+\s+)([#$])\s+(.*)/m', function($commandMatches) {
                        $shellUser = trim($commandMatches[1]);
                        $shellPromptPath = trim($commandMatches[2]);
                        $shellPromptSymbol = $commandMatches[3];
                        $shellCommand = trim($commandMatches[4]);

                        $html = '';

                        if ($shellUser) {
                            $html .= '<span class="shell-user">'.$shellUser.'</span> ';
                        }

                        if ($shellPromptPath || $shellPromptSymbol) {
                            $html .= '<span class="shell-prompt">'.trim($shellPromptPath.' '.$shellPromptSymbol).'</span> ';
                        }

                        if (preg_match('/(.*?)\\[\\[\\[(.*?)\\]\\]\\](.*)/', $shellCommand, $selectionMatches)) {
                            $html .= $selectionMatches[1].'<span class="shell-command">'.$selectionMatches[2].'</span>'.$selectionMatches[3];
                        } else {
                            $html .= '<span class="shell-command">'.$shellCommand.'</span>';
                        }

                        return "<p>$html</p>";
                    }, $shellCode);

                    return '<pre class="shell">'.$shellCode.'</pre>';
                }, $hashes[$hashId]);
            }
            return $hashId;
        }, $html);

        return $html;
    }
}