<?php

// Attached to the registry class itself (not Slate.config.d) so it runs
// before any ActionExecutorRegistry::get()/has() -- class-keyed config.d
// loads with the class, while Slate.config.d only runs when the unrelated
// `Slate` class happens to autoload first, which request paths like the
// actions listing never guarantee (hasExecutor read false against an
// empty registry). MergeSupport::register() wires both registries;
// double-invocation via the sibling MappingActionDeriverRegistry config
// is a harmless overwrite.
Slate\Connectors\Canvas\MergeSupport::register();
