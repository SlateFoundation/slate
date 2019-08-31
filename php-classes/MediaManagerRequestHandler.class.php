<?php



 class MediaManagerRequestHandler extends RequestHandler
 {
     public static function handleRequest()
     {
         if (static::peekPath() == 'json') {
             static::$responseMode = static::shiftPath();
         }

         switch ($requestHandle = static::shiftPath()) {
            default:
            {
                return static::handleCollectionsRequest();
            }
        }
     }


     public static function handleCollectionsRequest()
     {
         $tags = DB::allRecords(
            'SELECT Tag.*, (SELECT COUNT(*) FROM `%2$s` AS TagItem WHERE Tag.`%3$s` = TagItem.`%4$s` AND TagItem.`%6$s` = "Media") AS itemsCount FROM `%1$s` AS Tag ORDER BY itemsCount'
            ,array(
                Tag::$tableName
                ,TagItem::$tableName
                ,Tag::getColumnName('ID')
                ,TagItem::getColumnName('TagID')
                ,Tag::getColumnName('Title')
                ,TagItem::getColumnName('ContextClass')
            )
        );


         $allMediaCollection = array(
            'Title' => 'All Media'
            ,'itemsCount' => DB::oneValue('SELECT COUNT(*) FROM `%s`', Media::$tableName)
            ,'nodeType' => 'allMedia'
        );

         $tagsCollection = array(
            'Title' => 'Tagged Media'
            ,'itemsCount' => array_sum(array_map(function($tag) {return $tag['itemsCount'];}, $tags))
            ,'nodeType' => 'tags'
            ,'children'=> array_map(function($tag) {
                $tag['nodeType'] = 'tag';
                return $tag;
            }, $tags)
        );


         return static::respond('collections', array(
            $allMediaCollection
            ,$tagsCollection
        ));
     }
 }