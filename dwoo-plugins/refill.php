<?php

function Dwoo_Plugin_refill(Dwoo_Core $dwoo, $field = null, $assign = null, $modifier = null, $default = null, $selected = NULL, $checked = NULL, $escape = 'html', $value = null)
{

    // determine refill value
    if ($field && isset($_REQUEST[$field])) {
        $value = $_REQUEST[$field];
    } elseif ($field && $req_value = refill_resolve_array_dot_path($field, $_REQUEST)) {
        $value = $req_value;
    } elseif (!isset($value) && isset($default)) {
        $value = $default;
    }

    // handle modifier
    if (!empty($modifier)) {
        if (function_exists($modifier)) {
            // run simple PHP function
            $value = call_user_func($modifier, $value);
        } else {
            // load Dwoo plugin
            if (function_exists('Dwoo_Plugin_'.$modifier) === false) {
                $dwoo->getLoader()->loadPlugin($modifier);
            }

            $value = call_user_func('Dwoo_Plugin_'.$modifier, $dwoo, $value);
        }
    }

    // handle selection
    if (isset($selected)) {
        if (($value == $selected) || (is_array($value) && in_array($selected, $value))) {
            return 'selected="SELECTED"';
        } else {
            return '';
        }
    }
    // handle checkiness
    elseif (isset($checked)) {
        if (($value == $checked) || (is_array($value) && in_array($checked, $value))) {
            return 'checked="CHECKED"';
        } else {
            return '';
        }
    }

    // handle assignment
    if (isset($assign)) {
        $dwoo->assignInScope($value, $assign);

        return '';
    } elseif (empty($value)) {
        return '';
    } else {
        if ($escape == 'html') {
            return htmlspecialchars($value);
        } elseif ($escape == 'url') {
            return urlencode($value);
        } else {
            return $value;
        }
    }

    /*
    if(isset($params['checked'])) {
        if(is_array($value)) {
            $return = in_array($params['checked'], $value) ? 'checked="checked"' : '';
        } else {
            $return = ($value == $params['checked']) ? 'checked="checked"' : '';
        }
    } elseif(isset($params['selected'])) {
        if(is_array($value)) {
            $return = in_array($params['selected'], $value) ? 'selected="selected"' : '';
        } else {
            $return = ($value == $params['selected']) ? 'selected="selected"' : '';
        }
    } else {
        $return = (!empty($params['encode']) && ($params['encode'] == 'url')) ? urlencode($value) : htmlspecialchars($value);
    }

    //Return value
    if(empty($params['assign'])) {
        return $return;
    } else {
        $smarty->assign($params['assign'], $return);
    }
    */
}

if (!function_exists('refill_resolve_array_dot_path')) {
    //Resolves smarty-style array paths for array form values
    function refill_resolve_array_dot_path($path, &$array)
    {
        // convert bracket notation to dot notation
        $path = preg_replace('/\[([^\]]+)\]/', '.$1', $path);

        //Break apart path
        $parts = explode('.', $path);

        $target = &$array;
        while (false !== ($part = array_shift($parts)) && is_array($target)) {
            if (array_key_exists($part, $target)) {
                $target = &$target[$part];
            } else {
                return false;
            }
        }

        return $target;
    }
}
