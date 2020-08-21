<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AmbientLight } from 'three'
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

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor('#e5e5e5')

      document.body.appendChild(renderer.domElement)

      window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight)

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      })

      camera.position.z = 5

      const hlight = new AmbientLight(0xFFFFFF)
      scene.add(hlight)
      // 灯光
      const light = new THREE.PointLight(0xFFFFFF, 5, 3000)
      light.position.set(25, 0, 100)
      scene.add(light)

      const loader = new GLTFLoader()
      loader.load(
        `${process.env.BASE_URL}models/donutandcupwithoutlight.gltf`,
        gltf => {
          scene.add(gltf.scene)
        },
        undefined,
        function(error) {
          console.error(error)
        }
      )

      // 创建控制器
      const controls = new OrbitControls(camera, renderer.domElement)
      // controls.minDistance = 0
      // controls.maxDistance = 300

      // GUI 面板
      // var propsLocal = {
      //   get Enabled() {
      //     return renderer.localClippingEnabled
      //   },
      //   set Enabled(v) {
      //     renderer.localClippingEnabled = v
      //   }
      // }

      // var gui = new GUI()
      // var folderLocal = gui.addFolder('Local Clipping')
      // folderLocal.add(propsLocal, 'Enabled')

      function render() {
        requestAnimationFrame(render)
        renderer.render(scene, camera)
        controls.update()
      }
      render()
    }
  }
}
</script>
