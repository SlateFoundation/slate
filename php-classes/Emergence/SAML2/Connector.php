<?php

namespace Emergence\SAML2;

use Site;

use Emergence\Connectors\AbstractConnector;
use Emergence\Connectors\IIdentityConsumer;
use Emergence\Connectors\IdentityConsumerTrait;
use Emergence\People\IPerson;

use SAML2\Request;
use SAML2\Constants AS SAML2_Constants;
use SAML2\Binding;
use SAML2\Response;
use SAML2\Assertion;
use SAML2\Compat\ContainerSingleton;
use SAML2\XML\saml\SubjectConfirmation;
use SAML2\XML\saml\SubjectConfirmationData;
use SAML2\HTTPPost;

use RobRichards\XMLSecLibs\XMLSecurityKey;

class Connector extends AbstractConnector implements IIdentityConsumer
{
    use IdentityConsumerTrait;

    public static $privateKey;
    public static $certificate;

    public static $title = 'SAML2';
    public static $connectorId = 'saml2';

    public static function __classLoaded()
    {
        // copy config from legacy class if not defined locally
        if (!self::$issuer) {
            self::$issuer = Site::getConfig('primary_hostname');
        }
    }

    public static function handleLoginRequest(IPerson $Person)
    {
        try {
            $binding = Binding::getCurrentBinding();
        } catch (\Exception $e) {
            return static::throwUnauthorizedError('Cannot obtain SAML2 binding');
        }

        if (!static::$privateKey || !static::$certificate) {
            return static::throwError('SAML2 key and/or certificate not configured');
        }

        // build response
        $response = static::getSAMLResponse($binding->receive(), $Person);

        // encode response manually if needed for debugging
        $responseXML = $response->toSignedXML();
        $responseString = $responseXML->ownerDocument->saveXML($responseXML);
        header('Content-Type: text/xml');
        die($responseString);

        // send response
        $responseBinding = new HTTPPost();
        $responseBinding->send($response);
    }

    protected static function getSAMLResponse(Request $request, IPerson $Person)
    {
        $response = new Response();
        $response->setIssuer(static::$issuer);
        $response->setInResponseTo($request->getId());
        $response->setRelayState($request->getRelayState());
        $response->setDestination($request->getAssertionConsumerServiceURL());
        $response->setAssertions([static::getSAMLAssertion($request, $Person)]);

        // create signature
        $privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, ['type' => 'private']);
        $privateKey->loadKey(static::$privateKey);

        $response->setSignatureKey($privateKey);
        $response->setCertificates([static::$certificate]);

        return $response;
    }

    protected static function getSAMLAssertion(Request $request, IPerson $Person)
    {
        $assertion = new Assertion();
        $assertion->setIssuer(static::$issuer);
        $assertion->setSessionIndex(ContainerSingleton::getInstance()->generateId());
        $assertion->setNotBefore(time() - 30);
        $assertion->setNotOnOrAfter(time() + 300);
        $assertion->setAuthnContext(SAML2_Constants::AC_PASSWORD);

        // build subject confirmation
        $sc = new SubjectConfirmation();
        $sc->Method = SAML2_Constants::CM_BEARER;
        $sc->SubjectConfirmationData = new SubjectConfirmationData();
        $sc->SubjectConfirmationData->NotOnOrAfter = $assertion->getNotOnOrAfter();
        $sc->SubjectConfirmationData->Recipient = $request->getAssertionConsumerServiceURL();
        $sc->SubjectConfirmationData->InResponseTo = $request->getId();
        $assertion->setSubjectConfirmation([$sc]);

        // set NameID and additional attributes
        $assertion->setNameId(static::getSAMLNameId($Person));
        $assertion->setAttributes(static::getSAMLAttributes($Person));

        return $assertion;
    }
}