<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <span class="tooltip">{{tooltipText}}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { AmbientLight } from 'three'
export default {
  name: 'Home',
  data: () => ({
    msg: 'helloworld',
    renderer: null,
    orbitControls: null,
    dragControls: null,
    scene: null,
    camera: null,
    objects: [],
    selectedObject: null,
    selectedEdge: null,
    renderPass: null,
    outlinePass: null,
    composer: null,
    mouse: null,
    tooltipText: 'Content 1'
  }),
  created() {
    this.initThreejs()
  },
  methods: {
    initThreejs() {
      // 场景
      this.scene = new THREE.Scene()
      // 相机
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      // 渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setClearColor('#e5e5e5')
      document.body.appendChild(this.renderer.domElement)

      // 重置大小监听设置
      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
      })

      // 相机位置
      this.camera.position.x = 1
      this.camera.position.z = 0
      this.camera.position.y = 1.5

      // 环境光
      const hlight = new AmbientLight(0xffffff)
      this.scene.add(hlight)
      // 灯光
      const light = new THREE.PointLight(0xffffff, 5, 100)
      light.position.set(25, 0, 100)
      this.scene.add(light)

      // GLTF加载器
      const loader = new GLTFLoader()
      loader.load(
        `${process.env.BASE_URL}models/donutandcupwithoutlight.gltf`,
        gltf => {
          // console.info(gltf)
          this.scene.add(gltf.scene)
          this.objects.push(gltf.scene)
        },
        undefined,
        function(error) {
          console.error(error)
        }
      )

      // 着色器配置，轮廓高亮，抗锯齿，代替render渲染
      this.renderPass = new RenderPass(this.scene, this.camera)
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.scene,
        this.camera
      )
      var fxaaPass = new ShaderPass(FXAAShader)
      this.composer = new EffectComposer(this.renderer)
      this.composer.addPass(this.renderPass)
      this.composer.addPass(fxaaPass)
      this.composer.addPass(this.outlinePass)
      // console.info(this.outlinePass)
      // console.info(this.composer)

      // Orbit控制器
      this.orbitControls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      )
      // 配置按键
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        // MIDDLE: THREE.MOUSE.DOLLY,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE
      }
      // 创建拖拽控制器
      this.dragControls = new DragControls(
        this.objects,
        this.camera,
        this.renderer.domElement
      )
      // 拖拽控制器拖拽事件绑定
      this.dragControls.addEventListener('dragstart', event => {
        // event.object.material.emissive.set(0xaaaaaa)
        // 拖拽过程禁用Orbit控制器
        this.orbitControls.enabled = false
        // 拖拽过程中止监听鼠标移动，锁定边缘高亮物体
        window.removeEventListener('mousemove', this.onTouchMove)
        window.removeEventListener('touchmove', this.onTouchMove)
        var tooltip = document.querySelectorAll('.tooltip')
        tooltip[0].style.display = 'none'
        // if (this.selectedEdge != null) {
        //   this.scene.remove(this.selectedEdge)
        // }
        // console.info('dragstart')
        // this.selectedObject = event.object
        // var geometry = new THREE.WireframeGeometry(this.selectedObject.geometry)

        // var material = new THREE.LineBasicMaterial({ color: 0x111111 })

        // this.selectedEdge = new THREE.LineSegments(geometry, material)

        // this.outlinePass.selectedObjects = [event.object]
        // console.info(this.outlinePass.selectedObjects)
      })
      // 拖拽过程结束，启用轮廓生成，启用Orbit控制器
      this.dragControls.addEventListener('dragend', event => {
        // event.object.material.emissive.set(0x000000)
        // console.info('dragend')
        // this.selectedEdge.position.x = event.object.position.x
        // this.selectedEdge.position.y = event.object.position.y
        // this.selectedEdge.position.z = event.object.position.z
        window.addEventListener('mousemove', this.onTouchMove)
        window.addEventListener('touchmove', this.onTouchMove)
        this.orbitControls.enabled = true
      })

      // 边缘高亮选择配置
      // 鼠标二维坐标
      this.mouse = new THREE.Vector2()
      // 透视物体选择器
      this.raycaster = new THREE.Raycaster()
      // 初次监听鼠标移动
      window.addEventListener('mousemove', this.onTouchMove)
      window.addEventListener('touchmove', this.onTouchMove)

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

      this.render()
    },
    // 循环渲染
    render() {
      requestAnimationFrame(this.render)
      // this.renderer.render(this.scene, this.camera)
      this.orbitControls.update()
      this.composer.render()
    },
    // 鼠标移动事件
    onTouchMove(event) {
      var tooltip = document.querySelectorAll('.tooltip')
      tooltip[0].style.left = event.pageX + 'px'
      tooltip[0].style.top = event.pageY + 'px'
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)

      var intersects = this.raycaster.intersectObjects([this.scene], true)

      if (intersects.length > 0) {
        var selectedObject = intersects[0].object
        this.outlinePass.selectedObjects = [selectedObject]
        // console.info(selectedObject.id)
        switch (selectedObject.id) {
          case 24:
            this.tooltipText = '桌布'
            break
          case 23:
            this.tooltipText = '碟子'
            break
          case 810:
            this.tooltipText = '茶杯'
            break
          case 813:
            this.tooltipText = '红茶'
            break
          case 811:
            this.tooltipText = '茶杯内壁的水滴'
            break
          case 814:
            this.tooltipText = '甜甜圈的面包'
            break
          case 815:
            this.tooltipText = '甜甜圈的冰激凌'
            break
          default:
            this.tooltipText = '未知?七彩米'
            break
        }
        tooltip[0].style.display = 'block'
      } else {
        this.outlinePass.selectedObjects = []
        tooltip[0].style.display = 'none'
      }
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
  pointer-events:none;
  display: none;
  background: #c8c8c8;
  margin-left: 28px;
  padding: 10px;
  position: absolute;
  z-index: 1000;
  /* width: 80px;
  height: 25px; */
}
</style>
