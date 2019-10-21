const request = require('request');
const cheerio = require('cheerio');
const syncR = require('sync-request')
const fs = require('fs');
const symB = 'QWERTYUIOPASDFGHJKLZXCVBNM';
const sym = 'qwertyuiopasdfghjklzxcvbnm,';
let allChars = [];
// wrap a request in an promise
function downloadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}


// now to program the "usual" way
// all you need to do is use async functions and await
// for functions returning promises
async function myBackEndLogic(uri) {
    try {
        const html = await downloadPage(uri);
        const $ = cheerio.load(html);
        let chars = $('.characters-favorites-ranking-table .fs14').each(function (i, item) {
          try {
          let href = encodeURI(item.attribs.href);
          let res = syncR('GET', href);
          charHtml = res.getBody().toString();
          charSelector = cheerio.load(charHtml);
          let title = charSelector("#content > table > tbody > tr > td.borderClass > table:nth-child(6) > tbody > tr:nth-child(1) > td:nth-child(2) > a").text();
          if (title == '')
            throw err;
          let name = charSelector('#content > table > tbody > tr > td:nth-child(2) > div:nth-child(4)').text();
          name = name.slice(0, name.indexOf(' ('));
          let anime = charSelector("#content > table > tbody > tr > td.borderClass > table:nth-child(6) > tbody > tr:nth-child(1) > td:nth-child(2) > a").text();
          let seiyuus = charSelector('div:contains("Voice Actors") .normal_header ~ table:contains("Japanese")').text();
          seiyuus = seiyuus.split('Japanese');
          let trueSeiyuu = '';
          seiyuus.forEach(function(seiyuu) {
            for (let c of seiyuu) {
              if ((symB.indexOf(c) != -1) || (sym.indexOf(c) != -1)) {
                if (c === ',') c = ' ';
                trueSeiyuu += c;
              }
            }
            trueSeiyuu += '; ';
          })
        //  trueSeiyuu = trueSeiyuu.replace(',', ' ');
          trueSeiyuu = trueSeiyuu.slice(0, -4);
          if (trueSeiyuu == '')
            throw err;
          let img = charSelector("#content > table > tbody > tr > td.borderClass > div:nth-child(1) > a > img").attr('src');
          let charObj = {
            charName: name,
            charImg: img,
            charSeiyuu: trueSeiyuu,
            charTitle: title
          }
          console.log(charObj);
          let finalStr = trueSeiyuu + 'ш' + name + 'ш' + title + 'ш' + img  + '\n';
          fs.appendFileSync('of.txt', finalStr, function(err){

          });
          allChars.push(charObj);
        }
        catch (err) {
          console.log(err);
        }

        })

    } catch (error) {
        console.error('ERROR:');
        console.error(error);
    }
}

async function parni() {
  try {
    fs.readFile('./parni.txt', 'utf8', function(err, str) {
      str = str.split('\n');
      str.forEach(function(seiyuu) {
        let res = syncR('GET', seiyuu);
        seiyuuHtml = res.getBody().toString();

        let $ = cheerio.load(seiyuuHtml);
        let trueSeiyuu = $('h1').text().replace(',', ' ');
        let charsWithRep = [];
        let preChars = $('div:contains("Voice Acting Roles") ~ table tr').each(function (i, item) {
          try {
            let preChar = cheerio.load(item);
            let name = preChar('a[href*="/character"]').text();
            let title = preChar('a[href*="/anime"]').text()
            let img = preChar('a[href*="/character"] > img').attr('data-src');
            if (img.indexOf('.gif') != -1)
              throw err;
            if (charsWithRep.includes(name))
             throw err;
            charsWithRep.push(name);
            name = name.replace(',', ' ');
            img = img.replace('r/46x64/', '');
            img = img.slice(0, img.indexOf('?'));

            let charObj = {
              charName: name,
              charImg: img,
              charSeiyuu: trueSeiyuu,
              charTitle: title
            }
            console.log(charObj);
            allChars.push(charObj);

          } catch (err) {};
        });

      })

    })



  } catch (err) {
    console.log(err);
  }
}


async function requests() {
//  await parni();
  let i = 0;
  while (i <= 3000) {
    await  myBackEndLogic(`https://myanimelist.net/character.php?limit=${i}`);
    i += 50;
  }


}
requests();
