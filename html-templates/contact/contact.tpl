{extends designs/site.tpl}

{block "title"}Contact &mdash; {$dwoo.parent}{/block}

{block "js-top"}
    {$dwoo.parent}

    {if RemoteSystems\ReCaptcha::$siteKey}
        <script src='https://www.google.com/recaptcha/api.js'></script>
    {/if}
{/block}

{block "content"}
    <header class="page-header">
	    <h1 class="header-title title-1">Contact Us</h1>
	</header>

	<form action="/contact" method="POST" class="contact-form">
		{if $validationErrors}
			<div class="notify error">
				<strong>Please double-check the fields highlighted below.</strong>
			</div>
		{/if}

		<fieldset class="shrink show-required left-labels">

			{* field inputName label='' error='' type=text placeholder='' hint='' required=false attribs='' *}

            {field inputName=Name  label=Name  error=$validationErrors.Name  required=true attribs='autofocus autocapitalize="words"'}
            {field inputName=Email label=Email error=$validationErrors.Email type=email required=true}
            {field inputName=Phone label=Phone error=$validationErrors.Phone type=tel hint='Optional. Include your area code.'}

            {textarea inputName=Message label=Message error=$validationErrors.Message required=true}

			{if RemoteSystems\ReCaptcha::$siteKey}
				<div class="field {tif $validationErrors.ReCaptcha ? 'has-error'}">
					<span class="field-label"></span>
					<div class="field-control g-recaptcha" data-sitekey="{RemoteSystems\ReCaptcha::$siteKey|escape}"></div>
				</div>
				{if $validationErrors.ReCaptcha}
					<p class="error-text">{$validationErrors.ReCaptcha|escape}</p>
				{/if}
			{/if}

            <div class="submit-area">
            	<input type="submit" value="Send">
            </div>

		</fieldset>
	</form>

{/block}