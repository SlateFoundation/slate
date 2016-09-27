<?php

namespace Validators;

class PhoneNumber implements IValidator
{
    const FICTITIOUS = 'fictitious';
    const LENGTH_NOT_10 = 'length_not_10';
    const LENGTH_OUT_OF_RANGE = 'length_out_of_range';


    public static function isInvalid($phone, array $options = [])
    {
        $options = array_merge([
            'country' => null,
            'allowFictitious' => false
        ], $options);

        // flatten array
        if (is_array($phone)) {
            $phone = implode('', $phone);
        }

        //Strip all non-numeric characters
        $phone = preg_replace('/\D/', '', $phone);

        // validate based on counttry
        switch ($options['country']) {
            case 'US':
            case 'CA':
                // strip leading 1
                if ((strlen($phone) == 11) && ($phone[0] == '1')) {
                    $phone = substr($phone, 1);
                }

                if (strlen($phone) != 10) {
                    return [self::LENGTH_NOT_10 => 'US/CA phone number must be 10 digits'];
                }

                break;
            default:
                if (strlen($phone) < 8 || strlen($phone) > 15) {
                    return [self::LENGTH_OUT_OF_RANGE => 'Phone number must be between 8 and 15 digits'];
                }

                break;
        }

        // if number is 10 digits, assume it is north american and check for fictitous numbers
        if (strlen($phone) == 10) {
            $area = substr($phone, 0, 3);
            $prefix = substr($phone, 3, 3);
            $line = substr($phone, 6);

            if (!$options['allowFictitious']) {
                $fictitious = false;

                if ($area == '800') {
                    $fictitious = ($prefix == '555' && $line == '0199');
                } elseif (in_array($area, ['844','855','866','877','888'])) {
                    $fictitious = ($prefix == '555');
                } else {
                    $fictitious = ($prefix == '555' && substr($line, 0, 2) == '01');
                }

                if ($fictitious) {
                    return [self::FICTITIOUS => 'Phone number reserved for fictitious use'];
                }
            }
        }

        return false;
    }
}