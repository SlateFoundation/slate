<?php



 class Twitter
 {
     public static $defaultCacheTime = 60;
     public static $failureDelay = 60;
     public static $requestTimeout = 3;

     protected static $_streamContext;

     public static function getFeedData($url, $cacheKey = false, $cacheTime = null)
     {
         if ($cacheTime === null) {
             $cacheTime = static::$defaultCacheTime;
         }

        // get context
        if (!isset(static::$_streamContext)) {
            static::$_streamContext = stream_context_create(array(
                'http' => array(
                    'timeout' => static::$requestTimeout
                )
            ));
        }

         $failureKey = 'fail:'.$cacheKey;
         if (!($twitterData = Cache::fetch($cacheKey)) && !Cache::fetch($failureKey)) {
             $twitterData = @json_decode(@file_get_contents($url, false, static::$_streamContext), true);

             if (empty($twitterData)) {
                 Cache::store($failureKey, true, static::$failureDelay);
             }

             Cache::store($cacheKey, $twitterData, $cacheTime);
         }

         return $twitterData ? $twitterData : false;
     }
 }