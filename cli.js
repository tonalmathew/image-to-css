#!/usr/bin/env node

const fs = require('fs-extra');
const commander = require('commander');
const Jimp = require('jimp');
const path = require('path');

commander
  .usage('<imagePath> -O <outputPath>')
  .option('-O, --output <outputPath>', 'Output folder for the CSS file')
  .parse(process.argv);

  const options = commander.opts();

if (!options.output) {
  console.error('Output folder not specified. Please provide the -O flag with the output folder path.');
  process.exit(1);
}

const inputImagePath = commander.args[0];
const outputFolderPath = options.output;

async function imageToCss(imagePath, outputPath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error('Error: Input image file does not exist. Please provide an input image file.');
      process.exit(1);
    }

    await fs.ensureDir(outputPath);
    const image = await Jimp.read(imagePath);

    let rgbaVal = []
    const boxShadowArr = []
    const {bitmap: {height, width}} = image

    for(let y=0; y<height; y++) {
      for(let x=0; x<width; x++) {
        rgbaVal = Jimp.intToRGBA(image.getPixelColor(x,y));
        boxShadowArr.push([
          `${x}px ${y}px 0px 1px rgba(${rgbaVal.r},${rgbaVal.g},${rgbaVal.b})`,
        ])
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./style.css">
        <title>image to css</title>
      </head>
      <body>
        <div class="image-to-css"></div>
      </body>
      </html>`

    const cssContent = `
    body { 
      background-color: #060621;
    }
    .image-to-css{
      position: absolute;
      box-shadow: ${boxShadowArr.join(',\n')};
    }`;

    const htmlFilePath = path.join(outputPath, 'index.html');
    const cssFilePath = path.join(outputPath, 'style.css');
    await fs.writeFile(htmlFilePath, htmlContent);
    await fs.writeFile(cssFilePath, cssContent);

    console.log(`Image converted to CSS and saved to: ${cssFilePath}`);
  } catch (err) {
    console.error('Error converting image to CSS:', err);
  }
}


imageToCss(inputImagePath, outputFolderPath);
