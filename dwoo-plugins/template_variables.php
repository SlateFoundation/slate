<?php

function Dwoo_Plugin_template_variables(Dwoo_Core $dwoo, $format = 'json')
{
    if ($format == 'json') {
        return json_encode(JSON::translateObjects($dwoo->data));
    } else {
        throw new Exception('Unsupported $format for template_variables');
    }
}