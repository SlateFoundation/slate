<?php

namespace Slate\Progress\Narratives;

use DuplicateKeyException;

class Report extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_narrative_reports';

    // ActiveRecord configuration
    static public $tableName = 'narrative_reports';
    static public $singularNoun = 'narrative report';
    static public $pluralNoun = 'narrative reports';
    
    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
        'StudentID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'CourseSectionID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'TermID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Draft','Published')
            ,'default' => 'Draft'
        )
        ,'Updated' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )

        // TODO: comment out so sites can configure
        ,'Grade' => array(
            'type' => 'enum'
            ,'values' => array('A','B','C','D','F','Inc')
            ,'notnull' => false
        )
        ,'Assessment' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
        ,'Comments' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );
    
    
    static public $indexes = array(
        'NarrativeReport' => array(
            'fields' => array('StudentID','CourseSectionID','TermID')
            ,'unique' => true
        )
    );
    
    static $relationships = array(
        'Section' => array(
            'type' => 'one-one'
            ,'class' => \Slate\Courses\Section::class
            ,'local' => 'CourseSectionID'
        )
        ,'Student' => array(
            'type' => 'one-one'
            ,'class' => \Slate\People\Student::class
        )
        ,'Term' => array(
            'type' => 'one-one'
            ,'class' => \Slate\Term::class
        )
    );

    public function getData()
    {       
        // embed related object(s)
        $WorksheetAssignment = StandardsWorksheetAssignment::getByWhere(array(
            'TermID' => $this->TermID
            ,'CourseSectionID' => $this->CourseSectionID
        ));
        
        $prompts = array();
        
        if($WorksheetAssignment)
        {
            $promptIDs = \DB::allRecords('SELECT PromptID FROM `%s` WHERE WorksheetID=%u', array(
                WorksheetPrompt::$tableName
                ,$WorksheetAssignment->WorksheetID
            ));
            
            $promptIDs = array_map(function($record){
                return $record['PromptID'];
            }, $promptIDs);

            foreach($promptIDs as $promptID)
            {
                $Grade = PromptGrade::getByWhere(array(
                    'StudentID' => $this->StudentID
                    ,'CourseSectionID' => $this->CourseSectionID
                    ,'TermID' => $this->TermID
                    ,'PromptID' => $promptID
                ));
                
                $summarizedPrompt = array(
                    'PromptID' => $promptID
                );
                
                if($Grade)
                {
                    $summarizedPrompt['Grade'] = $Grade->Grade;
                    $summarizedPrompt['Prompt'] = $Grade->Prompt->Prompt;
                }
                else
                {
                    $Prompt = Prompt::getByID($promptID);
                    
                    $summarizedPrompt['Grade'] = null;
                    $summarizedPrompt['Prompt'] = $Prompt->Prompt;
                }
                
                array_push($prompts, $summarizedPrompt);    
            }
            
            usort($prompts, function($a, $b) {
                return strnatcmp($a['Prompt'], $b['Prompt']);
            });
        }
        
        
        return array_merge(parent::getData(), array(
            'Student' => $this->Student ? $this->Student->getData() : null
            ,'Section' => $this->Section ? $this->Section->getData() : null
            ,'Worksheet' => $Worksheet
            ,'Prompts' => $prompts
            ,'Updated' => $this->Updated ? $this->Updated : $this->Created
        ));
    }
    
    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);
        
        $this->_validator->validate(array(
            'field' => 'Grade'
            ,'validator' => 'selection'
            ,'choices' => self::$fields['Grade']['values']
            ,'required' => ($this->Status=='Published')
            ,'errorMessage' => 'Grade is require before publishing'
        ));
        
        // save results
        return $this->finishValidation();
    }
    
    public function getWorksheetAssignment()
    {
        return StandardsWorksheetAssignment::getByWhere(array(
            'CourseSectionID' => $this->CourseSectionID
            ,'TermID' => $this->TermID
        ));
    }
    
    public function getStandardsGrades()
    {
        $promtpGradClass = str_replace('\\', '_',PromptGrade::class);
        $where = array(
            'TermID' => $this->TermID
            ,'CourseSectionID' => $this->CourseSectionID
            ,'StudentID' => $this->StudentID
            ,"EXISTS(SELECT swp.ID FROM standards_worksheet_prompts swp WHERE swp.PromptID = $promtpGradClass.PromptID AND swp.WorksheetID = (SELECT swa.WorksheetID FROM standards_worksheet_assignments swa WHERE swa.TermID = $promtpGradClass.TermID AND swa.CourseSectionID = $promtpGradClass.CourseSectionID))"
        );

        return PromptGrade::getAllByWhere($where, array(
            'order' => 
                '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)'
                .', CourseSectionID'
                .', (SELECT Prompt FROM standards_prompts WHERE standards_prompts.ID = PromptID)'
        ));
    }
    
    public function save($deep = true, $createRevision = true)
    {
        
        if($this->isDirty)
        {
            $this->Updated = time();
        }
        
        try
        {
            // call parent
            parent::save($deep, $createRevision);
        }
        catch(DuplicateKeyException $e)
        {
            // duplicate create save! apply update to existing record
            $Existing = static::getByWhere(array(
                'StudentID' => $this->StudentID
                ,'CourseSectionID' => $this->CourseSectionID
                ,'TermID' => $this->TermID
            ));
            
            $Existing->setFields($this->_record);
            
            $Existing->save();
            
            // clone existing record's data
            $this->_record = $Existing->_record;
        }
    }
}