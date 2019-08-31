<?php

class PDFMedia extends Media
{
    // configurables
    public static $extractPageCommand = 'convert \'%1$s[%2$u]\' JPEG:- 2>/dev/null'; // 1=pdf path, 2=page
    public static $extractPageIndex = 0;


    // magic methods
    public static function __classLoaded()
    {
        $className = get_called_class();

        Media::$mimeHandlers['application/pdf'] = $className;
        Media::$mimeHandlers['application/postscript'] = $className;
        Media::$mimeHandlers['image/svg+xml'] = $className;
        parent::__classLoaded();
    }


    public function getValue($name)
    {
        switch ($name) {
            case 'ThumbnailMIMEType':
                return 'image/png';

            case 'Extension':

                switch ($this->MIMEType) {
                    case 'application/pdf':
                        return 'pdf';
                    case 'application/postscript':
                        return 'eps';
                    case 'image/svg+xml':
                        return 'svg';
                    default:
                        throw new Exception('Unable to find document extension for mime-type: '.$this->MIMEType);
                }

            default:
                return parent::getValue($name);
        }
    }


    // public methods
    public function getImage($sourceFile = null)
    {
        if (!isset($sourceFile)) {
            $sourceFile = $this->FilesystemPath ? $this->FilesystemPath : $this->BlankPath;
        }

        $cmd = sprintf(static::$extractPageCommand, $sourceFile, static::$extractPageIndex);
        $fileImage = imagecreatefromstring(shell_exec($cmd));

        return $fileImage;
    }

    // static methods
    public static function analyzeFile($filename, $mediaInfo = array())
    {
        $cmd = sprintf(static::$extractPageCommand, $filename, static::$extractPageIndex);
        $pageIm = @imagecreatefromstring(shell_exec($cmd));

        if (!$pageIm) {
            throw new MediaTypeException('Unable to convert PDF, ensure that imagemagick is installed on the server');
        }

        $mediaInfo['width'] = imagesx($pageIm);
        $mediaInfo['height'] = imagesy($pageIm);

        return $mediaInfo;
    }
}