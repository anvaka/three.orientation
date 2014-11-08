/* global: THREE, window */
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * @author Andrei Kashcha / https://github.com/anvaka - adopted to commonjs,
 * restructured to avoid `this`
 * Original source code is here: http://threejs.org/examples/js/controls/DeviceOrientationControls.js
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

module.exports = orientationControl;

function orientationControl(object) {

  object.rotation.reorder("YXZ");

  var freeze = true;
  var deviceOrientation = {};
  var screenOrientation = 0;

  var setObjectQuaternion = createObjectQuaterionSetter();

  connect();

  return {
    update: update,
    connect: connect,
    disconnect: disconnect
  };

  function connect() {
    onScreenOrientationChangeEvent(); // run once on load
    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

    freeze = false;
  }

  function disconnect() {
    freeze = true;
    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
  }

  function update() {
    if (freeze) return;

    var alpha = deviceOrientation.gamma ? THREE.Math.degToRad(deviceOrientation.alpha) : 0; // Z
    var beta = deviceOrientation.beta ? THREE.Math.degToRad(deviceOrientation.beta) : 0; // X'
    var gamma = deviceOrientation.gamma ? THREE.Math.degToRad(deviceOrientation.gamma) : 0; // Y''
    var orient = screenOrientation ? THREE.Math.degToRad(screenOrientation) : 0; // O

    setObjectQuaternion(object.quaternion, alpha, beta, gamma, orient);
  }

  function onDeviceOrientationChangeEvent(event) {
    deviceOrientation = event;
  }

  function onScreenOrientationChangeEvent() {
    screenOrientation = window.orientation || 0;
  }

  function createObjectQuaterionSetter() {
    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
    var zee = new THREE.Vector3(0, 0, 1);
    var euler = new THREE.Euler();
    var q0 = new THREE.Quaternion();
    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    return function(quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
      quaternion.setFromEuler(euler); // orient the device
      quaternion.multiply(q1); // camera looks out the back of the device, not the top
      quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
    };
  }
}
