<?php

namespace Emergence\ActiveRecord;

interface ActiveRecordInterface
{
    // Interfaces can't include member variables, so it will need to include getters instead


    // getters for static configuration
    public static function getSingularNoun();
    public static function getPluralNoun();
    public static function getNoun($count);
    public static function getCollectionRoute();
    public static function getFields();
    public static function getField($name);
    public static function hasField($name);


    // static configuration modifiers
    public static function addField($name, $config);
        

    // instance methods for managing record values
    public function getValue($name, array $options = null);
#    public function setValue($name, $value);
#
    public function getValues(array $options = []);
#    public function setValues(array $values);
#
#    public function changeClass($className = null, $setValues = null);
    
    // getData/getSummary/getDetails ( -> getValues($options) ?)


    // getters for instance key properties
#    public function getHandle();
#    public function getTitle();
#    public function getID();


    // getters for instance lifecycle state
#    public function isDirty();
#    public function isFieldDirty($fieldName);
#    public function getOriginalValue($fieldName);
#    public function getOriginalValues();
#
#    public function isPhantom();
#    public function isValid();
#    public function isNew();
#    public function isUpdated();
#    public function isDestroyed();


    // template methods for instance lifecycle
#    public function validate();
#    public function validateShallow();
#    public function getValidationErrors();
#
#    public function save();
#    public function saveShallow();
#
#    public function destroy(array $options = []); 


    // static methods for fetching instances
    public static function getById($id, array $options = []);
    public static function getByHandle($handle, array $options = []);
    public static function getByField($field, $value, array $options = []);
#    public static function getCount();
#    public static function getAll(array $options = []);
#    public static function getCountByWhere(array $conditions = []);
    public static function getAllByWhere(array $conditions = [], array $options = []);
#    public static function getCountByField($field, $value);
#    public static function getAllByField($field, $value);
    



    // TODO: do these need to be part of the public interface? or should it be opaque to the outside world how a field is implemented?
#    public function getFieldValue($fieldName);
#    public function setFieldValue($fieldName, $value);
#    public function getRelationshipValue($relationshipName);
#    public function setRelationshipValue($relationshipName, $value);
}
