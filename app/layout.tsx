import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: '饶有牌趣 · 上饶麻将研习社',
 description: '一杯茶，一手好牌。从认牌到实战，在山水茶馆里学会上饶麻将。渐进教程、趣味闯关、三档机器人对弈。',
 icons: {icon:'/favicon.svg',apple:'/favicon.svg'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
