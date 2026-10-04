// node render.js <config.json | folder of configs> [outDir=out] [audio=assets/music.mp3]
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),puppeteer=require('puppeteer');
(async()=>{
  const [inp,outDir='out',audioArg]=process.argv.slice(2);
  if(!inp){console.log('Usage: node render.js <config.json|folder> [outDir] [audio]');process.exit(1)}
  const files=fs.statSync(inp).isDirectory()?fs.readdirSync(inp).filter(f=>f.endsWith('.json')).sort().map(f=>path.join(inp,f)):[inp];
  fs.mkdirSync(outDir,{recursive:true});
  const audio=audioArg||'assets/music.mp3',hasA=fs.existsSync(audio);
  console.log(hasA?'Music: '+audio:'No music (not found: '+audio+')');
  const b=await puppeteer.launch({args:['--no-sandbox']});
  const pg=await b.newPage();await pg.setViewport({width:1920,height:1080});
  await pg.goto('file://'+path.resolve(__dirname,'index.html')+'?render=1');
  for(const f of files){
    const cfg=JSON.parse(fs.readFileSync(f)),out=path.join(outDir,path.basename(f,'.json')+'.mp4');
    const fps=+cfg.fps||30,total=Math.round((+cfg.dur||30)*fps),dur=total/fps,fd=+cfg.fade||0;
    const args=['-y','-f','image2pipe','-framerate',fps,'-c:v','mjpeg','-i','-'];
    if(hasA)args.push('-stream_loop','-1','-i',audio,'-map','0:v','-map','1:a','-t',dur,
      '-af',`volume=${cfg.vol??0.8},afade=t=out:st=${Math.max(0,dur-fd)}:d=${fd||0.01}`,'-c:a','aac','-b:a','192k');
    args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-preset','medium','-movflags','+faststart',out);
    const ff=spawn('ffmpeg',args.map(String),{stdio:['pipe','inherit','inherit']});
    console.log('Rendering',f,'->',out);
    await pg.evaluate(c=>window.loadConfig(c),cfg);
    for(let i=0;i<total;i++){
      const d=await pg.evaluate(t=>{window.renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',.95).split(',')[1]},i/(total-1));
      if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
      if(i%fps===0)process.stdout.write(`\r${i}/${total}`);
    }
    ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('\nDone:',out);
  }
  await b.close();
})();
