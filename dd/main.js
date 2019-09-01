window.addEventListener("load",function(){
    var h=400,w=600;
    var f=1;    
    var mouse = function(){
        var x=0,y=0;
        var vec=[0,0];
        this.norm=function(){
            return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]);
        }
    }
    var m = new mouse();

    class Object{
        constructor(Vposition=[0.0,0.0,0.0], Vcolor=[0.0,0.0,0.0,1.0] ,Vindex=[0],
                    attLocation,attStride,//なぜかないと動かない
                    position=[0.0,0.0,0.0], vector=[0.0,0.0,0.0],scale=[1.0,1.0,1.0],rotAxis=[0.0,0.0,1.0],rotAngle=0.0) {
            this.Vpos = Vposition;
            this.Vcol = Vcolor;
            this.Vindex = Vindex;
            //console.log(this.pos);

            this.posVbo = createVbo(this.Vpos);
            this.colVbo = createVbo(this.Vcol);
            this.Ibo = createIbo(this.Vindex);

            this.pos = position;
            this.vec = vector;
            this.rot = rotAxis;
            this.ang = rotAngle;
            this.sca = scale;

            this.spd = Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]);
            this.dir = Math.atan2(vector[1],vector[0]);
            this.vis = true;
            this.mov = true;
        }
        setVPosition(position){
            switch(Object.prototype.toString.call(position)){
                case "[object Array]":
                    this.Vpos = position;
                    break;
                default:
                    this.Vpos = [1.0,1.0,1.0];
                    break;
            }
            this.posVbo = createVbo(this.Vpos);
        }
        setVColor(color){
            switch(Object.prototype.toString.call(color)){
                case "[object Array]":
                    var t = new Array(this.Vcol.length);
                    if(color.length==this.Vcol.length){
                        this.Vcol=color;
                    }else if(color.length==4){
                        for(var i=0;i<this.Vcol.length;i++){
                            t[i]=color[i%4];
                        }
                        this.Vcol = t;
                    }
                    break;
                default:
                    break;
            }
            this.colVbo = createVbo(this.Vcol);
        }
        setPosition(position){
            switch(Object.prototype.toString.call(position)){
                case "[object Array]":
                    this.pos = position;
                    break;
                default:
                    this.pos = [1.0,1.0,1.0];
                    break;
            }
        }
        setVector(vector,sp=1){
            switch(Object.prototype.toString.call(vector)){
                case "[object Array]":
                    this.vec = vector.map(e=>e*sp);
                    break;
                default:
                    this.vec = [0.0,0.0,0.0];
                    break;
            }
            this.spd = sp*Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]);
        }
        setRotate(rotAngle,rotAxis=[0.0,0.0,1.0]){
            this.rot = rotAxis;
            this.ang = rotAngle*Math.PI/180;
        }
        setScale(scale){
            switch(Object.prototype.toString.call(scale)){
                case "[object Array]":
                    this.sca = scale;
                    break;
                case "[object Number]":
                    this.sca = [scale,scale,scale];
                    break;
                default:
                    this.sca = [1.0,1.0,1.0];
                    break;
            }
        }

        visible(flag){
            this.vis=flag;
        }
        movable(flag){
            this.mov=flag;
        }
        move(sp){
            if(this.mov)
            this.pos = addArray(this.pos,this.vec.map(x=>x*sp));
        }
        draw(program,vMatrix,pMatrix){
            if(this.vis){
                setAttribute([this.posVbo,this.colVbo],attLocation,attStride);

                var m = new matIV();
                var mMatrix = m.identity(m.create());
                var rmatrix = m.identity(m.create());
                var mvpMatrix = m.identity(m.create());

                m.identity(mMatrix);
                
                m.translate(mMatrix, this.pos, mMatrix);
                m.rotate(mMatrix,this.ang,this.rot,mMatrix);
                m.scale(mMatrix,this.sca,mMatrix);

                m.multiply(pMatrix, vMatrix, mvpMatrix);
                m.multiply(mvpMatrix, mMatrix, mvpMatrix);
                var uniLocation = gl.getUniformLocation(program, 'modelviewpMatrix');
                gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.Ibo);

                gl.drawElements(gl.TRIANGLES, this.Vindex.length, gl.UNSIGNED_SHORT, 0);
                //gl.drawElements(gl.LINES, this.Vindex.length, gl.UNSIGNED_SHORT, 0);
                //console.log("a");
            }
        }
    }

    class Car extends Object{
        turn(radius){
            //A*omega=V
            this.ang = radius/this.spd;
        }
        setSide(side){
            this.toSide=side;
        }
        setColor(color){
            this.col=color;
        }
    }

    class sidebar extends Object{
        constructor(Vposition=[0.0,0.0,0.0], Vcolor=[0.0,0.0,0.0,1.0] ,Vindex=[0],
            attLocation,attStride,//なぜかないと動かない
            position=[0.0,0.0,0.0], vector=[0.0,0.0,0.0],scale=[1.0,1.0,1.0],rotAxis=[0.0,0.0,1.0],rotAngle=0.0) {
            super(Vposition,Vcolor,Vindex,attLocation,attStride,position,vector,scale,rotAxis,rotAngle);
            this.unt=[];
            this.col=4;
            this.pnt=0;
        }
        setColor(color){
            this.col=color;
            switch(color){
                case 0:
                    this.setSidecolor([1.0,0.0,0.0,1.0]);
                    break;
                case 1:
                    this.setSidecolor([0.0,1.0,0.0,1.0]);
                    break;
                case 2:
                    this.setSidecolor([0.0,0.0,1.0,1.0]);
                    break;
                case 3:
                    //this.setSidecolor([0.0,0.0,0.0,1.0]);
                    break;
                default:
                    break;

            }
        }
        setSidecolor(color){
            this.Vcol=[
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                1.0,1.0,1.0,1.0,
                color[0],color[1],color[2],color[3],
                color[0],color[1],color[2],color[3]
            ];
            this.colVbo = createVbo(this.Vcol);
        }
        sidebars(Unit){
            this.unt=Unit;
        }
        addUnit(Unit){
            this.unt+=Unit;
        }
        setPoint(point=this.point+1){
            this.pnt=point;
        }
        setCount(count=0.0){
            if(this.cntF){
            this.cnt=count;
                if(this.cnt>300)this.cnt=300;else
                if(this.cnt<0)this.cnt=0;
            }
            switch(this.toSide){
                case 0:
                    this.setPosition([-1.5,3.0-this.cnt/100,0.0])//[-1.5,0.44*this.cnt,0.0]);
                    break;
                case 1:
                    this.setPosition([-1.5-(3.0-this.cnt/100),0.0,0.0]);
                    break;
                case 2:
                    this.setPosition([-1.5,0-(3.0-this.cnt/100),0.0]);
                    break;
                case 3:
                    this.setPosition([-1.5+(3.0-this.cnt/100),0.0,0.0]);
                    break;
                default:
                    break;
            }
        }
        countStart(flag){
            this.cntF=flag;
        }
        setSide(side){
            this.toSide=side;
        }
    }
    var canvas = document.getElementById('c');
    canvas.width = w;
    canvas.height = h;
    var gl = canvas.getContext('webgl',{preserveDrawingBuffer: true}) || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(5.0);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vSource = [`
        attribute vec3 position;
        uniform mat4 modelviewpMatrix;
        attribute vec4 color;
        varying vec4 vColor;
        void main(void) {
            vColor=color;
            gl_Position = modelviewpMatrix*vec4(position, 1.0);
        }
    `].join("\n");
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    var fSource = [`
        precision mediump float;
        varying vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `].join("\n");
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(fShader));
    
    var program = gl.createProgram();
    gl.attachShader(program,vShader);
    gl.attachShader(program,fShader);
    gl.linkProgram(program);
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){gl.useProgram(program);}else console.log(gl.getProgramInfoLog(program));

    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(program, 'position');
    attLocation[1] = gl.getAttribLocation(program, 'color');

    var attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;

    var carVpos0=[
        -0.1, 0.0,0.01,
         0.1, 0.0,0.01,
         0.0, 0.2,0.01,
         0.0,0.05,0.01
    ];
    var carVCol0=[
        1,0,0,1,
        1,0,0,1,
        1,0,0,1,
        1,0,0,1
    ];
    var carVInd0=[
        2,3,1,
        0,3,2
    ];

    var stageVpos=[
         0.5, 3.0, 0.0,//0
        -0.5, 3.0, 0.0,//1

        -3.0, 0.5, 0.0,//2
        -3.0,-0.5, 0.0,//3

        -0.5,-3.0, 0.0,//4
         0.5,-3.0, 0.0,//5

         3.0,-0.5, 0.0,//6
         3.0, 0.5, 0.0,//7

        -0.5, 0.5, 0.0,//8
        -0.5,-0.5, 0.0,//9
         0.5,-0.5, 0.0,//10
         0.5, 0.5, 0.0 //11
    ];
    var stageVcol=[
        1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0
    ];
    stageVind=[
        0,1,8, 0,8,11,
        2,3,9, 2,9,8,
        4,5,10,4,10,9,
        6,7,11,6,11,10,
        8,9,10,8,10,11
    ]

    var yabazoneVpos=[
        -1.5, 3.0,0.02,//0
        -1.5, 2.0,0.02,//1
        -1.5, 1.0,0.02,//2
        -1.5, 0.0,0.02,//3
        -1.5,-1.0,0.02,//4
        -1.5,-2.0,0.02,//5
        -1.5,-3.0,0.02,//6
      
         1.5,-3.0,0.02,//7
         1.5,-2.0,0.02,//8
         1.5,-1.0,0.02,//9
         1.5, 0.0,0.02,//10
         1.5, 1.0,0.02,//11
         1.5, 2.0,0.02,//12
         1.5, 3.0,0.02 //13
    ];
    var yabazoneVcol=[
        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0,

        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,0.0,1.0
    ];
    var yabazoneVind=[
        0,1,13, 1,12,13,
        1,2,12, 2,11,12,
        2,3,11, 3,10,11,
        3,4,10, 4,9,10,
        4,5,9,  5,8,9,
        5,6,8,  6,7,8
    ];

    var sidebarVpos=[
         0.5, 3.0, 0.005, //0
        -0.5, 3.0, 0.005, //1
         0.5, 2.5, 0.005, //2
        -0.5, 2.5, 0.005, //3
         0.5, 2.0, 0.005, //4
        -0.5, 2.0, 0.005, //5
         0.5, 1.5, 0.005, //6
        -0.5, 1.5, 0.005, //7
         0.5, 1.0, 0.005, //8
        -0.5, 1.0, 0.005, //9
         0.5, 0.5, 0.005, //10
        -0.5, 0.5, 0.005, //11
    ];
    var sidebarVcol=[
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
    ];
    var sidebarVind=[
        1,2,0, 1,3,2,
        3,4,2, 3,5,4,
        5,6,4, 5,7,6,
        7,8,6, 7,9,8,

        9,10,8, 9,11,8
    ];
    
    var stage = new Object(stageVpos,stageVcol,stageVind,attLocation,attStride,[-1.5,0.0,0.0]);
    var yabazone = new Object(yabazoneVpos,yabazoneVcol,yabazoneVind,attLocation,attStride,[3.0,0.0,0.0]);
    

    var m = new matIV();
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

    var frameRate=30;
    //main();
    game();

    function main(){
        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        
        t++;
        setTimeout(main, f/1000);
    }

    function menu(){

    }

    function game(){
        var count=0;
        var level=0;
        var cars = [];
        const c={red:[1.0,0.0,0.0,1.0],green:[0.0,1.0,0.0,1.0],blue:[0.2,0.2,0.9,1.0],black:[0.0,0.0,0.0,1.0],white:[1.0,1.0,1.0,1.0]};
        const carnum=75;

        const startP=[[-1.25,3.2,0.0],[-4.7,0.23,0.0],[-1.7,-3.2,0.0],[1.7,-0.23,0.0]];
        const startR=[180,-90,0,90]
        const startV=[[0.0,-1.0,0.0],[1.0,0.0,0.0],[0.0,1.0,0.0],[-1.0,0.0,0.0]];
        const startC=c;

        var queue=[];
        var outburnF=0;
        var outburnCount=0;

        for(var i=0;i<carnum;i++){
            cars[i]=new Car(carVpos0,carVCol0,carVInd0,attLocation,attStride,[4.0,0,0],);
            cars[i].setScale(1.5);
        }
        var side=4;
        var sidebars = [
            new sidebar(sidebarVpos,sidebarVcol,sidebarVind,attLocation,attStride,[-1.5,0.0,0.0]),
            new sidebar(sidebarVpos,sidebarVcol,sidebarVind,attLocation,attStride,[-1.5,0.0,0.0],[0.0,0.0,0.0],[1.0,1.0,1.0],[0.0,0.0,1.0],Math.PI/2),
            new sidebar(sidebarVpos,sidebarVcol,sidebarVind,attLocation,attStride,[-1.5,0.0,0.0],[0.0,0.0,0.0],[1.0,1.0,1.0],[0.0,0.0,1.0],Math.PI),
            new sidebar(sidebarVpos,sidebarVcol,sidebarVind,attLocation,attStride,[-1.5,0.0,0.0],[0.0,0.0,0.0],[1.0,1.0,1.0],[0.0,0.0,1.0],Math.PI*3/2)
        ];
        for(var i=0;i<4;i++){
            sidebars[i].setSide(i);
            sidebars[i].setCount(0);
            sidebars[i].countStart(0);
        }

        document.addEventListener("keydown",(e)=>{
            if(e.keyCode==38||e.keyCode==87){
                side=0;
                //console.log("up");
            }
            if(e.keyCode==37||e.keyCode==65){
                side=1;
                //console.log("left");
            }
            if(e.keyCode==40||e.keyCode==83){
                side=2;
                //console.log("down");
            }
            if(e.keyCode==39||e.keyCode==68){
                side=3;
                //console.log("right");
            }
        });
        document.addEventListener("keyup",(e)=>{
            side=4;
            //console.log("kup");
        });

        frameRate=60;

        loop();
        function loop(){
            gl.clearColor(0, 0, 0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            stage.draw(program,vMatrix,pMatrix);
            yabazone.draw(program,vMatrix,pMatrix);
            for(var i=0;i<4;i++){
                sidebars[i].draw(program,vMatrix,pMatrix);
            }

            if(queue.length>0){
                if(count%100==0){
                    setCarSide(queue[0][0],cars[level],1);
                    setCarColor(cars[level],queue[0][1]);
                    queue.shift();
                    level+=1;
                    level%=64;
                }
            }else if(count%100==0){
                randCarSide(cars[level],1);
                randCarColor(cars[level],2);
                level+=1;
                level%=carnum;
            }
            if(count%10==0){
                for(var i=0;i<4;i++){
                    sidebars[i].setCount(sidebars[i].cnt-1);
                    if(sidebars[i].cnt<=0)delSide(i);
                }
            }
            for(var i=0;i<carnum;i++){
                turn(cars[i]);
                arrive(cars[i],i);
                cars[i].move(0.01);
                cars[i].draw(program,vMatrix,pMatrix);
            }

            document.form.score.value=sidebars[0].pnt+","+sidebars[1].pnt+","+sidebars[2].pnt+","+sidebars[3].pnt;
            gl.flush();
            count++;
            //console.log(count);
            //console.log(sidebars[0].col);
            //console.log(sidebars)
            setTimeout(loop, frameRate/1000);
        }

        function setCarRV(sideNum,car,sp=1){
            if(sideNum>3)return;
            car.setRotate(startR[(sideNum+2)%4]);
            car.setVector(startV[(sideNum+2)%4],sp);
        }
        function setCarSide(sideNum,car,sp=1){
            if(sideNum>3)return;
            car.setSide((sideNum+2)%4);
            car.setPosition(startP[sideNum]);
            car.setRotate(startR[sideNum]);
            car.setVector(startV[sideNum],sp);
        }
        function setCarColor(car,color){
            switch(color){
                case 0:
                    car.setColor(0);
                    car.setVColor(c.red);
                    break;
                case 1:
                    car.setColor(1);
                    car.setVColor(c.green);
                    break;
                case 2:
                    car.setColor(2);
                    car.setVColor(c.blue);
                    break;
                case 3:
                    car.setColor(3);
                    car.setVColor(c.black);
                    break;
                default:
                    car.setColor(4);
                    car.setVColor(c.white);
                    break;
            }
        }
        function randCarSide(car,sp=1){
            var side = getRandomInt(3);
            setCarSide(side,car,sp);
        }
        function randCarColor(car,cnum){
            switch(getRandomInt(cnum)){
                case 0:
                    car.setColor(0);
                    car.setVColor(c.red);
                    break;
                case 1:
                    car.setColor(1);
                    car.setVColor(c.green);
                    break;
                case 2:
                    car.setColor(2);
                    car.setVColor(c.blue);
                    break;
                case 3:
                    car.setColor(3);
                    car.setVColor(c.black);
                    break;
                default:
                    car.setColor(4);
                    car.setVColor(c.white);
                    break;
            }
        }
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max+1));
        }
        function turn(car){
            var s = car.toSide-side;
            if(car.toSide==5){

            }else if(s==0||side==4||s==2||s==-2){
                if(car.pos[1]>-0.24&&car.pos[1]<0.24&&car.pos[0]<-1.20&&car.pos[0]>-1.75){
                    car.toSide=4;
                }
            }else if(s==-1||s==3){//left
                switch(car.toSide){
                    case 0:
                        if(car.pos[1]>-0.25&&car.pos[1]<0){
                            setCarRV(1,car,car.spd);
                            car.setPosition([-1.70,-0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 1:
                        if(car.pos[0]<-1.25&&car.pos[0]>-1.5){
                            setCarRV(2,car,car.spd);
                            car.setPosition([-1.25,-0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 2:
                        if(car.pos[1]<0.25&&car.pos[1]>0){
                            setCarRV(3,car,car.spd);
                            car.setPosition([-1.25,0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 3:
                        if(car.pos[0]>-1.75&&car.pos[0]<-1.5){
                            setCarRV(0,car,car.spd);
                            car.setPosition([-1.70,0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    default:
                        break;
                }
            }else if(s==1||s==-3){//right
                switch(car.toSide){
                    case 0:
                        if(car.pos[1]<0.25&&car.pos[1]>0){
                            setCarRV(3,car,car.spd);
                            car.setPosition([-1.70,0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 1:
                        if(car.pos[0]>-1.75&&car.pos[0]<-1.5){
                            setCarRV(0,car,car.spd);
                            car.setPosition([-1.70,-0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 2:
                        if(car.pos[1]>-0.25&&car.pos[1]<0){
                            setCarRV(1,car,car.spd);
                            car.setPosition([-1.25,-0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    case 3:
                        if(car.pos[0]<-1.25&&car.pos[0]>-1.5){
                            setCarRV(2,car,car.spd);
                            car.setPosition([-1.25,0.23,0.0]);
                            car.toSide=4;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        function arrive(car,index){
            if(car.toSide==4){
                if(car.pos[1]>2.5-sidebars[0].unt.length/5){
                    car.toSide=5;
                    car.setPosition([-1.70,2.5-sidebars[0].unt.length/5,0.0]);
                    car.movable(false);
                    sidebars[0].unt.push(index);
                    sideCalc(car,index,0);
                }
                if(car.pos[0]<-4.0+sidebars[1].unt.length/5){
                    car.toSide=5;
                    car.setPosition([-4.0+sidebars[1].unt.length/5,-0.23,0.0]);
                    car.movable(false);
                    sidebars[1].unt.push(index);
                    sideCalc(car,index,1);
                }
                if(car.pos[1]<-2.5+sidebars[2].unt.length/5){
                    car.toSide=5;
                    car.setPosition([-1.25,-2.5+sidebars[2].unt.length/5,0.0]);
                    car.movable(false);
                    sidebars[2].unt.push(index);
                    sideCalc(car,index,2);
                }
                if(car.pos[0]>1.0-sidebars[3].unt.length/5){
                    car.toSide=5;
                    car.setPosition([1.0-sidebars[3].unt.length/5,0.23,0.0]);
                    car.movable(false);
                    sidebars[3].unt.push(index);
                    sideCalc(car,index,3);
                }
            }
        }
        function sideCalc(car,index,sideNum){
            if(outburnF){

            }else{
                if(sidebars[sideNum].col!=4){
                    if(sidebars[sideNum].col!=car.col){
                        sidebars[sideNum].setColor(car.col);
                        sidebars[sideNum].setCount(0);
                        sidebars[sideNum].countStart(0);
                        cars[index].setSide(4);
                        cars[index].movable(true);
                        sidebars[sideNum].unt.pop();
                        sidebars[sideNum].unt.map(e=>{
                            addQueue(cars[e],sideNum);
                            cars[e].movable(true);
                        });
                        sidebars[sideNum].unt=[];
                        for(var i=0;i<4;i++){
                            if(sidebars[i].pnt!=0&&i!=sideNum)
                            sidebars[i].pnt+=sidebars[sideNum].pnt;
                        }
                        sidebars[sideNum].pnt=0;
                    }
                }else{
                    if(sidebars[sideNum].cntF)sidebars[sideNum].setCount(300);
                    sidebars[sideNum].setColor(car.col);
                }

                if(sidebars[sideNum].unt.length>4){
                    sidebars[sideNum].unt.map(e=>{
                        cars[e].movable(true);
                    });
                    sidebars[sideNum].unt=[];
                    sidebars[sideNum].pnt++;
                    sidebars[sideNum].countStart(1);
                    sidebars[sideNum].setCount(300);
                    sidebars[sideNum].setColor(car.col);
                }
            }
        }
        function delSide(sideNum){
            sidebars[sideNum].setColor(4);
            for(var i=0;i<4;i++){
                if(sidebars[i].pnt!=0&&i!=sideNum)
                sidebars[i].pnt+=sidebars[sideNum].pnt;
            }
            sidebars[sideNum].pnt=0;
        }
        function addQueue(car,sideNum){
            queue.push(new Array(2));
            queue[queue.length-1][0]=sideNum;
            queue[queue.length-1][1]=car.col;
        }
    }


    ////////////////////////////////////////////////////////////////////////////////

    function createVbo(data){
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }
    function createIbo(data){
        var ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    function setAttribute(vbo, attLocation, attStride){
        for(var i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attLocation[i]);
            gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    function addArray(a,b){
        var t=new Array(a.length);
        for(var i=0;i<a.length;i++){
            t[i]=a[i]+b[i];
        }
        return t;
    }
    
})
