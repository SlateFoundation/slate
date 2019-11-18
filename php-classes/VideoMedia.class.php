<?php

class VideoMedia extends Media
{
    // configurables
    public static $ExtractFrameCommand = 'avconv -ss %2$u -i %1$s -an -vframes 1 -f mjpeg -'; // 1=video path, 2=position
    public static $ExtractFramePosition = 3;
    public static $encodingProfiles = array(
        // from https://www.virag.si/2012/01/web-video-encoding-tutorial-with-ffmpeg-0-9/
        'h264-high-480p' => array(
            'enabled' => true,
            'extension' => 'mp4',
            'mimeType' => 'video/mp4',
            'inputOptions' => array(),
            'videoCodec' => 'h264',
            'videoOptions' => array(
                'profile:v' => 'high',
                'preset' => 'slow',
                'b:v' => '500k',
                'maxrate' => '500k',
                'bufsize' => '1000k',
                'vf' => 'scale="trunc(oh*a/2)*2:480"' // http://superuser.com/questions/571141/ffmpeg-avconv-force-scaled-output-to-be-divisible-by-2
            ),
            'audioCodec' => 'aac',
            'audioOptions' => array(
                'strict' => 'experimental'
            )
        ),

        // from http://superuser.com/questions/556463/converting-video-to-webm-with-ffmpeg-avconv
        'webm-480p' => array(
            'enabled' => true,
            'extension' => 'webm',
            'mimeType' => 'video/webm',
            'inputOptions' => array(),
            'videoCodec' => 'libvpx',
            'videoOptions' => array(
                'vf' => 'scale=-1:480'
            ),
            'audioCodec' => 'libvorbis'
        )
    );


    // magic methods
    public static function __classLoaded()
    {
        $className = get_called_class();

        Media::$mimeHandlers['video/x-flv'] = $className;
        Media::$mimeHandlers['video/mp4'] = $className;
        Media::$mimeHandlers['video/quicktime'] = $className;

        parent::__classLoaded();
    }


    public function getValue($name)
    {
        switch ($name) {
            case 'ThumbnailMIMEType':
                return 'image/jpeg';

            case 'Extension':

                switch ($this->MIMEType) {
                    case 'video/x-flv':
                        return 'flv';

                    case 'video/mp4':
                        return 'mp4';

                    case 'video/quicktime':
                        return 'mov';

                    default:
                        throw new Exception('Unable to find video extension for mime-type: '.$this->MIMEType);
                }

            default:
                return parent::getValue($name);
        }
    }


    // public methods
    public function getImage(array $options = [])
    {
        foreach (['FilesystemPath', 'BlankPath'] as $pathAttribute) {
            if (!$sourcePath = $this->$pathAttribute) {
                continue;
            }

            $cmd = sprintf(self::$ExtractFrameCommand, $sourcePath, min(self::$ExtractFramePosition, floor($this->Duration)));

            if ($imageData = shell_exec($cmd)) {
                return imagecreatefromstring($imageData);
            }
        }

        return null;
    }

    // static methods
    public static function analyzeFile($filename, $mediaInfo = array())
    {
        // examine media with avprobe
        $output = shell_exec("avprobe -of json -show_streams -v quiet $filename");

        if (!$output || !($output = json_decode($output, true)) || empty($output['streams'])) {
            throw new MediaTypeException('Unable to examine video with avprobe, ensure lib-avtools is installed on the host system');
        }

        // extract video streams
        $videoStreams = array_filter($output['streams'], function($streamInfo) {
            return $streamInfo['codec_type'] == 'video';
        });

        if (!count($videoStreams)) {
            throw new MediaTypeException('avprobe did not detect any video streams');
        }

        // convert and write interesting information to mediaInfo
        $mediaInfo['streams'] = $output['streams'];
        $mediaInfo['videoStream'] = array_shift($videoStreams);

        $mediaInfo['width'] = (int)$mediaInfo['videoStream']['width'];
        $mediaInfo['height'] = (int)$mediaInfo['videoStream']['height'];
        $mediaInfo['duration'] = (double)$mediaInfo['videoStream']['duration'];

        return $mediaInfo;
    }

