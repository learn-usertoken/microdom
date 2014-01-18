var microdom = require('../microdom.js');
var assert = require('assert');

describe('microdom', function() {
  describe('#prepend', function() {
    it('should shift onto the front instead of push', function() {
      var dom = microdom().append({}).owner;
      var node = dom.prepend({ first: true });

      assert.ok(dom.children[0].attr('first'));
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
      assert.equal(1, parent1.children.length);
      assert.equal(0, parent2.children.length);


      parent2.prepend(child);

      assert.deepEqual(child.parent, parent2);
      assert.equal(0, parent1.children.length);
      assert.equal(1, parent2.children.length);
    });
  });

  describe('#append', function() {
    it('should add a child to the end of the list', function() {
      assert.equal(1, microdom().append({
        some: 'attributes',
        id: 'test'
      }).owner.children.length);
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
      assert.equal(1, parent1.children.length);
      assert.equal(0, parent2.children.length);


      parent2.append(child);

      assert.deepEqual(child.parent, parent2);
      assert.equal(0, parent1.children.length);
      assert.equal(1, parent2.children.length);

    });
  });

  describe('#indexOf', function() {
    it('should return the index of a child', function() {
      var dom = microdom();
      var a = dom.append({ name : 'a' });
      var b = dom.append({ name : 'b' });
      var c = dom.append({ name : 'c' });

      assert.equal(1, dom.indexOf(b))
    });

    it('should return -1 when the node is not found', function() {
      assert.equal(-1, microdom().indexOf(null));
    });
  });


  describe('#remove', function() {
    it('should remove a child', function() {
      var dom = microdom();
      var node = dom.append({
        some: 'attributes',
        id: 'test'
      });

      var res = dom.remove(node);
      
      assert.equal(0, dom.children.length);
      assert.ok(res === dom);
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
  });

  describe('#parse', function() {
    it('should parse basic xml', function() {

      var xml = '<a class="monkey" href="/test">hello</a>';
      var node = microdom.parse(xml);

      assert.equal('a', node.name);
      assert.equal('monkey', node.attr('class'));
      assert.equal('/test', node.attr('href'));
      assert.equal('hello', node.children[0].value);
    });

    it('should properly nest children', function() {
      var xml = [
        '<div class="test">',
          '<a class="monkey" href="/test">hello</a>',
          '<a class="monkey" href="/test2">hello2</a>',
        '</div>'
      ].join('\n');

      var node = microdom.parse(xml);

      assert.equal(5, node.children.length);
      assert.equal('/test', node.children[1].attr('href'));
      assert.equal('/test2', node.children[3].attr('href'));
    });

    it('should properly handle interspersed text', function() {
      var xml = [
        '<div class="test">',
          'hello <span class="bold">world</span>!',
        '</div>'
      ].join('\n');

      var node = microdom.parse(xml);
      assert.equal(3, node.children.length);
      assert.equal('bold', node.children[1].attr('class'));
      assert.equal('world', node.children[1].children[0].value);
    });

    it('should keep the casing of tags', function() {
      var xml = '<A /><a /><aBc />';

      // The parser will automatically create an element to house
      // multiple elements
      var root = microdom.parse(xml);

      assert.equal(3, root.children.length);
      assert.equal('A', root.children[0].name);
      assert.equal('a', root.children[1].name);
      assert.equal('aBc', root.children[2].name);
    });

  });
});
