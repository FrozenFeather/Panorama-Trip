import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {
    CSS2DObject, CSS2DRenderer
 } from 'https://threejs.org/examples/jsm/renderers/CSS2DRenderer.js';
import { PanoramaRenderer } from './renderer.js'
import { Animator } from './animation.js'
import { config } from "../config.js";

var renderer;

// Control
const HORIZONTAL_MOVE_RATE = 0.2
const VERTICAL_MOVE_RATE = 0.4

// mode
var mode = "normal";

// control
var mousePressed = false;
var mousePos = new THREE.Vector2(0.0, 0.0);
var viewPhi = new Animator(0.0);
viewPhi.setConstraint(-90.0, 90.0);

// TOP mode
var TOP_POSY = 100;
var MAX_POSY = 120;
var MIN_POSY = 50;
var TOP_FOV = 120;
var MAX_FOV = 150;
var MIN_FOV = 50;

// animation
var posY = new Animator(0);
var fov = new Animator(75);

var currentScene = 0;

function init(){

  // 3D canvas
  var canvas = document.getElementById('myCanvas');
  canvas.width = window.innerWidth*0.8;
  canvas.height = window.innerHeight*0.8;

  renderer = new PanoramaRenderer({canvas});
  renderer.setScene(config.scene[currentScene]);

  // A 2d canvas on top
  var canvas2d = document.createElement('canvas');
  canvas2d.style.position = "absolute";
  canvas2d.width = canvas.width;
  canvas2d.height = canvas.height;
  canvas2d.style.left = canvas.offsetLeft + "px";
  canvas2d.style.top = canvas.offsetTop + "px";

  var ctx = canvas2d.getContext("2d");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "50px Calibri";
  ctx.fillStyle = "red"
  ctx.fillText('+', canvas2d.width/2, canvas2d.height/2);
  document.body.appendChild(canvas2d);

  var positionLabel = document.getElementById("positionLabel");
  positionLabel.innerHTML = "𝜃 = 0.00°, 𝜑 = 0.00°"

  // Event Listener
  canvas2d.addEventListener("pointerdown",onPointerDown, false);
  canvas2d.addEventListener("pointermove",onPointerMove, false);
  canvas2d.addEventListener("pointerup",onPointerUp, false);
  canvas2d.addEventListener("pointerleave",onPointerUp, false);

  document.getElementById("prevScene").addEventListener("click", prevScene);
  document.getElementById("nextScene").addEventListener("click", nextScene);
  document.getElementById("toggleView").addEventListener("click", toggleView);
  

  var adjustPanel = document.getElementById("adjustPanel");
  var topPanel = document.createElement("div");
  topPanel.id = "topPanel";
  topPanel.appendChild(createSlider("Position Y : ", TOP_POSY, MIN_POSY, MAX_POSY, function(value){
    renderer.positionY.hop(parseInt(value));
  }));
  topPanel.appendChild(createSlider("Field Of View : ", TOP_FOV, MIN_FOV, MAX_FOV, function(value){
    renderer.fov.hop(parseInt(value));
  }));
  topPanel.hidden = true;
  adjustPanel.appendChild(topPanel);
}

function createSlider(name, value, min, max, callback){
  var sliderDiv = document.createElement("div");
  var sliderLabel = document.createElement("label");
  sliderLabel.innerHTML = name;
  sliderDiv.appendChild(sliderLabel);
  var slider = document.createElement("input");
  slider.type = "range";
  slider.value = value
  slider.max = max
  slider.min = min
  sliderDiv.appendChild(slider);
  var sliderValue = document.createElement("label");
  sliderValue.innerHTML = value;
  sliderDiv.appendChild(sliderValue);
  slider.addEventListener("input", function(e){
    sliderValue.innerHTML = e.target.value;
    callback(e.target.value);
  });
  return sliderDiv;
}
  

function toggleView(){
  var btn = document.getElementById("toggleView");
  var adjustPanel = document.getElementById("adjustPanel");
  if(mode == "normal"){
    renderer.positionY.hop(TOP_POSY);
    renderer.fov.hop(TOP_FOV);
    renderer.viewPhi.hop(-90.0);
    mode = "top";
    btn.innerHTML = "normal";
    document.getElementById("topPanel").hidden = false;
  }else if(mode == "top"){
    renderer.positionY.setTarget(0);
    renderer.fov.setTarget(75);
    renderer.viewPhi.setTarget(0.0);
    mode = "normal";
    document.getElementById("topPanel").hidden = true;
    btn.innerHTML = "top";
  }
}
// Control Event

// Control Event
var evCache = [];
var prevDiff = -1;
function onPointerDown(ev){
  ev.preventDefault();
  evCache.push(ev);
  if(evCache.length == 1){
    mousePressed = true;
  }
  mousePos.x = ev.clientX;
  mousePos.y = ev.clientY;
}
function onPointerMove(ev){
  ev.preventDefault();
  for (var i = 0; i < evCache.length; i++) {
    if (ev.pointerId == evCache[i].pointerId) {
      evCache[i] = ev;
      break;
    }
  }
  if(mousePressed && evCache.length == 1){
    var thetaOffset = - HORIZONTAL_MOVE_RATE * (ev.clientX - mousePos.x);
    var phiOffset = VERTICAL_MOVE_RATE * (ev.clientY - mousePos.y);
    if (mode == "top") phiOffset = 0;
    if(renderer.loaded){
      renderer.addPhiThetaOffset(phiOffset, thetaOffset);
    }
    mousePos.x = ev.clientX;
    mousePos.y = ev.clientY;

    var positionLabel = document.getElementById("positionLabel");
    positionLabel.innerHTML = "𝜃 = "+renderer.viewTheta.toFixed(2)+"°, 𝜑 = "+renderer.viewPhi.getValue().toFixed(2)+"°";
  }
  if (evCache.length == 2) {
    var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);
    if (prevDiff > 0) {
      if (curDiff > prevDiff) {
        renderer.camera.zoom += 0.05;
        if(renderer.camera.zoom >= 4) renderer.camera.zoom = 4;
      }
      if (curDiff < prevDiff) {
        renderer.camera.zoom -= 0.0;
        if(renderer.camera.zoom <= 1) renderer.camera.zoom = 1;
      }
      renderer.camera.updateProjectionMatrix();
    }
    prevDiff = curDiff;
  }
}
function onPointerUp(ev){
  ev.preventDefault();
  for (var i = 0; i < evCache.length; i++) {
    if (evCache[i].pointerId == ev.pointerId) {
      evCache.splice(i, 1);
      break;
    }
  }
  mousePressed = false;
}


function prevScene(){
  currentScene -= 1;
  if(currentScene < 0){
    currentScene += config.scene.length;
  }
  renderer.setScene(config.scene[currentScene])
}
function nextScene(){
  currentScene += 1;
  if(currentScene >= config.scene.length){
    currentScene -= config.scene.length;
  }
  renderer.setScene(config.scene[currentScene])
}

function animate() {
    requestAnimationFrame(animate);
    if(renderer != null){
      renderer.updateLastMove();
      if(renderer.loaded) renderer.nextFrame();
      renderer.panoramaRender();
    }
}

init();
animate();