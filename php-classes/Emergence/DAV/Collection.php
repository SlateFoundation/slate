<?php

namespace Emergence\DAV;

class Collection extends \SiteCollection implements \Sabre\DAV\ICollection
{
    public static $autoCreate = true;
    public static $fileClass = File::class;

    public function __construct($handle, $record = null)
    {
        try {
            parent::__construct($handle, $record);
        } catch (Exception $e) {
            throw new \Sabre\DAV\Exception\FileNotFound($e->getMessage());
        }
    }

    // localize file creation
    public function createDirectory($handle)
    {
        if ('Local' != $this->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('Cannot create collections under _parent');
        }

        return parent::createDirectory($handle);
    }

    public function createFile($path, $data = null, $ancestorID = null)
    {
        if ('Local' != $this->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('New files cannot be created under _parent');
            //return $this->getLocalizedCollection()->createFile($path, $data);
        }

        return parent::createFile($path, $data, $ancestorID);
    }

    public function setName($handle)
    {
        if ('Local' != $this->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('Cannot rename collections under _parent');
        }

        return parent::setName($handle);
    }

    public function delete()
    {
        if ('Local' != $this->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('Cannot delete collections under _parent');
        }

        return parent::delete();
    }

    public function getChild($handle, $record = null)
    {
        if ($child = parent::getChild($handle, $record)) {
            return $child;
        } else {
            throw new \Sabre\DAV\Exception\FileNotFound('The file with name: '.$handle.' could not be found');
        }
    }

    public function childExists($name)
    {
        try {
            $this->getChild($name);

            return true;
        } catch (\Sabre\DAV\Exception\FileNotFound $e) {
            return false;
        }
    }
}
