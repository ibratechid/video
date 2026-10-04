// node render.js config.json out.mp4 [audio.mp3]
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),puppeteer=require('puppeteer');
(async()=>{
  const [cfgPath,out='out.mp4',audioArg]=process.argv.slice(2);
  if(!cfgPath){console.log('Usage: node render.js config.json out.mp4 [audio.mp3]');process.exit(1)}
  const cfg=JSON.parse(fs.readFileSync(cfgPath));
  const fps=+cfg.fps||30,total=Math.round((+cfg.dur||30)*fps),dur=total/fps;
  const audio=audioArg||cfg.audio,hasA=audio&&fs.existsSync(audio);
  const args=['-y','-f','image2pipe','-framerate',fps,'-c:v','mjpeg','-i','-'];
  if(hasA){
    const fd=+cfg.fade||0;
    args.push('-stream_loop','-1','-i',audio,'-map','0:v','-map','1:a','-t',dur,
      '-af',`volume=${cfg.vol??0.8},afade=t=out:st=${Math.max(0,dur-fd)}:d=${fd||0.01}`,'-c:a','aac','-b:a','192k');
    console.log('Musik:',audio);
  }else console.warn('Tanpa musik'+(audio?` (file tidak ditemukan: ${audio})`:''));
  args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-preset','medium','-movflags','+faststart',out);
  const ff=spawn('ffmpeg',args.map(String),{stdio:['pipe','inherit','inherit']});
  const b=await puppeteer.launch({args:['--no-sandbox']});
  const pg=await b.newPage();await pg.setViewport({width:1920,height:1080});
  await pg.goto('file://'+path.resolve(__dirname,'index.html')+'?render=1');
  await pg.evaluate(c=>window.loadConfig(c),cfg);
  for(let i=0;i<total;i++){
    const d=await pg.evaluate(t=>{window.renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',.95).split(',')[1]},i/(total-1));
    if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
    if(i%fps===0)process.stdout.write(`\r${i}/${total}`);
  }
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('\nSelesai:',out);
})();
