// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global createCanvas, colorMode, HSB, width, height, random, background, fill, color, random,
          rect, ellipse, VIDEO, stroke, image, loadImage, collideCircleCircle, collideRectCircle, text, 
          mouseX, createCapture, mouseY, strokeWeight, line, mouseIsPressed, windowWidth, windowHeight, noStroke, 
          keyCode, UP_ARROW, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, textSize, keyIsDown
          collideRectRect, ml5, noFill, quad, key, constrain, lerpColor, lerp */

const VIDEO_WIDTH = 100;
const Mode = {
  MANUAL: "m",
  VOICE: "vo",
  VIDEO: "vi",
  NEUTRAL: "n"
};
const WIN_DISTANCE = 250;
let mode;
let phone,
  hand,
  handImg,
  phoneCaught,
  eelImg,
  phoneImg,
  fishImg,
  coralImg,
  obstacles,
  eels,
  coral,
  isTouching,
  phoneBattery,
  phoneDistance,
  gameOver,
  gameWon,
  interA,
  // interA is the starting shade of the background
  interB,
  // interB is the ending shade of the background
  amt,
  amt1,
  // amt is a value between 0 and 1, in this case 0 is interA and 1 is interB
  classifier,
  videoModel =
    "https://teachablemachine.withgoogle.com/models/RFKIJ7OF8/model.json", // A's model
  // "https://teachablemachine.withgoogle.com/models/RFKIJ7OF8/model.json" // C's model 2
  // "https://teachablemachine.withgoogle.com/models/Sf1YhGPut/model.json", // A's model
  // "https://teachablemachine.withgoogle.com/models/xYUW4O6_N/model.json", // M's model (doesn't really work)

  video,
  flippedVideo,
  voiceModel = "SpeechCommands18w";
// https://teachablemachine.withgoogle.com/models/mSIboje_v/model.json (sound model)

function setup() {
  createCanvas(800, 700);
  colorMode(HSB, 360, 100, 100);
  handImg = loadImage(
    "https://cdn.glitch.com/4c9f593d-d67e-40fc-87c0-3ff8b0a74677%2Fhand%20.png?v=1596062035797"
  );

  eelImg = loadImage(
    "https://cdn.glitch.com/4c9f593d-d67e-40fc-87c0-3ff8b0a74677%2Feelfinal.png?v=1596058892619"
  );
  phoneImg = loadImage(
    "https://cdn.glitch.com/3b91ed42-3b0a-4c85-a629-bff40f36c4d9%2FPhone.png?v=1596048444405"
  );
  fishImg = loadImage(
    "https://cdn.glitch.com/3b91ed42-3b0a-4c85-a629-bff40f36c4d9%2Ffish%20copy.png?v=1596048446510"
  );

  coralImg = loadImage(
    "https://cdn.glitch.com/94510671-4b08-4c84-95e1-c02ffa34bf62%2F5-56570_seaweed-coral-coralreefs-coralreef-sea-ocean-coral-reef.png?v=1596183071554"
  );

  mode = Mode.NEUTRAL;
  restart();
  interA = color(170, 45, 85);
  interB = color(225, 45, 40);
  //                "https://cdn.glitch.com/94510671-4b08-4c84-95e1-c02ffa34bf62%2F5-56570_seaweed-coral-coralreefs-coralreef-sea-ocean-coral-reef.png?v=1596183071554"

  mode = Mode.NEUTRAL;
  restart();
  interA = color(170, 45, 85);
  interB = color(225, 45, 40);
  // amt = 0.1;
  // amt1 = 0.1;
  phone = new rectPhone();
  hand = new Hand();
}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResultVideo);
  flippedVideo.remove();
}

/// MIHAI NOTE: I separated the result functions for video and voice
/// because with voice we want to jump a lot (50 pixels) because it's slow
/// and a little with video because we're able to analyze so many frames.

// Callback for video and voice classifiers
function gotResultVoice(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  console.log(
    "got voice classification result: " + results[0].label,
    results[0].confidence
  );

  if (results[0].label == "left" && gameOver === false) {
    phone.x -= 50;
  } else if (results[0].label == "right" && gameOver === false) {
    phone.x += 50;
  }
}
function gotResultVideo(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  console.log(
    "got video classification result: " + results[0].label,
    results[0].confidence
  );

  if (results[0].label == "left" && gameOver === false) {
    phone.x -= 5;
  } else if (results[0].label == "right" && gameOver === false) {
    phone.x += 5;
  }

  classifyVideo();
}

function keyTyped() {
  if (keyCode === 13) {
    mode = Mode.NEUTRAL;
  } else {
    switch (key) {
      case "1":
        mode = Mode.MANUAL;
        break;
      case "2":
        mode = Mode.VOICE;
        let options = { probabilityThreshold: 0.85 };
        classifier = ml5.soundClassifier(voiceModel, options);
        classifier.classify(gotResultVoice);
        break;
      case "3":
        mode = Mode.VIDEO;
        classifier = ml5.imageClassifier(videoModel);
        video = createCapture(VIDEO);
        video.size(VIDEO_WIDTH, 0.75 * VIDEO_WIDTH);
        video.hide();
        flippedVideo = ml5.flipImage(video);
        classifyVideo();
        break;
    }
  }
}

