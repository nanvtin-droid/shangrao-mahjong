import Teahouse from '@/components/teahouse';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();return <Teahouse signedIn={!!user} displayName={user?.fullName?.slice(0,16)||'茶馆新朋友'}/>;}
