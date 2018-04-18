class Vec {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  //These are properties of the vector:
  // you can access them like variables.
  // (for example, "avector.magSquared")
  get magSquared(){
    return this.x*this.x + this.y*this.y;
  }
  get mag(){
    return Math.sqrt(this.magSquared);
  }
  get norm(){
    return this.mul(1/this.mag)
  }

  //These return new vectors without modifying this one.
  add(vec){
    return new Vec(this.x+vec.x,this.y+vec.y);
  }
  sub(vec){
    return new Vec(this.x-vec.x,this.y-vec.y);
  }
  mul(scalar){
    return new Vec(this.x*scalar,this.y*scalar);
  }
  div(scalar){
    return new Vec(this.x/scalar,this.y/scalar);
  }

  //These modify the vector in-place.
  translate(vec){
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }
  scale(scalar){
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

}

class Body {
  constructor(stage,mass,pos,vel){
    this.stage = stage;
    this.image = new createjs.Bitmap(
      "img/base.png"
    );
    this.stage.addChild(this.image);

    this.image.scaleX = Math.max(0.05*Math.log(mass+1),0.02);
    this.image.scaleY = Math.max(0.05*Math.log(mass+1),0.02);
    this.image.regX = this.image.image.width/2;
    this.image.regY = this.image.image.height/2;
    this.mass = mass;
    this.pos = pos;
    this.vel = vel;
    this.move();
  }

  move() {
    this.pos.translate(this.vel);
    this.image.x = this.pos.x;
    this.image.y = this.pos.y;
  }

}

//This function is called when the page is finished loading.
// See: <body onload="init()"> in orbit.html
function init(){
  console.log("Everything loaded."); //This is how you print in javascript.

  //When introducing a new variable in javascript, use "let".
  // The older alternative, "var" does essentially the same thing...
  // but within var lurks some very strange, old, unexpected behavior.
  let G = 10; //gravitational constant
  let bodies = []; //gravitating bodies

  let canvas = document.getElementById("gameCanvas");
  let stage = new createjs.Stage(canvas);
  bodies.push( new Body(stage,100,new Vec(50,150),new Vec(0,0)) );
  bodies.push( new Body(stage,10,new Vec(50,50),new Vec(3,0)) );

  function mainloop(){
    //First, let the browser know to call this same function again in 1/60s.
    window.requestAnimationFrame(mainloop);

    //calculate gravitation
    for (let i=0; i<bodies.length; i++){
      for (let j=i+1; j<bodies.length; j++){
        //vector from body j to body i
        let delta = bodies[i].pos.sub(bodies[j].pos)
        let rsquared = delta.magSquared;
        let mass_i = bodies[i].mass;
        let mass_j = bodies[j].mass;

        //Change gravity if below minrad
        let minrad = Math.max(0.05*Math.log(mass_i+1),0.02)*100 +
                     Math.max(0.05*Math.log(mass_j+1),0.02)*100
        if (minrad*minrad > rsquared){
          rsquared = minrad*minrad;
          //break;
        }

        let intermediate = delta.norm.scale(G/rsquared);

        bodies[i].vel.translate(
          intermediate.mul(-mass_j)
        );
        bodies[j].vel.translate(
          intermediate.mul(mass_i)
        );
      }
    }

    for (let body of bodies){
      body.move();
    }

    if (Math.random() < 0.01){
      bodies.push( new Body(stage,0.3,new Vec(500,Math.random()*300),new Vec(-Math.random()*3,0)) );
    }

    stage.update();
    //console.log(b.image);
  }

  mainloop(); //call it once ourselves to start it all off
}
