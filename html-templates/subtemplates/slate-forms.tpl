{load_templates "subtemplates/forms.tpl"}

{template termField inputName=term label='Term' blankOption='Select' blankValue='' default=null error='' hint='' required=false}
    <?php
        $this->scope['options'] = [];

        foreach (Slate\Term::getAll(['order' => ['Left' => 'DESC']]) AS $Term) {
            $this->scope['options'][$Term->Handle] = $Term->Title;
        }
    ?>

    {selectField
        options=$options
        inputName=$inputName
        label=$label
        blankOption=$blankOption
        blankValue=$blankValue
        default=$default->Handle
        error=$error
        hint=$hint
        required=$required
    }
{/template}

{template courseField inputName=course label='Course' blankOption='Select' blankValue='' default=null error='' hint='' required=false}
    <?php
        $this->scope['options'] = [];

        foreach (Slate\Courses\Course::getAll(['order' => ['Title' => 'ASC']]) AS $Course) {
            $this->scope['options'][$Course->Code] = $Course->Title;
        }
    ?>

    {selectField
        options=$options
        inputName=$inputName
        label=$label
        blankOption=$blankOption
        blankValue=$blankValue
        default=$default->Code
        error=$error
        hint=$hint
        required=$required
    }
{/template}

{template locationField inputName=location label='Location' blankOption='Select' blankValue='' default=null error='' hint='' required=false}
    <?php
        $this->scope['options'] = [];

        foreach (Emergence\Locations\Location::getAll(['order' => ['Title' => 'ASC']]) AS $Location) {
            $this->scope['options'][$Location->Handle] = $Location->Title;
        }
    ?>

    {selectField
        options=$options
        inputName=$inputName
        label=$label
        blankOption=$blankOption
        blankValue=$blankValue
        default=$default->Code
        error=$error
        hint=$hint
        required=$required
    }
{/template}