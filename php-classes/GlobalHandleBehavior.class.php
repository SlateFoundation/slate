<?php

class GlobalHandleBehavior extends HandleBehavior
{
    public static function onSave(ActiveRecord $Record, $handleInput = false, array $handleOptions = array())
    {
        // set handle
        if (!$Record->Handle) {
            $Record->GlobalHandle = GlobalHandle::createAlias($Record, $handleInput, $handleOptions);
        }
    }
}