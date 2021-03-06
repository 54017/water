$(function($, undefined) {

	var camera, scene, renderer, controls, plane, ts, isChrome, controller, prev;

	var isChrome = 0;

		var addText = function(frames, ms) {
		if (prev) {
			scene.remove(prev);
		}
		var text = new THREE.TextGeometry(frames + '    '  + ms, {size: 30.0, height: 5.0, font: 'helvetiker', style: 'normal', weight: 'bold'});
		var material = new THREE.MeshBasicMaterial({color: '#ffffff'});
		var mesh = new THREE.Mesh(text, material);
		mesh.position.z = -500;
		mesh.position.x = -400;
		mesh.position.y = 100;
		prev = mesh;
		scene.add(mesh);
	}
	
	var Stats = function () {

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	return {

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();


			if ( time >= prevTime + 1000 ) {
				addText(frames * 1000  / ( time - prevTime ),(time - prevTime) / frames / 1000);
				 console.log("frames", frames * 1000  / ( time - prevTime ), 'average', (time - prevTime) / frames / 1000);

				prevTime = time;
				frames = 0;

			}

			return time;

		}

	};

};

	var optionalParam = function(param, defaultParam) {
		return param ? param : defaultParam;
	}

	var addScene = function() {
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xcce0ff, 50, 10000);
	}

	var addCamera = function() {
		camera = new THREE.PerspectiveCamera( 70.0, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set(-15, 164, 262);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	var addLight = function(x, y, z, color) {
		x = optionalParam(x, 0);
		y = optionalParam(y, 30);
		z = optionalParam(z, 30);
		color = optionalParam(color, 0xffffff);
		var light = new THREE.DirectionalLight(color);
	    light.position.set(x, y, z).normalize();
	    scene.add(light);
	}

	var addGeometry = function() {
		var geometry = new THREE.CubeGeometry( 10, 10, 10);
	    //var material = new THREE.MeshPhongMaterial( { color: 0x0033ff, specular: 0xffffff, shininess: 3 } );
	    var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/crate.jpg') } );
	    var mesh = new THREE.Mesh(geometry, material );
	    mesh.position.z = -50;
	    scene.add( mesh );
	}

	var addSky = function() {
		var sky = new THREE.BoxGeometry(1000, 1000, 1000);
		var material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('images/sky.jpg'), side: THREE.DoubleSide});
		var mesh = new THREE.Mesh(sky, material);
		scene.add(mesh);

	}

	var addPlane = function() {
		var attributes = {
			displacement: {
				type: 'f',
				value: []
			}
		}
		var vShader = "varying vec2 vUv;void main() { vUv = uv;vec4 pos = vec4(position, 1.0);vec4 myPosition = modelViewMatrix * pos;gl_Position = projectionMatrix * myPosition; }";
		var fShader = "varying vec2 vUv; uniform sampler2D texture1; void main() { vec2 position = -1.0 + 2.0 * vUv;vec4 noise = texture2D(texture1, vUv);vec2 T = vUv;T.x -= noise.y * 0.5;T.y += noise.z * 0.5;vec4 color = texture2D(texture1, T*1.5);gl_FragColor = color;}"
		var uniforms = {
    		texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "images/water.png" ) },
		};
		var shaderMaterial =
			new THREE.ShaderMaterial({
		    	//attributes: attributes,
		    	uniforms: uniforms,
		    	side: THREE.DoubleSide,
		    	vertexShader:   vShader,
		    	fragmentShader: fShader
  		});
		var geometry = new THREE.PlaneGeometry( 1000, 800, 100, 100 );
		plane = new THREE.Mesh( geometry, shaderMaterial );
		plane.geometry.verticesNeedUpdate = true;
		plane.position.z  = -30;
		plane.rotation.x = 1.5;
		scene.add(plane);
	}

	  
	var init = function() {

	   	ts = 0;
		    
		addScene();
	
	    addCamera();
	 
	    

		//addGeometry();
	  
	    addPlane();  

		addSky();

		addText();

	  
	    renderer = new THREE.WebGLRenderer();
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    document.body.appendChild( renderer.domElement );
	  
	    window.addEventListener( 'resize', onWindowResize, false );

	  // Add the orbit controls
	    controls = new THREE.OrbitControls(camera, renderer.domElement);
		    controls.target = new THREE.Vector3(0, 0, 0);

		//图形控制控件
		controller = new function() {
			this.size = 8.0;
			this.magnitude = 1000.0; 
		}

		var gui = new dat.GUI();

		gui.add(controller, 'size', 1.0, 16.0);
		gui.add(controller, 'magnitude', 500.0, 2000.0);

	}
	 var stats = new Stats();
	var animate = function() {
	    //mesh.rotation.x += .04;
	    //mesh.rotation.y += .02;
	stats.begin();
		ts += 10;
		if (ts > 100000) {
			ts = 0;
		}
		var center = new THREE.Vector2(0,0);
		var vLength = plane.geometry.vertices.length;
  		for (var i = 0; i < vLength; i++) {
    		var v = plane.geometry.vertices[i];
    		var dist = new THREE.Vector2(v.x, v.y).sub(center);
    		var size = controller.size;
    		var magnitude = controller.magnitude;
    		if (dist.length() <= 10) {
    			v.z = 0;
    		} else {
    			v.z = Math.sin(dist.length()/size - (ts/100)) * magnitude/(dist.length() + 200);
    		}
  		}
  		plane.geometry.verticesNeedUpdate = true;
	    render();
	stats.end();
	    requestAnimationFrame(animate);
		controls.update();
	}
	  
	var render = function() {
	    renderer.render(scene, camera);
	}
	  
	var onWindowResize = function() {
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    render();
	}	

	if (isChrome) {
		$('.message').show();
	} else {
		init();
		animate();
	}

}(jQuery));