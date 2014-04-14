<?php

namespace XmlSecurity;

class Encoder
{
    const template = "<xenc:EncryptedData xmlns:xenc='http://www.w3.org/2001/04/xmlenc#'>
   <xenc:CipherData>
      <xenc:CipherValue></xenc:CipherValue>
   </xenc:CipherData>
</xenc:EncryptedData>";

    const Element = 'http://www.w3.org/2001/04/xmlenc#Element';
    const Content = 'http://www.w3.org/2001/04/xmlenc#Content';
    const URI = 3;
    const XMLENCNS = 'http://www.w3.org/2001/04/xmlenc#';

    private $encdoc = null;
    private $rawNode = null;
    public $type = null;
    public $encKey = null;
    private $references = array();

    public function __construct()
    {
        $this->_resetTemplate();
    }

    private function _resetTemplate()
    {
        $this->encdoc = new \DOMDocument();
        $this->encdoc->loadXML(Encoder::template);
    }

    public function addReference($name, $node, $type)
    {
        if (!$node instanceOf DOMNode) {
            throw new \Exception('$node is not of type DOMNode');
        }

        $curencdoc = $this->encdoc;
        $this->_resetTemplate();
        $encdoc = $this->encdoc;
        $this->encdoc = $curencdoc;
        $refuri = Signature::generate_GUID();
        $element = $encdoc->documentElement;
        $element->setAttribute("Id", $refuri);
        $this->references[$name] = array("node" => $node, "type" => $type, "encnode" => $encdoc, "refuri" => $refuri);
    }

    public function setNode($node)
    {
        $this->rawNode = $node;
    }

    /**
     * Encrypt the selected node with the given key.
     *
     * @param Key $objKey  The encryption key and algorithm.
     * @param bool $replace  Whether the encrypted node should be replaced in the original tree. Default is TRUE.
     * @return DOMElement  The <xenc:EncryptedData>-element.
     */
    public function encryptNode($objKey, $replace = true)
    {
        $data = '';

        if (empty($this->rawNode)) {
            throw new \Exception('Node to encrypt has not been set');
        }

        if (!$objKey instanceof Key) {
            throw new \Exception('Invalid Key');
        }

        $doc = $this->rawNode->ownerDocument;
        $xPath = new \DOMXPath($this->encdoc);
        $objList = $xPath->query('/xenc:EncryptedData/xenc:CipherData/xenc:CipherValue');
        $cipherValue = $objList->item(0);
        if ($cipherValue == null) {
            throw new \Exception('Error locating CipherValue element within template');
        }

        switch ($this->type) {
            case (Encoder::Element):
                $data = $doc->saveXML($this->rawNode);
                $this->encdoc->documentElement->setAttribute('Type', Encoder::Element);
                break;
            case (Encoder::Content):
                $children = $this->rawNode->childNodes;
                foreach ($children AS $child) {
                    $data .= $doc->saveXML($child);
                }
                $this->encdoc->documentElement->setAttribute('Type', Encoder::Content);
                break;
            default:
                throw new \Exception('Type is currently not supported');
                return;
        }

        $encMethod = $this->encdoc->documentElement->appendChild(
            $this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:EncryptionMethod')
        );
        $encMethod->setAttribute('Algorithm', $objKey->getAlgorith());
        $cipherValue->parentNode->parentNode->insertBefore(
            $encMethod,
            $cipherValue->parentNode->parentNode->firstChild
        );

        $strEncrypt = base64_encode($objKey->encryptData($data));
        $value = $this->encdoc->createTextNode($strEncrypt);
        $cipherValue->appendChild($value);

        if ($replace) {
            switch ($this->type) {
                case (Encoder::Element):
                    if ($this->rawNode->nodeType == XML_DOCUMENT_NODE) {
                        return $this->encdoc;
                    }
                    $importEnc = $this->rawNode->ownerDocument->importNode($this->encdoc->documentElement, true);
                    $this->rawNode->parentNode->replaceChild($importEnc, $this->rawNode);
                    return $importEnc;
                    break;
                case (Encoder::Content):
                    $importEnc = $this->rawNode->ownerDocument->importNode($this->encdoc->documentElement, true);
                    while ($this->rawNode->firstChild) {
                        $this->rawNode->removeChild($this->rawNode->firstChild);
                    }
                    $this->rawNode->appendChild($importEnc);
                    return $importEnc;
                    break;
            }
        } else {
            return $this->encdoc->documentElement;
        }
    }

    public function encryptReferences($objKey)
    {
        $curRawNode = $this->rawNode;
        $curType = $this->type;

        foreach ($this->references AS $name => $reference) {
            $this->encdoc = $reference["encnode"];
            $this->rawNode = $reference["node"];
            $this->type = $reference["type"];
            try {
                $encNode = $this->encryptNode($objKey);
                $this->references[$name]["encnode"] = $encNode;
            } catch (\Exception $e) {
                $this->rawNode = $curRawNode;
                $this->type = $curType;
                throw $e;
            }
        }

        $this->rawNode = $curRawNode;
        $this->type = $curType;
    }

