{extends designs/site.tpl}
{load_templates "subtemplates/forms.tpl"}

{block "title"}Assets Importer{/block}

{block "content"}
    <form method="POST" enctype="multipart/form-data">
        
        {checkbox name="verbose" value=true label="Verbose Mode" unsetValue=false hint="Show details about import" default=true}
        {checkbox name="pretend" value=true label="Pretend Mode" unsetValue=false hint="Run in pretend mode" default=true}
        
        <label>Assets .CSV File
            <input type="file" accept=".csv" name="{Slate\Assets\Importer::$uploadFileName}" />
        </label>
        
        <input type="submit" value="Import" />
    </form>
    {if $logs}
    <div class="results well">
        <h1>Results</h1>
        {tif Slate\Assets\Importer::$verbose ? "Running in Verbose Mode.<br>"}
        {tif Slate\Assets\Importer::$pretend ? "Running in Pretend Mode.<br>"}
        <br>
        {$logs}
    </div>
    {/if}
{/block}