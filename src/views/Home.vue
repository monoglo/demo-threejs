<template>
  <div class="home">
    <button @click="drink()">喝茶</button>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div id="ThreeJS" style="position: relative;"></div>
    <span class="tooltip">{{ tooltipText }}</span>
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
import Stats from 'stats.js'
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
    tooltipText: 'Content 1',
    textSprite: null,
    count: 0,
    stats: null
  }),
  mounted() {
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
      // console.info(document.getElementById('ThreeJS'))
      document.getElementById('ThreeJS').appendChild(this.renderer.domElement)

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

      // GLTF加载器加载GLTF资源
      const loader = new GLTFLoader()
      loader.load(
        `${process.env.BASE_URL}models/donutandcupwithoutlight.gltf`,
        gltf => {
          // console.info(gltf)
          this.scene.add(gltf.scene)
          this.objects.push(gltf.scene)
          // 精灵材质
          this.textSprite = this.makeTextSprite('Iloveyou', {
            borderThickness: 1,
            fontsize: 30
          })
          // textSprite.scale.set(100, 100, 100)
          // textSprite.position.set(this.scene.getObjectById(23).position)
          this.scene.add(this.textSprite)
          // console.info(this.textSprite.position)
          this.textSprite.position.copy(this.scene.getObjectById(23).position)
          // console.info(this.scene.getObjectById(23).position)
          // this.scene.getObjectById(23).add(textSprite)
          // console.info(this.scene.getObjectById(23))
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

      // 生成Orbit控制器
      this.orbitControls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      )
      // 配置Orbit控制器按键
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
        this.onHover(event)
        this.orbitControls.enabled = true
      })
      this.dragControls.addEventListener('hoveron', this.onHover)
      this.dragControls.addEventListener('hoveroff', this.onHoverOff)

      // 边缘高亮选择配置
      // 鼠标二维坐标
      this.mouse = new THREE.Vector2()
      // 透视物体选择器
      this.raycaster = new THREE.Raycaster()
      // 初次监听鼠标移动
      window.addEventListener('mousemove', this.onTouchMove)
      window.addEventListener('touchmove', this.onTouchMove)

      this.stats = new Stats()
      this.stats.showPanel(0)
      this.stats.domElement.style.cssText = 'position:absolute;top:0px;left:0px;'
      document.getElementById('ThreeJS').appendChild(this.stats.dom)

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
      this.stats.begin()
      // this.renderer.render(this.scene, this.camera)
      this.orbitControls.update()
      if (this.textSprite) {
        this.textSprite.position.set(
          this.scene.getObjectById(23).position.x,
          this.scene.getObjectById(23).position.y,
          this.scene.getObjectById(23).position.z
        )
        // console.info(this.textSprite)
        this.textSprite.material = this.makeTextSpriteMaterial(
          'Iloveyou' + this.count,
          {
            borderThickness: 1,
            fontsize: 30
          }
        )

        this.count += 1
      }
      this.composer.render()
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
      var tooltip = document.querySelectorAll('.tooltip')
      this.outlinePass.selectedObjects = [event.object]
      // console.info(selectedObject.id)
      switch (event.object.id) {
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
    },
    onHoverOff(event) {
      var tooltip = document.querySelectorAll('.tooltip')
      this.outlinePass.selectedObjects = []
      tooltip[0].style.display = 'none'
    },
    drink() {
      this.scene.getObjectById(813).visible = !this.scene.getObjectById(813)
        .visible
      console.info(this.dragControls.getObjects())
    },
    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    },
    makeTextSpriteMaterial(message, parameters) {
      if (parameters === undefined) parameters = {}
      var fontface = Object.prototype.hasOwnProperty.call(
        parameters,
        'fontface'
      )
        ? parameters.fontface
        : 'Arial'
      var fontsize = Object.prototype.hasOwnProperty.call(
        parameters,
        'fontsize'
      )
        ? parameters.fontsize
        : 18
      var borderThickness = Object.prototype.hasOwnProperty.call(
        parameters,
        'borderThickness'
      )
        ? parameters.borderThickness
        : 4
      var borderColor = Object.prototype.hasOwnProperty.call(
        parameters,
        'borderColor'
      )
        ? parameters.borderColor
        : { r: 0, g: 0, b: 0, a: 1.0 }
      var backgroundColor = Object.prototype.hasOwnProperty.call(
        parameters,
        'backgroundColor'
      )
        ? parameters.backgroundColor
        : { r: 255, g: 255, b: 255, a: 1.0 }
      var textColor = Object.prototype.hasOwnProperty.call(
        parameters,
        'textColor'
      )
        ? parameters.textColor
        : { r: 0, g: 0, b: 0, a: 1.0 }

      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')
      context.font = 'Bold ' + fontsize + 'px ' + fontface
      // get size data (height depends only on font size)
      var metrics = context.measureText(message)
      var textWidth = metrics.width

      // background color
      context.fillStyle =
        'rgba(' +
        backgroundColor.r +
        ',' +
        backgroundColor.g +
        ',' +
        backgroundColor.b +
        ',' +
        backgroundColor.a +
        ')'
      // border color
      context.strokeStyle =
        'rgba(' +
        borderColor.r +
        ',' +
        borderColor.g +
        ',' +
        borderColor.b +
        ',' +
        borderColor.a +
        ')'

      context.lineWidth = borderThickness
      this.roundRect(
        context,
        borderThickness / 2,
        borderThickness / 2,
        textWidth + borderThickness,
        fontsize * 1.4 + borderThickness,
        6
      )
      // 1.4 is extra height factor for text below baseline: g,j,p,q.
      // text color

      context.fillStyle =
        'rgba(' +
        textColor.r +
        ', ' +
        textColor.g +
        ', ' +
        textColor.b +
        ', 1.0)'
      context.fillText(message, borderThickness, fontsize + borderThickness)

      // canvas contents will be used for a texture
      var texture = new THREE.Texture(canvas)
      texture.needsUpdate = true

      return new THREE.SpriteMaterial({
        map: texture
      })
    },
    makeTextSprite(message, parameters) {
      var sprite = new THREE.Sprite(
        this.makeTextSpriteMaterial(message, parameters)
      )
      var fontsize = Object.prototype.hasOwnProperty.call(
        parameters,
        'fontsize'
      )
        ? parameters.fontsize
        : 18
      sprite.scale.set(0.05 * fontsize, 0.025 * fontsize, 0.01)
      return sprite
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
</style>
