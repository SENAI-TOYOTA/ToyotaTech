interface ICard {
    children: React.ReactNode
}

export default function Card ({children}:ICard){

    return(
        <div className="flex flex-col justify-around w-[25vw] h-[70vh] gap-4 p-4 bg-gray-100 rounded-xl shadow-xl">
            {children}
        </div>
        
    )
}