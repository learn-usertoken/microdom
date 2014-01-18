var sax = require('sax');
var microdom = require('../microdom.js');
var assert = require('assert');
var inherits = require('util').inherits;

describe('microdom', function() {
  describe('#microdom', function() {
    it('should allow xml to be passed', function() {
      var dom = microdom('<a href="/test">testing</a>');
      assert.equal(1, dom.length());
      assert.equal('/test', dom.child(0).attr('href'));
      assert.equal('testing', dom.child(0).child(0).value);
    });

    it('should create a dom when no xml is passed', function() {
      var dom = microdom();
      assert.equal(0, dom.length());
    });

    it('should accept a parser and optional callback', function(t) {
      var parser = sax.createStream(true);
      var dom = microdom(parser, function() {
        assert.equal('testing', this.child(0).attr('class'));
        t();
      });

      parser.end('<a class="testing">blah</a>');
    });
  });

  describe('#child', function() {
    it('should return the node at specified index', function() {
      var node = microdom().append({});
      assert.deepEqual(node.parent.child(0), node);
    });

    it('should return null when passed an invalid index', function() {
      var node = microdom().append({});
      assert.equal(node.parent.child(-1), null);
      assert.equal(node.parent.child(10), null);
    });
  });

  describe('#buildNode', function() {
    it('should add .value if specified', function() {
      var dom = microdom();
      var node = dom.buildNode('a', { href : '/test'}, 'test link')[0];
      assert.equal('/test', node.attr('href'));
      assert.equal('test link', node.value);
      assert.equal('a', node.name);
    });
  });


  describe('#prepend', function() {
    it('should shift onto the front instead of push', function() {
      var dom = microdom().append({}).owner;
      var node = dom.prepend({ first: true });

      assert.ok(dom.child(0).attr('first'));
    });

    it('should setup the name if passed', function() {
      assert.equal('a', microdom().prepend('a', {
        test: 123
      }).name);
    });


    it('should setup the owner property', function() {
      var dom = microdom();
      assert.deepEqual(dom, dom.prepend({}).owner);
    });

    it('should setup the parent attribute', function() {
      var node = microdom().append({});

      assert.deepEqual(node, node.prepend({}).parent);
    });

    it('should remove from an existing parent', function() {
      var dom = microdom();
      var parent1 = dom.append({});
      var parent2 = dom.append({});
      var child = parent1.append({});

      assert.deepEqual(child.parent, parent1);
      assert.equal(1, parent1.length());
      assert.equal(0, parent2.length());


      parent2.prepend(child);

      assert.deepEqual(child.parent, parent2);
      assert.equal(0, parent1.length());
      assert.equal(1, parent2.length());
    });

    it('should update children owner properties', function() {
      var dom = microdom();
      var dom2 = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      node.append({});

      assert.ok(node.child(0).owner === dom);

      dom2.prepend(node);

      assert.ok(node.child(0).owner === dom2);
    });

    it('should be able to prepend raw xml', function() {
      var dom = microdom();
      dom.append({ last : true });

      dom.prepend('<a /><b />');

      assert.ok('a', dom.child(0).name);
      assert.ok('b', dom.child(1).name);
      assert.ok(dom.child(2).attr('last'));
    });
  });

  describe('#append', function() {
    it('should add a child to the end of the list', function() {
      assert.equal(1, microdom().append({
        some: 'attributes',
        id: 'test'
      }).owner.length());
    });

    it('should setup the name if passed', function() {
      assert.equal('a', microdom().append('a', {
        test: 123
      }).name);
    });

    it('should setup the owner property', function() {
      var dom = microdom();
      assert.deepEqual(dom, dom.append({}).owner);
    });

    it('should setup the parent attribute', function() {
      var node = microdom().append({});

      assert.deepEqual(node, node.append({}).parent);
    });

    it('should remove from an existing parent', function() {
      var dom = microdom();
      var parent1 = dom.append({});
      var parent2 = dom.append({});
      var child = parent1.append({});

      assert.deepEqual(child.parent, parent1);
      assert.equal(1, parent1.length());
      assert.equal(0, parent2.length());


      parent2.append(child);

      assert.deepEqual(child.parent, parent2);
      assert.equal(0, parent1.length());
      assert.equal(1, parent2.length());
    });

    it('should update children owner properties', function() {
      var dom = microdom();
      var dom2 = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      node.append({});

      assert.ok(node.child(0).owner === dom);

      dom2.append(node);

      assert.ok(node.child(0).owner === dom2);
    });

    it('should be able to append raw xml', function() {
      var dom = microdom();
      dom.append({ last : true });

      dom.append('<a /><b />');
      assert.ok('a', dom.child(1).name);
      assert.ok('b', dom.child(2).name);
      assert.ok(dom.child(0).attr('last'));
    });

  });

  describe('#indexOf', function() {
    it('should return the index of a child', function() {
      var dom = microdom();
      var a = dom.append({ name : 'a' });
      var b = dom.append({ name : 'b' });
      var c = dom.append({ name : 'c' });

      assert.equal(1, dom.indexOf(b));
    });

    it('should return -1 when the node is not found', function() {
      assert.equal(-1, microdom().indexOf(null));
    });
  });


  describe('#remove', function() {
    it('should remove a child by reference', function() {
      var dom = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      var res = dom.remove(node);
      
      assert.equal(0, dom.length());
      assert.ok(res === node);
      assert.ok(res.parent === null);

      // Ownership is not updated until the
      // orphan changes doms
      assert.ok(res.owner === dom);
    });

    it('should remove a child by index', function() {
      var dom = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      var res = dom.remove(0);
    
      assert.equal(0, dom.length());
      assert.ok(res === node);
      assert.ok(res.parent === null);

      // Ownership is not updated until the
      // orphan changes doms
      assert.ok(res.owner === dom);
    });

    it('should return null when provided an invalid index', function() {
      var dom = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      var res = dom.remove(-1);
      assert.equal(1, dom.length());
      assert.ok(res === null);
    });

    it('should update children owner properties', function() {
      var dom = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      node.append({});

      var res = dom.remove(0);
      assert.equal(0, dom.length());
      assert.ok(res === node);

      // Ownership is not updated until the
      // orphan changes doms
      assert.ok(res.child(0).owner === dom);
    });
  });

  describe('#attr', function() {
    it('should set when value is provided', function() {
      var node = microdom().append({
        hello : 123
      });

      node.attr('hello2', 321);

      assert.equal(123, node.attr('hello'));
      assert.equal(321, node.attr('hello2'));
    });

    it('should accept an object', function() {
      var node = microdom().append();

      node.attr({
        a: 1,
        b: 2
      });

      assert.equal(1, node.attr('a'));
      assert.equal(2, node.attr('b'));
    })
  });

  describe('#parse', function() {
    it('should parse basic xml', function() {

      var xml = '<a class="monkey" href="/test">hello</a>';
      var node = microdom.parse(xml);

      assert.equal('a', node.name);
      assert.equal('monkey', node.attr('class'));
      assert.equal('/test', node.attr('href'));
      assert.equal('hello', node.child(0).value);
    });

    it('should properly nest children', function() {
      var xml = [
        '<div class="test">',
          '<a class="monkey" href="/test">hello</a>',
          '<a class="monkey" href="/test2">hello2</a>',
        '</div>'
      ].join('\n');

      var node = microdom.parse(xml);

      assert.equal(5, node.length());
      assert.equal('/test', node.child(1).attr('href'));
      assert.equal('/test2', node.child(3).attr('href'));
    });

    it('should properly handle interspersed text', function() {
      var xml = [
        '<div class="test">',
          'hello <span class="bold">world</span>!',
        '</div>'
      ].join('\n');

      var node = microdom.parse(xml);
      assert.equal(3, node.length());
      assert.equal('bold', node.child(1).attr('class'));
      assert.equal('world', node.child(1).child(0).value);
    });

    it('should keep the casing of tags', function() {
      var xml = '<A /><a /><aBc />';

      var array = microdom.parse(xml);

      assert.equal(3, array.length);
      assert.equal('A', array[0].name);
      assert.equal('a', array[1].name);
      assert.equal('aBc', array[2].name);
    });
  });


  describe('parser tag mapping', function() {
    it('should allow overrides for tag names', function() {

      var called = false;
      function Anchor() {
        this.type = "anchor";
        microdom.MicroNode.apply(this, arguments);
      }

      inherits(Anchor, microdom.MicroNode);

      Anchor.prototype.click = function() {
        called = true;
      };

      microdom.tag('a', Anchor);
      var node = microdom('<a />').child(0);
      node.click();
 
      // cleanup after ourselves
      microdom.tag('a', null);

      assert.ok(called);
      assert.equal('anchor', node.type);
    });
  });

  describe('mutation events', function() {
    describe('#attr', function() {
      it('should track attribute mutations', function(t) {
        var dom = microdom();
        var a = dom.append('a');

        dom.on('~attr.class', function(node, attributeValue, oldValue) {
          assert.deepEqual(node, a);
          assert.equal('biglink', oldValue);
          assert.equal('small', attributeValue);
          t();
        });

        a.attr('class', 'biglink');
        a.attr('class', 'small');
      });

      it('should track attribute additions', function(t) {
        var dom = microdom();
        var a = dom.append('el');

        dom.on('+attr.class', function(node, attributeValue, oldValue) {
          assert.deepEqual(node, a);
          assert.equal('biglink', attributeValue);
          t();
        });

        a.attr('class', 'biglink');
      });

      it('should track attribute removals', function(t) {
        var dom = microdom();
        var a = dom.append('el', { 'class' : 'biglink' });

        dom.on('-attr.class', function(node, attributeValue, oldValue) {
          assert.deepEqual(node, a);
          assert.equal('biglink', oldValue);
          assert.equal(null, attributeValue);
          t();
        });

        a.attr('class', null);
      });
    });

    describe('#append', function() {
      it('should track node additions', function(t) {
        var dom = microdom();

        dom.on('+node', function(node) {
          assert.deepEqual(node, dom.child(0));
          assert.equal('a', node.name);
          t();
        });

        var a = dom.append('a');
      });
    });

    describe('#prepend', function() {
      it('should track node additions', function(t) {
        var dom = microdom();

        dom.on('+node', function(node) {
          assert.ok(node === dom.child(0));
          assert.equal('a', node.name);
          t();
        });

        dom.prepend('a');
      });
    });

    describe('#remove', function() {
      it('should track node removal', function(t) {
        var dom = microdom();

        dom.on('-node', function(node) {
          assert.deepEqual(node, a);
          assert.equal('a', node.name);
          t();
        });

        var a = dom.append('a');
        dom.remove(a);
      });
    });

  });

  describe('#plugin', function() {
    it('should mutate MicroNode.prototype', function() {
      var node = new microdom.MicroDom();

      assert.ok(!node.objectPlugin);

      microdom.plugin({
        objectPlugin: true
      });

      assert.ok(node.objectPlugin);
      assert.ok(microdom.MicroNode.prototype.objectPlugin);
    });

    it('should accept a function as well', function() {
      var called = false;
      microdom.plugin(function(proto) {
        proto.pluggedIn = true;
      });

      assert.ok(microdom.MicroNode.prototype.pluggedIn);
    });

    it('should work in the case of getElemntsByTagName', function() {

      var dom = microdom([
        '<outer><child><grandchild><leaf class="a"/>',
        '<leaf class="b"/></grandchild></child></outer>'].join('')
      );

      microdom.plugin({
        getElementsByTagName : function(name) {
          
          var ret = [], c = this.children(), l = this.length();
          for (var i=0; i<l; i++) {
            Array.prototype.push.apply(ret, c[i].getElementsByTagName(name));
          }

          if (this.name === name) {
            ret.push(this);
          }
          
          return ret;
        }
      });

      var nodes = dom.getElementsByTagName('leaf');
      assert.equal(2, nodes.length);
      assert.equal('a', nodes[0].attr('class'));
      assert.equal('b', nodes[1].attr('class'));

    });
  });
});
