<?php

namespace Emergence\CMS;

use Cache;

class ContentBlock extends \VersionedRecord
{
    // ActiveRecord configuration
    public static $tableName = 'content_blocks';
    public static $singularNoun = 'content block';
    public static $pluralNoun = 'content blocks';
    public static $collectionRoute = '/content-blocks';
    public static $useCache = true;

    public static $fields = array(
        'Handle' => array(
            'unique' => true
        )
        ,'Renderer' => array(
            'type' => 'enum'
            ,'values' => array('text', 'html', 'markdown')
            ,'default' => 'markdown'
        )
        ,'Content' => array(
            'type' => 'clob'
        )
    );

    public static $dynamicFields = array(
        'html' => array(
            'getter' => 'getHtml'
        )
    );

    public static $searchConditions = array(
        'Content' => array(
            'qualifiers' => array('any', 'content')
            ,'points' => 2
            ,'sql' => 'Content Like "%%%s%%"'
        )
        ,'Handle' => array(
            'qualifiers' => array('any', 'handle')
            ,'points' => 2
            ,'sql' => 'Handle Like "%%%s%%"'
        )
    );


    public static function getByHandle($contentHandle)
    {
        return static::getByField('Handle', $contentHandle, true);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        $this->_validator->validate(array(
            'field' => 'Handle'
            ,'validator' => 'handle'
            ,'errorMessage' => 'Handle can only contain letters, numbers, hyphens, and underscores'
        ));

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // call parent
        parent::save($deep);

        if ($this->isFieldDirty('Content')) {
            Cache::delete($this->getHtmlCacheKey());
        }
    }

    protected function getHtmlCacheKey()
    {
        return 'content-block-html/'.$this->Handle;
    }

    public function getHtml()
    {
        $cacheKey = $this->getHtmlCacheKey();

        if (false === ($result = Cache::fetch($cacheKey))) {
            $result = '';

            switch ($this->Renderer) {
                case 'text':
                    $result = htmlspecialchars($this->Content);
                    break;
                case 'html':
                    $result = $this->Content;
                    break;
                case 'markdown':
                    $result =
                        \Michelf\SmartyPantsTypographer::defaultTransform(
                            \Michelf\MarkdownExtra::defaultTransform($this->Content)
                        );
                    break;
            }

            Cache::store($cacheKey, $result);
        }

        return $result;
    }
}