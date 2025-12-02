"use client"

import Image from 'next/image'
import Logo_Toyota from '@/app/recursos/Logo Toyota.png'

export default function Header (){
    return(
        <div className="bg-stone-100 h-[10vh] flex justify-around items-center">
            
            <div className="flex items-center gap-4">
                <h1>Toyota Tech</h1>

                <Image
                    src={Logo_Toyota}
                    className="w-[72px]" alt={''}                />

            </div>
            
                    

            

            <div className="flex justify-around gap-8">
                <p>Contato</p>
                <p>Fale Conosco</p>
                <p>Sobre</p>
            </div>
        </div>
    )
}