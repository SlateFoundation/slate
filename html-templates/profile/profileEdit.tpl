{extends "designs/site.tpl"}

{block "title"}Edit Profile &mdash; {$dwoo.parent}{/block}

{block "content"}
	{$User = $.Session->Person}

    <header class="page-header">
        <h2 class="header-title">Manage Your Profile</h2>
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

            	<form method="POST">
                	<fieldset class="stretch">
                    	<h3 class="legend">Profile Details</h3>
        
                        {field name="Location" label="Location" default=$User->Location}
                        {textarea name="About" label="About Me" default=$User->About}
        
                		<div class="submit-area">
                			<input type="submit" class="submit" value="Save Profile">
                		</div>
                	</fieldset>
            	</form>
            
            	<form action="/profile/password" method="POST">
                	<fieldset class="stretch">
                    	<h3 class="legend">Change Password</h3>
                	    {field name="OldPassword" label="Old Password" type="password"}
                	    {field name="Password" label="New Password" type="password"}
                	    {field name="PasswordConfirm" label="New Password (Confirm)" type="password"}
        
                		<div class="submit-area">
                			<input type="submit" class="submit" value="Change Password">
                		</div>        
                	</fieldset>
            	</form>

            </div>
        </div>
    
        <div class="sidebar-col">
            <div class="col-inner">
            	<form class="profile-photo-form" action="/profile/uploadPhoto" method="POST" enctype="multipart/form-data">
            	    <fieldset class="stretch">
            	        <h3>Profile Photo</h3>
        
            	        <div class="current-photo">
                            {avatar $User size=200}
                            {if $User->PrimaryPhoto}
                                <a class="button small block destructive" href="/profile/deletePhoto?MediaID={$.User->PrimaryPhotoID}">Remove This Photo</a>
                            {else}
                                <div class="muted">Using <a href="//gravatar.com">Gravatar</a> image for {$User->Email}.</div>
                            {/if}
            	        </div>
        
                        {if $User->Photos}
                            <ul class="available-photos">
                                <p class="hint">Choose a default:</p>
            				{foreach item=Photo from=$User->Photos}
            					<li class="photo-item {if $Photo->ID == $User->PrimaryPhotoID}current{/if}">
            						{if $Photo->ID != $.Session->Person->PrimaryPhotoID}<a href="/profile/primaryPhoto?MediaID={$Photo->ID}" title="Make Default">{/if}
                                        <img src="{$Photo->getThumbnailRequest(96, 96, null, true)}" width=48 height=48 alt="">
            						{if $Photo->ID != $.Session->Person->PrimaryPhotoID}</a>{/if}
        
            						{* <div class="buttons">
            							<span> alt="Make Default" title="Make Default"><img src="/img/icons/fugue/user-silhouette.png" alt="Make Default" /></a>
            							{else}
            								<img src="/img/icons/fugue/user-silhouette.png" alt="Default Photo" class="nofade" />Default
            							{/if}</span>
            							<a href="/profile/deletePhoto?MediaID={$Photo->ID}" alt="Delete Photo" title="Delete Photo" onclick="return confirm('Are you sure you want to delete this photo from your profile?');"><img src="/img/icons/fugue/slash.png" alt="Delete Photo" /></a>
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