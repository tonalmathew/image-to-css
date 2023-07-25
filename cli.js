#!/usr/bin/env node

const fs = require('fs-extra');
const commander = require('commander');
const Jimp = require('jimp');
const path = require('path');

commander
  .usage('-f <imagePath> -o <outputPath>')
  .option('-f, --file <inputFile>', 'Input image file path')
  .option('-o, --output <outputPath>', 'Output folder for the CSS file')
  .option('-h, --help', 'Display usage information')
  .parse(process.argv);

const options = commander.opts();

if (options.help) {
  commander.outputHelp();
  process.exit(0);
}

if(!options.file) {
  console.error('Error: Input image file does not exist. Please provide an input image file.')
  process.exit(1);
}

if (!options.output) {
  console.error('Output folder not specified. Please provide the -O flag with the output folder path.');
  process.exit(1);
}

const inputImagePath = options.file;
const outputFolderPath = options.output;

async function imageToCss(imagePath, outputPath) {
  try {
    await fs.ensureDir(outputPath);
    const image = await Jimp.read(imagePath);

    const boxShadowArr = [];
    const { bitmap: { width, data } } = image;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / (width * 4));
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      boxShadowArr.push([`${x}px ${y}px 0px 1px rgba(${r},${g},${b})`]);
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
