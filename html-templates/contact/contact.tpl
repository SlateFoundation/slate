{extends designs/site.tpl}

{block "title"}Contact &mdash; {$dwoo.parent}{/block}

{block "js-top"}
    {$dwoo.parent}

    {if RemoteSystems\ReCaptcha::$siteKey}
        <script src='https://www.google.com/recaptcha/api.js'></script>
        <script>
            function onSubmit(token) {
                document.getElementById('contact-form').submit();
            }
        </script>
    {/if}
{/block}

{block "content"}
    <header class="page-header">
	    <h1 class="header-title title-1">Contact Us</h1>
	</header>

	<form action="/contact" method="POST" class="contact-form" id="contact-form">
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

			{if $validationErrors.ReCaptcha}
				<p class="error-text">{$validationErrors.ReCaptcha|escape}</p>
			{/if}

            <div class="submit-area">
                {if RemoteSystems\ReCaptcha::$siteKey}
                    <button class="submit g-recaptcha" type="submit" data-sitekey="{RemoteSystems\ReCaptcha::$siteKey|escape}" data-callback='onSubmit' data-action='submit'>
                {else}
                    <button class="submit" type="submit">
                {/if}
                    Send
                </button>
            </div>

		</fieldset>
	</form>

{/block}