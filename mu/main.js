chord={
    M:[0,4,7],
    m:[0,3,7],
    aug:[0,4,8],
    dim:[0,3,6],
    sus2:[0,2,7],
    sus4:[0,5,7],
    6:[0,4,7,9],
    m6:[0,3,7,9],
    M7:[0,4,7,11],
    mM7:[0,3,7,11],
    7:[0,4,7,10],
    m7:[0,3,7,10],
    aug7:[0,4,8,10],
    dim7:[0,3,6,9],
    "7sus4":[0,5,7,10],
    "m7-5":[0,3,6,10],
    add9:[0,2,4,7],
    9:[0,4,7,10,14],
    m9:[0,2,3,7,10]
}

class Note{//ノート部
    constructor(root,scales,length,symbols){
        this.root=isString(root)?this.rootParser(root):root;
        this.scales=isArray(scales)?1:scales;
        this.length=length;
        this.symbols=symbols;
    }
    static getFreq(root){
        if(isArray(root)){
            let t=root.map(x=>x=this.getFreq(x));
            return t;
        }else{
            let n;
            if(isString(root))n=this.getNum(root);else n=root;
            let t=440*Math.pow(2,(n-69)/12);
            return t;
        }
    }
    static getNum(root){
        if(isArray(root)){
            let t=root.map(x=>x=this.getNum(x));
            return t;
        }else{
            let t=root.toUpperCase().charCodeAt(0)-65;
            let n=root.slice(1);

            if(0>t||7<t)return 60;
            if(n[0]==="#"){
                t++;
                n=n.slice(1);
            }else if(n[0]==="♭"){
                t--;
                n=n.slice(1);
            }else if(+n!==+n){
                n=0;
            }
            if(!n)n=4;
            t+=+n*12+10;
            return t;
        }
    }
    static getPitchName(num){
        if(isArray(num)){
            let t=num.map(x=>x=this.getPitchName(x));
            return t;
        }else{
            let o=Math.floor(num/12)-1;
            let t=num%12;
            switch(t){
                case 0: t='C'; break;
                case 1: t='C#';break;
                case 2: t='D'; break;
                case 3: t='D#';break;
                case 4: t='E'; break;
                case 5: t='F'; break;
                case 6: t='F#';break;
                case 7: t='G'; break;
                case 8: t='G#';break;
                case 9: t='A'; break;
                case 10:t='A#';break;
                case 11:t='B'; break;
            }
            return t+o;
        }
    }

    static rand(max,min,fSharp,fChord){
        if(fChord){
            let t=this.rand(max,min,fSharp,0);
            let i=Object.keys(chord)[irand(Object.keys(chord).length,1)-1];
            let a=chord[i];
            return {node:a.map(x=>t.node+x),name:i};
        }else{
            let t=irand(max,min);
            let a=t%12;
            if(!fSharp)while(a<5&&a%2==1||a>5&&a%2==0){t=irand(max,min);a=t%12;};
            return {node:t,name:null};
        }
    }

    // chordGenerator(chord,root){

    //     if(isArray(chord)){
    //         return chord.map(x=>x+root);
    //     }else if(isString(chord)){
    //         switch(chord){
    //             case "M":
                    
    //             break;
    //             case "m":
    //             break;
    //             default:
    //             break;
    //         }
    //     }else{
    //         return ;
    //     }
    // }
    // view(){

    // }
}

// class Bar{//小setu操作部
//     constructor(){    
//     }
//     generator(notes,bpm,measure){
//         let bpm=bpm;//double
//         let measure=measure;//Str (ex."4/4","5/4")
//         let notes=notes;//Note[]

//     }
//     checker(notes,bpm,measure){
//         let len=0;
//     }
// }
// class Score{//譜面操作部
//     constructor(canvas){
//         this.canvas = canvas;
//         this.bars;//Bar[]
//     }

//     add(note){

//     }
// }

// class Piano{//鍵盤操作部
//     constructor(){
        
//     }
// }
// class Game{//総合部
//     constructor(){
//         this.mode;
//         this.Fscore;
//     }
// }

window.onerror = function(error) {
     alert(error);
};

