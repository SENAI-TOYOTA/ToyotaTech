interface Lbotao{
    nome:string;
    estilo:string;
    clique:()=>void;




}
export default function button ((nome,estilo, clique, Ibotao))

return(

    <input
    type= "button"
    value={nome}
    onClick={clique}
    className="p-2 px8 royded-md font-semi bold cursor-select "
    />
)