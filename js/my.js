function irand(max,min=0){
    return Math.floor( Math.random() * (max + 1 - min) ) + min;
}
function logb(x, y) {
    return Math.log(y) / Math.log(x);
}
function isString(obj) {
    return typeof (obj) == "string" || obj instanceof String;
}
function isArray(obj){
    return typeof (obj) == "Array" || obj instanceof Array;
}

class GLObject{
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