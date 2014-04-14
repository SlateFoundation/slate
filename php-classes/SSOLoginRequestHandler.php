<?php

class SSOLoginRequestHandler extends LoginRequestHandler
{
    static public $enableSAML2 = true;
    static public $dumpResponse = false;

    static public $nameIdFormat = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';

    static public $entityDomain;
    static public $privateKey;
    static public $certificate;


    static protected function onLoginComplete(Session $Session, $returnURL)
    {
        if (static::$enableSAML2) {
            static::handleSAML2Request($Session);
        }
    }

    static protected function onLogoutComplete(Session $Session, $returnURL) {}



    static protected function handleSAML2Request(Session $Session)
    {
        try {
            $binding = SAML2_Binding::getCurrentBinding();
        } catch (Exception $e) {
            return false;
        }

        $request = $binding->receive();

        // build response
        $response = new SAML2_Response();
        $response->setInResponseTo($request->getId());
        $response->setRelayState($request->getRelayState());
        $response->setDestination($request->getAssertionConsumerServiceURL());

        // build assertion
        $assertion = new SAML2_Assertion();
        $assertion->setIssuer(static::$entityDomain);
        $assertion->setSessionIndex(SAML2_Compat_ContainerSingleton::getInstance()->generateId());
        $assertion->setNotBefore(time() - 30);
        $assertion->setNotOnOrAfter(time() + 300);
        $assertion->setAuthnContext(SAML2_Const::AC_PASSWORD);

        // build subject confirmation
        $sc = new SAML2_XML_saml_SubjectConfirmation();
        $sc->Method = SAML2_Const::CM_BEARER;
        $sc->SubjectConfirmationData = new SAML2_XML_saml_SubjectConfirmationData();
        $sc->SubjectConfirmationData->NotOnOrAfter = $assertion->getNotOnOrAfter();
        $sc->SubjectConfirmationData->Recipient = $request->getAssertionConsumerServiceURL();
        $sc->SubjectConfirmationData->InResponseTo = $request->getId();
        $assertion->setSubjectConfirmation(array($sc));

        // set NameID
        $assertion->setNameId(array(
            'Format' => static::$nameIdFormat
            ,'Value' => $Session->Person->Username.'@'.static::$entityDomain
        ));
        $response->setAssertions(array($assertion));


        // create signature
        $privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
        $privateKey->loadKey(static::$privateKey);

        $response->setSignatureKey($privateKey);
        $response->setCertificates(array(static::$certificate));


        // send response
        $responseXML = $response->toSignedXML();
        $responseString = $responseXML->ownerDocument->saveXML($responseXML);

        if (static::$dumpResponse) {
            header('Content-Type: text/xml');
            die($responseString);
        }

        try {
            $responseBinding = new SAML2_HTTPPost();
            $responseBinding->send($response);
        } catch (Exception $e) {
            header('Location: '.static::$defaultRedirect);
            exit();
        }

        exit();
    }
}