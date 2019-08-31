<?php

namespace Slate\Connectors;

use Slate\Term;

class Job extends \Emergence\Connectors\Job
{
    protected $masterTerm;
    public function getMasterTerm()
    {
        if (!$this->masterTerm) {
            if (empty($this->Config['masterTerm'])) {
                throw new Exception('masterTerm required');
            }

            if (!$this->masterTerm = Term::getByHandle($this->Config['masterTerm'])) {
                throw new Exception('masterTerm not found');
            }
        }

        return $this->masterTerm;
    }

    protected $graduationYear;
    public function getGraduationYear()
    {
        if (!$this->graduationYear) {
            $this->graduationYear = $this->getMasterTerm()->getGraduationYear();
        }

        return $this->graduationYear;
    }
}
