<?php

class Dwoo_Plugin_unique_dom_id extends Dwoo_Block_Plugin
{
    public function init()
    {
    }

    public function process()
    {
        // get reference to template-specific ID cache
        if (!isset($this->dwoo->data['_uniqueDomIds'])) {
            $this->dwoo->data['_uniqueDomIds'] = [];
        }

        $idTable = &$this->dwoo->data['_uniqueDomIds'];

        // transform input to output unless this exact input has already been mapped to an output string
        $input = $this->buffer;

        if (!isset($idTable[$input])) {
            $output = $input;

            // convert to lowercase
            $output = strtolower($output);

            // replace / with :
            $output = str_replace('/', ':', $output);

            // strip any prefix that's not a letter
            $output = preg_replace('/^[^a-z]+/', '', $output);

            // replace any forbidden character with -
            $output = preg_replace('/[^a-z0-9_\\-:.]/', '-', $output);

            // collapse multiple -
            $output = preg_replace('/-{2,}/', '-', $output);

            // ensure uniqueness
            $baseOutput = $output;
            $i = 2;
            while (in_array($output, $idTable)) {
                $output = $baseOutput.$i++;
            }

            // cache input -> output mapping
            $idTable[$input] = $output;
        }

        return $idTable[$input];
    }
}