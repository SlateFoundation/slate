{extends "task.tpl"}

{block css}
    {$dwoo.parent}
    <style>
        #precache-textinput-ct input {
            display: block;
            width: 100%;
            margin-bottom: 0.5em;
        }
    </style>
{/block}

{block content}
    <script>
    function selectAllCollections() {
        $('input[type=checkbox][name="collections[]"]').prop('checked', true);
    }
    </script>

    {if $message}
        <pre class="alert alert-info" role="alert">{$message|escape}</pre>
    {/if}

    <form method="POST" class="card">
        <div class="card-header">Select trees to precache</div>

        <div class="card-body">
            <button type="button" onclick="selectAllCollections()" class="btn btn-secondary btn-sm">Select all</button>

            {foreach item=Collection from=SiteCollection::getAllRootCollections()}
                <div class="checkbox">
                    <label>
                        <input type="checkbox" name="collections[]" value="{$Collection->Handle|escape}">
                        {$Collection->Handle|escape}
                    </label>
                </div>
            {/foreach}

            <div class="form-group" id="precache-textinput-ct">
                <input type="text" placeholder="path/to/tree" name="collections[]">
            </div>

            <button type="submit" class="btn btn-primary">Precache selected collections</button>
        </div>
    </form>
{/block}

{block js-bottom}
    {$dwoo.parent}

    <script>
    $(document).ready(function() {
        var $textInputCt = $('#precache-textinput-ct');

        _attachInputListeners($('input[type=text][name="collections[]"]'));

        function _attachInputListeners($input) {
            $input.keypress(_ensureBlankAvailable).change(_ensureBlankAvailable);
        }

        function _ensureBlankAvailable() {
            var $blankInputs = $('input[type=text][name="collections[]"]').filter(function() {
                return !this.value;
            });

            if (!$blankInputs.length) {
                _attachInputListeners($textInputCt.append('<input type="text" placeholder="path/to/tree" name="collections[]">'));
            }
        }
    });
    </script>
{/block}