function draw() {
  background(85);
  if (mode === Mode.NEUTRAL) {
    let s = "YES!! - your human👨 has dropped you, try to escape his reach and make it to the bottom of the lake to live in peace!😃 Watch out for the fish🐟 too, they're out to get ya! Watch your charge🔋 - if you run out of juice, that's the end of it! Hit the electric eels to get a boost!⚡"
    textSize(20);
    fill(0);
   
    text(s, width * 0.25, height * 0.15, width * 0.5, height * 0.5)
    
    
    text(
      `
  Press 1 to play with manual control
  -Use left and right Arrow Key
  
  Press 2 to play with voice control
  -Say left and right to move the phone

  Press 3 to play with your webcam
  -Point to the left or right to move (to change to 
  picture mode you need to change the video model link
  to Aaradyah's model)

  Press ENTER to pause the game at
  anytime to change your game control`,
      width * 0.25,
      height * 0.45
    );
  } else {
    // Includes all other modes: manual, voice, and video
    gradientBackground();
    displayInfo();
    gameCondition();
    hand.display();
    phone.display();
    hand.followingPhone();
    hand.phoneIsCaught();
    for (let i = 0; i < coral.length; i++) {
      coral[i].display();
      coral[i].CoralMoving();
    }

    if (mode === Mode.MANUAL) {
      phone.manualMovement();
    }
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].display();
      obstacles[i].obstaclesDropping();
      obstacles[i].checkCollision();
    }
    for (let i = 0; i < eels.length; i++) {
      eels[i].display();
      eels[i].EelsDropping();
      eels[i].checkCollision();
    }

    /// MIHAI NOTE: I added this here so we can see the video feed
    if (mode === Mode.VIDEO) {
      // Draw the video
      image(flippedVideo, 0, height - 100);
    }
  }
}

class rectPhone {
  constructor() {
    this.x = width * 0.5;
    this.y = height * 0.75;
    this.w = 35;
    this.h = 60;
  }

  display() {
    image(phoneImg, this.x, this.y, this.w, this.h);
    this.y = lerp(height * 0.75, height * 0.5, amt);
    this.x = constrain(phone.x, 0, width - this.w);
    // console.log(this.y);
    // console.log(this.x);
  }

  manualMovement() {
    if (gameOver === false) {
      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        this.x -= 5;
      } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        this.x += 5;
      }
    }
  }
}
class Obstacles {
  constructor() {
    this.x = random(360, 440);
    this.w = 25;
    this.h = 35;
    this.y = 0;
    this.yVelocity = random(2, 4) + 10 * getLevel();
    this.xVelocity = random(-1, 1);
    this.wIncrement = 0.25;
    this.hIncrement = 0.25;
  }

  obstaclesDropping() {
    if (gameOver === false) {
      this.y += this.yVelocity;
      this.x += this.xVelocity;
      if (this.y > height + this.h / 2) {
        this.w = 25;
        this.h = 35;
        this.y = random(-15, -50);
        this.x = random(width * 0.45, width * 0.55);
        this.xVelocity = random(-1, 1);
      }
    }
  }
  checkCollision() {
    if (gameOver === false) {
      isTouching = collideRectRect(
        phone.x,
        phone.y,
        phone.w,
        phone.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
      if (isTouching) {
        hand.y -= 10;
        //this.y = phone.y + (height - phone.y) * (phone.battery/100)
        this.x = random(width * 0.45, width * 0.55);
        this.y = 0 - this.h;
        this.w = 25;
        this.h = 35;
        // console.log("hit");
        phoneBattery -= 5;
      }
    }
  }

  display() {
    image(fishImg, this.x, this.y, this.w, this.h);
    if (gameOver === false) {
      if (this.w >= 105) {
        this.w * 1;
      }
      if (this.h >= 100) {
        this.h * 1;
      } else {
        this.w += this.wIncrement;
        this.h += this.hIncrement;
      }
    }
  }
}

class Eels {
  constructor() {
    this.x = random(360, 440);
    this.y = random(-100, -15);
    this.w = 6;
    this.h = 8;
    this.wIncrement = 0.3;
    this.hIncrement = 0.4;
    this.yVelocity = random(2, 4);
    this.xVelocity = random(-1, 1);
  }

  EelsDropping() {
    if (gameOver === false) {
      this.y += this.yVelocity;
      this.x += this.xVelocity;

      if (this.y > height + this.h) {
        this.x = random(360, 440);
        this.y = random(-100, -50);
        // console.log(this.y)
        this.yVelocity = random(2, 4);
        this.xVelocity = random(-1, 1);
        this.w = 6;
        this.h = 8;
      }
    }
  }