    public function writeFile($sourceFile)
    {
        parent::writeFile($sourceFile);


        // determine rotation metadata with exiftool
        $exifToolOutput = exec("exiftool -S -Rotation $this->FilesystemPath");

        if (!$exifToolOutput || !preg_match('/Rotation\s*:\s*(?<rotation>\d+)/', $exifToolOutput, $matches)) {
            throw new MediaTypeException('Unable to examine video with exiftool, ensure libimage-exiftool-perl is installed on the host system');
        }

        $sourceRotation = intval($matches['rotation']);


        // fork encoding job with each configured profile
        foreach (static::$encodingProfiles AS $profileName => $profile) {
            if (empty($profile['enabled'])) {
                continue;
            }


            // build paths and create directories if needed
            $outputPath = $this->getFilesystemPath($profileName);
            if (!is_dir($outputDir = dirname($outputPath))) {
                mkdir($outputDir, static::$newDirectoryPermissions, true);
            }

            $tmpOutputPath = $outputDir.'/'.'tmp-'.basename($outputPath);
            ;


            // build avconv command
            $cmd = array('avconv', '-loglevel quiet');

            // -- input options
            if (!empty($profile['inputOptions'])) {
                static::_appendAvconvOptions($cmd, $profile['inputOptions']);
            }
            $cmd[] = '-i';
            $cmd[] = $this->FilesystemPath;

            // -- video output options
            $cmd[] = '-codec:v';
            $cmd[] = $profile['videoCodec'];
            if (!empty($profile['videoOptions'])) {
                static::_appendAvconvOptions($cmd, $profile['videoOptions']);
            }

            // -- audio output options
            $cmd[] = '-codec:a';
            $cmd[] = $profile['audioCodec'];
            if (!empty($profile['audioOptions'])) {
                static::_appendAvconvOptions($cmd, $profile['audioOptions']);
            }

            // -- normalize smartphone rotation
            $cmd[] = '-metadata:s:v rotate="0"';

            if ($sourceRotation == 90) {
                $cmd[] = '-vf "transpose=1"';
            } elseif ($sourceRotation == 180) {
                $cmd[] = '-vf "transpose=1,transpose=1"';
            } elseif ($sourceRotation == 270) {
                $cmd[] = '-vf "transpose=1,transpose=1,transpose=1"';
            }

            // -- general output options
            if (!empty($profile['outputOptions'])) {
                static::_appendAvconvOptions($cmd, $profile['outputOptions']);
            }
            $cmd[] = $tmpOutputPath;


            // move to final path after it finished
            $cmd[] = "&& mv $tmpOutputPath $outputPath";


            // convert command to string and decorate for process control
            $cmd = '(nohup '.implode(' ', $cmd).') > /dev/null 2>/dev/null & echo $! &';


            // execute command and retrieve the spawned PID
            $pid = exec($cmd);
            // TODO: store PID somewhere in APCU cache so we can do something smarter when a video is requested before it's done encoding
        }
    }

    protected static function _appendAvconvOptions(array &$cmd, array $options)
    {
        foreach ($options AS $key => $value) {
            if (!is_int($key)) {
                $cmd[] = '-'.$key;
            }

            if ($value) {
                $cmd[] = $value;
            }
        }
    }

    public function getFilesystemPath($variant = 'original', $filename = null)
    {
        if (!$filename && array_key_exists($variant, static::$encodingProfiles)) {
            $filename = $this->ID.'.'.static::$encodingProfiles[$variant]['extension'];
            $variant = 'video-'.$variant;
        }

        return parent::getFilesystemPath($variant, $filename);
    }

    public function getMIMEType($variant = 'original')
    {
        if (array_key_exists($variant, static::$encodingProfiles)) {
            return static::$encodingProfiles[$variant]['mimeType'];
        }

        return parent::getMIMEType($variant, $filename);
    }

    public function isVariantAvailable($variant)
    {
        if (
            array_key_exists($variant, static::$encodingProfiles) &&
            !empty(static::$encodingProfiles[$variant]['enabled']) &&
            is_readable($this->getFilesystemPath($variant))
        ) {
            return true;
        }

        return parent::isVariantAvailable($variant);
    }
}