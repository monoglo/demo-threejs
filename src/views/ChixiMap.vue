<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div id="ThreeJS" style="position: relative;"></div>
    <span class="tooltip">{{ tooltipText }}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// // import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
// // import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
// import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import {
  CSS2DRenderer,
  CSS2DObject
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
// import { AmbientLight } from 'three'
import Stats from 'stats.js'
export default {
  name: 'ChixiMap',
  data: () => ({
    msg: 'helloworld',
    renderer: null,
    orbitControls: null,
    dragControls: null,
    scene: null,
    camera: null,
    objects: [],
    selectedObject: null,
    renderPass: null,
    outlinePass: null,
    composer: null,
    mouse: null,
    tooltipText: 'Content 1',
    textSprite: null,
    css2dLabel: null,
    labelRenderer: null,
    count: 0,
    stats: null,
    lableDiv: null,
    nameLabel1: null,
    nameLabel2: null,
    nameLabel3: null,
    famenzhuan: false,
    environment: 'Studio Small',
    background: true
  }),
  mounted() {
    this.initThreejs()
  },
  methods: {
    initThreejs() {
      // 场景
      this.scene = new THREE.Scene()
      this.getCubeMapTexture().then(({ envMap }) => {
        this.scene.environment = envMap
        this.scene.background = this.background ? envMap : null
      })
      // 相机
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000000
      )

      // 渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setClearColor('#08143A')
      this.renderer.outputEncoding = THREE.sRGBEncoding
      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer)
      this.pmremGenerator.compileEquirectangularShader()
      // console.info(document.getElementById('ThreeJS'))
      document.getElementById('ThreeJS').appendChild(this.renderer.domElement)

      // 监听重置大小
      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
      })

      // 相机位置
      this.camera.position.x = -5
      this.camera.position.z = 10
      this.camera.position.y = 3

      // // 环境光
      // const hlight = new THREE.AmbientLight(0xffffff, 5)
      // this.scene.add(hlight)
      // // var hemilight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1.5)
      // // this.scene.add(hemilight)
      // // 灯光
      // const light = new THREE.PointLight(0xffffff, 5, 120)
      // light.position.set(-25, 5, 60)
      // this.scene.add(light)

      const light1 = new THREE.AmbientLight(0xffffff, 0.65)
      light1.name = 'ambient_light'
      this.scene.add(light1)

      const light2 = new THREE.DirectionalLight(0xffffff, 2)
      light2.position.set(0.5, 0, 0.866) // ~60º
      light2.name = 'main_light'
      this.scene.add(light2)

      this.scene.add(new THREE.AxesHelper(5))

      // GLTF加载器加载GLTF资源
      const loader = new GLTFLoader()
      loader.load(
        `${process.env.BASE_URL}models/chixi.gltf`,
        gltf => {
          // console.info(gltf)
          this.scene.add(gltf.scene)
          this.objects.push(gltf.scene)
          // CSS2DRender
          const lableDiv1 = document.createElement('div')
          lableDiv1.className = 'label'
          lableDiv1.textContent = '初始化中'

          this.nameLabel1 = new CSS2DObject(lableDiv1)

          this.nameLabel1.position.set(
            this.scene.getObjectByName('point1').position.x,
            this.scene.getObjectByName('point1').position.y + 5,
            this.scene.getObjectByName('point1').position.z
          )

          this.scene.add(this.nameLabel1)
          const lableDiv2 = document.createElement('div')
          lableDiv2.className = 'label'
          lableDiv2.textContent = '初始化中'
          this.nameLabel2 = new CSS2DObject(lableDiv2)

          this.nameLabel2.position.set(
            this.scene.getObjectByName('point2').position.x,
            this.scene.getObjectByName('point2').position.y + 5,
            this.scene.getObjectByName('point2').position.z
          )

          this.scene.add(this.nameLabel2)
          const lableDiv3 = document.createElement('div')
          lableDiv3.className = 'label'
          lableDiv3.textContent = '初始化中'
          this.nameLabel3 = new CSS2DObject(lableDiv3)

          this.nameLabel3.position.set(
            this.scene.getObjectByName('point3').position.x,
            this.scene.getObjectByName('point3').position.y + 5,
            this.scene.getObjectByName('point3').position.z
          )

          this.scene.add(this.nameLabel3)
          this.labelRenderer = new CSS2DRenderer()
          this.labelRenderer.setSize(window.innerWidth, window.innerHeight)
          this.labelRenderer.domElement.style.position = 'absolute'
          this.labelRenderer.domElement.style.top = 0
          this.labelRenderer.domElement.style.pointerEvents = 'none'
          document
            .getElementById('ThreeJS')
            .appendChild(this.labelRenderer.domElement)
        },
        undefined,
        function(error) {
          console.error(error)
        }
      )

      // // 着色器配置，轮廓高亮，抗锯齿，代替render渲染
      // this.renderPass = new RenderPass(this.scene, this.camera)
      // this.outlinePass = new OutlinePass(
      //   new THREE.Vector2(window.innerWidth, window.innerHeight),
      //   this.scene,
      //   this.camera
      // )
      // // var fxaaPass = new ShaderPass(FXAAShader)
      // this.composer = new EffectComposer(this.renderer)
      // this.composer.addPass(this.renderPass)
      // // this.composer.addPass(fxaaPass)
      // this.composer.addPass(this.outlinePass)
      // // console.info(this.outlinePass)
      // // console.info(this.composer)

      // 生成Orbit控制器
      this.orbitControls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      )
      // 自动旋转
      this.orbitControls.autoRotate = true
      this.orbitControls.autoRotateSpeed = -3
      // 配置Orbit控制器按键
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        // MIDDLE: THREE.MOUSE.DOLLY,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE
      }
      // // 创建拖拽控制器
      // this.dragControls = new DragControls(
      //   this.objects,
      //   this.camera,
      //   this.renderer.domElement
      // )
      // 拖拽控制器拖拽事件绑定
      // this.dragControls.addEventListener('dragstart', event => {
      //   // event.object.material.emissive.set(0xaaaaaa)
      //   // 拖拽过程禁用Orbit控制器
      //   this.orbitControls.enabled = false
      //   // 拖拽过程中止监听鼠标移动，锁定边缘高亮物体
      //   window.removeEventListener('mousemove', this.onTouchMove)
      //   window.removeEventListener('touchmove', this.onTouchMove)
      //   // 拖拽过程中使提示标签不可见
      //   var tooltip = document.querySelectorAll('.tooltip')
      //   tooltip[0].style.display = 'none'
      // })
      // // 拖拽过程结束，启用轮廓生成，启用Orbit控制器
      // this.dragControls.addEventListener('dragend', event => {
      //   // event.object.material.emissive.set(0x000000)
      //   window.addEventListener('mousemove', this.onTouchMove)
      //   window.addEventListener('touchmove', this.onTouchMove)
      //   this.onHover(event)
      //   this.orbitControls.enabled = true
      // })

      // 初次监听鼠标移动
      window.addEventListener('mousemove', this.onTouchMove)
      window.addEventListener('touchmove', this.onTouchMove)

      // FPS 监控
      this.stats = new Stats()
      this.stats.showPanel(0)
      this.stats.domElement.style.cssText =
        'position:absolute;top:0px;left:0px;'
      document.getElementById('ThreeJS').appendChild(this.stats.dom)

      this.render()
    },
    // 循环渲染
    render() {
      this.stats.begin()
      // this.renderer.render(this.scene, this.camera)
      this.orbitControls.update()
      if (this.labelRenderer) {
        this.labelRenderer.render(this.scene, this.camera)
      }
      this.renderer.render(this.scene, this.camera)
      this.stats.end()
      requestAnimationFrame(this.render)
    },
    // 鼠标移动事件
    onTouchMove(event) {
      var tooltip = document.querySelectorAll('.tooltip')
      tooltip[0].style.left = event.pageX + 'px'
      tooltip[0].style.top = event.pageY + 'px'
    },
    onHover(event) {
      // this.outlinePass.selectedObjects = [event.object]
      // console.info(event.object.id)
      // var tooltip = document.querySelectorAll('.tooltip')
      // this.tooltipText = event.object.id
      // tooltip[0].style.display = 'block'
      // if (event.object.name === 'valve') {
      //   this.famenzhuan = true
      // } else {
      //   this.famenzhuan = false
      // }
    },
    onHoverOff(event) {
      var tooltip = document.querySelectorAll('.tooltip')
      // this.outlinePass.selectedObjects = []
      tooltip[0].style.display = 'none'
      if (event.object.name === 'valve') {
        this.famenzhuan = false
      }
    },
    getCubeMapTexture() {
      return new Promise((resolve, reject) => {
        new RGBELoader().setDataType(THREE.UnsignedByteType).load(
          `${process.env.BASE_URL}environment/footprint_court_2k.hdr`,
          texture => {
            const envMap = this.pmremGenerator.fromEquirectangular(texture)
              .texture
            this.pmremGenerator.dispose()

            resolve({ envMap })
          },
          undefined,
          reject
        )
      })
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

canvas {
  display: block;
}

.tooltip {
  pointer-events: none;
  display: none;
  background: #c8c8c8;
  margin-left: 28px;
  padding: 10px;
  position: absolute;
  z-index: 1000;
  /* width: 80px;
  height: 25px; */
}

.label {
  color: #000;
  background-color: rgba(255, 255, 255, 0.2);
  margin-left: 28px;
  padding: 10px;
  position: absolute;
  z-index: 2000;
}
</style>
