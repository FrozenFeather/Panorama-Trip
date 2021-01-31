import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { CSS2DObject } from 'https://threejs.org/examples/jsm/renderers/CSS2DRenderer.js';
import { Animator } from './animation.js';
import { config } from "../config.js";

// Parameters
// Camera
const FIELD_OF_VIEW = 75;

// TopView
const TOP_POSY = 100;
const TOP_FOV = 120;

// animation
const INITIAL_WAIT = 3000;
const ROTATING_SPEED = 0.06;
const IDLE_TIME = 5000;

// Variables
// renderer
var renderer;

// scene
var scene;
var camera;

// init
class PanoramaRenderer extends THREE.WebGLRenderer{
  constructor(canvas){
    super(canvas);
    this.loaded = false;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(TOP_FOV, window.innerWidth / window.innerHeight, 0.1, 1000.0);

    this.sceneObjects = [];
    this.loadingPrompt = null;
    this.lastMoveTime = new Date().getTime();

    this.sphere = new THREE.SphereGeometry(100.0, 100.0, 40);
    this.camera.target = new THREE.Vector3(0.0, 0.0, 0.0);
    this.sphere.applyMatrix4(new THREE.Matrix4().makeScale(-1.0, 1.0, 1.0));
    var material = new THREE.MeshBasicMaterial();
    this.environment = new THREE.Mesh(this.sphere, material);
    this.scene.add(this.environment);

    // animator
    this.viewPhi = new Animator(-90);
    this.viewTheta = 0.0;
    this.viewPhi.setConstraint(-90, 89.9);
    this.viewPhi.setTarget(0.0);
    this.positionY = new Animator(TOP_POSY);
    this.positionY.setTarget(0.0);
    this.fov = new Animator(TOP_FOV);
    this.fov.setTarget(FIELD_OF_VIEW);
    this.nextFrame();
  }
  
  setScene = function(room){
    if(this.sceneObjects.length >= 1){
      for (var obj of this.sceneObjects){
        obj.clear();
        this.scene.remove(obj);
      }
    }
    this.sceneObjects = []
    if(this.loadingPrompt != null){
      this.loadingPrompt.hidden = false;
    }

    var img = "img/" + room.image;
    var texLoader = new THREE.TextureLoader();
    var loadFinished = function(tex){

      var material = new THREE.MeshBasicMaterial({map : tex});
      this.environment.material = material;
      this.viewTheta = room.start_theta;
      var loadedcallback = function(){ this.loaded = true; }.bind(this);
      if(this.loadingPrompt != null){
        this.loadingPrompt.hidden = true;
      }
      window.setTimeout(loadedcallback, INITIAL_WAIT);
    }.bind(this);
    texLoader.load(img, loadFinished);


    for (var anchor of room.anchor){
      const room = this.createArrow(anchor);
      this.addObjectToScene(room);
    }
  }

  addObjectToScene = function(object){
    this.scene.add(object);
    this.sceneObjects.push(object)
  }

  addPhiThetaOffset = function(phiOffset, thetaOffset){
    this.viewPhi.addOffset(phiOffset);
    this.viewTheta += thetaOffset;
    if(this.viewTheta > 180.0){ this.viewTheta -= 360.0; }
    if(this.viewTheta < -180.0){ this.viewTheta += 360.0; }
  }

  nextFrame = function(){
    this.viewPhi.nextStep();
    if(this.wandering){
      this.viewTheta += ROTATING_SPEED;
    }
    this.camera.position.y = this.positionY.nextStep();
    var nextFOV = this.fov.nextStep();
    if(Math.abs(this.camera.fov - nextFOV) > 0){
      this.camera.fov = nextFOV;
      this.camera.updateProjectionMatrix();
    }
  }
  
  panoramaRender = function(){
    var now = new Date().getTime();
    if(now - this.lastMoveTime > IDLE_TIME){
      this.wandering = true;
    }else{
      this.wandering = false;
    }
    var target = new THREE.Vector3(0.0, 0.0, 0.0);
    var phi = this.viewPhi.getValue();
    var theta = this.viewTheta;
    target.x = 500.0 * Math.sin(THREE.Math.degToRad(90.0 - phi))* Math.cos(THREE.Math.degToRad(theta));
    target.y = 500.0 * Math.cos(THREE.Math.degToRad(90.0 - phi));
    target.z = 500.0 * Math.sin(THREE.Math.degToRad(90.0 - phi))* Math.sin(THREE.Math.degToRad(theta));

    this.camera.target = target;
    this.camera.lookAt(target);
    this.render(this.scene, this.camera);
  }

  changeSize = function(width, height){
    this.camera.aspect = width/height;
    this.camera.updateProjectionMatrix();
    this.setSize(width, height);
  }

  createArrow = function(anchor){

    var room = new THREE.Object3D;
    room.position.x = 100.0 * Math.sin(THREE.Math.degToRad(90.0 - anchor.phi))* Math.cos(THREE.Math.degToRad(anchor.theta));
    room.position.y = 100.0 * Math.cos(THREE.Math.degToRad(90.0 - anchor.phi));
    room.position.z = 100.0 * Math.sin(THREE.Math.degToRad(90.0 - anchor.phi))* Math.sin(THREE.Math.degToRad(anchor.theta));

    var arrow;
    if(anchor.direction == "LEFT"){
      arrow = '←';
    }else{
      arrow = '→';
    }
    const roomDiv = document.createElement('button');
    roomDiv.style.background = "None";
    roomDiv.style.border = "None";
    roomDiv.style.outline = "None";
    roomDiv.style.cursor = "pointer";
    roomDiv.style.textAlign = "center";
    roomDiv.innerHTML = anchor.name+"<br>"+arrow;
    roomDiv.style.marginTop = '-1em';
    roomDiv.style.fontWeight = "normal";
    roomDiv.style.font = "25px Calibri";
    roomDiv.style.textShadow="0px 0px 7px #000000";
    roomDiv.style.color = "white";
    let gotoRoom = function(){
      this.setScene(config.scene[anchor.target])
    }.bind(this);
    roomDiv.onclick =  gotoRoom;
    roomDiv.addEventListener("touchend", gotoRoom, false);
    var roomLabel = new CSS2DObject(roomDiv);
    roomLabel.position.set(0, 0, 0);

    room.add(roomLabel);

    return room;
  }

  updateLastMove = function(){
    this.lastMoveTime = new Date().getTime();
  }
}



export {PanoramaRenderer}

