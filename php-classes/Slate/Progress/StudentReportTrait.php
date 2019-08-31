<?php

namespace Slate\Progress;

use Emergence\People\IPerson;
use Emergence\Dwoo\Engine AS DwooEngine;


trait StudentReportTrait
{
    public function getTimestamp()
    {
        return $this->Created;
    }

    public function getAuthor()
    {
        return $this->Creator;
    }

    public function getStudent()
    {
        return $this->Student;
    }

    public function getStatus()
    {
        return $this->Status;
    }

    public static function getCss(array $templateData = [])
    {
        return static::$cssTpl ? DwooEngine::getSource(static::$cssTpl) : '';
    }

    public function getBodyHtml($headingLevel = 2, array $templateData = [], $alternate = null)
    {
        $templateData['Report'] = $this;
        $templateData['headingLevel'] = $headingLevel;

        $template = static::$bodyTpl;

        if ($template && $alternate) {
            $template .= '.'.$alternate;
        }

        return $template ? DwooEngine::getSource($template, $templateData) : '';
    }

    public static function getAllByStudent(IPerson $Student)
    {
        return static::getAllByField('StudentID', $Student->ID, ['order' => ['ID' => 'DESC']]);
    }
}