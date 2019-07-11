window.addEventListener("load",function(){
    var h=300,w=300;
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
                    attLocation,attStride,
                    position=[0.0,0.0,0.0], vector=[0.0,0.0,0.0],scale=[1.0,1.0,1.0],rotate=[0.0,0.0,0.0],rotangle=0.0) {
            this.pos = Vposition;
            this.col = Vcolor;
            this.index = Vindex;

            this.posVbo = createVbo(this.pos);
            this.colVbo = createVbo(this.col);
            this.Ibo = createIbo(this.index);

            setAttribute([this.posVbo,this.colVbo],attLocation,attStride);

            this.pos = position;
            this.vec = vector;
            this.rot = rotate;
            this.sca = scale;
            this.ang = rotangle;
        }
        
        move(sp){
            this.pos = addArray(this.pos,this.vec.map(x=>x*sp));
        }
        draw(program,vMatrix,pMatrix){
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

            gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
            //gl.drawElements(gl.LINE_LOOP, this.index.length, gl.UNSIGNED_SHORT, 0);
            //console.log("a");
        }
    }

    class Car extends Object{
        constructor(a) {
            super(a);
          }
    }
    var c = document.getElementById('t6');
    c.width = w;
    c.height = h;
    
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(5.0);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
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
        -0.1,0.0,0.0,
        0.1,0.0,0.0,
        0.0,0.2,0.0,
        0.0,0.05,0.0
    ];
    var carVCol0=[
        1,0,0,1,
        1,0,0,1,
        1,0,0,1,
        1,0,0,1
    ];
    var carVCol1=[
        1,1,0,1,
        1,1,0,1,
        1,1,0,1,
        1,1,0,1
    ];
    var carVInd0=[
        1,3,2,
        2,3,0
    ];
    var carVInd1=[
        0,3,2,
        2,3,1
    ];

    var m = new matIV();
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

    var car = new Object(carVpos0,carVCol0,carVInd0,attLocation,attStride);
    car.draw(program,vMatrix,pMatrix);

    var car2 = new Object(carVpos0,carVCol1,carVInd0,attLocation,attStride,[0.0,0.0,0.0],[1.0,1.0,0.0],[1.0,1.0,1.0],[0.0,0.0,1.0],Math.PI);

    car2.draw(program,vMatrix,pMatrix);

    gl.flush();
    var t=0,f=30;
    game();

    function game(){
        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        car.draw(program,vMatrix,pMatrix);

        car2.move(0.01*Math.sin(t*Math.PI/180));
        car2.draw(program,vMatrix,pMatrix);
        t++;
        setTimeout(game, f/1000);
    }

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
        for(var i in a){
            t[i]=a[i]+b[i];
        }
        return t;
    }
    
})
