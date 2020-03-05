<?php

namespace Emergence\DAV;

class File extends \SiteFile implements \Sabre\DAV\IFile
{
    public static $localizedAncestorThreshold = 3600;

    // localize all changes
    public function put($data, $ancestorID = null)
    {
        if ('Local' == $this->Collection->Site) {
            return parent::put($data, $ancestorID);
        } else {
            $localCollection = $this->Collection->getLocalizedCollection();

            if ($localFile = $localCollection->getChild($this->Handle)) {
                if ($localFile->AuthorID == $GLOBALS['Session']->PersonID && $localFile->Timestamp > (time() - static::$localizedAncestorThreshold)) {
                    $ancestorID = $localFile->ID;
                } else {
                    $ancestorID = $this->ID;
                }

                return $localFile->put($data, $ancestorID);
            } else {
                return $localCollection->createFile($this->Handle, $data, $this->ID);
            }
        }
    }

    public function setName($handle)
    {
        if ('Local' != $this->Collection->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('Cannot rename files under _parent');
        }

        return parent::setName($handle);
    }

    public function delete()
    {
        if ('Local' != $this->Collection->Site) {
            throw new \Sabre\DAV\Exception\Forbidden('Cannot delete files under _parent');
        }

        return parent::delete();
    }

    public static function getByHandle($collectionID, $handle)
    {
        if ('GET' == $_SERVER['REQUEST_METHOD'] && !empty($_SERVER['HTTP_X_REVISION_ID'])) {
            return static::getByID($_SERVER['HTTP_X_REVISION_ID']);
        } else {
            return parent::getByHandle($collectionID, $handle);
        }
    }
}
