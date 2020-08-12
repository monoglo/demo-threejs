<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
export default {
  name: 'Home',
  data: () => ({
    msg: 'helloworld'
  }),
  created() {
    this.initThreejs()
  },
  methods: {
    initThreejs() {
      var scene = new THREE.Scene()
      var camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      var renderer = new THREE.WebGLRenderer()
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
      document.body.appendChild(renderer.domElement)
      var geometry = new THREE.BoxGeometry(1, 1, 1)
      var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
      })
      var cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      camera.position.z = 5

      function animate() {
        requestAnimationFrame(animate)
        cube.rotation.x += 0.01
        cube.rotation.y += 0.02
        renderer.render(scene, camera)
      }
      animate()
    }
  }
}
</script>
