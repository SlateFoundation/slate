<?php

// Attached to the registry class itself (not Slate.config.d) so it runs
// before any MappingActionDeriverRegistry::get() -- class-keyed config.d
// loads with the class, while Slate.config.d only runs when the unrelated
// `Slate` class happens to autoload first, which the merge request path
// never does (the deriver special-case in Merge::getIdentityConflicts saw
// an empty registry and 409ed deriver-owned canvas pairs as conflicts).
// MergeSupport::register() wires both registries; double-invocation via
// the sibling ActionExecutorRegistry config is a harmless overwrite.
Slate\Connectors\Canvas\MergeSupport::register();
