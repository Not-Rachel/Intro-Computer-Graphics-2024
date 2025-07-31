var initDemo = function(){
    console.log("Init");

    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext('webgl');

    if (!gl){
        gl = canvas.getContext('experimental-webgl')
    }
    if (!gl){alert("WEBGL not supported by the browser")}

    gl.clearColor(0.3,0.3,0.6,0.4);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ///
    ///Create Shaders

    const vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, vertexShaderSource);
	gl.compileShader(vs);
	if (!gl.getShaderParameter( vs, gl.COMPILE_STATUS) ) {
		alert('An error occurred compiling shader:\n' + gl.getShaderInfoLog(vs));
		gl.deleteShader(vs);
		return null;
	}
    
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragShaderSource);
	gl.compileShader(fs);
	if (!gl.getShaderParameter( fs, gl.COMPILE_STATUS) ) {
		alert('An error occurred compiling shader:\n' + gl.getShaderInfoLog(fs));
		gl.deleteShader(fs);
		return null;
	}

	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(prog));
		return null;
	}

    //Create Buffer
    var triangleVertices = 
    [//X, Y     R,G,B
        0.0,0.5,    1.0,1.0,0.0,
        -0.5,-0.5,  0.7,0.5,1.0,
        0.5,-0.5,   0.0,1.0,0.6
    ]

    var triangleBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); //CPU --> GPU only once

    //Inform vertex shader
    var positionLocation = gl.getAttribLocation(prog, "vertPosition");
    var colorLocation = gl.getAttribLocation(prog, "vertColor");
    gl.vertexAttribPointer(
        positionLocation, //Attrib location
        2, //Num of elements per attrib
        gl.FLOAT,//Type
        gl.FALSE, //Not normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of indiv vertex
        0 //no offset
    );
    gl.vertexAttribPointer(
        colorLocation, //Attrib location
        3, //Num of elements per attrib
        gl.FLOAT,//Type
        gl.FALSE, //Not normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of indiv vertex
        2 * Float32Array.BYTES_PER_ELEMENT //yes offset
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    gl.useProgram(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 3); //Simple, skips, vertices

}


// Vertex Shader
var vertexShaderSource = `
    precision mediump float; //Comparisions
    attribute vec2 vertPosition; //Input Params
    attribute vec3 vertColor;

    varying vec3 fragColor; //Output params
	void main()
	{
        fragColor = vertColor;
		gl_Position = vec4(vertPosition, 0.0, 1.0); //Where on the surface you want to draw the vertex
	}
`;

// Fragment Shader
var fragShaderSource = `
	precision mediump float;
    varying vec3 fragColor; //Output params

	void main()
	{
		gl_FragColor = vec4(fragColor,1.0);
	}
`;
initDemo();