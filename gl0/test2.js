window.addEventListener("load",function(){
    var h=300,w=300;
    var f=0;    
    var mouse = function(){
        var x=0,y=0;
        var vec=[0,0];
        this.norm=function(){
            return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]);
        }
    }
    var m = new mouse();

    var c = document.getElementById('t2');
    c.width = w;
    c.height = h;

    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    c.addEventListener("mouseover",()=>{f=1;});
    c.addEventListener("mouseout",()=>{f=0;});
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
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

    var position0=[
        -0.5,-0.5,-0.5,
        -0.5,-0.5,0.5,
        0.5,-0.5,0.5,
        0.5,-0.5,-0.5,
        0.5,0.5,-0.5,
        0.5,0.5,0.5,
        -0.5,0.5,0.5,
        -0.5,0.5,-0.5,
        0,1,0,
        Math.sqrt(3)/2,0.5,0,
        Math.sqrt(3)/2,-0.5,0,
        0,-1,0,
        -Math.sqrt(3)/2,-0.5,0,
        -Math.sqrt(3)/2,0.5,0,
        0,0,0
    ];
    var posVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position0), gl.STATIC_DRAW);
    var posAttribute0 = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute0);
    gl.vertexAttribPointer(posAttribute0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var color0=[
        0,0,0,1,
        1,0,0,1,
        0,1,0,1,
        0,0,1,1,
        1,1,0,1,
        0,1,1,1,
        1,0,1,1,
        1,1,1,1,

        1,0,0,1,
        0,1,0,1,
        0,0,1,1,
        1,1,0,1,
        0,1,1,1,
        1,0,1,1,
        1,1,1,1
    ];
    var colVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colVbo0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color0), gl.STATIC_DRAW);
    var colAttribute0 = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colAttribute0);
    gl.vertexAttribPointer(colAttribute0, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* var index0=[
        0,1,2, 0,3,2,
        2,3,4, 2,5,4,
        4,5,6, 4,7,6,
        1,2,5, 1,6,5,
        0,3,4, 0,7,4,
        0,1,6, 0,7,6
    ]; */
    var index0=[
        2,1,0, 2,3,0,
        4,3,2, 4,5,2,
        6,5,4, 6,7,4,
        5,2,1, 5,6,1,
        4,3,0, 4,7,0,
        6,1,0, 6,7,0
    ];
    var indexVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index0), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

/*     var position1=[
        0,1,0,
        Math.sqrt(3)/2,0.5,0,
        Math.sqrt(3)/2,-0.5,0,
        0,-1,0,
        -Math.sqrt(3)/2,-0.5,0,
        -Math.sqrt(3)/2,0.5,0,
        0,0,0
    ];
    var posVbo1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position1), gl.STATIC_DRAW);
    var posAttribute1 = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute1);
    gl.vertexAttribPointer(posAttribute1, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); */

    var color1=[
        1,0,0,1,
        0,1,0,1,
        0,0,1,1,
        1,1,0,1,
        0,1,1,1,
        1,0,1,1,
        1,1,1,1
    ];
    var colVbo1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colVbo1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color1), gl.STATIC_DRAW);
    var colAttribute1 = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colAttribute1);
    gl.vertexAttribPointer(colAttribute1, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var index1=[
        6,0,1,
        6,1,2,
        6,2,3,
        6,3,4,
        6,4,5,
        6,5,0
    ];
    index1 = index1.map((t)=>{ return t+8});
    console.log(index1);
    var indexVbo1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index1), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    var m = new matIV();
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var rmatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());

    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // プロジェクション座標変換行列
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

    loop1();
    var t=0;
    function loop1(){
        if(f){
            gl.clearColor(0, 0, 0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            var r = function t(){return Math.random();};

            // モデル座標変換行列
            m.identity(mMatrix);
            m.rotate(mMatrix,-t,[0.0,t,0.0],mMatrix);
            m.translate(mMatrix, [-1.2, 0.0, 0.0], mMatrix);
            m.rotate(mMatrix,-t,[1.0,1.5,2.0],mMatrix);
            m.scale(mMatrix,[1.5,1.5,1.5],mMatrix);
            // 各行列を掛け合わせ座標変換行列を完成させる
            m.multiply(pMatrix, vMatrix, mvpMatrix);
            m.multiply(mvpMatrix, mMatrix, mvpMatrix);
            // uniformLocationの取得
            var uniLocation = gl.getUniformLocation(program, 'modelviewpMatrix');
            // uniformLocationへ座標変換行列を登録
            gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
            var color0=[
                Math.cos(t)/2+0.5,Math.cos(2*t)/2+0.5,Math.cos(3*t)/2+0.5,1,
                Math.cos(t+Math.PI*1/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*1/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*1/3)/2+0.5,1,
                Math.cos(t+Math.PI*2/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*2/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*2/3)/2+0.5,1,
                Math.cos(t+Math.PI*3/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*3/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*3/3)/2+0.5,1,
                Math.cos(t+Math.PI*4/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*4/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*4/3)/2+0.5,1,
                Math.cos(t+Math.PI*5/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*5/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*5/3)/2+0.5,1,
                Math.cos(t+Math.PI*4/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*4/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*4/3)/2+0.5,1,
                Math.cos(t+Math.PI*5/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*5/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*5/3)/2+0.5,1,
                
                Math.cos(t)/2+0.5,Math.cos(2*t)/2+0.5,Math.cos(3*t)/2+0.5,1,
                Math.cos(t+Math.PI*1/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*1/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*1/3)/2+0.5,1,
                Math.cos(t+Math.PI*2/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*2/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*2/3)/2+0.5,1,
                Math.cos(t+Math.PI*3/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*3/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*3/3)/2+0.5,1,
                Math.cos(t+Math.PI*4/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*4/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*4/3)/2+0.5,1,
                Math.cos(t+Math.PI*5/3)/2+0.5,Math.cos(Math.PI*t+Math.PI*5/3)/2+0.5,Math.cos(Math.LN2*t+Math.PI*5/3)/2+0.5,1,
                1,1,1,1
            ];
            var colVbo0 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colVbo0);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color0), gl.STATIC_DRAW);
            var colAttribute0 = gl.getAttribLocation(program, 'color');
            gl.enableVertexAttribArray(colAttribute0);
            gl.vertexAttribPointer(colAttribute0, 4, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
            gl.drawElements(gl.TRIANGLES, index0.length, gl.UNSIGNED_SHORT, 0);
            
            // モデル座標変換行列
            m.identity(mMatrix);
            m.rotate(mMatrix,-t,[0.0,t,0],mMatrix);
            m.translate(mMatrix, [1.5, 0.0, 0.5*Math.abs(2*Math.cos(t))], mMatrix);
            m.rotate(mMatrix,t,[0.0,1.0,0.0],mMatrix);
            // 各行列を掛け合わせ座標変換行列を完成させる
            m.multiply(pMatrix, vMatrix, mvpMatrix);
            m.multiply(mvpMatrix, mMatrix, mvpMatrix);
            // uniformLocationの取得
            var uniLocation = gl.getUniformLocation(program, 'modelviewpMatrix');
            // uniformLocationへ座標変換行列を登録
            gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo1);
            gl.drawElements(gl.TRIANGLES, index1.length, gl.UNSIGNED_SHORT, 0);

            gl.flush();
        }
        t+=Math.PI/270;
        setTimeout(loop1, 10);
    }
})