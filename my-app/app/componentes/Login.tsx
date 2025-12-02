import Card from "@/app/componentes/ui/Card"
import Image from "next/image"

//Importar suas imagens
import Hillux from '@/app/recursos/hailux25.png'


export default function Login() {
    return (
        <div className="flex items-center justify-center h-[100vh] bg-green-500">

            <div className="h-full bg-yellow-500 w-[35vw] flex justify-center items-center overflow-clip">
             <div className="w-64 h-48 border-2 border-red-500 overflow-hidden"></div>
                 <Image
                 
                    src={Hillux}
                    alt=""
                   className="w-full h-full scale-130 translate-x-[5vw] object-contain"
                    />
                    
                    
            </div>

            <div className="bg-gray-100 w-[65vw] h-full flex justify-center items-center">
                    <Card>
                    <h1 className="text-center">Bem vindo! </h1>
                    <h2>Faça seu Login</h2>

                    <input
                        type="text"
                        placeholder="CPF ou Digite seu Email"
                        className="py-4 px-2"
                    />
                    <input
                        type="password"
                        placeholder="Digite sua senha"
                        className="py-4 px-2"
                    />
                    <div className="flex justify-between items-start">
                        <label className="text-gray-500 py-4">
                            <input type="checkbox" name="myCheckbox" /> Lembre de Mim
                        </label>
                        <input
                            type="button"
                            value="Esqueceu a senha"
                            className="py-4 px-2"
                        />
                    </div>
                    <input
                        type="button"
                        
                        value="Login"
                        className="bg-red-500 px-6 py-2 rounded-lg text-white"
                    

                    />
                        <h2 className="text-center">Ou</h2>
                        <div className="code-container">
                    
                        <p className="code-label">Código de compra</p>
                        <div className="flex justify-between items-start" id="inputBoxes">
                            <input type="text" className="w-1/6 border-2 border-solid h-8" data-index="0" inputMode="numeric" />
                            <input type="text" className="w-1/6 border-2 border-solid h-8" data-index="1" inputMode="numeric" />
                            <input type="text" className="w-1/6 border-2 border-solid h-8" data-index="2" inputMode="numeric" />
                            <input type="text" className="w-1/6 border-2 border-solid h-8" data-index="3" inputMode="numeric" />
                            <input type="text" className="w-1/6 border-2 border-solid h-8" data-index="4" inputMode="numeric" />

                        </div>


                    </div>
                </Card>

            </div>
            
            
        </div>
    )
}