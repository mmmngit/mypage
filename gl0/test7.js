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
                    position=[0.0,0.0,0.0], vector=[0.0,0.0,0.0],scale=[1.0,1.0,1.0],rotate=[0.0,0.0,0.0],rotangle=0.0) {
            this.Vpos = Vposition;
            this.Vcol = Vcolor;
            this.Vindex = Vindex;
            //console.log(this.pos);

            this.posVbo = createVbo(this.Vpos);
            this.colVbo = createVbo(this.Vcol);
            this.Ibo = createIbo(this.Vindex);

            this.pos = position;
            this.vec = vector;
            this.rot = rotate;
            this.ang = rotangle;
            this.sca = scale;

            this.vis = true;
        }
        visible(flag){
            this.vis=flag;
        }
        move(sp){
            this.pos = addArray(this.pos,this.vec.map(x=>x*sp));
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
        setVector(vector){
            switch(Object.prototype.toString.call(vector)){
                case "[object Array]":
                    this.vec = vector;
                    break;
                default:
                    this.vec = [0.0,0.0,0.0];
                    break;
            }
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
                //gl.drawElements(gl.LINE_LOOP, this.index.length, gl.UNSIGNED_SHORT, 0);
                //console.log("a");
            }
        }
    }

    class Car extends Object{
        constructor(a) {
            super(a);
          }
    }
    var c = document.getElementById('t7');
    c.width = w;
    c.height = h;

    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(5.0);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vSource = [
        "attribute vec3 position;\
        uniform mat4 modelviewpMatrix;\
        attribute vec4 color;\
        varying vec4 vColor;\
        void main(void) {\
            vColor=color;\
            gl_Position = modelviewpMatrix*vec4(position, 1.0);\
        }"
    ].join("\n");
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    var fSource = [
        "precision mediump float;\
        varying vec4 vColor;\
        void main(void) {\
            gl_FragColor = vColor;\
        }"
    ].join("\n");
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
        -0.1, 0.0,0.1,
         0.1, 0.0,0.1,
         0.0, 0.2,0.1,
         0.0,0.05,0.1
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
        1.0,1.0,1.0,1.0,
        1.0,1.0,1.0,1.0
    ];
    stageVind=[
        0,1,8, 0,8,11,
        2,3,9, 2,9,8,
        4,5,10,4,10,9,
        6,7,11,6,11,10,
        8,9,10,8,10,11
    ]

    var yabazoneVpos=[
        -1.5, 3.0,0.0,//0
        -1.5, 2.0,0.0,//1
        -1.5, 1.0,0.0,//2
        -1.5, 0.0,0.0,//3
        -1.5,-1.0,0.0,//4
        -1.5,-2.0,0.0,//5
        -1.5,-3.0,0.0,//6
        
         1.5,-3.0,0.0,//7
         1.5,-2.0,0.0,//8
         1.5,-1.0,0.0,//9
         1.5, 0.0,0.0,//10
         1.5, 1.0,0.0,//11
         1.5, 2.0,0.0,//12
         1.5, 3.0,0.0 //13
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
    
    var stage = new Object(stageVpos,stageVcol,stageVind,attLocation,attStride,[-1.5,0.0,0.0]);
    var yabazone = new Object(yabazoneVpos,yabazoneVcol,yabazoneVind,attLocation,attStride,[3.0,0.0,0.0]);

    
    var m = new matIV();
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

    var f=30;
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
        var t=0;
        var cars = [];
        var carnum=75;
        for(var i=0;i<carnum;i++){
            cars[i]=new Object(carVpos0,carVCol0,carVInd0,attLocation,attStride,[i/7-4.25,0,0],);
            //cars[i].visible(false);
            cars[i].setScale(1.5);
            cars[i].setRotate(i*7);
            cars[i].setVColor([Math.random(),Math.random(),Math.random(),1]);
        }
        
        loop();
        function loop(){
            gl.clearColor(0, 0, 0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            stage.draw(program,vMatrix,pMatrix);
            yabazone.draw(program,vMatrix,pMatrix);
        

            for(var i=0;i<carnum;i++){
                cars[i].setRotate(i*7+(750*Math.sin(t*Math.PI/180)));
                cars[i].draw(program,vMatrix,pMatrix);
            }

            gl.flush(); 
            t++;
            setTimeout(loop, f*100/1000);
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
