// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.

const RGBA_OFFSET = 4;
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    
    console.log(fgPos);
    //c = af*cf + (1-af)ab* cb / a
    //a = af + (1-af)ab
    console.log(bgImg);
    console.log(fgImg);

    var alphaIndex = 3;


    var bgImageBound = bgImg.height * bgImg.width * RGBA_OFFSET;
    var fgLength = fgPos.x + fgImg.width;
    var fgBound_x = ((bgImg.width * RGBA_OFFSET) * Math.max(fgPos.y,0)) + Math.min(fgLength, bgImg.width) * RGBA_OFFSET;
    //For the yBound, need to skip the entire bgImg cols to get to next row
    var fgImageBound = (bgImg.width * RGBA_OFFSET) * (fgImg.height + fgPos.y - 1);
    var out_of_bounds_offset = 0;

    if (fgPos.x >= bgImg.width || fgPos.y >= bgImg.height){return;} //No compositing needed
    if (fgLength <= 0 || fgPos.y + fgImg.height <= 0){return;} //No compositing needed

    //If the fg > bg
    if (fgPos.x < 0 && fgLength >= bgImg.width)
        out_of_bounds_offset = (fgImg.width - bgImg.width) * RGBA_OFFSET;
    else if (fgPos.x < 0) //If images out of bounds to the left
        out_of_bounds_offset = -fgPos.x * RGBA_OFFSET;
    else if (fgLength >= bgImg.width) //if image out of bounds to the right
        out_of_bounds_offset = (fgLength - bgImg.width) * RGBA_OFFSET;

    let i = 0;
    let fgIndex = 0;

    if (fgPos.x < 0 || fgPos.y < 0){
        //Go Skip the out of bound rows and cols
        var height_offset = Math.abs(Math.min(fgPos.y, 0)) * (fgImg.width * RGBA_OFFSET);
        var x_offset = Math.abs(Math.min(fgPos.x, 0) * RGBA_OFFSET);

        //Change the index we need to start with for the fg image
        fgIndex = (height_offset + x_offset);

    }

    i = ((bgImg.width * RGBA_OFFSET) * Math.max(fgPos.y, 0)) + Math.max(fgPos.x * RGBA_OFFSET, 0);


    while (i < bgImageBound && i < fgImageBound){
        
        if (i == fgBound_x){            

            i += ((bgImg.width - fgImg.width) * RGBA_OFFSET) + out_of_bounds_offset; //Skip to next row
            fgBound_x += bgImg.width * RGBA_OFFSET; //Skip to the end of the next row for the fgImg
            fgIndex += Math.abs(out_of_bounds_offset); //Skip to where we need to draw the FGimage
        }

        var red = i;
        var green = i+1;
        var blue = i +2;
        var alphaIndex = i + 3;

        var fg_red = fgIndex;
        var fg_green = fgIndex+1;
        var fg_blue = fgIndex +2;
        var fg_alphaIndex = fgIndex + 3;

        var alphaF = fgImg.data[fg_alphaIndex]/255 * fgOpac;
        var alphaB = bgImg.data[alphaIndex]/255;

        //Equation
        var alpha = alphaF + ((1 - alphaF) * alphaB);

        bgImg.data[red] = (alphaF * fgImg.data[fg_red] + (1 - alphaF) * alphaB * bgImg.data[red])/alpha;
        bgImg.data[green] = (alphaF * fgImg.data[fg_green] + (1 - alphaF) * alphaB * bgImg.data[green])/alpha;
        bgImg.data[blue] = (alphaF * fgImg.data[fg_blue] + (1 - alphaF) * alphaB * bgImg.data[blue])/alpha;

        i +=4;
        fgIndex +=4;
    }
}
