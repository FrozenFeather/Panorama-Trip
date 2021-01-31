import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { CSS2DRenderer } from 'https://threejs.org/examples/jsm/renderers/CSS2DRenderer.js';
import { PanoramaRenderer } from './renderer.js'
import { config } from "../config.js";

// Parameters

// Control
const HORIZONTAL_MOVE_RATE = 0.2
const VERTICAL_MOVE_RATE = 0.4

// Variables
var renderer;
var labelRenderer;

// control
var mousePressed = false;
var mousePos = new THREE.Vector2(0.0, 0.0);

var currentScene = config.scene[0];

function init(){
  var canvas = document.getElementById('myCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  renderer = new PanoramaRenderer({canvas});
  renderer.loadingPrompt = document.getElementById("loadingPrompt");
  renderer.setScene(currentScene);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( canvas.width, canvas.height );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.zIndex = 0;
  document.body.appendChild( labelRenderer.domElement );

  // loadingPrompt

  window.addEventListener("resize", function(){
    renderer.changeSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  })

  // Event Listener
  labelRenderer.domElement.addEventListener("pointerdown",onPointerDown, false);
  labelRenderer.domElement.addEventListener("pointermove",onPointerMove, false);
  labelRenderer.domElement.addEventListener("pointerup",onPointerUp, false);
  labelRenderer.domElement.addEventListener("pointerleave",onPointerUp, false);

  var sceneBtn = document.getElementById("sceneBtn");
  sceneBtn.onclick = function(e){
    document.getElementById("scene-selector").hidden = !document.getElementById("scene-selector").hidden;
  }

  var sceneSelector = document.getElementById("scene-selector");
  for(var scene of config.scene){
    var anchor = document.createElement("a");
    var thumbnail = document.createElement("img");
    thumbnail.src = "img/thumbnail/" + scene.image;
    thumbnail.height = window.innerHeight * 0.12;
    anchor.appendChild(thumbnail);
    var descpLabel = document.createElement("p");
    descpLabel.innerHTML = scene.name;
    descpLabel.style.color = "white";
    descpLabel.style.margin = "0px";
    anchor.appendChild(descpLabel);
    var jumpScene = function(){
      renderer.setScene(this);
    }.bind(scene);
    anchor.addEventListener("click", jumpScene);
    sceneSelector.appendChild(anchor);
  }
}

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
  renderer.updateLastMove();
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
    if(renderer.loaded){
      renderer.addPhiThetaOffset(phiOffset, thetaOffset);
    }
    mousePos.x = ev.clientX;
    mousePos.y = ev.clientY;
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
  if(evCache.length > 0)
    renderer.updateLastMove();
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
  renderer.updateLastMove();
}

function animate() {
    requestAnimationFrame(animate);
    if(renderer != null){
      if(renderer.loaded) renderer.nextFrame();
      renderer.panoramaRender();
      labelRenderer.render(renderer.scene, renderer.camera );
    }
}

init();
animate();