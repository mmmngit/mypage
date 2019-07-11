window.addEventListener("load",function(){
    let canvas;
    let gl
    let w=1000;h=1000;
    canvas=document.getElementById('GrayScott');
    canvas.width=w;//window.innerWidth*0.8;
    canvas.height=h;//window.innerHeight*0.8;
    
    gl=canvas.getContext('webgl');
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(5.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let vSource = [`
        attribute vec3 position;
        attribute vec4 color;
        uniform mat4 mvpMatrix;
        uniform vec3 vPos;

        varying vec3 v;
        varying vec4 c;
        void main(void) {
            c=color;
            v=vPos;
            gl_Position = mvpMatrix*vec4(position, 1.0);
        }
    `].join("\n");
    let vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    let fSource = [`
        precision mediump float;
        varying vec3 v;
        varying vec4 c;
        void main(void) {
            float x = gl_FragCoord.x-500.0+v.x;
            float y = gl_FragCoord.y-500.0+v.y;
            if(sqrt(x*x+y*y)<v.z){
                gl_FragColor = c;
            }
        }
    `].join("\n");
    let fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(fShader));
    
    let program = gl.createProgram();
    gl.attachShader(program,vShader);
    gl.attachShader(program,fShader);
    gl.linkProgram(program);
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){gl.useProgram(program);}else console.log(gl.getProgramInfoLog(program));
    
    const sqrt2=Math.sqrt(2);
    let position = [
         -1.0, 1.0, 0.0,
         -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
         1.0, 1.0, 0.0
    ];
    let posVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

    let posAttribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute);
    gl.vertexAttribPointer(posAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let color=[
        0.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
    ];
    let colVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colVbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);

    let colAttribute = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colAttribute);
    gl.vertexAttribPointer(colAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let vPos=[ 10.0,10.0,10.0 ];
    // let bo = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER,bo);
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vPos),gl.STATIC_DRAW);

    let bute = gl.getUniformLocation(program, 'vPos');
    gl.uniform3f(bute,10.0,10.0,10.0);
    //gl.vertexUniformPointer(bute, 3, gl.FLOAT, false, 0, 0);

    var m = new matIV();
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    m.lookAt([0.0, 0.0, 1.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);
    var uniLocation = gl.getUniformLocation(program, 'mvpMatrix');
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length/3);

    gl.flush();

    let t=0;
    let sin = function t(q){return Math.sin(q);};
    let cos = function t(q){return Math.cos(q);};
    loop1();
    function loop1(){
        //console.log(t);
        m.identity(mMatrix);
        
        m.rotate(mMatrix,-t,[0.0,0.0,1.0],mMatrix);
        m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix);
        m.scale(mMatrix,[1.0,1.0,1.0],mMatrix);

        
        m.multiply(pMatrix, vMatrix, mvpMatrix);
        m.multiply(mvpMatrix, mMatrix, mvpMatrix);
        var uniLocation = gl.getUniformLocation(program, 'mvpMatrix');
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

        let bute = gl.getUniformLocation(program, 'vPos');
        gl.uniform3f(bute,250*sin(1*t)+cos(2*t),250*cos(1*t)+cos(2*t),50+25*sin(1*t));

        t+=0.01;
        setTimeout(loop1, 10);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length/3);
        gl.flush();
    }
});


