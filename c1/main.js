class vec2d{
    constructor(x,y){
        this.type="vec2d";
        if(x.type=="DenseMatrix"){
            this.m=x;
            this.set();
        }else{
            this.x=x;
            this.y=y;
            this.m=math.matrix([x,y]);
        }
    }
    add(vec){
        return new vec2d(math.add(this.m,vec.m));
    }
    mul(vec){
        if(vec instanceof vec2d){
            return new vec2d(math.multiply(this.m,vec.m));
        }else{
            return new vec2d(math.multiply(this.m,vec));
        }
    }

    abs(){
        return math.abs(this.m);
    }
    set(vec){
        if(typeof vec==="undefined"){
            this.x=this.m.get([0]);
            this.y=this.m.get([1]);
            //console.log("un")
        }else if(vec.type==="DenseMatrix"){
            this.x=vec.get([0]);
            this.y=vec.get([1]);
            this.m=math.matrix([x,y]);
            //console.log("dm")
        }else if(vec.type==="vec2d"){
            this.x=vec.x;
            this.y=vec.y;
            this.m=vec.m;
            //console.log("vec")
        }
    }
    norm(){
        return math.norm(this.m);
    }
    unit(){
        let t=math.norm(this.m)==0?1:math.norm(this.m);
        return  new vec2d(this.x/t,this.y/t);
    }
    dist(vec){
        return math.chain(this.m).subtract(vec.m).norm().done();
    }
    toVec(vec){
        return new vec2d(math.subtract(this.m,vec.m));
    }
}

class Ball{
    constructor(point,vec,color,radius,ctx){
        this.type="Ball";
        this.point=point;
        this.vec=vec;
        this.color=color;
        this.r=radius;
        this.ctx=ctx;
    }
    draw(){
        this.ctx.beginPath();
        this.ctx.fillStyle=this.color;
        this.ctx.arc(this.point.x,this.point.y,this.r,0,2*math.pi);
        this.ctx.fill();
        this.ctx.closePath();
    }
    move(speed=1){
        this.point.set(this.point.add(this.vec));
    }
    dist(point){
        if(point instanceof vec2d){
            return this.point.dist(point);
        }else if(point instanceof Ball){
            return this.point.dist(point.point);
        }
        return 0;
    }
    toVec(point){
        if(point.type==="vec2d"){
            return this.point.toVec(point);
        }else if(point.type==="Ball"){
            return this.point.toVec(point.point);
        }
        return 0;
    }
    setvec(vec){
        this.vec=vec;
    }
}

function getMousePosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

window.addEventListener("load",function(){
    let canvas;
    let ctx;
    let m=new vec2d(500,500);
    let balls=new Array;
    let moveF=0;
    let mouseF=0;

    canvas=document.getElementById('c');
    if(canvas.getContext)ctx=canvas.getContext('2d');
    canvas.width=1000;//window.innerWidth*0.8;
    canvas.height=1000;//window.innerHeight*0.8;

    canvas.addEventListener('mousemove',evt=>{
        if(mouseF){
            let t = getMousePosition(canvas, evt);
            m.set(new vec2d(t.x,t.y));
            
        }
    }, false);
    canvas.addEventListener('mousedown',evt=>{}, false);
    
    document.getElementById("mode").addEventListener('change',mode, false);
    document.getElementById("start").addEventListener('click',start, false);
    document.getElementById("kesu").addEventListener('click',reset, false);
    document.getElementById("t1").addEventListener('click',t1, false);

    function mode(){
        console.log("aa")
        let a=document.getElementById("mode").m.value;

        if(a==="mouse"){
            mouseF=1;
        }else if(a==="const"){
            mouseF=0;
            let x = document.getElementById('mode').mx.value;
            let y = document.getElementById('mode').my.value;
            m.set(new vec2d(x?x:0,y?y:0));
        }
    }
    function start(){
        if(moveF){
            moveF=0;
            document.getElementById('start').value="start";
        }else{
            moveF=1;
            document.getElementById('start').value="stop";
        };
    }
    function reset(){
        balls=[];
    }
    function t1(){
        let N=document.getElementById('operate').N.value;
        m.x=500;m.y=500;
        for(let i=0;i<N*N;i++){
            balls.push(new Ball(new vec2d(i%N*900/N+50+450/N,Math.floor(i/N)*900/N+50+450/N),new vec2d(0,0),"#ffffff",2,ctx));
        }
    }


    setInterval(loop, 60/1000);
    function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(obj of balls){
            obj.draw();
            if(moveF){
                obj.setvec(obj.vec.add(m.toVec(obj.point).unit().mul(0.05)));
                obj.move();
            }
        }
    }
});


