{extends designs/site.tpl}

{block title}Upload Media &mdash; {$dwoo.parent}{/block}

{block content}
	<form method="POST" enctype="multipart/form-data">
		<label>Select media file to upload <input type="file" name="mediaFile"></label>
		<input type="submit" value="Upload">
	</form>
{/block}