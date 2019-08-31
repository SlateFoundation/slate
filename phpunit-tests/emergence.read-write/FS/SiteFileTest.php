<?php

namespace Emergence\TestsRW\FS;

use \Site;
use \SiteFile;
use \SiteCollection;

class SiteFileTest extends \PHPUnit_Framework_TestCase
{
    protected $rootNode;
    protected $parentRootNode;
    public function setUp()
    {
        $this->rootNode = SiteCollection::getOrCreateRootCollection('phpunit-test-data');
        $this->parentRootNode = SiteCollection::getOrCreateRootCollection('phpunit-test-data', true);
        $this->assertInstanceOf('SiteCollection', $this->rootNode, 'root node is SiteCollection');
    }

    public function testCreateEmpty()
    {
        $filename = 'testfile-'.mt_rand(100000, 999999);

        $fileData = $this->rootNode->createFile($filename, "line 1\nline 2\n");
        $this->assertInternalType('array', $fileData);
        $this->assertEquals('Normal', $fileData['Status'], 'created node status is Normal');
        $this->assertEquals(14, $fileData['Size'], 'create node size is 14');
        $this->assertEquals('text/plain', $fileData['Type'], 'create node type is text/plain');
        $this->assertEquals('5e841ee02c64eb30f882676939a7b6bccc06c326', $fileData['SHA1'], 'create node SHA1 is 5e841ee02c64eb30f882676939a7b6bccc06c326');

        $fileNode = $this->rootNode->resolvePath($filename);
        $this->assertInstanceOf('SiteFile', $fileNode, 'resolved node is SiteFile');
        $this->assertEquals($fileNode->ID, $fileData['ID'], 'resolved node ID matches created');

        return $fileNode;
    }

    /**
     * @depends testCreateEmpty
     */
    public function testRename(SiteFile $fileNode)
    {
        $originalPath = $fileNode->FullPath;
        $retrievedBeforeNode = Site::resolvePath($originalPath);
        $this->assertInstanceOf('SiteFile', $retrievedBeforeNode, 'node retrieved before rename is SiteFile');
        $this->assertEquals($fileNode->ID, $retrievedBeforeNode->ID, 'node retrieved before rename matched created node ID');

        $newFilename = 'testfile-newname-'.mt_rand(100000, 999999);
        $fileNode->setName($newFilename);
        $newPath = $fileNode->FullPath;
        $this->assertEquals($newFilename, $fileNode->Handle, 'created node has new name');
        $this->assertNotEquals($newFilename, $retrievedBeforeNode->Handle, 'node retrieved before rename does not have new name');
        $this->assertNotEquals($newPath, $originalPath, 'created node path before does not match patch after');

        $retrievedAfterNode = Site::resolvePath($newPath);
        $this->assertInstanceOf('SiteFile', $retrievedAfterNode, 'node retrieved after rename is SiteFile');
        $this->assertEquals($fileNode->ID, $retrievedAfterNode->ID, 'node retrieved after rename matched created node ID');
        $this->assertEquals($newFilename, $retrievedAfterNode->Handle, 'node retrieved after rename has new name');

        $this->assertEmpty(Site::resolvePath($originalPath), 'node no longer found at old path');
    }

