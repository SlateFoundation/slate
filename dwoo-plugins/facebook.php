<?php



function Dwoo_Plugin_facebook(Dwoo_Core $dwoo, $page, $assign = 'fbFeed', $limit = 5, $since = false, $cacheTime = 60, $acessToken = '207886205923030|XNMhiHAb8MQp6KmSSIzfd3QH560')
{
    $url = 'https://graph.facebook.com/'.urlencode($page).'/feed?access_token='.urlencode($acessToken);
    $cacheKey = 'fbFeed:'.$page;

    if ($limit) {
        $url .= '&limit='.urlencode($limit);
        $cacheKey .= ';limit:'.$limit;
    }

    if ($since) {
        $url .= '&since='.urlencode($since);
        $cacheKey .= ';since:'.$since;
    }

    if (false === ($result = Cache::fetch($cacheKey))) {
        $data = file_get_contents($url);
        $result = $data ? json_decode($data, true) : null;
        Cache::store($cacheKey, $result, $cacheTime);
    }

    if (!empty($result['data']) && is_array($result['data'])) {
        $dwoo->assignInScope($result['data'], $assign);
    } else {
        $dwoo->assignInScope(array(), $assign);
    }


    return '';
}