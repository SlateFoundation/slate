<?php

function Dwoo_Plugin_rss(Dwoo_Core $dwoo, $feed, $assign = 'rss_items', $limit = 5, $cacheTime = 60)
{
    $cacheKey = 'rss:'.$feed;

    if (false === ($rss = Cache::fetch($cacheKey))) {
        $rss = new RssReader();
        $rss->load($feed);
        Cache::store($cacheKey, $rss, $cacheTime);
    }

    if ($limit) {
        $dwoo->assignInScope(array_slice($rss->getItems(), 0, $limit), $assign);
    } else {
        $dwoo->assignInScope($rss->getItems(), $assign);
    }

    return '';
}

