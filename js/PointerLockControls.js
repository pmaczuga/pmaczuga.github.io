/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PointerLockControls = function ( camera, domElement ) {

	var scope = this;

	this.domElement = domElement || document.body;
	this.isLocked = false;

	this.speed = 1.0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.canJump = false;

	this.velocity = new THREE.Vector3();
	this.direction = new THREE.Vector3();

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;


	var player = new Physijs.BoxMesh(
		new THREE.CubeGeometry( 10, 15, 10 ),
		new THREE.MeshBasicMaterial({ visable: false })
	);
	player.position.y = 7.5;

	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );
	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( { type: 'lock' } );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( { type: 'unlock' } );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	function onKeyDown( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				scope.moveForward = true;
				break;

			case 37: // left
			case 65: // a
				scope.moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				scope.moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				scope.moveRight = true;
				break;

			case 32: // space
				if ( scope.canJump === true ) scope.velocity.y += 350 * jumpSpeed;
				scope.canJump = false;
				break;

		}

	};

	function onKeyUp( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				scope.moveForward = false;
				break;

			case 37: // left
			case 65: // a
				scope.moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				scope.moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				scope.moveRight = false;
				break;

		}

	};

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );
	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

		document.removeEventListener( 'keydown', onKeyDown, false );
		document.removeEventListener( 'keyup', onKeyUp, false );
	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return player;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();

	this.update = function () {
		return function update( delta ) {
			
			if (scope.isLocked === false){
				return;
			}

			scope.velocity.x -= scope.velocity.x * 10.0 * delta;
			scope.velocity.z -= scope.velocity.z * 10.0 * delta;

			scope.direction.z = Number( scope.moveForward ) - Number( scope.moveBackward );
			scope.direction.x = Number( scope.moveLeft ) - Number( scope.moveRight );
			cameraLook = scope.getDirection(new THREE.Vector3(0,0,0)).clone();
			cameraLook.y = 0;
			var angle = Math.atan2(-cameraLook.x, -cameraLook.z);
			scope.direction.applyAxisAngle(new THREE.Vector3(0,1,0), angle);
			scope.direction.normalize(); // this ensures consistent movements in all directions
			

			scope.velocity.z -= scope.direction.z * 400.0 * delta * scope.speed;
			scope.velocity.x -= scope.direction.x * 400.0 * delta * scope.speed;

			scope.getObject().setLinearVelocity(scope.velocity);
			scope.getObject().rotation.set(0,0,0);
			scope.getObject().__dirtyRotation = true;
			scope.getObject().setAngularVelocity(new THREE.Vector3(0,0,0));
			
			camera.position.copy(scope.getObject().position);
			camera.position.y += 2.5;
		};
	}();
};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;
