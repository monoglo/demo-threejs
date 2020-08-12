<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src

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
      var scene = new this.$three.Scene()
      var camera = new this.$three.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      var renderer = new this.$three.WebGLRenderer()
      renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(renderer.domElement)
      var geometry = new this.$three.BoxGeometry(1, 1, 1)
      var material = new this.$three.MeshBasicMaterial({
        color: 0x00ff00
      })
      var cube = new this.$three.Mesh(geometry, material)
      scene.add(cube)

      camera.position.z = 5

      function animate() {
        requestAnimationFrame(animate)
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        renderer.render(scene, camera)
      }
      animate()
    }
  }
}
</script>
