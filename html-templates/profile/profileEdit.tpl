{extends "designs/site.tpl"}

{block "body-class"}profile-edit{/block}

{block "css"}
    <link rel="stylesheet" type="text/css" href="/css/dog/photos.css" />
    {$dwoo.parent}
{/block}

{block "javascript"}
    {$dwoo.parent}
    <script type="text/javascript">
        Ext.onReady(function() {
            Ext.select('.status.highlight').setVisibilityMode(Ext.Element.DISPLAY).highlight().pause(2).slideOut();
        });
    </script>
{/block}

{block "content"}

    {$User = $.Session->Person}

    <h2>Manage Your Profile</h2>

    {if $.get.status == 'photoUploaded'}
        <p class="notify">Photo uploaded.</p>
    {elseif $.get.status == 'photoPrimaried'}
        <p class="notify">Default photo selected.</p>
    {elseif $.get.status == 'photoDeleted'}
        <p class="notify">Photo deleted.</p>
    {elseif $.get.status == 'passwordChanged'}
        <p class="notify">Password changed.</p>
    {elseif $.get.status == 'saved'}
        <p class="notify">Profile saved.</p>
    {elseif $User->validationErrors}
        <p class="notify error">There was a problem with the information you entered. Please see below.</p>
    {/if}

    <form id="uploadPhotoForm" action="/profile/uploadPhoto" method="POST" enctype="multipart/form-data">
        <h3>Photos</h3>
        <fieldset>
            {strip}
            <section class="photosGallery">
                {foreach item=Photo from=$User->Photos}
                    <div class="photo {if $Photo->ID == $User->PrimaryPhotoID}highlight{/if}">
                        <div class="photothumb"><img src="{$Photo->getThumbnailRequest(100,100)}"></div>
                        <div class="buttons">
                            <span>{if $Photo->ID != $.Session->Person->PrimaryPhotoID}
                                <a href="/profile/primaryPhoto?MediaID={$Photo->ID}" alt="Make Default" title="Make Default" class="icon user"><img src="/img/icons/fugue/user-silhouette.png" alt="Make Default" /></a>
                            {else}
                                <img src="/img/icons/fugue/user-silhouette.png" alt="Default Photo" class="nofade" />Default
                            {/if}</span>
                            <a href="/profile/deletePhoto?MediaID={$Photo->ID}" alt="Delete Photo" title="Delete Photo" onclick="return confirm('Are you sure you want to delete this photo from your profile?');" class="icon delete"><img src="/img/icons/fugue/slash.png" alt="Delete Photo" /></a>
                        </div>
                    </div>
                {/foreach}
            </section>
            {/strip}

            <div class="field upload">
                <input type="file" name="photoFile" id="photoFile">
            </div>
            <div class="submit">
                <input type="submit" class="submit inline" value="Upload New Photo">
            </div>
        </fieldset>
    </form>

    <form method="POST" id="profileForm" class="col1 form" action="/profile">
        <h3>Contact Info</h3>
        <fieldset>

            {if $User->validationErrors.Email}
                <p class="error">{$User->validationErrors.Email|escape}</p>
            {/if}

            {if $User->validationErrors.Phone}
                <p class="error">{$User->validationErrors.Phone|escape}</p>
            {/if}

            <div class="field">
                <label for="Email">Email</label>
                <input type="email" class="text" id="Email" name="Email" value="{refill field=Email default=$User->Email}">
            </div>

{*            <div class="field">
                <label for="Phone">Phone</label>
                <input type="tel" class="text" id="Phone" name="Phone" value="{refill field=Phone default=$User->Phone modifier=phone}">
            </div>*}

            <div class="submit">
                <input type="submit" class="submit" value="Save">
            </div>
        </fieldset>

    </form>

    <form method="POST" action="/profile">
        <h3>Profile Details</h3>
        <fieldset>

            <div class="field">
                <label for="Location">Location</label>
                <input type="text" class="text" id="Location" name="Location" value="{refill field=Location default=$User->Location}">
            </div>

            <div class="field expand">
                <label for="about">About</label>
                <textarea id="about" name="About">{refill field=About default=$User->About}</textarea>
{*                <p class="hint">Check out the <a href="#">Formatting Guide</a> to give your text some style</p>*}
            </div>

            <div class="submit">
                <input type="submit" class="submit" value="Save">
            </div>
        </fieldset>
    </form>

    <form action="/profile/password" method="POST" id="passwordForm">
        <h3>Change Password</h3>
        <fieldset>

            <div class="field">
                <label for="oldpassword">Old Password</label>
                <input type="password" class="text" id="oldpassword" name="OldPassword">
            </div>

            <div class="field">
                <label for="password">New Password</label>
                <input type="password" class="text" id="password" name="Password">
                <input type="password" class="text" id="password2" name="PasswordConfirm">
                <p class="hint">Please type your new password in both boxes above to make sure it is correct.</p>
            </div>

            <div class="submit">
                <input type="submit" class="submit" value="Change">
            </div>
        </fieldset>
    </form>

{/block}