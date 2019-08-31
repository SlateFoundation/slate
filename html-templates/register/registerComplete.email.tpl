{$hostname = Site::getConfig('primary_hostname')}
{capture assign=subject}Welcome to {$hostname}{/capture}
<html>
    <body>
        <p>Hi {$User->FirstName},</p>
        <p>Welcome to <a href="http://{$hostname}">{$hostname}</a>! Keep this information for your record:</p>
        
        <table border="0">
            <tr><th align="right">Username:</th><td>{$User->Username}</td></tr>
            <tr><th align="right">Registered Email:</th><td><a href="mailto:{$User->Email}">{$User->Email}</a></td></tr>
            <tr><th align="right">Login URL:</th><td><a href="http://{$hostname}/login">http://{$hostname}/login</a></td></tr>
        </table>
        
        <p>Got a few minutes to spare? <a href="http://{$hostname}/profile">Upload a photo and fill out your profile</a></p>
    </body>
</html>