    /**
     * Retrieve the CipherValue text from this encrypted node.
     *
     * @return string|NULL  The Ciphervalue text, or NULL if no CipherValue is found.
     */
    public function getCipherValue()
    {
        if (empty($this->rawNode)) {
            throw new \Exception('Node to decrypt has not been set');
        }

        $doc = $this->rawNode->ownerDocument;
        $xPath = new \DOMXPath($doc);
        $xPath->registerNamespace('xmlencr', Encoder::XMLENCNS);
        /* Only handles embedded content right now and not a reference */
        $query = "./xmlencr:CipherData/xmlencr:CipherValue";
        $nodeset = $xPath->query($query, $this->rawNode);
        $node = $nodeset->item(0);

        if (!$node) {
            return null;
        }

        return base64_decode($node->nodeValue);
    }

    /**
     * Decrypt this encrypted node.
     *
     * The behaviour of this function depends on the value of $replace.
     * If $replace is FALSE, we will return the decrypted data as a string.
     * If $replace is TRUE, we will insert the decrypted element(s) into the
     * document, and return the decrypted element(s).
     *
     * @params Key $objKey  The decryption key that should be used when decrypting the node.
     * @params boolean $replace  Whether we should replace the encrypted node in the XML document with the decrypted data. The default is TRUE.
     * @return string|DOMElement  The decrypted data.
     */
    public function decryptNode($objKey, $replace = true)
    {
        if (!$objKey instanceof Key) {
            throw new \Exception('Invalid Key');
        }

        $encryptedData = $this->getCipherValue();
        if ($encryptedData) {
            $decrypted = $objKey->decryptData($encryptedData);
            if ($replace) {
                switch ($this->type) {
                    case (Encoder::Element):
                        $newdoc = new \DOMDocument();
                        $newdoc->loadXML($decrypted);
                        if ($this->rawNode->nodeType == XML_DOCUMENT_NODE) {
                            return $newdoc;
                        }
                        $importEnc = $this->rawNode->ownerDocument->importNode($newdoc->documentElement, true);
                        $this->rawNode->parentNode->replaceChild($importEnc, $this->rawNode);
                        return $importEnc;
                        break;
                    case (Encoder::Content):
                        if ($this->rawNode->nodeType == XML_DOCUMENT_NODE) {
                            $doc = $this->rawNode;
                        } else {
                            $doc = $this->rawNode->ownerDocument;
                        }
                        $newFrag = $doc->createDocumentFragment();
                        $newFrag->appendXML($decrypted);
                        $parent = $this->rawNode->parentNode;
                        $parent->replaceChild($newFrag, $this->rawNode);
                        return $parent;
                        break;
                    default:
                        return $decrypted;
                }
            } else {
                return $decrypted;
            }
        } else {
            throw new \Exception("Cannot locate encrypted data");
        }
    }

