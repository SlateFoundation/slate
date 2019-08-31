<?php

namespace Emergence\CMS\Item;

class Media extends AbstractItem
{
    public static $thumbWidth = 400;
    public static $thumbHeight = 400;

    public static $fullWidth = 1920;
    public static $fullHeight = 1920;

    protected $_media = false;

    public function getValue($name)
    {
        switch ($name) {
            case 'Media':
                if ($this->_media !== false) {
                    return $this->_media;
                }

                return $this->_media = $this->Data && !empty($this->Data['MediaID']) ? \Media::getByID($this->Data['MediaID']) : null;
            default:
                return parent::getValue($name);
        }
    }

    public function getData()
    {
        $details = parent::getData();
        $details['Media'] = $this->Media;
        return $details;
    }

    public function save($deep = true)
    {
        if ($this->isFieldDirty('Data') && $this->Media) {
            if ($this->Content) {
                $this->Media->ContextClass = $this->Content->getRootClass();
                $this->Media->ContextID = $this->ContentID;
            }

            if (array_key_exists('Caption', $this->Data)) {
                $this->Media->Caption = $this->Data['Caption'];
                unset($this->Data['Caption']);
            }

            $this->Media->save();
        }

        parent::save($deep);
    }

    public function renderBody()
    {
        if (empty($this->Data['MediaID']) || !($Media = \Media::getByID($this->Data['MediaID']))) {
            return '';
        } else {
            return '<div class="content-item content-media" id="contentItem-'.$this->ID.'">'
                .static::getMediaMarkup($Media)
                .'</div>';
        }
    }

    public static function getMediaMarkup(\Media $Media)
    {
        switch ($Media->Class) {
            case 'AudioMedia':
                return '<a href="'.$Media->WebPath.'" title="'.htmlspecialchars($Media->Caption).'" class="media-link audio-link">'
                    .'<img src="'.$Media->getThumbnailRequest(static::$thumbWidth,static::$thumbHeight).'" alt="'.htmlspecialchars($Media->Caption).'">'
                    .'</a>';
            case 'VideoMedia':
                return '<div title="'.htmlspecialchars($Media->Caption).'" class="media-link video-link" id="player-'.$Media->ID.'" style="width:425px;height:300px;">'
                    .'<img src="'.$Media->getThumbnailRequest(static::$thumbWidth,static::$thumbHeight).'" alt="'.htmlspecialchars($Media->Caption).'">'
                    .'</div><script>flowplayer("player-'.$Media->ID.'", "/swf/flowplayer-3.2.15.swf",{playlist:["'.$Media->WebPath.'"]})</script>';
            case 'PDFMedia':
                return '<a href="'.$Media->WebPath.'" title="'.htmlspecialchars($Media->Caption).'" class="media-link pdf-link">'
                    .'<img src="'.$Media->getThumbnailRequest(static::$thumbWidth,static::$thumbHeight).'" alt="'.htmlspecialchars($Media->Caption).'">'
                    .'</a>';
            case 'PhotoMedia':
            default:
                return '<figure class="media-figure">'
                        .'<a href="'.$Media->WebPath.'" title="'.htmlspecialchars($Media->Caption).'" class="media-link image-link">'
                            .'<img class="media-img" src="'.$Media->getThumbnailRequest(static::$fullWidth,static::$fullHeight).'" alt="'.htmlspecialchars($Media->Caption).'">'
                        .'</a>'
                        .(
                            $Media->Caption ?
                            '<figcaption class="media-caption">'.htmlspecialchars($Media->Caption).'</figcaption>' :
                            ''
                        )
                    .'</figure>';
        }
    }
}