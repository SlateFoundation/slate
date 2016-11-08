{capture assign=subject}Invitation to login at {Site::getConfig(primary_hostname)}{/capture}
{$from = $Sender->EmailRecipient}
<html>
	<body>
		{if $message}
			{$message|markdown}
		{/if}
        <p><a href="http://{Site::getConfig(primary_hostname)}/invitations/accept/{$Invitation->Handle|default:preview}" target="_blank">Click here to activate your account and choose your password</a></p>
	</body>
</html>