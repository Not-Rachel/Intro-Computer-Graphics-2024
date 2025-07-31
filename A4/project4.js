// import {cos,sin} from Math
// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotX = [
		1,0,0,0,
		0,Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0,0,0,1
	]

	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY),0,
		0,1,0,0,
		Math.sin(rotationY), 0,Math.cos(rotationY),0,
		0,0,0,1
	]
	trans = MatrixMult( trans, rotY );
	trans = MatrixMult( trans, rotX );

	var mvp = MatrixMult( projectionMatrix, trans );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.prog   = InitShaderProgram( vertexShader, fragShader );
		this.canvas = document.getElementById("canvas")
		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			alert("Unable to initialize WebGL. Your browser or machine may not support it.");
			return;
		}		
		
		this.vertex_buffer = this.gl.createBuffer();
		this.tex_buffer = this.gl.createBuffer();
		this.showTex = document.getElementById("show-texture").checked;
		this.swap = document.getElementById("swap-yz").checked;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		console.log(texCoords)
		console.log(vertPos)
		//Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		console.log(new Float32Array(vertPos).length);
		//Send in t values

		this.gl.bindBuffer(
					this.gl.ARRAY_BUFFER,
					this.vertex_buffer);

		this.gl.bufferData(
					this.gl.ARRAY_BUFFER,
					new Float32Array(vertPos),
					this.gl.STATIC_DRAW);

		this.gl.bindBuffer(
					this.gl.ARRAY_BUFFER,
					this.tex_buffer);

		this.gl.bufferData(
					this.gl.ARRAY_BUFFER,
					new Float32Array(texCoords),
					this.gl.STATIC_DRAW);
	
		this.swapYZ(this.swap);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		this.swap = swap;

		//Set the uniform parameter(s) of the vertex shader
		var bool = this.gl.getUniformLocation(this.prog, 'swap')
		this.gl.useProgram(this.prog);
		this.gl.uniform1i(bool,swap); //Set if texture should be shown
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{		
		this.gl.clear(gl.COLOR_BUFFER_BIT);

		var m = this.gl.getUniformLocation(this.prog, 'mvp');

		this.gl.useProgram( this.prog );	// Bind the program, might have multiple programs
		this.gl.uniformMatrix4fv(m,false,trans) //Set uniform (4,f,v==4 dimension, float, array)

		//Complete the WebGL initializations before drawing

		var positionLoc = this.gl.getAttribLocation(this.prog, 'pos')
		var texCoordPos = this.gl.getAttribLocation(this.prog, 'txc')

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertex_buffer );
		this.gl.vertexAttribPointer(positionLoc, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(positionLoc);

		gl.bindBuffer( gl.ARRAY_BUFFER, this.tex_buffer );
		this.gl.vertexAttribPointer(texCoordPos, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(texCoordPos);
		

		//Draw object
		this.gl.useProgram( this.prog );	// Bind the program
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		//Bind the texture
		const tex = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

		// You can set the texture image data using the following command.
		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, img );//Mipmap level 0
		this.gl.generateMipmap(this.gl.TEXTURE_2D); //

		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.LINEAR
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.LINEAR_MIPMAP_LINEAR
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_S,
			this.gl.REPEAT
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_T,
			this.gl.REPEAT
		);

		//Bind to Texture UNIT, Connected
		this.gl.activeTexture(this.gl.TEXTURE0); //All texture calls will be related to this textue 0
		this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

		//Connect Texture Unit to Shader
		var sampler = this.gl.getUniformLocation(this.prog, 'tex')
		this.gl.useProgram(this.prog);
		this.gl.uniform1i(sampler,0);//Connect sampler to texture unit

		this.showTexture(this.showTex)

	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		this.showTex = show;

		var bool = this.gl.getUniformLocation(this.prog, 'showTex')
		this.gl.useProgram(this.prog);
		this.gl.uniform1i(bool,show); //Set if texture should be shown
	}
	
}
// Vertex shader source code
var vertexShader = `
	attribute vec3 pos;
	attribute vec2 txc;
	uniform mat4 mvp;
	uniform bool swap;
	varying vec2 texCoord;
	void main()
	{
		
		if (swap){ 
			gl_Position = mvp * vec4(pos[0],pos[2],pos[1], 1);
		}
		else{
			gl_Position = mvp * vec4(pos,1);
		}
		texCoord = txc;
	}
`;
// Fragment shader source code
var fragShader = `
	precision highp float;
	uniform sampler2D tex;
	uniform bool showTex;
	varying vec2 texCoord;
	void main()
	{
		if (showTex){
			gl_FragColor = texture2D(tex, texCoord); //Return RGBA value
		}
		else{
			gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
		}	
	}
`;

// Fragment Shader
// var fragShader = `
// 	precision mediump float;
// 	void main()
// 	{
// 		gl_FragColor = vec4(1,0,0,1);
// 	}
// `;