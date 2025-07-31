// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( vertexShader, FragShader );
		this.canvas = document.getElementById("canvas")
		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			alert("Unable to initialize WebGL. Your browser or machine may not support it.");
			return;
		}
		this.uniformPoints = [];
		for (let i =0; i<pt.length; i++){
			this.uniformPoints.push(this.gl.getUniformLocation(this.prog, 'p'+i))
		}

		this.tLocation = this.gl.getAttribLocation(this.prog, 't');


		// Initialize the attribute buffer
		this.steps = 100;
		var tv = []; //Time corresponding to a specific point on a line
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}

		console.log(new Float32Array(tv).length);
		//Send in t values
		this.vertex_buffer = this.gl.createBuffer();

		this.gl.bindBuffer(
					this.gl.ARRAY_BUFFER,
					this.vertex_buffer);

		this.gl.bufferData(
					this.gl.ARRAY_BUFFER,
					new Float32Array(tv),
					this.gl.STATIC_DRAW);


	}
	setViewport( width, height )
	{
		var m = this.gl.getUniformLocation(this.prog, 'mvp');
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];

		this.gl.useProgram( this.prog );	// Bind the program, might have multiple programs
		this.gl.uniformMatrix4fv(m,false,trans) //Set uniform (4,f,v==4 dimension, float, array)
	}
	updatePoints( pt )
	{
		this.gl.useProgram( this.prog );	// Bind the program, might have multiple programs

		for (let i =0; i<pt.length; i++){
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			//update
			this.gl.uniform2fv(this.uniformPoints[i], [x,y]);
		}
	}
	draw()
	{
		this.gl.clear(gl.COLOR_BUFFER_BIT);
		this.gl.useProgram( this.prog );	// Bind the program
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertex_buffer );

		this.gl.vertexAttribPointer(this.tLocation, 1, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.tLocation);
		this.gl.drawArrays(this.gl.LINE_STRIP, 0 , this.steps);
	}

}

// Vertex Shader
var vertexShader = `
	attribute float t; //Will come from the vertex buffer object

	//Parameter of the vertex shader that we will have to set
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		//Calculate the point on the Bezier curve
		vec2 point =  (pow(1.0-t,3.0) * p0) 
					+ (3.0 * pow(1.0-t,2.0) * t * p1) 
					+ (3.0 * (1.0-t) * pow(t,2.0) * p2) 
					+ (pow(t,3.0) * p3);
		
		//point = t * p0 + (1.0-t) * p3;
		gl_Position = mvp * vec4(point,0,1); //Multiply with trans matrix-->canonical view volume
	}
`;

// Fragment Shader
var FragShader = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;