    public function testCreateDeepParentFile()
    {
        $dirname1 = 'testdir-'.mt_rand(100000, 999999);
        $dirname2 = 'testdir-'.mt_rand(100000, 999999);
        $filename = 'testfile-'.mt_rand(100000, 999999);
        $newPath = "$dirname1/$dirname2/$filename";
        $now = time();

        $fileData = $this->parentRootNode->createFile($newPath, "line 1\nline 2\n");
        $this->assertInternalType('array', $fileData);
        $this->assertEquals($filename, $fileData['Handle'], 'created node handle matches');
        $this->assertEquals('Normal', $fileData['Status'], 'created node status is Normal');
        $this->assertEquals(14, $fileData['Size'], 'created node size is 14');
        $this->assertEquals('text/plain', $fileData['Type'], 'created node type is text/plain');
        $this->assertEquals('5e841ee02c64eb30f882676939a7b6bccc06c326', $fileData['SHA1'], 'created node SHA1 is 5e841ee02c64eb30f882676939a7b6bccc06c326');
        $this->assertEquals(date('Y-m-d H:i:s', $now), $fileData['Timestamp'], 'created node timestamp is correct');

        $instantiatedNode = new SiteFile($fileData['Handle'], $fileData);
        $this->assertInstanceOf('SiteFile', $instantiatedNode, 'instantiated node is SiteFile');
        $this->assertEquals($fileData['ID'], $instantiatedNode->ID, 'instantiated node ID matches created');
        $this->assertEquals($filename, $instantiatedNode->Handle, 'instantiated node handle matches created');
        $this->assertEquals('Normal',$instantiatedNode->Status, 'instantiated node status is Normal');
        $this->assertEquals(14, $instantiatedNode->Size, 'instantiated node size is 14');
        $this->assertEquals('text/plain', $instantiatedNode->Type, 'instantiated node type is text/plain');
        $this->assertEquals('5e841ee02c64eb30f882676939a7b6bccc06c326', $instantiatedNode->SHA1, 'instantiated node SHA1 is 5e841ee02c64eb30f882676939a7b6bccc06c326');
        $this->assertEquals($now, $instantiatedNode->Timestamp, 'instantiated node timestamp is correct');

        $retrievedNode = $this->parentRootNode->resolvePath($newPath);
        $this->assertInstanceOf('SiteFile', $retrievedNode, 'resolved node is SiteFile');
        $this->assertEquals($fileData['ID'], $retrievedNode->ID, 'resolved node ID matches created');
        $this->assertEquals($filename, $retrievedNode->Handle, 'resolved node handle matches created');
        $this->assertEquals('Normal',$retrievedNode->Status, 'resolved node status is Normal');
        $this->assertEquals(14, $retrievedNode->Size, 'resolved node size is 14');
        $this->assertEquals('text/plain', $retrievedNode->Type, 'resolved node type is text/plain');
        $this->assertEquals('5e841ee02c64eb30f882676939a7b6bccc06c326', $retrievedNode->SHA1, 'resolved node SHA1 is 5e841ee02c64eb30f882676939a7b6bccc06c326');
        $this->assertEquals($now, $retrievedNode->Timestamp, 'resolved node timestamp is correct');

        $this->assertInstanceOf('SiteCollection', $retrievedNode->Collection, 'resolved node collection is SiteCollection');
        $this->assertEquals($dirname2, $retrievedNode->Collection->Handle, 'resolved node collection matches handle');
        $this->assertEquals('Remote', $retrievedNode->Collection->Site, 'resolved node collection site is Remote');

        $this->assertInstanceOf('SiteCollection', $retrievedNode->Collection->Parent, 'resolved node grand-collection is SiteCollection');
        $this->assertEquals($dirname1, $retrievedNode->Collection->Parent->Handle, 'resolved node grand-collection matches handle');
        $this->assertEquals('Remote', $retrievedNode->Collection->Parent->Site, 'resolved node grand-collection site is Remote');

        return $retrievedNode;
    }

    /**
     * @depends testCreateDeepParentFile
     */
    public function testLocalizeDeepParentFile(SiteFile $fileNode)
    {
        $remoteCollection = $fileNode->Collection;
        $this->assertInstanceOf('SiteCollection', $remoteCollection, 'supplied remote collection is SiteCollection');

        $localCollection = $remoteCollection->getLocalizedCollection();
        $this->assertInstanceOf('SiteCollection', $localCollection, 'localized collection is SiteCollection');
        $this->assertEquals($remoteCollection->Handle, $localCollection->Handle, 'localized collection matches handle');
        $this->assertEquals('Local', $localCollection->Site, 'localized collection site is Local');

        $this->assertInstanceOf('SiteCollection', $localCollection->Parent, 'localized grand-collection is SiteCollection');
        $this->assertEquals($remoteCollection->Parent->Handle, $localCollection->Parent->Handle, 'localized grand-collection matches handle');
        $this->assertEquals('Local', $localCollection->Parent->Site, 'localized grand-collection site is Local');
    }
}