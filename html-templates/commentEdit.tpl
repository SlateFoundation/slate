{extends "designs/site.tpl"}

{block "content"}
    {$Comment = $data}
    <form method="POST">
        <h3>Contact Info</h3>
        <fieldset>

            {if $Comment->validationErrors.Message}
                <p class="error">{$User->validationErrors.Message|escape}</p>
            {/if}


            <div class="field">
                <label for="Message">Message</label>
                <textarea name="Message">{refill field=Message default=$Comment->Message}</textarea>
            </div>

            <div class="submit">
                <input type="submit" class="submit" value="Save">
            </div>
        </fieldset>

    </form>
{/block}