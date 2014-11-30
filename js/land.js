// Generated by CoffeeScript 1.6.3
(function() {
  var God, Land, PerlinNoise, pass, pp, __DEBUG__;

  __DEBUG__ = false;

  pass = void 0;

  pp = function() {
    console.info.apply(console, arguments);
    return arguments;
  };

  God = (function() {
    function God() {}

    God.setup = function() {
      var ambientLight, c, directionalLight;
      this.deviceWidth = 640.0;
      this.deviceHeight = 480.0;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0xeeeeff, 0.005);
      this.camera = new THREE.PerspectiveCamera(75, this.deviceWidth / this.deviceHeight, Math.pow(0.1, 8), Math.pow(10, 3));
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setSize(this.deviceWidth, this.deviceHeight);
      this.renderer.setClearColor(0xeeeeff, 0);
      c = document.getElementById('c');
      c.appendChild(this.renderer.domElement);
      directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 1000, 0);
      this.scene.add(directionalLight);
      ambientLight = new THREE.AmbientLight(0x999999);
      this.scene.add(ambientLight);
      return this.land = new Land(this.scene);
    };

    God.start = function() {
      var render, startTime,
        _this = this;
      startTime = +new Date();
      render = function() {
        var ras;
        ras = (new Date() - startTime) * 0.001;
        _this.camera.position.x = Math.sin(ras) * 100;
        _this.camera.position.z = ras * 100;
        _this.camera.position.y = Math.cos(ras * 0.7) * 30 + 50;
        _this.camera.lookAt(new THREE.Vector3(_this.camera.position.x + Math.sin(ras * 0.9321), _this.camera.position.y + Math.sin(ras * 0.82331) * 0.5 - 0.3, _this.camera.position.z + Math.cos(ras * 0.78321)));
        _this.land.update();
        requestAnimationFrame(render);
        return _this.renderer.render(_this.scene, _this.camera);
      };
      return render();
    };

    return God;

  })();

  PerlinNoise = (function() {
    function PerlinNoise() {}

    PerlinNoise.noise2 = function(x, y) {
      var n, ret;
      n = x + y * 1023;
      n = (n << 13) ^ n | 0;
      ret = 1.0 - ((((n * (((n * n * 15731) | 0) + 789221) | 0) + 1376312589) & 0x7fffffff) / 1073741824.0);
      return ret;
    };

    PerlinNoise.smoothedNoise2 = function(x, y) {
      var center, corners, sides;
      corners = (PerlinNoise.noise2(x - 1, y - 1) + PerlinNoise.noise2(x + 1, y - 1) + PerlinNoise.noise2(x - 1, y + 1) + PerlinNoise.noise2(x + 1, y + 1)) / 16;
      sides = (PerlinNoise.noise2(x - 1, y) + PerlinNoise.noise2(x + 1, y) + PerlinNoise.noise2(x, y - 1) + PerlinNoise.noise2(x, y + 1)) / 8;
      center = PerlinNoise.noise2(x, y) / 4;
      return corners + sides + center;
    };

    PerlinNoise.interpolate = function(a, b, x) {
      var f, ft;
      ft = x * Math.PI;
      f = (1 - Math.cos(ft)) * 0.5;
      return a * (1 - f) + b * f;
    };

    PerlinNoise.interpolatedNoise2 = function(x, y) {
      var fracX, fracY, i1, i2, intX, intY, v1, v2, v3, v4;
      intX = ~~x;
      fracX = x - intX;
      intY = ~~y;
      fracY = y - intY;
      v1 = PerlinNoise.smoothedNoise2(intX, intY);
      v2 = PerlinNoise.smoothedNoise2(intX + 1, intY);
      v3 = PerlinNoise.smoothedNoise2(intX, intY + 1);
      v4 = PerlinNoise.smoothedNoise2(intX + 1, intY + 1);
      i1 = PerlinNoise.interpolate(v1, v2, fracX);
      i2 = PerlinNoise.interpolate(v3, v4, fracX);
      return PerlinNoise.interpolate(i1, i2, fracY);
    };

    PerlinNoise.perlinNoise2 = function(x, y, p, octaves) {
      var amplitude, frequency, i, n, total, _i;
      if (p == null) {
        p = 4;
      }
      if (octaves == null) {
        octaves = 2;
      }
      total = 0;
      n = octaves - 1;
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        frequency = Math.pow(2, i);
        amplitude = Math.pow(p, i);
        total = total + PerlinNoise.interpolatedNoise2(x * frequency, y * frequency) * amplitude;
      }
      return total;
    };

    return PerlinNoise;

  })();

  Land = (function() {
    function Land(scene) {
      var mesh1, mesh2;
      this.scene = scene;
      this.width = this.height = 1000;
      this.widthSegment = this.heightSegment = 400;
      mesh1 = this.makeMesh(this.width, this.height, this.widthSegment, this.heightSegment);
      this.constructLandMap(mesh1.geometry);
      this.scene.add(mesh1);
      mesh2 = this.makeMesh(this.width, this.height, this.widthSegment, this.heightSegment);
      this.constructLandMap(mesh2.geometry);
      this.scene.add(mesh2);
      this.meshes = [mesh1, mesh2];
      mesh1.position.z = mesh2.position.z + this.height;
    }

    Land.prototype.makeMesh = function(width, height, widthSegment, heightSegment) {
      var faceIdx, geometry, hps, material, mesh, wps, x, xoff, z, _i, _j, _k, _l, _ref, _ref1,
        _this = this;
      wps = 1.0 * width / widthSegment;
      hps = 1.0 * height / (heightSegment - 1);
      material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors
      });
      geometry = new THREE.Geometry();
      mesh = new THREE.Mesh(geometry, material);
      for (z = _i = 0; 0 <= heightSegment ? _i < heightSegment : _i > heightSegment; z = 0 <= heightSegment ? ++_i : --_i) {
        for (x = _j = 0; 0 <= widthSegment ? _j < widthSegment : _j > widthSegment; x = 0 <= widthSegment ? ++_j : --_j) {
          xoff = z % 2 === 0 ? 0 : wps * 0.5;
          geometry.vertices.push(new THREE.Vector3((x * wps + xoff) - width / 2, 0, (z * hps) - height / 2));
        }
      }
      faceIdx = function(x, z) {
        return z * widthSegment + x;
      };
      for (z = _k = 0, _ref = heightSegment - 1; 0 <= _ref ? _k < _ref : _k > _ref; z = 0 <= _ref ? ++_k : --_k) {
        for (x = _l = 0, _ref1 = widthSegment - 1; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; x = 0 <= _ref1 ? ++_l : --_l) {
          geometry.faces.push(new THREE.Face3(faceIdx(x, z), faceIdx(x, z + 1), faceIdx(x + 1, z)), new THREE.Face3(faceIdx(x + 1, z), faceIdx(x, z + 1), faceIdx(x + 1, z + 1)));
        }
      }
      return mesh;
    };

    Land.prototype.constructLandMap = function(geometry) {
      var face, h, maxH, minH, v, vs, z, _h, _i, _j, _len, _len1, _ref, _ref1;
      maxH = minH = 0;
      _ref = geometry.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        z = v.z;
        if (Math.abs(z - this.width / 2) < 0.001) {
          z = -this.width / 2;
        }
        h = PerlinNoise.perlinNoise2(v.x * 0.001, z * 0.001, 1.1, 10) * 5.5 + 5;
        v.y = h;
        maxH = Math.max(maxH, h);
        minH = Math.min(minH, h);
      }
      _ref1 = geometry.faces;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        face = _ref1[_j];
        vs = geometry.vertices;
        h = (vs[face.a].y + vs[face.b].y + vs[face.c].y) / 3;
        if (h > 0) {
          _h = h / maxH;
          face.color.setHSL(Math.min(0.1 + _h * 0.6, 0.5), 0.9, Math.min(0.2 + _h * 0.3, 0.8));
        } else {
          _h = h / minH;
          face.color.setHSL(0.6, 0.9, 0.5 - _h * 0.1);
        }
      }
      geometry.computeFaceNormals();
      return geometry.computeVertexNormals();
    };

    Land.prototype.update = function(scene) {
      var mesh1, mesh2, _ref;
      this.scene = scene;
      _ref = this.meshes, mesh1 = _ref[0], mesh2 = _ref[1];
      if ((mesh1.position.z - God.camera.position.z) < this.height / 20) {
        mesh2.position.z = mesh1.position.z + this.height;
        return this.meshes = [mesh2, mesh1];
      }
    };

    return Land;

  })();

  window.God = God;

}).call(this);

/*
//@ sourceMappingURL=land.map
*/