window.addEventListener("load",function(){
    console.log("v. 0.2")
    let df=0;
    let key=new Array(256).fill(0);
    let canvas;
    let gl;
    let w=window.innerWidth*0.8;
    let h=w;
    let fSharp=0,fChord=0;
    let synth;
    let max=71,min=60;//83,36

    let ansField=this.document.getElementById("ans");
    let checkbox=this.document.getElementById("fSharp");
    let checkbox1=this.document.getElementById("fChord");
    let button=this.document.getElementById("dakyo");

    canvas=document.getElementById('canvas');
    canvas.width=w;
    canvas.height=h;

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
    
    canvas.addEventListener("click",init,false);
    button.addEventListener('click',init,false);
    document.addEventListener('keydown',init,false);
    
    function sound(chord){
        let n=chord.node;
        let f=Note.getFreq(n);
        let c=Note.getPitchName(n);
        console.log(n,c,f,chord.name);
        ansField.value="["+c+"]   "+(chord.name?chord.name:"");
        synth.triggerAttackRelease(c,'4n');
    }

    function imputKey(num,up=0){
        switch(num){
            case 32:
            !up?sound(Note.rand(max,min,fSharp,fChord)):null;
            break;
            case 90:
            !up?synth.triggerAttack("C4"):synth.triggerRelease("C4");
            break;
            case 83:
            !up?synth.triggerAttack("C#4"):synth.triggerRelease("C#4");
            break;
            case 88:
            !up?synth.triggerAttack("D4"):synth.triggerRelease("D4");
            break;
            case 68:
            !up?synth.triggerAttack("D#4"):synth.triggerRelease("D#4");
            break;
            case 67:
            !up?synth.triggerAttack("E4"):synth.triggerRelease("E4");
            break;
            case 86:
            !up?synth.triggerAttack("F4"):synth.triggerRelease("F4");
            break;
            case 71:
            !up?synth.triggerAttack("F#4"):synth.triggerRelease("F#4");
            break;
            case 66:
            !up?synth.triggerAttack("G4"):synth.triggerRelease("G4");
            break;
            case 72:
            !up?synth.triggerAttack("G#4"):synth.triggerRelease("G#4");
            break;
            case 78:
            !up?synth.triggerAttack("A4"):synth.triggerRelease("A4");
            break;
            case 74:
            !up?synth.triggerAttack("A#4"):synth.triggerRelease("A#4");
            break;
            case 77:
            !up?synth.triggerAttack("B4"):synth.triggerRelease("B4");
            break;
            case 188:
            !up?synth.triggerAttack("C5"):synth.triggerRelease("C5");
            break;
            case 190:
            !up?synth.triggerAttack("D5"):synth.triggerRelease("D5");
            break;
            case 187:
            !up?synth.triggerAttack("D#5"):synth.triggerRelease("D#5");
            break;
            case 191:
            !up?synth.triggerAttack("E5"):synth.triggerRelease("E5");
            break;
            case 186:
            !up?synth.triggerAttack("E#5"):synth.triggerRelease("E#5");
            break;
            case 226:
            !up?synth.triggerAttack("F5"):synth.triggerRelease("F5");
            break;
        }
        
    }

    function init() {
        button.removeEventListener('click', init, false);
        canvas.removeEventListener('click', init, false);
        document.removeEventListener('keydown', init, false);

        let request = new XMLHttpRequest();
        request.open('GET', 'https://unpkg.com/tone@13.4.9/build/Tone.js',true);
        request.onload = ()=>{
            if (request.readyState === 4) {
                if (request.status === 200) {
                    _init();
                } else {
                  console.error(xhr.statusText);
                }
            }
        }
        request.send(null);

        function _init(){
            let script = document.createElement('script');
            script.text = request.responseText;
            document.head.appendChild(script);

            synth = new Tone.PolySynth(6,Tone.Synth).toMaster();
            synth.set("detune", -1200);

            canvas.addEventListener("click",()=>{
                sound(Note.rand(max,min,fSharp,fChord));
            },false);

            button.addEventListener("click",()=>{
                sound(Note.rand(max,min,fSharp,fChord));
            });
            document.addEventListener('keydown', (e)=>{
                key[e.keyCode]++;
                if(df)console.log(e.keyCode);
                if(e.altKey){
                    switch(e.keyCode){
                        case 51:
                        fSharp=!fSharp;checkbox.checked=fSharp;
                        break;
                        case 67:
                        fChord=!fChord;checkbox1.checked=fChord;
                        break;
                    }
                }else if(key[e.keyCode]==1){
                    imputKey(e.keyCode);
                }
            }, false);

            document.addEventListener('keyup', (e)=>{
                key[e.keyCode]=0;
                imputKey(e.keyCode,1);
            }, false);
            checkbox.addEventListener("change",()=>fSharp=checkbox.checked);
            checkbox1.addEventListener("change",()=>fChord=checkbox1.checked);
        }
    }
});