import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { progress } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({error:'请先登录'}, {status:401});
  try {
    const rows = await getDb().select({key:progress.key,payload:progress.payload}).from(progress).where(eq(progress.userId,user.userId));
    return Response.json({records:rows.map(r=>({key:r.key,...JSON.parse(r.payload)}))}, {headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'云端暂时不可用，进度仍保存在本机'}, {status:503}); }
}
export async function POST(request:Request) {
  const user=await getChatGPTUser();
  if(!user) return Response.json({error:'请先登录'}, {status:401});
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin) return Response.json({error:'请求来源不匹配'}, {status:403});
  const bodyText=await request.text();
  if(bodyText.length>100000) return Response.json({error:'记录过大'}, {status:413});
  let body; try {body=JSON.parse(bodyText);} catch {return Response.json({error:'无效记录'}, {status:400});}
  if(!Array.isArray(body.records)||body.records.length>100) return Response.json({error:'无效记录'}, {status:400});
  const records=body.records;
  for(const r of records) {
    if(!r||typeof r!=='object'||typeof r.key!=='string'||!/^((lesson|quiz):[a-z0-9-]+|game:[a-z0-9-]+)$/.test(r.key)||r.key.length>90||!['lesson','quiz','game'].includes(r.type)||typeof r.at!=='number'||!Number.isFinite(r.at)||typeof r.title!=='string'||r.title.length>150||JSON.stringify(r).length>1200) return Response.json({error:'无效记录'}, {status:400});
  }
  try {
    if(records.length) await getDb().insert(progress).values(records.map((r:{key:string;type:string;at:number;title:string;won?:boolean;points?:number})=>({userId:user.userId,key:r.key,payload:JSON.stringify({type:r.type,at:r.at,title:r.title,won:r.won===true,points:typeof r.points==='number'&&Number.isFinite(r.points)?Math.max(0,Math.min(1000,r.points)):0})}))).onConflictDoNothing();
    return Response.json({ok:true});
  } catch {return Response.json({error:'同步暂未完成'}, {status:503});}
}
