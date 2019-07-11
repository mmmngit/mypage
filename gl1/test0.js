// global
var c, cw, ch, mx, my, gl, run=1;
var startTime;
var time = 0.0;
var tempTime = 0.0;
var fps = 30;
var uniLocation = new Array();

// onload
window.addEventListener("load",()=>{
    // canvas エレメントを取得
    c = document.getElementById('t0');
    
    // canvas サイズ
    // cw = 512; ch = 512;
    // c.width = cw; c.height = ch;
    
    // イベントリスナー登録
     c.addEventListener('mousemove',(e)=>{
                                        mx = e.offsetX / cw;
                                        my = e.offsetY / ch;
                                    }, true);
    /*c.addEventListener('mouseover',()=>{run=1});
    c.addEventListener('mouseout',()=>{run=0}); */

    // WebGL コンテキストを取得
    gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var vSource = [`
        attribute vec3 position;
        void main(void){
            gl_Position = vec4(position, 1.0);
        }
    `].join("\n");
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    var fSource = [`
        precision mediump float;
        uniform float time;
        uniform vec2  mouse;
        uniform vec2  resolution;

        void main(void){
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            vec4 color = vec4(mouse[0],mouse[1],time,1.0);

            gl_FragColor = color;
        }
    `].join("\n");
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(fShader));

    
    // シェーダ周りの初期化
    var program = gl.createProgram();
    gl.attachShader(program,vShader);
    gl.attachShader(program,fShader);
    gl.linkProgram(program);
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){gl.useProgram(program);}else console.log(gl.getProgramInfoLog(program));
    
    uniLocation[0] = gl.getUniformLocation(program, 'time');
    uniLocation[1] = gl.getUniformLocation(program, 'mouse');
    uniLocation[2] = gl.getUniformLocation(program, 'resolution');
    
    // 頂点データ回りの初期化
    var position0 = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    var posVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position0), gl.STATIC_DRAW);
    var posAttribute0 = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute0);
    gl.vertexAttribPointer(posAttribute0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var index0 = [
        0, 2, 1,
        1, 2, 3
    ];
    var indexVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index0), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    
    // その他の初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    mx = 0.5; my = 0.5;
    startTime = new Date().getTime();
    
    // レンダリング関数呼出
    render();

    function render(){
        // フラグチェック
        if(!run)return 0;
        
        // 時間管理
        time = (new Date().getTime() - startTime) * 0.001;
        
        // カラーバッファをクリア
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // uniform 関連
        gl.uniform1f(uniLocation[0], 0.5*(Math.sin(time)+1));
        gl.uniform2fv(uniLocation[1], [mx, my]);
        gl.uniform2fv(uniLocation[2], [cw, ch]);
        
        // 描画
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        // 再帰

        console.log(mx,my);
        setTimeout(render, fps/1000);
    }
});