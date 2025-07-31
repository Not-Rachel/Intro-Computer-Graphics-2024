
// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	// array[0] 	array[3] 	array[6]
	// array[1] 	array[4] 	array[7]
	// array[2] 	array[5] 	array[8]

	// Index {0,1,3,4} is scale and rotate
	// index {6,7} is translate

	//Rotate: 	cos0, -sin0
	//			sin0 cose0
	rotation *= Math.PI/180;

	var rotate = Array( 	Math.cos(rotation), Math.sin(rotation), 0,
							-Math.sin(rotation), Math.cos(rotation), 0,
	 						0, 0, 1 );

	var scale = Array( 		scale, 0, 0,
							0, scale, 0,
	 						0, 0, 1 );

	var translate = Array( 	1, 0, 0,
							0, 1, 0,
	 						positionX, positionY, 1 );
	
	var result = ApplyTransform(rotate, scale);
	result = ApplyTransform(result, translate);

	return result;

	// return Array( 	scale *  Math.cos(rotation), scale * Math.sin(rotation), 0,
	// 			 	scale * -Math.sin(rotation), scale * Math.cos(rotation), 0,
	// 	  			positionX, positionY, 1 );
};

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	//Multiply matrices
	var result = Array (0,0,0,
						0,0,0,
						0,0,0);
	var row = col1 = col2 = 3
	
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < col1; j++) {
			var sum = 0;
			for (let k = 0; k < col2; k++)
				sum += trans1[j * col1 + k] * trans2[k * col2 + i];
			result[j * col2 + i] = sum;
		}
	}
	return result;
};
