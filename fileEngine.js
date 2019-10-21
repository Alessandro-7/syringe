const spawn = require('child_process').spawn;
const path = require('path');
var builder = require('xmlbuilder');
var fs = require('fs');
const _ = require('underscore');
var archiver = require('archiver');
let async = require('async');

let x = 10;
let y = 10;
let packName = 'Paid Seiyuu Dose'
let doseCount = 5;


input = fs.readFileSync('./ts.txt', 'utf8');
let allChars = input.split('\n');
//allChars = _.shuffle(allChars)

async function getChars(allChars, packName, x, y, count, callback){
  let chars = allChars.splice(0, x*y);
  fs.writeFileSync('./ts.txt', allChars.join('\n'))
  async.series([
    function (callback) {
      downloader(chars, callback)
    },
    function (callback) {
      xmlBuild(chars, `${packName} #${count}`, 'Seiyuu World', 'Alessandro', x, y, callback)
    },
    function (callback) {
      archivate(packName, count, callback)
    },
    function (callback) {
      nextIter(callback)
    }],
    function (error, success) {
          if (error) { console.log(error) }
          if (success) {}
      }
    );
}

function downloader(chars, callback) {
  let j = 0;
  let i = 0;
  for (var element of chars) {
    i++;
    element = element.split('ш');
    let ffmpeg = spawn('ffmpeg', ['-i', element[3].trim(), '-q:v', '3', '-y', `./pack/Images/${i}.jpg`]);
    ffmpeg.stderr.on('data', (err) => {
    //  console.log('err:', new String(err))
    })

    ffmpeg.on('exit', (statusCode) => {
      ++j
      if (statusCode === 0) {
        console.log(j)
         if (j == chars.length)
          callback();
      }
    })


  }


}

function archivate(packName, count, callback){
  var output = fs.createWriteStream(`./Packs/${packName} #${count}.siq`);
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  archive.pipe(output);
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    callback();
  });
  output.on('end', function() {
    console.log('Data has been drained');

  });
  archive.directory('./pack', false);
  archive.finalize();

}

function xmlBuild(chars, packName, publisher, author, x, y, callback) {

  let date = new Date();
  let month = date.getMonth() + 1;
  let dateN = date.getDate() + '.' + month + '.' + date.getFullYear();

  var xml = builder.begin().ele('package', {'name': packName, 'version': '4',
   'id': '7d38d366-e1a3-49a5-abf4-fbb70d3c9344', 'date': dateN, 'publisher': publisher,
   'difficulty': '5', 'xmlns': 'http://ur-quan1986.narod.ru/ygpackage3.0.xsd'})
    .ele('info')
      .ele('authors')
        .ele('author', author).up()
      .up()
    .up()
    .ele('round', {'name': '1-й раунд'})
      .ele('themes')
  var questions;
  let now = -1;
  for(let i = 1; i <= x; ++i) {
    let themes =  builder.begin().ele('theme', {'name': 'syringe'})
      .ele('questions')
      questions = builder.begin();
      for(let j = 1; j <= y; ++j) {
        now++;
        str = chars[now].split('ш');
        res = str[0] + ' – ' + str[1] + ' (' + str[2] + ')';
         questions.ele('question', {'price': '1'})
          .ele('scenario')
            .ele('atom', {'type': 'image'}, `@${now+1}.jpg`).up()
          .up()
          .ele('right')
            .ele('answer', res)
        themes.importDocument(questions);
      }
      xml.importDocument(themes);

  }
  xml = xml.end({ pretty: true});
  fs.writeFileSync('./pack/content.xml', xml);
  console.log(1488);
  callback();
}


function nextIter(callback) {
  ++q;
  if (q <= doseCount) {
    getChars(allChars, packName, x, y, q);
  }
  callback();
}

let q = 1;
getChars(allChars, packName, x, y, q)
