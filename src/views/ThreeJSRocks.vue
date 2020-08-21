<template>
  <div class="home">
    <h1>ThreeJS Rocks!</h1>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { AmbientLight } from 'three'
const gsap = require('gsap')
const TimelineMax = gsap.TimelineMax
const Expo = gsap.Expo

export default {
  name: 'ThreeJSRocks',
  data: () => ({
    msg: 'helloworld',
    t1: null
  }),
  created() {
    this.initThreejs()
  },
  methods: {
    initThreejs() {
      var scene = new THREE.Scene()

      // 镜头
      var camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 10

      // 渲染器
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor('#e5e5e5')
      document.body.appendChild(renderer.domElement)

      // resize处理事件
      window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      })

      // 环境光
      // const hlight = new AmbientLight(0xffffff)
      // scene.add(hlight)
      // 灯光
      const light = new THREE.PointLight(0xffffff, 1, 1000)
      light.position.set(0, 0, 0)
      scene.add(light)
      const light2 = new THREE.PointLight(0xffffff, 2, 1000)
      light2.position.set(0, 0, 25)
      // scene.add(light2)

      // 方块
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshLambertMaterial({ color: 0xF7F7F7 })
      // const mesh = new THREE.Mesh(geometry, material)
      // scene.add(mesh)
      for (let i = 0; i < 15; i++) {
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = (Math.random() - 0.5) * 10
        mesh.position.y = (Math.random() - 0.5) * 10
        mesh.position.z = (Math.random() - 0.5) * 10
        scene.add(mesh)
      }

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

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

      function onMouseMove(event) {
        event.preventDefault()
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)
        for (let i = 0; i < intersects.length; i++) {
          const t1 = new TimelineMax()
          t1.to(intersects[i].object.scale, 1, { x: 2, ease: Expo.easeOut })
          t1.to(intersects[i].object.scale, 0.5, { x: 0.5, ease: Expo.easeOut })
          t1.to(intersects[i].object.position, 0.5, { x: 3, ease: Expo.easeOut })
          t1.to(
            intersects[i].object.rotation,
            0.5,
            { y: Math.PI * 0.5, ease: Expo.easeOut },
            '-=1.5'
          )
        }
      }
      window.addEventListener('mousemove', onMouseMove)
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
}

canvas {
  display: block;
}

h1 {
  position: absolute;
  top: 2em;
  left: 2em;
  font-family: 'Montserrat';
  font-size: 7em;
  text-transform: uppercase;
  width: auto;
  line-height: 0.8em;
  border: 5px solid black;
  padding: 0.2em;
}
</style>
