{extends "designs/site.tpl"}

{block "title"}Edit Profile &mdash; {$dwoo.parent}{/block}

{block "content"}
    {$User = $data}

    <header class="page-header">
        <h1 class="header-title title-1">Manage {tif $User->ID == $.User->ID ? 'Your' : $User->FullNamePossessive} Profile</h1>
    </header>

    {if $.get.status == 'photoUploaded'}
        <p class="notify success">Photo uploaded.</p>
    {elseif $.get.status == 'photoPrimaried'}
        <p class="notify success">Default photo selected.</p>
    {elseif $.get.status == 'photoDeleted'}
        <p class="notify">Photo deleted.</p>
    {elseif $.get.status == 'passwordChanged'}
        <p class="notify success">Password changed.</p>
    {elseif $.get.status == 'saved'}
        <p class="notify success">Profile saved.</p>
    {/if}

    <div class="sidebar-layout sidebar-28">

        <div class="main-col">
            <div class="col-inner">

                {include includes/profileEdit.main-top.tpl}

                <form method="POST">
                    {if ProfileRequestHandler::$accountLevelEditOthers && $.User->hasAccountLevel(ProfileRequestHandler::$accountLevelEditOthers)}

                        <fieldset class="left-labels">
                            <h2 class="legend title-3">Account Settings ({ProfileRequestHandler::$accountLevelEditOthers} Only)</h2>

                            {field inputName="Username" label="Username" default=$User->Username}

                            {capture assign=accountLevelHtml}
                                <select name="AccountLevel" class="field-control">
                                    {foreach item=level from=Emergence\People\User::getFieldOptions(AccountLevel, values)}
                                        <option {refill field=AccountLevel default=$User->AccountLevel selected=$level}>{$level}</option>
                                    {/foreach}
                                </select>
                            {/capture}
                            {labeledField html=$accountLevelHtml type=select label='Account Level'}

                            {capture assign=classHtml}
                                <select name="Class" class="field-control">
                                    {foreach item=class from=Emergence\People\User::getFieldOptions(Class, values)}
                                        <option {refill field=Class default=$User->Class selected=$class}>{$class}</option>
                                    {/foreach}
                                </select>
                            {/capture}
                            {labeledField html=$classHtml type=select label='Person subclass'}

                            <div class="submit-area">
                                <input type="submit" class="submit" value="Save Profile">
                            </div>
                        </fieldset>
                    {/if}

                    <fieldset class="stretch">
                        <h2 class="legend title-3">Profile Details</h2>

                        {field inputName="Location" label="Location" default=$User->Location}
                        {textarea inputName="About" label="About Me" default=$User->About hint="Use <a href='http://daringfireball.net/projects/markdown'>Markdown</a> to give your text some style"}

                        <div class="submit-area">
                            <input type="submit" class="submit" value="Save Profile">
                        </div>
                    </fieldset>

                    <fieldset class="stretch">
                        <h2 class="legend title-3">Contact Information</h2>

                        {field inputName="Email" label="Email" type="email" default=$User->Email}
                        {field inputName="Phone" label="Phone" type="tel"   default=$User->Phone}

                        <div class="submit-area">
                            <input type="submit" class="submit" value="Save Profile">
                        </div>
                    </fieldset>
                </form>

                <form action="/profile/password?{refill_query}" method="POST">
                    <fieldset class="stretch">
                        <h2 class="legend title-3">Change Password</h2>
                        {field inputName="OldPassword" label="Old Password" type="password"}
                        {field inputName="Password" label="New Password" type="password"}
                        {field inputName="PasswordConfirm" label="New Password (Confirm)" type="password"}

                        <div class="submit-area">
                            <input type="submit" class="submit" value="Change Password">
                        </div>
                    </fieldset>
                </form>

            </div>
        </div>

        <div class="sidebar-col">
            <div class="col-inner">

                {include includes/profileEdit.side-top.tpl}

                <form class="profile-photo-form" action="/profile/uploadPhoto?{refill_query}" method="POST" enctype="multipart/form-data">
                    <fieldset class="stretch">
                        <h2 class="title-3">Profile Photo</h2>

                        <div class="current-photo">
                            {avatar $User size=200}
                            {if $User->PrimaryPhoto}
                                <a class="button small block destructive" href="/profile/deletePhoto?{refill_query MediaID=$User->PrimaryPhotoID}">Remove This Photo</a>
                            {elseif $User->Email}
                                <div class="muted">Using <a href="//gravatar.com">Gravatar</a> image for {$User->Email}.</div>
                            {/if}
                        </div>

                        {if $User->Photos}
                            <ul class="available-photos">
                                <p class="hint">Choose a default:</p>
                            {foreach item=Photo from=$User->Photos}
                                <li class="photo-item {if $Photo->ID == $User->PrimaryPhotoID}current{/if}">
                                    {if $Photo->ID != $.Session->Person->PrimaryPhotoID}<a href="/profile/primaryPhoto?{refill_query MediaID=$Photo->ID}" title="Make Default">{/if}
                                        <img src="{$Photo->getThumbnailRequest(96, 96, null, true)}" width=48 height=48 alt="">
                                    {if $Photo->ID != $.Session->Person->PrimaryPhotoID}</a>{/if}

                                    {* <div class="buttons">
                                        <span> alt="Make Default" title="Make Default"><img src="{versioned_url img/icons/fugue/user-silhouette.png}" alt="Make Default" /></a>
                                        {else}
                                            <img src="{versioned_url img/icons/fugue/user-silhouette.png}" alt="Default Photo" class="nofade" />Default
                                        {/if}</span>
                                        <a href="/profile/deletePhoto?{refill_query MediaID=$Photo->ID}" alt="Delete Photo" title="Delete Photo" onclick="return confirm('Are you sure you want to delete this photo from your profile?');"><img src="{versioned_url img/icons/fugue/slash.png}" alt="Delete Photo" /></a>
                                    </div> *}
                                </li>
                            {/foreach}
                            </ul>
                        {/if}

                        <div class="photo-upload field">
                            <input class="field-control" type="file" name="photoFile" id="photoFile">
                            <input class="field-control submit" type="submit" value="Upload New Photo">
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>

    </div>
{/block}