    public function encryptKey($srcKey, $rawKey, $append = true)
    {
        if ((!$srcKey instanceof Key) || (!$rawKey instanceof Key)) {
            throw new \Exception('Invalid Key');
        }

        $strEncKey = base64_encode($srcKey->encryptData($rawKey->key));
        $root = $this->encdoc->documentElement;
        $encKey = $this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:EncryptedKey');

        if ($append) {
            $keyInfo = $root->insertBefore(
                $this->encdoc->createElementNS('http://www.w3.org/2000/09/xmldsig#', 'dsig:KeyInfo'),
                $root->firstChild
            );
            $keyInfo->appendChild($encKey);
        } else {
            $this->encKey = $encKey;
        }

        $encMethod = $encKey->appendChild($this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:EncryptionMethod'));
        $encMethod->setAttribute('Algorithm', $srcKey->getAlgorith());

        if (!empty($srcKey->name)) {
            $keyInfo = $encKey->appendChild(
                $this->encdoc->createElementNS('http://www.w3.org/2000/09/xmldsig#', 'dsig:KeyInfo')
            );
            $keyInfo->appendChild(
                $this->encdoc->createElementNS('http://www.w3.org/2000/09/xmldsig#', 'dsig:KeyName', $srcKey->name)
            );
        }

        $cipherData = $encKey->appendChild($this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:CipherData'));
        $cipherData->appendChild($this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:CipherValue', $strEncKey));

        if (is_array($this->references) && count($this->references) > 0) {
            $refList = $encKey->appendChild($this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:ReferenceList'));
            foreach ($this->references AS $name => $reference) {
                $refuri = $reference["refuri"];
                $dataRef = $refList->appendChild(
                    $this->encdoc->createElementNS(Encoder::XMLENCNS, 'xenc:DataReference')
                );
                $dataRef->setAttribute("URI", '#' . $refuri);
            }
        }
    }

    public function decryptKey($encKey)
    {
        if (!$encKey->isEncrypted) {
            throw new \Exception("Key is not Encrypted");
        }

        if (empty($encKey->key)) {
            throw new \Exception("Key is missing data to perform the decryption");
        }

        return $this->decryptNode($encKey, false);
    }

    public function locateEncryptedData($element)
    {
        if ($element instanceof \DOMDocument) {
            $doc = $element;
        } else {
            $doc = $element->ownerDocument;
        }

        if ($doc) {
            $xpath = new \DOMXPath($doc);
            $query = "//*[local-name()='EncryptedData' and namespace-uri()='" . Encoder::XMLENCNS . "']";
            $nodeset = $xpath->query($query);
            return $nodeset->item(0);
        }

        return null;
    }

    public function locateKey($node = null)
    {
        if (empty($node)) {
            $node = $this->rawNode;
        }

        if (!$node instanceof DOMNode) {
            return null;
        }

        if ($doc = $node->ownerDocument) {
            $xpath = new \DOMXPath($doc);
            $xpath->registerNamespace('xmlsecenc', Encoder::XMLENCNS);
            $query = ".//xmlsecenc:EncryptionMethod";
            $nodeset = $xpath->query($query, $node);
            if ($encmeth = $nodeset->item(0)) {
                $attrAlgorithm = $encmeth->getAttribute("Algorithm");
                try {
                    $objKey = new Key($attrAlgorithm, array('type' => 'private'));
                } catch (\Exception $e) {
                    return null;
                }

                return $objKey;
            }
        }

        return null;
    }

    static function staticLocateKeyInfo($objBaseKey = null, $node = null)
    {
        if (empty($node) || (!$node instanceof \DOMNode)) {
            return null;
        }

        $doc = $node->ownerDocument;
        if (!$doc) {
            return null;
        }

        $xpath = new \DOMXPath($doc);
        $xpath->registerNamespace('xmlsecenc', Encoder::XMLENCNS);
        $xpath->registerNamespace('xmlsecdsig', Signature::XMLDSIGNS);
        $query = "./xmlsecdsig:KeyInfo";
        $nodeset = $xpath->query($query, $node);
        $encmeth = $nodeset->item(0);
        if (!$encmeth) {
            /* No KeyInfo in EncryptedData / EncryptedKey. */
            return $objBaseKey;
        }

        foreach ($encmeth->childNodes AS $child) {
            switch ($child->localName) {
                case 'KeyName':
                    if (!empty($objBaseKey)) {
                        $objBaseKey->name = $child->nodeValue;
                    }
                    break;
                case 'KeyValue':
                    foreach ($child->childNodes AS $keyval) {
                        switch ($keyval->localName) {
                            case 'DSAKeyValue':
                                throw new \Exception("DSAKeyValue currently not supported");
                                break;
                            case 'RSAKeyValue':
                                $modulus = null;
                                $exponent = null;
                                if ($modulusNode = $keyval->getElementsByTagName('Modulus')->item(0)) {
                                    $modulus = base64_decode($modulusNode->nodeValue);
                                }
                                if ($exponentNode = $keyval->getElementsByTagName('Exponent')->item(0)) {
                                    $exponent = base64_decode($exponentNode->nodeValue);
                                }
                                if (empty($modulus) || empty($exponent)) {
                                    throw new \Exception("Missing Modulus or Exponent");
                                }
                                $publicKey = Key::convertRSA($modulus, $exponent);
                                $objBaseKey->loadKey($publicKey);
                                break;
                        }
                    }
                    break;
                case 'RetrievalMethod':
                    $type = $child->getAttribute('Type');
                    if ($type !== 'http://www.w3.org/2001/04/xmlenc#EncryptedKey') {
                        /* Unsupported key type. */
                        break;
                    }
                    $uri = $child->getAttribute('URI');
                    if ($uri[0] !== '#') {
                        /* URI not a reference - unsupported. */
                        break;
                    }
                    $id = substr($uri, 1);

                    $query = "//xmlsecenc:EncryptedKey[@Id='$id']";
                    $keyElement = $xpath->query($query)->item(0);
                    if (!$keyElement) {
                        throw new \Exception("Unable to locate EncryptedKey with @Id='$id'.");
                    }

                    return Key::fromEncryptedKeyElement($keyElement);
                case 'EncryptedKey':
                    return Key::fromEncryptedKeyElement($child);
                case 'X509Data':
                    if ($x509certNodes = $child->getElementsByTagName('X509Certificate')) {
                        if ($x509certNodes->length > 0) {
                            $x509cert = $x509certNodes->item(0)->textContent;
                            $x509cert = str_replace(array("\r", "\n"), "", $x509cert);
                            $x509cert = "-----BEGIN CERTIFICATE-----\n" . chunk_split(
                                $x509cert,
                                64,
                                "\n"
                            ) . "-----END CERTIFICATE-----\n";
                            $objBaseKey->loadKey($x509cert, false, true);
                        }
                    }
                    break;
            }
        }

        return $objBaseKey;
    }

    public function locateKeyInfo($objBaseKey = null, $node = null)
    {
        if (empty($node)) {
            $node = $this->rawNode;
        }

        return Encoder::staticLocateKeyInfo($objBaseKey, $node);
    }
}