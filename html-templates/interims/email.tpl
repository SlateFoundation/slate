<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interim Report for {$Student->FullName}, {$Term->getFuzzyTitle()}</title>
  </head>
  <body style="color: #333; font-family: Georgia, serif; font-size: 16px; line-height: 1.3;"><style type="text/css">
.interim a:visited { color: #a35500 !important; }
.interim a:hover { color: #6a3700 !important; }
.interim a:active { color: #6a3700 !important; }
></style>
	<h2>Interim Report for {$Student->FullName}, {$Term->getFuzzyTitle()}</h2>
	{foreach item=Interim from=$data}
		<div style="margin: 1em 0; background-color: #ecf5f9; border: 1px solid #789dab; padding: 1em; border-radius: .25em;">
			{$Section = $Interim->Section}
			{$Instructor = $Section->Instructors.0}
	
			<h3 style="margin: 0 0 1em; color: #004b66;">{$Section->Title}</h3>
			
			<div style="margin: 1em 0;">
				<span style="color: #5e6366; font-size: smaller; font-style: italic;">Instructor</span><br /><span style="display: block; margin-left: 1.5em;">
					<strong>{$Instructor->FullName}</strong><br /><a href="mailto:{$Instructor->Email}" style="color: #a35500;">{$Instructor->Email}</a>
				</span>
			</div>
			
			<div style="margin: 1em 0;">
				<span style="color: #5e6366; font-size: smaller; font-style: italic;">Current Grade</span><br /><span style="display: block; margin-left: 1.5em;"><strong>{$Interim->Grade}</strong></span>
			</div>
			
			<span style="color: #5e6366; font-size: smaller; font-style: italic;">Comments</span><br /><div style="display: block; margin: 0 1.5em;">{$Interim->Comments}</div>
		</div>
	{/foreach}	
</body>
</html>