// Generated by LiveScript 1.5.0
/**
 * @package Detox DHT
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
(function(){
  var detoxCrypto, detoxUtils, lib, test;
  detoxCrypto = require('@detox/crypto');
  detoxUtils = require('@detox/utils');
  lib = require('..');
  test = require('tape');
  lib.ready(function(){
    var ArrayMap, random_bytes;
    ArrayMap = detoxUtils.ArrayMap;
    random_bytes = detoxUtils.random_bytes;
    test('Detox DHT', function(t){
      var instances, nodes, bootstrap_node_id, bootstrap_node_instance, i$;
      t.plan(17);
      console.log('Creating instances...');
      function DHT(id){
        var instance;
        return instance = lib.DHT(id, 20, 1000, 1000, 0.2, {
          STATE_UPDATE_INTERVAL: 0.1
        }).on('connect_to', function(peer_peer_id){
          instance.add_peer(peer_peer_id);
        }).on('send', function(target_id, command, payload){
          instances.get(target_id).receive(id, command, payload);
        }).on('peer_warning', function(peer_id){
          t.fail('Got warning about peer ' + Buffer.from(peer_id).toString('hex'));
        }).on('peer_error', function(peer_id){
          t.fail('Got error about peer ' + Buffer.from(peer_id).toString('hex'));
        });
      }
      instances = ArrayMap();
      nodes = [];
      bootstrap_node_id = random_bytes(32);
      bootstrap_node_instance = DHT(bootstrap_node_id);
      instances.set(bootstrap_node_id, bootstrap_node_instance);
      for (i$ = 0; i$ < 100; ++i$) {
        (fn$.call(this, i$));
      }
      console.log('Warm-up...');
      setTimeout(function(){
        var node_a, index_a, node_b, index_b, node_c, index_c, immutable_value, ref$, key_immutable, data_immutable, mutable_keypair, mutable_value, mutable_value2, key_mutable, data_mutable, data_mutable2;
        node_a = instances.get(nodes[index_a = Math.floor(nodes.length * Math.random())]);
        node_b = instances.get(nodes[index_b = Math.floor(nodes.length * Math.random())]);
        node_c = instances.get(nodes[index_c = Math.floor(nodes.length * Math.random())]);
        immutable_value = random_bytes(10);
        ref$ = node_a.make_immutable_value(immutable_value), key_immutable = ref$[0], data_immutable = ref$[1];
        node_a.put_value(key_immutable, data_immutable);
        mutable_keypair = detoxCrypto.create_keypair();
        mutable_value = random_bytes(10);
        mutable_value2 = random_bytes(10);
        ref$ = node_a.make_mutable_value(mutable_keypair.ed25519['public'], mutable_keypair.ed25519['private'], 0, mutable_value), key_mutable = ref$[0], data_mutable = ref$[1];
        ref$ = node_a.make_mutable_value(mutable_keypair.ed25519['public'], mutable_keypair.ed25519['private'], 1, mutable_value2), key_mutable = ref$[0], data_mutable2 = ref$[1];
        node_a.put_value(key_mutable, data_mutable);
        t.equal(node_a.verify_value(key_immutable, data_immutable).join(','), immutable_value.join(','), 'Correct immutable value verification succeeded');
        t.equal(node_a.verify_value(key_immutable, random_bytes(10)), null, 'Incorrect immutable value verification failed');
        t.equal(node_a.verify_value(key_mutable, data_mutable).join(','), mutable_value.join(','), 'Correct mutable value verification succeeded #1');
        t.equal(node_a.verify_value(key_mutable, data_mutable2).join(','), mutable_value2.join(','), 'Correct mutable value verification succeeded #2');
        function destroy(){
          instances.forEach(function(instance){
            instance.destroy();
          });
        }
        node_a.get_value(key_immutable).then(function(value){
          t.equal(value.join(','), immutable_value.join(','), 'getting immutable value on node a succeeded');
          return node_b.get_value(key_immutable);
        }).then(function(value){
          t.equal(value.join(','), immutable_value.join(','), 'getting immutable value on node b succeeded');
          return node_c.get_value(key_immutable);
        }).then(function(value){
          t.equal(value.join(','), immutable_value.join(','), 'getting immutable value on node c succeeded');
          return node_a.get_value(key_mutable);
        }).then(function(value){
          t.equal(value.join(','), mutable_value.join(','), 'getting mutable value v0 on node a succeeded');
          return node_b.get_value(key_mutable);
        }).then(function(value){
          t.equal(value.join(','), mutable_value.join(','), 'getting mutable value v0 on node b succeeded');
          return node_c.get_value(key_mutable);
        }).then(function(value){
          t.equal(value.join(','), mutable_value.join(','), 'getting mutable value v0 on node c succeeded');
          return node_a.put_value(key_mutable, data_mutable2);
        }).then(function(){
          return node_a.get_value(key_mutable);
        }).then(function(value){
          t.equal(value.join(','), mutable_value2.join(','), 'getting mutable value v1 on node a succeeded');
          return node_b.get_value(key_mutable);
        }).then(function(value){
          t.equal(value.join(','), mutable_value2.join(','), 'getting mutable value v1 on node b succeeded');
          return node_c.get_value(key_mutable);
        }).then(function(value){
          var random_id, promise;
          t.equal(value.join(','), mutable_value2.join(','), 'getting mutable value v1 on node c succeeded');
          random_id = random_bytes(32);
          promise = node_a.lookup(random_id);
          t.ok(promise === node_a.lookup(random_id), 'Subsequent lookups for the same ID return the same exact promise');
          return promise;
        }).then(function(lookup_nodes){
          t.ok(lookup_nodes.length >= 2 && lookup_nodes.length <= 20, 'Found at most 20 nodes on random lookup, but not less than 2');
          t.ok(lookup_nodes[0] instanceof Uint8Array, 'Node has correct ID type');
          t.equal(lookup_nodes[0].length, 32, 'Node has correct ID length');
        }).then(function(){
          destroy();
        })['catch'](function(e){
          if (e) {
            console.error(e);
          }
          destroy();
        });
      }, 1000);
      function fn$(_){
        var id, instance;
        id = random_bytes(32);
        instance = DHT(id);
        nodes.push(id);
        instances.set(id, instance);
        bootstrap_node_instance.add_peer(id);
        instance.add_peer(bootstrap_node_id);
      }
    });
  });
}).call(this);