  checkCollision() {
    if (gameOver === false) {
      for (let i = 0; i < eels.length; i++) {
        isTouching = collideRectRect(
          this.x,
          this.y,
          this.w,
          this.h,
          phone.x,
          phone.y,
          phone.w,
          phone.h
        );
        if (isTouching) {
          eels[i].x = random(width * 0.45, width * 0.55);
          eels[i].y = random(-100, -50);
          eels[i].w = 6;
          eels[i].h = 8;
          eels[i].yVelocity = random(2, 4);
          eels[i].xVelocity = random(-1, 1);
          phoneBattery += 1;
        }
      }
    }
  }
  display() {
    image(eelImg, this.x, this.y, this.w, this.h);
    if (gameOver === false) {
      if (this.w >= 80 && this.h >= 90) {
        this.w * 1;
        this.h * 1;
      } else {
        this.w += this.wIncrement;
        this.h += this.hIncrement;
        // console.log(this.w, this.h);
      }
    }
  }
}

class Hand {
  constructor() {
    this.x = phone.x + 50;
    this.y = height - 20;
    this.w = 300;
    this.h = 450;
  }

  display() {
    image(handImg, this.x, this.y, this.w, this.h);
    this.y = lerp(height, height * 0.45, amt1);
    amt1 = constrain(getLevel() * 0.5, 0 , 1)
    
    console.log(amt1);
    console.log(this.y);
    // console.log(phone.x);
  }

  followingPhone() {
    this.x = phone.x - 35;
  }

  phoneIsCaught() {
    phoneCaught = collideRectRect(
      this.x,
      this.y,
      this.w,
      this.h,
      phone.x,
      phone.y,
      phone.w,
      phone.h
    );
    if (phoneCaught) {
      gameOver = true;
    }
  }
}

class Coral {
  constructor() {
    this.x = width * 0.25;
    this.y = height * 0.25;
    this.w = 3;
    this.h = 3;
    this.wIncrement = 0.25;
    this.hIncrement = 0.25;
    this.yVelocity = 2;
    this.xVelocity = -1;
  }
  display() {
    image(coralImg, this.x, this.y, this.w, this.h);
    if (gameOver === false) {
      if (this.w >= 30 || this.h >= 30) {
        this.w * 1;
        this.h * 1;
      } else {
        this.w += this.wIncrement;
        this.h += this.hIncrement;
      }
    }
  }
  CoralMoving() {
    if (gameOver === false) {
      this.x += this.xVelocity;
      this.y += this.yVelocity;

      if (this.x < 0 && this.y > height + this.h) {
        this.x = width * 0.25;
        this.y = height * 0.25;
        this.w = 3;
        this.h = 3;
        this.yVelocity = 2;
        this.xVelocity = -1;
      }
    }
  }
}

function restart() {
  obstacles = [];
  eels = [];
  coral = [];
  phoneBattery = 100;
  phoneDistance = 0;
  gameOver = false;
  for (let i = 0; i < 2; i++) {
    obstacles.push(new Obstacles());
  }
  for (let i = 0; i < 1; i++) {
    eels.push(new Eels());
  }
  for (let i = 0; i < 1; i++) {
    coral.push(new Coral());
  }
}

function gradientBackground() {
  background(lerpColor(interA, interB, amt));
  amt = constrain(phoneDistance / WIN_DISTANCE, 0, 1);
  // console.log(amt);
}

function displayInfo() {
  fill(60, 45, 80);
  rect(0, 0, 125, 45);
  fill(0);
  textSize(15);
  text(`Battery: ${phoneBattery}`, 10, 15);
  text(`Distance: ${Math.round(phoneDistance)}`, 10, 35);
  if (gameOver === false) {
    phoneDistance += 0.1;
  } else {
    phoneDistance * 1;
  }

  fill(25, 45, 45);
  rect(0, height * 0.3, width, height);

  fill(lerpColor(interA, interB, amt));
  quad(
    0,
    height,
    width * 0.45,
    height * 0.3,
    width * 0.55,
    height * 0.3,
    width,
    height
  );
}

function getLevel() {
  return phoneDistance / WIN_DISTANCE;
}

function gameCondition() {
 if (phoneBattery <= 0 || phoneDistance >= WIN_DISTANCE) {
    gameOver = true;
    textSize(20);
    fill(0);
    rect(width * 0.4, height * 0.4, 200, 150)
    fill(90)
    text(`Game Over!`, width * 0.43, height * 0.45);
    text(`Your battery: ${phoneBattery}`, width * 0.43, height * 0.5);
    text(
      `Your distance: ${Math.round(phoneDistance)}`,
      width * 0.43,
      height * 0.55
    );
    text(`Press R to restart`, width * 0.43, height * 0.6);
    if (keyCode === 82) {
      restart();
    }
  }
}
