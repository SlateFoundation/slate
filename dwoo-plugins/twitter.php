<?php

function Dwoo_Plugin_twitter(Dwoo_Core $dwoo, $username = false, $query = false, $assign = 'tweets', $count = 5, $cacheTime = 60)
{
    if ($query) {
        $cacheKey = sprintf('twitter?query=%s', urlencode($query));
        $feedURL = sprintf('http://search.twitter.com/search.json?q=%s', urlencode($query));
        $twitterData = Twitter::getFeedData($feedURL, $cacheKey, $cacheTime);

        $results = $twitterData['results'];
    } elseif ($username) {
        $cacheKey = sprintf('twitter?username=%s', urlencode($username));
        $feedURL = sprintf('http://api.twitter.com/1/statuses/user_timeline/%s.json', urlencode($username));
        $twitterData = Twitter::getFeedData($feedURL, $cacheKey, $cacheTime);

        $results = $twitterData;
    }


    if (!empty($results) && is_array($results)) {
        $dwoo->assignInScope(array_slice($results, 0, $count), $assign);
    } else {
        $dwoo->assignInScope(array(), $assign);
    }


    return '';
}

