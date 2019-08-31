<?php

namespace Emergence\SAML2;

class Container extends \SAML2\Compat\AbstractContainer
{
    /**
     * @var Psr\Log\LoggerInterface
     */
    protected $logger;

    /**
     * Create a new SimpleSAMLphp compatible container.
     */
    public function __construct()
    {
        $this->logger = new \Emergence\Logger();
    }

    /**
     * {@inheritdoc}
     */
    public function getLogger()
    {
        return $this->logger;
    }

    /**
     * {@inheritdoc}
     */
    public function generateId()
    {
        return '_'.md5(mt_rand(0, mt_getrandmax()));
    }

    /**
     * {@inheritdoc}
     */
    public function debugMessage($message, $type)
    {
        switch ($type) {
            case 'in':
                $prefix = 'Received message';
                break;
            case 'out':
                $prefix = 'Sending message';
                break;
            case 'decrypt':
                $prefix = 'Decrypted message';
                break;
            case 'encrypt':
                $prefix = 'Encrypted message';
                break;
            default:
                assert(FALSE);
        }

        $this->getLogger()->debug("$prefix: $message");
    }

    /**
     * {@inheritdoc}
     */
    public function redirect($url, $data = array())
    {
        Site::redirect($url, $data);
    }

    /**
     * {@inheritdoc}
     */
    public function postRedirect($url, $data = array())
    {
        print('<html><body onload="document.getElementsByTagName(\'input\')[0].click();">');
        printf('<form method="POST" action="%s"><input type="submit" style="display:none">', htmlspecialchars($url));

        foreach ($data AS $key => $value) {
            printf('<input type="hidden" name="%s" value="%s">', htmlspecialchars($key), htmlspecialchars($value));
        }

        print('<noscript><input type="submit" value="Continue"></noscript></form></body></html>');
    }
}