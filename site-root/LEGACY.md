# Changes from legacy Slate
- Phone, Email fields removed from person model
- CMS, Events, Contact Points, and Relationships classes refactored into namespaces
- CourseTerm -> Term 
- Switch to PHP's new password hashing methods
- Simpler string serialization for contact point data
- Section URLs use Code now instead of Handle; Handle is deprecated