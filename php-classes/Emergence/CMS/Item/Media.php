<?php

namespace Emergence\CMS\Item;

class Media extends AbstractItem
{
    public static $thumbWidth = 400;
    public static $thumbHeight = 400;

    public static $fullWidth = 1000;
    public static $fullHeight = 1000;

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
                return '<a href="'.$Media->getThumbnailRequest(static::$fullWidth,static::$fullHeight).'" title="'.htmlspecialchars($Media->Caption).'" class="media-link image-link">'
                    .'<img src="'.$Media->getThumbnailRequest(static::$thumbWidth,static::$thumbHeight).'" alt="'.htmlspecialchars($Media->Caption).'">'
                    .'</a>';
        }
    }
}