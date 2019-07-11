window.addEventListener("load",function(){
    var h=300,w=300;
    var mouse = function(){
        var x=0,y=0;
        var vec=[0,0];
        this.norm=function(){
            return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]);
        }
    }

    var c = document.getElementById('t1');
    c.width = w;
    c.height = h;
    c.addEventListener("mouseover", function(e){
        f=0;
        var rect = e.target.getBoundingClientRect();
        tx = e.clientX - rect.left;
        ty = e.clientY - rect.top;
        m.vec=[tx-m.x,ty-m.y];
        m.x=tx;m.y=ty;
    });
    c.addEventListener("mousemove", function(e){
        f=1;
        var rect = e.target.getBoundingClientRect();
        tx = e.clientX - rect.left;
        ty = e.clientY - rect.top;
        m.vec=[tx-m.x,ty-m.y];
        m.x=tx;m.y=ty;
        console.log(m.x);
    });
    c.addEventListener("mouseout", function(){
        f=0;
    });

    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    c.addEventListener("mouseover",()=>{f=1;});
    c.addEventListener("mouseout",()=>{f=0;});
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
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
            float a = gl_FragCoord.x / 512.0;
            gl_FragColor = vec4(vec3(a), 1.0);
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
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        gl.useProgram(program);
    }else console.log(gl.getProgramInfoLog(program));

    var position=[
        1,1,0,
        -1,1,0,
        1,-1,0,
        -1,-1,0,
    ];
    var posVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    var posAttribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute);
    gl.vertexAttribPointer(posAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var color=[
        1,0,0,1,
        0,1,0,1,
        0,0,1,1,
        0,0,0,1,
    ];
    var colVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    var colAttribute = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colAttribute);
    gl.vertexAttribPointer(colAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var m = new matIV();
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    // モデル座標変換行列
    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, -3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // プロジェクション座標変換行列
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);
    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(program, 'modelviewpMatrix');
    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, position.length/3);
    gl.flush();
})