import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// const geometry = new THREE.PlaneGeometry( 5, 5, 1, 1 );

const uniforms = {
  time: { value: 1.0 },
  resolution: { value: new THREE.Vector2() },
  iGlobalTime:    { type: 'f', value: 0.1 },
  iChannel0:  { type: 't', value: new THREE.TextureLoader().load('1.jpg') },
  iChannel1:  { type: 't', value: new THREE.TextureLoader().load('2.jpg') },
}

uniforms.iChannel0.value.wrapS = uniforms.iChannel0.value.wrapT = THREE.RepeatWrapping;
uniforms.iChannel1.value.wrapS = uniforms.iChannel1.value.wrapT = THREE.RepeatWrapping;

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    uniform float iGlobalTime;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;

    varying vec2 vUv;

    void main(void)
    {
        // vec2 p = gl_FragCoord.xy / iResolution.xy;
        vec2 p = -1.0 + 2.0 *vUv;
        vec2 q = p - vec2(0.5, 0.5);

        q.x += sin(iGlobalTime* 0.6) * 0.2;
        q.y += cos(iGlobalTime* 0.4) * 0.3;

        float len = length(q);

        float a = atan(q.y, q.x) + iGlobalTime * 0.3;
        float b = atan(q.y, q.x) + iGlobalTime * 0.3;
        float r1 = 0.3 / len + iGlobalTime * 0.5;
        float r2 = 0.2 / len + iGlobalTime * 0.5;

        float m = (1.0 + sin(iGlobalTime * 0.5)) / 2.0;
        vec4 tex1 = texture2D(iChannel0, vec2(a + 0.1 / len, r1 ));
        vec4 tex2 = texture2D(iChannel1, vec2(b + 0.1 / len, r2 ));
        vec3 col = vec3(mix(tex1, tex2, m));
        gl_FragColor = vec4(col * len * 1.5, 1.0);
    }
  `,
});

var obj = new THREE.Mesh( new THREE.PlaneGeometry(6, 6, 1, 1), material);
scene.add(obj);

camera.position.z = 4;

let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame( animate );

  uniforms.iGlobalTime.value += clock.getDelta();

	renderer.render( scene, camera );
}
animate();