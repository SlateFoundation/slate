{$subject = "The password recovery link you requested"}
<html>
    <body>
        <p>You recently requested to recover your password at <a href="http://{$.server.HTTP_HOST}">{$.server.HTTP_HOST}</a>. Use the following secure link to create a new password for your account. This link will expire {Token::$expirationHours} hours after it was requested.</p>
        <p><a href="http://{$.server.HTTP_HOST}/tokens/{$Token->Handle}">http://{$.server.HTTP_HOST}/tokens/{$Token->Handle}</a></p>
        <p>Your username is: <strong>{$Token->Creator->Username}</strong></p>
        <p>If you did not request to recover your password, simply ignore this email and your account will remain unchanged.</p>
    </body>
</html>