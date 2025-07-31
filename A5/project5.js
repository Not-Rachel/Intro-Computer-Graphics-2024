// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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

	// var mvp = MatrixMult( projectionMatrix, trans );
	return trans;
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
		this.normal_buffer = this.gl.createBuffer();
		this.showTex = document.getElementById("show-texture").checked;
		this.swap = document.getElementById("swap-yz").checked;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		//Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		//Send vertPos
		this.gl.bindBuffer(
			this.gl.ARRAY_BUFFER,
			this.vertex_buffer);

		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(vertPos),
			this.gl.STATIC_DRAW);

		//Send texCoords
		this.gl.bindBuffer(
			this.gl.ARRAY_BUFFER,
			this.tex_buffer);

		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(texCoords),
			this.gl.STATIC_DRAW);
		
		//Send normals
		this.gl.bindBuffer(
			this.gl.ARRAY_BUFFER,
			this.normal_buffer);

		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(normals),
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
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		//SET UNIFORM MATRICES
		this.gl.clear(gl.COLOR_BUFFER_BIT);

		var m = this.gl.getUniformLocation(this.prog, 'mvp');
		var mv = this.gl.getUniformLocation(this.prog, 'mv');
		var mNorm = this.gl.getUniformLocation(this.prog, 'mNorm');

		this.gl.useProgram( this.prog );	// Bind the program, might have multiple programs
		this.gl.uniformMatrix4fv(m,false,matrixMVP) //Set uniform (4,f,v==4 dimension, float, array)
		this.gl.uniformMatrix4fv(mv,false,matrixMV) 
		this.gl.uniformMatrix3fv(mNorm,false,matrixNormal)

		//SET ATTRIBUTES

		var positionLoc = this.gl.getAttribLocation(this.prog, 'pos')
		var texCoordPos = this.gl.getAttribLocation(this.prog, 'txc')
		var normalPos = this.gl.getAttribLocation(this.prog, 'normal')

		//Init mesh coordinates
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertex_buffer );
		this.gl.vertexAttribPointer(positionLoc, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(positionLoc);

		//Init Texture coordinates
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tex_buffer );
		this.gl.vertexAttribPointer(texCoordPos, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(texCoordPos);

		//Init Normals
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normal_buffer );
		this.gl.vertexAttribPointer(normalPos, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(normalPos);
		

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
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		//Set the uniform parameter(s) of the fragment shader to specify the light direction.
		var light = this.gl.getUniformLocation(this.prog, 'lightPos')
		this.gl.useProgram(this.prog);
		this.gl.uniform3fv(light,[x,y,z]); 
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		//Set the uniform parameter(s) of the fragment shader to specify the shininess
		var alpha = this.gl.getUniformLocation(this.prog, 'alpha')
		this.gl.useProgram(this.prog);
		this.gl.uniform1f(alpha,shininess); 
	}
}
// Vertex shader source code
var vertexShader = `
	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 normal;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 mNorm; //Transform normals

	uniform bool swap;
	varying vec2 texCoord;
	varying vec3 normals;
	varying vec3 posVec;
	void main()
	{
		vec4 positions = vec4(pos,1);
		if (swap){ 
			positions = vec4(pos[0],pos[2],pos[1], 1);
		}
		gl_Position = mvp * positions;

		vec3 P = (vec3(mv * vec4(pos,1)));
		vec3 N = (mNorm * normal);

		texCoord = txc;		
		posVec = P;
		normals = normalize(N);
	}
`;
// Fragment shader source code
var fragShader = `
	precision highp float;
	uniform sampler2D tex;
	uniform bool showTex;

	//Lighting:
	uniform vec3 lightPos;
	uniform float alpha;

	varying vec2 texCoord;
	varying vec3 normals;
	varying vec3 posVec;
	void main()
	{
		//Blinn: I (cos(theta)Kd + Ks(cos(x)^alpha))
		
		vec3 lightDir = normalize(lightPos);		
		vec3 viewDir = normalize(-posVec);
		vec3 halfVec = normalize(lightDir + viewDir); //Angle between lightDir and viewDir

		float diffuse = max(dot(normals, lightDir),0.0);
		float spec = 0.0;

		if ( diffuse > 0.0){
			spec = pow(max(dot(normals, halfVec),0.0),alpha);
		}
		vec3 Kd = vec3(1.0,1.0,1.0);
		vec3 Ks = vec3(1.0,1.0,1.0);

		vec4 clr = texture2D(tex, texCoord); //Return RGBA value

		float trans = 1.0;
		if (showTex){
			trans = clr[3];
			Kd = vec3(clr[0],clr[1],clr[2]); 
		}
		
		vec4 color = vec4((Kd * diffuse) + (Ks*spec),trans);
		gl_FragColor = color;
	}
`;
