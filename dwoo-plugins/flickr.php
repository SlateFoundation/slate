<?php



function Dwoo_Plugin_flickr(Dwoo_Core $dwoo, $tags, $assign = 'flickrPhotos', $count = 5, $tagmode='all')
{
    $cacheKey = sprintf('flickr?tagmode=%s&tags=%s', urlencode($tagmode), urlencode($tags));

    if (!$flickrData = apc_fetch($cacheKey)) {
        $feedURL = sprintf('http://api.flickr.com/services/feeds/photos_public.gne?format=php_serial&tagmode=%s&tags=%s', urlencode($tagmode), urlencode($tags));
        $flickrData = @unserialize(@file_get_contents($feedURL));
        apc_store($cacheKey, $flickrData, 600);
    }


    if (!empty($flickrData['items'])) {
        $dwoo->assignInScope(array_slice($flickrData['items'], 0, $count), $assign);
    } else {
        $dwoo->assignInScope(array(), $assign);
    }


    return '';
}

